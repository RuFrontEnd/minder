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
}