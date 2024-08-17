import { Vec } from "@/types/shapes/common";
import * as ArrowTypes from "@/types/shapes/arrow";
import { tailwindColors } from "@/variables/colors";

export default class Arrow {
  private initOffset = {
    x: 0,
    y: 0,
  };
  w: number;
  h: number;
  c: string;
  p: Vec;
  deg: number;
  protected __offset__: Vec;
  protected __scale__: number;
  protected __selecting__: boolean; // TODO: not be used yet

  constructor(w: number, h: number, c: string, p: Vec, deg: number) {
    this.w = w;
    this.h = h;
    this.c = c;
    this.p = p;
    this.deg = deg;
    this.__offset__ = this.initOffset;
    this.__scale__ = 1;
    this.__selecting__ = false;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  set scale(value: number) {
    this.__scale__ = value;
  }

  set selecting(value: boolean) {
    this.__selecting__ = value;
  }

  getScaleSize() {
    return {
      w: this.w * this.__scale__,
      h: this.h * this.__scale__,
    };
  }

  getScreenP() {
    return {
      x: (this.p.x + this.__offset__.x) * this.__scale__,
      y: (this.p.y + this.__offset__.y) * this.__scale__,
    };
  }

  getRelativeP(p: Vec) {
    return {
      x: p.x - this.p.x,
      y: p.y - this.p.y,
    };
  }

  // first
  relativify(p: Vec, isScreened: boolean) {
    // normal p or screen p

    if (isScreened) {
      p.x = p.x / this.__scale__ - this.__offset__.x;
      p.y = p.y / this.__scale__ - this.__offset__.y;
    }

    return {
      x: p.x - this.p.x,
      y: p.y - this.p.y,
    };
  }

  // second
  rotate(relativeP: Vec) {
    return {
      x: relativeP.x * Math.cos(this.deg) - relativeP.y * Math.sin(this.deg),
      y: relativeP.x * Math.sin(this.deg) + relativeP.y * Math.cos(this.deg),
    };
  }

  // third
  screenfy(normalP: Vec) {
    return {
      x: (normalP.x + this.__offset__.x) * this.__scale__,
      y: (normalP.y + this.__offset__.y) * this.__scale__,
    };
  }

  getVertex() {
    return {
      t: {
        x: this.p.x,
        y: this.p.y - this.h,
      },
      l: {
        x: this.p.x - this.w / 2,
        y: this.p.y,
      },
      r: {
        x: this.p.x + this.w / 2,
        y: this.p.y,
      },
    };
  }

  checkBoundry(screenP: Vec) {
    const relativeScreenP = this.screenfy(this.relativify(screenP, true));
    const vertex = this.getVertex();
    const relativeRotateScreenVertex = {
      t: this.screenfy(this.rotate(this.relativify(vertex.t, false))),
      l: this.screenfy(this.rotate(this.relativify(vertex.l, false))),
      r: this.screenfy(this.rotate(this.relativify(vertex.r, false))),
    };

    const vecs = [
      {
        x: relativeRotateScreenVertex.r.x - relativeRotateScreenVertex.t.x,
        y: relativeRotateScreenVertex.r.y - relativeRotateScreenVertex.t.y,
      },
      {
        x: relativeRotateScreenVertex.l.x - relativeRotateScreenVertex.r.x,
        y: relativeRotateScreenVertex.l.y - relativeRotateScreenVertex.r.y,
      },
      {
        x: relativeRotateScreenVertex.t.x - relativeRotateScreenVertex.l.x,
        y: relativeRotateScreenVertex.t.y - relativeRotateScreenVertex.l.y,
      },
    ];

    const target = [
      {
        x: relativeScreenP.x - relativeRotateScreenVertex.t.x,
        y: relativeScreenP.y - relativeRotateScreenVertex.t.y,
      },
      {
        x: relativeScreenP.x - relativeRotateScreenVertex.r.x,
        y: relativeScreenP.y - relativeRotateScreenVertex.r.y,
      },
      {
        x: relativeScreenP.x - relativeRotateScreenVertex.l.x,
        y: relativeScreenP.y - relativeRotateScreenVertex.l.y,
      },
    ];

    const cross1 = vecs[0].x * target[0].y - vecs[0].y * target[0].x;
    const cross2 = vecs[1].x * target[1].y - vecs[1].y * target[1].x;
    const cross3 = vecs[2].x * target[2].y - vecs[2].y * target[2].x;

    return (
      (cross1 > 0 && cross2 > 0 && cross3 > 0) ||
      (cross1 < 0 && cross2 < 0 && cross3 < 0)
    );
  }

  checkControlPointsBoundry(screenP: Vec) {
    const relativeP = this.relativify(screenP, true);
    const vertex = this.getVertex();
    const relativeRotateVertex = {
      t: this.rotate(this.relativify(vertex.t, false)),
    };

    if (
      Math.pow(relativeP.x - relativeRotateVertex.t.x, 2) +
        Math.pow(relativeP.y - relativeRotateVertex.t.y, 2) <
      Math.pow(5, 2)
    ) {
      return ArrowTypes.Vertex.t;
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scaleSize = this.getScaleSize();

    const screenP = this.screenfy(this.p);

    ctx.save();
    ctx.translate(screenP.x, screenP.y);

    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.rotate(this.deg);
    ctx.moveTo(-scaleSize.w / 2, 0);
    ctx.lineTo(0, -scaleSize.h);
    ctx.lineTo(scaleSize.w / 2, 0);
    ctx.lineTo(-scaleSize.w / 2, 0);
    ctx.fill();
    ctx.closePath();

    if (this.__selecting__) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = tailwindColors?.info["500"];
      ctx.fillStyle = tailwindColors?.white["500"];

      ctx.beginPath();
      ctx.arc(0, -scaleSize.h, 5, 0, 2 * Math.PI, true); // cp1 control point
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }
}
