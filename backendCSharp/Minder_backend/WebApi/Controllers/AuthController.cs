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
}