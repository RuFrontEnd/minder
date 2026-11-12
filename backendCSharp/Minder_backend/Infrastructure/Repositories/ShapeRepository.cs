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
                .FirstOrDefaultAsync();

            return shape;
        }

        public Task<StepEntity?> GetStepAsync(
            Guid projectId,
            Guid stepId,
            CancellationToken cancellationToken)
        {
            return dbContext.Steps.FirstOrDefaultAsync(
                step => step.ProjectId == projectId && step.Id == stepId,
                cancellationToken);
        }

        public async Task<StepEntity> AddShapeAsync(
            StepEntity shape,
            CancellationToken cancellationToken)
        {
            await dbContext.Steps.AddAsync(shape, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return shape;
        }
        public async Task<StepEntity> UpdateShapeAsync(StepEntity shape)
        {
            dbContext.Steps.Update(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }
    }

}
