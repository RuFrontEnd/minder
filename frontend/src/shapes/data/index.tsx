"use client";
import Core from "@/shapes/core";
import Curve from "@/shapes/curve";
import { Direction } from "@/types/shapes/common";
import * as CommonTypes from "@/types/shapes/common";

export default class Data extends Core {
  isFrameOpen: boolean;
  data: CommonTypes.Data;
  thershold: number;

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
    this.thershold = 10;
  }

  onDataChange = (
    title: CommonTypes.Title,
    data: CommonTypes.Data,
    selectedData: CommonTypes.Data
  ) => {
    this.title = title;
    this.data = data;
    this.selectedData = selectedData;
  };

  initializeCurve(id: string, _d: Direction) {
    let newCurve = null;
    const threshold = (this.getScaleSize().w * (1 / 10)) / 2;

    if (_d === Direction.l) {
      newCurve = new Curve(
        id,
        {
          x: -this.w / 2 + threshold,
          y: 0,
        },
        {
          x: -this.w / 2 + (-this.curveTrigger.d * 1) / 3 + threshold,
          y: 0,
        },
        {
          x: -this.w / 2 + (-this.curveTrigger.d * 2) / 3,
          y: 0,
        },
        {
          x: -this.w / 2 - this.curveTrigger.d,
          y: 0,
        }
      );
    } else if (_d === Direction.t) {
      newCurve = new Curve(
        id,
        {
          x: 0,
          y: -this.h / 2,
        },
        {
          x: 0,
          y: -this.h / 2 + (-this.curveTrigger.d * 1) / 3,
        },
        {
          x: 0,
          y: -this.h / 2 + (-this.curveTrigger.d * 2) / 3,
        },
        {
          x: 0,
          y: -this.h / 2 - this.curveTrigger.d,
        }
      );
    } else if (_d === Direction.r) {
      newCurve = new Curve(
        id,
        {
          x: this.w / 2 - threshold,
          y: 0,
        },
        {
          x: this.w / 2 + (this.curveTrigger.d * 1) / 3 - threshold,
          y: 0,
        },
        {
          x: this.w / 2 + (this.curveTrigger.d * 2) / 3,
          y: 0,
        },
        {
          x: this.w / 2 + this.curveTrigger.d,
          y: 0,
        }
      );
    } else if (_d === Direction.b) {
      newCurve = new Curve(
        id,
        {
          x: 0,
          y: this.h / 2,
        },
        {
          x: 0,
          y: this.h / 2 + (this.curveTrigger.d * 1) / 3,
        },
        {
          x: 0,
          y: this.h / 2 + (this.curveTrigger.d * 2) / 3,
        },
        {
          x: 0,
          y: this.h / 2 + this.curveTrigger.d,
        }
      );
    }

    if (!newCurve) return;
    newCurve.scale = this.scale;

    this.curves[_d].push({
      shape: newCurve,
      sendTo: null,
    });
  }

  checkReceivingPointsBoundry(p: CommonTypes.Vec) {
    const frameThreshold = this.getScaleSize().w * (1 / 10);
    const edge = this.getEdge(),
      center = this.getCenter(),
      x1 = -this.getScaleSize().w / 2 + frameThreshold * this.scale,
      y1 = -this.getScaleSize().h / 2,
      x2 = this.getScaleSize().w / 2,
      y2 = -this.getScaleSize().h / 2,
      x3 = this.getScaleSize().w / 2 - frameThreshold * this.scale,
      y3 = this.getScaleSize().h / 2,
      x4 = -this.getScaleSize().w / 2,
      y4 = this.getScaleSize().h / 2;

    let dx, dy;

    dx = this.getScreenP().x - Math.abs((x4 + x1) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.receiving.l &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.l;
    }

    dx = this.getScreenP().x - p.x;
    dy = edge.t - p.y;

    if (
      this.receiving.t &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.t;
    }

    dx = this.getScreenP().x + Math.abs((x2 + x3) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.receiving.r &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.r;
    }

    dx = this.getScreenP().x - p.x;
    dy = p.y - edge.b;

    if (
      this.receiving.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.b;
    }

    return null;
  }

  // connect(receiveD: CommonTypes.Direction, connectTarget: CoreTypes.ConnectTarget) {
  //   // TODO: curve 相關
  //   if (
  //     !this.receiving[receiveD] ||
  //     this.receiveFrom[receiveD]?.shape ||
  //     this.curves[receiveD]?.shape
  //   )
  //     return;

  //   const senderCurve =
  //     connectTarget.shape.curves[connectTarget.direction].shape;
  //   if (!senderCurve) return;
  //   // receiver
  //   this.receiveFrom[receiveD] = {
  //     shape: connectTarget.shape,
  //     sendD: connectTarget.direction,
  //   };
  //   // connectTarget
  //   connectTarget.shape.curves[connectTarget.direction].sendTo = {
  //     shape: this,
  //     receiveD: receiveD,
  //   };

  //   // define receive curve P2 position
  //   if (receiveD === CommonTypes.Direction.l) {
  //     senderCurve.p2 = {
  //       x:
  //         this.p.x -
  //         connectTarget.shape.p.x -
  //         this.w / 2 -
  //         this.thershold +
  //         this.frameOffset / 2,
  //       y: this.p.y - connectTarget.shape.p.y,
  //     };
  //   } else if (receiveD === CommonTypes.Direction.t) {
  //     senderCurve.p2 = {
  //       x: this.p.x - connectTarget.shape.p.x,
  //       y: this.p.y - connectTarget.shape.p.y - this.h / 2 - this.thershold,
  //     };
  //   } else if (receiveD === CommonTypes.Direction.r) {
  //     senderCurve.p2 = {
  //       x:
  //         this.p.x -
  //         connectTarget.shape.p.x +
  //         this.w / 2 +
  //         this.thershold -
  //         this.frameOffset / 2,
  //       y: this.p.y - connectTarget.shape.p.y,
  //     };
  //   } else if (receiveD === CommonTypes.Direction.b) {
  //     senderCurve.p2 = {
  //       x: this.p.x - connectTarget.shape.p.x,

  //       y: this.p.y - connectTarget.shape.p.y + this.h / 2 + this.thershold,
  //     };
  //   }
  // }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    const isAlert = this.redundancies.length > 0;
    let renderC = isAlert ? "#EC3333" : this.c;
    ctx.fillStyle = renderC;

    const frameThreshold = this.getScaleSize().w * (1 / 10);

    const x1 = -this.getScaleSize().w / 2 + frameThreshold * this.scale,
      y1 = -this.getScaleSize().h / 2,
      x2 = this.getScaleSize().w / 2,
      y2 = -this.getScaleSize().h / 2,
      x3 = this.getScaleSize().w / 2 - frameThreshold * this.scale,
      y3 = this.getScaleSize().h / 2,
      x4 = -this.getScaleSize().w / 2,
      y4 = this.getScaleSize().h / 2;

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

  drawRecievingPoint(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    // draw receiving points
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    const frameThreshold = this.getScaleSize().w * (1 / 10);

    const x1 = -this.getScaleSize().w / 2 + frameThreshold * this.scale,
      x2 = this.getScaleSize().w / 2,
      x3 = this.getScaleSize().w / 2 - frameThreshold * this.scale,
      x4 = -this.getScaleSize().w / 2;

    // left
    if (this.receiving.l) {
      ctx.beginPath();
      ctx.arc(
        -this.getScaleSize().w / 2 + Math.abs(x1 - x4) / 2,
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
    if (this.receiving.t) {
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
    if (this.receiving.r) {
      ctx.beginPath();
      ctx.arc(
        this.getScaleSize().w / 2 - Math.abs(x2 - x3) / 2,
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
    if (this.receiving.b) {
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
