using Microsoft.AspNetCore.Mvc;
using Application.Services;
using Application.DTOs;

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

    // GET: api/<ValuesController>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> Get(Guid userId)
    {
        var result = await _projectService.GetAllProjectsAsync(userId);
        return Ok(result);
    }

    // GET api/<ValuesController>/5
    [HttpGet("{id}")]
    public string Get(int id)
    {
        return "value";
    }
}

