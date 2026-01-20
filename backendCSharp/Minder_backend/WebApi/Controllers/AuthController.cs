using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. 定義一個私有欄位
        private readonly AuthService _authService;

        // 2. 在建構函式中賦值
        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST api/<ValuesController>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserRequest request)
        {
            await _authService.RegisterUserAsync(request.Email, request.Password);
            return Ok(new { message = "register successfully!" });
        }
    }
}
