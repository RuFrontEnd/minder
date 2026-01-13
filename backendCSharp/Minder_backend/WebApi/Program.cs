using Infrastructure.Persistence; 
using Microsoft.EntityFrameworkCore;
using Domain.Repositories;
using Application.Services;
using Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// 1. 取得連線字串並註冊 DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 註冊 Repository (介面與實作的對應)
builder.Services.AddScoped<IUserRepository, UserRepository>();

// 註冊 Service
builder.Services.AddScoped<UserService>();

var app = builder.Build();

// 2. 測試資料庫連線的端點
app.MapGet("/test-db", async (ApplicationDbContext db) =>
{
    try
    {
        // 檢查是否能成功連線
        var canConnect = await db.Database.CanConnectAsync();
        return canConnect
            ? Results.Ok(new { Message = "PostgreSQL 連線成功！" })
            : Results.Problem("無法連線到資料庫");
    }
    catch (Exception ex)
    {
        return Results.Problem($"連線失敗: {ex.Message}");
    }
});

app.MapControllers();

app.Run();