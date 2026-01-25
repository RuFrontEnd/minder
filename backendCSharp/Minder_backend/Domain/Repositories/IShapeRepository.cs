using Domain.Entities;

namespace Domain.Repositories
{
    public interface IShapeRepository
    {
        Task <Guid?>ExsistAsync(Guid userId);
        //Task <ShapeEntity?>GetShapeAsync(Guid userId);
        Task <ShapeEntity> AddShapeAsync(ShapeEntity shape);
        Task <ShapeEntity>UpdateShapeAsync(ShapeEntity shape);
    }
}
