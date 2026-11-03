using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace WebAPi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProjectController : ControllerBase
{
    // 1. 定義一個私有欄位
    private readonly ProjectService _projectService;

    // 2. 在建構函式中賦值
    public ProjectController(ProjectService projectServer)
    {
        _projectService = projectServer;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectDTO>>> Get(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var result = await _projectService.GetAllProjectsAsync(userId, cancellationToken);
        return Ok(result);
    }

    [Authorize]
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    public async Task<ActionResult<ProjectDTO>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var project = await _projectService.GetProjectAsync(id, userId, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ProjectDTO>> Create(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Invalid project name.",
                Detail = "Project name must not be empty.",
                Status = StatusCodes.Status400BadRequest
            });
        }

        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var project = await _projectService.CreateProjectAsync(
            userId,
            request.Name,
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }
}
