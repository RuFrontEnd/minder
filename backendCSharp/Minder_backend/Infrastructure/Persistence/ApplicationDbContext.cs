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

        public DbSet<User> User => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // 可以在這裡進行 Fluent API 配置，例如設定欄位長度或索引
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                // 這行最重要：它會在資料庫的欄位上掛載 DEFAULT 語法
                entity.Property(e => e.Id)
                      .HasDefaultValueSql("gen_random_uuid()");
            });
        }
    }
}