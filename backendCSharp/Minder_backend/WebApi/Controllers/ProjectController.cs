using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;
using Domain.Repositories;
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

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProjectDTO>> Update(
        Guid id,
        [FromBody] UpdateProjectRequest request,
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

        var project = await _projectService.UpdateProjectNameAsync(
            id,
            userId,
            request.Name,
            cancellationToken);

        return project is null ? NotFound() : Ok(project);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdValue, out var userId)) return Unauthorized();

        var deleted = await _projectService.DeleteProjectAsync(
            id,
            userId,
            cancellationToken);

        return deleted ? NoContent() : NotFound();
    }

    [Authorize]
    [HttpPost("{id:guid}/members")]
    public async Task<IActionResult> AddMember(
        Guid id,
        [FromBody] AddProjectMemberRequest request,
        CancellationToken cancellationToken)
    {
        var requesterIdValue = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(requesterIdValue, out var requesterId))
        {
            return Unauthorized();
        }

        var result = await _projectService.AddMemberAsync(
            id,
            requesterId,
            request.UserId,
            cancellationToken);

        return result switch
        {
            AddProjectMemberResult.Added => NoContent(),
            AddProjectMemberResult.AlreadyMember => Conflict(new
            {
                message = "User is already a member of this project."
            }),
            AddProjectMemberResult.UserNotFound => NotFound(new
            {
                message = "User not found."
            }),
            _ => NotFound(new
            {
                message = "Project not found or current user is not the owner."
            })
        };
    }

    [Authorize]
    [HttpGet("{id:guid}/members")]
    public async Task<ActionResult<IEnumerable<ProjectMemberDTO>>> GetMembers(
        Guid id,
        CancellationToken cancellationToken)
    {
        var requesterIdValue = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(requesterIdValue, out var requesterId))
        {
            return Unauthorized();
        }

        var members = await _projectService.GetMembersAsync(
            id,
            requesterId,
            cancellationToken);
        return members is null ? NotFound() : Ok(members);
    }

    [Authorize]
    [HttpDelete("{id:guid}/members/{userId:guid}")]
    public async Task<IActionResult> RemoveMember(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var requesterIdValue = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(requesterIdValue, out var requesterId))
        {
            return Unauthorized();
        }

        var result = await _projectService.RemoveMemberAsync(
            id,
            requesterId,
            userId,
            cancellationToken);

        return result switch
        {
            RemoveProjectMemberResult.Removed => NoContent(),
            RemoveProjectMemberResult.MemberNotFound => NotFound(new
            {
                message = "Project member not found."
            }),
            RemoveProjectMemberResult.CannotRemoveOwner => BadRequest(new
            {
                message = "The project owner cannot be removed."
            }),
            _ => NotFound(new
            {
                message = "Project not found or current user is not the owner."
            })
        };
    }
}
