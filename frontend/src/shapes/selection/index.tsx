"use client";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import * as SelectionTypes from "@/types/shapes/selection";

const ds = [
  CommonTypes.Direction.l,
  CommonTypes.Direction.t,
  CommonTypes.Direction.r,
  CommonTypes.Direction.b,
];

export default class Selection {
  private __id__: string;
  private __c__: {
    fill: string;
    stroke: string;
  } = {
    fill: tailwindColors.white["500"],
    stroke: tailwindColors.info["500"],
  };
  private m: CommonTypes.Vec = { x: 0, y: 0 };
  private __shapes__: CommonTypes.Shape[] = [];
  static __sendingPoint__: {
    distance: number;
    size: {
      fill: number;
      stroke: number;
    };
  } = {
    distance: 48,
    size: {
      fill: 4,
      stroke: 2,
    },
  };
  private strokeSize = 1;
  private __anchor__ = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };

  constructor(id: string, shapes: CommonTypes.Shape[]) {
    this.__id__ = id;
    this.__shapes__ = shapes;
  }

  get id (){
    return this.__id__
  }

  set shapes(_shapes: CommonTypes.Shape[]) {
    this.shapes = _shapes;
  }

  get shapes() {
    return this.__shapes__;
  }

  getSelectingMap() {
    const map: { [id: string]: true } = {};

    this.__shapes__.forEach((shape) => {
      map[shape.id] = true;
    });

    return map;
  }

  getP() {
    const startP = { x: -1, y: -1 };
    const endP = { x: -1, y: -1 };
    const selectingMap = this.getSelectingMap();

    this.__shapes__.forEach((shape) => {
      if (!selectingMap[shape.id]) return;
      const shapeEdge = shape.getEdge();

      if (startP.x === -1 || shapeEdge.l < startP.x) {
        startP.x = shapeEdge.l;
      }
      if (startP.y === -1 || shapeEdge.t < startP.y) {
        startP.y = shapeEdge.t;
      }
      if (endP.x === -1 || shapeEdge.r > endP.x) {
        endP.x = shapeEdge.r;
      }
      if (endP.y === -1 || shapeEdge.b > endP.y) {
        endP.y = shapeEdge.b;
      }
    });

    return [startP, endP];
  }

  getM() {
    const [startP, endP] = this.getP();

    return {
      x: (startP.x + endP.x) / 2,
      y: (startP.y + endP.y) / 2,
    };
  }

  getSize() {
    const [startP, endP] = this.getP();

    return {
      w: Math.abs(endP.x - startP.x),
      h: Math.abs(endP.y - startP.y),
    };
  }

  push(shape: CommonTypes.Shape) {
    this.__shapes__.push(shape);
  }

  move(offsetP: CommonTypes.Vec) {
    this.__shapes__.forEach((shape) => {
      shape.move(offsetP);
    });
  }

  resize = (
    target:
      | null
      | undefined
      | SelectionTypes.PressingTarget.lt
      | SelectionTypes.PressingTarget.rt
      | SelectionTypes.PressingTarget.rb
      | SelectionTypes.PressingTarget.lb,
    offsetP: CommonTypes.Vec
  ) => {
    const [startP, endP] = this.getP();
    const range = {
      w: Math.abs(endP.x - startP.x),
      h: Math.abs(endP.y - startP.y),
    };
    const selectingMap = this.getSelectingMap();

    switch (target) {
      case SelectionTypes.PressingTarget.lt:
        {
          const canResize = {
            x: range.w - offsetP.x > 0 || offsetP.x < 0,
            y: range.h - offsetP.y > 0 || offsetP.y < 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!selectingMap[shape.id]) return;

            const ratioW = shape.w / range.w,
              unitW = offsetP.x * ratioW;

            if (canResize.x) {
              shape.w = shape.w - unitW;

              const dx = Math.abs(shape.p.x - endP.x),
                ratioX = dx / range.w,
                unitX = offsetP.x * ratioX;

              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX,
              };
            }

            const ratioH = shape.h / range.h,
              unitH = offsetP.y * ratioH;

            if (canResize.y) {
              shape.h = shape.h - unitH;

              const dy = Math.abs(shape.p.y - endP.y),
                ratioY = dy / range.h,
                unitY = offsetP.y * ratioY;

              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY,
              };
            }
          });
        }
        break;

      case SelectionTypes.PressingTarget.rt:
        {
          const canResize = {
            x: range.w + offsetP.x > 0 || offsetP.x > 0,
            y: range.h - offsetP.y > 0 || offsetP.y < 0,
          };

          const selectingMap = this.getSelectingMap();

          this.__shapes__.forEach((shape) => {
            if (!selectingMap[shape.id]) return;
            const ratioW = shape.w / range.w,
              unitW = offsetP.x * ratioW;

            if (canResize.x) {
              shape.w = shape.w + unitW;

              const dx = Math.abs(shape.p.x - startP.x),
                ratioX = dx / range.w,
                unitX = offsetP.x * ratioX;

              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX,
              };
            }

            const ratioH = shape.h / range.h,
              unitH = offsetP.y * ratioH;

            if (canResize.y) {
              shape.h = shape.h - unitH;

              const dy = Math.abs(shape.p.y - endP.y),
                ratioY = dy / range.h,
                unitY = offsetP.y * ratioY;

              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY,
              };
            }
          });
        }
        break;

      case SelectionTypes.PressingTarget.rb:
        {
          const canResize = {
            x: range.w + offsetP.x > 0 || offsetP.x > 0,
            y: range.h + offsetP.y > 0 || offsetP.y > 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!selectingMap[shape.id]) return;
            const ratioW = shape.w / range.w,
              unitW = offsetP.x * ratioW;

            if (canResize.x) {
              shape.w = shape.w + unitW;

              const dx = Math.abs(shape.p.x - startP.x),
                ratioX = dx / range.w,
                unitX = offsetP.x * ratioX;

              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX,
              };
            }

            const ratioH = shape.h / range.h,
              unitH = offsetP.y * ratioH;

            if (canResize.y) {
              shape.h = shape.h + unitH;

              const dy = Math.abs(shape.p.y - startP.y),
                ratioY = dy / range.h,
                unitY = offsetP.y * ratioY;

              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY,
              };
            }
          });
        }
        break;

      case SelectionTypes.PressingTarget.lb:
        {
          const canResize = {
            x: range.w - offsetP.x > 0 || offsetP.x < 0,
            y: range.h + offsetP.y > 0 || offsetP.y > 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!selectingMap[shape.id]) return;
            const ratioW = shape.w / range.w,
              unitW = offsetP.x * ratioW;

            if (canResize.x) {
              shape.w = shape.w - unitW;

              const dx = Math.abs(shape.p.x - endP.x),
                ratioX = dx / range.w,
                unitX = offsetP.x * ratioX;

              shape.p = {
                ...shape.p,
                x: shape.p.x + unitX,
              };
            }

            const ratioH = shape.h / range.h,
              unitH = offsetP.y * ratioH;

            if (canResize.y) {
              shape.h = shape.h + unitH;

              const dy = Math.abs(shape.p.y - startP.y),
                ratioY = dy / range.h,
                unitY = offsetP.y * ratioY;

              shape.p = {
                ...shape.p,
                y: shape.p.y + unitY,
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

  getEdge() {
    const [startP, endP] = this.getP();

    return {
      l: startP.x,
      t: startP.y,
      r: endP.x,
      b: endP.y,
    };
  }

  getCenter(): SelectionTypes.GetCenterReturn {
    const edge = this.getEdge();
    const _m = this.getM();
    const size = this.getSize();

    return {
      m: _m,
      lt: {
        x: edge.l,
        y: edge.t,
      },
      rt: {
        x: edge.r,
        y: edge.t,
      },
      rb: {
        x: edge.r,
        y: edge.b,
      },
      lb: {
        x: edge.l,
        y: edge.b,
      },
      sendingPoint: {
        l: {
          x: edge.l - Selection.__sendingPoint__.distance,
          y: _m.y,
        },
        t: {
          x: _m.x,
          y: edge.t - Selection.__sendingPoint__.distance,
        },
        r: {
          x: edge.r + Selection.__sendingPoint__.distance,
          y: _m.y,
        },
        b: {
          x: _m.x,
          y: edge.b + Selection.__sendingPoint__.distance,
        },
      },
      receivingPoints: {
        l: {
          x: _m.x - size.w / 2,
          y: _m.y,
        },
        t: {
          x: _m.x,
          y: _m.y - size.h / 2,
        },
        r: {
          x: _m.x + size.w / 2,
          y: _m.y,
        },
        b: {
          x: _m.x,
          y: _m.y + size.h / 2,
        },
      },
    };
  }

  checkBoundry(p: CommonTypes.Vec, threshold: number = 0) {
    const [startP, endP] = this.getP();

    let dx, dy;

    // if corner
    dx = startP.x - p.x;
    dy = startP.y - p.y;

    if (
      dx * dx + dy * dy <
      this.__anchor__.size.fill * this.__anchor__.size.fill
    ) {
      return SelectionTypes.PressingTarget.lt;
    }

    dx = endP.x - p.x;
    dy = startP.y - p.y;

    if (
      dx * dx + dy * dy <
      this.__anchor__.size.fill * this.__anchor__.size.fill
    ) {
      return SelectionTypes.PressingTarget.rt;
    }

    dx = endP.x - p.x;
    dy = endP.y - p.y;

    if (
      dx * dx + dy * dy <
      this.__anchor__.size.fill * this.__anchor__.size.fill
    ) {
      return SelectionTypes.PressingTarget.rb;
    }

    dx = startP.x - p.x;
    dy = endP.y - p.y;

    if (
      dx * dx + dy * dy <
      this.__anchor__.size.fill * this.__anchor__.size.fill
    ) {
      return SelectionTypes.PressingTarget.lb;
    }

    // if inside
    if (
      p.x > startP.x - this.__anchor__.size.fill - threshold &&
      p.y > startP.y - this.__anchor__.size.fill - threshold &&
      p.x < endP.x + this.__anchor__.size.fill + threshold &&
      p.y < endP.y + this.__anchor__.size.fill + threshold
    ) {
      return SelectionTypes.PressingTarget.m;
    }

    // if click sending points
    if (this.shapes.length === 1) {
      const edge = this.getEdge();
      const m = this.getM();
      const sendingPointP = {
        l: {
          x: edge.l - Selection.__sendingPoint__.distance,
          y: m.y,
        },
        t: {
          x: m.x,
          y: edge.t - Selection.__sendingPoint__.distance,
        },
        r: {
          x: edge.r + Selection.__sendingPoint__.distance,
          y: m.y,
        },
        b: {
          x: m.x,
          y: edge.b + Selection.__sendingPoint__.distance,
        },
      };

      const sendingPointPressingTargetStrategy = {
        [CommonTypes.Direction.l]: SelectionTypes.PressingTarget.sl,
        [CommonTypes.Direction.t]: SelectionTypes.PressingTarget.st,
        [CommonTypes.Direction.r]: SelectionTypes.PressingTarget.sr,
        [CommonTypes.Direction.b]: SelectionTypes.PressingTarget.sb,
      };

      for (const d of ds) {
        if (
          (p.x - sendingPointP[d].x) * (p.x - sendingPointP[d].x) +
            (p.y - sendingPointP[d].y) * (p.y - sendingPointP[d].y) <
          Selection.__sendingPoint__.size.fill * Selection.__sendingPoint__.size.fill
        ) {
          return sendingPointPressingTargetStrategy[d];
        }
      }
    }

    return null;
  }

  drawSendingPoint(
    ctx: CanvasRenderingContext2D,
    offest: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    if (!ctx) return;
    const m = this.getM();
    const size = this.getSize();
    const screenM = {
      x: (m.x + offest.x) * scale,
      y: (m.y + offest.y) * scale,
    };
    const scaleSize = { w: size.w * scale, h: size.h * scale };
    const sendingPointDistance = Selection.__sendingPoint__.distance * scale;

    ctx.fillStyle = this.__c__.fill;
    ctx.strokeStyle = this.__c__.stroke;
    ctx.lineWidth = this.strokeSize;

    ctx.save();

    ctx.translate(screenM.x, screenM.y);

    // left
    ctx.beginPath();
    ctx.arc(
      -scaleSize.w / 2 - sendingPointDistance,
      0,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // top
    ctx.beginPath();
    ctx.arc(
      0,
      -scaleSize.h / 2 - sendingPointDistance,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // right
    ctx.beginPath();
    ctx.arc(
      scaleSize.w / 2 + sendingPointDistance,
      0,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    // bottom
    ctx.beginPath();
    ctx.arc(
      0,
      scaleSize.h / 2 + sendingPointDistance,
      Selection.__sendingPoint__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.restore();
  }

  draw(
    ctx: undefined | null | CanvasRenderingContext2D,
    offset: CommonTypes.Vec = { x: 0, y: 0 },
    scale: number = 1
  ) {
    if (!ctx) return;

    const [startP, endP] = this.getP();

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

    // draw area
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

    // draw anchors
    ctx.fillStyle = "white";
    ctx.lineWidth = this.__anchor__.size.stroke;
    // left, top
    ctx?.beginPath();
    ctx.arc(
      screenStartP.x,
      screenStartP.y,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    // right, top
    ctx?.beginPath();
    ctx.arc(
      screenEndP.x,
      screenStartP.y,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    // right, bottom
    ctx?.beginPath();
    ctx.arc(
      screenEndP.x,
      screenEndP.y,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    // left, bottom
    ctx?.beginPath();
    ctx.arc(
      screenStartP.x,
      screenEndP.y,
      this.__anchor__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx?.closePath();

    if (this.__shapes__.length === 1) {
      this.drawSendingPoint(ctx, offset, scale);
    }
  }
}
