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
};