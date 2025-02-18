"use client";
import { Vec } from "@/types/common";
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
        x: val.x,
        y: val.y - this.__h__,
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
        x: this.__p__.x,
        y: this.__p__.y - this.__h__,
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

  get scale() {
    return this.__scale__;
  }

  set selecting(value: boolean) {
    this.__selecting__ = value;
  }

  get vertex() {
    return this.__vertex__;
  }


  toPivot(p: Vec) {
    return {
      x: p.x - this.__p__.x,
      y: p.y - this.__p__.y,
    };
  }

  toOrigin(p: Vec) {
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

  getVtx(p: Vec, deg: number) {
    // move to origin and rotate then put back to original position
    return this.toOrigin(this.rotate(this.toPivot(p), deg));
  }

  checkBoundry(p: Vec) {
    const vecs = [
      {
        x: this.__vertex__.r.x - this.__vertex__.t.x,
        y: this.__vertex__.r.y - this.__vertex__.t.y,
      },
      {
        x: this.__vertex__.l.x - this.__vertex__.r.x,
        y: this.__vertex__.l.y - this.__vertex__.r.y,
      },
      {
        x: this.__vertex__.t.x - this.__vertex__.l.x,
        y: this.__vertex__.t.y - this.__vertex__.l.y,
      },
    ];

    const target = [
      {
        x: p.x - this.__vertex__.t.x,
        y: p.y - this.__vertex__.t.y,
      },
      {
        x: p.x - this.__vertex__.r.x,
        y: p.y - this.__vertex__.r.y,
      },
      {
        x: p.x - this.__vertex__.l.x,
        y: p.y - this.__vertex__.l.y,
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

  checkControlPointsBoundry(p: Vec) {
    if (!this.__selecting__) return null;

    if (
      Math.pow(p.x - this.__vertex__.t.x, 2) +
        Math.pow(p.y - this.__vertex__.t.y, 2) <
      Math.pow(5, 2)
    ) {
      return ArrowTypes.Vertex.t;
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D, offest: Vec = { x: 0, y: 0 }, scale: number = 1) {
    const scaleSize = {
      w: this.__w__*scale,
      h: this.__h__*scale,
    };

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
  }
}
