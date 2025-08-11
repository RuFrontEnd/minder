"use client";
import Core from "@/shapes/core";
import { tailwindColors } from "@/configs/colors";
import * as CommonTypes from "@/types/common";

export default class Process extends Core {
  type: CommonTypes.ShapeType.process = CommonTypes.ShapeType.process;

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, tailwindColors.shape.process, title);
  }

  static getPath(
    ctx: CanvasRenderingContext2D,
    p: CommonTypes.Vec,
    w: number,
    h: number,
    offset: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    const screenP = {
      x: (p.x + offset.x) * scale,
      y: (p.y + offset.y) * scale,
    };
    const scaleSize = {
      w: w * scale,
      h: h * scale,
    };

    ctx.save();
    ctx.translate(screenP.x, screenP.y);
    ctx.beginPath();
    ctx.fillRect(-scaleSize.w / 2, -scaleSize.h / 2, scaleSize.w, scaleSize.h);
    ctx.closePath();
    ctx.restore();
  }

  draw(
    ctx: CanvasRenderingContext2D,
    offset: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offset, scale, () => {
      Process.getPath(ctx, this.p, this.w, this.h, offset, scale);
    });
  }
}
