"use client";
import Core from "@/shapes/core";
import * as TerminatorTypes from "@/types/shapes/terminator";
import * as CommonTypes from "@/types/shapes/common";

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

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    if (this.getScaleSize().w >= this.getScaleSize().h) {
      let r = this.getScaleSize().h / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(-this.getScaleSize().w / 2 + r, 0, r, 0, 2 * Math.PI);
      ctx.arc(this.getScaleSize().w / 2 - r, 0, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(
        -this.getScaleSize().w / 2 + r,
        -r,
        this.getScaleSize().w - 2 * r,
        this.getScaleSize().h
      );
    } else if (this.getScaleSize().w < this.getScaleSize().h) {
      let r = this.getScaleSize().w / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(0, -this.getScaleSize().h / 2 + r, r, 0, 2 * Math.PI);
      ctx.arc(0, this.getScaleSize().h / 2 - r, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(
        -r,
        -this.getScaleSize().h / 2 + r,
        this.getScaleSize().w,
        this.getScaleSize().h - 2 * r
      );
    }

    ctx.restore();

    super.draw(ctx);
  }
}
