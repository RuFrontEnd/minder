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
            var id = await dbContext.Shape
                    .Where(shape => shape.ProjectId == projectId)
                    .Select(shape => shape.Id)
                    .FirstOrDefaultAsync();

            return id == Guid.Empty ? null : id;
        }

        public async Task<ShapeEntity?> GetShapeAsync(Guid projectId)
        {
            // Infos and Curves were removed from ShapeEntity.
            // Return the whole entity for the given userId.
            var shape = await dbContext.Shape
                .Where(s => s.ProjectId == projectId)
                .FirstOrDefaultAsync();

            return shape;
        }
        public async Task<ShapeEntity> AddShapeAsync(ShapeEntity shape)
        {
            await dbContext.Shape.AddAsync(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }
        public async Task<ShapeEntity> UpdateShapeAsync(ShapeEntity shape)
        {
            dbContext.Shape.Update(shape);
            await dbContext.SaveChangesAsync();
            return shape;
        }
    }

}
