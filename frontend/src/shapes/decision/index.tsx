// TODO: need static getPath method
"use client";
import Core from "@/shapes/core";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import * as DecisionTypes from "@/types/shapes/decision";

export default class Desicion extends Core {
  type: CommonTypes.ShapeType.decision = CommonTypes.ShapeType.decision;

  text: {
    l: DecisionTypes.Text;
    t: DecisionTypes.Text;
    r: DecisionTypes.Text;
    b: DecisionTypes.Text;
  };

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, tailwindColors.shape.decision, title);
    this.text = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
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
      const x1 = -scaleSize.w / 2,
        y1 = 0;
      const x2 = 0,
        y2 = scaleSize.h / 2;
      const x3 = scaleSize.w / 2,
        y3 = 0;
      const x4 = 0,
        y4 = -scaleSize.h / 2;

      ctx.save();
      ctx.translate(screenP.x, screenP.y);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }
}
