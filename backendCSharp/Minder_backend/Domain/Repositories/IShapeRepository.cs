using Domain.Entities;

namespace Domain.Repositories
{
    public interface IShapeRepository
    {
        Task <Guid?>ExsistAsync(Guid userId);
        Task <List<ShapeEntity.Info>?>GetShapeAsync(Guid userId);
        Task <ShapeEntity?>GetShapeWithCurvesAsync(Guid userId);
        Task <ShapeEntity>AddShapeAsync(ShapeEntity shape);
        Task <ShapeEntity>UpdateShapeAsync(ShapeEntity shape);
    }
}
