using Application.DTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPi.Controllers;

[Authorize]
[ApiController]
[Route("api/steps/{stepId:guid}/messages")]
public sealed class MessageController(MessageService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MessageResponse>>> Get(Guid stepId, CancellationToken ct)
    {
        var result = await service.GetAsync(stepId, UserId(), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:guid}", Name = nameof(GetMessageById))]
    public async Task<ActionResult<MessageResponse>> GetMessageById(Guid stepId, Guid id, CancellationToken ct)
    {
        var result = await service.GetAsync(stepId, id, UserId(), ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MessageResponse>> Create(Guid stepId, CreateMessageRequest request, CancellationToken ct)
    {
        var result = await service.CreateAsync(stepId, UserId(), request, ct);
        return result is null ? NotFound() : CreatedAtAction(nameof(GetMessageById), new { stepId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MessageResponse>> Update(Guid stepId, Guid id, UpdateMessageRequest request, CancellationToken ct)
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
