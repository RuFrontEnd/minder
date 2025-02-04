"use client";
import { tailwindColors } from "@/variables/colors";
import * as CommonTypes from "@/types/common";
import * as SelectionTypes from "@/types/shapes/selection";
import Core from "@/shapes/core";

const ds: [
  SelectionTypes.PressingTarget.l,
  SelectionTypes.PressingTarget.t,
  SelectionTypes.PressingTarget.r,
  SelectionTypes.PressingTarget.b
] = [
  SelectionTypes.PressingTarget.l,
  SelectionTypes.PressingTarget.t,
  SelectionTypes.PressingTarget.r,
  SelectionTypes.PressingTarget.b,
];

export default class Selection {
  private id: string;
  private c: {
    fill: string;
    stroke: string;
  } = {
    fill: tailwindColors.selectionFrame.fill,
    stroke: tailwindColors.selectionFrame.stroke,
  };
  private __w__: number = 0;
  private __h__: number = 0;
  private m: CommonTypes.Vec = { x: 0, y: 0 };
  private __shapes__: Core[] = [];
  private selectAnchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };
  protected __curveTrigger__: {
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
  anchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };

  constructor(id: string, shapes: Core[]) {
    this.id = id;
    this.__shapes__ = shapes;
  }

  set shapes(_shapes: Core[]) {
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

  push(shape: Core) {
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

            const ratioW = shape.getSize().w / range.w,
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

            const ratioH = shape.getSize().h / range.h,
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
            const ratioW = shape.getSize().w / range.w,
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
              shape.h = shape.getSize().h - unitH;

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
            const ratioW = shape.getSize().w / range.w,
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

            const ratioH = shape.getSize().h / range.h,
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
            const ratioW = shape.getSize().w / range.w,
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

            const ratioH = shape.getSize().h / range.h,
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
    const [startP, endP] = this.getP();

    const _m = {
      x: startP.x + endP.x,
      y: startP.x + endP.x,
    };

    return {
      m: _m,
      l: { x: edge.l, y: _m.y },
      t: { x: _m.x, y: edge.t },
      r: { x: edge.r, y: _m.y },
      b: { x: _m.x, y: edge.b },
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
      curveTrigger: {
        l: {
          x: edge.l - this.__curveTrigger__.distance,
          y: _m.y,
        },
        t: {
          x: _m.x,
          y: edge.t - this.__curveTrigger__.distance,
        },
        r: {
          x: edge.r + this.__curveTrigger__.distance,
          y: _m.y,
        },
        b: {
          x: _m.x,
          y: edge.b + this.__curveTrigger__.distance,
        },
      },
      receivingPoints: {
        l: {
          x: _m.x - this.__w__ / 2,
          y: _m.y,
        },
        t: {
          x: _m.x,
          y: _m.y - this.__h__ / 2,
        },
        r: {
          x: _m.x + this.__w__ / 2,
          y: _m.y,
        },
        b: {
          x: _m.x,
          y: _m.y + this.__h__ / 2,
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

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.lt;
    }

    dx = endP.x - p.x;
    dy = startP.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.rt;
    }

    dx = endP.x - p.x;
    dy = endP.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.rb;
    }

    dx = startP.x - p.x;
    dy = endP.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.lb;
    }

    // if inside

    if (
      p.x > startP.x - this.anchor.size.fill - threshold &&
      p.y > startP.y - this.anchor.size.fill - threshold &&
      p.x < endP.x + this.anchor.size.fill + threshold &&
      p.y < endP.y + this.anchor.size.fill + threshold
    ) {
      return SelectionTypes.PressingTarget.m;
    }

    // if trigger
    const edge = this.getEdge();
    const center = {
      x: (startP.x + endP.x) / 2,
      y: (startP.y + endP.y) / 2,
    };
    const curveTriggerP = {
      l: {
        x: edge.l - this.__curveTrigger__.distance,
        y: center.y,
      },
      t: {
        x: center.x,
        y: edge.t - this.__curveTrigger__.distance,
      },
      r: {
        x: edge.r + this.__curveTrigger__.distance,
        y: center.y,
      },
      b: {
        x: center.x,
        y: edge.b + this.__curveTrigger__.distance,
      },
    };

    for (const d of ds) {
      if (
        (p.x - curveTriggerP[d].x) * (p.x - curveTriggerP[d].x) +
          (p.y - curveTriggerP[d].y) * (p.y - curveTriggerP[d].y) <
        this.__curveTrigger__.size.fill * this.__curveTrigger__.size.fill
      ) {
        return d;
      }
    }

    return null;
  }

  // getP(offset: CommonTypes.Vec = { x: 0, y: 0 }, scale: number = 1) {
  //   return {
  //     x: (this.__p__.x + offset.x) * scale,
  //     y: (this.__p__.y + offset.y) * scale,
  //   };
  // }

  // getSize(scale: number = 1) {
  //   return {
  //     w: this.w * scale,
  //     h: this.h * scale,
  //   };
  // }

  // drawSendingPoint(
  //   ctx: CanvasRenderingContext2D,
  //   offest: CommonTypes.Vec = { x: 0, y: 0 },
  //   scale: number = 1
  // ) {
  //   if (!ctx) return;
  //   const screenP = this.getP(offest, scale);
  //   const scaleSize = this.getSize(scale);
  //   const curveTriggerDistance = this.__curveTrigger__.distance * scale;
  //   // draw curve triggers
  //   ctx.fillStyle = "white";
  //   ctx.strokeStyle = "DeepSkyBlue";
  //   ctx.lineWidth = this.strokeSize;

  //   ctx.save();
  //   ctx.translate(screenP.x, screenP.y);

  //   // left
  //   ctx.beginPath();
  //   ctx.arc(
  //     -scaleSize.w / 2 - curveTriggerDistance,
  //     0,
  //     this.anchor.size.fill,
  //     0,
  //     2 * Math.PI,
  //     false
  //   );
  //   ctx.stroke();
  //   ctx.fill();
  //   ctx.closePath();

  //   // top
  //   ctx.beginPath();
  //   ctx.arc(
  //     0,
  //     -scaleSize.h / 2 - curveTriggerDistance,
  //     this.anchor.size.fill,
  //     0,
  //     2 * Math.PI,
  //     false
  //   );
  //   ctx.stroke();
  //   ctx.fill();
  //   ctx.closePath();

  //   // right
  //   ctx.beginPath();
  //   ctx.arc(
  //     scaleSize.w / 2 + curveTriggerDistance,
  //     0,
  //     this.anchor.size.fill,
  //     0,
  //     2 * Math.PI,
  //     false
  //   );
  //   ctx.stroke();
  //   ctx.fill();
  //   ctx.closePath();

  //   // bottom
  //   ctx.beginPath();
  //   ctx.arc(
  //     0,
  //     scaleSize.h / 2 + curveTriggerDistance,
  //     this.__curveTrigger__.size.fill,
  //     0,
  //     2 * Math.PI,
  //     false
  //   );
  //   ctx.stroke();
  //   ctx.fill();
  //   ctx.closePath();

  //   ctx.restore();
  // }

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
