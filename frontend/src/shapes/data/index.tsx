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

  onDataChange = (title: Title, data: DataType, selectedData: DataType) => {
    this.title = title;
    this.data = data;
    this.selectedData = selectedData
  };

  onMouseUp(p: Vec, sender?: ConnectTarget) {
    super.onMouseUp(p, sender, {
      l: { x: 0, y: 0 },
      t: { x: 0, y: -10 },
      r: { x: 0, y: 0 },
      b: { x: 0, y: 10 },
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    const x1 = -this.getScaleSize().w / 2 + this.frameOffset,
      y1 = -this.getScaleSize().h / 2,
      x2 = this.getScaleSize().w / 2,
      y2 = -this.getScaleSize().h / 2,
      x3 = this.getScaleSize().w / 2 - this.frameOffset,
      y3 = this.getScaleSize().h / 2,
      x4 = -this.getScaleSize().w / 2,
      y4 = this.getScaleSize().h / 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    super.draw(
      ctx,
      !this.curves.l.shape && !this.curves.t.shape && !this.curves.r.shape && !this.curves.b.shape
    );
  }
}
