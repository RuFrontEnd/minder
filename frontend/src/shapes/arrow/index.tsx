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
  __offset__: Vec;

  constructor(w: number, h: number, c: string, p: Vec, deg: number) {
    this.w = w;
    this.h = h;
    this.c = c;
    this.p = p;
    this.deg = deg;
    this.__offset__ = this.initOffset;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  getScreenP() {
    return {
      x: this.p.x + this.__offset__.x,
      y: this.p.y + this.__offset__.y,
    };
  }

  checkBoundry(p: Vec) {
    return (
      p.x >= this.getScreenP().x - this.w / 2 &&
      p.x <= this.getScreenP().x + this.w / 2 &&
      p.y >= this.getScreenP().y - this.h / 2 &&
      p.y <= this.getScreenP().y + this.h / 2
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.rotate(this.deg);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.h / 2);
    ctx.lineTo(this.w / 2, this.h / 2);
    ctx.lineTo(0, -this.h / 2);
    ctx.lineTo(-this.w / 2, this.h / 2);
    ctx.lineTo(0, this.h / 2);
    ctx.fill();
    ctx.restore();
    ctx.closePath();
  }
}
