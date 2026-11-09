using Application.DTOs;
using Domain.Entities;
using Domain.Provider;
using Domain.Repositories;
using Infrastructure.Persistence;
using Infrastructure.Provider;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Data;

namespace Application.Services;

public class AuthService(
    ApplicationDbContext dbContext,
    IAuthRepository authRepository,
    IJwtProvider jwtProvider,
    IEmailProvider emailProvider,
    IAvatarStorageProvider avatarStorageProvider)
{
    private static readonly IReadOnlyDictionary<string, string> AvatarExtensions =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["image/jpeg"] = ".jpg",
            ["image/png"] = ".png",
            ["image/webp"] = ".webp"
        };

    private const long MaxAvatarFileSize = 3_000_000;

    public async Task<AvatarUploadUrlResponse?> CreateAvatarUploadUrlAsync(
        Guid userId,
        CreateAvatarUploadUrlRequest request)
    {
        if (!AvatarExtensions.TryGetValue(request.ContentType, out var extension) ||
            request.FileSize <= 0 ||
            request.FileSize > MaxAvatarFileSize)
        {
            return null;
        }

        var avatarKey = $"avatars/{userId}/{Guid.NewGuid():N}{extension}";
        var uploadUrl = await avatarStorageProvider.CreateUploadUrlAsync(
            avatarKey,
            request.ContentType);

        return new AvatarUploadUrlResponse(uploadUrl, avatarKey);
    }

    public async Task<UserDto> RegisterUserAsync(string email, string password, string firstName, string lastName)
    {
        string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
        var verificationToken = Guid.NewGuid().ToString("N");
        var verificationExpiry = DateTime.UtcNow.AddHours(24);
        UserEntity? user = null;
        const int maxAttempts = 3;

        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            await using var transaction = await dbContext.Database.BeginTransactionAsync(
                IsolationLevel.Serializable);

            try
            {
                var exists = await dbContext.Users.AnyAsync(u => u.Email == email);
                if (exists)
                {
                    throw new Exception("Email has been registered.");
                }

                var avatarColorId = await SelectAvatarColorIdAsync();
                user = new UserEntity(
                    email,
                    hashedPassword,
                    firstName,
                    lastName,
                    avatarColorId);
                user.SetEmailVerificationToken(verificationToken, verificationExpiry);

                dbContext.Users.Add(user);
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                break;
            }
            catch (Exception ex) when (
                IsSerializationFailure(ex) &&
                attempt < maxAttempts)
            {
                await transaction.RollbackAsync();
                dbContext.ChangeTracker.Clear();
                await Task.Delay(TimeSpan.FromMilliseconds(20 * attempt));
            }
        }

        if (user is null)
        {
            throw new InvalidOperationException("User registration failed.");
        }

        var verificationLink = $"http://localhost:5000/api/auth/verify-email?token={verificationToken}";
        await emailProvider.SendVerificationEmailAsync(email, verificationLink);

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email
        };
    }

    private static bool IsSerializationFailure(Exception exception)
    {
        for (var current = exception; current is not null; current = current.InnerException)
        {
            if (current is PostgresException postgresException &&
                postgresException.SqlState == PostgresErrorCodes.SerializationFailure)
            {
                return true;
            }
        }

        return false;
    }

    public (string Token, DateTime Expiration) GenerateAccessToken(Guid userId, string email)
    {
        var token = jwtProvider.GetJwtToken(userId, email);
        return token;
    }

    public async Task<LoginResponse?> LoginAsync(string email, string password)
    {
        // 1. check if user exsists
        var user = await authRepository.GetUserAsync(email);

        if (user == null)
        {
            return null;
        }

        // 2. check if email is verified
        if (!user.IsEmailVerified)
        {
            throw new Exception("Email has not been verified.");
        }

        // 3. verify input password with db password
        if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return null;
        }

        // 4. generate jwt token
        var (token, expiration) = jwtProvider.GetJwtToken(user.Id, user.Email);

        return new LoginResponse
        {
            Token = token,
            Expiration = expiration,
            User = new LoginResponse.UserInfo
            {
                Id = user.Id,
                Email = user.Email,
            },
        };
    }

    public async Task<UserProfileDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await authRepository.GetUserByIdAsync(userId);
        if (user == null) return null;

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = await avatarStorageProvider.CreateDownloadUrlAsync(user.AvatarUrl),
            AvatarColor = user.AvatarColor is null
                ? null
                : new AvatarColorDto
                {
                    Name = user.AvatarColor.Name,
                    Color = user.AvatarColor.Color,
                    BackgroundColor = user.AvatarColor.BackgroundColor
                },
        };
    }

    private async Task<Guid> SelectAvatarColorIdAsync()
    {
        var colorUsage = await dbContext.AvatarColors
            .Select(color => new
            {
                color.Id,
                UsageCount = dbContext.Users.Count(user => user.AvatarColorId == color.Id)
            })
            .ToListAsync();

        if (colorUsage.Count == 0)
        {
            throw new InvalidOperationException("No avatar colors are configured.");
        }

        var minimumUsage = colorUsage.Min(color => color.UsageCount);
        var candidates = colorUsage
            .Where(color => color.UsageCount == minimumUsage)
            .ToList();

        return candidates[Random.Shared.Next(candidates.Count)].Id;
    }

    public async Task<UserProfileDto?> UpdateAvatarAsync(
        Guid userId,
        string? avatarUrl)
    {
        var user = await authRepository.GetUserByIdAsync(userId);
        if (user == null) return null;

        user.SetAvatarUrl(avatarUrl);
        await authRepository.SaveChangesAsync();

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = await avatarStorageProvider.CreateDownloadUrlAsync(user.AvatarUrl),
            AvatarColor = user.AvatarColor is null
                ? null
                : new AvatarColorDto
                {
                    Name = user.AvatarColor.Name,
                    Color = user.AvatarColor.Color,
                    BackgroundColor = user.AvatarColor.BackgroundColor
                },
        };
    }

    public async Task<bool> VerifyEmailAsync(string token)
    {
        var user = await authRepository.GetUserByVerificationTokenAsync(token);

        if (user == null)
        {
            return false;
        }

        if (user.EmailVerificationTokenExpiry == null || user.EmailVerificationTokenExpiry <= DateTime.UtcNow)
        {
            return false;
        }

        user.VerifyEmail();
        await authRepository.SaveChangesAsync();

        return true;
    }

    public async Task<string?> UpdateUserRefreshTokenAsync(Guid userId, DateTime expiry)
    {
        try
        {
            var refreshToken = Guid.NewGuid().ToString();

            await authRepository.UpdateUserRefreshTokenAsync(userId, refreshToken, expiry);

            return refreshToken;
        }
        catch
        {
            return null;
        }
    }

    public async Task<(string, DateTime)?> GetUserRefreshTokenAsync(Guid userId)
    {
        try
        {
            var refreshToken = await authRepository.GetUserRefreshTokenAsync(userId);

            return refreshToken;
        }
        catch
        {
            return null;
        }
    }
}