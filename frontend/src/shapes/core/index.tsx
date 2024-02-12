"use client";
import Curve from "@/shapes/curve";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import { Line, PressingP as CurvePressingP } from "@/types/shapes/curve";
import { PressingTarget, ConnectTarget } from "@/types/shapes/core";
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
  w: number;
  h: number;
  minW: number;
  minH: number;
  title: Title;
  p: Vec;
  p1: Vec;
  p2: Vec;
  curves: {
    l: null | Curve;
    t: null | Curve;
    r: null | Curve;
    b: null | Curve;
  };
  selecting: boolean;
  receiving: boolean;
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

  constructor(id: string, w: number, h: number, p: Vec, c: string) {
    this.id = id;
    this.c = c;
    this.w = w;
    this.h = h;
    this.minW = 100;
    this.minH = 100;
    this.title = "";
    this.p = p;
    this.p1 = { x: this.p.x - this.w / 2, y: this.p.y - this.h / 2 };
    this.p2 = { x: this.p.x + this.w / 2, y: this.p.y + this.h / 2 };
    this.curves = {
      l: null,
      t: null,
      r: null,
      b: null,
    };
    this.selecting = false;
    this.receiving = false;
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
  }

  getEdge = () => {
    return {
      l: this.p.x - this.w / 2,
      t: this.p.y - this.h / 2,
      r: this.p.x + this.w / 2,
      b: this.p.y + this.h / 2,
    };
  };

  getCenter = () => {
    const edge = this.getEdge();
    const pivot = {
      x: this.p.x,
      y: this.p.y,
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
          x: edge.l - this.curveTrigger.d,
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: edge.t - this.curveTrigger.d,
        },
        r: {
          x: edge.r + this.curveTrigger.d,
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: edge.b + this.curveTrigger.d,
        },
      },
      receivingPoints: {
        l: {
          x: pivot.x - this.w / 2,
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: pivot.y - this.h / 2,
        },
        r: {
          x: pivot.x + this.w / 2,
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: pivot.y + this.h / 2,
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
    let dx, dy;

    dx = this.p1.x - p.x;
    dy = this.p1.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "lt",
      };
    }

    dx = this.p2.x - p.x;
    dy = this.p1.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "rt",
      };
    }

    dx = this.p2.x - p.x;
    dy = this.p2.y - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: "rb",
      };
    }

    dx = this.p1.x - p.x;
    dy = this.p2.y - p.y;

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
    const edge = this.getEdge();

    let dx, dy;

    dx = edge.l - p.x;
    dy = 0;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.l,
      };
    }

    dx = 0;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.t,
      };
    }

    dx = p.x - edge.r;
    dy = 0;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return {
        activate: true,
        direction: Direction.r,
      };
    }

    dx = 0;
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

  resetConnection = (direction: Direction) => {
    const receiverShape = this.sendTo[direction]?.shape,
      receiverDirection = this.sendTo[direction]?.direction;

    if (receiverShape && receiverDirection) {
      receiverShape.receiveFrom[receiverDirection] = null;
      this.sendTo[direction] = null;
    }
  };

  recalculate = () => {
    this.p = {
      x: (this.p1.x + this.p2.x) / 2,
      y: (this.p1.y + this.p2.y) / 2,
    };
    this.w = Math.abs(this.p1.x - this.p2.x);
    this.h = Math.abs(this.p1.y - this.p2.y);
  };

  senderHoldCurveP2Cp2Position = (
    direction: Direction,
    xOffset: number,
    yOffset: number,
    canResizeX?: boolean,
    canResizeY?: boolean
  ) => {
    const curve_p2 = this.curves[direction]?.p2,
      curve_cp2 = this.curves[direction]?.cp2;

    if (!curve_p2 || !curve_cp2) return;

    if (canResizeX) {
      curve_p2.x -= xOffset / 2;
      curve_cp2.x -= xOffset / 2;
    }

    if (canResizeY) {
      curve_p2.y -= yOffset / 2;
      curve_cp2.y -= yOffset / 2;
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
      x: p.x - this.p.x,
      y: p.y - this.p.y,
    };
    let pressingCurve = {
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

    if (this.selecting && !this.receiving) {
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
          this.curveTrigger.curve
        );
        this.pressing = {
          activate: true,
          target: PressingTarget.clp2,
        };

        this.curves.l.init(
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
          { x: -this.w / 2 - this.curveTrigger.d, y: 0 }
        );

        this.selecting = false;
      } else if (
        // t curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.t
      ) {
        this.curves.t = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve
        );
        this.pressing = {
          activate: true,
          target: PressingTarget.ctp2,
        };

        this.curves.t.init(
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
          { x: 0, y: -this.h / 2 - this.curveTrigger.d }
        );

        this.selecting = false;
      } else if (
        // r curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.r
      ) {
        this.curves.r = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve
        );
        this.pressing = {
          activate: true,
          target: PressingTarget.crp2,
        };

        this.curves.r.init(
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
          { x: this.w / 2 + this.curveTrigger.d, y: 0 }
        );

        this.selecting = false;
      } else if (
        // b curve trigger
        this.checkCurveTriggerBoundry(p) === Direction.b
      ) {
        this.curves.b = new Curve(
          this.curveTrigger.cpline,
          this.curveTrigger.curve
        );
        this.pressing = {
          activate: true,
          target: PressingTarget.cbp2,
        };

        this.curves.b.init(
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
          { x: 0, y: this.h / 2 + this.curveTrigger.d }
        );

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

    if (pressingCurve.l?.p === CurvePressingP.cp1) {
      // l curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.clcp1,
      };
    } else if (pressingCurve.l?.p === CurvePressingP.cp2) {
      // l curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.clcp2,
      };
    } else if (pressingCurve.l?.p === CurvePressingP.p2) {
      // l curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.clp2,
      };

      this.resetConnection(Direction.l);
    } else if (pressingCurve.t?.p === CurvePressingP.cp1) {
      // t curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.ctcp1,
      };
    } else if (pressingCurve.t?.p === CurvePressingP.cp2) {
      // t curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.ctcp2,
      };
    } else if (pressingCurve.t?.p === CurvePressingP.p2) {
      // t curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.ctp2,
      };

      this.resetConnection(Direction.t);
    } else if (pressingCurve.r?.p === CurvePressingP.cp1) {
      // r curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.crcp1,
      };
    } else if (pressingCurve.r?.p === CurvePressingP.cp2) {
      // r curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.crcp2,
      };
    } else if (pressingCurve.r?.p === CurvePressingP.p2) {
      // r curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.crp2,
      };

      this.resetConnection(Direction.r);
    } else if (pressingCurve.b?.p === CurvePressingP.cp1) {
      // b curve cp1
      this.pressing = {
        activate: true,
        target: PressingTarget.cbcp1,
      };
    } else if (pressingCurve.b?.p === CurvePressingP.cp2) {
      // b curve cp2
      this.pressing = {
        activate: true,
        target: PressingTarget.cbcp2,
      };
    } else if (pressingCurve.b?.p === CurvePressingP.p2) {
      // b curve p2
      this.pressing = {
        activate: true,
        target: PressingTarget.cbp2,
      };

      this.resetConnection(Direction.b);
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
      !this.receiving
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
        this.p.x += xOffset;
        this.p.y += yOffset;
        this.p1 = { x: this.p.x - this.w / 2, y: this.p.y - this.h / 2 };
        this.p2 = { x: this.p.x + this.w / 2, y: this.p.y + this.h / 2 };

        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          // left
          receiveFromCurve_l.p2.x += xOffset;
          receiveFromCurve_l.p2.y += yOffset;
          receiveFromCurve_l.cp2.x += xOffset;
          receiveFromCurve_l.cp2.y += yOffset;
        }
        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          // top
          receiveFromCurve_t.p2.x += xOffset;
          receiveFromCurve_t.p2.y += yOffset;
          receiveFromCurve_t.cp2.x += xOffset;
          receiveFromCurve_t.cp2.y += yOffset;
        }
        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          // right
          receiveFromCurve_r.p2.x += xOffset;
          receiveFromCurve_r.p2.y += yOffset;
          receiveFromCurve_r.cp2.x += xOffset;
          receiveFromCurve_r.cp2.y += yOffset;
        }
        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          // bottom
          receiveFromCurve_b.p2.x += xOffset;
          receiveFromCurve_b.p2.y += yOffset;
          receiveFromCurve_b.cp2.x += xOffset;
          receiveFromCurve_b.cp2.y += yOffset;
        }

        if (sendToCurve_l && this.curves.l?.p2 && this.curves.l?.cp2) {
          this.curves.l.p2.x -= xOffset;
          this.curves.l.p2.y -= yOffset;
          this.curves.l.cp2.x -= xOffset;
          this.curves.l.cp2.y -= yOffset;
        }
        if (sendToCurve_t && this.curves.t?.p2 && this.curves.t?.cp2) {
          this.curves.t.p2.x -= xOffset;
          this.curves.t.p2.y -= yOffset;
          this.curves.t.cp2.x -= xOffset;
          this.curves.t.cp2.y -= yOffset;
        }
        if (sendToCurve_r && this.curves.r?.p2 && this.curves.r?.cp2) {
          this.curves.r.p2.x -= xOffset;
          this.curves.r.p2.y -= yOffset;
          this.curves.r.cp2.x -= xOffset;
          this.curves.r.cp2.y -= yOffset;
        }
        if (sendToCurve_b && this.curves.b?.p2 && this.curves.b?.cp2) {
          this.curves.b.p2.x -= xOffset;
          this.curves.b.p2.y -= yOffset;
          this.curves.b.cp2.x -= xOffset;
          this.curves.b.cp2.y -= yOffset;
        }
      } else if (this.pressing.target === PressingTarget.lt) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.l && this.w >= this.minW) ||
            (xOffset < 0 && p.x < edge.l),
          canResizeY =
            (yOffset > 0 && p.y > edge.t && this.h >= this.minH) ||
            (yOffset < 0 && p.y < edge.t);

        if (canResizeX) {
          this.p1.x += xOffset;
        }

        if (canResizeY) {
          this.p1.y += yOffset;
        }

        this.recalculate();

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x += xOffset / 2;
            this.curves.l.cp1.x += xOffset / 2;
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
              this.curves.l.p2.x += xOffset / 2;
              this.curves.l.cp2.x += xOffset / 2;
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
            this.curves.t.p1.y += yOffset / 2;
            this.curves.t.cp1.y += yOffset / 2;
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
              this.curves.t.cp2.y += yOffset / 2;
              this.curves.t.p2.y += yOffset / 2;
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
            this.curves.r.p1.x -= xOffset / 2;
            this.curves.r.cp1.x -= xOffset / 2;
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
              this.curves.r.p2.x -= xOffset / 2;
              this.curves.r.cp2.x -= xOffset / 2;
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
            this.curves.b.p1.y -= yOffset / 2;
            this.curves.b.cp1.y -= yOffset / 2;
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
              this.curves.b.cp2.y -= yOffset / 2;
              this.curves.b.p2.y -= yOffset / 2;
            }
          }
        }

        // resizing by reciever lt point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeX) {
            receiveFromCurve_l.p2.x += xOffset;
            receiveFromCurve_l.cp2.x += xOffset;
          }

          if (canResizeY) {
            receiveFromCurve_l.p2.y += yOffset / 2;
            receiveFromCurve_l.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2.x += xOffset / 2;
            receiveFromCurve_t.cp2.x += xOffset / 2;
          }

          if (canResizeY) {
            receiveFromCurve_t.p2.y += yOffset;
            receiveFromCurve_t.cp2.y += yOffset;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeY) {
            receiveFromCurve_r.p2.y += yOffset / 2;
            receiveFromCurve_r.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2.x += xOffset / 2;
            receiveFromCurve_b.cp2.x += xOffset / 2;
          }
        }
      } else if (this.pressing.target === PressingTarget.rt) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.r) ||
            (xOffset < 0 && p.x < edge.r && this.w >= this.minW),
          canResizeY =
            (yOffset > 0 && p.y > edge.t && this.h >= this.minH) ||
            (yOffset < 0 && p.y < edge.t);

        if (canResizeX) {
          this.p2.x += xOffset;
        }
        if (canResizeY) {
          this.p1.y += yOffset;
        }

        this.recalculate();

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x -= xOffset / 2;
          }

          if (canResizeY) {
            this.curves.l.cp1.x -= xOffset / 2;
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
              this.curves.l.cp2.x -= xOffset / 2;
              this.curves.l.p2.x -= xOffset / 2;
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
            this.curves.t.p1.y += yOffset / 2;
            this.curves.t.cp1.y += yOffset / 2;
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
              this.curves.t.cp2.y += yOffset / 2;
              this.curves.t.p2.y += yOffset / 2;
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
            this.curves.r.p1.x += xOffset / 2;
            this.curves.r.cp1.x += xOffset / 2;
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
              this.curves.r.cp2.x += xOffset / 2;
              this.curves.r.p2.x += xOffset / 2;
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
            this.curves.b.p1.y -= yOffset / 2;
            this.curves.b.cp1.y -= yOffset / 2;
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
              this.curves.b.cp2.y -= yOffset / 2;
              this.curves.b.p2.y -= yOffset / 2;
            }
          }
        }

        // resizing by reciever rt point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeY) {
            receiveFromCurve_l.p2.y += yOffset / 2;
            receiveFromCurve_l.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2.x += xOffset / 2;
            receiveFromCurve_t.cp2.x += xOffset / 2;
          }

          if (canResizeY) {
            receiveFromCurve_t.p2.y += yOffset;
            receiveFromCurve_t.cp2.y += yOffset;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeX) {
            receiveFromCurve_r.p2.x += xOffset;
            receiveFromCurve_r.cp2.x += xOffset;
          }

          if (canResizeY) {
            receiveFromCurve_r.p2.y += yOffset / 2;
            receiveFromCurve_r.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2.x += xOffset / 2;
            receiveFromCurve_b.cp2.x += xOffset / 2;
          }
        }
      } else if (this.pressing.target === PressingTarget.rb) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.r) ||
            (xOffset < 0 && p.x < edge.r && this.w >= this.minW),
          canResizeY =
            (yOffset > 0 && p.y > edge.b) ||
            (yOffset < 0 && p.y < edge.b && this.h >= this.minH);

        if (canResizeX) {
          this.p2.x += xOffset;
        }
        if (canResizeY) {
          this.p2.y += yOffset;
        }

        this.recalculate();

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x -= xOffset / 2;
            this.curves.l.cp1.x -= xOffset / 2;
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
              this.curves.l.cp2.x -= xOffset / 2;
              this.curves.l.p2.x -= xOffset / 2;
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
            this.curves.t.p1.y -= yOffset / 2;
            this.curves.t.cp1.y -= yOffset / 2;
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
              this.curves.t.cp2.y -= yOffset / 2;
              this.curves.t.p2.y -= yOffset / 2;
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
            this.curves.r.p1.x += xOffset / 2;
            this.curves.r.cp1.x += xOffset / 2;
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
              this.curves.r.cp2.x += xOffset / 2;
              this.curves.r.p2.x += xOffset / 2;
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
            this.curves.b.p1.y += yOffset / 2;
            this.curves.b.cp1.y += yOffset / 2;
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
              this.curves.b.cp2.y += yOffset / 2;
              this.curves.b.p2.y += yOffset / 2;
            }
          }
        }

        // resizing by reciever rb point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeY) {
            receiveFromCurve_l.p2.y += yOffset / 2;
            receiveFromCurve_l.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2.x += xOffset / 2;
            receiveFromCurve_t.cp2.x += xOffset / 2;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeX) {
            receiveFromCurve_r.p2.x += xOffset;
            receiveFromCurve_r.cp2.x += xOffset;
          }
          if (canResizeY) {
            receiveFromCurve_r.p2.y += yOffset / 2;
            receiveFromCurve_r.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2.x += xOffset / 2;
            receiveFromCurve_b.cp2.x += xOffset / 2;
          }

          if (canResizeY) {
            receiveFromCurve_b.p2.y += yOffset;
            receiveFromCurve_b.cp2.y += yOffset;
          }
        }
      } else if (this.pressing.target === PressingTarget.lb) {
        const canResizeX =
            (xOffset > 0 && p.x > edge.l && this.w >= this.minW) ||
            (xOffset < 0 && p.x < edge.l),
          canResizeY =
            (yOffset > 0 && p.y > edge.b) ||
            (yOffset < 0 && p.y < edge.b && this.h >= this.minH);

        if (canResizeX) {
          this.p1.x += xOffset;
        }

        if (canResizeY) {
          this.p2.y += yOffset;
        }

        this.recalculate();

        if (
          this.curves.l?.p1 &&
          this.curves.l?.cp1 &&
          this.curves.l?.cp2 &&
          this.curves.l?.p2
        ) {
          if (canResizeX) {
            this.curves.l.p1.x += xOffset / 2;
            this.curves.l.cp1.x += xOffset / 2;
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
              this.curves.l.cp2.x += xOffset / 2;
              this.curves.l.p2.x += xOffset / 2;
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
            this.curves.t.p1.y -= yOffset / 2;
            this.curves.t.cp1.y -= yOffset / 2;
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
              this.curves.t.cp2.y -= yOffset / 2;
              this.curves.t.p2.y -= yOffset / 2;
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
            this.curves.r.p1.x -= xOffset / 2;
            this.curves.r.cp1.x -= xOffset / 2;
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
              this.curves.r.cp2.x -= xOffset / 2;
              this.curves.r.p2.x -= xOffset / 2;
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
            this.curves.b.p1.y += yOffset / 2;
            this.curves.b.cp1.y += yOffset / 2;
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
              this.curves.b.cp2.y += yOffset / 2;
              this.curves.b.p2.y += yOffset / 2;
            }
          }
        }

        // resizing by reciever lb point and change sender curve p1 p2 position
        if (receiveFromCurve_l?.p2 && receiveFromCurve_l?.cp2) {
          if (canResizeX) {
            receiveFromCurve_l.p2.x += xOffset;
            receiveFromCurve_l.cp2.x += xOffset;
          }

          if (canResizeY) {
            receiveFromCurve_l.p2.y += yOffset / 2;
            receiveFromCurve_l.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_t?.p2 && receiveFromCurve_t?.cp2) {
          if (canResizeX) {
            receiveFromCurve_t.p2.x += xOffset / 2;
            receiveFromCurve_t.cp2.x += xOffset / 2;
          }
        }

        if (receiveFromCurve_r?.p2 && receiveFromCurve_r?.cp2) {
          if (canResizeY) {
            receiveFromCurve_r.p2.y += yOffset / 2;
            receiveFromCurve_r.cp2.y += yOffset / 2;
          }
        }

        if (receiveFromCurve_b?.p2 && receiveFromCurve_b?.cp2) {
          if (canResizeX) {
            receiveFromCurve_b.p2.x += xOffset / 2;
            receiveFromCurve_b.cp2.x += xOffset / 2;
          }
          if (canResizeY) {
            receiveFromCurve_b.p2.y += yOffset;
            receiveFromCurve_b.cp2.y += yOffset;
          }
        }
      }
    }

    const shapeP = { x: p.x - this.p.x, y: p.y - this.p.y };

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
      this.receiving = this.checkReceivingBoundry(p);
    }
  }

  onMouseUp(p: Vec, sender?: ConnectTarget) {
    if (this.pressing.activate) {
      this.pressing = this.initPressing;
    }

    if (sender && this.receiving) {
      const pressingReceivingPoint = this.checkReceivingPointsBoundry(p),
        senderCurve = sender.shape.curves[sender.direction];

      if (pressingReceivingPoint.activate && senderCurve) {
        switch (pressingReceivingPoint.direction) {
          case Direction.l:
            {
              // receiver
              this.receiveFrom.l = sender;
              // sender
              sender.shape.sendTo[sender.direction] = {
                shape: this,
                direction: pressingReceivingPoint.direction, // l
              };

              senderCurve.p2 = {
                x: this.p1.x - sender.shape.p.x,
                y: this.p.y - sender.shape.p.y,
              };
            }
            break;
          case Direction.t:
            {
              // receiver
              this.receiveFrom.t = sender;
              // sender
              sender.shape.sendTo[sender.direction] = {
                shape: this,
                direction: pressingReceivingPoint.direction, // t
              };

              senderCurve.p2 = {
                x: this.p.x - sender.shape.p.x,
                y: this.p1.y - sender.shape.p.y,
              };
            }
            break;
          case Direction.r:
            // receiver
            this.receiveFrom.r = sender;
            // sender
            sender.shape.sendTo[sender.direction] = {
              shape: this,
              direction: pressingReceivingPoint.direction, // r
            };

            senderCurve.p2 = {
              x: this.p2.x - sender.shape.p.x,
              y: this.p.y - sender.shape.p.y,
            };

            break;
          case Direction.b:
            // receiver
            this.receiveFrom.b = sender;
            // sender
            sender.shape.sendTo[sender.direction] = {
              shape: this,
              direction: pressingReceivingPoint.direction, // b
            };

            senderCurve.p2 = {
              x: this.p.x - sender.shape.p.x,
              y: this.p2.y - sender.shape.p.y,
            };
            break;
        }
      }
      this.receiving = false;
    }

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
        x: edge.l - this.p.x,
        y: edge.t - this.p.y,
        w: this.w,
        h: this.h,
      };

    ctx.save();
    ctx.translate(this.p.x, this.p.y);
    ctx.fillStyle = this.c;

    if (!this.receiving) {
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
          edge.l - this.p.x,
          edge.t - this.p.y,
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
          edge.r - this.p.x,
          edge.t - this.p.y,
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
          edge.l - this.p.x,
          edge.b - this.p.y,
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
          edge.r - this.p.x,
          edge.b - this.p.y,
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
            -this.w / 2 - this.curveTrigger.d,
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
            -this.h / 2 - this.curveTrigger.d,
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
            this.w / 2 + this.curveTrigger.d,
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
            this.h / 2 + this.curveTrigger.d,
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
    } else {
      // draw receiving points
      ctx.fillStyle = "white";
      ctx.strokeStyle = "DeepSkyBlue";
      ctx.lineWidth = this.anchor.size.stroke;

      // left
      ctx.beginPath();
      ctx.arc(-this.w / 2, 0, this.anchor.size.fill, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

      // top
      ctx.beginPath();
      ctx.arc(0, -this.h / 2, this.anchor.size.fill, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

      // right
      ctx.beginPath();
      ctx.arc(this.w / 2, 0, this.anchor.size.fill, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();

      // bottom
      ctx.beginPath();
      ctx.arc(0, this.h / 2, this.anchor.size.fill, 0, 2 * Math.PI, false);
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    // render center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    ctx.fillText(this.title, 0, 0);

    // draw id text
    ctx.textAlign = "start";
    ctx.fillText(this.id, -this.w / 2, -this.h / 2 - 10);

    if (this.redundancies.length > 0) {
      // draw error message
      ctx.textAlign = "end";
      ctx.fillStyle = "red";
      ctx.fillText("error!", this.w / 2, -this.h / 2 - 10);
    }

    ctx.restore();
  }
}
