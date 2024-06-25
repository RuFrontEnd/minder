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
    super.draw(ctx, () => {
      if (this.getScreenSize().w >= this.getScreenSize().h) {
        let r = this.getScreenSize().h / 2;
        ctx.beginPath();
        ctx.arc(-this.getScreenSize().w / 2 + r, 0, r, 0, 2 * Math.PI);
        ctx.arc(this.getScreenSize().w / 2 - r, 0, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(
          -this.getScreenSize().w / 2 + r,
          -r,
          this.getScreenSize().w - 2 * r,
          this.getScreenSize().h
        );
      } else if (this.getScreenSize().w < this.getScreenSize().h) {
        let r = this.getScreenSize().w / 2;
        ctx.beginPath();
        ctx.arc(0, -this.getScreenSize().h / 2 + r, r, 0, 2 * Math.PI);
        ctx.arc(0, this.getScreenSize().h / 2 - r, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(
          -r,
          -this.getScreenSize().h / 2 + r,
          this.getScreenSize().w,
          this.getScreenSize().h - 2 * r
        );
      }
    });
  }
}
