"use client";
import Core from "@/shapes/core";
import {
  Vec,
  Id,
  W,
  H,
  C,
  Title,
  Data as DataType,
} from "@/types/shapes/common";
import { ConnectTarget } from "@/types/shapes/core";

export default class Process extends Core {
  constructor(id: Id, w: W, h: H, p: Vec, c: C) {
    super(id, w, h, p, c);
  }

  onDataChange = (title: Title, data: DataType) => {
    this.title = title;
    this.selectedData = data;
  };

  onMouseUp(p: Vec, sender?: ConnectTarget) {
    super.onMouseUp(p, sender, {
      l: { x: -10, y: 0 },
      t: { x: 0, y: -10 },
      r: { x: 10, y: 0 },
      b: { x: 0, y: 10 },
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getOffsetP().x, this.getOffsetP().y);
    ctx.fillStyle = this.c;

    const edge = this.getEdge();

    ctx.beginPath();
    ctx.fillRect(
      edge.l - this.getOffsetP().x,
      edge.t - this.getOffsetP().y,
      this.w,
      this.h
    );
    ctx.closePath();

    ctx.restore();

    super.draw(
      ctx,
      !this.curves.l && !this.curves.t && !this.curves.r && !this.curves.b
    );
  }
}
