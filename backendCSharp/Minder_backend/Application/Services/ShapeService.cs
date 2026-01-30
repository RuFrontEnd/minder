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
    public async Task<bool> UpsertAsync(Guid userId, List<ShapeInfoDTO> infos)
    {
        // 1. 檢查 Email 是否已被註冊 (Business Rule)
        var exsistId = await shapeRepository.ExsistAsync(userId);

        var entityInfos = infos.Select(info => new ShapeEntity.Info
        {
            id = info.id,
            title = info.title,
            w = info.w,
            h = info.h,
            type = info.type,
            p = new ShapeEntity.P { x = info.p.x, y = info.p.y },
            importDatas = info.importDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            usingDatas = info.usingDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            deleteDatas = info.deleteDatas.Select(d => new ShapeEntity.Data { Id = d.Id, Text = d.Text, Status = d.Status }).ToList()
        }).ToList();

        var ShapeEntity = new ShapeEntity(exsistId ?? Guid.NewGuid(), userId, entityInfos);

        if (exsistId == null)
        {
            await shapeRepository.AddShapeAsync(ShapeEntity);
        }
        else
        {
            await shapeRepository.UpdateShapeAsync(ShapeEntity);
        }

        return true;
    }
}