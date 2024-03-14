"use client";
import Curve from "@/shapes/curve";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import { Line } from "@/types/shapes/curve";
import * as CoreTypes from "@/types/shapes/core";
import { Title } from "@/types/shapes/common";

const ds = [Direction.l, Direction.t, Direction.r, Direction.b];

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
  __w__: number;
  __h__: number;
  minW: number;
  minH: number;
  title: Title;
  __p__: Vec;
  curves: {
    l: { shape: null | Curve; sendTo: null | CoreTypes.SendTo };
    t: { shape: null | Curve; sendTo: null | CoreTypes.SendTo };
    r: { shape: null | Curve; sendTo: null | CoreTypes.SendTo };
    b: { shape: null | Curve; sendTo: null | CoreTypes.SendTo };
  };

  __selecting__: boolean;
  __receiving__: CoreTypes.Receiving;
  pressing: {
    activate: boolean;
    target: CoreTypes.PressingTarget | null;
  };
  receiveFrom: {
    l: null | CoreTypes.ReceiveFrom;
    t: null | CoreTypes.ReceiveFrom;
    r: null | CoreTypes.ReceiveFrom;
    b: null | CoreTypes.ReceiveFrom;
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
    this.__w__ = w;
    this.__h__ = h;
    this.minW = 100;
    this.minH = 100;
    this.title = "";
    this.__p__ = p;
    this.curves = {
      l: { shape: null, sendTo: null },
      t: { shape: null, sendTo: null },
      r: { shape: null, sendTo: null },
      b: { shape: null, sendTo: null },
    };
    this.__selecting__ = false;
    this.__receiving__ = {
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

  set p(value: Vec) {
    const offest = {
      x: value.x - this.p.x,
      y: value.y - this.p.y,
    };
    this.__p__ = value;

    for (const d of ds) {
      // when receiver shape move, sender curve follows the receiver shape
      const receiverShape = this.receiveFrom[d],
        receiverCurve = receiverShape?.shape.curves[receiverShape.sendD].shape;

      if (receiverCurve) {
        receiverCurve.p2 = {
          x: receiverCurve.p2.x + offest.x,
          y: receiverCurve.p2.y + offest.y,
        };
        receiverCurve.cp2.x += offest.x;
        receiverCurve.cp2.y += offest.y;
      }

      // when sender shape move, receiver curve follows the sender shape
      const senderCurve = this.curves[d].shape,
        sendToShape = this.curves[d].sendTo?.shape;

      if (senderCurve && sendToShape) {
        senderCurve.p2 = {
          x: senderCurve.p2.x - offest.x,
          y: senderCurve.p2.y - offest.y,
        };
        senderCurve.cp2.x -= offest.x;
        senderCurve.cp2.y -= offest.y;
      }
    }
  }

  get p() {
    return this.__p__;
  }

  set w(value: number) {
    const offset = (this.w - value) / 2;
    this.__w__ = value;

    const curve_l = this.curves.l.shape,
      curve_r = this.curves.r.shape,
      sendTo_l = this.curves.l.sendTo,
      sendTo_r = this.curves.r.sendTo;

    if (curve_l) {
      curve_l.p1.x += offset / this.scale;
      curve_l.cp1.x += offset / this.scale;

      if (!sendTo_l) {
        curve_l.p2 = {
          ...curve_l.p2,
          x: curve_l.p2.x + offset / this.scale,
        };
        curve_l.cp2.x += offset / this.scale;
      }
    }

    if (curve_r) {
      curve_r.p1.x -= offset / this.scale;
      curve_r.cp1.x -= offset / this.scale;

      if (!sendTo_r) {
        curve_r.p2 = {
          ...curve_r.p2,
          x: curve_r.p2.x - offset / this.scale,
        };
        curve_r.cp2.x -= offset / this.scale;
      }
    }

    const receiveFromCurve_l = this.receiveFrom.l?.shape.curves[
      this.receiveFrom.l.sendD
    ].shape,
      receiveFromCurve_r = this.receiveFrom.r?.shape.curves[
        this.receiveFrom.r.sendD
      ].shape;

    if (receiveFromCurve_l) {
      receiveFromCurve_l.p2 = {
        ...receiveFromCurve_l.p2,
        x: receiveFromCurve_l.p2.x + offset / this.scale,
      };
      receiveFromCurve_l.cp2.x += offset / this.scale;
    }

    if (receiveFromCurve_r) {
      receiveFromCurve_r.p2 = {
        ...receiveFromCurve_r.p2,
        x: receiveFromCurve_r.p2.x - offset / this.scale,
      };
      receiveFromCurve_r.cp2.x -= offset / this.scale;
    }
  }

  get w() {
    return this.__w__;
  }

  set h(value: number) {
    const offset = (this.h - value) / 2;
    this.__h__ = value;

    const curve_t = this.curves.t.shape,
      curve_b = this.curves.b.shape,
      sendTo_t = this.curves.t.sendTo,
      sendTo_b = this.curves.b.sendTo;

    if (curve_t) {
      curve_t.p1.y += offset / this.scale;
      curve_t.cp1.y += offset / this.scale;

      if (!sendTo_t) {
        curve_t.p2 = {
          ...curve_t.p2,
          y: curve_t.p2.y + offset / this.scale,
        };
        curve_t.cp2.y += offset / this.scale;
      }
    }

    if (curve_b) {
      curve_b.p1.y -= offset / this.scale;
      curve_b.cp1.y -= offset / this.scale;

      if (!sendTo_b) {
        curve_b.p2 = {
          ...curve_b.p2,
          y: curve_b.p2.y - offset / this.scale,
        };
        curve_b.cp2.y -= offset / this.scale;
      }
    }

    const receiveFromCurve_t = this.receiveFrom.t?.shape.curves[
      this.receiveFrom.t.sendD
    ].shape,
      receiveFromCurve_b = this.receiveFrom.b?.shape.curves[
        this.receiveFrom.b.sendD
      ].shape;

    if (receiveFromCurve_t) {
      receiveFromCurve_t.p2 = {
        ...receiveFromCurve_t.p2,
        y: receiveFromCurve_t.p2.y + offset / this.scale,
      };
      receiveFromCurve_t.cp2.y += offset / this.scale;
    }

    if (receiveFromCurve_b) {
      receiveFromCurve_b.p2 = {
        ...receiveFromCurve_b.p2,
        y: receiveFromCurve_b.p2.y - offset / this.scale,
      };
      receiveFromCurve_b.cp2.y -= offset / this.scale;
    }
  }

  get h() {
    return this.__h__;
  }

  set offset(value: Vec) {
    this.__offset__ = value;
  }

  get offset() {
    return this.__offset__;
  }

  set scale(value: number) {
    this.__scale__ = value;

    const curve = this.curves;

    if (curve?.l.shape) {
      curve.l.shape.scale = value;
    }
    if (curve?.t.shape) {
      curve.t.shape.scale = value;
    }
    if (curve?.r.shape) {
      curve.r.shape.scale = value;
    }
    if (curve?.b.shape) {
      curve.b.shape.scale = value;
    }
  }

  get scale() {
    return this.__scale__;
  }

  set selecting(_selecting: boolean) {
    this.__selecting__ = _selecting;
  }

  get selecting() {
    return this.__selecting__;
  }

  set receiving(_receiving: CoreTypes.Receiving) {
    this.__receiving__ = _receiving;
  }

  get receiving() {
    return this.__receiving__;
  }

  getScreenP = () => {
    return {
      x: (this.p.x + this.offset.x) * this.scale,
      y: (this.p.y + this.offset.y) * this.scale,
    };
  };

  getScaleSize = () => {
    return {
      w: this.w * this.scale,
      h: this.h * this.scale,
      minW: this.minW * this.scale,
      minH: this.minH * this.scale,
    };
  };

  getScaleCurveTriggerDistance = () => {
    return this.curveTrigger.d * this.scale;
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
      return CoreTypes.PressingTarget.lt;
    }

    dx = edge.r - p.x;
    dy = edge.t - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rt;
    }

    dx = edge.r - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.rb;
    }

    dx = edge.l - p.x;
    dy = edge.b - p.y;

    if (dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill) {
      return CoreTypes.PressingTarget.lb;
    }

    return null;
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

    if (
      this.receiving.l &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.l;
    }

    dx = center.m.x - p.x;
    dy = edge.t - p.y;

    if (
      this.receiving.t &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.t;
    }

    dx = p.x - edge.r;
    dy = center.m.y - p.y;

    if (
      this.receiving.r &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.r;
    }

    dx = center.m.x - p.x;
    dy = p.y - edge.b;

    if (
      this.receiving.b &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.b;
    }

    return null;
  };

  checkCurveTriggerBoundry = (p: Vec) => {
    if (!this.selecting) return null;
    const center = this.getCenter();

    for (const d of ds) {
      if (
        !this.curves[d].shape &&
        (p.x - center.curveTrigger[d].x) * (p.x - center.curveTrigger[d].x) +
        (p.y - center.curveTrigger[d].y) * (p.y - center.curveTrigger[d].y) <
        this.curveTrigger.size.fill * this.curveTrigger.size.fill
      ) {
        return Direction[d];
      }
    }
  };

  connect = (receiveD: Direction, connectTarget: CoreTypes.ConnectTarget) => {
    if (this.curves[receiveD].shape) return;

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
        x: this.p.x - connectTarget.shape.p.x - this.w / 2 - thershold,
        y: this.p.y - connectTarget.shape.p.y,
      };
    } else if (receiveD === Direction.t) {
      senderCurve.p2 = {
        x: this.p.x - connectTarget.shape.p.x,
        y: this.p.y - connectTarget.shape.p.y - this.h / 2 - thershold,
      };
    } else if (receiveD === Direction.r) {
      senderCurve.p2 = {
        x: this.p.x - connectTarget.shape.p.x + this.w / 2 + thershold,
        y: this.p.y - connectTarget.shape.p.y,
      };
    } else if (receiveD === Direction.b) {
      senderCurve.p2 = {
        x: this.p.x - connectTarget.shape.p.x,
        y: this.p.y - connectTarget.shape.p.y + this.h / 2 + thershold,
      };
    }
  };

  disConnect = (d: Direction, fromSender: boolean) => {
    if (fromSender) {
      const receiverShape = this.curves[d]?.sendTo?.shape,
        receiverDirection = this.curves[d]?.sendTo?.receiveD;

      if (receiverShape && receiverDirection) {
        receiverShape.receiveFrom[receiverDirection] = null;
        this.curves[d].sendTo = null;
      }
    } else {
      const senderShape = this.receiveFrom[d]?.shape,
        senderDirection = this.receiveFrom[d]?.sendD;

      if (senderShape && senderDirection) {
        senderShape.curves[senderDirection].sendTo = null;
        this.receiveFrom[d] = null;
      }
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
    this.curves[d].shape = null;

    const sendShape = this.curves[d]?.sendTo?.shape,
      recieveShapeDirection = this.curves[d]?.sendTo?.receiveD;

    if (sendShape && recieveShapeDirection) {
      sendShape.receiveFrom[recieveShapeDirection] = null;
      this.curves[d].sendTo = null;
    }
  };

  move(p: Vec, dragP: Vec) {
    let xOffset = (p.x - dragP.x) / this.scale,
      yOffset = (p.y - dragP.y) / this.scale;

    this.p = {
      x: this.p.x + xOffset,
      y: this.p.y + yOffset,
    };
  }

  resize(offset: Vec, vertex: CoreTypes.PressingTarget) {
    if (
      vertex !== CoreTypes.PressingTarget.lt &&
      vertex !== CoreTypes.PressingTarget.rt &&
      vertex !== CoreTypes.PressingTarget.rb &&
      vertex !== CoreTypes.PressingTarget.lb
    )
      return;
    // sender curves follows
    let _w = this.w,
      _h = this.h;

    if (vertex === CoreTypes.PressingTarget.lt) {
      _w =
        this.w - offset.x / this.scale <= 0
          ? 0
          : this.w - offset.x / this.scale;
      _h =
        this.h - offset.y / this.scale <= 0
          ? 0
          : this.h - offset.y / this.scale;

      if (_w > 0 || offset.x < 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y < 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.rt) {
      _w =
        this.w + offset.x / this.scale <= 0
          ? 0
          : this.w + offset.x / this.scale;
      _h =
        this.h - offset.y / this.scale <= 0
          ? 0
          : this.h - offset.y / this.scale;

      if (_w > 0 || offset.x > 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y < 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.rb) {
      _w =
        this.w + offset.x / this.scale <= 0
          ? 0
          : this.w + offset.x / this.scale;
      _h =
        this.h + offset.y / this.scale <= 0
          ? 0
          : this.h + offset.y / this.scale;

      if (_w > 0 || offset.x > 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y > 0) {
        this.h = Math.abs(_h);
      }
    } else if (vertex === CoreTypes.PressingTarget.lb) {
      _w =
        this.w - offset.x / this.scale <= 0
          ? 0
          : this.w - offset.x / this.scale;
      _h =
        this.h + offset.y / this.scale <= 0
          ? 0
          : this.h + offset.y / this.scale;

      if (_w > 0 || offset.x < 0) {
        this.w = Math.abs(_w);
      }
      if (this.h > 0 || offset.y > 0) {
        this.h = Math.abs(_h);
      }
    }

    this.p = {
      x: _w > 0 ? this.p.x + offset.x / 2 / this.scale : this.p.x,
      y: _h > 0 ? this.p.y + offset.y / 2 / this.scale : this.p.y,
    };
  }

  createCurve(id: string, d: Direction) {
    const theCurve = this.curves[d];

    if (d === Direction.l) {
      theCurve.shape = new Curve(
        id,
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
    } else if (d === Direction.t) {
      theCurve.shape = new Curve(
        id,
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
    } else if (d === Direction.r) {
      theCurve.shape = new Curve(
        id,
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
    } else if (d === Direction.b) {
      theCurve.shape = new Curve(
        id,
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
    }

    if (!theCurve.shape) return;
    theCurve.shape.scale = this.scale;
  }

  renderText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(""),
      lines: string[] = [];
    let line = "";

    for (var i = 0; i < words.length; i++) {
      var testLine = line + words[i];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        lines.push(line)
        line = words[i];
      } else {
        line = testLine;
      }
    }

    lines.push(line)

    const offsetYs: number[] = [];
    let offsetY = lines.length % 2 === 0 ? (lineHeight) * (1 / 2 + lines.length / 2 - 1) : (lineHeight) * (Math.floor(lines.length / 2))

    lines.forEach(line => {
      offsetYs.push(offsetY)
      offsetY -= lineHeight
    })

    lines.forEach((line, lineI) => {
      ctx.fillText(line, x, y + offsetYs[lineI]);
    })
  };

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
      if (this.__selecting__) {
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

        if (!this.curves.l.shape && !this.receiveFrom.l && sendable) {
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

        if (!this.curves.t.shape && !this.receiveFrom.t && sendable) {
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

        if (!this.curves.r.shape && !this.receiveFrom.r && sendable) {
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

        if (!this.curves.b.shape && !this.receiveFrom.b && sendable) {
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
      if (this.receiving.l && !this.curves.l.shape) {
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
      if (this.receiving.t && !this.curves.t.shape) {
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
      if (this.receiving.r && !this.curves.r.shape) {
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
      if (this.receiving.b && !this.curves.b.shape) {
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

    // render center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.font = "14px Arial";
    // ctx.fillText(this.title, 0, 0);

    this.renderText(ctx, this.title, 0, 0, this.w, 16);

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

  drawCurve(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.getScreenP().x, this.getScreenP().y);

    if (this.curves.l.shape) {
      this.curves.l.shape.draw(ctx);
    }

    if (this.curves.t.shape) {
      this.curves.t.shape.draw(ctx);
    }

    if (this.curves.r.shape) {
      this.curves.r.shape.draw(ctx);
    }

    if (this.curves.b.shape) {
      this.curves.b.shape.draw(ctx);
    }

    ctx.restore();
  }
}
