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
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    const edge = this.getEdge();

    ctx.beginPath();
    ctx.fillRect(
      edge.l - this.getScreenP().x,
      edge.t - this.getScreenP().y,
      this.getScaleSize().w,
      this.getScaleSize().h
    );
    ctx.closePath();

    ctx.restore();

    super.draw(
      ctx,
      !this.curves.l.shape && !this.curves.t.shape && !this.curves.r.shape && !this.curves.b.shape
    );
  }
}
