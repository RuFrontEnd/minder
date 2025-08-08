"use client";
import Core from "@/shapes/core";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";

export default class Procedure extends Core {
  type: CommonTypes.ShapeType.procedure = CommonTypes.ShapeType.procedure;
  shapes: CommonTypes.Shapes[];
  connectionCurves: CommonTypes.ConnectionCurves;

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, tailwindColors.shape.procedure, title);
    this.shapes = [];
    this.connectionCurves = [];
  }

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1,
    getPath: (
      ctx: CanvasRenderingContext2D,
      p: CommonTypes.Vec,
      w: number,
      h: number,
      offset: CommonTypes.Vec,
      scale: number
    ) => void
  ) {
    super.draw(ctx, offest, scale, () => {
      getPath(ctx, this.p, this.w, this.h, offest, scale);
    });
  }
}
