using Application.Services;
using Domain.Provider;
using Domain.Repositories;
using Infrastructure.Persistence;
using Infrastructure.Provider;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// 1. get connection string & register DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson(); // 解決那個長長的 InvalidCastException 錯誤
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));

// register Repository (interface to instance)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IShapeRepository, ShapeRepository>();

// register Provider
builder.Services.AddScoped<IJwtProvider, JwtProvider>();

// register Service
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ShapeService>();

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

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies["X-Access-Token"];
                return Task.CompletedTask;
            }
        };
    });

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost3000",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") // 允許的來源
                  .WithOrigins("http://localhost:4000") // 允許的來源
                  .AllowAnyHeader()                   // 允許任何 Header
                  .AllowAnyMethod()                   // 允許任何方法 (GET, POST, PUT, DELETE)
                  .AllowCredentials();                // 如果你有用 Cookie 或 JWT，這行很重要
        });
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

app.UseCors("AllowLocalhost3000"); // CORS
app.MapControllers();
app.Run();