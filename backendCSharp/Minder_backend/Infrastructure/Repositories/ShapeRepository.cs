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
        public async Task<StepEntity> AddShapeAsync(StepEntity shape)
        {
            await dbContext.Steps.AddAsync(shape);
            await dbContext.SaveChangesAsync();
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
