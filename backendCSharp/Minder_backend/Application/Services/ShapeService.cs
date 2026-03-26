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
    public async Task<List<ShapeEntity.Info>?> GetAsync(Guid userId)
    {
        return await shapeRepository.GetShapeAsync(userId);
    }

    public async Task<ShapeResponseDTO?> GetWithCurvesAsync(Guid userId)
    {
        var shape = await shapeRepository.GetShapeWithCurvesAsync(userId);
        
        if (shape == null)
        {
            return null;
        }

        // Convert Info to ShapeInfoDTO
        var shapeDtos = shape.Infos.Select(info => new ShapeInfoDTO
        {
            id = info.id,
            title = info.title,
            w = info.w,
            h = info.h,
            p = new ShapePointDTO { x = info.p.x, y = info.p.y },
            importDatas = info.importDatas.Select(d => new ShapeDataDTO { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            usingDatas = info.usingDatas.Select(d => new ShapeDataDTO { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            deleteDatas = info.deleteDatas.Select(d => new ShapeDataDTO { Id = d.Id, Text = d.Text, Status = d.Status }).ToList(),
            type = info.type
        }).ToList();

        // Convert Curve to CurveDTO
        var curveDtos = shape.Curves.Select(curve => new CurveDTO
        {
            from = new CurveEndDTO { d = curve.from.d, shapeId = curve.from.shapeId },
            shape = new CurveShapeDTO
            {
                id = curve.shape.id,
                p1 = new CurvePointDTO { x = curve.shape.p1.x, y = curve.shape.p1.y },
                cp1 = new CurvePointDTO { x = curve.shape.cp1.x, y = curve.shape.cp1.y },
                cp2 = new CurvePointDTO { x = curve.shape.cp2.x, y = curve.shape.cp2.y },
                p2 = new CurvePointDTO { x = curve.shape.p2.x, y = curve.shape.p2.y },
                text = curve.shape.text
            },
            to = new CurveEndDTO { d = curve.to.d, shapeId = curve.to.shapeId }
        }).ToList();

        return new ShapeResponseDTO
        {
            shapes = shapeDtos,
            curves = curveDtos
        };
    }

    public async Task<bool> UpsertAsync(Guid userId, List<ShapeInfoDTO> infos, List<CurveDTO> curves = null)
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

        var entityCurves = new List<ShapeEntity.Curve>();
        if (curves != null && curves.Count > 0)
        {
            entityCurves = curves.Select(curve => new ShapeEntity.Curve
            {
                from = new ShapeEntity.CurveEnd { d = curve.from.d, shapeId = curve.from.shapeId },
                shape = new ShapeEntity.CurveShape
                {
                    id = curve.shape.id,
                    p1 = new ShapeEntity.CurvePoint { x = curve.shape.p1.x, y = curve.shape.p1.y },
                    cp1 = new ShapeEntity.CurvePoint { x = curve.shape.cp1.x, y = curve.shape.cp1.y },
                    cp2 = new ShapeEntity.CurvePoint { x = curve.shape.cp2.x, y = curve.shape.cp2.y },
                    p2 = new ShapeEntity.CurvePoint { x = curve.shape.p2.x, y = curve.shape.p2.y },
                    text = curve.shape.text
                },
                to = new ShapeEntity.CurveEnd { d = curve.to.d, shapeId = curve.to.shapeId }
            }).ToList();
        }

        var ShapeEntity = new ShapeEntity(exsistId ?? Guid.NewGuid(), userId, entityInfos);
        ShapeEntity.Curves = entityCurves;

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