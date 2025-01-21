"use client";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import Core from "@/shapes/core";

export default class Selection {
  private id: string;
  private c: {
    fill: string;
    stroke: string;
  } = {
    fill: tailwindColors.selectionFrame.fill,
    stroke: tailwindColors.selectionFrame.stroke,
  };
  private __p__: {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
  };
  private m: CommonTypes.Vec = { x: 0, y: 0 };
  private __shapes__: Core[] = [];
  private selectAnchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };

  constructor(id: string, shapes: Core[]) {
    this.id = id;
    this.__shapes__ = shapes;
    const [_startP, _endP] = this.getMultiSelectingAreaP();
    this.__p__ = {
      start: _startP,
      end: _endP,
    };
  }

  set p(p: { start: CommonTypes.Vec; end: CommonTypes.Vec }) {
    this.__p__ = p;
    this.m = {
      x: (this.__p__.start.x + this.__p__.end.x) / 2,
      y: (this.__p__.start.y + this.__p__.end.y) / 2,
    };
  }

  get p() {
    return this.__p__;
  }

  set shapes(_shapes: Core[]) {
    this.shapes = _shapes;
  }

  get shapes() {
    return this.__shapes__;
  }

  getMultSelectingMap() {
    const map: { [id: string]: true } = {};

    this.__shapes__.forEach((shape) => {
      map[shape.id] = true;
    });

    return map;
  }

  getMultiSelectingAreaP() {
    const startP = { x: -1, y: -1 };
    const endP = { x: -1, y: -1 };

    const multiSelectingMap = this.getMultSelectingMap();

    this.__shapes__.forEach((shape) => {
      if (!multiSelectingMap[shape.id]) return;
      const theEdge = shape.getEdge();
      if (startP.x === -1 || theEdge.l < startP.x) {
        startP.x = theEdge.l;
      }
      if (startP.y === -1 || theEdge.t < startP.y) {
        startP.y = theEdge.t;
      }
      if (endP.x === -1 || theEdge.r > endP.x) {
        endP.x = theEdge.r;
      }
      if (endP.y === -1 || theEdge.b > endP.y) {
        endP.y = theEdge.b;
      }
    });

    return [startP, endP];
  }

  push(shape: Core) {
    this.__shapes__.push(shape);
  }

  move(offset: CommonTypes.Vec) {
    this.__shapes__.forEach((shape) => {
      shape.move(offset);
    });
  }

  resize = (
    target:
      | null
      | undefined
      | CommonTypes.SelectAreaTarget.lt
      | CommonTypes.SelectAreaTarget.rt
      | CommonTypes.SelectAreaTarget.rb
      | CommonTypes.SelectAreaTarget.lb,
    offsetP: CommonTypes.Vec,
    scale = 1
  ) => {
    const [multiSelectingAreaStartP, multiSelectingAreaEndP] =
      this.getMultiSelectingAreaP();
    const multiSelectingAreaP = {
      start: multiSelectingAreaStartP,
      end: multiSelectingAreaEndP,
    };
    const multiSelectingAreaSize = {
      w: Math.abs(multiSelectingAreaP.end.x - multiSelectingAreaP.start.x),
      h: Math.abs(multiSelectingAreaP.end.y - multiSelectingAreaP.start.y),
    };
    const multiSelectingMap = this.getMultSelectingMap();
  
    switch (target) {
      case CommonTypes.SelectAreaTarget.lt:
        {
          const canResize = {
            x: multiSelectingAreaSize.w - offsetP.x > 0 || offsetP.x < 0,
            y: multiSelectingAreaSize.h - offsetP.y > 0 || offsetP.y < 0,
          };
  
          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
  
            const ratioW = shape.getScaleSize().w / multiSelectingAreaSize.w,
              unitW = offsetP.x * ratioW;
  
            if (canResize.x) {
              shape.w = shape.w - unitW / scale;
  
              const dx = Math.abs(shape.p.x - multiSelectingAreaP.end.x),
                ratioX = dx / multiSelectingAreaSize.w,
                unitX = offsetP.x * ratioX;
  
              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX / scale,
              };
            }
  
            const ratioH = shape.getScaleSize().h / multiSelectingAreaSize.h,
              unitH = offsetP.y * ratioH;
  
            if (canResize.y) {
              shape.h = shape.h - unitH / scale;
  
              const dy = Math.abs(shape.p.y - multiSelectingAreaP.end.y),
                ratioY = dy / multiSelectingAreaSize.h,
                unitY = offsetP.y * ratioY;
  
              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY / scale,
              };
            }
          });
        }
        break;
  
      case CommonTypes.SelectAreaTarget.rt:
        {
          const canResize = {
            x: multiSelectingAreaSize.w + offsetP.x > 0 || offsetP.x > 0,
            y: multiSelectingAreaSize.h - offsetP.y > 0 || offsetP.y < 0,
          };
  
          const multiSelectingMap = this.getMultSelectingMap();
  
          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getScaleSize().w / multiSelectingAreaSize.w,
              unitW = offsetP.x * ratioW;
  
            if (canResize.x) {
              shape.w = shape.w + unitW / scale;
  
              const dx = Math.abs(shape.p.x - multiSelectingAreaP.start.x),
                ratioX = dx / multiSelectingAreaSize.w,
                unitX = offsetP.x * ratioX;
  
              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX / scale,
              };
            }
  
            const ratioH = shape.h / multiSelectingAreaSize.h,
              unitH = offsetP.y * ratioH;
  
            if (canResize.y) {
              shape.h = shape.getScaleSize().h - unitH / scale;
  
              const dy = Math.abs(shape.p.y - multiSelectingAreaP.end.y),
                ratioY = dy / multiSelectingAreaSize.h,
                unitY = offsetP.y * ratioY;
  
              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY / scale,
              };
            }
          });
        }
        break;
  
      case CommonTypes.SelectAreaTarget.rb:
        {
          const canResize = {
            x: multiSelectingAreaSize.w + offsetP.x > 0 || offsetP.x > 0,
            y: multiSelectingAreaSize.h + offsetP.y > 0 || offsetP.y > 0,
          };

  
          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getScaleSize().w / multiSelectingAreaSize.w,
              unitW = offsetP.x * ratioW;
  
            if (canResize.x) {
              shape.w = shape.w + unitW / scale;
  
              const dx = Math.abs(shape.p.x - multiSelectingAreaP.start.x),
                ratioX = dx / multiSelectingAreaSize.w,
                unitX = offsetP.x * ratioX;
  
              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX / scale,
              };
            }
  
            const ratioH = shape.getScaleSize().h / multiSelectingAreaSize.h,
              unitH = offsetP.y * ratioH;
  
            if (canResize.y) {
              shape.h = shape.h + unitH / scale;
  
              const dy = Math.abs(shape.p.y - multiSelectingAreaP.start.y),
                ratioY = dy / multiSelectingAreaSize.h,
                unitY = offsetP.y * ratioY;
  
              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY / scale,
              };
            }
          });
        }
        break;
  
      case CommonTypes.SelectAreaTarget.lb:
        {
          const canResize = {
            x: multiSelectingAreaSize.w - offsetP.x > 0 || offsetP.x < 0,
            y: multiSelectingAreaSize.h + offsetP.y > 0 || offsetP.y > 0,
          };
  
          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getScaleSize().w / multiSelectingAreaSize.w,
              unitW = offsetP.x * ratioW;
  
            if (canResize.x) {
              shape.w = shape.w - unitW / scale;
  
              const dx = Math.abs(shape.p.x - multiSelectingAreaP.end.x),
                ratioX = dx / multiSelectingAreaSize.w,
                unitX = offsetP.x * ratioX;
  
              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX / scale,
              };
            }
  
            const ratioH = shape.getScaleSize().h / multiSelectingAreaSize.h,
              unitH = offsetP.y * ratioH;
  
            if (canResize.y) {
              shape.h = shape.h + unitH / scale;
  
              const dy = Math.abs(shape.p.y - multiSelectingAreaP.start.y),
                ratioY = dy / multiSelectingAreaSize.h,
                unitY = offsetP.y * ratioY;
  
              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY / scale,
              };
            }
          });
        }
  
        break;
    }
  };

  locate(p: { x: null | number; y: null | number }) {
    if (!p.x && !p.y) return;
    const offsetP = { x: 0, y: 0 };

    if (!!p.x) {
      offsetP.x = p.x - this.m.x;
    }

    if (!!p.y) {
      offsetP.y = p.y - this.m.y;
    }

    this.__shapes__.forEach((shape) => {
      shape.move(offsetP);
    });
  }

  draw(
    ctx: undefined | null | CanvasRenderingContext2D,
    offset: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    if (!ctx) return;

    const [startP, endP] = this.getMultiSelectingAreaP();

    if (startP.x === -1 || startP.y === -1 || endP.x === -1 || endP.y === -1)
      return;

    const screenStartP = {
      x: (startP.x + offset.x) * scale,
      y: (startP.y + offset.y) * scale,
    };
    const screenEndP = {
      x: (endP.x + offset.x) * scale,
      y: (endP.y + offset.y) * scale,
    };

    // draw multiSelect area
    ctx?.beginPath();
    ctx.strokeStyle = tailwindColors.info["500"];
    ctx.lineWidth = 1;
    ctx.strokeRect(
      screenStartP.x,
      screenStartP.y,
      screenEndP.x - screenStartP.x,
      screenEndP.y - screenStartP.y
    );
    ctx?.closePath();

    // draw multiSelect area anchors
    ctx.fillStyle = "white";
    ctx.lineWidth = this.selectAnchor.size.stroke;

    ctx?.beginPath();
    ctx.arc(
      screenStartP.x,
      screenStartP.y,
      this.selectAnchor.size.fill,
      0,
      2 * Math.PI,
      false
    ); // left, top
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    ctx?.beginPath();
    ctx.arc(
      screenEndP.x,
      screenStartP.y,
      this.selectAnchor.size.fill,
      0,
      2 * Math.PI,
      false
    ); // right, top
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    ctx?.beginPath();
    ctx.arc(
      screenEndP.x,
      screenEndP.y,
      this.selectAnchor.size.fill,
      0,
      2 * Math.PI,
      false
    ); // right, bottom
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    ctx?.beginPath();
    ctx.arc(
      screenStartP.x,
      screenEndP.y,
      this.selectAnchor.size.fill,
      0,
      2 * Math.PI,
      false
    ); // left, bottom
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();
  }
}
