using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TaskMan.Api.Models;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = string.Empty; // 'lead' or 'member'

    public int? ParentOrgId { get; set; }

    [ForeignKey("ParentOrgId")]
    public User? ParentOrg { get; set; }

    public bool IsVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<User> Members { get; set; } = new List<User>();
    public ICollection<Task> CreatedTasks { get; set; } = new List<Task>();
    public ICollection<TaskAssignee> TaskAssignments { get; set; } = new List<TaskAssignee>();
    public ICollection<TaskComment> TaskComments { get; set; } = new List<TaskComment>();
    public ICollection<Invite> SentInvites { get; set; } = new List<Invite>();
    public ICollection<Invite> ReceivedInvites { get; set; } = new List<Invite>();

    // Computed properties
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}";

    [NotMapped]
    public bool IsLead => Role == "lead";

    [NotMapped]
    public bool IsMember => Role == "member";
}

