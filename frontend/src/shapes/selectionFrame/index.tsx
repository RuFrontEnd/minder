"use client";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import Core from "@/shapes/core";

export default class SelectionFrame {
  private id: string;
  private c: {
    fill: string;
    stroke: string;
  } = {
    fill: tailwindColors.selectionFrame.fill,
    stroke: tailwindColors.selectionFrame.stroke,
  };
  private __p__: {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
  };
  private m: CommonTypes.Vec = { x: 0, y: 0 };
  private __shapes__: Core[] = [];

  constructor(id: string, p: { start: CommonTypes.Vec; end: CommonTypes.Vec }) {
    this.id = id;
    this.__p__ = p;
  }

  set p(p: { start: CommonTypes.Vec; end: CommonTypes.Vec }) {
    this.__p__ = p;
    this.m = {
      x: (this.__p__.start.x + this.__p__.end.x) / 2,
      y: (this.__p__.start.y + this.__p__.end.y) / 2,
    };
  }

  get p (){
    return this.__p__;
  }

  set shapes(_shapes: Core[]) {
    this.shapes = _shapes;
  }

  push(shape: Core) {
    this.__shapes__.push(shape);
  }

  drag(endP: CommonTypes.Vec) {
    this.__p__.end = endP;
  }

  move(offset: CommonTypes.Vec) {
    this.__shapes__.forEach((shape) => {
      shape.move(offset);
    });
  }

  locate(p: { x: null | number; y: null | number }) {
    if (!p.x && !p.y) return;
    const offsetP = { x: 0, y: 0 };

    if (!!p.x) {
      offsetP.x = p.x - this.m.x;
    }

    if (!!p.y) {
      offsetP.y = p.y - this.m.y;
    }

    this.__shapes__.forEach((shape) => {
      shape.move(offsetP);
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx?.beginPath();

    ctx.fillStyle = this.c.fill;
    ctx.fillRect(
      this.p?.start.x,
      this.p?.start.y,
      this.p?.end.x - this.p?.start.x,
      this.p?.end.y - this.p?.start.y
    );

    ctx.strokeStyle = this.c.stroke;
    ctx.strokeRect(
      this.p?.start.x,
      this.p?.start.y,
      this.p?.end.x - this.p?.start.x,
      this.p?.end.y - this.p?.start.y
    );

    ctx?.closePath();
  }
}
