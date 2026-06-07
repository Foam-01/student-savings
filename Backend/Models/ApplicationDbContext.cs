using Microsoft.EntityFrameworkCore;
using StudentSavingsSystem.Models.Entities;

namespace StudentSavingsSystem.Models
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<SavingGoal> SavingGoals { get; set; }
        public DbSet<SavingsBucket> SavingsBuckets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Balance).HasDefaultValue(0);
            });

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.HasOne(t => t.Student)
                      .WithMany(u => u.Transactions)
                      .HasForeignKey(t => t.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure SavingGoal entity
            modelBuilder.Entity<SavingGoal>(entity =>
            {
                entity.HasOne(g => g.Student)
                      .WithMany()
                      .HasForeignKey(g => g.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure SavingsBucket entity
            modelBuilder.Entity<SavingsBucket>(entity =>
            {
                entity.HasOne(b => b.Student)
                      .WithMany()
                      .HasForeignKey(b => b.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
