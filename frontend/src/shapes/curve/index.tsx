"use client";
import Arrow from "@/shapes/arrow";
import { Vec } from "@/types/shapes/common";
import { Line, PressingP } from "@/types/shapes/curve";

const threshold = 5;
export default class Curve {
  private initPressing = {
    activate: false,
    p: null,
  };
  private initOffset = {
    x: 0,
    y: 0,
  };
  private initScale = 1;
  cpline: Line;
  curve: Line;
  controlPoint: {
    c: string;
    strokeC: string;
    r: number;
  };
  radius: number;
  p1: Vec;
  __p2__: Vec;
  cp1: Vec;
  cp2: Vec;
  pressing: {
    activate: boolean;
    p: PressingP | null;
  };
  arrow: null | Arrow;
  dragP: Vec | null;
  selecting: boolean;
  __offset__: Vec;
  __scale__: number;

  constructor(cpline: Line, curve: Line, p1: Vec, cp1: Vec, cp2: Vec, p2: Vec) {
    this.cpline = cpline;
    this.curve = curve;
    this.controlPoint = {
      c: "rgba(200, 200, 200, .5)",
      strokeC: "#900",
      r: 10,
    };
    this.radius = 10;
    this.p1 = p1;
    this.cp1 = cp1;
    this.cp2 = cp2;
    this.__p2__ = p2;
    this.pressing = this.initPressing;
    this.arrow = new Arrow(
      20,
      20,
      "black",
      { x: this.__p2__.x, y: this.__p2__.y },
      Math.atan2(this.__p2__.y - this.cp2.y, this.__p2__.x - this.cp2.x) +
      90 * (Math.PI / 180)
    );
    this.dragP = null;
    this.selecting = false;
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
  }

  get p2() {
    return this.__p2__;
  }

  set p2(value: Vec) {
    this.__p2__ = value;
    if (this.arrow && value && this.cp2) {
      this.arrow.p = { x: this.getScreenP().p2.x, y: this.getScreenP().p2.y };
      this.arrow.deg =
        Math.atan2(value.y - this.cp2.y, value.x - this.cp2.x) +
        90 * (Math.PI / 180);
    }
  }

  set offset(value: Vec) {
    this.__offset__ = value;

    if (this.arrow && value && this.cp2) {
      this.arrow.p = { x: this.getScreenP().p2.x, y: this.getScreenP().p2.y };
    }
  }

  set scale(value: number) {
    const magnification = value / this.__scale__
    this.__scale__ = value;

    if (this.arrow && value && this.cp2) {
      this.arrow.p = { x: this.getScreenP().p2.x, y: this.getScreenP().p2.y };
      this.arrow.w = this.arrow.w * magnification
      this.arrow.h = this.arrow.h * magnification
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

  getScaleCurveW = () => {
    return this.curve.w * this.__scale__;
  };

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
        this.getScreenP().p1,
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

  checkControlPointsBoundry(p: Vec) {
    if (!this.p1 || !this.p2 || !this.cp1 || !this.cp2) {
      this.pressing = this.initPressing;
      return this.initPressing;
    }

    let dx, dy;

    dx = this.getScreenP().p2.x - p.x;
    dy = this.getScreenP().p2.y - p.y;

    const scope = this.controlPoint.r * this.controlPoint.r

    if (dx * dx + dy * dy < scope) {
      // this.pressing = {
      //   activate: true,
      //   p: PressingP.p2,
      // };
      return {
        activate: true,
        p: PressingP.p2,
      };
    }

    dx = this.getScreenP().cp2.x - p.x;
    dy = this.getScreenP().cp2.y - p.y;

    if (dx * dx + dy * dy < scope) {
      // this.pressing = {
      //   activate: true,
      //   p: PressingP.cp2,
      // };
      return {
        activate: true,
        p: PressingP.cp2,
      };
    }

    dx = this.getScreenP().cp1.x - p.x;
    dy = this.getScreenP().cp1.y - p.y;

    if (dx * dx + dy * dy < scope) {
      // this.pressing = {
      //   activate: true,
      //   p: PressingP.cp1,
      // };
      return {
        activate: true,
        p: PressingP.cp1,
      };
    }

    // TODO: keep p1 checking but not using.
    // dx = this.p1.x - p.x;
    // dy = this.p1.y - p.y;

    // if (dx * dx + dy * dy < scope) {
    //   // this.pressing = {
    //   //   activate: true,
    //   //   p: PressingP.p1,
    //   // };
    //   return {
    //     activate: true,
    //     p: PressingP.p1,
    //   };
    // }

    // this.pressing = this.initPressing;
    return this.initPressing;
  }

  checkBoundry(p: Vec) {
    return this.getIsPointNearBezierCurve(p, threshold);
  }

  onMouseDown($canvas: HTMLCanvasElement, p: Vec) {
    // if (this.pressing.activate) {
    //   $canvas.style.cursor = "move";
    // } // TODO: 待修改 cursor

    const pressingControlPoint = this.checkControlPointsBoundry(p);

    if (this.arrow) {
      this.selecting = this.selecting
        ? this.checkBoundry(p) ||
        pressingControlPoint.activate ||
        this.arrow?.checkBoundry(p)
        : this.checkBoundry(p) || this.arrow?.checkBoundry(p);
    }

    if (!this.selecting) return;

    this.pressing = pressingControlPoint;
  }

  onMouseMove(p: Vec) {
    if (this.pressing.activate && this.selecting) {
      if (
        this.pressing.p === PressingP.p1 &&
        this.p1 !== null &&
        this.cp1 !== null
      ) {
        const offset = {
          x: p.x - this.getScreenP().p1.x,
          y: p.y - this.getScreenP().p1.y,
        };

        this.p1 = {
          x: (p.x / this.__scale__ - this.__offset__.x) - this.p1.x,
          y: (p.y / this.__scale__ - this.__offset__.y) - this.p1.y,
        };

        this.cp1.x += offset.x;
        this.cp1.y += offset.y;
      } else if (
        this.pressing.p === PressingP.cp1 &&
        this.cp1?.x !== null &&
        this.cp1?.y !== null
      ) {
        this.cp1 = {
          x: p.x / this.__scale__ - this.__offset__.x,
          y: p.y / this.__scale__ - this.__offset__.y,
        };
      } else if (
        this.pressing.p === PressingP.cp2 &&
        this.cp2?.x !== null &&
        this.cp2?.y !== null
      ) {
        this.cp2 = {
          x: p.x / this.__scale__ - this.__offset__.x,
          y: p.y / this.__scale__ - this.__offset__.y,
        };
      } else if (
        this.pressing.p === PressingP.p2 &&
        this.p2 !== null &&
        this.cp2 !== null
      ) {
        const offset = {
          x: (p.x / this.__scale__ - this.__offset__.x) - this.p2.x,
          y: (p.y / this.__scale__ - this.__offset__.y) - this.p2.y,
        };

        this.p2 = {
          x: p.x / this.__scale__ - this.__offset__.x,
          y: p.y / this.__scale__ - this.__offset__.y,
        };

        this.cp2.x += offset.x;
        this.cp2.y += offset.y;
      }

      if (this.arrow && this.p2 && this.cp2) {
        this.arrow.p = { x: this.getScreenP().p2.x, y: this.getScreenP().p2.y };
        this.arrow.deg =
          Math.atan2(
            this.getScreenP().p2.y - this.getScreenP().cp2.y,
            this.getScreenP().p2.x - this.getScreenP().cp2.x
          ) +
          90 * (Math.PI / 180);
      }
    }
  }

  onMouseUp() {
    // $canvas: HTMLCanvasElement
    // if (this.pressing.activate) {
    //   $canvas.style.cursor = "default";
    //   this.pressing = this.initPressing;
    // } // TODO: 處理 cursor
    this.pressing = this.initPressing;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.p1 || !this.p2 || !this.cp1 || !this.cp2) return;

    // console.log('this.p1', this.p1)

    // curve
    ctx.lineWidth = this.getScaleCurveW();
    ctx.strokeStyle = this.curve.c;

    ctx.beginPath();
    ctx.moveTo(this.getScreenP().p1.x, this.getScreenP().p1.y);
    if (this.cp2) {
      ctx.bezierCurveTo(
        this.getScreenP().cp1.x,
        this.getScreenP().cp1.y,
        this.getScreenP().cp2.x,
        this.getScreenP().cp2.y,
        this.getScreenP().p2.x,
        this.getScreenP().p2.y
      );
    } else {
      ctx.quadraticCurveTo(
        this.getScreenP().cp1.x,
        this.getScreenP().cp1.y,
        this.getScreenP().p2.x,
        this.getScreenP().p2.y
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

      ctx.moveTo(this.getScreenP().p1.x, this.getScreenP().p1.y);
      // ctx.fillText(`p1`, this.getScreenP().p1.x + 14, this.getScreenP().p1.y);
      // ctx.fillText(
      //   `(this.getScreenP().p1.x:${this.getScreenP().p1.x}, this.getScreenP().p1.y:${this.getScreenP().p1.y})`,
      //   this.getScreenP().p1.x + 14,
      //   this.getScreenP().p1.y
      // );
      ctx.lineTo(this.getScreenP().cp1.x, this.getScreenP().cp1.y);
      // ctx.fillText(`cp1`, this.getScreenP().cp1.x + 14, this.getScreenP().cp1.y);
      // ctx.fillText(
      //   `(this.getScreenP().cp1.x:${this.getScreenP().cp1.x}, this.getScreenP().cp1.y:${this.getScreenP().cp1.y})`,
      //   this.getScreenP().cp1.x + 14,
      //   this.getScreenP().cp1.y
      // );
      if (this.cp2) {
        ctx.moveTo(this.getScreenP().p2.x, this.getScreenP().p2.y);
        // ctx.fillText(`p2`, this.getScreenP().p2.x + 14, this.getScreenP().p2.y);
        // ctx.fillText(
        //   `(this.getScreenP().p2.x:${this.getScreenP().p2.x}, this.getScreenP().p2.y:${this.getScreenP().p2.y})`,
        //   this.getScreenP().p2.x + 14,
        //   this.getScreenP().p2.y
        // );
        ctx.lineTo(this.getScreenP().cp2.x, this.getScreenP().cp2.y);
        // ctx.fillText(`cp2`, this.getScreenP().cp2.x + 14, this.getScreenP().cp2.y);
        // ctx.fillText(
        //   `(this.getScreenP().cp2.x:${this.getScreenP().cp2.x}, this.getScreenP().cp2.y:${this.getScreenP().cp2.y})`,
        //   this.getScreenP().cp2.x + 14,
        //   this.getScreenP().cp2.y
        // );
      } else {
        ctx.lineTo(this.getScreenP().p2.x, this.getScreenP().p2.y);
      }
      ctx.stroke();
      ctx.closePath();

      // control points
      ctx.strokeStyle = this.controlPoint.strokeC;
      ctx.fillStyle = this.controlPoint.c;

      // TODO: keep p1 rendering but not using.
      // ctx.beginPath();
      // ctx.arc(this.getScreenP().p1.x, this.getScreenP().p1.y, this.this.controlPoint.r(), 0, 2 * Math.PI, true); // p1 control point
      // ctx.fill();
      // ctx.stroke();
      // ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        this.getScreenP().cp1.x,
        this.getScreenP().cp1.y,
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
        this.getScreenP().p2.x,
        this.getScreenP().p2.y,
        this.controlPoint.r,
        0,
        2 * Math.PI,
        true
      ); // p2 control point
      ctx.fill();
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(
        this.getScreenP().cp2.x,
        this.getScreenP().cp2.y,
        this.controlPoint.r,
        0,
        2 * Math.PI,
        true
      ); // cp2 control point
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  }
}
