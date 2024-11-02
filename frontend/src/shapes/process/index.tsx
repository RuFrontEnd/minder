"use client";
import Core from "@/shapes/core";
import * as CommonTypes from "@/types/common";
import * as CoreTypes from "@/types/shapes/core";

export default class Process extends Core {
  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, "#AB44F4", title);
  }

  onDataChange = (
    _title: CommonTypes.Title,
    _selectedData: CommonTypes.Data,
    _deletedData: CommonTypes.Data
  ) => {
    this.title = _title;
    this.selectedData = _selectedData;
    this.deletedData = _deletedData;
  };

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offest, scale, () => {
      const screenP = this.getP(offest, scale);
      const scaleSize = this.getScaleSize(scale);

      ctx.save();
      ctx.translate(screenP.x, screenP.y);
      ctx.beginPath();
      ctx.fillRect(
        -scaleSize.w / 2,
        -scaleSize.h / 2,
        scaleSize.w,
        scaleSize.h
      );
      ctx.closePath();
      ctx.restore();
    });
  }
}
