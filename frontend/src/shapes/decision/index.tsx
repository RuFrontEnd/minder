"use client";
import Core from "@/shapes/core";
import {
  Vec,
  Id,
  W,
  H,
  C,
  Title,
  Direction,
  Data as DataType,
} from "@/types/shapes/common";
import { ConnectTarget } from "@/types/shapes/core";

export default class Desicion extends Core {
  text: {
    l: null | "Y" | "N";
    t: null | "Y" | "N";
    r: null | "Y" | "N";
    b: null | "Y" | "N";
  };

  constructor(id: Id, w: W, h: H, p: Vec, c: C) {
    super(id, w, h, p, c);
    this.text = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
  }

  getNumberOfCurves = () => {
    let ds = [Direction.l, Direction.t, Direction.r, Direction.b],
      time = 0;

    ds.forEach((d) => {
      if (this.curves[d]) {
        time++;
      }
    });

    return time;
  };

  onMouseUp(p: Vec, sender?: ConnectTarget) {
    super.onMouseUp(p, sender, {
      l: { x: -10, y: 0 },
      t: { x: 0, y: -10 },
      r: { x: 10, y: 0 },
      b: { x: 0, y: 10 },
    });
  }

  onMouseDown(canvas: HTMLCanvasElement, p: Vec) {
    super.onMouseDown(canvas, p);

    // define curve text
    const currentText = this.getNumberOfCurves() < 2 ? "Y" : "N";
    if (this.checkCurveTriggerBoundry(p) === Direction.l) {
      this.text.l = currentText;
    } else if (this.checkCurveTriggerBoundry(p) === Direction.t) {
      this.text.t = currentText;
    } else if (this.checkCurveTriggerBoundry(p) === Direction.r) {
      this.text.r = currentText;
    } else if (this.checkCurveTriggerBoundry(p) === Direction.b) {
      this.text.b = currentText;
    }
  }

  onDataChange = (title: Title, data: DataType) => {
    this.title = title;
    this.selectedData = data;
  };

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;
    const x1 = -this.getScaleSize().w / 2,
      y1 = 0;
    const x2 = 0,
      y2 = this.getScaleSize().h / 2;
    const x3 = this.getScaleSize().w / 2,
      y3 = 0;
    const x4 = 0,
      y4 = -this.getScaleSize().h / 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    super.draw(ctx, this.getNumberOfCurves() < 2);

    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${14 * this.__scale__}px Arial`;

    if (
      this.curves.l &&
      this.curves.l.shape?.p1 &&
      this.curves.l.shape?.cp1 &&
      this.curves.l.shape?.cp2 &&
      this.curves.l.shape?.p2 &&
      this.text.l
    ) {
      const bezierPoint = this.curves.l.shape.getBezierPoint(0.5, [
        this.curves.l.shape.p1,
        this.curves.l.shape.cp1,
        this.curves.l.shape.cp2,
        this.curves.l.shape.p2,
      ]);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__,
        10 * this.__scale__,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fillText(
        this.text.l,
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__ + 2
      );
    }
    if (
      this.curves.t &&
      this.curves.t.shape?.p1 &&
      this.curves.t.shape?.cp1 &&
      this.curves.t.shape?.cp2 &&
      this.curves.t.shape?.p2 &&
      this.text.t
    ) {
      const bezierPoint = this.curves.t.shape.getBezierPoint(0.5, [
        this.curves.t.shape.p1,
        this.curves.t.shape.cp1,
        this.curves.t.shape.cp2,
        this.curves.t.shape.p2,
      ]);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__,
        10 * this.__scale__,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fillText(
        this.text.t,
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__ + 2
      );
    }
    if (
      this.curves.r &&
      this.curves.r.shape?.p1 &&
      this.curves.r.shape?.cp1 &&
      this.curves.r.shape?.cp2 &&
      this.curves.r.shape?.p2 &&
      this.text.r
    ) {
      const bezierPoint = this.curves.r.shape.getBezierPoint(0.5, [
        this.curves.r.shape.p1,
        this.curves.r.shape.cp1,
        this.curves.r.shape.cp2,
        this.curves.r.shape.p2,
      ]);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__,
        10 * this.__scale__,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fillText(
        this.text.r,
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__ + 2
      );
    }
    if (
      this.curves.b &&
      this.curves.b.shape?.p1 &&
      this.curves.b.shape?.cp1 &&
      this.curves.b.shape?.cp2 &&
      this.curves.b.shape?.p2 &&
      this.text.b
    ) {
      const bezierPoint = this.curves.b.shape.getBezierPoint(0.5, [
        this.curves.b.shape.p1,
        this.curves.b.shape.cp1,
        this.curves.b.shape.cp2,
        this.curves.b.shape.p2,
      ]);
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__,
        10 * this.__scale__,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.closePath();

      ctx.fillStyle = "black";
      ctx.fillText(
        this.text.b,
        bezierPoint.x * this.__scale__,
        bezierPoint.y * this.__scale__ + 2
      );
    }

    ctx.restore();
  }
}
