"use client";
import Curve from "@/shapes/curve";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import { Line, PressingP as CurvePressingP } from "@/types/shapes/curve";
import {
  PressingTarget,
  ConnectTarget,
  CurveOffset,
} from "@/types/shapes/core";
import { Title } from "@/types/shapes/common";

export default class Core {
  id: string;
  c: string;
  private anchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };
  private curveTrigger: {
    d: number;
    size: {
      fill: number;
      stroke: number;
    };
    cpline: Line;
    curve: Line;
  } = {
    d: 100, // 30
    size: {
      fill: 4,
      stroke: 2,
    },
    cpline: {
      w: 1,
      c: "#c00",
    },
    curve: {
      w: 2,
      c: "#333",
    },
  };
  private strokeSize = 2;
  private initPressing = {
    activate: false,
    target: null,
  };
  private initOffset = {
    x: 0,
    y: 0,
  };
  private initScale = 1;
  w: number;
  h: number;
  minW: number;
  minH: number;
  title: Title;
  p: Vec;
  curves: {
    l: null | Curve;
    t: null | Curve;
    r: null | Curve;
    b: null | Curve;
  };
  selecting: boolean;
  receiving: {
    l: boolean;
    t: boolean;
    r: boolean;
    b: boolean;
  };
  pressing: {
    activate: boolean;
    target: PressingTarget | null;
  };
  receiveFrom: {
    l: ConnectTarget;
    t: ConnectTarget;
    r: ConnectTarget;
    b: ConnectTarget;
  };
  sendTo: {
    l: ConnectTarget;
    t: ConnectTarget;
    r: ConnectTarget;
    b: ConnectTarget;
  };
  dragP:
    | Vec
    | {
        x: null;
        y: null;
      };
  options: DataType;
  selectedData: DataType;
  redundancies: DataType;
  __offset__: Vec;
  __scale__: number;

  constructor(id: string, w: number, h: number, p: Vec, c: string) {
    this.id = id;
    this.c = c;
    this.w = w;
    this.h = h;
    this.minW = 100;
    this.minH = 100;
    this.title = "";
    this.p = p;
    this.curves = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
    this.selecting = false;
    this.receiving = {
      l: false,
      t: false,
      r: false,
      b: false,
    };
    this.pressing = this.initPressing;
    this.receiveFrom = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
    this.sendTo = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
    this.dragP = {
      x: null,
      y: null,
    };
    this.options = [];
    this.selectedData = [];
    this.redundancies = [];
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  set scale(value: number) {
    this.__scale__ = value;

    const curve = this.curves;

    if (curve?.l) {
      curve.l.scale = value;
    }
    if (curve?.t) {
      curve.t.scale = value;
    }
    if (curve?.r) {
      curve.r.scale = value;
    }
    if (curve?.b) {
      curve.b.scale = value;
    }
  }

  getScreenP = () => {
    return {
      x: (this.p.x + this.__offset__.x) * this.__scale__,
      y: (this.p.y + this.__offset__.y) * this.__scale__,
    };
  };

  getScaleSize = () => {
    return {
      w: this.w * this.__scale__,
      h: this.h * this.__scale__,
      minW: this.minW * this.__scale__,
      minH: this.minH * this.__scale__,
    };
  };

  getScaleCurveTriggerDistance = () => {
    return this.curveTrigger.d * this.__scale__;
  };

  getEdge = () => {
    return {
      l: this.getScreenP().x - this.getScaleSize().w / 2,
      t: this.getScreenP().y - this.getScaleSize().h / 2,
      r: this.getScreenP().x + this.getScaleSize().w / 2,
      b: this.getScreenP().y + this.getScaleSize().h / 2,
    };
  };

  getCenter = () => {
    const edge = this.getEdge();
    const pivot = {
      x: this.getScreenP().x,
      y: this.getScreenP().y,
    };

    return {
      m: pivot,
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
          x: edge.l - this.getScaleCurveTriggerDistance(),
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: edge.t - this.getScaleCurveTriggerDistance(),
        },
        r: {
          x: edge.r + this.getScaleCurveTriggerDistance(),
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: edge.b + this.getScaleCurveTriggerDistance(),
        },
      },
      receivingPoints: {
        l: {
          x: pivot.x - this.getScaleSize().w / 2,
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: pivot.y - this.getScaleSize().h / 2,
        },
        r: {
          x: pivot.x + this.getScaleSize().w / 2,
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: pivot.y + this.getScaleSize().h / 2,
        },
      },
    };
  };

  checkBoundry(p: Vec) {
    const edge = this.getEdge();

    return (
      p.x > edge.l - this.anchor.size.fill &&
      p.y > edge.t - this.anchor.size.fill &&
      p.x < edge.r + this.anchor.size.fill &&
      p.y < edge.b + this.anchor.size.fill
    );
  }

  checkVertexesBoundry = (p: Vec) => {
    const edge = this.getEdge();

    let dx, dy;

    dx = edge.l - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "lt",
      };
    }

    dx = edge.r - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "rt",
      };
    }

    dx = edge.r - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "rb",
      };
    }

    dx = edge.l - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "lb",
      };
    }

    return {
      activate: false,
      direction: null,
    };
  };

  checkReceivingBoundry = (p: Vec) => {
    const edge = this.getEdge();

    const receivingBoundryOffset = 75;

    return (
      p.x > edge.l - receivingBoundryOffset &&
      p.y > edge.t - receivingBoundryOffset &&
      p.x < edge.r + receivingBoundryOffset &&
      p.y < edge.b + receivingBoundryOffset
    );
  };

  checkReceivingPointsBoundry = (p: Vec) => {
    const edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx = edge.l - p.x;
    dy = center.m.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.l,
      };
    }

    dx = center.m.x - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.t,
      };
    }

    dx = p.x - edge.r;
    dy = center.m.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.r,
      };
    }

    dx = center.m.x - p.x;
    dy = p.y - edge.b;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.b,
      };
    }

    return {
      activate: false,
      direction: null,
    };
  };

  checkCurveTriggerBoundry = (p: Vec) => {
    const center = this.getCenter();

    if (
      // l curve trigger
      (p.x - center.curveTrigger.l.x) * (p.x - center.curveTrigger.l.x) +
        (p.y - center.curveTrigger.l.y) * (p.y - center.curveTrigger.l.y) <
      this.curveTrigger.size.fill * this.curveTrigger.size.fill
    ) {
      return Direction.l;
    } else if (
      // t curve trigger
      (p.x - center.curveTrigger.t.x) * (p.x - center.curveTrigger.t.x) +
        (p.y - center.curveTrigger.t.y) * (p.y - center.curveTrigger.t.y) <
      this.curveTrigger.size.fill * this.curveTrigger.size.fill
    ) {
      return Direction.t;
    } else if (
      // r curve trigger
      (p.x - center.curveTrigger.r.x) * (p.x - center.curveTrigger.r.x) +
        (p.y - center.curveTrigger.r.y) * (p.y - center.curveTrigger.r.y) <
      this.curveTrigger.size.fill * this.curveTrigger.size.fill
    ) {
      return Direction.r;
    } else if (
      // b curve trigger
      (p.x - center.curveTrigger.b.x) * (p.x - center.curveTrigger.b.x) +
        (p.y - center.curveTrigger.b.y) * (p.y - center.curveTrigger.b.y) <
      this.curveTrigger.size.fill * this.curveTrigger.size.fill
    ) {
      return Direction.b;
    }
  };

  resetConnection = (direction: Direction, fromSender: boolean) => {
    if (fromSender) {
      const receiverShape = this.sendTo[direction]?.shape,
        receiverDirection = this.sendTo[direction]?.direction;

      if (receiverShape && receiverDirection) {
        receiverShape.receiveFrom[receiverDirection] = null;
        this.sendTo[direction] = null;
      }
    } else {
      const senderShape = this.receiveFrom[direction]?.shape,
        senderDirection = this.receiveFrom[direction]?.direction;

      if (senderShape && senderDirection) {
        senderShape.sendTo[senderDirection] = null;
        this.receiveFrom[direction] = null;
      }
    }
  };

  senderHoldCurveP2Cp2Position = (
    direction: Direction,
    xOffset: number,
    yOffset: number,
    canResizeX?: boolean,
    canResizeY?: boolean
  ) => {
    const curve = this.curves[direction];

    if (!curve?.p2 || !curve.cp2) return;

    if (canResizeX) {
      curve.p2 = {
        ...curve.p2,
        x: curve.p2.x - xOffset / 2 / this.__scale__,
      };

      curve.cp2.x -= xOffset / 2 / this.__scale__;
    }

    if (canResizeY) {
      curve.p2 = {
        ...curve.p2,
        y: curve.p2.y - yOffset / 2 / this.__scale__,
      };

      curve.cp2.y -= yOffset / 2 / this.__scale__;
    }
  };

  getRedundancies = () => {
    this.redundancies = [];

    let optionsHash: { [text: string]: boolean } = {};

    this.options.forEach((option) => {
      optionsHash[option.text] = true;
    });

    this.selectedData.forEach((dataItem) => {
      if (!optionsHash[dataItem.text]) {
        this.redundancies.push(dataItem);
      }
    });
  };

  getIsReceiving = () => {
    return (
      !this.receiving.l &&
      !this.receiving.t &&
      !this.receiving.r &&
      !this.receiving.b
    );
  };

  removeCurve = (d: Direction) => {
    this.curves[d] = null;

    const sendShape = this.sendTo[d]?.shape,
      recieveShapeDirection = this.sendTo[d]?.direction;

    if (sendShape && recieveShapeDirection) {
      sendShape.receiveFrom[recieveShapeDirection] = null;
      this.sendTo[d] = null;
    }
  };

  onMouseDown(canvas: HTMLCanvasElement, p: Vec) {
    let shapeP = {
      x: p.x - this.getScreenP().x,
      y: p.y - this.getScreenP().y,
    };
    let curveBoundry = {
      l: this.curves.l?.checkControlPointsBoundry(shapeP),
      t: this.curves.t?.checkControlPointsBoundry(shapeP),
      r: this.curves.r?.checkControlPointsBoundry(shapeP),
      b: this.curves.b?.checkControlPointsBoundry(shapeP),
    };

    if (this.checkBoundry(p)) {
      this.selecting = true;
    }

    const edge = this.getEdge(),
      center = this.getCenter();

    if (this.selecting && this.getIsReceiving()) {
      if (
        // lt anchors
        (p.x - center.lt.x) * (p.x - center.lt.x) +
          (p.y - center.lt.y) * (p.y - center.lt.y) <
        this.anchor.size.fill * this.anchor.size.fill
      ) {
        this.pressing = {
          activate: true,
          target: PressingTarget.lt,
        };
      } else if (
        // rt anchors
        (p.x - center.rt.x) * (p.x - center.rt.x) +
          (p.y - center.rt.y) * (p.y - center.rt.y) <
        this.anchor.size.fill * this.anchor.size.fill
      ) {
        this.pressing = {
          activate: true,
          target: PressingTarget.rt,
        };
      } else if (
        // rb anchors
        (p.x - center.rb.x) * (p.x - center.rb.x) +
          (p.y - center.rb.y) * (p.y - center.rb.y) <
        this.anchor.size.fill * this.anchor.size.fill
      ) {
        this.pressing = {
          activate: true,
          target: PressingTarget.rb,
        };
      } else if (
        // lb anchors
        (p.x - center.lb.x) * (p.x - center.lb.x) +
          (p.y - center.lb.y) * (p.y - center.lb.y) <
        this.anchor.size.fill * this.anchor.size.fill
      ) {
        this.pressing = {
          activate: true,
          target: PressingTarget.lb,
        };
      } else if (
        // l curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.l
      ) {
        this.curves.l = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve,
          {
            x: -this.w / 2,
            y: 0,
          },
          {
            x: -this.w / 2 + (-this.curveTrigger.d * 1) / 3,
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

        this.curves.l.scale = this.__scale__;
        this.curves.l.pressing = {
          activate: true,
          p: CurvePressingP.p2,
        };

        this.pressing = {
          activate: true,
          target: PressingTarget.clp2,
        };

        this.selecting = false;
      } else if (
        // t curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.t
      ) {
        this.curves.t = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve,
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

        this.curves.t.scale = this.__scale__;
        this.curves.t.pressing = {
          activate: true,
          p: CurvePressingP.p2,
        };

        this.pressing = {
          activate: true,
          target: PressingTarget.ctp2,
        };

        this.selecting = false;
      } else if (
        // r curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.r
      ) {
        this.curves.r = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve,
          {
            x: this.w / 2,
            y: 0,
          },
          {
            x: this.w / 2 + (this.curveTrigger.d * 1) / 3,
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

        this.curves.r.scale = this.__scale__;
        this.curves.r.pressing = {
          activate: true,
          p: CurvePressingP.p2,
        };

        this.pressing = {
          activate: true,
          target: PressingTarget.crp2,
        };

        this.selecting = false;
      } else if (
        // b curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.b
      ) {
        this.curves.b = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve,
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

        this.curves.b.scale = this.__scale__;
        this.curves.b.pressing = {
          activate: true,
          p: CurvePressingP.p2,
        };

        this.pressing = {
          activate: true,
          target: PressingTarget.cbp2,
        };

        this.selecting = false;
      } else if (p.x > edge.l && p.y > edge.t && p.x < edge.r && p.y < edge.b) {
        // inside the shape
        this.pressing = {
          activate: true,
          target: PressingTarget.m,
        };
      } else {
        this.selecting = false;
        this.pressing = this.initPressing;
        return;
      }

      this.dragP = p;
    }

    if (curveBoundry.l?.p === CurvePressingP.cp1) {
      // l curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.clcp1,
      };
    } else if (curveBoundry.l?.p === CurvePressingP.cp2) {
      // l curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.clcp2,
      };
    } else if (curveBoundry.l?.p === CurvePressingP.p2) {
      // l curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.clp2,
      };
    } else if (curveBoundry.t?.p === CurvePressingP.cp1) {
      // t curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.ctcp1,
      };
    } else if (curveBoundry.t?.p === CurvePressingP.cp2) {
      // t curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.ctcp2,
      };
    } else if (curveBoundry.t?.p === CurvePressingP.p2) {
      // t curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.ctp2,
      };
    } else if (curveBoundry.r?.p === CurvePressingP.cp1) {
      // r curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.crcp1,
      };
    } else if (curveBoundry.r?.p === CurvePressingP.cp2) {
      // r curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.crcp2,
      };
    } else if (curveBoundry.r?.p === CurvePressingP.p2) {
      // r curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.crp2,
      };
    } else if (curveBoundry.b?.p === CurvePressingP.cp1) {
      // b curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.cbcp1,
      };
    } else if (curveBoundry.b?.p === CurvePressingP.cp2) {
      // b curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.cbcp2,
      };
    } else if (curveBoundry.b?.p === CurvePressingP.p2) {
      // b curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.cbp2,
      };
    }

    if (this.curves.l) {
      this.curves.l.onMouseDown(canvas, shapeP);
    }
    if (this.curves.t) {
      this.curves.t.onMouseDown(canvas, shapeP);
    }
    if (this.curves.r) {
      this.curves.r.onMouseDown(canvas, shapeP);
    }
    if (this.curves.b) {
      this.curves.b.onMouseDown(canvas, shapeP);
    }
  }

  onMouseMove(p: Vec, receivable?: boolean) {
    if (
      this.selecting &&
      this.pressing.activate &&
      this.dragP.x &&
      this.dragP.y &&
      this.getIsReceiving()
    ) {
      let xOffset = p.x - this.dragP.x,
        yOffset = p.y - this.dragP.y;

      this.dragP.x = p.x;
      this.dragP.y = p.y;

      // sender curves follows
      const receiveFromCurve_l = this.receiveFrom.l?.shape.curves[
          this.receiveFrom.l.direction
        ],
        receiveFromCurve_t = this.receiveFrom.t?.shape.curves[
          this.receiveFrom.t.direction
        ],
        receiveFromCurve_r = this.receiveFrom.r?.shape.curves[
          this.receiveFrom.r.direction
        ],
        receiveFromCurve_b = this.receiveFrom.b?.shape.curves[
          this.receiveFrom.b.direction
        ],
        // reciever curves follows
        sendToCurve_l = this.sendTo.l,
        sendToCurve_t = this.sendTo.t,
        sendToCurve_r = this.sendTo.r,
        sendToCurve_b = this.sendTo.b;

      const edge = this.getEdge();

      if (this.pressing.target === PressingTarget.m) {
        this.p.x += xOffset / this.__scale__;
        this.p.y += yOffset / this.__scale__;

        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          // left
          receiveFromCurve_l.p2 = {
            x: receiveFromCurve_l.p2.x + xOffset / this.__scale__,
            y: receiveFromCurve_l.p2.y + yOffset / this.__scale__,
          };
          receiveFromCurve_l.cp2.x += xOffset / this.__scale__;
          receiveFromCurve_l.cp2.y += yOffset / this.__scale__;
        }
        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          // top
          receiveFromCurve_t.p2 = {
            x: receiveFromCurve_t.p2.x + xOffset / this.__scale__,
            y: receiveFromCurve_t.p2.y + yOffset / this.__scale__,
          };
          receiveFromCurve_t.cp2.x += xOffset / this.__scale__;
          receiveFromCurve_t.cp2.y += yOffset / this.__scale__;
        }
        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          // right
          receiveFromCurve_r.p2 = {
            x: receiveFromCurve_r.p2.x + xOffset / this.__scale__,
            y: receiveFromCurve_r.p2.y + yOffset / this.__scale__,
          };
          receiveFromCurve_r.cp2.x += xOffset / this.__scale__;
          receiveFromCurve_r.cp2.y += yOffset / this.__scale__;
        }
        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          // bottom
          receiveFromCurve_b.p2 = {
            x: receiveFromCurve_b.p2.x + xOffset / this.__scale__,
            y: receiveFromCurve_b.p2.y + yOffset / this.__scale__,
          };
          receiveFromCurve_b.cp2.x += xOffset / this.__scale__;
          receiveFromCurve_b.cp2.y += yOffset / this.__scale__;
        }

        if (sendToCurve_l && this.curves.l?.p2 && this.curves.l?.cp2) {
          this.curves.l.p2 = {
            x: this.curves.l.p2.x - xOffset / this.__scale__,
            y: this.curves.l.p2.y - yOffset / this.__scale__,
          };
          this.curves.l.cp2.x -= xOffset / this.__scale__;
          this.curves.l.cp2.y -= yOffset / this.__scale__;
        }
        if (sendToCurve_t && this.curves.t?.p2 && this.curves.t?.cp2) {
          this.curves.t.p2 = {
            x: this.curves.t.p2.x - xOffset / this.__scale__,
            y: this.curves.t.p2.y - yOffset / this.__scale__,
          };

          this.curves.t.cp2.x -= xOffset / this.__scale__;
          this.curves.t.cp2.y -= yOffset / this.__scale__;
        }
        if (sendToCurve_r && this.curves.r?.p2 && this.curves.r?.cp2) {
          this.curves.r.p2 = {
            x: this.curves.r.p2.x - xOffset / this.__scale__,
            y: this.curves.r.p2.y - yOffset / this.__scale__,
          };
          this.curves.r.cp2.x -= xOffset / this.__scale__;
          this.curves.r.cp2.y -= yOffset / this.__scale__;
        }
        if (sendToCurve_b && this.curves.b?.p2 && this.curves.b?.cp2) {
          this.curves.b.p2 = {
            x: this.curves.b.p2.x - xOffset / this.__scale__,
            y: this.curves.b.p2.y - yOffset / this.__scale__,
          };

          this.curves.b.cp2.x -= xOffset / this.__scale__;
          this.curves.b.cp2.y -= yOffset / this.__scale__;
        }
      } else if (this.pressing.target === PressingTarget.lt) {
        const canResizeX =
            (xOffset > 0 &&
              p.x > edge.l &&
              this.getScaleSize().w >= this.getScaleSize().minW) ||
            (xOffset < 0 && p.x < edge.l),
          canResizeY =
            (yOffset > 0 &&
              p.y > edge.t &&
              this.getScaleSize().h >= this.getScaleSize().minH) ||
            (yOffset < 0 && p.y < edge.t);

        if (canResizeX) {
          this.p.x += xOffset / 2 / this.__scale__;
          this.w -= xOffset / this.__scale__;
        }

        if (canResizeY) {
          this.p.y += yOffset / 2 / this.__scale__;
          this.h -= yOffset / this.__scale__;
        }

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x += xOffset / 2 / this.__scale__;
            this.curves.l.cp1.x += xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_l) {
            this.senderHoldCurveP2Cp2Position(
              Direction.l,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.l.p2 = {
                ...this.curves.l.p2,
                x: this.curves.l.p2.x + xOffset / 2 / this.__scale__,
              };

              this.curves.l.cp2.x += xOffset / 2 / this.__scale__;
            }
          }
        }

        if (
          this.curves.t?.p1 &&
          this.curves.t?.cp1 &&
          this.curves.t?.cp2 &&
          this.curves.t?.p2
        ) {
          if (canResizeY) {
            this.curves.t.p1.y += yOffset / 2 / this.__scale__;
            this.curves.t.cp1.y += yOffset / 2 / this.__scale__;
          }

          if (sendToCurve_t) {
            this.senderHoldCurveP2Cp2Position(
              Direction.t,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.t.cp2.y += yOffset / 2 / this.__scale__;
              this.curves.t.p2 = {
                ...this.curves.t.p2,
                y: this.curves.t.p2.y + yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.r?.p1 &&
          this.curves.r?.cp1 &&
          this.curves.r?.cp2 &&
          this.curves.r?.p2
        ) {
          if (canResizeX) {
            this.curves.r.p1.x -= xOffset / 2 / this.__scale__;
            this.curves.r.cp1.x -= xOffset / 2 / this.__scale__;
          }
          if (sendToCurve_r) {
            this.senderHoldCurveP2Cp2Position(
              Direction.r,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.r.p2 = {
                ...this.curves.r.p2,
                x: this.curves.r.p2.x - xOffset / 2 / this.__scale__,
              };
              this.curves.r.cp2.x -= xOffset / 2 / this.__scale__;
            }
          }
        }

        if (
          this.curves.b?.p1 &&
          this.curves.b?.cp1 &&
          this.curves.b?.cp2 &&
          this.curves.b?.p2
        ) {
          if (canResizeY) {
            this.curves.b.p1.y -= yOffset / 2 / this.__scale__;
            this.curves.b.cp1.y -= yOffset / 2 / this.__scale__;
          }
          if (sendToCurve_b) {
            this.senderHoldCurveP2Cp2Position(
              Direction.b,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.b.cp2.y -= yOffset / 2 / this.__scale__;
              this.curves.b.p2 = {
                ...this.curves.b.p2,
                y: this.curves.b.p2.y - yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        // resizing by reciever lt point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeX) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              x: receiveFromCurve_l.p2.x + xOffset/ this.__scale__,
            };
            receiveFromCurve_l.cp2.x += xOffset / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              y: receiveFromCurve_l.p2.y + yOffset / 2 / this.__scale__,
            };

            receiveFromCurve_l.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              x: receiveFromCurve_t.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_t.cp2.x += xOffset / 2 / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              y: receiveFromCurve_t.p2.y + yOffset / this.__scale__,
            };

            receiveFromCurve_t.cp2.y += yOffset / this.__scale__;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeY) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              y: receiveFromCurve_r.p2.y + yOffset / 2 / this.__scale__,
            };

            receiveFromCurve_r.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              x: receiveFromCurve_b.p2.x + xOffset / 2 / this.__scale__,
            };

            receiveFromCurve_b.cp2.x += xOffset / 2 / this.__scale__;
          }
        }
      } else if (this.pressing.target === PressingTarget.rt) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.r) ||
            (xOffset < 0 &&
              p.x < edge.r &&
              this.getScaleSize().w >= this.getScaleSize().minW),
          canResizeY =
            (yOffset > 0 &&
              p.y > edge.t &&
              this.getScaleSize().h >= this.getScaleSize().minH) ||
            (yOffset < 0 && p.y < edge.t);

        if (canResizeX) {
          this.p.x += xOffset / 2 / this.__scale__;
          this.w += xOffset / this.__scale__;
        }
        if (canResizeY) {
          this.p.y += yOffset / 2 / this.__scale__;
          this.h -= yOffset / this.__scale__;
        }

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x -= xOffset / 2 / this.__scale__;
          }

          if (canResizeY) {
            this.curves.l.cp1.x -= xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_l) {
            this.senderHoldCurveP2Cp2Position(
              Direction.l,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.l.cp2.x -= xOffset / 2 / this.__scale__;
              this.curves.l.p2 = {
                ...this.curves.l.p2,
                x: this.curves.l.p2.x - xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.t?.p1 &&
          this.curves.t?.cp1 &&
          this.curves.t?.cp2 &&
          this.curves.t?.p2
        ) {
          if (canResizeY) {
            this.curves.t.p1.y += yOffset / 2 / this.__scale__;
            this.curves.t.cp1.y += yOffset / 2 / this.__scale__;
          }
          if (sendToCurve_t) {
            this.senderHoldCurveP2Cp2Position(
              Direction.t,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.t.cp2.y += yOffset / 2 / this.__scale__;
              this.curves.t.p2 = {
                ...this.curves.t.p2,
                y: this.curves.t.p2.y + yOffset / 2 / this.__scale__,
              };
            }
          }
        }
        if (
          this.curves.r?.p1 &&
          this.curves.r?.cp1 &&
          this.curves.r?.cp2 &&
          this.curves.r?.p2
        ) {
          if (canResizeX) {
            this.curves.r.p1.x += xOffset / 2 / this.__scale__;
            this.curves.r.cp1.x += xOffset / 2 / this.__scale__;
          }
          if (sendToCurve_r) {
            this.senderHoldCurveP2Cp2Position(
              Direction.r,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.r.cp2.x += xOffset / 2 / this.__scale__;
              this.curves.r.p2 = {
                ...this.curves.r.p2,
                x: this.curves.r.p2.x + xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.b?.p1 &&
          this.curves.b?.cp1 &&
          this.curves.b?.cp2 &&
          this.curves.b?.p2
        ) {
          if (canResizeY) {
            this.curves.b.p1.y -= yOffset / 2 / this.__scale__;
            this.curves.b.cp1.y -= yOffset / 2 / this.__scale__;
          }
          if (sendToCurve_b) {
            this.senderHoldCurveP2Cp2Position(
              Direction.b,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.b.cp2.y -= yOffset / 2 / this.__scale__;
              this.curves.b.p2 = {
                ...this.curves.b.p2,
                y: this.curves.b.p2.y - yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        // resizing by reciever rt point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeY) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              y: receiveFromCurve_l.p2.y + yOffset / 2 / this.__scale__,
            };

            receiveFromCurve_l.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              x: receiveFromCurve_t.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_t.cp2.x += xOffset / 2 / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              y: receiveFromCurve_t.p2.y + yOffset / this.__scale__,
            };
            receiveFromCurve_t.cp2.y += yOffset / this.__scale__;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeX) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              x: receiveFromCurve_r.p2.x + xOffset / this.__scale__,
            };
            receiveFromCurve_r.cp2.x += xOffset / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              y: receiveFromCurve_r.p2.y + yOffset / 2 / this.__scale__,
            };
            receiveFromCurve_r.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              x: receiveFromCurve_b.p2.x + xOffset / 2 / this.__scale__,
            };

            receiveFromCurve_b.cp2.x += xOffset / 2 / this.__scale__;
          }
        }
      } else if (this.pressing.target === PressingTarget.rb) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.r) ||
            (xOffset < 0 &&
              p.x < edge.r &&
              this.getScaleSize().w >= this.getScaleSize().minW),
          canResizeY =
            (yOffset > 0 && p.y > edge.b) ||
            (yOffset < 0 &&
              p.y < edge.b &&
              this.getScaleSize().h >= this.getScaleSize().minH);

        if (canResizeX) {
          this.p.x += xOffset / 2 / this.__scale__;
          this.w += xOffset / this.__scale__;
        }
        if (canResizeY) {
          this.p.y += yOffset / 2 / this.__scale__;
          this.h += yOffset / this.__scale__;
        }

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x -= xOffset / 2 / this.__scale__;
            this.curves.l.cp1.x -= xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_l) {
            this.senderHoldCurveP2Cp2Position(
              Direction.l,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.l.cp2.x -= xOffset / 2 / this.__scale__;
              this.curves.l.p2 = {
                ...this.curves.l.p2,
                x: this.curves.l.p2.x - xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.t?.p1 &&
          this.curves.t?.cp1 &&
          this.curves.t?.cp2 &&
          this.curves.t?.p2
        ) {
          if (canResizeY) {
            this.curves.t.p1.y -= yOffset / 2 / this.__scale__;
            this.curves.t.cp1.y -= yOffset / 2 / this.__scale__;
          }

          if (sendToCurve_t) {
            this.senderHoldCurveP2Cp2Position(
              Direction.t,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.t.cp2.y -= yOffset / 2 / this.__scale__;
              this.curves.t.p2 = {
                ...this.curves.t.p2,
                y: this.curves.t.p2.y - yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.r?.p1 &&
          this.curves.r?.cp1 &&
          this.curves.r?.cp2 &&
          this.curves.r?.p2
        ) {
          if (canResizeX) {
            this.curves.r.p1.x += xOffset / 2 / this.__scale__;
            this.curves.r.cp1.x += xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_r) {
            this.senderHoldCurveP2Cp2Position(
              Direction.r,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.r.cp2.x += xOffset / 2 / this.__scale__;
              this.curves.r.p2 = {
                ...this.curves.r.p2,
                x: this.curves.r.p2.x + xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.b?.p1 &&
          this.curves.b?.cp1 &&
          this.curves.b?.cp2 &&
          this.curves.b?.p2
        ) {
          if (canResizeY) {
            this.curves.b.p1.y += yOffset / 2 / this.__scale__;
            this.curves.b.cp1.y += yOffset / 2 / this.__scale__;
          }
          if (sendToCurve_b) {
            this.senderHoldCurveP2Cp2Position(
              Direction.b,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.b.cp2.y += yOffset / 2 / this.__scale__;
              this.curves.b.p2 = {
                ...this.curves.b.p2,
                y: this.curves.b.p2.y + yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        // resizing by reciever rb point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeY) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              y: receiveFromCurve_l.p2.y + yOffset / 2 / this.__scale__,
            };
            receiveFromCurve_l.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              x: receiveFromCurve_t.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_t.cp2.x += xOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeX) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              x: receiveFromCurve_r.p2.x + xOffset / this.__scale__,
            };
            receiveFromCurve_r.cp2.x += xOffset / this.__scale__;
          }
          if (canResizeY) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              y: receiveFromCurve_r.p2.y + yOffset / 2 / this.__scale__,
            };
            receiveFromCurve_r.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              x: receiveFromCurve_b.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_b.cp2.x += xOffset / 2 / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              y: receiveFromCurve_b.p2.y + yOffset / this.__scale__,
            };
            receiveFromCurve_b.cp2.y += yOffset / this.__scale__;
          }
        }
      } else if (this.pressing.target === PressingTarget.lb) {
        const canResizeX =
            (xOffset > 0 &&
              p.x > edge.l &&
              this.getScaleSize().w >= this.getScaleSize().minW) ||
            (xOffset < 0 && p.x < edge.l),
          canResizeY =
            (yOffset > 0 && p.y > edge.b) ||
            (yOffset < 0 &&
              p.y < edge.b &&
              this.getScaleSize().h >= this.getScaleSize().minH);

        if (canResizeX) {
          this.p.x += xOffset / 2 / this.__scale__;
          this.w -= xOffset / this.__scale__;
        }
        if (canResizeY) {
          this.p.y += yOffset / 2 / this.__scale__;
          this.h += yOffset / this.__scale__;
        }

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x += xOffset / 2 / this.__scale__;
            this.curves.l.cp1.x += xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_l) {
            this.senderHoldCurveP2Cp2Position(
              Direction.l,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.l.cp2.x += xOffset / 2 / this.__scale__;
              this.curves.l.p2 = {
                ...this.curves.l.p2,
                x: this.curves.l.p2.x + xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.t?.p1 &&
          this.curves.t?.cp1 &&
          this.curves.t?.cp2 &&
          this.curves.t?.p2
        ) {
          if (canResizeY) {
            this.curves.t.p1.y -= yOffset / 2 / this.__scale__;
            this.curves.t.cp1.y -= yOffset / 2 / this.__scale__;
          }

          if (sendToCurve_t) {
            this.senderHoldCurveP2Cp2Position(
              Direction.t,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.t.cp2.y -= yOffset / 2 / this.__scale__;
              this.curves.t.p2 = {
                ...this.curves.t.p2,
                y: this.curves.t.p2.y - yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.r?.p1 &&
          this.curves.r?.cp1 &&
          this.curves.r?.cp2 &&
          this.curves.r?.p2
        ) {
          if (canResizeX) {
            this.curves.r.p1.x -= xOffset / 2 / this.__scale__;
            this.curves.r.cp1.x -= xOffset / 2 / this.__scale__;
          }

          if (sendToCurve_r) {
            this.senderHoldCurveP2Cp2Position(
              Direction.r,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeX) {
              this.curves.r.cp2.x -= xOffset / 2 / this.__scale__;
              this.curves.r.p2 = {
                ...this.curves.r.p2,
                x: this.curves.r.p2.x - xOffset / 2 / this.__scale__,
              };
            }
          }
        }

        if (
          this.curves.b?.p1 &&
          this.curves.b?.cp1 &&
          this.curves.b?.cp2 &&
          this.curves.b?.p2
        ) {
          if (canResizeY) {
            this.curves.b.p1.y += yOffset / 2 / this.__scale__;
            this.curves.b.cp1.y += yOffset / 2 / this.__scale__;
          }

          if (sendToCurve_b) {
            this.senderHoldCurveP2Cp2Position(
              Direction.b,
              xOffset,
              yOffset,
              canResizeX,
              canResizeY
            );
          } else {
            if (canResizeY) {
              this.curves.b.cp2.y += yOffset / 2 / this.__scale__;
              this.curves.b.p2 = {
                ...this.curves.b.p2,
                y: this.curves.b.p2.y + yOffset / 2 / this.__scale__,
              };
            }
          }
        }

        // resizing by reciever lb point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeX) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              x: receiveFromCurve_l.p2.x + xOffset / this.__scale__,
            };

            receiveFromCurve_l.cp2.x += xOffset / this.__scale__;
          }

          if (canResizeY) {
            receiveFromCurve_l.p2 = {
              ...receiveFromCurve_l.p2,
              y: receiveFromCurve_l.p2.y + yOffset / 2 / this.__scale__,
            };
            receiveFromCurve_l.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2 = {
              ...receiveFromCurve_t.p2,
              x: receiveFromCurve_t.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_t.cp2.x += xOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeY) {
            receiveFromCurve_r.p2 = {
              ...receiveFromCurve_r.p2,
              y: receiveFromCurve_r.p2.y + yOffset / 2 / this.__scale__,
            };
            receiveFromCurve_r.cp2.y += yOffset / 2 / this.__scale__;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              x: receiveFromCurve_b.p2.x + xOffset / 2 / this.__scale__,
            };
            receiveFromCurve_b.cp2.x += xOffset / 2 / this.__scale__;
          }
          if (canResizeY) {
            receiveFromCurve_b.p2 = {
              ...receiveFromCurve_b.p2,
              y: receiveFromCurve_b.p2.y + yOffset / this.__scale__,
            };

            receiveFromCurve_b.cp2.y += yOffset / this.__scale__;
          }
        }
      }
    }

    const shapeP = {
      x: p.x - this.getScreenP().x,
      y: p.y - this.getScreenP().y,
    };

    // reset shape connections when moving curve
    if (this.pressing.activate) {
      if (
        this.curves.l?.selecting &&
        this.pressing.target === PressingTarget.clp2
      ) {
        this.resetConnection(Direction.l, true);
      } else if (
        this.curves.t?.selecting &&
        this.pressing.target === PressingTarget.ctp2
      ) {
        this.resetConnection(Direction.t, true);
      } else if (
        this.curves.r?.selecting &&
        this.pressing.target === PressingTarget.crp2
      ) {
        this.resetConnection(Direction.r, true);
      } else if (
        this.curves.b?.selecting &&
        this.pressing.target === PressingTarget.cbp2
      ) {
        this.resetConnection(Direction.b, true);
      }
    }

    if (
      // l curve
      this.curves.l
    ) {
      this.curves.l?.onMouseMove(shapeP);
    }
    if (
      // t curve
      this.curves.t
    ) {
      this.curves.t?.onMouseMove(shapeP);
    }
    if (
      // r curve
      this.curves.r
    ) {
      this.curves.r?.onMouseMove(shapeP);
    }
    if (
      // b curve
      this.curves.b
    ) {
      this.curves.b?.onMouseMove(shapeP);
    }

    if (receivable) {
      this.receiving.l = !this.curves.l && this.checkReceivingBoundry(p);
      this.receiving.t = !this.curves.t && this.checkReceivingBoundry(p);
      this.receiving.r = !this.curves.r && this.checkReceivingBoundry(p);
      this.receiving.b = !this.curves.b && this.checkReceivingBoundry(p);
    }
  }

  onMouseUp(p: Vec, sender?: ConnectTarget, curveOffset?: CurveOffset) {
    if (this.pressing.activate) {
      this.pressing = this.initPressing;
    }

    if (sender) {
      const pressingReceivingPoint = this.checkReceivingPointsBoundry(p),
        senderCurve = sender.shape.curves[sender.direction];

      if (pressingReceivingPoint.activate && senderCurve) {
        const edge = this.getEdge();
        if (
          this.receiving.l &&
          pressingReceivingPoint.direction === Direction.l
        ) {
          // receiver
          this.receiveFrom.l = sender;
          // sender
          sender.shape.sendTo[sender.direction] = {
            shape: this,
            direction: pressingReceivingPoint.direction, // l
          };

          // define l receive curve P2 position
          const curveOffsetX = curveOffset?.l.x ? curveOffset.l.x : 0,
            curveOffsetY = curveOffset?.l.y ? curveOffset.l.y : 0;

          senderCurve.p2 = {
            x: this.p.x - this.w / 2 - sender.shape.p.x + curveOffsetX,
            y: this.p.y - sender.shape.p.y + curveOffsetY,
          };
        } else if (
          this.receiving.t &&
          pressingReceivingPoint.direction === Direction.t
        ) {
          // receiver
          this.receiveFrom.t = sender;
          // sender
          sender.shape.sendTo[sender.direction] = {
            shape: this,
            direction: pressingReceivingPoint.direction, // t
          };

          // define t receive curve P2 position
          const curveOffsetX = curveOffset?.t.x ? curveOffset.t.x : 0,
            curveOffsetY = curveOffset?.t.y ? curveOffset.t.y : 0;

          senderCurve.p2 = {
            x: this.p.x - sender.shape.p.x + curveOffsetX,
            y: this.p.y - this.h / 2 - sender.shape.p.y + curveOffsetY,
          };
        } else if (
          this.receiving.r &&
          pressingReceivingPoint.direction === Direction.r
        ) {
          // receiver
          this.receiveFrom.r = sender;
          // sender
          sender.shape.sendTo[sender.direction] = {
            shape: this,
            direction: pressingReceivingPoint.direction, // r
          };

          // define r receive curve P2 position
          const curveOffsetX = curveOffset?.r.x ? curveOffset.r.x : 0,
            curveOffsetY = curveOffset?.r.y ? curveOffset.r.y : 0;

          senderCurve.p2 = {
            x: this.p.x + this.w / 2 - sender.shape.p.x + curveOffsetX,
            y: this.p.y - sender.shape.p.y + curveOffsetY,
          };
        } else if (
          this.receiving.b &&
          pressingReceivingPoint.direction === Direction.b
        ) {
          // receiver
          this.receiveFrom.b = sender;
          // sender
          sender.shape.sendTo[sender.direction] = {
            shape: this,
            direction: pressingReceivingPoint.direction, // b
          };

          // define b receive curve P2 position
          const curveOffsetX = curveOffset?.b.x ? curveOffset.b.x : 0,
            curveOffsetY = curveOffset?.b.y ? curveOffset.b.y : 0;

          senderCurve.p2 = {
            x: this.p.x - sender.shape.p.x + curveOffsetX,
            y: this.p.y + this.h / 2 - sender.shape.p.y + curveOffsetY,
          };
        }
      }
    }

    this.receiving.l = false;
    this.receiving.t = false;
    this.receiving.r = false;
    this.receiving.b = false;

    if (this.curves.l) {
      this.curves.l?.onMouseUp();
    }
    if (this.curves.t) {
      this.curves.t?.onMouseUp();
    }
    if (this.curves.r) {
      this.curves.r?.onMouseUp();
    }
    if (this.curves.b) {
      this.curves.b?.onMouseUp();
    }
  }

  draw(ctx: CanvasRenderingContext2D, sendable: boolean = true) {
    const edge = this.getEdge(),
      fillRectParams = {
        x: edge.l - this.getScreenP().x,
        y: edge.t - this.getScreenP().y,
        w: this.getScaleSize().w,
        h: this.getScaleSize().h,
      };

    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);
    ctx.fillStyle = this.c;

    if (this.getIsReceiving()) {
      if (this.selecting) {
        // draw frame
        ctx.fillStyle = "white";
        ctx.strokeStyle = "DeepSkyBlue";
        ctx.lineWidth = this.strokeSize;
        ctx.beginPath();
        ctx.strokeRect(
          fillRectParams.x,
          fillRectParams.y,
          fillRectParams.w,
          fillRectParams.h
        );
        ctx.closePath();

        // draw anchors
        ctx.lineWidth = this.anchor.size.stroke;
        ctx.beginPath();
        ctx.arc(
          edge.l - this.getScreenP().x,
          edge.t - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // left, top
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.r - this.getScreenP().x,
          edge.t - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // right, top
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.l - this.getScreenP().x,
          edge.b - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // left, bottom
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
          edge.r - this.getScreenP().x,
          edge.b - this.getScreenP().y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // right, bottom
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        // draw curve triggers
        ctx.lineWidth = this.curveTrigger.size.stroke;

        if (!this.curves.l && !this.receiveFrom.l && sendable) {
          // left
          ctx.beginPath();
          ctx.arc(
            -this.getScaleSize().w / 2 - this.getScaleCurveTriggerDistance(),
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

        if (!this.curves.t && !this.receiveFrom.t && sendable) {
          // top
          ctx.beginPath();
          ctx.arc(
            0,
            -this.getScaleSize().h / 2 - this.getScaleCurveTriggerDistance(),
            this.anchor.size.fill,
            0,
            2 * Math.PI,
            false
          );
          ctx.stroke();
          ctx.fill();
          ctx.closePath();
        }

        if (!this.curves.r && !this.receiveFrom.r && sendable) {
          // right
          ctx.beginPath();
          ctx.arc(
            this.getScaleSize().w / 2 + this.getScaleCurveTriggerDistance(),
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

        if (!this.curves.b && !this.receiveFrom.b && sendable) {
          ctx.beginPath();
          ctx.arc(
            0,
            this.getScaleSize().h / 2 + this.getScaleCurveTriggerDistance(),
            this.curveTrigger.size.fill,
            0,
            2 * Math.PI,
            false
          ); // bottom
          ctx.stroke();
          ctx.fill();
          ctx.closePath();
        }
      }
    } else {
      // draw receiving points
      ctx.fillStyle = "white";
      ctx.strokeStyle = "DeepSkyBlue";
      ctx.lineWidth = this.anchor.size.stroke;

      // left
      if (this.receiving.l) {
        ctx.beginPath();
        ctx.arc(
          -this.getScaleSize().w / 2,
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
          this.getScaleSize().w / 2,
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
    }

    if (this.curves.l) {
      this.curves.l.draw(ctx);
    }

    if (this.curves.t) {
      this.curves.t.draw(ctx);
    }

    if (this.curves.r) {
      this.curves.r.draw(ctx);
    }

    if (this.curves.b) {
      this.curves.b.draw(ctx);
    }

    // render center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(this.title, 0, 0);

    // draw id text
    ctx.textAlign = "start";
    ctx.fillText(
      this.id,
      -this.getScaleSize().w / 2,
      -this.getScaleSize().h / 2 - 10
    );

    if (this.redundancies.length > 0) {
      // draw error message
      ctx.textAlign = "end";
      ctx.fillStyle = "red";
      ctx.fillText(
        "error!",
        this.getScaleSize().w / 2,
        -this.getScaleSize().h / 2 - 10
      );
    }

    ctx.restore();
  }
}
