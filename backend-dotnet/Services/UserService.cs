using Microsoft.EntityFrameworkCore;
using TaskMan.Api.Data;
using TaskMan.Api.DTOs;
using TaskMan.Api.Models;

namespace TaskMan.Api.Services;

public interface IUserService
{
    System.Threading.Tasks.Task<List<UserDto>> GetUsersByOrgAsync(int parentOrgId);
    System.Threading.Tasks.Task<List<UserDto>> GetLeadsByOrgAsync(int parentOrgId);
    System.Threading.Tasks.Task<List<UserDto>> GetMembersByOrgAsync(int parentOrgId);
    System.Threading.Tasks.Task<UserDto?> GetUserByIdAsync(int userId);
    System.Threading.Tasks.Task UpdateUserVerificationStatusAsync(int userId, bool isVerified);
}

public class UserService : IUserService
{
    private readonly TaskManDbContext _context;

    public UserService(TaskManDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<List<UserDto>> GetUsersByOrgAsync(int parentOrgId)
    {
        var users = await _context.Users
            .Where(u => u.ParentOrgId == parentOrgId || u.Id == parentOrgId)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return users.Select(MapToUserDto).ToList();
    }

    public async System.Threading.Tasks.Task<List<UserDto>> GetLeadsByOrgAsync(int parentOrgId)
    {
        var users = await _context.Users
            .Where(u => u.ParentOrgId == parentOrgId && u.Role == "lead")
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return users.Select(MapToUserDto).ToList();
    }

    public async System.Threading.Tasks.Task<List<UserDto>> GetMembersByOrgAsync(int parentOrgId)
    {
        var users = await _context.Users
            .Where(u => u.ParentOrgId == parentOrgId && u.Role == "member")
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();

        return users.Select(MapToUserDto).ToList();
    }

    public async System.Threading.Tasks.Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null ? MapToUserDto(user) : null;
    }

    public async System.Threading.Tasks.Task UpdateUserVerificationStatusAsync(int userId, bool isVerified)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.IsVerified = isVerified;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Role = user.Role,
            ParentOrgId = user.ParentOrgId,
            IsVerified = user.IsVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}

