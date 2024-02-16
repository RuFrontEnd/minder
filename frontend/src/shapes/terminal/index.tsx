"use client";
import Core from "@/shapes/core";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Decision from "@/shapes/decision";
import { ConnectTarget } from "@/types/shapes/core";
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
import { cloneDeep } from "lodash";

export default class Terminal extends Core {
  isStart: boolean;
  title: Title;

  constructor(id: Id, w: W, h: H, p: Vec, c: C, isStart: boolean) {
    super(id, w, h, p, c);
    this.isStart = isStart;
    this.title = "";
  }

  onDataChange = (title: Title, isStart: boolean) => {
    this.title = title;
    this.isStart = isStart;
  };

  onMouseUp(p: Vec, sender?: ConnectTarget) {
    super.onMouseUp(p, sender, {
      l: { x: -10, y: 0 },
      t: { x: 0, y: -10 },
      r: { x: 10, y: 0 },
      b: { x: 0, y: 10 },
    });
  }

  //TODO: decide DFS or not
  // onTraversal() {
  //   if (!this.isStart) return;

  //   const stack: (Core | Process | Data | Decision)[] = [this],
  //     path: { [path: string]: boolean } = {},
  //     ds = [Direction.l, Direction.t, Direction.r, Direction.b];

  //   while (stack.length !== 0) {
  //     const shape = stack[stack.length - 1];
  //     console.log('stack',stack)

  //     // const newOptions: DataType = [];

  //     // if (shape instanceof Data) {
  //     //   shape.data.forEach((dataItem) => {
  //     //     newOptions.push(dataItem);
  //     //   });
  //     // }

  //     let found = false;

  //     for (let d of ds) {
  //       let sendShape = shape.sendTo[d]?.shape;

  //       if (sendShape) {
  //         // sendShape.options = newOptions;

  //         stack.push(sendShape);

  //         // let currentPath = "";

  //         // stack.forEach((shape) => {
  //         //   currentPath += shape.id;
  //         // });

  //         // path[currentPath] = true;

  //         found = true;

  //         break;
  //       }
  //     }

  //     if (!found) {
  //       stack.pop();
  //     }
  //   }
  // }

  onTraversal() {
    if (!this.isStart) return;
    // traversal all relational steps
    const queue: (Core | Process | Data | Decision)[] = [this],
      locks = { [this.id]: { l: false, t: false, r: false, b: false } }, // prevent from graph cycle
      options: DataType = [];

    let ds = [Direction.l, Direction.t, Direction.r, Direction.b];

    // [1,2,3,2]

    while (queue.length !== 0) {
      const shape = queue[0];
      console.log("shape", shape);

      shape.options = cloneDeep(options); // give options to the shape

      if (shape instanceof Data) {
        shape.data.forEach((dataItem) => {
          options.push(dataItem);
        });
      }

      ds.forEach((d) => {
        const connectTarget: ConnectTarget = shape.sendTo[d];

        if (!connectTarget) return;

        const hasLock = locks[connectTarget.shape.id];

        if (!hasLock) {
          locks[connectTarget.shape.id] = {
            l: false,
            t: false,
            r: false,
            b: false,
          };
        }

        const hasDirectLock = locks[connectTarget.shape.id][d];

        if (!hasDirectLock) {
          queue.push(connectTarget.shape);
          locks[connectTarget.shape.id][d] = true;
        }
      });

      queue.shift();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getOffsetP().x, this.getOffsetP().y);
    ctx.fillStyle = this.c;

    if (this.w >= this.h) {
      let r = this.h / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(-this.w / 2 + r, 0, r, 0, 2 * Math.PI);
      ctx.arc(this.w / 2 - r, 0, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(-this.w / 2 + r, -r, this.w - 2 * r, this.h);
    } else if (this.w < this.h) {
      let r = this.w / 2;
      ctx.beginPath();
      ctx.fillStyle = this.c;
      ctx.arc(0, -this.h / 2 + r, r, 0, 2 * Math.PI);
      ctx.arc(0, this.h / 2 - r, r, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillRect(-r, -this.h / 2 + r, this.w, this.h - 2 * r);
    }

    ctx.restore();

    super.draw(
      ctx,
      !this.curves.l && !this.curves.t && !this.curves.r && !this.curves.b
    );
  }
}
