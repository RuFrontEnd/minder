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
import * as CoreTypes from "@/types/shapes/core";

export default class Data extends Core {
  isFrameOpen: boolean;
  title: Title;
  data: DataType;
  frameOffset: number;

  constructor(id: Id, w: W, h: H, p: Vec, c: C) {
    super(id, w, h, p, c);
    this.isFrameOpen = false;
    this.title = "";
    this.data = [];
    this.frameOffset = 20;
  }

  onDataChange = (title: Title, data: DataType, selectedData: DataType) => {
    this.title = title;
    this.data = data;
    this.selectedData = selectedData;
  };

  checkReceivingPointsBoundry(p: Vec) {
    const edge = this.getEdge(),
      center = this.getCenter(),
      x1 = -this.getScaleSize().w / 2 + this.frameOffset * this.scale,
      y1 = -this.getScaleSize().h / 2,
      x2 = this.getScaleSize().w / 2,
      y2 = -this.getScaleSize().h / 2,
      x3 = this.getScaleSize().w / 2 - this.frameOffset * this.scale,
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
      return Direction.l;
    }

    dx = this.getScreenP().x + Math.abs((x1 + x2) / 2) - p.x;
    dy = edge.t - p.y;

    if (
      this.receiving.t &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.t;
    }

    dx = this.getScreenP().x + Math.abs((x2 + x3) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.receiving.r &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.r;
    }

    dx = this.getScreenP().x - Math.abs((x3 + x4) / 2) - p.x;
    dy = p.y - edge.b;

    if (
      this.receiving.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.b;
    }

    return null;
  }

  connect(receiveD: Direction, connectTarget: CoreTypes.ConnectTarget) {
    if (
      !this.receiving[receiveD] ||
      this.receiveFrom[receiveD]?.shape ||
      this.curves[receiveD]?.shape
    )
      return;

    const senderCurve =
      connectTarget.shape.curves[connectTarget.direction].shape;
    if (!senderCurve) return;
    // receiver
    this.receiveFrom[receiveD] = {
      shape: connectTarget.shape,
      sendD: connectTarget.direction,
    };
    // connectTarget
    connectTarget.shape.curves[connectTarget.direction].sendTo = {
      shape: this,
      receiveD: receiveD,
    };

    const thershold = 10;

    // define receive curve P2 position
    if (receiveD === Direction.l) {
      senderCurve.p2 = {
        x:
          this.p.x -
          connectTarget.shape.p.x -
          this.w / 2 -
          thershold +
          this.frameOffset / 2,
        y: this.p.y - connectTarget.shape.p.y,
      };
    } else if (receiveD === Direction.t) {
      senderCurve.p2 = {
        x: this.p.x - connectTarget.shape.p.x + this.frameOffset / 2,
        y: this.p.y - connectTarget.shape.p.y - this.h / 2 - thershold,
      };
    } else if (receiveD === Direction.r) {
      senderCurve.p2 = {
        x:
          this.p.x -
          connectTarget.shape.p.x +
          this.w / 2 +
          thershold -
          this.frameOffset / 2,
        y: this.p.y - connectTarget.shape.p.y,
      };
    } else if (receiveD === Direction.b) {
      senderCurve.p2 = {
        x: this.p.x - connectTarget.shape.p.x - this.frameOffset / 2,
        y: this.p.y - connectTarget.shape.p.y + this.h / 2 + thershold,
      };
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    const x1 = -this.getScaleSize().w / 2 + this.frameOffset * this.scale,
      y1 = -this.getScaleSize().h / 2,
      x2 = this.getScaleSize().w / 2,
      y2 = -this.getScaleSize().h / 2,
      x3 = this.getScaleSize().w / 2 - this.frameOffset * this.scale,
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

    super.draw(
      ctx,
      !this.curves.l.shape &&
        !this.curves.t.shape &&
        !this.curves.r.shape &&
        !this.curves.b.shape
    );
  }

  drawRecievingPoint(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    // draw receiving points
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    const x1 = -this.getScaleSize().w / 2 + this.frameOffset * this.scale,
      x2 = this.getScaleSize().w / 2,
      x3 = this.getScaleSize().w / 2 - this.frameOffset * this.scale,
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
        Math.abs(x1 + x2) / 2,
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
        -Math.abs(x3 + x4) / 2,
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
