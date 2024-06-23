"use client";
import Core from "@/shapes/core";
import * as CommonTypes from "@/types/shapes/common";
import * as CoreTypes from "@/types/shapes/core";

export default class Process extends Core {
  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, "#AB44F4", title);
  }

  onDataChange = (
    _title: CommonTypes.Title,
    _selectedData: CommonTypes.Data,
    _deletedData: CommonTypes.Data
  ) => {
    this.title = _title;
    this.selectedData = _selectedData;
    this.deletedData = _deletedData;
  };

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, () => {
      const edge = this.getEdge();

      ctx.beginPath();
      ctx.fillRect(
        edge.l - this.getScreenP().x,
        edge.t - this.getScreenP().y,
        this.getScaleSize().w,
        this.getScaleSize().h
      );
      ctx.closePath();
    });
  }
}
