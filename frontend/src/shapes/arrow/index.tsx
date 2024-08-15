import { Vec } from "@/types/shapes/common";
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

  getScaleSize() {
    return {
      w: this.w * this.__scale__,
      h: this.h * this.__scale__,
    };
  }

  checkBoundry(screenP: Vec) {
    // TODO: rotate condition should be considered
    const p0 = { x: this.p.x, y: this.p.y - this.h };
    const p1 = { x: this.p.x + this.w / 2, y: this.p.y };
    const p2 = { x: this.p.x - this.w / 2, y: this.p.y };

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

    console.log("this.__scale__", this.__scale__);
    console.log("normalP", normalP);
    console.log("target", target);

    const cross1 = vecs[0].x * target[0].y - vecs[0].y * target[0].x;
    const cross2 = vecs[1].x * target[1].y - vecs[1].y * target[1].x;
    const cross3 = vecs[2].x * target[2].y - vecs[2].y * target[2].x;

    console.log("cross1", cross1);
    console.log("cross2", cross2);
    console.log("cross3", cross3);

    return (
      (cross1 > 0 && cross2 > 0 && cross3 > 0) ||
      (cross1 < 0 && cross2 < 0 && cross3 < 0)
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scaleSize = this.getScaleSize();
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.rotate(this.deg);
    ctx.moveTo(-scaleSize.w / 2, 0);
    ctx.lineTo(0, -scaleSize.h);
    ctx.lineTo(scaleSize.w / 2, 0);
    ctx.lineTo(-scaleSize.w / 2, 0);
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }
}
