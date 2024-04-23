"use client";
import Core from "@/shapes/core";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Decision from "@/shapes/decision";
import { cloneDeep } from "lodash";
import * as TerminatorTypes from "@/types/shapes/terminator";
import * as CommonTypes from "@/types/shapes/common";

export default class Terminal extends Core {
  isStart: TerminatorTypes.IsStart;

  constructor(
    id: CommonTypes.Id,
    w: CommonTypes.W,
    h: CommonTypes.H,
    p: CommonTypes.Vec,
    title: CommonTypes.Title,
    _isStart: TerminatorTypes.IsStart
  ) {
    super(id, w, h, p, "#FFB100", title);
    this.isStart = _isStart;
  }

  onDataChange = (title: CommonTypes.Title) => {
    this.title = title;
  };

  // onTraversal() {
  //   // traversal all relational steps
  //   const queue: Core[] = [this],
  //     locks = { [this.id]: { l: false, t: false, r: false, b: false } }, // prevent from graph cycle
  //     ds = [
  //       CommonTypes.Direction.l,
  //       CommonTypes.Direction.t,
  //       CommonTypes.Direction.r,
  //       CommonTypes.Direction.b,
  //     ];

  //   while (queue.length !== 0) {
  //     const shape = queue[0];

  //     const newOptions: CommonTypes.Data = cloneDeep(shape.options);

  //     if (shape instanceof Data) {
  //       shape.data.forEach((dataItem) => {
  //         newOptions.push(dataItem);
  //       });
  //     }

  //     ds.forEach((d) => {
  //       const theSendTo = shape.curves[d].sendTo;

  //       if (!theSendTo) return;
  //       theSendTo.shape.options = newOptions;

  //       const hasLock = locks[theSendTo.shape.id];

  //       if (!hasLock) {
  //         locks[theSendTo.shape.id] = {
  //           l: false,
  //           t: false,
  //           r: false,
  //           b: false,
  //         };
  //       }

  //       const hasDirectLock = locks[theSendTo.shape.id][d];

  //       if (!hasDirectLock) {
  //         queue.push(theSendTo.shape);
  //         locks[theSendTo.shape.id][d] = true;
  //       }
  //     });

  //     queue.shift();
  //   }
  // }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    if (this.getScaleSize().w >= this.getScaleSize().h) {
      let r = this.getScaleSize().h / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(-this.getScaleSize().w / 2 + r, 0, r, 0, 2 * Math.PI);
      ctx.arc(this.getScaleSize().w / 2 - r, 0, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(
        -this.getScaleSize().w / 2 + r,
        -r,
        this.getScaleSize().w - 2 * r,
        this.getScaleSize().h
      );
    } else if (this.getScaleSize().w < this.getScaleSize().h) {
      let r = this.getScaleSize().w / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(0, -this.getScaleSize().h / 2 + r, r, 0, 2 * Math.PI);
      ctx.arc(0, this.getScaleSize().h / 2 - r, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(
        -r,
        -this.getScaleSize().h / 2 + r,
        this.getScaleSize().w,
        this.getScaleSize().h - 2 * r
      );
    }

    ctx.restore();

    super.draw(ctx);
  }
}
