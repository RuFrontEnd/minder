"use client";
import Core from "@/shapes/core";
import Curve from "@/shapes/curve";
import { tailwindColors } from "@/variables/colors";
import { Direction } from "@/types/common";
import * as CommonTypes from "@/types/common";

export default class Data extends Core {
  isFrameOpen: boolean;
  thersholdRatio: number;

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title
  ) {
    super(id, w, h, p, tailwindColors.shape.data, title);
    this.isFrameOpen = false;
    this.thersholdRatio = 1 / 10;
  }

  getCenterToCornerDistance() {
    const frameThreshold = this.w * this.thersholdRatio;
    return {
      tl: {
        x: -this.w / 2 + frameThreshold,
        y: -this.h / 2,
      },
      tr: {
        x: this.w / 2,
        y: -this.h / 2,
      },
      br: {
        x: this.w / 2 - frameThreshold,
        y: this.h / 2,
      },
      bl: {
        x: -this.w / 2,
        y: this.h / 2,
      },
    };
  }

  checkReceivingPointsBoundry(p: CommonTypes.Vec) {
    const corners = this.getCenterToCornerDistance(),
      edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx = this.p.x - Math.abs((corners.bl.x + corners.tl.x) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.l.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.l;
    }

    dx = this.p.x - p.x;
    dy = edge.t - p.y;

    if (
      this.__receivePoint__.t.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.t;
    }

    dx = this.p.x + Math.abs((corners.tr.x + corners.br.x) / 2) - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.r.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.r;
    }

    dx = this.p.x - p.x;
    dy = p.y - edge.b;

    if (
      this.__receivePoint__.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return CommonTypes.Direction.b;
    }

    return null;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    super.draw(ctx, offest, scale, () => {
      const screenP = this.getP(offest, scale);
      const centerToCornersDistance = this.getCenterToCornerDistance();

      ctx.save();
      ctx.translate(screenP.x, screenP.y);
      ctx.beginPath();
      ctx.moveTo(
        centerToCornersDistance.tl.x * scale,
        centerToCornersDistance.tl.y * scale
      );
      ctx.lineTo(
        centerToCornersDistance.tr.x * scale,
        centerToCornersDistance.tr.y * scale
      );
      ctx.lineTo(
        centerToCornersDistance.br.x * scale,
        centerToCornersDistance.br.y * scale
      );
      ctx.lineTo(
        centerToCornersDistance.bl.x * scale,
        centerToCornersDistance.bl.y * scale
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  drawRecievingPoint(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    ctx.save();
    ctx.translate(this.p.x, this.p.y);
    // draw receiving points
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    const centerToCornersDistance = this.getCenterToCornerDistance();

    const scaleSize = this.getScaleSize();

    // left
    if (this.__receivePoint__.l.visible) {
      if (this.__receivePoint__.l.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        -scaleSize.w / 2 +
          Math.abs(
            (centerToCornersDistance.tl.x - centerToCornersDistance.bl.x) *
              scale
          ) /
            2,
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
        -scaleSize.h / 2,
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
        scaleSize.w / 2 -
          Math.abs(
            (centerToCornersDistance.tr.x - centerToCornersDistance.br.x) *
              scale
          ) /
            2,
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
      ctx.arc(0, scaleSize.h / 2, this.anchor.size.fill, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.restore();
  }
}
