using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // table
        public DbSet<UserEntity> Users => Set<UserEntity>();
        public DbSet<ProjectEntity> Projects => Set<ProjectEntity>();
        public DbSet<MemberEntity> Members => Set<MemberEntity>();
        public DbSet<RoleEntity> Roles => Set<RoleEntity>();
        public DbSet<ShapeEntity> Steps => Set<ShapeEntity>();
        public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
        public DbSet<MessageEntity> Messages => Set<MessageEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>(entity =>
            {
                entity.ToTable("users");

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.Password).HasColumnName("password");
                entity.Property(e => e.FirstName).HasColumnName("first_name");
                entity.Property(e => e.LastName).HasColumnName("last_name");
                entity.Property(e => e.IsEmailVerified).HasColumnName("is_email_verified");
                entity.Property(e => e.EmailVerificationToken).HasColumnName("email_verification_token");
                entity.Property(e => e.EmailVerificationTokenExpiry).HasColumnName("email_verification_token_expiry");
                entity.Property(e => e.RefreshToken).HasColumnName("refresh_token");
                entity.Property(e => e.RefreshTokenExpiryTime).HasColumnName("refresh_token_expiry_time");
                entity.Property(e => e.Id)
                      .HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<ProjectEntity>(entity =>
            {
                entity.ToTable("projects");

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<MemberEntity>(entity =>
            {
                entity.ToTable("members");

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ProjectId).HasColumnName("project_id");
                entity.Property(e => e.RoleId).HasColumnName("role_id");
                entity.Property(e => e.Id)
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.HasOne<UserEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<ProjectEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<RoleEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.RoleId)
                    .HasDefaultValue(RoleEntity.OwnerId);

                entity.HasIndex(e => new { e.UserId, e.ProjectId })
                    .IsUnique();
            });

            modelBuilder.Entity<RoleEntity>(entity =>
            {
                entity.ToTable("roles");

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired();

                entity.HasIndex(e => e.Name)
                    .IsUnique();

                entity.HasData(
                    new
                    {
                        Id = RoleEntity.OwnerId,
                        Name = "owner"
                    },
                    new
                    {
                        Id = RoleEntity.MemberId,
                        Name = "member"
                    },
                    new
                    {
                        Id = RoleEntity.GuestId,
                        Name = "guest"
                    });
            });

            modelBuilder.Entity<ShapeEntity>(entity =>
            {
                entity.ToTable("steps", table =>
                    table.HasCheckConstraint(
                        "ck_steps_status",
                        "\"status\" IN ('todo', 'inProgress', 'done')"));

                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ProjectId).HasColumnName("project_id");
                entity.Property(e => e.Creator).HasColumnName("creator_id");
                entity.Property(e => e.Owner).HasColumnName("owner_id");
                entity.Property(e => e.W).HasColumnName("width");
                entity.Property(e => e.H).HasColumnName("height");
                entity.Property(e => e.X).HasColumnName("position_x");
                entity.Property(e => e.Y).HasColumnName("position_y");
                entity.Property(e => e.Title).HasColumnName("title");
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Status).HasColumnName("status")
                    .HasDefaultValue("todo");

                entity.Property(e => e.Id)
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.HasOne<ProjectEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.Creator)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.Owner)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<TaskEntity>(entity =>
            {
                entity.ToTable("tasks");

                entity.Property(e => e.Id).HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.Property(e => e.StepId).HasColumnName("step_id");
                entity.Property(e => e.Owner).HasColumnName("owner_id");
                entity.Property(e => e.Description).HasColumnName("description");

                entity.HasOne<ShapeEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.StepId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<UserEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.Owner)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<MessageEntity>(entity =>
            {
                entity.ToTable("messages");

                entity.Property(e => e.Id).HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.Property(e => e.StepId).HasColumnName("step_id");
                entity.Property(e => e.MemberId).HasColumnName("member_id");
                entity.Property(e => e.Content).HasColumnName("content");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at")
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at")
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne<ShapeEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.StepId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<MemberEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.MemberId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}