"use client";
import { Vec } from "@/types/shapes/common";
import { tailwindColors } from "@/variables/colors";
import * as ArrowTypes from "@/types/shapes/arrow";
export default class Arrow {
  private __id__: string;
  private __w__: number;
  private __h__: number;
  private __c__: string;
  private __lineWidth__: number;
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

  constructor(
    id: string,
    w: number,
    h: number,
    c: string,
    p: Vec,
    deg: number
  ) {
    // TODO: add id
    this.__id__ = id;
    this.__w__ = w;
    this.__h__ = h;
    this.__c__ = c;
    this.__lineWidth__ = 1;
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
    this.__offset__ = {
      x: 0,
      y: 0,
    };
    this.__scale__ = 1;
    this.__selecting__ = false;
  }

  set p(val: Vec) {
    this.__p__ = val;
    this.__vertex__.t = this.getVtx(
      {
        x: val.x - this.__h__,
        y: val.y,
      },
      this.__deg__
    );
    this.__vertex__.l = this.getVtx(
      {
        x: val.x - this.__w__ / 2,
        y: val.y,
      },
      this.__deg__
    );
    this.__vertex__.r = this.getVtx(
      {
        x: val.x + this.__w__ / 2,
        y: val.y,
      },
      this.__deg__
    );
  }

  set deg(val: number) {
    this.__deg__ = val;
    this.__vertex__.t = this.getVtx(
      {
        x: this.__p__.x - this.__h__,
        y: this.__p__.y,
      },
      val
    );
    this.__vertex__.l = this.getVtx(
      {
        x: this.__p__.x - this.__w__ / 2,
        y: this.__p__.y,
      },
      val
    );
    this.__vertex__.r = this.getVtx(
      {
        x: this.__p__.x + this.__w__ / 2,
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

  get vertex() {
    return this.__vertex__;
  }

  scalify(val: number) {
    return val * this.__scale__;
  }

  deScalify(val: number) {
    return val / this.__scale__;
  }

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

  rotate(relativeP: Vec, deg: number) {
    return {
      x: relativeP.x * Math.cos(deg) - relativeP.y * Math.sin(deg),
      y: relativeP.x * Math.sin(deg) + relativeP.y * Math.cos(deg),
    };
  }

  screenfy(normalP: Vec) {
    return {
      x: this.scalify(normalP.x + this.__offset__.x),
      y: this.scalify(normalP.y + this.__offset__.y),
    };
  }

  deScreenfy(screenP: Vec) {
    return {
      x: this.deScalify(screenP.x) - this.__offset__.x,
      y: this.deScalify(screenP.y) - this.__offset__.y,
    };
  }

  getVertex() {
    return {
      t: {
        x: this.__p__.x,
        y: this.__p__.y - this.__h__,
      },
      l: {
        x: this.__p__.x - this.__w__ / 2,
        y: this.__p__.y,
      },
      r: {
        x: this.__p__.x + this.__w__ / 2,
        y: this.__p__.y,
      },
    };
  } // TOOD: should be replaced by getVtx

  getVtx(p: Vec, deg: number) {
    // move to origin and rotate then put back to original position
    return this.correct(this.rotate(this.relativify(p), deg));
  }

  checkBoundry(screenP: Vec) {
    const relativeP = this.relativify(this.deScreenfy(screenP));
    const relativeVertex = {
      t: this.relativify(this.__vertex__.t),
      l: this.relativify(this.__vertex__.l),
      r: this.relativify(this.__vertex__.r),
    };

    const vecs = [
      {
        x: relativeVertex.r.x - relativeVertex.t.x,
        y: relativeVertex.r.y - relativeVertex.t.y,
      },
      {
        x: relativeVertex.l.x - relativeVertex.r.x,
        y: relativeVertex.l.y - relativeVertex.r.y,
      },
      {
        x: relativeVertex.t.x - relativeVertex.l.x,
        y: relativeVertex.t.y - relativeVertex.l.y,
      },
    ];

    const target = [
      {
        x: relativeP.x - relativeVertex.t.x,
        y: relativeP.y - relativeVertex.t.y,
      },
      {
        x: relativeP.x - relativeVertex.r.x,
        y: relativeP.y - relativeVertex.r.y,
      },
      {
        x: relativeP.x - relativeVertex.l.x,
        y: relativeP.y - relativeVertex.l.y,
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
    if (!this.__selecting__) return null;
    const relativeP = this.relativify(this.deScreenfy(screenP));
    const relativeVertex = {
      t: this.relativify(this.__vertex__.t),
      l: this.relativify(this.__vertex__.l),
      r: this.relativify(this.__vertex__.r),
    };

    if (
      Math.pow(relativeP.x - relativeVertex.t.x, 2) +
        Math.pow(relativeP.y - relativeVertex.t.y, 2) <
      Math.pow(5, 2)
    ) {
      return ArrowTypes.Vertex.t;
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scaleSize = {
      w: this.scalify(this.__w__),
      h: this.scalify(this.__h__),
    };

    const screenP = this.screenfy(this.__p__);

    ctx.save();
    ctx.translate(screenP.x, screenP.y);

    ctx.beginPath();
    ctx.fillStyle = this.__c__;
    ctx.rotate(this.__deg__);
    ctx.moveTo(-scaleSize.w / 2, 0);
    ctx.lineTo(0, -scaleSize.h);
    ctx.lineTo(scaleSize.w / 2, 0);
    ctx.lineTo(-scaleSize.w / 2, 0);
    ctx.fill();
    ctx.closePath();

    if (this.__selecting__) {
      ctx.lineWidth = this.__lineWidth__;
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
