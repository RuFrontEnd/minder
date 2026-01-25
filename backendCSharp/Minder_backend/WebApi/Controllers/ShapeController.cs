using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace WebAPi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ShapeController(ShapeService shapeService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Update([FromBody] UpdateShapeRequest request)
    {
        await shapeService.UpdateShapeAsync(request);


        return Ok(new { message = "update shapes successfully!" });
    }
}