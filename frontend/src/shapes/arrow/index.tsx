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
  private __p__: Vec;
  private __deg__: number;
  private __vertex__: {
    t: Vec;
    l: Vec;
    r: Vec;
  };
  protected __offset__: Vec;
  protected __scale__: number;
  protected __selecting__: boolean; // TODO: not be used yet

  constructor(w: number, h: number, c: string, p: Vec, deg: number) {
    // TODO: add id
    this.w = w;
    this.h = h;
    this.c = c;
    this.__p__ = p;
    this.__vertex__ = {
      t: this.getVtx({ x: p.x, y: p.y - h }, deg),
      l: this.getVtx(
        {
          x: p.x - w / 2,
          y: p.y,
        },
        deg
      ),
      r: this.getVtx(
        {
          x: p.x + w / 2,
          y: p.y,
        },
        deg
      ),
    };
    this.__deg__ = deg;
    this.__offset__ = this.initOffset;
    this.__scale__ = 1;
    this.__selecting__ = false;
  }

  set p(val: Vec) {
    this.__p__ = val;
    this.__vertex__.t = this.getVtx(
      {
        x: val.x - this.h,
        y: val.y,
      },
      this.__deg__
    );
    this.__vertex__.l = this.getVtx(
      {
        x: val.x - this.w / 2,
        y: val.y,
      },
      this.__deg__
    );
    this.__vertex__.r = this.getVtx(
      {
        x: val.x + this.w / 2,
        y: val.y,
      },
      this.__deg__
    );
  }

  set deg(val: number) {
    this.__deg__ = val;
    this.__vertex__.t = this.getVtx(
      {
        x: this.__p__.x - this.h,
        y: this.__p__.y,
      },
      val
    );
    this.__vertex__.l = this.getVtx(
      {
        x: this.__p__.x - this.w / 2,
        y: this.__p__.y,
      },
      val
    );
    this.__vertex__.r = this.getVtx(
      {
        x: this.__p__.x + this.w / 2,
        y: this.__p__.y,
      },
      val
    );
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

  scalify(val: number) {
    return val * this.__scale__;
  }

  // first
  relativify(p: Vec) {
    return {
      x: p.x - this.__p__.x,
      y: p.y - this.__p__.y,
    };
  }

  correct(p: Vec) {
    return {
      x: p.x + this.__p__.x,
      y: p.y + this.__p__.y,
    };
  }

  // second
  rotate(relativeP: Vec, deg: number) {
    return {
      x: relativeP.x * Math.cos(deg) - relativeP.y * Math.sin(deg),
      y: relativeP.x * Math.sin(deg) + relativeP.y * Math.cos(deg),
    };
  }

  // third
  screenfy(normalP: Vec) {
    return {
      x: this.scalify(normalP.x + this.__offset__.x),
      y: this.scalify(normalP.y + this.__offset__.y),
    };
  }

  getVertex() {
    return {
      t: {
        x: this.__p__.x,
        y: this.__p__.y - this.h,
      },
      l: {
        x: this.__p__.x - this.w / 2,
        y: this.__p__.y,
      },
      r: {
        x: this.__p__.x + this.w / 2,
        y: this.__p__.y,
      },
    };
  }

  getVtx(p: Vec, deg: number) {
    return this.correct(this.rotate(this.relativify(p), deg));
  }

  checkBoundry(screenP: Vec) {
    const relativeScreenP = this.screenfy(this.relativify(screenP));
    const relativeScreenVertex = {
      t: this.screenfy(this.relativify(this.__vertex__.t)),
      l: this.screenfy(this.relativify(this.__vertex__.l)),
      r: this.screenfy(this.relativify(this.__vertex__.r)),
    };

    const vecs = [
      {
        x: relativeScreenVertex.r.x - relativeScreenVertex.t.x,
        y: relativeScreenVertex.r.y - relativeScreenVertex.t.y,
      },
      {
        x: relativeScreenVertex.l.x - relativeScreenVertex.r.x,
        y: relativeScreenVertex.l.y - relativeScreenVertex.r.y,
      },
      {
        x: relativeScreenVertex.t.x - relativeScreenVertex.l.x,
        y: relativeScreenVertex.t.y - relativeScreenVertex.l.y,
      },
    ];

    const target = [
      {
        x: relativeScreenP.x - relativeScreenVertex.t.x,
        y: relativeScreenP.y - relativeScreenVertex.t.y,
      },
      {
        x: relativeScreenP.x - relativeScreenVertex.r.x,
        y: relativeScreenP.y - relativeScreenVertex.r.y,
      },
      {
        x: relativeScreenP.x - relativeScreenVertex.l.x,
        y: relativeScreenP.y - relativeScreenVertex.l.y,
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
    const relativeP = this.relativify(screenP);
    const vertex = this.getVertex();
    const relativeRotateVertex = {
      t: this.rotate(this.relativify(vertex.t), this.__deg__),
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
    const scaleSize = {
      w: this.scalify(this.w),
      h: this.scalify(this.h),
    };

    const screenP = this.screenfy(this.__p__);

    ctx.save();
    ctx.translate(screenP.x, screenP.y);

    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.rotate(this.__deg__);
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
