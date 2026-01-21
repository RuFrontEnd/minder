using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
        LoginResponse? data = await authService.LoginAsync(request.Email, request.Password);

        if (data == null)
        {
            return BadRequest(new { message = "login fail.", data = (object?)null });
        }

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(2)
        };

        Response.Cookies.Append("X-Access-Token", data.Token, cookieOptions);

        return Ok(new { message = "login successfully!", data = new { id = data.User.Id, Email = data.User.Email } });
    }
}