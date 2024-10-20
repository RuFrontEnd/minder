"use client";
import Core from "@/shapes/core";
import * as CommonTypes from "@/types/common";
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


  onDataChange(
    _title: CommonTypes.Title,
    _selectedData: CommonTypes.Data,
    _deletedData: CommonTypes.Data
  ) {
    this.title = _title;
    this.selectedData = _selectedData;
    this.deletedData = _deletedData;
  }

  draw(ctx: CanvasRenderingContext2D,offest:CommonTypes.Vec={x:0, y:0}, scale:number = 0) {
    super.draw(ctx, offest, scale,() => {
      const screenP = this.getScreenP(offest, scale)
      const x1 = -this.getScaleSize(scale).w / 2,
        y1 = 0;
      const x2 = 0,
        y2 = this.getScaleSize(scale).h / 2;
      const x3 = this.getScaleSize(scale).w / 2,
        y3 = 0;
      const x4 = 0,
        y4 = -this.getScaleSize(scale).h / 2;

        ctx.save()
        ctx.translate(screenP.x, screenP.y)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.closePath();
      ctx.fill();
      ctx.restore()
    });
  }

  // drawCurve(ctx: CanvasRenderingContext2D): void {
  //   super.drawCurve(ctx);
  //   ctx.save();
  //   ctx.translate(this.getScreenP().x, this.getScreenP().y);

  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";
  //   ctx.font = `${14 * this.__scale__}px Arial`;

  //   const curve_l = this.curves.l[0],
  //     curve_t = this.curves.t[0],
  //     curve_r = this.curves.r[0],
  //     curve_b = this.curves.b[0];
  //   if (
  //     curve_l &&
  //     curve_l.shape?.p1 &&
  //     curve_l.shape?.cp1 &&
  //     curve_l.shape?.cp2 &&
  //     curve_l.shape?.p2 &&
  //     this.text.l
  //   ) {
  //     const bezierPoint = curve_l.shape.getBezierP(0.5, [
  //       curve_l.shape.p1,
  //       curve_l.shape.cp1,
  //       curve_l.shape.cp2,
  //       curve_l.shape.p2,
  //     ]);
  //     ctx.fillStyle = "#F6F7FA";
  //     ctx.beginPath();
  //     ctx.arc(
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__,
  //       10 * this.__scale__,
  //       0,
  //       2 * Math.PI,
  //       false
  //     );
  //     ctx.fill();
  //     ctx.closePath();

  //     ctx.fillStyle = "black";
  //     ctx.fillText(
  //       this.text.l,
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__ + 2
  //     );
  //   }
  //   if (
  //     curve_t &&
  //     curve_t.shape?.p1 &&
  //     curve_t.shape?.cp1 &&
  //     curve_t.shape?.cp2 &&
  //     curve_t.shape?.p2 &&
  //     this.text.t
  //   ) {
  //     const bezierPoint = curve_t.shape.getBezierP(0.5, [
  //       curve_t.shape.p1,
  //       curve_t.shape.cp1,
  //       curve_t.shape.cp2,
  //       curve_t.shape.p2,
  //     ]);
  //     ctx.fillStyle = "#F6F7FA";
  //     ctx.beginPath();
  //     ctx.arc(
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__,
  //       10 * this.__scale__,
  //       0,
  //       2 * Math.PI,
  //       false
  //     );
  //     ctx.fill();
  //     ctx.closePath();

  //     ctx.fillStyle = "black";
  //     ctx.fillText(
  //       this.text.t,
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__ + 2
  //     );
  //   }
  //   if (
  //     curve_r &&
  //     curve_r.shape?.p1 &&
  //     curve_r.shape?.cp1 &&
  //     curve_r.shape?.cp2 &&
  //     curve_r.shape?.p2 &&
  //     this.text.r
  //   ) {
  //     const bezierPoint = curve_r.shape.getBezierP(0.5, [
  //       curve_r.shape.p1,
  //       curve_r.shape.cp1,
  //       curve_r.shape.cp2,
  //       curve_r.shape.p2,
  //     ]);
  //     ctx.fillStyle = "#F6F7FA";
  //     ctx.beginPath();
  //     ctx.arc(
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__,
  //       10 * this.__scale__,
  //       0,
  //       2 * Math.PI,
  //       false
  //     );
  //     ctx.fill();
  //     ctx.closePath();

  //     ctx.fillStyle = "black";
  //     ctx.fillText(
  //       this.text.r,
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__ + 2
  //     );
  //   }
  //   if (
  //     curve_b &&
  //     curve_b.shape?.p1 &&
  //     curve_b.shape?.cp1 &&
  //     curve_b.shape?.cp2 &&
  //     curve_b.shape?.p2 &&
  //     this.text.b
  //   ) {
  //     const bezierPoint = curve_b.shape.getBezierP(0.5, [
  //       curve_b.shape.p1,
  //       curve_b.shape.cp1,
  //       curve_b.shape.cp2,
  //       curve_b.shape.p2,
  //     ]);
  //     ctx.fillStyle = "#F6F7FA";
  //     ctx.beginPath();
  //     ctx.arc(
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__,
  //       10 * this.__scale__,
  //       0,
  //       2 * Math.PI,
  //       false
  //     );
  //     ctx.fill();
  //     ctx.closePath();

  //     ctx.fillStyle = "black";
  //     ctx.fillText(
  //       this.text.b,
  //       bezierPoint.x * this.__scale__,
  //       bezierPoint.y * this.__scale__ + 2
  //     );
  //   }

  //   ctx.restore();
  // }
}
