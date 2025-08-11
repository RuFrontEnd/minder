"use client";
import Core from "@/shapes/core";
import { tailwindColors } from "@/configs/colors";
import * as CommonTypes from "@/types/common";

export default class Procedure extends Core {
  type: CommonTypes.ShapeType.procedure = CommonTypes.ShapeType.procedure;
  private __shapes__: CommonTypes.Shapes;
  private __connectionCurves__: CommonTypes.ConnectionCurves;
  private getPath:
    | undefined
    | ((
        ctx: CanvasRenderingContext2D,
        p: CommonTypes.Vec,
        w: number,
        h: number,
        offset: CommonTypes.Vec,
        scale: number
      ) => void);

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title,
    shapes: CommonTypes.Shapes = [],
    connectionCurves: CommonTypes.ConnectionCurves = [],
    getPath:
      | undefined
      | ((
          ctx: CanvasRenderingContext2D,
          p: CommonTypes.Vec,
          w: number,
          h: number,
          offset: CommonTypes.Vec,
          scale: number
        ) => void) = undefined
  ) {
    super(id, w, h, p, tailwindColors.shape.procedure, title);
    this.__shapes__ = shapes;
    this.__connectionCurves__ = connectionCurves;
    this.getPath = getPath;
  }

  set shapes(value: CommonTypes.Shapes) {
    this.__shapes__ = value;
  }

  get shapes() {
    return this.__shapes__;
  }

  set connectionCurves(value: CommonTypes.ConnectionCurves) {
    this.__connectionCurves__ = value;
  }

  get connectionCurves() {
    return this.__connectionCurves__;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offest, scale, () => {
      if (!this.getPath) return;
      this.getPath(ctx, this.p, this.w, this.h, offest, scale);
    });
  }
}
