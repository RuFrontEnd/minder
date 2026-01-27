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

        public DbSet<UserEntity> User => Set<UserEntity>();
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

            modelBuilder.Entity<ShapeEntity>(entity =>
            {
                entity.Property(e => e.Id)
                    .HasDefaultValueSql("gen_random_uuid()");

                // 定義一對多關係
                entity.HasOne(s => s.User)          // 一個 Shape 屬於一個 User
                      .WithMany()                   // 一個 User 可以有多個 Shape (如果 User 類別沒定義集合，這裡留空)
                      .HasForeignKey(s => s.UserId) // 指定外鍵是 UserId
                      .OnDelete(DeleteBehavior.Cascade); // 如果 User 被刪除，Shapes 也一起刪除

                entity.Property(e => e.Infos)
                      .HasColumnType("jsonb")
                      .IsRequired()
                      .HasDefaultValueSql("'[]'::jsonb");
            });
        }
    }
}