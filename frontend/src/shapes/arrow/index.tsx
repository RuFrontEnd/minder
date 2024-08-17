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

  getScreenP() {
    return {
      x: (this.p.x + this.__offset__.x) * this.__scale__,
      y: (this.p.y + this.__offset__.y) * this.__scale__,
    };
  }

  getPToOriginP(p: Vec) {
    return {
      x: p.x - this.p.x,
      y: p.y - this.p.y,
    };
  }

  getOriginPToP(p: Vec) {
    return {
      x: p.x + this.p.x,
      y: p.y + this.p.y,
    };
  }

  rotate(p: Vec) {
    return {
      x: p.x * Math.cos(this.deg) - p.y * Math.sin(this.deg),
      y: p.x * Math.sin(this.deg) + p.y * Math.cos(this.deg),
    };
  }

  getRotateP(p: Vec) {
    return this.getOriginPToP(this.rotate(this.getPToOriginP(p)));
  }

  getRotateVertex() {
    return {
      t: this.getOriginPToP(
        this.rotate(
          this.getPToOriginP({
            x: this.p.x,
            y: this.p.y - this.h,
          })
        )
      ),
      l: this.getOriginPToP(
        this.rotate(
          this.getPToOriginP({
            x: this.p.x - this.w / 2,
            y: this.p.y,
          })
        )
      ),
      r: this.getOriginPToP(
        this.rotate(
          this.getPToOriginP({
            x: this.p.x + this.w / 2,
            y: this.p.y,
          })
        )
      ),
    };
  }

  getRotateScreenP() {
    const rotateP = this.getRotateP({
      x: this.p.x + this.__offset__.x,
      y: this.p.y + this.__offset__.y,
    });
    return {
      x: rotateP.x * this.__scale__,
      y: rotateP.y * this.__scale__,
    };
  }

  getScaleSize() {
    return {
      w: this.w * this.__scale__,
      h: this.h * this.__scale__,
    };
  }

  getScreenVertex() {
    return {
      t: {
        x: (this.p.x + this.__offset__.x) * this.__scale__,
        y: (this.p.y - this.h + this.__offset__.y) * this.__scale__,
      },
      l: {
        x: (this.p.x - this.w / 2) * this.__scale__,
        y: (this.p.y + this.__offset__.y) * this.__scale__,
      },
      r: {
        x: (this.p.x + this.w / 2) * this.__scale__,
        y: (this.p.y + this.__offset__.y) * this.__scale__,
      },
    };
  }

  getRotateScreenVertex() {
    const rotateVertex = this.getRotateVertex();

    return {
      t: {
        x: (rotateVertex.t.x + this.__offset__.x) * this.__scale__,
        y: (rotateVertex.t.x + this.__offset__.y) * this.__scale__,
      },
      l: {
        x: (rotateVertex.l.x + this.__offset__.x) * this.__scale__,
        y: (rotateVertex.l.x + this.__offset__.y) * this.__scale__,
      },
      r: {
        x: (rotateVertex.r.x + this.__offset__.x) * this.__scale__,
        y: (rotateVertex.r.x + this.__offset__.y) * this.__scale__,
      },
    };
  }

  checkBoundry(screenP: Vec) {
    const p0 = this.getRotateP({
      x: this.p.x,
      y: this.p.y - this.h,
    });

    const p1 = this.getRotateP({
      x: this.p.x + this.w / 2,
      y: this.p.y,
    });

    const p2 = this.getRotateP({
      x: this.p.x - this.w / 2,
      y: this.p.y,
    });

    const vecs = [
      { x: p1.x - p0.x, y: p1.y - p0.y },
      { x: p2.x - p1.x, y: p2.y - p1.y },
      { x: p0.x - p2.x, y: p0.y - p2.y },
    ];

    const normalP = {
      x: screenP.x / this.__scale__ - this.__offset__.x,
      y: screenP.y / this.__scale__ - this.__offset__.y,
    };
    const target = [
      {
        x: normalP.x - p0.x,
        y: normalP.y - p0.y,
      },
      {
        x: normalP.x - p1.x,
        y: normalP.y - p1.y,
      },
      {
        x: normalP.x - p2.x,
        y: normalP.y - p2.y,
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
    const rotateScreenVertex = this.getRotateScreenVertex();

    if (
      Math.pow(screenP.x - rotateScreenVertex.t.x, 2) +
        Math.pow(screenP.y - rotateScreenVertex.t.y, 2) <
      Math.pow(5, 2)
    ) {
      return ArrowTypes.Vertex.t;
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scaleSize = this.getScaleSize();

    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

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
