using Domain.Entities;

namespace Domain.Repositories
{
    public interface IShapeRepository
    {
        Task<Guid?> ExsistAsync(Guid userId);
        // Return the ShapeEntity for the given user. Infos/Curves were removed from the entity,
        // so repository returns the entity itself.
        Task<ShapeEntity?> GetShapeAsync(Guid userId);
        Task<ShapeEntity> AddShapeAsync(ShapeEntity shape);
        Task<ShapeEntity> UpdateShapeAsync(ShapeEntity shape);
    }
}
