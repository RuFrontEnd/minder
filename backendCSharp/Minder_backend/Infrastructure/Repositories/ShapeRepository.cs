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
            var id = await dbContext.Step
                    .Where(shape => shape.ProjectId == projectId)
                    .Select(shape => shape.Id)
                    .FirstOrDefaultAsync();

            return id == Guid.Empty ? null : id;
        }

        public async Task<ShapeEntity?> GetShapeAsync(Guid projectId)
        {
            var shape = await dbContext.Step
                .Where(s => s.ProjectId == projectId)
                .FirstOrDefaultAsync();

            return shape;
        }
        public async Task<ShapeEntity> AddShapeAsync(ShapeEntity shape)
        {
            await dbContext.Step.AddAsync(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }
        public async Task<ShapeEntity> UpdateShapeAsync(ShapeEntity shape)
        {
            dbContext.Step.Update(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }
    }

}
