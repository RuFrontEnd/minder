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
  private __p1__: Vec;
  private __cp1__: Vec;
  private __cp2__: Vec;
  private __p2__: Vec;
  private __arrowAttr__: {
    w: number;
    h: number;
    c: string;
  };
  private arrow: null | Arrow;
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
    this.__arrowAttr__ = {
      w: 12,
      h: 12,
      c: tailwindColors.grey["1"],
    };
    this.__p1__ = p1;
    this.__p2__ = (() => {
      const v = { x: p2.x - this.__p1__.x, y: p2.y - this.__p1__.y };
      const len = Math.sqrt(
        Math.pow(p2.x - this.__p1__.x, 2) + Math.pow(p2.y - this.__p1__.y, 2)
      );
      const ratio = (len - this.__arrowAttr__.h) / len;

      return { x: this.__p1__.x + v.x * ratio, y: this.__p1__.y + v.y * ratio };
    })();
    this.__cp1__ = cp1;
    this.__cp2__ = cp2;
    this.arrow = new Arrow(
      `arrow_${Date.now()}`,
      this.__arrowAttr__.w,
      this.__arrowAttr__.h,
      this.__arrowAttr__.c,
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

  get p1() {
    return this.__p1__;
  }

  get cp1() {
    return this.__cp1__;
  }

  set cp2(value: Vec) {
    this.__cp2__ = value;
    if (this.arrow && value && this.cp2) {
      this.arrow.deg =
        Math.atan2(this.cp2.y - this.p2.y, this.cp2.x - this.p2.x) -
        90 * (Math.PI / 180);
    }
  }

  get cp2() {
    return this.__cp2__;
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

  scalify(val: number) {
    return val * this.__scale__;
  }

  deScale(val: number) {
    return val / this.__scale__;
  }

  relativify(p: Vec) {
    return {
      x: p.x - this.__p1__.x,
      y: p.y - this.__p1__.y,
    };
  }

  correct(p: Vec) {
    return {
      x: p.x + this.__p1__.x,
      y: p.y + this.__p1__.y,
    };
  }

  offsetfy(p: Vec) {
    return {
      x: p.x + this.__offset__.x,
      y: p.y + this.__offset__.y,
    };
  }

  deOffset(p: Vec) {
    return {
      x: p.x - this.__offset__.x,
      y: p.y - this.__offset__.y,
    };
  }

  screenfy(normalP: Vec) {
    return {
      x: this.scalify(normalP.x + this.__offset__.x),
      y: this.scalify(normalP.y + this.__offset__.y),
    };
  }

  deScreenfy(screenP: Vec) {
    return {
      x: this.deScale(screenP.x) - this.__offset__.x,
      y: this.deScale(screenP.y) - this.__offset__.y,
    };
  }

  getScreenP() {
    return {
      p1: {
        x: (this.__p1__.x + this.__offset__.x) * this.__scale__,
        y: (this.__p1__.y + this.__offset__.y) * this.__scale__,
      },
      cp1: {
        x: (this.__cp1__.x + this.__offset__.x) * this.__scale__,
        y: (this.__cp1__.y + this.__offset__.y) * this.__scale__,
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
      x: p.x - this.__p1__.x,
      y: p.y - this.__p1__.y,
    };
  }

  getRelativeScreenP(screenP: Vec) {
    return {
      x: screenP.x - (this.__p1__.x + this.__offset__.x) * this.__scale__,
      y: screenP.y - (this.__p1__.y + this.__offset__.y) * this.__scale__,
    };
  }

  getArrowP(screenP: Vec) {
    const relativeP = this.relativify(
      this.deOffset({ x: this.deScale(screenP.x), y: this.deScale(screenP.y) })
    );

    return {
      x: this.scalify(relativeP.x),
      y: this.scalify(relativeP.y),
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
  getDistance(p1: Vec, p2: Vec) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  } // checked

  // Check if a point is close to the Bezier curve
  getIsPointNearBezierCurve(point: Vec, threshold: number) {
    for (let t = 0; t <= 1; t += 0.01) {
      if (!this.__p1__ || !this.__cp1__ || !this.cp2 || !this.p2) return false;
      const bezierPoint = this.getBezierPoint(t, [
        this.relativify(this.__p1__),
        this.relativify(this.__cp1__),
        this.relativify(this.__cp2__),
        this.relativify(this.__p2__),
      ]);
      const distance = this.getDistance(point, bezierPoint);

      if (distance < threshold) {
        return true;
      }
    }
    return false;
  } // checkedrelativeP

  checkControlPointsBoundry(screenP: Vec) {
    if (!this.__p1__ || !this.p2 || !this.__cp1__ || !this.cp2) return null;
    let dx, dy;

    const relativeP = {
      p: this.relativify(
        this.deOffset({
          x: this.deScale(screenP.x),
          y: this.deScale(screenP.y),
        })
      ),
      p2: this.relativify(this.p2),
      cp1: this.relativify(this.cp1),
      cp2: this.relativify(this.cp2),
    };

    // dx = relativeP.p2.x - relativeP.p.x;
    // dy = relativeP.p2.y - relativeP.p.y; // TODO: temporarily closed

    const scope = Math.pow(this.controlPoint.r, 2);

    // if (dx * dx + dy * dy < scope) {
    //   return CurveTypes.PressingTarget.p2;
    // } // TODO: temporarily closed

    if (this.arrow?.checkControlPointsBoundry(this.getArrowP(screenP))) {
      return CurveTypes.PressingTarget.arrow_t;
    }

    dx = relativeP.cp1.x - relativeP.p.x;
    dy = relativeP.cp1.y - relativeP.p.y;

    if (dx * dx + dy * dy < scope) {
      return CurveTypes.PressingTarget.cp1;
    }

    dx = relativeP.cp2.x - relativeP.p.x;
    dy = relativeP.cp2.y - relativeP.p.y;

    if (dx * dx + dy * dy < scope) {
      return CurveTypes.PressingTarget.cp2;
    }

    // TODO: keep p1 checking but not using.
    // dx = this.__p1__.x - p.x;
    // dy = this.__p1__.y - p.y;

    // if (dx * dx + dy * dy < scope) {
    //   return CurveTypes.PressingTarget.p1
    // }

    return null;
  }

  checkBoundry(screenP: Vec) {
    const relativeP = this.relativify(
      this.deOffset({
        x: this.deScale(screenP.x),
        y: this.deScale(screenP.y),
      })
    );
    return (
      this.getIsPointNearBezierCurve(relativeP, threshold) || // checked
      this.arrow?.checkBoundry(this.getArrowP(screenP))
    );
  }

  move(offset: Vec) {
    this.__p1__ = {
      x: this.__p1__.x + offset.x,
      y: this.__p1__.y + offset.y,
    };
    this.__cp1__ = {
      x: this.__cp1__.x + offset.x,
      y: this.__cp1__.y + offset.y,
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
      this[`__${pressingTarget}__`].x += this.deScale(offset.x);
      this[`__${pressingTarget}__`].y += this.deScale(offset.y);

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
  } // checked

  locateHandler(pressingTarget: CurveTypes.PressingTarget, screenP: Vec) {
    if (
      pressingTarget === CurveTypes.PressingTarget.cp1 ||
      pressingTarget === CurveTypes.PressingTarget.cp2
    ) {
      this[`__${pressingTarget}__`] = {
        x: screenP.x / this.__scale__ - this.__offset__.x,
        y: screenP.y / this.__scale__ - this.__offset__.y,
      };
    } else if (pressingTarget === CurveTypes.PressingTarget.arrow_t) {
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
    if (!this.__p1__ || !this.p2 || !this.__cp1__ || !this.cp2) return;

    ctx.lineWidth = this.scalify(this.curve.w);
    ctx.strokeStyle = this.curve.c;

    const offsetP = this.offsetfy(this.__p1__);
    const screenP = { x: this.scalify(offsetP.x), y: this.scalify(offsetP.y) };

    ctx.save();
    ctx.translate(screenP.x, screenP.y);

    const relativeScreenP = {
      cp1: {
        x: this.scalify(this.relativify(this.__cp1__).x),
        y: this.scalify(this.relativify(this.__cp1__).y),
      },
      cp2: {
        x: this.scalify(this.relativify(this.__cp2__).x),
        y: this.scalify(this.relativify(this.__cp2__).y),
      },
      p2: {
        x: this.scalify(this.relativify(this.__p2__).x),
        y: this.scalify(this.relativify(this.__p2__).y),
      },
    };

    ctx.beginPath();
    // curve
    ctx.moveTo(0, 0);
    ctx.fillStyle = "red";
    ctx.fillText(
      `p1 x:${this.screenfy(this.p1).x.toFixed(1)} y:${this.screenfy(
        this.p1
      ).y.toFixed(1)}`,
      0,
      0
    );
    ctx.fillText(
      `cp1 x:${this.screenfy(this.__cp1__).x.toFixed(1)} y:${this.screenfy(
        this.__cp1__
      ).y.toFixed(1)}`,
      relativeScreenP.cp1.x,
      relativeScreenP.cp1.y
    );
    ctx.fillText(
      `cp2 x:${this.screenfy(this.__cp2__).x.toFixed(1)} y:${this.screenfy(
        this.__cp2__
      ).y.toFixed(1)}`,
      relativeScreenP.cp2.x,
      relativeScreenP.cp2.y
    );
    ctx.fillText(
      `p2 x:${this.screenfy(this.__p2__).x.toFixed(1)} y:${this.screenfy(
        this.__p2__
      ).y.toFixed(1)}`,
      relativeScreenP.p2.x,
      relativeScreenP.p2.y
    );

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

    if (this.arrow) {
      this.arrow.draw(ctx);
    }

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
