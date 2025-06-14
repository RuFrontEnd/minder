"use client";
import Core from "@/shapes/core";
import { tailwindColors } from "@/variables/colors";
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

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offest, scale, () => {
      const screenP = {
        x: (this.p.x + offest.x) * scale,
        y: (this.p.y + offest.y) * scale,
      };
      const scaleSize = {
        w: this.w * scale,
        h: this.h * scale,
      };

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
