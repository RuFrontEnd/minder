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
using Amazon;
using Amazon.S3;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// 1. get connection string & register DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var dataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
dataSourceBuilder.EnableDynamicJson(); // �ѨM���Ӫ����� InvalidCastException ���~
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(dataSource));

// register Repository (interface to instance)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IShapeRepository, ShapeRepository>();

// register Provider
builder.Services.AddScoped<IJwtProvider, JwtProvider>();
builder.Services.AddScoped<IEmailProvider, EmailProvider>();

// register Service
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ProjectService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ShapeService>();

// AWS S3 Avatar Storage Provider
builder.Services.AddScoped<IAvatarStorageProvider, S3AvatarStorageProvider>();

// add authentication middleware
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // �o�̳]�w�p�����ҫe�ݶǦ^�Ӫ� Token
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
            policy.WithOrigins("http://localhost:3000") // ���\���ӷ�
                  .WithOrigins("http://localhost:4000") // ���\���ӷ�
                  .AllowAnyHeader()                   // ���\���� Header
                  .AllowAnyMethod()                   // ���\�����k (GET, POST, PUT, DELETE)
                  .AllowCredentials();                // �p�G�A���� Cookie �� JWT�A�o��ܭ��n
        });
});

builder.Services.AddSingleton<IAmazonS3>(_ =>
    new AmazonS3Client(
        RegionEndpoint.GetBySystemName(
            builder.Configuration["AWS:Region"]
                ?? throw new InvalidOperationException("AWS:Region is not configured.")
        )
    )
);

var app = builder.Build();

// 2. ���ո�Ʈw�s�u�����I
app.MapGet("/test-db", async (ApplicationDbContext db) =>
{
    try
    {
        // �ˬd�O�_�ন�\�s�u
        var canConnect = await db.Database.CanConnectAsync();
        return canConnect
            ? Results.Ok(new { Message = "PostgreSQL �s�u���\�I" })
            : Results.Problem("�L�k�s�u���Ʈw");
    }
    catch (Exception ex)
    {
        return Results.Problem($"�s�u����: {ex.Message}");
    }
});

app.UseCors("AllowLocalhost3000"); // CORS
app.MapControllers();
app.Run();