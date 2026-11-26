using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPi.Controllers;

[Authorize]
[ApiController]
[Route("api/steps/{stepId:guid}/tasks")]
public sealed class TaskController(TaskService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TaskResponse>>> Get(Guid stepId, CancellationToken ct)
    {
        var result = await service.GetAsync(stepId, UserId(), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:guid}", Name = nameof(GetTaskById))]
    public async Task<ActionResult<TaskResponse>> GetTaskById(Guid stepId, Guid id, CancellationToken ct)
    {
        var result = await service.GetAsync(stepId, id, UserId(), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create(Guid stepId, CreateTaskRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(stepId, UserId(), request, ct);
        return result is null ? NotFound() : CreatedAtAction(nameof(GetTaskById), new { stepId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> Update(Guid stepId, Guid id, UpdateTaskRequest request, CancellationToken ct)
    {
        var result = await service.UpdateAsync(stepId, id, UserId(), request, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid stepId, Guid id, CancellationToken ct) =>
        await service.DeleteAsync(stepId, id, UserId(), ct) ? NoContent() : NotFound();

    private Guid UserId() => Guid.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id)
        ? id : Guid.Empty;
}
