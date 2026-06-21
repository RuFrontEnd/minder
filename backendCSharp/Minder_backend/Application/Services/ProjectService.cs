using Application.DTOs;
using Domain.Repositories;
using Infrastructure.Persistence;

namespace Application.Services;

public class ProjectService(ApplicationDbContext context, IProjectRepository projectRepository)
{
    public async Task<IEnumerable<ProjectDTO>> GetAllProjectsAsync(Guid userId)
    {
        var projects = await projectRepository.GetProjectsAsync(userId);

        if (projects == null) return null;

        // 將 Domain Entity 轉換為 DTO
        return projects.Select(user => new ProjectDTO
        {
            Id = user.Id,
            UserId = user.UserId,
        });
    }

    public async Task<ProjectDTO> GetProjectAsync(Guid projectId)
    {
        var project = await projectRepository.GetProjectAsync(projectId);
        if (project == null) return null;
        // 將 Domain Entity 轉換為 DTO
        return new ProjectDTO
        {
            Id = project.Id,
            UserId = project.UserId,
        };
    }
};