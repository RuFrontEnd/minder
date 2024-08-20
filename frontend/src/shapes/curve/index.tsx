"use client";
import Arrow from "@/shapes/arrow";
import { Vec } from "@/types/shapes/common";
import { tailwindColors } from "@/variables/colors";
import * as CurveTypes from "@/types/shapes/curve";

const threshold = 5;
export default class Curve {
  private initOffset = {
    x: 0,
    y: 0,
  };
  private initScale = 1;
  id: string;
  cpline: CurveTypes.Line;
  curve: CurveTypes.Line;
  controlPoint: {
    c: string;
    strokeC: string;
    r: number;
  };
  radius: number;
  p1: Vec;
  __p2__: Vec;
  cp1: Vec;
  __cp2__: Vec;
  arrow: null | Arrow;
  private __selecting__: boolean;
  protected __offset__: Vec;
  protected __scale__: number;

  constructor(id: string, p1: Vec, cp1: Vec, cp2: Vec, p2: Vec) {
    this.id = id;
    this.cpline = {
      w: 1,
      c: tailwindColors?.info["500"] || "#000000",
    };
    this.curve = {
      w: 1,
      c: "#333333",
    };
    this.controlPoint = {
      c: tailwindColors?.white["500"],
      strokeC: tailwindColors?.info["500"],
      r: 5,
    };
    this.radius = 10;
    this.p1 = p1;
    this.cp1 = cp1;
    this.__cp2__ = cp2;
    this.__p2__ = p2;
    this.arrow = new Arrow(
      `arrow_${Date.now()}`,
      12,
      12,
      "#333333",
      {
        x: this.getRelativeP(this.__p2__).x,
        y: this.getRelativeP(this.__p2__).y,
      },
      Math.atan2(this.__p2__.y - this.cp2.y, this.__p2__.x - this.cp2.x) +
        90 * (Math.PI / 180)
    );
    this.__selecting__ = false;
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
  }

  get selecting() {
    return this.__selecting__;
  }

  set selecting(val) {
    this.__selecting__ = val;
    if (this.arrow) {
      this.arrow.selecting = val;
    }
  }

  get p2() {
    return this.__p2__;
  }

  set p2(value: Vec) {
    this.__p2__ = value;
    if (this.arrow && value && this.cp2) {
      this.arrow.p = this.getRelativeP(value);
    }
  }

  get cp2() {
    return this.__cp2__;
  }

  set cp2(value: Vec) {
    this.__cp2__ = value;
    if (this.arrow && value && this.cp2) {
      this.arrow.deg =
        Math.atan2(this.cp2.y - this.p2.y, this.cp2.x - this.p2.x) -
        90 * (Math.PI / 180);
    }
  }

  set offset(value: Vec) {
    this.__offset__ = value;

    if (this.arrow && value && this.cp2) {
      this.arrow.offset = value;
      this.arrow.p = value;
    }
  }

  set scale(value: number) {
    this.__scale__ = value;

    if (this.arrow && value && this.cp2) {
      this.arrow.scale = value;
    }
  }

  getScreenP() {
    return {
      p1: {
        x: (this.p1.x + this.__offset__.x) * this.__scale__,
        y: (this.p1.y + this.__offset__.y) * this.__scale__,
      },
      cp1: {
        x: (this.cp1.x + this.__offset__.x) * this.__scale__,
        y: (this.cp1.y + this.__offset__.y) * this.__scale__,
      },
      cp2: {
        x: (this.cp2.x + this.__offset__.x) * this.__scale__,
        y: (this.cp2.y + this.__offset__.y) * this.__scale__,
      },
      p2: {
        x: (this.__p2__.x + this.__offset__.x) * this.__scale__,
        y: (this.__p2__.y + this.__offset__.y) * this.__scale__,
      },
    };
  }

  getRelativeP(p: Vec) {
    return {
      x: p.x - this.p1.x,
      y: p.y - this.p1.y,
    };
  }

  getRelativeScreenP(screenP: Vec) {
    return {
      x: screenP.x - (this.p1.x + this.__offset__.x) * this.__scale__,
      y: screenP.y - (this.p1.y + this.__offset__.y) * this.__scale__,
    };
  }

  getArrowP(screenP: Vec) {
    const relativeScreenP = {
      p: this.getRelativeScreenP(screenP),
      p1: this.getRelativeScreenP(this.getScreenP().p1),
    };

    return {
      x: relativeScreenP.p.x - relativeScreenP.p1.x,
      y: relativeScreenP.p.y - relativeScreenP.p1.y,
    };
  }

  getScaleCurveW() {
    return this.curve.w * this.__scale__;
  }

  correct(normalP: Vec) {
    return {
      x: normalP.x + this.p1.x,
      y: normalP.y + this.p1.y,
    };
  }

  getBezierPoint(t: number, controlPoints: Vec[]) {
    const x =
      Math.pow(1 - t, 3) * controlPoints[0].x +
      3 * Math.pow(1 - t, 2) * t * controlPoints[1].x +
      3 * (1 - t) * Math.pow(t, 2) * controlPoints[2].x +
      Math.pow(t, 3) * controlPoints[3].x;

    const y =
      Math.pow(1 - t, 3) * controlPoints[0].y +
      3 * Math.pow(1 - t, 2) * t * controlPoints[1].y +
      3 * (1 - t) * Math.pow(t, 2) * controlPoints[2].y +
      Math.pow(t, 3) * controlPoints[3].y;

    return { x, y };
  }

  // Get the distance between two points
  getDistance(point1: Vec, point2: Vec) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if a point is close to the Bezier curve
  getIsPointNearBezierCurve(point: Vec, threshold: number) {
    for (let t = 0; t <= 1; t += 0.01) {
      if (!this.p1 || !this.cp1 || !this.cp2 || !this.p2) return false;
      const bezierPoint = this.getBezierPoint(t, [
        { x: 0, y: 0 },
        this.getScreenP().cp1,
        this.getScreenP().cp2,
        this.getScreenP().p2,
      ]);
      const distance = this.getDistance(point, bezierPoint);

      if (distance < threshold) {
        return true;
      }
    }
    return false;
  }

  checkControlPointsBoundry(screenP: Vec) {
    if (!this.p1 || !this.p2 || !this.cp1 || !this.cp2) return null;
    let dx, dy;

    const relativeScreenP = {
      p: this.getRelativeScreenP(screenP),
      p2: this.getRelativeScreenP(this.getScreenP().p2),
      cp1: this.getRelativeScreenP(this.getScreenP().cp1),
      cp2: this.getRelativeScreenP(this.getScreenP().cp2),
    };

    // dx = relativeScreenP.p2.x - relativeScreenP.p.x;
    // dy = relativeScreenP.p2.y - relativeScreenP.p.y; // TODO: temporarily closed

    const scope = this.controlPoint.r * this.controlPoint.r;

    // if (dx * dx + dy * dy < scope) {
    //   return CurveTypes.PressingTarget.p2;
    // } // TODO: temporarily closed

    dx = relativeScreenP.cp2.x - relativeScreenP.p.x;
    dy = relativeScreenP.cp2.y - relativeScreenP.p.y;

    if (dx * dx + dy * dy < scope) {
      return CurveTypes.PressingTarget.cp2;
    }

    dx = relativeScreenP.cp1.x - relativeScreenP.p.x;
    dy = relativeScreenP.cp1.y - relativeScreenP.p.y;

    if (dx * dx + dy * dy < scope) {
      return CurveTypes.PressingTarget.cp1;
    }

    if (this.arrow?.checkControlPointsBoundry(this.getArrowP(screenP))) {
      return CurveTypes.PressingTarget.arrow_t;
    }

    // TODO: keep p1 checking but not using.
    // dx = this.p1.x - p.x;
    // dy = this.p1.y - p.y;

    // if (dx * dx + dy * dy < scope) {
    //   return CurveTypes.PressingTarget.p1
    // }

    return null;
  }

  checkBoundry(screenP: Vec) {
    return (
      this.getIsPointNearBezierCurve(screenP, threshold) ||
      this.arrow?.checkBoundry(this.getArrowP(screenP))
    );
  }

  move(offset: Vec) {
    this.p1 = {
      x: this.p1.x + offset.x,
      y: this.p1.y + offset.y,
    };
    this.cp1 = {
      x: this.cp1.x + offset.x,
      y: this.cp1.y + offset.y,
    };
    this.cp2 = {
      x: this.cp2.x + offset.x,
      y: this.cp2.y + offset.y,
    };
    this.p2 = {
      x: this.p2.x + offset.x,
      y: this.p2.y + offset.y,
    };
  }

  moveHandler(pressingTarget: CurveTypes.PressingTarget, offset: Vec) {
    if (
      pressingTarget === CurveTypes.PressingTarget.cp1 ||
      pressingTarget === CurveTypes.PressingTarget.cp2
    ) {
      const offsetX = offset.x / this.__scale__;
      const offsetY = offset.y / this.__scale__;

      this[pressingTarget].x += offsetX;
      this[pressingTarget].y += offsetY;

      if (this.arrow && this.p2 && this.cp2) {
        this.arrow.p = this.p2; // TODO: arrow should add offset and scale and calculate inside Arrow class
        this.arrow.deg =
          Math.atan2(this.p2.y - this.cp2.y, this.p2.x - this.cp2.x) +
          90 * (Math.PI / 180);
      }
    } else if (pressingTarget === CurveTypes.PressingTarget.arrow_t) {
      // TODO: do sth...
      // if (pressingTarget === CurveTypes.PressingTarget.p2) {
      //   this.cp2.x += offsetX;
      //   this.cp2.y += offsetY;
      // }
    }
  }

  locateHandler(target: CurveTypes.PressingTarget, screenP: Vec) {
    if (
      target === CurveTypes.PressingTarget.cp1 ||
      target === CurveTypes.PressingTarget.cp2
    ) {
      this[target] = {
        x: screenP.x / this.__scale__ - this.__offset__.x,
        y: screenP.y / this.__scale__ - this.__offset__.y,
      };
    } else if (target === CurveTypes.PressingTarget.arrow_t) {
      const arrowTopP = this.arrow?.getVertex().t;

      if (!arrowTopP) return;

      const corrctedArrowTopP = this.correct(arrowTopP);
      const relativeP = {
        x: corrctedArrowTopP.x - this.__p2__.x,
        y: corrctedArrowTopP.y - this.__p2__.y,
      };

      this.p2 = {
        x: screenP.x / this.__scale__ - this.__offset__.x - relativeP.x,
        y: screenP.y / this.__scale__ - this.__offset__.y - relativeP.y,
      };
    }
  }

  getArrowVertex() {
    const arrowVertex = this.arrow?.getVertex();

    if (!arrowVertex) return null;

    return {
      t: this.correct(arrowVertex?.t),
      l: this.correct(arrowVertex?.l),
      r: this.correct(arrowVertex?.r),
    };
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.p1 || !this.p2 || !this.cp1 || !this.cp2) return;

    ctx.lineWidth = this.curve.w * this.__scale__;
    ctx.strokeStyle = this.curve.c;

    const relativeScreenP = {
      p1: this.getRelativeScreenP(this.getScreenP().p1),
      cp1: this.getRelativeScreenP(this.getScreenP().cp1),
      cp2: this.getRelativeScreenP(this.getScreenP().cp2),
      p2: this.getRelativeScreenP(this.getScreenP().p2),
    };

    ctx.save();
    ctx.translate(this.getScreenP().p1.x, this.getScreenP().p1.y);

    ctx.beginPath();
    // curve
    ctx.moveTo(0, 0);
    if (this.cp2) {
      ctx.bezierCurveTo(
        relativeScreenP.cp1.x,
        relativeScreenP.cp1.y,
        relativeScreenP.cp2.x,
        relativeScreenP.cp2.y,
        relativeScreenP.p2.x,
        relativeScreenP.p2.y
      );
    } else {
      ctx.quadraticCurveTo(
        relativeScreenP.cp1.x,
        relativeScreenP.cp1.y,
        relativeScreenP.p2.x,
        relativeScreenP.p2.y
      );
    }
    ctx.stroke();
    ctx.closePath();

    // if (this.arrow) {
    //   this.arrow.draw(ctx);
    // }

    if (this.selecting) {
      // control lines
      ctx.lineWidth = this.cpline.w;
      ctx.strokeStyle = this.cpline.c;
      ctx.fillStyle = this.cpline.c;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(relativeScreenP.cp1.x, relativeScreenP.cp1.y);
      ctx.stroke();
      ctx.closePath();

      if (this.cp2) {
        ctx.beginPath();
        ctx.moveTo(relativeScreenP.p2.x, relativeScreenP.p2.y);
        ctx.lineTo(relativeScreenP.cp2.x, relativeScreenP.cp2.y);
        ctx.stroke();
        ctx.closePath();
      } else {
        ctx.beginPath();
        ctx.lineTo(relativeScreenP.p2.x, relativeScreenP.p2.y);
        ctx.stroke();
        ctx.closePath();
      }

      // control points
      ctx.strokeStyle = this.controlPoint.strokeC;
      ctx.fillStyle = this.controlPoint.c;

      //   // TODO: temporarily close p1.
      //   // ctx.beginPath();
      //   // ctx.arc(relativeScreenP.p1.x, relativeScreenP.p1.y, this.this.controlPoint.r(), 0, 2 * Math.PI, true); // p1 control point
      //   // ctx.fill();
      //   // ctx.stroke();
      //   // ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        relativeScreenP.cp1.x,
        relativeScreenP.cp1.y,
        this.controlPoint.r,
        0,
        2 * Math.PI,
        true
      ); // cp1 control point
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        relativeScreenP.cp2.x,
        relativeScreenP.cp2.y,
        this.controlPoint.r,
        0,
        2 * Math.PI,
        true
      ); // cp2 control point
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      // TODO: temporarily close p2.
      // ctx.beginPath();
      // ctx.arc(
      //   relativeScreenP.p2.x,
      //   relativeScreenP.p2.y,
      //   this.controlPoint.r,
      //   0,
      //   2 * Math.PI,
      //   true
      // ); // p2 control point
      // ctx.fill();
      // ctx.stroke();
      // ctx.closePath();
    }

    ctx.restore();
  }
}
