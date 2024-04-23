"use client";
import Core from "@/shapes/core";
import * as CommonTypes from "@/types/shapes/common";
import * as DecisionTypes from "@/types/shapes/decision";

const ds = [
  CommonTypes.Direction.l,
  CommonTypes.Direction.t,
  CommonTypes.Direction.r,
  CommonTypes.Direction.b,
];
export default class Desicion extends Core {
  text: {
    l: DecisionTypes.Text;
    t: DecisionTypes.Text;
    r: DecisionTypes.Text;
    b: DecisionTypes.Text;
  };

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, "#5468E9", title);
    this.text = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
  }

  getText() {
    let numOfText = 0,
      _y = false,
      _n = false;

    ds.forEach((d) => {
      if (numOfText === 2) return;
      if (this.text[d] === "Y") {
        _y = true;
      } else if (this.text[d] === "N") {
        _n = true;
      }
    });

    const output: {
      y: boolean;
      n: boolean;
      text: DecisionTypes.Text;
    } = {
      y: _y,
      n: _n,
      text: _y && _n ? null : _y ? "N" : "Y",
    };

    return output;
  }

  createCurve(id: string, d: CommonTypes.Direction) {
    super.createCurve(id, d);

    // define curve text
    const currentText = this.getText().text;

    if (!currentText) return;

    this.text[d] = currentText;
  }

  removeCurve(d: CommonTypes.Direction) {
    super.removeCurve(d);

    this.text[d] = null;
  }

  onDataChange(title: CommonTypes.Title, data: CommonTypes.Data) {
    this.title = title;
    this.selectedData = data;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    const isAlert = this.redundancies.length > 0
    let renderC = isAlert ? "#EC3333" : this.c
    ctx.fillStyle = renderC;
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

    super.draw(ctx);
  }

  drawCurve(ctx: CanvasRenderingContext2D): void {
    super.drawCurve(ctx);
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
      ctx.fillStyle = "#F6F7FA";
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
      ctx.fillStyle = "#F6F7FA";
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
      ctx.fillStyle = "#F6F7FA";
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
      ctx.fillStyle = "#F6F7FA";
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
