using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    AuthService authService,
    IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        await authService.RegisterUserAsync(request.Email, request.Password, request.FirstName, request.LastName);
        return Ok(new { message = "register successfully! Please check your email to verify your account." });
    }

    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { message = "invalid verification token." });
        }

        var isVerified = await authService.VerifyEmailAsync(token);
        if (!isVerified)
        {
            return BadRequest(new { message = "verification link is invalid or expired." });
        }

        return Ok(new { message = "email verified successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            LoginResponse? userData = await authService.LoginAsync(request.Email, request.Password);

            if (userData == null)
            {
                return Unauthorized(new { message = "Please check the account and password you entered.", data = (object?)null });
            }

            var refreshToken = await authService.UpdateUserRefreshTokenAsync(userData.User.Id, DateTime.UtcNow.AddDays(7));

            if (refreshToken == null)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "login failed due to a server error.", data = (object?)null });
            }

            SetAuthCookies(userData.Token, userData.Expiration, refreshToken);

            return Ok(new { message = "login successfully!", data = new { id = userData.User.Id, Email = userData.User.Email } });
        }
        catch (Exception ex) when (ex.Message == "Email has not been verified.")
        {
            return Unauthorized(new { message = ex.Message, data = (object?)null });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["X-Refresh-Token"];
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await authService.RevokeRefreshTokenAsync(refreshToken);
        }

        DeleteAuthCookies();
        return Ok(new { message = "logged out successfully!" });
    }

    [Authorize]
    [HttpPost("validateToken")]
    public async Task<IActionResult> ValidateToken()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        if (userId == null) return Unauthorized();
        if (!Guid.TryParse(userId, out var parsedUserId)) return Unauthorized();
        var user = await authService.GetUserByIdAsync(parsedUserId);

        return Ok(new
        {
            id = userId,
            email = email,
            avatarUrl = user?.AvatarUrl,
            avatarColor = user?.AvatarColor,
            firstName = user?.FirstName,
            lastName = user?.LastName,
            message = "authenticated!"
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var user = await authService.GetUserByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(user);
    }

    [Authorize]
    [HttpPost("me/avatar/upload-url")]
    public async Task<IActionResult> CreateAvatarUploadUrl(
        [FromBody] CreateAvatarUploadUrlRequest request)
    {
        var userIdValue = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var result = await authService.CreateAvatarUploadUrlAsync(
            userId,
            request);

        if (result is null)
        {
            return BadRequest(new
            {
                message = "Only JPEG, PNG, or WebP images up to 3 MB are allowed."
            });
        }

        return Ok(result);
    }

    [Authorize]
    [HttpPut("me/avatar")]
    public async Task<IActionResult> UpdateAvatar(
        [FromBody] UpdateAvatarRequest request)
    {
        if (request.AvatarUrl is not null &&
            !IsAllowedAvatarUrl(request.AvatarUrl))
        {
            return BadRequest(new { message = "Avatar image is invalid or too large." });
        }

        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var user = await authService.UpdateAvatarAsync(userId, request.AvatarUrl);
        return user is null ? NotFound(new { message = "User not found." }) : Ok(user);
    }

    private bool IsAllowedAvatarUrl(string avatarUrl)
    {
        if (avatarUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            return avatarUrl.Length <= 4_000_000;
        }

        var bucketName = configuration["AWS:BucketName"];
        var regionName = configuration["AWS:Region"];
        if (string.IsNullOrWhiteSpace(bucketName) || string.IsNullOrWhiteSpace(regionName))
        {
            return false;
        }

        var expectedHost = $"{bucketName}.s3.{regionName}.amazonaws.com";
        return Uri.TryCreate(avatarUrl, UriKind.Absolute, out var uri) &&
            uri.Scheme == Uri.UriSchemeHttps &&
            string.Equals(uri.Host, expectedHost, StringComparison.OrdinalIgnoreCase) &&
            uri.AbsolutePath.StartsWith("/avatars/", StringComparison.Ordinal);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["X-Refresh-Token"];
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            DeleteAuthCookies();
            return Unauthorized("refresh token is missing.");
        }

        var user = await authService.GetUserByRefreshTokenAsync(refreshToken);
        if (user == null ||
            user.RefreshTokenExpiryTime is null ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            DeleteAuthCookies();
            return Unauthorized("refresh token expired.");
        }

        var newAccessToken = authService.GenerateAccessToken(user.Id, user.Email);
        var newRefreshToken = await authService.UpdateUserRefreshTokenAsync(
            user.Id,
            DateTime.UtcNow.AddDays(7));

        if (newRefreshToken == null)
        {
            DeleteAuthCookies();
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new { message = "unable to refresh authentication session." });
        }

        SetAuthCookies(
            newAccessToken.Token,
            newAccessToken.Expiration,
            newRefreshToken);

        return Ok(new { message = "token refreshed!" });
    }

    private void SetAuthCookies(
        string accessToken,
        DateTime accessTokenExpiration,
        string refreshToken)
    {
        Response.Cookies.Append(
            "X-Access-Token",
            accessToken,
            CreateAuthCookieOptions(accessTokenExpiration));
        Response.Cookies.Append(
            "X-Refresh-Token",
            refreshToken,
            CreateAuthCookieOptions(DateTime.UtcNow.AddDays(7)));
    }

    private void DeleteAuthCookies()
    {
        Response.Cookies.Delete("X-Access-Token", CreateAuthCookieOptions());
        Response.Cookies.Delete("X-Refresh-Token", CreateAuthCookieOptions());
    }

    private static CookieOptions CreateAuthCookieOptions(DateTime? expires = null)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = expires
        };
    }
}