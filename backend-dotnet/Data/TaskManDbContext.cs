using Microsoft.EntityFrameworkCore;
using TaskMan.Api.Models;
using TaskModel = TaskMan.Api.Models.Task;

namespace TaskMan.Api.Data;

public class TaskManDbContext : DbContext
{
    public TaskManDbContext(DbContextOptions<TaskManDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TaskModel> Tasks { get; set; }
    public DbSet<TaskAssignee> TaskAssignees { get; set; }
    public DbSet<TaskAttachment> TaskAttachments { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<Invite> Invites { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User entity configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            // Self-referencing relationship for organization hierarchy
            entity.HasOne(e => e.ParentOrg)
                  .WithMany(e => e.Members)
                  .HasForeignKey(e => e.ParentOrgId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Task entity configuration
        modelBuilder.Entity<TaskModel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50).HasDefaultValue("backlogged");
            entity.Property(e => e.ProjectTag).HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Creator)
                  .WithMany(e => e.CreatedTasks)
                  .HasForeignKey(e => e.CreatedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // TaskAssignee entity configuration
        modelBuilder.Entity<TaskAssignee>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.AssignedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Task)
                  .WithMany(e => e.Assignees)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(e => e.TaskAssignments)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint to prevent duplicate assignments
            entity.HasIndex(e => new { e.TaskId, e.UserId }).IsUnique();
        });

        // TaskAttachment entity configuration
        modelBuilder.Entity<TaskAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Filename).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OriginalName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Task)
                  .WithMany(e => e.Attachments)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // TaskComment entity configuration
        modelBuilder.Entity<TaskComment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Content).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Task)
                  .WithMany(e => e.Comments)
                  .HasForeignKey(e => e.TaskId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                  .WithMany(e => e.TaskComments)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Invite entity configuration
        modelBuilder.Entity<Invite>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Role).HasMaxLength(20).HasDefaultValue("member");
            entity.Property(e => e.Message).HasMaxLength(100);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(e => e.Inviter)
                  .WithMany(e => e.SentInvites)
                  .HasForeignKey(e => e.InvitedBy)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Accepter)
                  .WithMany(e => e.ReceivedInvites)
                  .HasForeignKey(e => e.AcceptedBy)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

