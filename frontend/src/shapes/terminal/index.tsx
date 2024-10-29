"use client";
import Core from "@/shapes/core";
import * as TerminatorTypes from "@/types/shapes/terminator";
import * as CommonTypes from "@/types/common";

export default class Terminal extends Core {
  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, "#FFB100", title);
  }

  onDataChange = (title: CommonTypes.Title) => {
    this.title = title;
  };

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offest, scale, () => {
      const scaleSize = this.getScaleSize(scale);
      const screenP = this.getP(offest, scale);

      ctx.save();
      ctx.translate(screenP.x, screenP.y);
      if (scaleSize.w >= scaleSize.h) {
        let r = scaleSize.h / 2;
        ctx.beginPath();
        ctx.arc(-scaleSize.w / 2 + r, 0, r, 0, 2 * Math.PI);
        ctx.arc(scaleSize.w / 2 - r, 0, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(
          -scaleSize.w / 2 + r,
          -r,
          scaleSize.w - 2 * r,
          scaleSize.h
        );
        ctx.closePath();
      } else if (scaleSize.w < scaleSize.h) {
        let r = scaleSize.w / 2;
        ctx.beginPath();
        ctx.moveTo(screenP.x, screenP.y);
        ctx.arc(0, -scaleSize.h / 2 + r, r, 0, 2 * Math.PI);
        ctx.arc(0, scaleSize.h / 2 - r, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(
          -r,
          -scaleSize.h / 2 + r,
          scaleSize.w,
          scaleSize.h - 2 * r
        );
        ctx.closePath();
      }
      ctx.restore();
    });
  }
}
