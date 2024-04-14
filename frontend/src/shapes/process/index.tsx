"use client";
import Core from "@/shapes/core";
import * as CommonTypes from "@/types/shapes/common";


export default class Process extends Core {
  constructor(id: CommonTypes.Id, w: CommonTypes.W, h: CommonTypes.H, p: CommonTypes.Vec, title: CommonTypes.Title) {
    super(id, w, h, p, "#AB44F4", title);
  }

  onDataChange = (title: CommonTypes.Title, data: CommonTypes.Data) => {
    this.title = title;
    this.selectedData = data;
  };

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    const isAlert = this.redundancies.length > 0
    let renderC = isAlert ? "#EC3333" : this.c
    ctx.fillStyle = renderC;

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

    super.draw(ctx);
  }
}
