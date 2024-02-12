import { Vec } from "@/types/shapes/common";

export default class Arrow {
  w: number;
  h: number;
  c?: string;

  constructor(w: number, h: number, c?: string) {
    this.w = w;
    this.h = h;
    this.c = c;
  }

  draw(ctx: CanvasRenderingContext2D, p: Vec, deg?: number) {
    ctx.beginPath();
    ctx.fillStyle = this.c ? this.c : "black";
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(deg ? deg : 0);
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
