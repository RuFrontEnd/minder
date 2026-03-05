using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace WebAPi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ShapeController(ShapeService shapeService) : ControllerBase
{
    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdStr, out Guid userId))
        {
            return Unauthorized(new { message = "invalid auth token." });
        }

        var infos = await shapeService.GetAsync(userId);

        return Ok(new { data = infos });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] List<ShapeInfoDTO> request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdStr, out Guid userId))
        {
            return Unauthorized(new { message = "invalid auth token." });
        }

        await shapeService.UpsertAsync(userId, request);

        return Ok(new { message = "update shapes successfully!" });
    }
}