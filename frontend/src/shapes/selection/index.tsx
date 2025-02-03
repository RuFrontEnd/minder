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
  private __p__: {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
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
    const [_startP, _endP] = this.getMultiSelectingAreaP();
    this.__p__ = {
      start: _startP,
      end: _endP,
    };
    this.__w__ = Math.abs(_startP.x - _endP.x);
    this.__h__ = Math.abs(_startP.y - _endP.y);
  }

  private set p(p: { start: CommonTypes.Vec; end: CommonTypes.Vec }) {
    this.__p__ = p;
    this.m = {
      x: (this.__p__.start.x + this.__p__.end.x) / 2,
      y: (this.__p__.start.y + this.__p__.end.y) / 2,
    };
    this.__w__ = Math.abs(this.__p__.start.x - this.__p__.end.x);
    this.__h__ = Math.abs(this.__p__.start.y - this.__p__.end.y);
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
      | SelectionTypes.PressingTarget.lt
      | SelectionTypes.PressingTarget.rt
      | SelectionTypes.PressingTarget.rb
      | SelectionTypes.PressingTarget.lb,
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
      case SelectionTypes.PressingTarget.lt:
        {
          const canResize = {
            x: multiSelectingAreaSize.w - offsetP.x > 0 || offsetP.x < 0,
            y: multiSelectingAreaSize.h - offsetP.y > 0 || offsetP.y < 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;

            const ratioW = shape.getSize().w / multiSelectingAreaSize.w,
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

            const ratioH = shape.getSize().h / multiSelectingAreaSize.h,
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

      case SelectionTypes.PressingTarget.rt:
        {
          const canResize = {
            x: multiSelectingAreaSize.w + offsetP.x > 0 || offsetP.x > 0,
            y: multiSelectingAreaSize.h - offsetP.y > 0 || offsetP.y < 0,
          };

          const multiSelectingMap = this.getMultSelectingMap();

          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getSize().w / multiSelectingAreaSize.w,
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
              shape.h = shape.getSize().h - unitH / scale;

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

      case SelectionTypes.PressingTarget.rb:
        {
          const canResize = {
            x: multiSelectingAreaSize.w + offsetP.x > 0 || offsetP.x > 0,
            y: multiSelectingAreaSize.h + offsetP.y > 0 || offsetP.y > 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getSize().w / multiSelectingAreaSize.w,
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

            const ratioH = shape.getSize().h / multiSelectingAreaSize.h,
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

      case SelectionTypes.PressingTarget.lb:
        {
          const canResize = {
            x: multiSelectingAreaSize.w - offsetP.x > 0 || offsetP.x < 0,
            y: multiSelectingAreaSize.h + offsetP.y > 0 || offsetP.y > 0,
          };

          this.__shapes__.forEach((shape) => {
            if (!multiSelectingMap[shape.id]) return;
            const ratioW = shape.getSize().w / multiSelectingAreaSize.w,
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

            const ratioH = shape.getSize().h / multiSelectingAreaSize.h,
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

  getEdge() {
    return {
      l: this.__p__.start.x,
      t: this.__p__.start.y,
      r: this.__p__.end.x,
      b: this.__p__.end.y,
    };
  }

  getCenter(): SelectionTypes.GetCenterReturn {
    const edge = this.getEdge();
    const _m = {
      x: this.__p__.start.x + this.__p__.end.x,
      y: this.__p__.start.x + this.__p__.end.x,
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
    let dx, dy;

    // if corner
    dx = this.p.start.x - p.x;
    dy = this.p.start.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.lt;
    }

    dx = this.p.end.x - p.x;
    dy = this.p.start.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.rt;
    }

    dx = this.p.end.x - p.x;
    dy = this.p.end.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.rb;
    }

    dx = this.p.start.x - p.x;
    dy = this.p.end.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return SelectionTypes.PressingTarget.lb;
    }

    // if inside
    if (
      p.x > this.p.start.x - this.anchor.size.fill - threshold &&
      p.y > this.p.start.y - this.anchor.size.fill - threshold &&
      p.x < this.p.end.x + this.anchor.size.fill + threshold &&
      p.y < this.p.end.y + this.anchor.size.fill + threshold
    ) {
      return SelectionTypes.PressingTarget.m;
    }

    // if trigger
    const edge = this.getEdge();
    const center = {
      x: (this.p.start.x + this.p.end.x) / 2,
      y: (this.p.start.y + this.p.end.y) / 2,
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
