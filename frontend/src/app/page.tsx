// indivsual data hover color / change shape type when editing shape / edit data name in overall datas / edit data name in indivisual / copy data / downloaded data with project name / data horizental sender curve position
"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import Curve from "@/shapes/curve";
import SelectionFrame from "@/shapes/selectionFrame";
import Selection from "@/shapes/selection";
import Stack from "@/dataStructure/stack";
import Button from "@/components/button";
import OverallSidePanel from "@/sections/overallSidePanel";
import IndivisaulSidePanel from "@/sections/indivisualSidePanel";
import Console from "@/sections/console";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { tailwindColors } from "@/variables/colors";
import * as handleUtils from "@/utils/handle";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/common";
import * as SelectionTypes from "@/types/shapes/selection";
import * as IndivisaulSidePanelTypes from "@/types/sections/id/indivisualSidePanel";
import * as InputTypes from "@/types/components/input";
import * as PageIdTypes from "@/types/app/pageId";
import * as CheckDataTypes from "@/types/workers/checkData";

axios.defaults.baseURL = process.env.BASE_URL || "http://localhost:5000/api";

const isBrowser = typeof window !== "undefined";

const init = {
  shape: {
    size: {
      t: { w: 144, h: 72 },
      p: { w: 144, h: 72 },
      d: { w: 144, h: 72 },
      dec: { w: 144, h: 72 },
    },
  },
  authInfo: {
    account: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    password: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
    email: {
      value: undefined,
      status: InputTypes.Status.normal,
      comment: undefined,
    },
  },
  offset: { x: 0, y: 0 },
};

let ctx: CanvasRenderingContext2D | null | undefined = null,
  ctx_screenshot: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  candidates: null | (Terminal | Process | Data | Desicion)[] = null,
  curves: CommonTypes.ConnectionCurves = [],
  pressingSelection: null | PageIdTypes.PressingSelection = null,
  pressingCurve: null | PageIdTypes.PressingCurve = null,
  offset: CommonTypes.Vec = cloneDeep(init.offset),
  lastP: CommonTypes.Vec = { x: 0, y: 0 },
  selectionFrame: null | SelectionFrame = null,
  selection: null | Selection = null,
  alginLines: { from: CommonTypes.Vec; to: CommonTypes.Vec }[] = [],
  actions: PageIdTypes.Actions = new Stack(40),
  worker: null | Worker = null;

const curveThresholdStrategy = {
  [CommonTypes.ShapeType.terminator]: {
    l: 0,
    t: 0,
    r: 0,
    b: 0,
  },
  [CommonTypes.ShapeType.process]: {
    l: 0,
    t: 0,
    r: 0,
    b: 0,
  },
  [CommonTypes.ShapeType.data]: {
    l: 8,
    t: 0,
    r: -8,
    b: 0,
  },
  [CommonTypes.ShapeType.decision]: {
    l: 0,
    t: 0,
    r: 0,
    b: 0,
  },
};

const getActionRecords = () => {
  const records: Map<
    string,
    {
      shapes: (Terminal | Process | Data | Desicion)[] | null;
      curves: CommonTypes.ConnectionCurves | null;
    }
  > = new Map();

  return {
    register: (type: CommonTypes.Action) => {
      if (records.get(type)) return;
      records.set(type, {
        shapes: cloneDeep(shapes),
        curves: cloneDeep(curves),
      });
    },
    interrupt: (type: CommonTypes.Action) => {
      if (!records.get(type)) return;
      records.delete(type);
    },
    finish: (type: CommonTypes.Action) => {
      const _shapes = records.get(type)?.shapes;
      const _curves = records.get(type)?.curves;
      if (!_shapes || !_curves) return;
      actions.push({
        type: type,
        shapes: _shapes,
        curves: _curves,
      });
      records.delete(type);
    },
    peekKey: () => {
      const lastKey = Array.from(records.keys()).pop();
      return lastKey;
    },
  };
};

const actionRecords = getActionRecords();

const getNormalP = (
  p: CommonTypes.Vec,
  offset: null | CommonTypes.Vec,
  scale: number
) => {
  offset = offset ? offset : { x: 0, y: 0 };
  return {
    x: p.x / scale - offset.x,
    y: p.y / scale - offset.y,
  };
};

const getScreenP = (
  p: CommonTypes.Vec,
  offset: null | CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  offset = offset ? offset : { x: 0, y: 0 };
  return {
    x: (p.x + offset.x) * scale,
    y: (p.y + offset.y) * scale,
  };
};

const getScreenshotShapes = (
  shapes: (Terminal | Process | Data | Desicion)[]
) => {
  const suffix = "screenshot";
  const screenshotShapes: (Terminal | Process | Data | Desicion)[] = [];

  shapes.forEach((shape) => {
    let screenshotShape;

    if (shape instanceof Terminal) {
      screenshotShape = new Terminal(
        shape.id + suffix,
        shape.w,
        shape.h,
        shape.p,
        shape.title
      );
    } else if (shape instanceof Process) {
      screenshotShape = new Process(
        shape.id + suffix,
        shape.w,
        shape.h,
        shape.p,
        shape.title
      );
    } else if (shape instanceof Data) {
      screenshotShape = new Data(
        shape.id + suffix,
        shape.w,
        shape.h,
        shape.p,
        shape.title
      );
    } else if (shape instanceof Desicion) {
      screenshotShape = new Desicion(
        shape.id + suffix,
        shape.w,
        shape.h,
        shape.p,
        shape.title
      );
    }

    if (!screenshotShape) return;

    screenshotShapes.push(screenshotShape);
  });

  if (shapes.length !== screenshotShapes.length) return [];

  // TODO: wait for mathcing backend feature
  // screenshotShapes.forEach((screenshotShape, screenshotShapeI) => {
  //   ds.forEach((d) => {
  //     shapes[screenshotShapeI].curves[d].forEach((curve) => {
  //       screenshotShape.createCurve(
  //         curve.shape.id + suffix,
  //         d,
  //         curve.shape.p1,
  //         curve.shape.p2,
  //         curve.shape.cp1,
  //         curve.shape.cp2,
  //         curve.sendTo
  //       );
  //     });
  //   });
  // });

  return screenshotShapes;
};

// TODO: wait for align feature
// const getAlignVertixP = (
//   shapes: (Terminal | Process | Data | Desicion)[],
//   baseVertex?: CommonTypes.Vec
// ) => {
//   let output: { x: null | number; y: null | number } = { x: null, y: null };
//   if (!baseVertex || shapes.length === 0) return output;

//   for (let i = 0; i < shapes.length; i++) {
//     const targetShape = shapes[i];
//     const targetCenter = targetShape.getCenter().m;
//     const targetEdge = targetShape.getEdge();
//     const threshold = 10;

//     // align center
//     // x
//     if (
//       baseVertex.x >= targetCenter.x - threshold &&
//       baseVertex.x <= targetCenter.x + threshold
//     ) {
//       output.x = targetCenter.x;
//     }

//     // y
//     if (
//       baseVertex.y >= targetCenter.y - threshold &&
//       baseVertex.y <= targetCenter.y + threshold
//     ) {
//       output.y = targetCenter.y;
//     }

//     // align left
//     if (
//       baseVertex.x >= targetEdge.l - threshold &&
//       baseVertex.x <= targetEdge.l + threshold
//     ) {
//       output.x = targetEdge.l;
//     }

//     // align right
//     if (
//       baseVertex.x >= targetEdge.r - threshold &&
//       baseVertex.x <= targetEdge.r + threshold
//     ) {
//       output.x = targetEdge.r;
//     }

//     // align top
//     if (
//       baseVertex.y >= targetEdge.t - threshold &&
//       baseVertex.y <= targetEdge.t + threshold
//     ) {
//       output.y = targetEdge.t;
//     }

//     // align bottom
//     if (
//       baseVertex.y >= targetEdge.b - threshold &&
//       baseVertex.y <= targetEdge.b + threshold
//     ) {
//       output.y = targetEdge.b;
//     }
//   }

//   return output;
// };

// TODO: wait for align feature
// const getVertexAlignLines = (
//   shapes: (Terminal | Process | Data | Desicion)[],
//   baseVertex?: CommonTypes.Vec
// ) => {
//   if (!baseVertex || shapes.length === 0) return [];
//   const lines: {
//     from: CommonTypes.Vec;
//     to: CommonTypes.Vec;
//   }[] = [];

//   // align center
//   const vertexes_m = shapes
//     .map((targetShape) => targetShape.getCenter().m)
//     .concat(baseVertex);

//   // y
//   const align_center_y_vertexes = vertexes_m
//     .filter(
//       (vertex) =>
//         Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
//     )
//     .sort((a, b) => a.x - b.x);

//   if (
//     align_center_y_vertexes.length >= 2 &&
//     align_center_y_vertexes[0] &&
//     align_center_y_vertexes[align_center_y_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_center_y_vertexes[0].x || baseVertex.x,
//         y: baseVertex.y,
//       },
//       to: {
//         x:
//           align_center_y_vertexes[align_center_y_vertexes.length - 1].x ||
//           baseVertex.x,
//         y: baseVertex.y,
//       },
//     });
//   }

//   // x
//   const align_center_x_vertexes = vertexes_m
//     .filter(
//       (vertex) =>
//         Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
//     )
//     .sort((a, b) => a.y - b.y);

//   if (
//     align_center_x_vertexes.length >= 2 &&
//     align_center_x_vertexes[0] &&
//     align_center_x_vertexes[align_center_x_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: baseVertex.x,
//         y: align_center_x_vertexes[0].y || baseVertex.y,
//       },
//       to: {
//         x: baseVertex.x,
//         y:
//           align_center_x_vertexes[align_center_x_vertexes.length - 1].y ||
//           baseVertex.y,
//       },
//     });
//   }

//   // align left
//   const vertexes_l = shapes
//     .map((targetShape) => targetShape.getCenter().l)
//     .concat(baseVertex);

//   const align_l_vertexes = vertexes_l
//     .filter(
//       (vertex) =>
//         Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
//     )
//     .sort((a, b) => a.y - b.y);

//   if (
//     align_l_vertexes.length >= 2 &&
//     align_l_vertexes[0] &&
//     align_l_vertexes[align_l_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: baseVertex.x,
//         y: align_l_vertexes[0].y || baseVertex.y,
//       },
//       to: {
//         x: baseVertex.x,
//         y: align_l_vertexes[align_l_vertexes.length - 1].y || baseVertex.y,
//       },
//     });
//   }

//   // align right
//   const vertexes_r = shapes
//     .map((targetShape) => targetShape.getCenter().r)
//     .concat(baseVertex);

//   const align_r_vertexes = vertexes_r
//     .filter(
//       (vertex) =>
//         Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
//     )
//     .sort((a, b) => a.y - b.y);

//   if (
//     align_r_vertexes.length >= 2 &&
//     align_r_vertexes[0] &&
//     align_r_vertexes[align_r_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: baseVertex.x,
//         y: align_r_vertexes[0].y || baseVertex.y,
//       },
//       to: {
//         x: baseVertex.x,
//         y: align_r_vertexes[align_r_vertexes.length - 1].y || baseVertex.y,
//       },
//     });
//   }

//   // align top
//   const vertexes_t = shapes
//     .map((targetShape) => targetShape.getCenter().t)
//     .concat(baseVertex);

//   const align_t_vertexes = vertexes_t
//     .filter(
//       (vertex) =>
//         Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
//     )
//     .sort((a, b) => a.x - b.x);

//   if (
//     align_t_vertexes.length >= 2 &&
//     align_t_vertexes[0] &&
//     align_t_vertexes[align_t_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_t_vertexes[0].x || baseVertex.x,
//         y: baseVertex.y,
//       },
//       to: {
//         x: align_t_vertexes[align_t_vertexes.length - 1].x || baseVertex.x,
//         y: baseVertex.y,
//       },
//     });
//   }

//   // align bottom
//   const vertexes_b = shapes
//     .map((targetShape) => targetShape.getCenter().b)
//     .concat(baseVertex);

//   const align_b_vertexes = vertexes_b
//     .filter(
//       (vertex) =>
//         Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
//     )
//     .sort((a, b) => a.x - b.x);

//   if (
//     align_b_vertexes.length >= 2 &&
//     align_b_vertexes[0] &&
//     align_b_vertexes[align_b_vertexes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_b_vertexes[0].x || baseVertex.x,
//         y: baseVertex.y,
//       },
//       to: {
//         x: align_b_vertexes[align_b_vertexes.length - 1].x || baseVertex.x,
//         y: baseVertex.y,
//       },
//     });
//   }

//   return lines;
// };

// TODO: wait for align feature
// const getAlignP = (
//   shapes: (Terminal | Process | Data | Desicion)[],
//   baseShape?: null | Terminal | Process | Data | Desicion
// ) => {
//   let output: { x: null | number; y: null | number } = { x: null, y: null };
//   if (!baseShape || shapes.length === 0) return output;

//   for (let i = 0; i < shapes.length; i++) {
//     const targetShape = shapes[i];
//     if (targetShape.id === baseShape.id) continue;

//     const targetEdge = targetShape.getEdge();
//     const targetCenter = targetShape.getCenter().m;
//     const baseEdge = baseShape.getEdge();
//     const baseCenter = baseShape.getCenter().m;
//     const threshold = 10;

//     // center x & center x
//     if (
//       baseCenter.x >= targetCenter.x - threshold &&
//       baseCenter.x <= targetCenter.x + threshold
//     ) {
//       output.x = targetCenter.x;
//     }

//     // center y & center y
//     if (
//       baseCenter.y >= targetCenter.y - threshold &&
//       baseCenter.y <= targetCenter.y + threshold
//     ) {
//       output.y = targetCenter.y;
//     }

//     // left & left
//     if (
//       baseEdge.l >= targetEdge.l - threshold &&
//       baseEdge.l <= targetEdge.l + threshold
//     ) {
//       output.x = targetEdge.l + baseShape.w / 2;
//     }

//     // left & right
//     if (
//       baseEdge.l >= targetEdge.r - threshold &&
//       baseEdge.l <= targetEdge.r + threshold
//     ) {
//       output.x = targetEdge.r + baseShape.w / 2;
//     }

//     // top & top
//     if (
//       baseEdge.t >= targetEdge.t - threshold &&
//       baseEdge.t <= targetEdge.t + threshold
//     ) {
//       output.y = targetEdge.t + baseShape.h / 2;
//     }

//     // top & bottom
//     if (
//       baseEdge.t >= targetEdge.b - threshold &&
//       baseEdge.t <= targetEdge.b + threshold
//     ) {
//       output.y = targetEdge.b + baseShape.h / 2;
//     }

//     // right & right
//     if (
//       baseEdge.r >= targetEdge.l - threshold &&
//       baseEdge.r <= targetEdge.l + threshold
//     ) {
//       output.x = targetEdge.l - baseShape.w / 2;
//     }

//     // right & left
//     if (
//       baseEdge.r >= targetEdge.r - threshold &&
//       baseEdge.r <= targetEdge.r + threshold
//     ) {
//       output.x = targetEdge.r - baseShape.w / 2;
//     }

//     // bottom & bottom
//     if (
//       baseEdge.b >= targetEdge.b - threshold &&
//       baseEdge.b <= targetEdge.b + threshold
//     ) {
//       output.y = targetEdge.b - baseShape.h / 2;
//     }

//     // bottom & top
//     if (
//       baseEdge.b >= targetEdge.t - threshold &&
//       baseEdge.b <= targetEdge.t + threshold
//     ) {
//       output.y = targetEdge.t - baseShape.h / 2;
//     }
//   }

//   return output;
// };

// TODO: wait for align feature
// const getAlignLines = (
//   targetShapes: (Terminal | Process | Data | Desicion)[],
//   base: {
//     m: CommonTypes.Vec;
//     l: number;
//     t: number;
//     r: number;
//     b: number;
//   }
// ) => {
//   if (targetShapes.length === 0) return [];
//   const lines: {
//     from: CommonTypes.Vec;
//     to: CommonTypes.Vec;
//   }[] = [];
//   const targets = targetShapes.map((targetShape) => ({
//     m: targetShape.getCenter().m,
//     l: targetShape.getEdge().l,
//     t: targetShape.getEdge().t,
//     r: targetShape.getEdge().r,
//     b: targetShape.getEdge().b,
//   }));

//   console.log("targets", targets);

//   // center x & center x
//   const align_center_x_shapes = targets
//     .filter(
//       (target) => Number(base.m.x.toFixed(1)) === Number(target.m.x.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.x - b.m.x);

//   if (
//     align_center_x_shapes[0] &&
//     align_center_x_shapes[align_center_x_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: base.m.x,
//         y: align_center_x_shapes[0].m.y,
//       },
//       to: {
//         x: base.m.x,
//         y: align_center_x_shapes[align_center_x_shapes.length - 1].m.y,
//       },
//     });
//   }

//   // center y & center y
//   const align_center_y_shapes = targets
//     .filter(
//       (target) => Number(base.m.y.toFixed(1)) === Number(target.m.y.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.y - b.m.y);

//   if (
//     align_center_y_shapes[0] &&
//     align_center_y_shapes[align_center_y_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_center_y_shapes[0].m.x,
//         y: base.m.y,
//       },
//       to: {
//         x: align_center_y_shapes[align_center_y_shapes.length - 1].m.x,
//         y: base.m.y,
//       },
//     });
//   }

//   // left & left
//   const align_left_shapes = targets
//     .filter(
//       (target) => Number(base.l.toFixed(1)) === Number(target.l.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.y - b.m.y);

//   if (align_left_shapes[0] && align_left_shapes[align_left_shapes.length - 1]) {
//     lines.push({
//       from: {
//         x: base.l - 1,
//         y: align_left_shapes[0].m.y,
//       },
//       to: {
//         x: base.l - 1,
//         y: align_left_shapes[align_left_shapes.length - 1].m.y,
//       },
//     });
//   }

//   // left & right
//   const align_left_to_right_shapes = targets
//     .filter((target) => {
//       return Number(base.l.toFixed(1)) === Number(target.r.toFixed(1));
//     })
//     .concat([base])
//     .sort((a, b) => a.m.y - b.m.y);

//   if (
//     align_left_to_right_shapes[0] &&
//     align_left_to_right_shapes[align_left_to_right_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: base.l - 1,
//         y: align_left_to_right_shapes[0].m.y,
//       },
//       to: {
//         x: base.l - 1,
//         y: align_left_to_right_shapes[align_left_to_right_shapes.length - 1].m
//           .y,
//       },
//     });
//   }

//   // top & top
//   const align_top_shapes = targets
//     .filter(
//       (target) => Number(base.t.toFixed(1)) === Number(target.t.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.x - b.m.x);

//   if (align_top_shapes[0] && align_top_shapes[align_top_shapes.length - 1]) {
//     lines.push({
//       from: {
//         x: align_top_shapes[0].m.x,
//         y: base.t - 1,
//       },
//       to: {
//         x: align_top_shapes[align_top_shapes.length - 1].m.x,
//         y: base.t - 1,
//       },
//     });
//   }

//   // top & bottom
//   const align_top_to_bottom_shapes = targets
//     .filter(
//       (target) => Number(base.t.toFixed(1)) === Number(target.b.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.x - b.m.x);

//   if (
//     align_top_to_bottom_shapes[0] &&
//     align_top_to_bottom_shapes[align_top_to_bottom_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_top_to_bottom_shapes[0].m.x,
//         y: base.t - 1,
//       },
//       to: {
//         x: align_top_to_bottom_shapes[align_top_to_bottom_shapes.length - 1].m
//           .x,
//         y: base.t - 1,
//       },
//     });
//   }

//   // right & right
//   const align_right_shapes = targets
//     .filter(
//       (target) => Number(base.r.toFixed(1)) === Number(target.r.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.y - b.m.y);

//   if (
//     align_right_shapes[0] &&
//     align_right_shapes[align_right_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: base.r + 1,
//         y: align_right_shapes[0].m.y,
//       },
//       to: {
//         x: base.r + 1,
//         y: align_right_shapes[align_right_shapes.length - 1].m.y,
//       },
//     });
//   }

//   // right & left
//   const align_right_to_left_shapes = targets
//     .filter(
//       (target) => Number(base.r.toFixed(1)) === Number(target.l.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.y - b.m.y);

//   if (
//     align_right_to_left_shapes[0] &&
//     align_right_to_left_shapes[align_right_to_left_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: base.r + 1,
//         y: align_right_to_left_shapes[0].m.y,
//       },
//       to: {
//         x: base.r + 1,
//         y: align_right_to_left_shapes[align_right_to_left_shapes.length - 1].m
//           .y,
//       },
//     });
//   }

//   // bottom & bottom
//   const align_bottom_shapes = targets
//     .filter(
//       (target) => Number(base.b.toFixed(1)) === Number(target.b.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.x - b.m.x);

//   if (
//     align_bottom_shapes[0] &&
//     align_bottom_shapes[align_bottom_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_bottom_shapes[0].m.x,
//         y: base.b + 1,
//       },
//       to: {
//         x: align_bottom_shapes[align_bottom_shapes.length - 1].m.x,
//         y: base.b + 1,
//       },
//     });
//   }

//   // bottom & top
//   const align_bottom_to_top_shapes = targets
//     .filter(
//       (target) => Number(base.b.toFixed(1)) === Number(target.t.toFixed(1))
//     )
//     .concat([base])
//     .sort((a, b) => a.m.x - b.m.x);

//   if (
//     align_bottom_to_top_shapes[0] &&
//     align_bottom_to_top_shapes[align_bottom_to_top_shapes.length - 1]
//   ) {
//     lines.push({
//       from: {
//         x: align_bottom_to_top_shapes[0].m.x,
//         y: base.b + 1,
//       },
//       to: {
//         x: align_bottom_to_top_shapes[align_bottom_to_top_shapes.length - 1].m
//           .x,
//         y: base.b + 1,
//       },
//     });
//   }

//   return lines;
// };

// TODO: wait for align feature
// const getShapesInView = (shapes: (Terminal | Process | Data | Desicion)[]) => {
//   const shapesInView: (Terminal | Process | Data | Desicion)[] = [];
//   const viewport = {
//     l: 0,
//     t: 0,
//     r: window.innerWidth,
//     b: window.innerHeight,
//   };

//   shapes.forEach((shape) => {
//     const edge = shape.getEdge();

//     if (
//       ((edge.l >= viewport.l && edge.l <= viewport.r) ||
//         (edge.r >= viewport.l && edge.r <= viewport.r)) &&
//       ((edge.t >= viewport.t && edge.t <= viewport.b) ||
//         (edge.b >= viewport.t && edge.b <= viewport.b))
//     ) {
//       shapesInView.push(shape);
//     }
//   });

//   return shapesInView;
// };

const frameSelect = (
  selectionFrame: null | undefined | SelectionFrame,
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  if (!selectionFrame) return [];
  // define which shape in select area
  const shapesInSelectingArea = (() => {
    const shapesInArea: CommonTypes.Shapes = [];

    const normalSelectAreaP = {
      start: getNormalP(selectionFrame.p.start, offset, scale),
      end: getNormalP(selectionFrame.p.end, offset, scale),
    };

    shapes.forEach((shape) => {
      if (!normalSelectAreaP) return;
      const theEdge = shape.getEdge();

      const l =
          normalSelectAreaP.start.x < normalSelectAreaP.end.x
            ? normalSelectAreaP.start.x
            : normalSelectAreaP.end.x,
        t =
          normalSelectAreaP.start.y < normalSelectAreaP.end.y
            ? normalSelectAreaP.start.y
            : normalSelectAreaP.end.y,
        r =
          normalSelectAreaP.start.x > normalSelectAreaP.end.x
            ? normalSelectAreaP.start.x
            : normalSelectAreaP.end.x,
        b =
          normalSelectAreaP.start.y > normalSelectAreaP.end.y
            ? normalSelectAreaP.start.y
            : normalSelectAreaP.end.y;

      const x1 = Math.max(theEdge.l, l),
        y1 = Math.max(theEdge.t, t),
        x2 = Math.min(theEdge.r, r),
        y2 = Math.min(theEdge.b, b);

      if (x2 > x1 && y2 > y1) {
        shapesInArea.push(shape);
      }
    });

    return shapesInArea;
  })();

  selection = new Selection(`selectionArea_${uuidv4()}`, shapesInSelectingArea);
};

const getCurve = (
  id: string,
  d: CommonTypes.Direction,
  w: number,
  h: number,
  p: CommonTypes.Vec,
  threshold: {
    l: number;
    t: number;
    r: number;
    b: number;
  } = {
    l: 0,
    t: 0,
    r: 0,
    b: 0,
  }
) => {
  let p1: CommonTypes.Vec = { x: 0, y: 0 };
  let p2: CommonTypes.Vec = { x: 0, y: 0 };
  let cp1: CommonTypes.Vec = { x: 0, y: 0 };
  let cp2: CommonTypes.Vec = { x: 0, y: 0 };

  const arrow_h = 12;
  const distance = Selection.__sendingPoint__.distance;

  switch (d) {
    case CommonTypes.Direction.l:
      p1 = {
        x: p.x - w / 2 + threshold.l,
        y: p.y,
      };
      p2 = {
        x: p.x - w / 2 - distance + arrow_h,
        y: p.y,
      };
      cp1 = p1;
      cp2 = {
        x: (p1.x + p2.x) / 2,
        y: p.y,
      };
      break;

    case CommonTypes.Direction.t:
      p1 = {
        x: p.x,
        y: p.y - h / 2 + threshold.t,
      };
      p2 = {
        x: p1.x,
        y: p1.y - distance + arrow_h,
      };
      cp1 = p1;
      cp2 = {
        x: p.x,
        y: (p1.y + p2.y) / 2,
      };
      break;

    case CommonTypes.Direction.r:
      p1 = {
        x: p.x + w / 2 + threshold.r,
        y: p.y,
      };
      p2 = {
        x: p1.x + distance - arrow_h,
        y: p1.y,
      };
      cp1 = p1;
      cp2 = {
        x: (p1.x + p2.x) / 2,
        y: p.y,
      };
      break;

    case CommonTypes.Direction.b:
      p1 = {
        x: p.x,
        y: p.y + h / 2 + threshold.b,
      };
      p2 = {
        x: p1.x,
        y: p1.y + distance - arrow_h,
      };
      cp1 = p1;
      cp2 = {
        x: p.x,
        y: (p1.y + p2.y) / 2,
      };
      break;
  }

  return new Curve(id, p1, cp1, cp2, p2);
};

const getCurveStickingCp1Cp2 = (
  fromD: CommonTypes.Direction,
  toD: CommonTypes.Direction,
  curve: Curve,
  p1: CommonTypes.Vec,
  p2: CommonTypes.Vec
) => {
  if (!fromD || !toD || !p1 || !p2) return [null, null];

  const distance = {
    x: Math.abs(p1.x - p2.x),
    y: Math.abs(p1.y - p2.y),
  };
  const margin = {
    x: distance.x / 2,
    y: distance.y / 2,
  };
  const min = curve.arrowAttr.h;

  if (fromD === CommonTypes.Direction.l && toD === CommonTypes.Direction.l) {
    return [
      {
        x: p1.x - min * 2 - margin.y,
        y: p1.y,
      },
      {
        x: p2.x - min * 2 - margin.y,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.l && toD === CommonTypes.Direction.t) {
    return [
      {
        x: p1.x - min * 2 - margin.x,
        y: p1.y,
      },
      {
        x: p2.x,
        y: p2.y - min * 2 - margin.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.l && toD === CommonTypes.Direction.r) {
    return [
      {
        x: p1.x - min * 2 - margin.x,
        y: p1.y,
      },
      {
        x: p2.x + min * 2 + margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.l && toD === CommonTypes.Direction.b) {
    return [
      {
        x: p1.x - min * 2 - margin.x,
        y: p1.y,
      },
      {
        x: p2.x,
        y: p2.y + min * 2 + margin.y,
      },
    ];
  }

  if (fromD === CommonTypes.Direction.t && toD === CommonTypes.Direction.l) {
    return [
      {
        x: p1.x,
        y: p1.y - min - margin.y,
      },
      {
        x: p2.x - min - margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.t && toD === CommonTypes.Direction.t) {
    return [
      {
        x: p1.x,
        y: p1.y - min * 2 - margin.x,
      },
      {
        x: p2.x,
        y: p2.y - min * 2 - margin.x,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.t && toD === CommonTypes.Direction.r) {
    return [
      {
        x: p1.x,
        y: p1.y - min - margin.y,
      },
      {
        x: p2.x + min + margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.t && toD === CommonTypes.Direction.b) {
    return [
      {
        x: p1.x,
        y: p1.y - min * 2 - margin.y,
      },
      {
        x: p2.x,
        y: p2.y + min * 2 + margin.y,
      },
    ];
  }

  if (fromD === CommonTypes.Direction.r && toD === CommonTypes.Direction.l) {
    return [
      {
        x: p1.x + min * 2 + margin.x,
        y: p1.y,
      },
      {
        x: p2.x - min * 2 - margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.r && toD === CommonTypes.Direction.t) {
    return [
      {
        x: p1.x + min * 2 + margin.x,
        y: p1.y,
      },
      {
        x: p2.x,
        y: p2.y - min * 2 - margin.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.r && toD === CommonTypes.Direction.r) {
    return [
      {
        x: p1.x + min * 2 + margin.y,
        y: p1.y,
      },
      {
        x: p2.x + min * 2 + margin.y,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.r && toD === CommonTypes.Direction.b) {
    return [
      {
        x: p1.x + min * 2 + margin.x,
        y: p1.y,
      },
      {
        x: p2.x,
        y: p2.y + min * 2 + margin.y,
      },
    ];
  }

  if (fromD === CommonTypes.Direction.b && toD === CommonTypes.Direction.l) {
    return [
      {
        x: p1.x,
        y: p1.y + min + margin.y,
      },
      {
        x: p2.x - min - margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.b && toD === CommonTypes.Direction.t) {
    return [
      {
        x: p1.x,
        y: p1.y + min * 2 + margin.y,
      },
      {
        x: p2.x,
        y: p2.y - min * 2 - margin.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.b && toD === CommonTypes.Direction.r) {
    return [
      {
        x: p1.x,
        y: p1.y + min + margin.y,
      },
      {
        x: p2.x + min + margin.x,
        y: p2.y,
      },
    ];
  }
  if (fromD === CommonTypes.Direction.b && toD === CommonTypes.Direction.b) {
    return [
      {
        x: p1.x,
        y: p1.y + min * 2 + margin.x,
      },
      {
        x: p2.x,
        y: p2.y + min * 2 + margin.x,
      },
    ];
  }

  return [null, null];
};

const movePressingCurve = (
  p: CommonTypes.Vec,
  pressingCurve: null | undefined | PageIdTypes.PressingCurve
) => {
  if (!pressingCurve) return true;
  actionRecords.register(CommonTypes.Action.disconnect);

  const [toD, p2] = (() => {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];

      if (shape.id === pressingCurve.from.shape.id) continue;

      const quarterD = shape.checkQuarterArea(p);
      if (quarterD) {
        const edgeM = shape.getCenter()[quarterD];
        const curveThreshold = curveThresholdStrategy[shape.type][quarterD];
        const threshold = {
          x:
            quarterD === CommonTypes.Direction.l ||
            quarterD === CommonTypes.Direction.r
              ? curveThreshold
              : 0,
          y:
            quarterD === CommonTypes.Direction.t ||
            quarterD === CommonTypes.Direction.b
              ? curveThreshold
              : 0,
        };

        return [
          quarterD,
          { x: edgeM.x + threshold.x, y: edgeM.y + threshold.y },
        ];
      }
    }

    return [null, null];
  })();

  if (toD && p2) {
    //stick
    const p1 = pressingCurve?.shape.p1;
    const [cp1, cp2] = getCurveStickingCp1Cp2(
      pressingCurve?.from.d,
      toD,
      pressingCurve.shape,
      p1,
      p2
    );
    if (!p1 || !cp1 || !cp2 || !p2) return true;

    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.p2, p2);
  } else {
    // move
    const p2 = p;
    const cp1 = pressingCurve?.shape.p1;
    const cp2 = (() => {
      switch (pressingCurve.from.d) {
        case CommonTypes.Direction.l:
          return {
            x: (pressingCurve.shape.p2.x + pressingCurve.shape.p1.x) / 2,
            y: pressingCurve.from.shape.p.y,
          };

        case CommonTypes.Direction.t:
          return {
            x: pressingCurve.from.shape.p.x,
            y: (pressingCurve.shape.p2.y + pressingCurve.shape.p1.y) / 2,
          };

        case CommonTypes.Direction.r:
          return {
            x: (pressingCurve.shape.p2.x + pressingCurve.shape.p1.x) / 2,
            y: pressingCurve.from.shape.p.y,
          };

        case CommonTypes.Direction.b:
          return {
            x: pressingCurve.from.shape.p.x,
            y: (pressingCurve.shape.p2.y + pressingCurve.shape.p1.y) / 2,
          };
      }
    })();

    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
    pressingCurve.shape.locateHandler(CurveTypes.PressingTarget.p2, p2);
  }

  return false;
};

const defineSelectionFrameRange = (
  p: CommonTypes.Vec,
  isMovingViewport: boolean = false
) => {
  if (isMovingViewport || !selectionFrame) return true;
  selectionFrame?.drag(p);
  return false;
};

const getShapeIdMap = (shapes: CommonTypes.Shapes) => {
  const map: { [id: string]: boolean } = {};

  shapes.forEach((shape) => {
    map[shape.id] = true;
  });

  return map;
};

const syncCurvePosition = (shapes: CommonTypes.Shapes) => {
  const shapeIdMap = getShapeIdMap(shapes);

  curves.forEach((curve) => {
    const isSender = shapeIdMap[curve.from.shape.id];
    const isReciever = shapeIdMap[curve.to.shape.id];

    if (isSender) {
      moveSenderCurve(
        curve.from.d,
        curve.to.d,
        curve.shape,
        curve.from.shape.id
      );
    }
    if (isReciever) {
      moveRecieverCurve(
        curve.from.d,
        curve.to.d,
        curve.shape,
        curve.to.shape.id
      );
    }
  });
};

const recordLastP = (p: CommonTypes.Vec) => {
  lastP = p;
};

const moveSenderCurve = (
  fromD: CommonTypes.Direction,
  toD: CommonTypes.Direction,
  curve: null | undefined | Curve,
  senderId: null | undefined | string
) => {
  const sender = shapes.find((shape) => shape.id === senderId);

  if (!sender || !curve) return;

  const edgeM = sender.getCenter()[fromD];
  const curveThreshold = curveThresholdStrategy[sender.type][fromD];
  const threshold = {
    x:
      fromD === CommonTypes.Direction.l || fromD === CommonTypes.Direction.r
        ? curveThreshold
        : 0,
    y:
      fromD === CommonTypes.Direction.t || fromD === CommonTypes.Direction.b
        ? curveThreshold
        : 0,
  };
  const p1 = {
    x: edgeM.x + threshold.x,
    y: edgeM.y + threshold.y,
  };
  const p2 = curve.p2;
  const [cp1, cp2] = getCurveStickingCp1Cp2(fromD, toD, curve, p1, p2);

  if (!p1 || !p2 || !cp1 || !cp2) return;

  curve.locateHandler(CurveTypes.PressingTarget.p1, p1);
  curve.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
  curve.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
};

const moveRecieverCurve = (
  fromD: CommonTypes.Direction,
  toD: CommonTypes.Direction,
  curve: null | undefined | Curve,
  recieverId: null | undefined | string
) => {
  const reciever = shapes.find((shape) => shape.id === recieverId);

  if (!reciever || !curve) return;

  const p1 = curve.p1;
  const edgeM = reciever.getCenter()[toD];
  const curveThreshold = curveThresholdStrategy[reciever.type][toD];
  const threshold = {
    x:
      toD === CommonTypes.Direction.l || toD === CommonTypes.Direction.r
        ? curveThreshold
        : 0,
    y:
      toD === CommonTypes.Direction.t || toD === CommonTypes.Direction.b
        ? curveThreshold
        : 0,
  };
  const p2 = {
    x: edgeM.x + threshold.x,
    y: edgeM.y + threshold.y,
  };
  const [cp1, cp2] = getCurveStickingCp1Cp2(fromD, toD, curve, p1, p2);

  if (!p1 || !p2 || !cp1 || !cp2) return;

  curve.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
  curve.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
  curve.locateHandler(CurveTypes.PressingTarget.p2, p2);
};

const startMovingViewport = (isPressingSpace: boolean, p: CommonTypes.Vec) => {
  if (!isPressingSpace) return true;

  lastP = p;
  return false;
};

const triggerCurve = (
  p: CommonTypes.Vec,
  selection: null | undefined | Selection
) => {
  if (!selection) return true;
  const triggerPoint = selection.checkBoundry(p, 0);

  if (
    triggerPoint !== SelectionTypes.PressingTarget.sl &&
    triggerPoint !== SelectionTypes.PressingTarget.st &&
    triggerPoint !== SelectionTypes.PressingTarget.sr &&
    triggerPoint !== SelectionTypes.PressingTarget.sb
  )
    return true;

  const targetShape = selection.shapes[0];
  const triggerDStrategy = {
    [SelectionTypes.PressingTarget.sl]: CommonTypes.Direction.l,
    [SelectionTypes.PressingTarget.st]: CommonTypes.Direction.t,
    [SelectionTypes.PressingTarget.sr]: CommonTypes.Direction.r,
    [SelectionTypes.PressingTarget.sb]: CommonTypes.Direction.b,
  };
  const triggerD = triggerDStrategy[triggerPoint];

  pressingCurve = {
    from: {
      shape: targetShape,
      origin: cloneDeep(targetShape),
      d: triggerD,
    },
    to: null,
    shape: getCurve(
      `curve_${uuidv4()}`,
      triggerD,
      targetShape.w,
      targetShape.h,
      targetShape.p,
      curveThresholdStrategy[targetShape.type]
    ),
  };

  pressingCurve.shape.selecting = true;
  return false;
};

const pressSelection = (
  p: CommonTypes.Vec,
  selection: null | undefined | Selection
) => {
  if (!selection) return true;

  const _target = selection.checkBoundry(p, 0);

  if (
    _target !== SelectionTypes.PressingTarget.lt &&
    _target !== SelectionTypes.PressingTarget.rt &&
    _target !== SelectionTypes.PressingTarget.rb &&
    _target !== SelectionTypes.PressingTarget.lb &&
    _target !== SelectionTypes.PressingTarget.m
  )
    return true;

  pressingSelection = {
    selection: selection,
    ghost: cloneDeep(selection),
    target: _target,
  };

  return false;
};

const selectShape = (p: CommonTypes.Vec) => {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (!shape.checkBoundry(p)) continue;
    deSelectCurve();

    selection = new Selection(`selectionArea_${uuidv4()}`, [shape]);

    pressingSelection = {
      selection: selection,
      ghost: cloneDeep(selection),
      target: SelectionTypes.PressingTarget.m,
    };

    return false;
  }

  return true;
};

const startFrameSelecting = (p: CommonTypes.Vec) => {
  deSelect();
  selectionFrame = new SelectionFrame(`selectionFrame_${uuidv4()}`, {
    start: p,
    end: p,
  });

  return false;
};

const selectCurve = (p: CommonTypes.Vec) => {
  for (let i = curves.length - 1; i > -1; i--) {
    const curve = curves[i];

    if (curve.shape.selecting && curve.shape.checkControlPointsBoundry(p)) {
      deSelectShape();
      pressingCurve = {
        from: {
          shape: curve.from.shape,
          origin: cloneDeep(curve.from.shape),
          d: curve.from.d,
        },
        to: {
          shape: curve.to.shape,
          origin: cloneDeep(curve.to.shape),
          d: curve.to.d,
        },
        shape: curve.shape,
      };

      return false;
    }

    if (curve.shape.checkBoundry(p)) {
      deSelectShape();
      curve.shape.selecting = true;
      return false;
    }
  }

  return true;
};

const deSelectShape = () => {
  selection = null;
};

const deSelectCurve = () => {
  curves.forEach((curve) => {
    curve.shape.selecting = false;
  });
};

const deSelect = () => {
  deSelectShape();
  deSelectCurve();
};

const moveViewport = (p: CommonTypes.Vec, isPressingSpace: boolean) => {
  if (!isPressingSpace) return true;
  lastP = p;
  return false;
};

const moveShapes = (
  offsetP: CommonTypes.Vec,
  pressingSelection: null | undefined | PageIdTypes.PressingSelection
) => {
  if (
    !pressingSelection?.selection ||
    pressingSelection?.target !== SelectionTypes.PressingTarget.m
  )
    return true;
  actionRecords.register(CommonTypes.Action.move);

  pressingSelection.selection.move(offsetP);
  syncCurvePosition(shapes);

  return false;
};

const resizeShapes = (
  offsetP: CommonTypes.Vec,
  pressingSelection: null | undefined | PageIdTypes.PressingSelection
) => {
  if (
    !pressingSelection?.selection ||
    (pressingSelection?.target !== SelectionTypes.PressingTarget.lt &&
      pressingSelection?.target !== SelectionTypes.PressingTarget.rt &&
      pressingSelection?.target !== SelectionTypes.PressingTarget.lb &&
      pressingSelection?.target !== SelectionTypes.PressingTarget.rb)
  )
    return true;

  actionRecords.register(CommonTypes.Action.resize);

  pressingSelection.selection.resize(pressingSelection.target, offsetP);
  syncCurvePosition(shapes);

  return false;
};

const connect = (
  curve: Curve,
  from: {
    shape: Terminal | Process | Data | Desicion;
    d: CommonTypes.Direction;
  },
  to: {
    shape: Terminal | Process | Data | Desicion;
    d: CommonTypes.Direction;
  }
) => {
  const curveI = curves.findIndex(
    (currentCurve) => currentCurve.shape.id === curve.id
  );

  if (curveI > -1) {
    curves[curveI] = {
      shape: curve,
      from: {
        shape: from.shape,
        d: from.d,
      },
      to: {
        shape: to.shape,
        d: to.d,
      },
    };
  } else {
    curves.push({
      shape: curve,
      from: {
        shape: from.shape,
        d: from.d,
      },
      to: {
        shape: to.shape,
        d: to.d,
      },
    });
  }
};

const checkConnect = (p: CommonTypes.Vec) => {
  if (!pressingCurve) return;
  let to: {
    d: null | CommonTypes.Direction;
    shape: null | Terminal | Process | Data | Desicion;
  } = {
    d: null,
    shape: null,
  };

  shapes.forEach((shape) => {
    const connectedD =
      shape.checkReceivingPointsBoundry(p) || shape.checkQuarterArea(p);

    if (!connectedD) return;
    to.d = connectedD;
    to.shape = shape;
  });

  if (!to.d && !to.shape) {
    disconnect(
      curves.findIndex((curve) => curve.shape.id === pressingCurve?.shape.id)
    );
    actionRecords.finish(CommonTypes.Action.disconnect);
    return;
  }

  if (
    to.d &&
    to.shape &&
    !(to.d === pressingCurve.to?.d && to.shape === pressingCurve.to?.shape)
  ) {
    actionRecords.register(CommonTypes.Action.connect);
    pressingCurve.shape.selecting = false;

    connect(
      pressingCurve.shape,
      {
        shape: pressingCurve.from.shape,
        d: pressingCurve.from.d,
      },
      {
        shape: to.shape,
        d: to.d,
      }
    );

    actionRecords.finish(CommonTypes.Action.connect);
  }

  actionRecords.interrupt(CommonTypes.Action.disconnect);
};

const disconnect = (curveI: number) => {
  if (curveI < 0) return;
  curves.splice(curveI, 1);
};

const drawShapes = (
  ctx: null | CanvasRenderingContext2D,
  shapes: (Terminal | Process | Data | Desicion | Curve)[],
  offset?: CommonTypes.Vec,
  scale?: number
) => {
  if (!ctx) return;

  shapes.forEach((shape) => {
    if (!ctx) return;
    shape.draw(ctx, offset, scale);
  });

  // pressing?.ghost?.draw(ctx); // TODO: for testing align
};

const drawAlignLines = (
  ctx: null | CanvasRenderingContext2D,
  alginLines: { from: CommonTypes.Vec; to: CommonTypes.Vec }[],
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  if (!ctx || alginLines.length === 0) return;

  alginLines.forEach((alginLine) => {
    const fromP = getScreenP(alginLine.from, offset, scale);
    const toP = getScreenP(alginLine.to, offset, scale);
    ctx.save();
    ctx.strokeStyle = tailwindColors.auxiliary;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(fromP.x, fromP.y);
    ctx.lineTo(toP.x, toP.y);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  });
};

const draw = (
  $canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  shapes: (Terminal | Process | Data | Desicion)[],
  offset?: CommonTypes.Vec,
  scale?: number,
  isScreenshot?: boolean
) => {
  if (!isBrowser) return;
  $canvas.width = window.innerWidth;
  $canvas.height = window.innerHeight;
  ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // draw background
  ctx?.beginPath();
  ctx.fillStyle = "#F6F7FA";
  ctx?.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ctx?.closePath();

  drawShapes(ctx, shapes, offset, scale);
  drawShapes(
    ctx,
    curves.map((curve) => curve.shape),
    offset,
    scale
  );
  drawAlignLines(ctx, alginLines, offset, scale);

  // TODO: wait for matching backend features
  // if (!isScreenshot) {
  //   // draw sending point
  //   shapes.forEach((shape) => {
  //     if (!ctx || !shape.selecting) return;
  //     if (
  //       shape instanceof Terminal ||
  //       shape instanceof Process ||
  //       shape instanceof Data ||
  //       (shape instanceof Desicion && !(shape.getText().y && shape.getText().n))
  //     ) {
  //       shape.drawSendingPoint(ctx, offset, scale);
  //     }
  //   });
  // }

  if (!pressingCurve?.to) {
    pressingCurve?.shape.draw(ctx, offset, scale);
  }

  if (!isScreenshot) {
    // draw selectArea
    if (!!selectionFrame) {
      selectionFrame.draw(ctx);
    }
    if (!!selection) {
      selection.draw(ctx, offset, scale);
      // pressingSelection?.ghost?.draw(ctx, offset, scale);
    }
  }
};

const drawCanvas = (offset?: CommonTypes.Vec, scale?: number) => {
  const $canvas = document.querySelector("canvas");
  if (!$canvas || !ctx) return;
  draw($canvas, ctx, shapes, offset, scale, false);
};

const drawScreenshot = (offset?: CommonTypes.Vec, scale?: number) => {
  const $screenshot: HTMLCanvasElement | null = document.querySelector(
    "canvas[role='screenshot']"
  );
  if (!$screenshot || !ctx_screenshot) return;
  draw(
    $screenshot,
    ctx_screenshot,
    getScreenshotShapes(shapes),
    offset,
    scale,
    true
  );
};

const undo = (
  ctx: undefined | null | CanvasRenderingContext2D,
  offset?: CommonTypes.Vec,
  scale?: number
) => {
  if (!ctx || !shapes) return;

  const action = actions.peek();
  if (!action) return;
  shapes = action?.shapes;
  curves = action?.curves;
  if (selection) {
    const selectingMap = selection.getSelectingMap();
    selection = new Selection(
      selection.id,
      shapes.filter((shape) => selectingMap[shape.id])
    );
  }

  actions.pop();

  drawCanvas(offset, scale);
  drawScreenshot(offset, scale);
};

const syncCandidates = (shapes: CommonTypes.Shapes) => {
  if (!candidates) return;
  // sync with candidates when checking
  shapes.forEach((shape) => {
    const candidate = candidates?.find(
      (candidate) => candidate.id === shape.id
    );
    if (!candidate) return;
    candidate.p = shape.p;
    candidate.w = shape.w;
    candidate.h = shape.h;
  });
};

export default function IdPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);
  let { current: $screenshot } = useRef<HTMLCanvasElement | null>(null);

  const [space, setSpace] = useState(false);
  const [control, setControl] = useState(false);
  const [scale, setScale] = useState(1);
  const [leftMouseBtn, setLeftMouseBtn] = useState(false);
  const [isOverAllSidePanelOpen, setIsOverAllSidePanelOpen] = useState(false);
  const [isIndivisualSidePanelOpen, setIsIndivisualSidePanelOpen] =
    useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [steps, setSteps] = useState<CommonTypes.Steps>([]);
  const [datas, setDatas] = useState<PageIdTypes.Datas>([]);
  const [projectName, setProjectName] = useState({
    inputVal: "Untitled",
    val: "Untitled",
  });
  const [isEditingIndivisual, setIsEditingIndivisual] = useState(false);
  const [indivisual, setIndivisual] = useState<
    null | Terminal | Process | Data | Desicion
  >(null);
  const [createImportDatas, setCreateImportDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addImportDatas, setAddImportDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);
  const [createUsingDatas, setCreateUsingDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addUsingDatas, setAddUsingDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);
  const [createDeleteDatas, setCreateDeleteDatas] =
    useState<IndivisaulSidePanelTypes.CreateDatas>([]);
  const [addDeleteDatas, setAddDeleteDatas] =
    useState<IndivisaulSidePanelTypes.AddDatas>([]);
  const [consoles, setConsoles] = useState<any>([]);
  const [isCheckingData, setIsCheckingData] = useState(false);

  const movingViewport = useMemo(
    () => space && leftMouseBtn,
    [space, leftMouseBtn]
  );

  const checkSteps = () => {
    setSteps(cloneDeep(shapes));
  };

  const updateShapes = (
    newShapes: CommonTypes.Shapes
  ) => {
    shapes = newShapes;
    checkSteps();
    setIndivisual(shapes.find((shape) => indivisual?.id === shape.id) || null);
    drawCanvas(offset, scale);
    drawScreenshot(offset, scale);
  };

  const updateCurves = (newCurves: CommonTypes.ConnectionCurves) => {
    curves = newCurves;
  };

  const zoom = (
    delta: number,
    client: {
      x: number;
      y: number;
    }
  ) => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    const scaleAmount = -delta / 500;
    const _scale = scale * (1 + scaleAmount);
    setScale(_scale);

    // --- get offset value
    // zoom the page based on where the cursor is
    const distX = client.x / $canvas.width;
    const distY = client.y / $canvas.height;

    // calculate how much we need to zoom
    const unitsZoomedX = ($canvas.width / _scale) * scaleAmount;
    const unitsZoomedY = ($canvas.height / _scale) * scaleAmount;
    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offset.x -= unitsAddLeft;
    offset.y -= unitsAddTop;

    drawCanvas(offset, _scale);
  };

  const positioning = (shapeP: CommonTypes.Vec) => {
    if (!isBrowser) return;

    offset = {
      x: window.innerWidth / 2 / scale - shapeP.x,
      y: window.innerHeight / 2 / scale - shapeP.y,
    };

    drawCanvas(offset, scale);
  };

  const terminateDataChecking = () => {
    worker?.terminate();
    candidates = null;
    setIsCheckingData(false);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setLeftMouseBtn(true);

    const p = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    const normalP = getNormalP(p, offset, scale);

    handleUtils.handle([
      () => startMovingViewport(space, p),
      () => pressSelection(normalP, selection),
      () => triggerCurve(normalP, selection),
      () => selectCurve(normalP),
      () => selectShape(normalP),
      () => startFrameSelecting(p),
    ]);

    syncCandidates(shapes);
    drawCanvas(offset, scale);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
      offsetP = {
        x: p.x - lastP.x,
        y: p.y - lastP.y,
      },
      normalP = getNormalP(p, offset, scale),
      normalOffsetP = getNormalP(offsetP, null, scale);

    if (movingViewport) {
      offset.x += normalOffsetP.x;
      offset.y += normalOffsetP.y;
    }

    handleUtils.handle([
      () => moveViewport(p, space),
      () => moveShapes(normalOffsetP, pressingSelection),
      () => resizeShapes(normalOffsetP, pressingSelection),
      () => defineSelectionFrameRange(p),
      () => movePressingCurve(normalP, pressingCurve),
    ]);

    recordLastP(p);

    // TODO: align feature
    // if (!movingViewport && pressing?.shape && !!selectionFrame) {
    //   if (pressing?.target === CommonTypes.SelectAreaTarget.m) {
    //     actionRecords.register(CommonTypes.Action.multiMove);

    //     const shapesInView = getShapesInView(shapes);
    //     const targetAlignShapes = shapesInView.filter(
    //       (shapeInView) => shapeInView.id !== pressing?.shape?.id
    //     );
    //     const alignP = getAlignP(targetAlignShapes, pressing.ghost);

    //     if (alignP?.x || alignP?.y) {
    //       // pressing.shape.locate(alignP);
    //       // locateMultiSelectingShapes(alignP);
    //     }

    //     if (alignP?.x && !alignP?.y) {
    //       const moveP = getNormalP(
    //         {
    //           x: 0,
    //           y: p.y - lastP.y,
    //         },
    //         null,
    //         scale
    //       );
    //     }

    //     // if (!alignP?.x && alignP?.y) {
    //     //   const moveP = getNormalP(
    //     //     {
    //     //       x: p.x - lastP.x,
    //     //       y: 0,
    //     //     },
    //     //     null,
    //     //     scale
    //     //   )
    //     //   pressing.shape.move(
    //     //     getNormalP(
    //     //       moveP,
    //     //       null,
    //     //       scale
    //     //     )
    //     //   );
    //     // }

    //     // if (!alignP?.x && !alignP?.y) {
    //     //   if (pressing.ghost && pressing.shape.p.x !== pressing.ghost?.p.x) {
    //     //     pressing.shape.locate({
    //     //       x: pressing.ghost.getCenter().m.x,
    //     //       y: null,
    //     //     });
    //     //   }

    //     //   if (pressing.ghost && pressing.shape.p.y !== pressing.ghost?.p.y) {
    //     //     pressing.shape.locate({
    //     //       x: null,
    //     //       y: pressing.ghost.getCenter().m.y,
    //     //     });
    //     //   }
    //     //   pressing.shape.move(
    //     //     getNormalP(
    //     //       {
    //     //         x: p.x - lastP.x,
    //     //         y: p.y - lastP.y,
    //     //       },
    //     //       null,
    //     //       scale
    //     //     )
    //     //   );
    //     // }

    //     // pressing.ghost?.move(
    //     //   getNormalP(
    //     //     {
    //     //       x: 0,
    //     //       // x: p.x - lastP.x,
    //     //       y: p.y - lastP.y,
    //     //       // y: 0,
    //     //     },
    //     //     null,
    //     //     scale
    //     //   )
    //     // );

    //     // console.log("alignP", alignP);
    //   }
    //   // else if (
    //   //   pressing?.target === CommonTypes.SelectAreaTarget.lt ||
    //   //   pressing?.target === CommonTypes.SelectAreaTarget.rt ||
    //   //   pressing?.target === CommonTypes.SelectAreaTarget.rb ||
    //   //   pressing?.target === CommonTypes.SelectAreaTarget.lb
    //   // ) {
    //   //   actionRecords.register(CommonTypes.Action.multiResize);
    //   //   // resizeMultiSelectingShapes(pressing?.target, offsetP, scale);
    //   // }

    //   // // const multiSelectingMap = getMultSelectingMap();

    //   // shapes.forEach((shape) => {
    //   //   // if (!multiSelectingMap[shape.id]) return;
    //   //   moveCurve(shape);
    //   // });
    // }

    // if (
    //   !movingViewport &&
    //   pressing?.shape &&
    //   multiSelectShapeIds.length === 0
    // ) {
    //   if (pressing?.target === CoreTypes.PressingTarget.m) {
    //     actionRecords.register(CommonTypes.Action.move);

    //     const shapesInView = getShapesInView(shapes);
    //     const targetAlignShapes = shapesInView.filter(
    //       (shapeInView) => shapeInView.id !== pressing?.shape?.id
    //     );
    //     alginLines = getAlignLines(targetAlignShapes, {
    //       m: pressing.shape.getCenter().m,
    //       l: pressing.shape.getEdge().l,
    //       t: pressing.shape.getEdge().t,
    //       r: pressing.shape.getEdge().r,
    //       b: pressing.shape.getEdge().b,
    //     });

    //     const alignP = getAlignP(targetAlignShapes, pressing.ghost);

    //     if (alignP?.x || alignP?.y) {
    //       pressing.shape.locate(alignP);
    //     }

    //     if (alignP?.x && !alignP?.y) {
    //       pressing.shape.move(
    //         getNormalP(
    //           {
    //             x: 0,
    //             y: p.y - lastP.y,
    //           },
    //           null,
    //           scale
    //         )
    //       );
    //     }

    //     if (!alignP?.x && alignP?.y) {
    //       pressing.shape.move(
    //         getNormalP(
    //           {
    //             x: p.x - lastP.x,
    //             y: 0,
    //           },
    //           null,
    //           scale
    //         )
    //       );
    //     }

    //     if (!alignP?.x && !alignP?.y) {
    //       if (pressing.ghost && pressing.shape.p.x !== pressing.ghost?.p.x) {
    //         pressing.shape.locate({
    //           x: pressing.ghost.getCenter().m.x,
    //           y: null,
    //         });
    //       }

    //       if (pressing.ghost && pressing.shape.p.y !== pressing.ghost?.p.y) {
    //         pressing.shape.locate({
    //           x: null,
    //           y: pressing.ghost.getCenter().m.y,
    //         });
    //       }
    //       pressing.shape.move(
    //         getNormalP(
    //           {
    //             x: p.x - lastP.x,
    //             y: p.y - lastP.y,
    //           },
    //           null,
    //           scale
    //         )
    //       );
    //     }

    //     pressing.ghost?.move(
    //       getNormalP(
    //         {
    //           x: p.x - lastP.x,
    //           y: p.y - lastP.y,
    //         },
    //         null,
    //         scale
    //       )
    //     );

    //     syncCandidates(pressing?.shape);
    //     moveCurve(pressing?.shape);
    //   }

    //   if (
    //     pressing?.target === CoreTypes.PressingTarget.lt ||
    //     pressing?.target === CoreTypes.PressingTarget.rt ||
    //     pressing?.target === CoreTypes.PressingTarget.rb ||
    //     pressing?.target === CoreTypes.PressingTarget.lb
    //   ) {
    //     actionRecords.register(CommonTypes.Action.resize);
    //     resizeShape(
    //       shapes,
    //       {
    //         shape: pressing.shape,
    //         ghost: pressing.ghost,
    //         target: pressing.target,
    //       },
    //       getNormalP(offsetP, null, scale)
    //     );

    //     syncCandidates(pressing?.shape);
    //   }
    // }

    syncCandidates(shapes);
    drawCanvas(offset, scale);
    drawScreenshot(offset, scale);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const p = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

    setLeftMouseBtn(false);
    frameSelect(selectionFrame, offset, scale);
    checkConnect(getNormalP(p, offset, scale));
    checkSteps();
    syncCandidates(shapes);

    if (actionRecords.peekKey() === CommonTypes.Action.move) {
      actionRecords.finish(CommonTypes.Action.move);
    }

    if (actionRecords.peekKey() === CommonTypes.Action.resize) {
      actionRecords.finish(CommonTypes.Action.resize);
    }

    selectionFrame = null;
    pressingSelection = null;
    pressingCurve = null;
    alginLines = [];

    drawCanvas(offset, scale);
  };

  const onMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  };

  const onDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const p = {
      x: e.nativeEvent.x,
      y: e.nativeEvent.y,
    };

    shapes.forEach((shape) => {
      if (!shape.checkBoundry(getNormalP(p, offset, scale))) return;
      setIsIndivisualSidePanelOpen(true);
      setIndivisual(shape);
    });

    const resetIndivisualSidePanel = () => {
      setIsEditingIndivisual(false);
      setCreateImportDatas([]);
      setAddImportDatas([]);
      setCreateUsingDatas([]);
      setAddUsingDatas([]);
      setCreateDeleteDatas([]);
      setAddDeleteDatas([]);
    };

    resetIndivisualSidePanel();
  };

  function handleKeyDown(this: Window, e: KeyboardEvent) {
    if (e.key === "Control") {
      setControl(true);
    }
    if (e.key === "z" && control) {
      undo(ctx, offset, scale);
    }
    if (e.key === " " && !space) {
      setSpace(true);
    } else if (e.key === "Backspace") {
      if (document.activeElement?.tagName === "INPUT") return;
      const $canvas = document.querySelector("canvas");
      if (!$canvas || !ctx) return;

      deleteSelectingShapes();
      drawCanvas(offset, scale);
      drawScreenshot(offset, scale);
      checkSteps();
    }
  }

  function handleKeyUp(this: Window, e: KeyboardEvent) {
    if (e.key === "Control") {
      setControl(false);
    }
    if (e.key === " " && space) {
      setSpace(false);
    }
  }

  const deleteSelectingShapes = () => {
    if (!selection) return true;

    const selectingMap = selection.getSelectingMap();

    curves = curves.filter(
      (curve) =>
        !selectingMap[curve.from.shape.id] && !selectingMap[curve.to.shape.id]
    );

    if (!!indivisual && selectingMap[indivisual?.id]) {
      setIndivisual(null);
    }

    shapes = shapes.filter((shape) => !selectingMap[shape.id]);
    deSelectShape();
  };

  const onClickCheckButton = () => {
    if (!!worker) {
      worker.terminate();
    }
    setIsCheckingData(true);
    // main.js
    worker = new Worker(
      new URL("@/workers/checkData/index.ts", import.meta.url),
      { type: "module" }
    );

    const sendChuncks = (
      shapes: (Terminal | Process | Data | Desicion)[],
      curves: CommonTypes.ConnectionCurves,
      worker: any
    ) => {
      const length = Math.max(shapes.length, curves.length);
      let index = 0;
      const chunkSize = 1;

      const sendNextChunk = () => {
        if (index < length) {
          const _shapes = shapes.slice(index, index + chunkSize);
          const _curves = curves.slice(index, index + chunkSize);
          worker.postMessage(
            JSON.stringify({ shapes: _shapes, curves: _curves, done: false })
          );
          index += chunkSize;
          setTimeout(sendNextChunk, 0);
        } else {
          worker.postMessage(
            JSON.stringify({ shapes: [], curves: [], done: true })
          );
        }
      };

      sendNextChunk();
    };

    sendChuncks(shapes, curves, worker);

    const newConsoles: any = [];
    let index = 0;
    const chunkSize = 1;

    worker.onmessage = (
      event: MessageEvent<{
        messageShapes: CheckDataTypes.MessageShapes;
        done: boolean;
        ms: string;
        log: string;
      }>
    ) => {
      if (event.data.ms && event.data.log) {
        console.log(`${event.data.ms}`, event.data.log);
      }
      if (!event.data.messageShapes) return;

      if (!candidates) {
        candidates = cloneDeep(shapes);
      }

      event.data.messageShapes.forEach((messageShape, messageShapeI) => {
        if (!candidates) return;
        const chunckI = index + messageShapeI;
        candidates[chunckI].status = messageShape.status;
        messageShape.datas.forEach((data: any) => {
          if (!candidates) return;

          candidates[chunckI].usingDatas[data.i].status = data.status;

          if (!data.console) return;

          newConsoles.push({
            shape: messageShape,
            message: data.console.message,
            status: data.console.status,
          });
        });
      });

      if (event.data.done) {
        updateShapes(candidates);
        setConsoles(newConsoles);
        terminateDataChecking();
      }
      index += chunkSize;
    };

    worker.onerror = function (error) {
      console.error("Error in Worker:", error);
    };
  };

  useEffect(() => {
    if (!isBrowser) return;

    (async () => {
      drawCanvas(offset, scale);
      drawScreenshot(offset, scale);
    })();

    const resizeViewport = () => {
      const $canvas = document.querySelector("canvas");
      const $screenshot: HTMLCanvasElement | null = document.querySelector(
        "canvas[role='screenshot']"
      );
      if (!isBrowser || !$canvas || !$screenshot) return;
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      $screenshot.width = window.innerWidth;
      $screenshot.height = window.innerHeight;
      drawCanvas(offset, scale);
      drawScreenshot(offset, scale);
    };

    window.addEventListener("resize", resizeViewport);
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    });

    return () => {
      if (!isBrowser) return;
      window.removeEventListener("resize", resizeViewport);
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      if (!isBrowser) return;
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [space, steps, control, indivisual]);

  return (
    <>
      <Button
        className="fixed top-4 left-1/2 -translate-x-1/2 flex justify-self-end self-center text-base"
        info
        onClick={onClickCheckButton}
        text={`Check${isCheckingData ? "ing" : ""}`}
        loading={isCheckingData}
      />

      <OverallSidePanel
        steps={steps}
        positioning={positioning}
        datas={datas}
        setDatas={setDatas}
        projectName={projectName}
        setProjectName={setProjectName}
        updateShapes={updateShapes}
        shapes={shapes}
        isOverAllSidePanelOpen={isOverAllSidePanelOpen}
        setIsOverAllSidePanelOpen={setIsOverAllSidePanelOpen}
      />

      <IndivisaulSidePanel
        projectName={projectName.val}
        setProjectName={setProjectName}
        shapes={shapes}
        curves={curves}
        datas={datas}
        setDatas={setDatas}
        isIndivisualSidePanelOpen={isIndivisualSidePanelOpen}
        setIsIndivisualSidePanelOpen={setIsIndivisualSidePanelOpen}
        indivisual={indivisual}
        setIndivisual={setIndivisual}
        isEditingIndivisual={isEditingIndivisual}
        setIsEditingIndivisual={setIsEditingIndivisual}
        createImportDatas={createImportDatas}
        setCreateImportDatas={setCreateImportDatas}
        addImportDatas={addImportDatas}
        setAddImportDatas={setAddImportDatas}
        createUsingDatas={createUsingDatas}
        setCreateUsingDatas={setCreateUsingDatas}
        addUsingDatas={addUsingDatas}
        setAddUsingDatas={setAddUsingDatas}
        createDeleteDatas={createDeleteDatas}
        setCreateDeleteDatas={setCreateDeleteDatas}
        addDeleteDatas={addDeleteDatas}
        setAddDeleteDatas={setAddDeleteDatas}
        draw={() => {
          drawCanvas(offset, scale);
        }}
        updateShapes={updateShapes}
        updateCurves={updateCurves}
        consoles={consoles}
        setConsoles={setConsoles}
        terminateDataChecking={terminateDataChecking}
        deSelect={deSelect}
      />

      <Console
        shapes={shapes}
        offset={offset}
        scale={scale}
        zoom={zoom}
        undo={() => {
          undo(ctx, offset, scale);
        }}
        isOverAllSidePanelOpen={isOverAllSidePanelOpen}
        isIndivisualSidePanelOpen={isIndivisualSidePanelOpen}
        setIsIndivisualSidePanelOpen={setIsIndivisualSidePanelOpen}
        isConsoleOpen={isConsoleOpen}
        setIsConsoleOpen={setIsConsoleOpen}
        actionRecords={actionRecords}
        reload={() => {
          checkSteps();
          drawCanvas(offset, scale);
          drawScreenshot(offset, scale);
        }}
        consoles={consoles}
        positioning={positioning}
        indivisual={indivisual}
        setIndivisual={setIndivisual}
        initShapeSize={init.shape.size}
      />

      <img id="screenshotImg" alt="Screenshot" style={{ display: "none" }} />
      <div className={"flex"}>
        <canvas
          role="canvas"
          className={`${space ? "cursor-grab" : ""} overflow-hidden`}
          tabIndex={1}
          ref={(el) => {
            $canvas = el;
            ctx = $canvas?.getContext("2d");
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onWheel={onMouseWheel}
          onDoubleClick={onDoubleClick}
        />
        <canvas
          role="screenshot"
          className={`invisible ${
            space ? "cursor-grab" : ""
          } overflow-hidden absolute left-0 top-0 z-[-1]`}
          tabIndex={1}
          ref={(el) => {
            $screenshot = el;
            ctx_screenshot = $screenshot?.getContext("2d");
          }}
        />
      </div>
    </>
  );
}
