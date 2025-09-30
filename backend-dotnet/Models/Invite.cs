using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class Invite
{
    [Key]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public int InvitedBy { get; set; }

    [ForeignKey("InvitedBy")]
    public User Inviter { get; set; } = null!;

    [MaxLength(20)]
    public string Role { get; set; } = "member";

    [MaxLength(100)]
    public string? Message { get; set; }

    [MaxLength(255)]
    public string Token { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public DateTime? AcceptedAt { get; set; }

    public int? AcceptedBy { get; set; }

    [ForeignKey("AcceptedBy")]
    public User? Accepter { get; set; }

    [NotMapped]
    public bool IsExpired => DateTime.UtcNow > ExpiresAt;

    [NotMapped]
    public bool IsAccepted => AcceptedAt.HasValue;
}

