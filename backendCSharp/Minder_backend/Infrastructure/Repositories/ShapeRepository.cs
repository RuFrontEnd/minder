using Domain.Entities;
using Domain.Repositories;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class ShapeRepository(ApplicationDbContext dbContext) : IShapeRepository
    {
        public async Task<bool> ExsistAsync(Guid userId)
        {
            var isExist = await dbContext.Shape.AnyAsync(shape => shape.UserId == userId);
            return isExist;
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
