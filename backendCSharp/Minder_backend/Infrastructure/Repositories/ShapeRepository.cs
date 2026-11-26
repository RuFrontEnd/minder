using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ShapeRepository(ApplicationDbContext dbContext) : IShapeRepository
    {
        public async Task<Guid?> ExsistAsync(Guid projectId)
        {
            var id = await dbContext.Steps
                    .Where(shape => shape.ProjectId == projectId)
                    .Select(shape => shape.Id)
                    .FirstOrDefaultAsync();

            return id == Guid.Empty ? null : id;
        }

        public async Task<StepEntity?> GetShapeAsync(Guid projectId)
        {
            var shape = await dbContext.Steps
                .Where(s => s.ProjectId == projectId)
                .Include(s => s.Status)
                .FirstOrDefaultAsync();

            return shape;
        }

        public Task<StepEntity?> GetStepAsync(
            Guid projectId,
            Guid stepId,
            CancellationToken cancellationToken)
        {
            return dbContext.Steps
                .Include(step => step.Status)
                .FirstOrDefaultAsync(
                    step => step.ProjectId == projectId && step.Id == stepId,
                    cancellationToken);
        }

        public Task<StatusEntity?> GetStatusAsync(
            Guid statusId,
            CancellationToken cancellationToken)
        {
            return dbContext.Statuses.FirstOrDefaultAsync(
                status => status.Id == statusId,
                cancellationToken);
        }

        public Task<List<StepEntity>> GetStepsAsync(
            Guid projectId,
            CancellationToken cancellationToken)
        {
            return dbContext.Steps
                .Where(step => step.ProjectId == projectId)
                .Include(step => step.Status)
                .OrderBy(step => step.Id)
                .ToListAsync(cancellationToken);
        }

        public Task<List<StepDependencyEntity>> GetStepDependenciesAsync(
            Guid projectId,
            CancellationToken cancellationToken)
        {
            return dbContext.StepDependencies
                .Where(dependency => dbContext.Steps.Any(step =>
                    step.Id == dependency.StepId && step.ProjectId == projectId))
                .OrderBy(dependency => dependency.StepId)
                .ThenBy(dependency => dependency.DependsOnStepId)
                .ToListAsync(cancellationToken);
        }

        public async Task<StepDependencyEntity> AddStepDependencyAsync(
            StepDependencyEntity dependency,
            CancellationToken cancellationToken)
        {
            await dbContext.StepDependencies.AddAsync(dependency, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return dependency;
        }

        public async Task<bool> DeleteStepDependencyAsync(
            Guid projectId,
            Guid stepId,
            Guid dependsOnStepId,
            CancellationToken cancellationToken)
        {
            var dependency = await dbContext.StepDependencies.FirstOrDefaultAsync(
                item => item.StepId == stepId &&
                    item.DependsOnStepId == dependsOnStepId &&
                    dbContext.Steps.Any(step =>
                        step.Id == item.StepId && step.ProjectId == projectId) &&
                    dbContext.Steps.Any(step =>
                        step.Id == item.DependsOnStepId && step.ProjectId == projectId),
                cancellationToken);
            if (dependency is null) return false;

            dbContext.StepDependencies.Remove(dependency);
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task<StepEntity> AddShapeAsync(
            StepEntity shape,
            CancellationToken cancellationToken)
        {
            await dbContext.Steps.AddAsync(shape, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            await dbContext.Entry(shape)
                .Reference(step => step.Status)
                .LoadAsync(cancellationToken);
            return shape;
        }
        public async Task<StepEntity> UpdateShapeAsync(StepEntity shape)
        {
            dbContext.Steps.Update(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }

        public async Task<bool> DeleteStepAsync(
            Guid projectId,
            Guid stepId,
            CancellationToken cancellationToken)
        {
            var step = await dbContext.Steps.FirstOrDefaultAsync(
                item => item.ProjectId == projectId && item.Id == stepId,
                cancellationToken);
            if (step is null) return false;

            dbContext.Steps.Remove(step);
            await dbContext.SaveChangesAsync(cancellationToken);
            return true;
        }
    }

}
