"use client";
import Core from "@/shapes/core";
import Curve from "@/shapes/curve";
import { tailwindColors } from "@/variables/colors";
import { Direction } from "@/types/shapes/common";
import * as CommonTypes from "@/types/shapes/common";

export default class Data extends Core {
  isFrameOpen: boolean;
  data: CommonTypes.Data;
  thersholdRatio: number;

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, "#1BC861", title);
    this.isFrameOpen = false;
    this.data = [];
    this.thersholdRatio = 1 / 10;
  }

  set w(value: number) {
    const offset = (this.w - value) / 2;
    this.__w__ = value;

    // when sender width changes, receiver curve follows the sender shape
    this.curves[Direction.l].forEach((sendCurve) => {
      const point = {
          t: -this.w / 2 + this.w * this.thersholdRatio,
          b: -this.w / 2,
        },
        centerP = (point.t + point.b) / 2,
        distance = centerP - sendCurve.shape.p1.x;

      sendCurve.shape.p1.x += distance;
      sendCurve.shape.cp1.x += distance;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        x: sendCurve.shape.p2.x + offset,
      };
      sendCurve.shape.cp2.x += offset;
    });

    this.curves[Direction.r].forEach((sendCurve) => {
      const point = {
          t: this.w / 2,
          b: this.w / 2 - this.w * this.thersholdRatio,
        },
        centerP = (point.t + point.b) / 2,
        distance = centerP - sendCurve.shape.p1.x;

      sendCurve.shape.p1.x += distance;
      sendCurve.shape.cp1.x += distance;

      if (sendCurve.sendTo) return;

      sendCurve.shape.p2 = {
        ...sendCurve.shape.p2,
        x: sendCurve.shape.p2.x - offset,
      };
      sendCurve.shape.cp2.x -= offset;
    });

    // when receiver width changes, receiver curve follows the sender shape

    this.receiveFrom.l?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        x: bridge.shape.p2.x + offset,
      };
      bridge.shape.cp2.x += offset;
    });

    this.receiveFrom.r?.forEach((receiveFromItem) => {
      const bridge = receiveFromItem.shape.curves[receiveFromItem.d].find(
        (sendCurve) => sendCurve.shape.id === receiveFromItem.bridgeId
      );

      if (!bridge) return;
      bridge.shape.p2 = {
        ...bridge.shape.p2,
        x: bridge.shape.p2.x - offset,
      };
      bridge.shape.cp2.x -= offset;
    });
  }

  get w() {
    return this.__w__;
  }

  getFrameThreshold() {
    return {
      normal: this.w * this.thersholdRatio,
      scale: this.getScaleSize().w * this.thersholdRatio,
    };
  }

  getCorner() {
    const frameThreshold = this.getFrameThreshold();
    return {
      normal: {
        tl: {
          x: -this.w / 2 + frameThreshold.normal,
          y: -this.h / 2,
        },
        tr: {
          x: this.w / 2,
          y: -this.h / 2,
        },
        br: {
          x: this.w / 2 - frameThreshold.normal,
          y: this.h / 2,
        },
        bl: {
          x: -this.w / 2,
          y: this.h / 2,
        },
      },
      scale: {
        tl: {
          x: -this.getScaleSize().w / 2 + frameThreshold.scale,
          y: -this.getScaleSize().h / 2,
        },
        tr: {
          x: this.getScaleSize().w / 2,
          y: -this.getScaleSize().h / 2,
        },
        br: {
          x: this.getScaleSize().w / 2 - frameThreshold.scale,
          y: this.getScaleSize().h / 2,
        },
        bl: {
          x: -this.getScaleSize().w / 2,
          y: this.getScaleSize().h / 2,
        },
      },
    };
  }

  onDataChange = (
    _title: CommonTypes.Title,
    _data: CommonTypes.Data,
    _selectedData: CommonTypes.Data,
    _deletedData: CommonTypes.Data
  ) => {
    this.title = _title;
    this.data = _data;
    this.selectedData = _selectedData;
    this.deletedData = _deletedData;
  };

  initializeCurve(id: string, _d: Direction) {
    let newCurve = null;
    let p1: CommonTypes.Vec = { x: 0, y: 0 };
    let p2: CommonTypes.Vec = { x: 0, y: 0 };
    let cp1: CommonTypes.Vec = { x: 0, y: 0 };
    let cp2: CommonTypes.Vec = { x: 0, y: 0 };

    const corner = this.getCorner().normal;
    const arrow_h = 12;

    switch (_d) {
      case Direction.l:
        p1 = {
          x: -this.w / 2 + (corner.tl.x - corner.bl.x) / 2,
          y: 0,
        };
        p2 = {
          x: -this.w / 2 - this.__curveTrigger__.d + arrow_h,
          y: 0,
        };
        cp1 = p1;
        cp2 = {
          x: (p1.x + p2.x) / 2,
          y: 0,
        };
        break;

      case Direction.t:
        p1 = {
          x: 0,
          y: -this.h / 2,
        };
        p2 = {
          x: 0,
          y: -this.h / 2 - this.__curveTrigger__.d + arrow_h,
        };
        cp1 = p1;
        cp2 = {
          x: 0,
          y: (p1.y + p2.y) / 2,
        };
        break;

      case Direction.r:
        p1 = {
          x: this.w / 2 - (corner.tl.x - corner.bl.x) / 2,
          y: 0,
        };
        p2 = {
          x: this.w / 2 + this.__curveTrigger__.d - arrow_h,
          y: 0,
        };
        cp1 = p1;
        cp2 = {
          x: (p1.x + p2.x) / 2,
          y: 0,
        };
        break;

      case Direction.b:
        p1 = {
          x: 0,
          y: this.h / 2,
        };
        p2 = {
          x: 0,
          y: this.h / 2 + this.__curveTrigger__.d - arrow_h,
        };
        cp1 = p1;
        cp2 = {
          x: 0,
          y: (p1.y + p2.y) / 2,
        };
        break;
    }

    newCurve = new Curve(id, p1, cp1, cp2, p2);

    if (!newCurve) return;
    newCurve.scale = this.scale;

    this.curves[_d].push({
      shape: newCurve,
      sendTo: null,
    });
  }

  checkReceivingPointsBoundry(p: CommonTypes.Vec) {
    const corners = this.getCorner().scale,
      edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx =
      this.getScreenP().x - Math.abs((corners.bl.x + corners.tl.x) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.l.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.l;
    }

    dx = this.getScreenP().x - p.x;
    dy = edge.t - p.y;

    if (
      this.__receivePoint__.t.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.t;
    }

    dx =
      this.getScreenP().x + Math.abs((corners.tr.x + corners.br.x) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.r.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.r;
    }

    dx = this.getScreenP().x - p.x;
    dy = p.y - edge.b;

    if (
      this.__receivePoint__.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.b;
    }

    return null;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, () => {
      const corners = this.getCorner().scale;

      ctx.beginPath();
      ctx.moveTo(corners.tl.x, corners.tl.y);
      ctx.lineTo(corners.tr.x, corners.tr.y);
      ctx.lineTo(corners.br.x, corners.br.y);
      ctx.lineTo(corners.bl.x, corners.bl.y);
      ctx.closePath();
      ctx.fill();
    });
  }

  drawRecievingPoint(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    // draw receiving points
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    const corners = this.getCorner().scale;

    // left
    if (this.__receivePoint__.l.visible) {
      if (this.__receivePoint__.l.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        -this.getScaleSize().w / 2 + Math.abs(corners.tl.x - corners.bl.x) / 2,
        0,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // top
    if (this.__receivePoint__.t.visible) {
      if (this.__receivePoint__.t.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        0,
        -this.getScaleSize().h / 2,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // right
    if (this.__receivePoint__.r.visible) {
      if (this.__receivePoint__.r.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        this.getScaleSize().w / 2 - Math.abs(corners.tr.x - corners.br.x) / 2,
        0,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // bottom
    if (this.__receivePoint__.b.visible) {
      if (this.__receivePoint__.b.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        0,
        this.getScaleSize().h / 2,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.restore();
  }
}
