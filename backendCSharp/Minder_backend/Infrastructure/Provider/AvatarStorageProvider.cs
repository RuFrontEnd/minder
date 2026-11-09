using Amazon.S3;
using Amazon.S3.Model;
using Domain.Provider;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Provider;

public class S3AvatarStorageProvider(
    IAmazonS3 s3Client,
    IConfiguration configuration) : IAvatarStorageProvider
{
    public Task<string> CreateUploadUrlAsync(string key, string contentType)
    {
        var bucketName = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("AWS:BucketName is not configured.");

        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = key,
            Verb = HttpVerb.PUT,
            Expires = DateTime.UtcNow.AddMinutes(5),
            ContentType = contentType
        };

        return s3Client.GetPreSignedURLAsync(request);
    }

    public async Task<string?> CreateDownloadUrlAsync(string? avatarUrl)
    {
        if (string.IsNullOrWhiteSpace(avatarUrl) ||
            avatarUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            return avatarUrl;
        }

        var bucketName = configuration["AWS:BucketName"]
            ?? throw new InvalidOperationException("AWS:BucketName is not configured.");
        var regionName = configuration["AWS:Region"]
            ?? throw new InvalidOperationException("AWS:Region is not configured.");
        var expectedHost = $"{bucketName}.s3.{regionName}.amazonaws.com";

        if (!Uri.TryCreate(avatarUrl, UriKind.Absolute, out var uri) ||
            !string.Equals(uri.Host, expectedHost, StringComparison.OrdinalIgnoreCase) ||
            !uri.AbsolutePath.StartsWith("/avatars/", StringComparison.Ordinal))
        {
            return avatarUrl;
        }

        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucketName,
            Key = uri.AbsolutePath.TrimStart('/'),
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(5)
        };

        return await s3Client.GetPreSignedURLAsync(request);
    }
}