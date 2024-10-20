"use client";
import { tailwindColors } from "@/variables/colors";
import { Inter } from "next/font/google";
import { Vec, Direction, Data as DataType } from "@/types/common";
import * as CoreTypes from "@/types/shapes/core";
import * as CommonTypes from "@/types/common";

const inter = Inter({ subsets: ["latin"] });

const ds = [Direction.l, Direction.t, Direction.r, Direction.b];

export default class Core {
  id: string;
  c: string;
  anchor = {
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
  private initOffset = {
    x: 0,
    y: 0,
  };
  private initScale = 1;
  private __w__: number;
  private __h__: number;
  title: CommonTypes.Title;
  private __p__: Vec;
  private __selecting__: boolean;
  protected __receivePoint__: CoreTypes.ReceivePoint;
  options: DataType;
  selectedData: DataType;
  deletedData: DataType;
  redundancies: DataType;
  __offset__: Vec;
  __scale__: number;
  status: CoreTypes.Status;
  private __minCurveHandlerDistance__: number;

  constructor(
    id: string,
    w: number,
    h: number,
    p: Vec,
    c: string,
    title: CommonTypes.Title
  ) {
    this.id = id;
    this.title = title;
    this.__w__ = w;
    this.__h__ = h;
    this.__p__ = p;
    this.c = c;
    this.__selecting__ = false;
    this.__receivePoint__ = {
      l: { visible: false, activate: false },
      t: { visible: false, activate: false },
      r: { visible: false, activate: false },
      b: { visible: false, activate: false },
    };
    this.options = [];
    this.selectedData = [];
    this.deletedData = [];
    this.redundancies = [];
    this.__offset__ = this.initOffset;
    this.__scale__ = this.initScale;
    this.status = CoreTypes.Status.normal;
    this.__minCurveHandlerDistance__ = 60;
  }

  set p(value: Vec) {
    this.__p__ = value;
  }

  get p() {
    return this.__p__;
  }

  set w(value: number) {
    this.__w__ = value;
  }

  get w() {
    return this.__w__;
  }

  set h(value: number) {
    this.__h__ = value;
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

  get scale() {
    return this.__scale__;
  }

  set scale(value: number) {
    this.__scale__ = value;
  }

  set selecting(_selecting: boolean) {
    this.__selecting__ = _selecting;
  }

  get selecting() {
    return this.__selecting__;
  }

  get curveTrigger() {
    return this.__curveTrigger__;
  }

  get minCurveHandlerDistance() {
    return this.__minCurveHandlerDistance__;
  }

  scalify(val: number) {
    return val * this.__scale__;
  }

  deScale(val: number) {
    return val / this.__scale__;
  }

  relativify(p: Vec) {
    return {
      x: p.x - this.__p__.x,
      y: p.y - this.__p__.y,
    };
  }

  correct(p: Vec) {
    return {
      x: p.x + this.__p__.x,
      y: p.y + this.__p__.y,
    };
  }

  offsetfy(p: Vec) {
    return {
      x: p.x + this.__offset__.x,
      y: p.y + this.__offset__.y,
    };
  }

  deOffset(p: Vec) {
    return {
      x: p.x - this.__offset__.x,
      y: p.y - this.__offset__.y,
    };
  }

  screenfy(normalP: Vec) {
    return {
      x: this.scalify(normalP.x + this.__offset__.x),
      y: this.scalify(normalP.y + this.__offset__.y),
    };
  }

  deScreenfy(screenP: Vec) {
    return {
      x: this.deScale(screenP.x) - this.__offset__.x,
      y: this.deScale(screenP.y) - this.__offset__.y,
    };
  }

  getScreenP(offset:Vec = {x:0, y:0}, scale:number = 1) {
    return {
      x: (this.p.x +offset.x) * scale,
      y: (this.p.y + offset.y) * scale,
    };
  }

  getScaleSize(scale:number = 1) {
    return {
      w: this.w * scale,
      h: this.h * scale,
    };
  }

  getScaleCurveTriggerDistance() {
    return this.__curveTrigger__.distance * this.scale;
  }

  getNormalEdge() {
    return {
      l: this.p.x - this.w / 2,
      t: this.p.y - this.h / 2,
      r: this.p.x + this.w / 2,
      b: this.p.y + this.h / 2,
    };
  }

  getEdge(offset:Vec = {x:0, y:0}, scale:number = 1) {
    const screenP = this.getScreenP(offset, scale)
    const scaleSize = this.getScaleSize(scale)
    return {
      l: screenP.x - scaleSize.w / 2,
      t: screenP.y - scaleSize.h / 2,
      r: screenP.x + scaleSize.w / 2,
      b: screenP.y + scaleSize.h / 2,
    };
  }

  getNormalCenter() {
    const edge = this.getNormalEdge();
    const pivot = {
      x: this.p.x,
      y: this.p.y,
    };

    return {
      m: pivot,
      l: { x: edge.l, y: pivot.y },
      t: { x: pivot.x, y: edge.t },
      r: { x: edge.r, y: pivot.y },
      b: { x: pivot.x, y: edge.b },
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
      __curveTrigger__: {
        l: {
          x: edge.l - this.__curveTrigger__.distance,
          y: pivot.y,
        },
        t: {
          x: pivot.x,
          y: edge.t - this.__curveTrigger__.distance,
        },
        r: {
          x: edge.r + this.__curveTrigger__.distance,
          y: pivot.y,
        },
        b: {
          x: pivot.x,
          y: edge.b + this.__curveTrigger__.distance,
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
  }

  getCenter(): CoreTypes.GetCenterReturn {
    const edge = this.getEdge();
    
    return {
      m: this.p,
      l: { x: edge.l, y: this.p.y },
      t: { x: this.p.x, y: edge.t },
      r: { x: edge.r, y: this.p.y },
      b: { x: this.p.x, y: edge.b },
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
      __curveTrigger__: {
        l: {
          x: edge.l - this.getScaleCurveTriggerDistance(),
          y: this.p.y,
        },
        t: {
          x: this.p.x,
          y: edge.t - this.getScaleCurveTriggerDistance(),
        },
        r: {
          x: edge.r + this.getScaleCurveTriggerDistance(),
          y: this.p.y,
        },
        b: {
          x: this.p.x,
          y: edge.b + this.getScaleCurveTriggerDistance(),
        },
      },
      receivingPoints: {
        l: {
          x: this.p.x - this.getScaleSize().w / 2,
          y: this.p.y,
        },
        t: {
          x: this.p.x,
          y: this.p.y - this.getScaleSize().h / 2,
        },
        r: {
          x: this.p.x + this.getScaleSize().w / 2,
          y: this.p.y,
        },
        b: {
          x: this.p.x,
          y: this.p.y + this.getScaleSize().h / 2,
        },
      },
    };
  }

  checkBoundry(p: Vec, threshold: number = 0) {
    const edge = this.getEdge();

    return (
      p.x > edge.l - this.anchor.size.fill - threshold &&
      p.y > edge.t - this.anchor.size.fill - threshold &&
      p.x < edge.r + this.anchor.size.fill + threshold &&
      p.y < edge.b + this.anchor.size.fill + threshold
    );
  }

  checkQuarterArea(screenP: undefined | Vec) {
    if (!screenP) return null;
    const center = this.getCenter();

    // 定义四个方向的三角形边向量
    const quarterVecs = {
      l: {
        lt_m: { x: center.m.x - center.lt.x, y: center.m.y - center.lt.y },
        m_lb: { x: center.lb.x - center.m.x, y: center.lb.y - center.m.y },
        lb_lt: { x: center.lt.x - center.lb.x, y: center.lt.y - center.lb.y },
      },
      t: {
        lt_rt: { x: center.rt.x - center.lt.x, y: center.rt.y - center.lt.y },
        rt_m: { x: center.m.x - center.rt.x, y: center.m.y - center.rt.y },
        m_lt: { x: center.lt.x - center.m.x, y: center.lt.y - center.m.y },
      },
      r: {
        rt_rb: { x: center.rb.x - center.rt.x, y: center.rb.y - center.rt.y },
        rb_m: { x: center.m.x - center.rb.x, y: center.m.y - center.rb.y },
        m_rt: { x: center.rt.x - center.m.x, y: center.rt.y - center.m.y },
      },
      b: {
        rb_lb: { x: center.lb.x - center.rb.x, y: center.lb.y - center.rb.y },
        m_rb: { x: center.rb.x - center.m.x, y: center.rb.y - center.m.y },
        lb_m: { x: center.m.x - center.lb.x, y: center.m.y - center.lb.y },
      },
    };

    // 定义目标点相对于三角形顶点的向量
    const targetVecs = {
      l: {
        lt_p: { x: screenP.x - center.lt.x, y: screenP.y - center.lt.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
        lb_p: { x: screenP.x - center.lb.x, y: screenP.y - center.lb.y },
      },
      t: {
        lt_p: { x: screenP.x - center.lt.x, y: screenP.y - center.lt.y },
        rt_p: { x: screenP.x - center.rt.x, y: screenP.y - center.rt.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
      r: {
        rt_p: { x: screenP.x - center.rt.x, y: screenP.y - center.rt.y },
        rb_p: { x: screenP.x - center.rb.x, y: screenP.y - center.rb.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
      b: {
        lb_p: { x: screenP.x - center.lb.x, y: screenP.y - center.lb.y },
        rb_p: { x: screenP.x - center.rb.x, y: screenP.y - center.rb.y },
        m_p: { x: screenP.x - center.m.x, y: screenP.y - center.m.y },
      },
    };

    const checkInsideTriangle = (
      vecs: [Vec, Vec, Vec],
      target: [Vec, Vec, Vec]
    ) => {
      const cross1 = vecs[0].x * target[0].y - vecs[0].y * target[0].x;
      const cross2 = vecs[1].x * target[1].y - vecs[1].y * target[1].x;
      const cross3 = vecs[2].x * target[2].y - vecs[2].y * target[2].x;

      return (
        (cross1 > 0 && cross2 > 0 && cross3 > 0) ||
        (cross1 < 0 && cross2 < 0 && cross3 < 0)
      );
    };

    const checkOnTriangle = (edgePoints: [Vec, Vec, Vec], p: Vec) => {
      const isRatio1Match =
        edgePoints[0].x -
          edgePoints[0].x / edgePoints[1].x -
          edgePoints[1].x ===
        edgePoints[0].x - edgePoints[0].x / p.x - p.x;

      const isPInSideEdgePoint1 =
        Math.max(edgePoints[0].x, edgePoints[1].x) >= p.x &&
        Math.max(edgePoints[0].y, edgePoints[1].y) >= p.y &&
        Math.max(edgePoints[0].x, edgePoints[1].x) <= p.x &&
        Math.max(edgePoints[0].y, edgePoints[1].y) <= p.y;

      const isRatio2Match =
        edgePoints[1].x -
          edgePoints[2].x / edgePoints[1].x -
          edgePoints[2].x ===
        edgePoints[1].x - edgePoints[1].x / p.x - p.x;

      const isPInSideEdgePoint2 =
        Math.max(edgePoints[1].x, edgePoints[2].x) >= p.x &&
        Math.max(edgePoints[1].y, edgePoints[2].y) >= p.y &&
        Math.max(edgePoints[1].x, edgePoints[2].x) <= p.x &&
        Math.max(edgePoints[1].y, edgePoints[2].y) <= p.y;

      const isRatio3Match =
        edgePoints[2].x -
          edgePoints[0].x / edgePoints[2].x -
          edgePoints[0].x ===
        edgePoints[2].x - edgePoints[2].x / p.x - p.x;

      const isPInSideEdgePoint3 =
        Math.max(edgePoints[2].x, edgePoints[0].x) >= p.x &&
        Math.max(edgePoints[2].y, edgePoints[0].y) >= p.y &&
        Math.max(edgePoints[2].x, edgePoints[0].x) <= p.x &&
        Math.max(edgePoints[2].y, edgePoints[0].y) <= p.y;

      return (
        (isRatio1Match && isPInSideEdgePoint1) ||
        (isRatio2Match && isPInSideEdgePoint2) ||
        (isRatio3Match && isPInSideEdgePoint3)
      );
    };

    if (
      checkInsideTriangle(
        [quarterVecs.l.lt_m, quarterVecs.l.m_lb, quarterVecs.l.lb_lt],
        [targetVecs.l.lt_p, targetVecs.l.m_p, targetVecs.l.lb_p]
      ) ||
      checkOnTriangle([center.lt, center.m, center.lb], screenP)
    ) {
      return Direction.l;
    } else if (
      checkInsideTriangle(
        [quarterVecs.t.lt_rt, quarterVecs.t.rt_m, quarterVecs.t.m_lt],
        [targetVecs.t.lt_p, targetVecs.t.rt_p, targetVecs.t.m_p]
      )
    ) {
      return Direction.t;
    } else if (
      checkInsideTriangle(
        [quarterVecs.r.rt_rb, quarterVecs.r.rb_m, quarterVecs.r.m_rt],
        [targetVecs.r.rt_p, targetVecs.r.rb_p, targetVecs.r.m_p] ||
          checkOnTriangle([center.rt, center.m, center.rb], screenP)
      )
    ) {
      return Direction.r;
    } else if (
      checkInsideTriangle(
        [quarterVecs.b.rb_lb, quarterVecs.b.m_rb, quarterVecs.b.lb_m],
        [targetVecs.b.lb_p, targetVecs.b.rb_p, targetVecs.b.m_p]
      )
    ) {
      return Direction.b;
    }

    return null;
  }

  checkVertexesBoundry(p: Vec) {
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
  }

  checkReceivingBoundry(p: Vec) {
    const edge = this.getEdge();

    const receivingBoundryOffset = 10;

    return (
      p.x > edge.l - receivingBoundryOffset &&
      p.y > edge.t - receivingBoundryOffset &&
      p.x < edge.r + receivingBoundryOffset &&
      p.y < edge.b + receivingBoundryOffset
    );
  }

  checkReceivingPointsBoundry(p: Vec) {
    const edge = this.getEdge(),
      center = this.getCenter();

    let dx, dy;

    dx = edge.l - p.x;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.l.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.l;
    }

    dx = center.m.x - p.x;
    dy = edge.t - p.y;

    if (
      this.__receivePoint__.t.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.t;
    }

    dx = p.x - edge.r;
    dy = center.m.y - p.y;

    if (
      this.__receivePoint__.r.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.r;
    }

    dx = center.m.x - p.x;
    dy = p.y - edge.b;

    if (
      this.__receivePoint__.b.visible &&
      dx * dx + dy * dy < this.anchor.size.fill * this.anchor.size.fill
    ) {
      return Direction.b;
    }

    return null;
  }

  getTriggerDirection(p: Vec) {
    if (!this.selecting) return null;
    const center = this.getCenter();

    for (const d of ds) {
      if (
        (p.x - center.__curveTrigger__[d].x) *
          (p.x - center.__curveTrigger__[d].x) +
          (p.y - center.__curveTrigger__[d].y) *
            (p.y - center.__curveTrigger__[d].y) <
        this.__curveTrigger__.size.fill * this.__curveTrigger__.size.fill
      ) {
        return Direction[d];
      }
    }

    return null;
  }

  setReceivePointVisible(d: Direction, _visible: boolean) {
    this.__receivePoint__[d].visible = _visible;
  }

  setReceivePointActivate(d: Direction, _actviate: boolean) {
    this.__receivePoint__[d].activate = _actviate;
  }

  getRedundancies() {
    this.status = CoreTypes.Status.normal;
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

    this.deletedData.forEach((dataItem) => {
      if (!optionsHash[dataItem.text]) {
        this.redundancies.push(dataItem);
      }
    });

    if (this.redundancies.length > 0) {
      this.status = CoreTypes.Status.error;
    }
  }

  getIsReceiving() {
    return (
      !this.__receivePoint__.l.visible &&
      !this.__receivePoint__.t.visible &&
      !this.__receivePoint__.r.visible &&
      !this.__receivePoint__.b.visible
    );
  }

  move(offset: Vec) {
    let xOffset = offset.x / this.scale,
      yOffset = offset.y / this.scale;

    this.p = {
      x: this.p.x + xOffset,
      y: this.p.y + yOffset,
    };
  }

  locate(p: { x: null | number; y: null | number }) {
    if (!p.x && !p.y) return;

    if (!!p.x && !!p.y) {
      this.p = {
        x: p.x / this.scale - this.offset.x,
        y: p.y / this.scale - this.offset.y,
      };
    } else if (!!p.x && !p.y) {
      this.p = {
        x: p.x / this.scale - this.offset.x,
        y: this.p.y,
      };
    } else if (!!p.y && !p.x) {
      this.p = {
        x: this.p.x,
        y: p.y / this.scale - this.offset.y,
      };
    }
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

  renderText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split("");
    const lines: string[] = [];
    const padding = 32;
    const lineH = this.scalify(lineHeight);
    let line = "";

    for (const word of words) {
      const testLine = line + word,
        metrics = ctx.measureText(testLine),
        testWidth = metrics.width;

      if (testWidth > maxWidth - this.scalify(padding)) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }

    lines.push(line);

    // calculate the maximum number of lines
    const maxLines = Math.floor(this.scalify(this.h - padding) / lineH);

    // make sure the number of lines to be rendered does not exceed the maximum number of lines
    const totalLines = Math.min(lines.length, maxLines);

    // calculate the width of the last line and check if ellipsis needs to be added
    if (totalLines < lines.length) {
      const lastLine = lines[totalLines - 1] || "";
      const ellipsis = "...";
      const metricsEllipsis = ctx.measureText(ellipsis);
      const maxTextWidth = maxWidth - 32 * this.scale - metricsEllipsis.width;

      let truncatedLine = "";
      for (const char of lastLine) {
        const testLine = truncatedLine + char;
        const metricsTestLine = ctx.measureText(testLine);
        if (metricsTestLine.width > maxTextWidth) {
          break;
        }
        truncatedLine = testLine;
      }
      lines[totalLines - 1] = truncatedLine + ellipsis;
    }

    const offsetYs: number[] = [];
    let offsetY =
      totalLines % 2 === 0
        ? lineH * (1 / 2 + totalLines / 2 - 1)
        : lineH * Math.floor(totalLines / 2);

    for (let i = 0; i < totalLines; i++) {
      offsetYs.push(offsetY);
      offsetY -= lineH;
    }

    for (let i = 0; i < totalLines; i++) {
      ctx.fillText(lines[i], x, y - offsetYs[i]);
    }
  };

  draw(ctx: CanvasRenderingContext2D, offest:CommonTypes.Vec={x:0, y:0}, scale:number = 0,drawShapePath: () => void) {
    const edge = this.getEdge(offest, scale)
    const screenP = this.getScreenP(offest, scale)
    const scaleSize = this.getScaleSize(scale)
    const fillRectParams = {
        x: edge.l - screenP.x,
        y: edge.t - screenP.y,
        w: scaleSize.w,
        h: scaleSize.h,
      };
    // ctx.globalAlpha = 0.5; // TODO: for testing ghost

    ctx.fillStyle = (() => {
      switch (this.status) {
        case CoreTypes.Status.disabled:
          return "#7e7e7e";

        case CoreTypes.Status.error:
          return "#EB5757";

        default:
          return this.c;
      }
    })();

    drawShapePath();

    if (this.status === CoreTypes.Status.error) {
      // draw error message
      ctx.textAlign = "end";
      ctx.fillText(
        "error!",
        scaleSize.w / 2,
        -scaleSize.h / 2 - 10
      );
    }

    if (this.getIsReceiving()) {
      ctx.save()
      ctx.translate(screenP.x, screenP.y)
      if (this.__selecting__) {
        // draw frame
        ctx.fillStyle = "white";
        ctx.strokeStyle = "#00BFFF";
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
          edge.l - screenP.x,
          edge.t - screenP.y,
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
          edge.r - screenP.x,
          edge.t - screenP.y,
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
          edge.l - screenP.x,
          edge.b - screenP.y,
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
          edge.r - screenP.x,
          edge.b - screenP.y,
          this.anchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // right, bottom
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
      }
      ctx.restore()
    }

    ctx.save()
    ctx.translate(screenP.x, screenP.y)
    // render center text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.font = `${16 * scale}px ${inter.style.fontFamily}`;
    this.renderText(ctx, this.title, 0, 0, scaleSize.w, 20);
    ctx.restore()


    // draw id text
    // ctx.textAlign = "start";
    // ctx.fillText(
    //   this.id,
    //   -this.getScaleSize().w / 2,
    //   -this.getScaleSize().h / 2 - 10
    // );
  }

  drawSendingPoint(ctx: CanvasRenderingContext2D, offest:CommonTypes.Vec={x:0, y:0}, scale:number = 0) {
    if (!ctx) return;
    const screenP = this.getScreenP(offest, scale)
    const scaleSize = this.getScaleSize(scale)
    const curveTriggerDistance = this.__curveTrigger__.distance*scale
    // draw curve triggers
    ctx.fillStyle = "white";
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.strokeSize;


    ctx.save()
    ctx.translate(screenP.x, screenP.y)

    // left
    ctx.beginPath();
    ctx.arc(
      -scaleSize.w / 2 - curveTriggerDistance,
      0,
      this.anchor.size.fill,
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
      -scaleSize.h / 2 - curveTriggerDistance,
      this.anchor.size.fill,
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
      scaleSize.w / 2 + curveTriggerDistance,
      0,
      this.anchor.size.fill,
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
      scaleSize.h / 2 + curveTriggerDistance,
      this.__curveTrigger__.size.fill,
      0,
      2 * Math.PI,
      false
    );
    ctx.stroke();
    ctx.fill();
    ctx.closePath();

    ctx.restore()
  }

  drawRecievingPoint(ctx: CanvasRenderingContext2D,offest:CommonTypes.Vec={x:0, y:0}, scale:number = 0) {
    const screenP = this.getScreenP(offest, scale)
    const scaleSize = this.getScaleSize(scale)
    ctx.save();
    ctx.translate(screenP.x, screenP.y);
    // draw receiving points
    ctx.fillStyle = tailwindColors.white["500"];
    ctx.strokeStyle = "DeepSkyBlue";
    ctx.lineWidth = this.anchor.size.stroke;

    // left
    if (this.__receivePoint__.l.visible) {
      if (this.__receivePoint__.l.activate) {
        ctx.fillStyle = "DeepSkyBlue";
      } else {
        ctx.fillStyle = tailwindColors.white["500"];
      }
      ctx.beginPath();
      ctx.arc(
        -scaleSize.w / 2,
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
        scaleSize.w / 2,
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
      ctx.arc(
        0,
        scaleSize.h / 2,
        this.anchor.size.fill,
        0,
        2 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }

    ctx.restore();
  }
}
