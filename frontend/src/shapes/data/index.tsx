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

export default class Data extends Core {
  isFrameOpen: boolean;
  title: Title;
  data: DataType;
  frameOffset: number;

  constructor(id: Id, w: W, h: H, p: Vec, c: C) {
    super(id, w, h, p, c);
    this.isFrameOpen = false;
    this.title = "";
    this.data = [];
    this.frameOffset = 20;
  }

  onDataChange = (title: Title, data: DataType) => {
    this.title = title;
    this.data = data;
  };

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.p.x, this.p.y);
    ctx.fillStyle = this.c;

    const x1 = -this.w / 2 + this.frameOffset,
      y1 = -this.h / 2,
      x2 = this.w / 2,
      y2 = -this.h / 2,
      x3 = this.w / 2 - this.frameOffset,
      y3 = this.h / 2,
      x4 = -this.w / 2,
      y4 = this.h / 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    super.draw(ctx);
  }
}
