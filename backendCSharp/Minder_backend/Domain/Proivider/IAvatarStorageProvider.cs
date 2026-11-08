namespace Domain.Provider;

public interface IAvatarStorageProvider
{
    Task<string> CreateUploadUrlAsync(string key, string contentType);
}