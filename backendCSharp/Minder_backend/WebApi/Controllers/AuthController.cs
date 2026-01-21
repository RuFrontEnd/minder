using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;

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
    public async Task<IActionResult> Login([FromBody] LoginRequest request) {
        await authService.LoginAsync(request.Email, request.Password);
        return Ok(new { message = "login successfully!" });
    }
}