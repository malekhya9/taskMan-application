using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskMan.Api.DTOs;
using TaskMan.Api.Services;

namespace TaskMan.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var parentOrgIdClaim = User.FindFirst("parentOrgId")?.Value;
            if (string.IsNullOrEmpty(parentOrgIdClaim) || !int.TryParse(parentOrgIdClaim, out var parentOrgId))
            {
                // If no parentOrgId claim, use userId as parentOrgId
                parentOrgId = userId;
            }

            var users = await _userService.GetUsersByOrgAsync(parentOrgId);
            return Ok(new { users });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch users" });
        }
    }

    [HttpGet("leads")]
    public async Task<ActionResult<List<UserDto>>> GetLeads()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var parentOrgIdClaim = User.FindFirst("parentOrgId")?.Value;
            if (string.IsNullOrEmpty(parentOrgIdClaim) || !int.TryParse(parentOrgIdClaim, out var parentOrgId))
            {
                parentOrgId = userId;
            }

            var leads = await _userService.GetLeadsByOrgAsync(parentOrgId);
            return Ok(new { leads });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch leads" });
        }
    }

    [HttpGet("members")]
    public async Task<ActionResult<List<UserDto>>> GetMembers()
    {
        try
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var parentOrgIdClaim = User.FindFirst("parentOrgId")?.Value;
            if (string.IsNullOrEmpty(parentOrgIdClaim) || !int.TryParse(parentOrgIdClaim, out var parentOrgId))
            {
                parentOrgId = userId;
            }

            var members = await _userService.GetMembersByOrgAsync(parentOrgId);
            return Ok(new { members });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch members" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new { user });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to fetch user" });
        }
    }
}

