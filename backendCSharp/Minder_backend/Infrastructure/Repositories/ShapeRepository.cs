using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ShapeRepository(ApplicationDbContext dbContext) : IShapeRepository
    {
        public async Task<Guid?> ExsistAsync(Guid userId)
        {
            var id = await dbContext.Shape
                    .Where(shape => shape.UserId == userId)
                    .Select(shape => shape.Id)
                    .FirstOrDefaultAsync();

            return id == Guid.Empty ? null : id;
        }
        //public async Task GetShapeAsync(Guid userId)
        //{

        //}
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
