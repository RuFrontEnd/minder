import { Vec } from "@/types/shapes/common";

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

  constructor(w: number, h: number, c: string, p: Vec, deg: number) {
    this.w = w;
    this.h = h;
    this.c = c;
    this.p = p;
    this.deg = deg;
    this.__offset__ = this.initOffset;
    this.__scale__ = 1;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  set scale(value: number) {
    this.__scale__ = value;
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

  checkBoundry(p: Vec) {
    return (
      p.x >= this.p.x - this.w / 2 &&
      p.x <= this.p.x + this.w / 2 &&
      p.y >= this.p.y - this.h / 2 &&
      p.y <= this.p.y + this.h / 2
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    const scaleSize = this.getScaleSize();
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.rotate(this.deg);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, scaleSize.h / 2);
    ctx.lineTo(scaleSize.w / 2, scaleSize.h / 2);
    ctx.lineTo(0, -scaleSize.h / 2);
    ctx.lineTo(-scaleSize.w / 2, scaleSize.h / 2);
    ctx.lineTo(0, scaleSize.h / 2);
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }
}
