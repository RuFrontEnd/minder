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
        public DbSet<ShapeEntity> Shape => Set<ShapeEntity>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 可以在這裡進行 Fluent API 配置，例如設定欄位長度或索引
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<UserEntity>(entity =>
            {
                // 這行最重要：它會在資料庫的欄位上掛載 DEFAULT 語法
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

            modelBuilder.Entity<ShapeEntity>(entity =>
            {
                entity.Property(e => e.Id)
                    .HasDefaultValueSql("gen_random_uuid()");

                entity.HasOne<ProjectEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.Author)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<UserEntity>()
                      .WithMany()
                      .HasForeignKey(p => p.Asignee)
                      .OnDelete(DeleteBehavior.Cascade);

                // Infos and Curves properties were removed from the entity. Keep
                // the DB mapping out. Existing migrations still reference the
                // nested types and the migration files should be left as-is.
            });
        }
    }
}