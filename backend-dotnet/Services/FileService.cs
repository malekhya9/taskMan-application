using TaskMan.Api.Models;

namespace TaskMan.Api.Services;

public interface IFileService
{
    Task<string> SaveFileAsync(IFormFile file, string uploadPath);
    Task<bool> DeleteFileAsync(string filePath);
    System.Threading.Tasks.Task<byte[]?> GetFileAsync(string filePath);
    bool IsValidFileType(string fileName);
    bool IsValidFileSize(long fileSize, long maxSize);
}

public class FileService : IFileService
{
    private readonly IConfiguration _configuration;

    public FileService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string uploadPath)
    {
        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        var uniqueFileName = $"{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return uniqueFileName;
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                await System.Threading.Tasks.Task.Run(() => File.Delete(filePath));
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async System.Threading.Tasks.Task<byte[]?> GetFileAsync(string filePath)
    {
        try
        {
            if (File.Exists(filePath))
            {
                return await File.ReadAllBytesAsync(filePath);
            }
            return null;
        }
        catch
        {
            return null;
        }
    }

    public bool IsValidFileType(string fileName)
    {
        // For MVP, allow all file types
        return true;
    }

    public bool IsValidFileSize(long fileSize, long maxSize)
    {
        return fileSize <= maxSize;
    }
}

