using Application.DTOs;
using Domain.Entities;
using Domain.Provider;
using Domain.Repositories;
using Infrastructure.Persistence;
using Infrastructure.Provider;
using System.Text.Json;

namespace Application.Services;

public class ShapeService(ApplicationDbContext dbContext, IShapeRepository shapeRepository)
{
    public async Task<ShapeEntity?> GetAsync(Guid userId)
    {
        return await shapeRepository.GetShapeAsync(userId);
    }
}