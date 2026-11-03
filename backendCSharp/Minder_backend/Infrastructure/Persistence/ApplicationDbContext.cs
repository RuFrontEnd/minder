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
        public DbSet<UserEntity> User => Set<UserEntity>();
        public DbSet<ProjectEntity> Project => Set<ProjectEntity>();
        public DbSet<MemberEntity> Member => Set<MemberEntity>();
        public DbSet<RoleEntity> Role => Set<RoleEntity>();
        public DbSet<ShapeEntity> Step => Set<ShapeEntity>();
        public DbSet<TaskEntity> Tasks => Set<TaskEntity>();
        public DbSet<MessageEntity> Messages => Set<MessageEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>(entity =>
            {
                entity.Property(e => e.Id)
                      .HasDefaultValueSql("gen_random_uuid()");
            });

            modelBuilder.Entity<ProjectEntity>(entity =>
            {
                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<MemberEntity>(entity =>
            {
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
                entity.ToTable("Step", table =>
                    table.HasCheckConstraint(
                        "CK_Step_Status",
                        "\"Status\" IN ('todo', 'inProgress', 'done')"));

                entity.Property(e => e.Status)
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
                entity.ToTable("Task");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.Property(e => e.StepId)
                    .HasColumnName("stepId");

                entity.Property(e => e.Description)
                    .HasColumnName("description");

                entity.Property(e => e.Owner)
                    .HasColumnName("owner");

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
                entity.ToTable("Message");

                entity.Property(e => e.Id)
                    .HasColumnName("id")
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.Property(e => e.StepId)
                    .HasColumnName("step_id");

                entity.Property(e => e.MemberId)
                    .HasColumnName("member_id");

                entity.Property(e => e.Content)
                    .HasColumnName("content");

                entity.Property(e => e.CreatedAt)
                    .HasColumnName("create_at")
                    .HasColumnType("timestamp with time zone")
                    .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.UpdatedAt)
                    .HasColumnName("update_at")
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