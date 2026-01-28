using Domain.Entities;
using Domain.Provider;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Provider;

public class JwtProvider(IConfiguration configuration) : IJwtProvider
{
    public (string Token, DateTime Expiration) GetJwtToken(Guid userId, string email)
    {
        // 1. define Secret Key
        var secretKey = configuration["Jwt:SecretKey"]!;
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

        // 2. set expire date
        var expiration = DateTime.UtcNow.AddHours(1);

        // 3. prepare for Token Descriptor
        var handler = new JsonWebTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub ,userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            ]),
            Expires = expiration,
            Issuer = configuration["Jwt:Issuer"],
            Audience = configuration["Jwt:Audience"],
            SigningCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256)
        };

        // 4. generate Token string
        string token = handler.CreateToken(tokenDescriptor);

        return (token, expiration);
    }
}