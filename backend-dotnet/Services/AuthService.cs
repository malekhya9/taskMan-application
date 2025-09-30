using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using TaskMan.Api.Data;
using TaskMan.Api.DTOs;
using TaskMan.Api.Models;
using BCrypt.Net;

namespace TaskMan.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserDto?> GetUserByIdAsync(int userId);
    Task<UserDto?> GetUserByEmailAsync(string email);
}

public class AuthService : IAuthService
{
    private readonly TaskManDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(TaskManDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) ||
            string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
        {
            throw new ArgumentException("All fields are required");
        }

        if (request.Role != "lead")
        {
            throw new ArgumentException("Only lead role allowed for registration");
        }

        // Check if user already exists
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User already exists");
        }

        // Hash password
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);

        // Create user
        var user = new User
        {
            Email = request.Email,
            Password = hashedPassword,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            ParentOrgId = null,
            IsVerified = true // Auto-verify for demo
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Set parent_org_id to self for the first lead
        if (!user.ParentOrgId.HasValue)
        {
            user.ParentOrgId = user.Id;
            await _context.SaveChangesAsync();
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Message = "Registration successful. Account auto-verified for demo.",
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            throw new ArgumentException("Email and password are required");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
        if (!isValidPassword)
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            Message = "Login successful",
            Token = token,
            User = MapToUserDto(user)
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null ? MapToUserDto(user) : null;
    }

    public async Task<UserDto?> GetUserByEmailAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user != null ? MapToUserDto(user) : null;
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
        var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");
        var expirationDays = jwtSettings.GetValue<int>("ExpirationInDays");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("userId", user.Id.ToString()),
            new Claim("email", user.Email),
            new Claim("role", user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expirationDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
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

