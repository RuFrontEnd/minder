using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;

namespace Application.Services;

public class ProjectService(IProjectRepository projectRepository)
{
    public async Task<IEnumerable<ProjectDTO>> GetAllProjectsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var projects = await projectRepository.GetProjectsAsync(userId, cancellationToken);

        return projects.Select(project =>
            new ProjectDTO(project.Id, project.UserId, project.Name));
    }

    public async Task<ProjectDTO?> GetProjectAsync(
        Guid projectId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var project = await projectRepository.GetProjectAsync(projectId, userId, cancellationToken);
        return project is null
            ? null
            : new ProjectDTO(project.Id, project.UserId, project.Name);
    }

    public async Task<ProjectDTO> CreateProjectAsync(
        Guid userId,
        string name,
        CancellationToken cancellationToken)
    {
        var project = new ProjectEntity(Guid.NewGuid(), userId, name.Trim());
        var createdProject = await projectRepository.AddProjectAsync(project, cancellationToken);
        return new ProjectDTO(createdProject.Id, createdProject.UserId, createdProject.Name);
    }

    public async Task<ProjectDTO?> UpdateProjectNameAsync(
        Guid projectId,
        Guid userId,
        string name,
        CancellationToken cancellationToken)
    {
        var project = await projectRepository.UpdateProjectNameAsync(
            projectId, userId, name.Trim(), cancellationToken);
        return project is null
            ? null
            : new ProjectDTO(project.Id, project.UserId, project.Name);
    }
};