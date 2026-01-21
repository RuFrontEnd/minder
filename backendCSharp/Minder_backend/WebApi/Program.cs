using Infrastructure.Persistence;
using Infrastructure.Repositories;
using Infrastructure.Provider;
using Domain.Repositories;
using Domain.Provider;
using Application.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// 1. get connection string & register DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// register Repository (interface to instance)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

// register Provider
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

// register Service
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();

// add authentication middleware
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        // 這裡設定如何驗證前端傳回來的 Token
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
        };
    });

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