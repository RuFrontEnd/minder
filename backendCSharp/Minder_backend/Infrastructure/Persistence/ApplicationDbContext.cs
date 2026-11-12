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
        public DbSet<AvatarColorEntity> AvatarColors => Set<AvatarColorEntity>();
        public DbSet<ProjectEntity> Projects => Set<ProjectEntity>();
        public DbSet<MemberEntity> Members => Set<MemberEntity>();
        public DbSet<RoleEntity> Roles => Set<RoleEntity>();
        public DbSet<StepEntity> Steps => Set<StepEntity>();
        public DbSet<StepDependencyEntity> StepDependencies => Set<StepDependencyEntity>();
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
                entity.Property(e => e.AvatarUrl).HasColumnName("avatar_url");
                entity.Property(e => e.AvatarColorId).HasColumnName("avatar_color_id");
                entity.HasOne(e => e.AvatarColor)
                    .WithMany()
                    .HasForeignKey(e => e.AvatarColorId)
                    .OnDelete(DeleteBehavior.Restrict);
                entity.Property(e => e.IsEmailVerified).HasColumnName("is_email_verified");
                entity.Property(e => e.EmailVerificationToken).HasColumnName("email_verification_token");
                entity.Property(e => e.EmailVerificationTokenExpiry).HasColumnName("email_verification_token_expiry");
                entity.Property(e => e.RefreshToken).HasColumnName("refresh_token");
                entity.Property(e => e.RefreshTokenExpiryTime).HasColumnName("refresh_token_expiry_time");
                entity.Property(e => e.Id)
                      .HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<AvatarColorEntity>(entity =>
            {
                entity.ToTable("avatar_colors");

                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").IsRequired();
                entity.Property(e => e.Color).HasColumnName("color").IsRequired();
                entity.Property(e => e.BackgroundColor)
                    .HasColumnName("background_color")
                    .IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasData(
                    new
                    {
                        Id = AvatarColorEntity.BlueId,
                        Name = "blue",
                        Color = "#1d4ed8",
                        BackgroundColor = "#dbeafe"
                    },
                    new
                    {
                        Id = AvatarColorEntity.GreenId,
                        Name = "green",
                        Color = "#047857",
                        BackgroundColor = "#d1fae5"
                    },
                    new
                    {
                        Id = AvatarColorEntity.PurpleId,
                        Name = "purple",
                        Color = "#7e22ce",
                        BackgroundColor = "#f3e8ff"
                    },
                    new
                    {
                        Id = AvatarColorEntity.OrangeId,
                        Name = "orange",
                        Color = "#c2410c",
                        BackgroundColor = "#ffedd5"
                    },
                    new
                    {
                        Id = AvatarColorEntity.RoseId,
                        Name = "rose",
                        Color = "#be123c",
                        BackgroundColor = "#ffe4e6"
                    },
                    new
                    {
                        Id = AvatarColorEntity.TealId,
                        Name = "teal",
                        Color = "#0f766e",
                        BackgroundColor = "#ccfbf1"
                    },
                    new
                    {
                        Id = AvatarColorEntity.AmberId,
                        Name = "amber",
                        Color = "#a16207",
                        BackgroundColor = "#fef3c7"
                    },
                    new
                    {
                        Id = AvatarColorEntity.IndigoId,
                        Name = "indigo",
                        Color = "#4338ca",
                        BackgroundColor = "#e0e7ff"
                    });
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

            modelBuilder.Entity<StepEntity>(entity =>
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

            modelBuilder.Entity<StepDependencyEntity>(entity =>
            {
                entity.ToTable("step_dependencies", table =>
                    table.HasCheckConstraint(
                        "ck_step_dependencies_not_self",
                        "step_id <> depends_on_step_id"));

                entity.Property(e => e.Id).HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");
                entity.Property(e => e.StepId).HasColumnName("step_id");
                entity.Property(e => e.DependsOnStepId).HasColumnName("depends_on_step_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at")
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => new { e.StepId, e.DependsOnStepId })
                    .IsUnique()
                    .HasDatabaseName("uq_step_dependency");

                entity.HasIndex(e => e.DependsOnStepId)
                    .HasDatabaseName("ix_step_dependencies_depends_on_step_id");

                entity.HasOne<StepEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.StepId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_dependency_step");

                entity.HasOne<StepEntity>()
                    .WithMany()
                    .HasForeignKey(e => e.DependsOnStepId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("fk_dependency_parent_step");
            });

            modelBuilder.Entity<TaskEntity>(entity =>
            {
                entity.ToTable("tasks");

                entity.Property(e => e.Id).HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.Property(e => e.StepId).HasColumnName("step_id");
                entity.Property(e => e.Owner).HasColumnName("owner_id");
                entity.Property(e => e.Description).HasColumnName("description");

                entity.HasOne<StepEntity>()
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

                entity.HasOne<StepEntity>()
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