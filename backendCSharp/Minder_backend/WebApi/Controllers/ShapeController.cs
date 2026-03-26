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

        var response = await shapeService.GetWithCurvesAsync(userId);
        
        if (response == null)
        {
            return Ok(new { data = new { shapes = new List<object>(), curves = new List<object>() } });
        }

        return Ok(new { data = response });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] dynamic request)
    {
        var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdStr, out Guid userId))
        {
            return Unauthorized(new { message = "invalid auth token." });
        }

        // Handle both old format (List<ShapeInfoDTO>) and new format (ShapeUpsertRequestDTO)
        List<ShapeInfoDTO> shapes = new();
        List<CurveDTO> curves = new();

        try
        {
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            if (request is JsonElement element)
            {
                // Try to parse as new format
                if (element.TryGetProperty("shapes", out var shapesElement))
                {
                    shapes = JsonSerializer.Deserialize<List<ShapeInfoDTO>>(shapesElement.GetRawText(), options) ?? new();
                    if (element.TryGetProperty("curves", out var curvesElement))
                    {
                        curves = JsonSerializer.Deserialize<List<CurveDTO>>(curvesElement.GetRawText(), options) ?? new();
                    }
                }
                else
                {
                    // Old format - array of shapes
                    shapes = JsonSerializer.Deserialize<List<ShapeInfoDTO>>(element.GetRawText(), options) ?? new();
                }
            }
        }
        catch
        {
            return BadRequest(new { message = "invalid request format" });
        }

        await shapeService.UpsertAsync(userId, shapes, curves);

        return Ok(new { message = "update shapes successfully!" });
    }
}