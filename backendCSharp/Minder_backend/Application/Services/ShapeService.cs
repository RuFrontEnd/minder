using Application.DTOs;
using Domain.Entities;
using Domain.Repositories;
using Domain.Provider;
using Infrastructure.Persistence;
using Infrastructure.Provider;

namespace Application.Services;

public class ShapeService(ApplicationDbContext dbContext, IShapeRepository shapeRepository)
{
    public async Task<bool> UpdateShapeAsync(UpdateShapeRequest updateShapeRequest)
    {
        // 1. 檢查 Email 是否已被註冊 (Business Rule)
        var exists = await shapeRepository.ExsistAsync(updateShapeRequest.userId);

        var entityInfos = updateShapeRequest.Infos.Select(dto => new ShapeEntity.Info
        {
            id = dto.id,
            title = dto.title,
            w = dto.w,
            h = dto.h,
            c = dto.c,
            status = dto.status,
            type = dto.type,
            p = new ShapeEntity.P { x = dto.p.x, y = dto.p.y },
            importDatas = dto.importDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            usingDatas = dto.usingDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            deleteDatas = dto.deleteDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList()
        }).ToList();

        var ShapeEntity = new ShapeEntity(updateShapeRequest.userId, entityInfos);

        if (exists)
        {
            await shapeRepository.UpdateShapeAsync(ShapeEntity);
        }
        else
        {
            await shapeRepository.AddShapeAsync(ShapeEntity);
        }

        return true;
    }
}