using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
    {
        await authService.RegisterUserAsync(request.Email, request.Password);
        return Ok(new { message = "register successfully!" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        LoginResponse? userData = await authService.LoginAsync(request.Email, request.Password);

        if (userData == null)
        {
            return BadRequest(new { message = "login fail.", data = (object?)null });
        }

        var refreshToken = await authService.UpdateUserRefreshTokenAsync(userData.User.Id, DateTime.UtcNow.AddDays(7));

        if (refreshToken == null)
        {
            return BadRequest(new { message = "login fail.", data = (object?)null });
        }


        Response.Cookies.Append("X-Access-Token", userData.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddSeconds(10)
        });

        Response.Cookies.Append("X-Refresh-Token", userData.Token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new { message = "login successfully!", data = new { id = userData.User.Id, Email = userData.User.Email } });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("X-Access-Token");
        return Ok(new { message = "logged out successfully!" });
    }

    [Authorize]
    [HttpPost("validateToken")]
    public IActionResult ValidateToken()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        if (userId == null) return Unauthorized();

        return Ok(new
        {
            id = userId,
            email = email,
            message = "authenticated!"
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh()
    {
        var cookcieRefreshToken = Request.Cookies["X-Refresh-Token"];
        if (string.IsNullOrEmpty(cookcieRefreshToken)) return Unauthorized();

        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        if (!Guid.TryParse(userIdStr, out Guid userId) || email == null)
        {
            return Unauthorized(new { message = "invalid auth token." });
        }

        var dbRefreshToken = await authService.GetUserRefreshTokenAsync(userId);

        if (dbRefreshToken.HasValue)
        {

            var (refreshToken, refreshTokenExpiryTime) = dbRefreshToken.Value;
            if (refreshToken == null || refreshTokenExpiryTime <= DateTime.UtcNow)
            {
                Response.Cookies.Delete("X-Access-Token");
                Response.Cookies.Delete("X-Refresh-Token");

                return Unauthorized("refresh token expired.");
            }

            var newAccessToken = authService.GenerateAccessToken(userId, email);

            var postponedRefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            var newRefreshToken = await authService.UpdateUserRefreshTokenAsync(userId, postponedRefreshTokenExpiryTime);

            if (newRefreshToken != null) { 
                Response.Cookies.Append("X-Access-Token", newAccessToken.Token, new CookieOptions
                {
                    HttpOnly = true,
                    Expires = DateTime.UtcNow.AddSeconds(10)
                });
                Response.Cookies.Append("X-Refresh-Token", newRefreshToken, new CookieOptions
                {
                    Expires = postponedRefreshTokenExpiryTime // Cookie 的壽命也同步更新
                });
            }

        }
        else
        {
            return Unauthorized("refresh token expired.");
        }

        return Ok(new { message = "token refreshed!" });
    }
}