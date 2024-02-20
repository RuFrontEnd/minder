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

  constructor(w: number, h: number, c: string, p: Vec, deg: number) {
    this.w = w;
    this.h = h;
    this.c = c;
    this.p = p;
    this.deg = deg;
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
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.save();
    ctx.translate(this.p.x, this.p.y);
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
