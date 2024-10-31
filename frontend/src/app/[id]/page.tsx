// TODO: fix browser zoom and re calculate shape offset / multi multiSelect resize in scale
"use client";
import axios, { AxiosResponse } from "axios";
import { useParams, useRouter } from "next/navigation";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import Curve from "@/shapes/curve";
import Stack from "@/dataStructure/stack";
import DataFrame from "@/components/dataFrame";
import SidePanel from "@/components/sidePanel";
import Accordion from "@/components/accordion";
import Button from "@/components/button";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Alert from "@/components/alert";
import Card from "@/components/card";
import Frame from "@/components/frame";
import PencilSquareIcon from "@/assets/svg/pencil-square.svg";
import Icon from "@/components/icon";
import RoundButton from "@/components/roundButton";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { ChangeEventHandler, MouseEventHandler } from "react";
import { tailwindColors } from "@/variables/colors";
import * as statusConstants from "@/constants/stauts";
import * as handleUtils from "@/utils/handle";
import * as authAPIs from "@/apis/auth";
import * as projectAPIs from "@/apis/project";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/common";
import * as PageTypes from "@/types/app/page";
import * as DataFrameTypes from "@/types/components/dataFrame";
import * as InputTypes from "@/types/components/input";
import * as AlertTypes from "@/types/components/alert";
import * as IconTypes from "@/types/components/icon";
import * as AuthTypes from "@/types/apis/auth";
import * as ProjectAPITypes from "@/types/apis/project";
import * as ProjectTypes from "@/types/project";
import * as APICommonTypes from "@/types/apis/common";
import * as PageIdTypes from "@/types/app/pageId";

axios.defaults.baseURL = process.env.BASE_URL || "http://localhost:5000/api";

const isBrowser = typeof window !== "undefined";

const init = {
  dataFrameWarning: {
    title: "",
    data: {},
  },
  shape: {
    size: {
      t: { w: 150, h: 75 },
      p: { w: 150, h: 75 },
      d: { w: 150, h: 75 },
      dec: { w: 100, h: 100 },
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
  multiSelect: {
    start: {
      x: -1,
      y: -1,
    },
    end: {
      x: -1,
      y: -1,
    },
    shapes: [],
  },
};

let ctx: CanvasRenderingContext2D | null | undefined = null,
  ctx_screenshot: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  curves: PageIdTypes.Curves = [],
  // connections: {
  //   senders: {
  //     [
  //       shapeId: `${string}_l` | `${string}_t` | `${string}_r` | `${string}_b`
  //     ]: { curveId: string; toD: CommonTypes.Direction }[];
  //   };
  //   recievers: {
  //     [
  //       shapeId: `${string}_l` | `${string}_t` | `${string}_r` | `${string}_b`
  //     ]: { curveId: string; fromD: CommonTypes.Direction }[];
  //   };
  // } = {
  //   senders: {},
  //   recievers: {},
  // },
  tests: any[] = [], // TODO: should be deleted
  pressing: PageIdTypes.Pressing = null,
  pressingCurve: PageIdTypes.PressingCurve = null,
  offset: CommonTypes.Vec = cloneDeep(init.offset),
  lastP: CommonTypes.Vec = { x: 0, y: 0 },
  selectionFrameP: null | {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
  } = null,
  multiSelect: PageIdTypes.MultiSelect = cloneDeep(init.multiSelect),
  selectAnchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  },
  alginLines: { from: CommonTypes.Vec; to: CommonTypes.Vec }[] = [],
  actions: PageIdTypes.Actions = new Stack();

const ds = [
  CommonTypes.Direction.l,
  CommonTypes.Direction.t,
  CommonTypes.Direction.r,
  CommonTypes.Direction.b,
];

const getFramePosition = (
  shape: Core,
  offset: CommonTypes.Vec,
  scale: number
) => {
  const frameOffset = 12;
  return {
    x: shape.getP(offset, scale).x + shape.getScaleSize().w / 2 + frameOffset,
    y: shape.getP(offset, scale).y,
  };
};

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

const getInitializedShape = (
  type: CommonTypes.Type,
  offset: CommonTypes.Vec,
  scale: number = 1
) => {
  switch (type) {
    case CommonTypes.Type["terminator"]:
      return new Terminal(
        `${type}_${Date.now()}`,
        init.shape.size.t.w,
        init.shape.size.t.h,
        {
          x: -offset.x + window.innerWidth / 2,
          y: -offset.y + window.innerHeight / 2,
        },
        type
      );
    case CommonTypes.Type["process"]:
      return new Process(
        `${type}_${Date.now()}`,
        init.shape.size.p.w,
        init.shape.size.p.h,
        {
          x: -offset.x + window.innerWidth / 2 / scale,
          y: -offset.y + window.innerHeight / 2 / scale,
        },
        type
      );

    case CommonTypes.Type["data"]:
      return new Data(
        `${type}_${Date.now()}`,
        init.shape.size.d.w,
        init.shape.size.d.h,
        {
          x: -offset.x + window.innerWidth / 2,
          y: -offset.y + window.innerHeight / 2,
        },
        type
      );

    case CommonTypes.Type["decision"]:
      return new Desicion(
        `${type}_${Date.now()}`,
        init.shape.size.dec.w,
        init.shape.size.dec.h,
        {
          x: -offset.x + window.innerWidth / 2,
          y: -offset.y + window.innerHeight / 2,
        },
        type
      );
  }
};

const getInitializedShapes = (
  orders: ProjectAPITypes.ProjectData["orders"],
  shapes: ProjectAPITypes.ProjectData["shapes"],
  curves: ProjectAPITypes.ProjectData["curves"],
  data: ProjectAPITypes.ProjectData["data"]
) => {
  const shapeMappings: {
    [shapeId: string]: Terminal | Process | Data | Desicion;
  } = {};

  const dataShapes = Object.entries(shapes);

  dataShapes.forEach(([id, info]) => {
    switch (info.type) {
      case CommonTypes.Type.terminator:
        const newTerminator = new Terminal(
          id,
          info.w,
          info.h,
          info.p,
          info.title
        );

        info.selectedData.forEach((dataId) => {
          newTerminator.selectedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newTerminator.deletedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        shapeMappings[id] = newTerminator;

        break;
      case CommonTypes.Type.data:
        const newData = new Data(id, info.w, info.h, info.p, info.title);

        info.data.forEach((dataId) => {
          newData.data.push({
            id: dataId,
            text: data[dataId],
          });
        });

        info.selectedData.forEach((dataId) => {
          newData.selectedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newData.deletedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        shapeMappings[id] = newData;

        break;
      case CommonTypes.Type.process:
        const newProcess = new Process(id, info.w, info.h, info.p, info.title);

        info.selectedData.forEach((dataId) => {
          newProcess.selectedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newProcess.deletedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        shapeMappings[id] = newProcess;

        break;
      case CommonTypes.Type.decision:
        const newDesicion = new Desicion(
          id,
          info.w,
          info.h,
          info.p,
          info.title
        );

        if (info.text) {
          newDesicion.text = info.text;
        }

        info.selectedData.forEach((dataId) => {
          newDesicion.selectedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newDesicion.deletedData.push({
            id: dataId,
            text: data[dataId],
          });
        });

        shapeMappings[id] = newDesicion;

        break;
    }
  });

  dataShapes.forEach(([shapeId, shapeInfo]) => {
    ds.forEach((d) => {
      if (shapeInfo.curves[d].length === 0) return;
      shapeInfo.curves[d].forEach((curveId) => {
        const curveInfo = curves[curveId];

        // shapeMappings[shapeId].createCurve(
        //   curveId,
        //   d,
        //   curveInfo.p1,
        //   curveInfo.p2,
        //   curveInfo.cp1,
        //   curveInfo.cp2,
        //   curveInfo.sendTo
        //     ? {
        //         shape: shapeMappings[curveInfo.sendTo.id],
        //         d: curveInfo.sendTo.d,
        //         bridgeId: curveId,
        //       }
        //     : null
        // );

        // if (curveInfo.sendTo) {
        //   // initialize received shape
        //   shapeMappings[curveInfo.sendTo.id].receiveFrom[
        //     curveInfo.sendTo.d
        //   ].push({
        //     shape: shapeMappings[shapeId],
        //     d: d,
        //     bridgeId: curveId,
        //   });
        // }
      });
    });
  });

  return orders.map((orderId) => shapeMappings[orderId]);
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

const getAlignVertixP = (
  shapes: (Terminal | Process | Data | Desicion)[],
  baseVertex?: CommonTypes.Vec
) => {
  let output: { x: null | number; y: null | number } = { x: null, y: null };
  if (!baseVertex || shapes.length === 0) return output;

  for (let i = 0; i < shapes.length; i++) {
    const targetShape = shapes[i];
    const targetCenter = targetShape.getCenter().m;
    const targetEdge = targetShape.getEdge();
    const threshold = 10;

    // align center
    // x
    if (
      baseVertex.x >= targetCenter.x - threshold &&
      baseVertex.x <= targetCenter.x + threshold
    ) {
      output.x = targetCenter.x;
    }

    // y
    if (
      baseVertex.y >= targetCenter.y - threshold &&
      baseVertex.y <= targetCenter.y + threshold
    ) {
      output.y = targetCenter.y;
    }

    // align left
    if (
      baseVertex.x >= targetEdge.l - threshold &&
      baseVertex.x <= targetEdge.l + threshold
    ) {
      output.x = targetEdge.l;
    }

    // align right
    if (
      baseVertex.x >= targetEdge.r - threshold &&
      baseVertex.x <= targetEdge.r + threshold
    ) {
      output.x = targetEdge.r;
    }

    // align top
    if (
      baseVertex.y >= targetEdge.t - threshold &&
      baseVertex.y <= targetEdge.t + threshold
    ) {
      output.y = targetEdge.t;
    }

    // align bottom
    if (
      baseVertex.y >= targetEdge.b - threshold &&
      baseVertex.y <= targetEdge.b + threshold
    ) {
      output.y = targetEdge.b;
    }
  }

  return output;
};

const getVertexAlignLines = (
  shapes: (Terminal | Process | Data | Desicion)[],
  baseVertex?: CommonTypes.Vec
) => {
  if (!baseVertex || shapes.length === 0) return [];
  const lines: {
    from: CommonTypes.Vec;
    to: CommonTypes.Vec;
  }[] = [];

  // align center
  const vertexes_m = shapes
    .map((targetShape) => targetShape.getCenter().m)
    .concat(baseVertex);

  // y
  const align_center_y_vertexes = vertexes_m
    .filter(
      (vertex) =>
        Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
    )
    .sort((a, b) => a.x - b.x);

  if (
    align_center_y_vertexes.length >= 2 &&
    align_center_y_vertexes[0] &&
    align_center_y_vertexes[align_center_y_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_center_y_vertexes[0].x || baseVertex.x,
        y: baseVertex.y,
      },
      to: {
        x:
          align_center_y_vertexes[align_center_y_vertexes.length - 1].x ||
          baseVertex.x,
        y: baseVertex.y,
      },
    });
  }

  // x
  const align_center_x_vertexes = vertexes_m
    .filter(
      (vertex) =>
        Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
    )
    .sort((a, b) => a.y - b.y);

  if (
    align_center_x_vertexes.length >= 2 &&
    align_center_x_vertexes[0] &&
    align_center_x_vertexes[align_center_x_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseVertex.x,
        y: align_center_x_vertexes[0].y || baseVertex.y,
      },
      to: {
        x: baseVertex.x,
        y:
          align_center_x_vertexes[align_center_x_vertexes.length - 1].y ||
          baseVertex.y,
      },
    });
  }

  // align left
  const vertexes_l = shapes
    .map((targetShape) => targetShape.getCenter().l)
    .concat(baseVertex);

  const align_l_vertexes = vertexes_l
    .filter(
      (vertex) =>
        Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
    )
    .sort((a, b) => a.y - b.y);

  if (
    align_l_vertexes.length >= 2 &&
    align_l_vertexes[0] &&
    align_l_vertexes[align_l_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseVertex.x,
        y: align_l_vertexes[0].y || baseVertex.y,
      },
      to: {
        x: baseVertex.x,
        y: align_l_vertexes[align_l_vertexes.length - 1].y || baseVertex.y,
      },
    });
  }

  // align right
  const vertexes_r = shapes
    .map((targetShape) => targetShape.getCenter().r)
    .concat(baseVertex);

  const align_r_vertexes = vertexes_r
    .filter(
      (vertex) =>
        Number(baseVertex.x.toFixed(1)) === Number(vertex.x.toFixed(1))
    )
    .sort((a, b) => a.y - b.y);

  if (
    align_r_vertexes.length >= 2 &&
    align_r_vertexes[0] &&
    align_r_vertexes[align_r_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseVertex.x,
        y: align_r_vertexes[0].y || baseVertex.y,
      },
      to: {
        x: baseVertex.x,
        y: align_r_vertexes[align_r_vertexes.length - 1].y || baseVertex.y,
      },
    });
  }

  // align top
  const vertexes_t = shapes
    .map((targetShape) => targetShape.getCenter().t)
    .concat(baseVertex);

  const align_t_vertexes = vertexes_t
    .filter(
      (vertex) =>
        Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
    )
    .sort((a, b) => a.x - b.x);

  if (
    align_t_vertexes.length >= 2 &&
    align_t_vertexes[0] &&
    align_t_vertexes[align_t_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_t_vertexes[0].x || baseVertex.x,
        y: baseVertex.y,
      },
      to: {
        x: align_t_vertexes[align_t_vertexes.length - 1].x || baseVertex.x,
        y: baseVertex.y,
      },
    });
  }

  // align bottom
  const vertexes_b = shapes
    .map((targetShape) => targetShape.getCenter().b)
    .concat(baseVertex);

  const align_b_vertexes = vertexes_b
    .filter(
      (vertex) =>
        Number(baseVertex.y.toFixed(1)) === Number(vertex.y.toFixed(1))
    )
    .sort((a, b) => a.x - b.x);

  if (
    align_b_vertexes.length >= 2 &&
    align_b_vertexes[0] &&
    align_b_vertexes[align_b_vertexes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_b_vertexes[0].x || baseVertex.x,
        y: baseVertex.y,
      },
      to: {
        x: align_b_vertexes[align_b_vertexes.length - 1].x || baseVertex.x,
        y: baseVertex.y,
      },
    });
  }

  return lines;
};

const getAlignP = (
  shapes: (Terminal | Process | Data | Desicion)[],
  baseShape?: null | Terminal | Process | Data | Desicion
) => {
  let output: { x: null | number; y: null | number } = { x: null, y: null };
  if (!baseShape || shapes.length === 0) return output;

  for (let i = 0; i < shapes.length; i++) {
    const targetShape = shapes[i];
    if (targetShape.id === baseShape.id) continue;

    const targetEdge = targetShape.getEdge();
    const targetCenter = targetShape.getCenter().m;
    const baseEdge = baseShape.getEdge();
    const baseCenter = baseShape.getCenter().m;
    const threshold = 10;

    // center x & center x
    if (
      baseCenter.x >= targetCenter.x - threshold &&
      baseCenter.x <= targetCenter.x + threshold
    ) {
      output.x = targetCenter.x;
    }

    // center y & center y
    if (
      baseCenter.y >= targetCenter.y - threshold &&
      baseCenter.y <= targetCenter.y + threshold
    ) {
      output.y = targetCenter.y;
    }

    // left & left
    if (
      baseEdge.l >= targetEdge.l - threshold &&
      baseEdge.l <= targetEdge.l + threshold
    ) {
      output.x = targetEdge.l + baseShape.w / 2;
    }

    // left & right
    if (
      baseEdge.l >= targetEdge.r - threshold &&
      baseEdge.l <= targetEdge.r + threshold
    ) {
      output.x = targetEdge.r + baseShape.w / 2;
    }

    // top & top
    if (
      baseEdge.t >= targetEdge.t - threshold &&
      baseEdge.t <= targetEdge.t + threshold
    ) {
      output.y = targetEdge.t + baseShape.h / 2;
    }

    // top & bottom
    if (
      baseEdge.t >= targetEdge.b - threshold &&
      baseEdge.t <= targetEdge.b + threshold
    ) {
      output.y = targetEdge.b + baseShape.h / 2;
    }

    // right & right
    if (
      baseEdge.r >= targetEdge.l - threshold &&
      baseEdge.r <= targetEdge.l + threshold
    ) {
      output.x = targetEdge.l - baseShape.w / 2;
    }

    // right & left
    if (
      baseEdge.r >= targetEdge.r - threshold &&
      baseEdge.r <= targetEdge.r + threshold
    ) {
      output.x = targetEdge.r - baseShape.w / 2;
    }

    // bottom & bottom
    if (
      baseEdge.b >= targetEdge.b - threshold &&
      baseEdge.b <= targetEdge.b + threshold
    ) {
      output.y = targetEdge.b - baseShape.h / 2;
    }

    // bottom & top
    if (
      baseEdge.b >= targetEdge.t - threshold &&
      baseEdge.b <= targetEdge.t + threshold
    ) {
      output.y = targetEdge.t - baseShape.h / 2;
    }
  }

  return output;
};

const getAlignLines = (
  shapes: (Terminal | Process | Data | Desicion)[],
  baseShape?: null | Terminal | Process | Data | Desicion
) => {
  if (!baseShape || shapes.length === 0) return [];
  const lines: {
    from: CommonTypes.Vec;
    to: CommonTypes.Vec;
  }[] = [];

  const baseCenter = baseShape.getCenter().m;

  // center x & center x
  const align_center_x_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseCenter.x.toFixed(1)) ===
          Number(targetShape.getCenter().m.x.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.x - b.p.x);

  if (
    align_center_x_shapes[0] &&
    align_center_x_shapes[align_center_x_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseCenter.x,
        y: align_center_x_shapes[0].getCenter().m.y,
      },
      to: {
        x: baseCenter.x,
        y: align_center_x_shapes[align_center_x_shapes.length - 1].getCenter().m
          .y,
      },
    });
  }

  // center y & center y
  const align_center_y_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseCenter.y.toFixed(1)) ===
          Number(targetShape.getCenter().m.y.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.y - b.p.y);

  if (
    align_center_y_shapes[0] &&
    align_center_y_shapes[align_center_y_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_center_y_shapes[0].getCenter().m.x,
        y: baseCenter.y,
      },
      to: {
        x: align_center_y_shapes[align_center_y_shapes.length - 1].getCenter().m
          .x,
        y: baseCenter.y,
      },
    });
  }

  const baseEdge = baseShape.getEdge();

  // left & left
  const align_left_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.l.toFixed(1)) ===
          Number(targetShape.getEdge().l.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.y - b.p.y);

  if (align_left_shapes[0] && align_left_shapes[align_left_shapes.length - 1]) {
    lines.push({
      from: {
        x: baseEdge.l - 1,
        y: align_left_shapes[0].getCenter().m.y,
      },
      to: {
        x: baseEdge.l - 1,
        y: align_left_shapes[align_left_shapes.length - 1].getCenter().m.y,
      },
    });
  }

  // left & right
  const align_left_to_right_shapes = shapes
    .filter((targetShape) => {
      return (
        Number(baseEdge.l.toFixed(1)) ===
          Number(targetShape.getEdge().r.toFixed(1)) ||
        targetShape.id === baseShape.id
      );
    })
    .sort((a, b) => a.p.y - b.p.y);

  if (
    align_left_to_right_shapes[0] &&
    align_left_to_right_shapes[align_left_to_right_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseEdge.l - 1,
        y: align_left_to_right_shapes[0].getCenter().m.y,
      },
      to: {
        x: baseEdge.l - 1,
        y: align_left_to_right_shapes[
          align_left_to_right_shapes.length - 1
        ].getCenter().m.y,
      },
    });
  }

  // top & top
  const align_top_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.t.toFixed(1)) ===
          Number(targetShape.getEdge().t.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.x - b.p.x);

  if (align_top_shapes[0] && align_top_shapes[align_top_shapes.length - 1]) {
    lines.push({
      from: {
        x: align_top_shapes[0].getCenter().m.x,
        y: baseEdge.t - 1,
      },
      to: {
        x: align_top_shapes[align_top_shapes.length - 1].getCenter().m.x,
        y: baseEdge.t - 1,
      },
    });
  }

  // top & bottom
  const align_top_to_bottom_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.t.toFixed(1)) ===
          Number(targetShape.getEdge().b.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.x - b.p.x);

  if (
    align_top_to_bottom_shapes[0] &&
    align_top_to_bottom_shapes[align_top_to_bottom_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_top_to_bottom_shapes[0].getCenter().m.x,
        y: baseEdge.t - 1,
      },
      to: {
        x: align_top_to_bottom_shapes[
          align_top_to_bottom_shapes.length - 1
        ].getCenter().m.x,
        y: baseEdge.t - 1,
      },
    });
  }

  // right & right
  const align_right_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.r.toFixed(1)) ===
          Number(targetShape.getEdge().r.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.y - b.p.y);

  if (
    align_right_shapes[0] &&
    align_right_shapes[align_right_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseEdge.r + 1,
        y: align_right_shapes[0].getCenter().m.y,
      },
      to: {
        x: baseEdge.r + 1,
        y: align_right_shapes[align_right_shapes.length - 1].getCenter().m.y,
      },
    });
  }

  // right & left
  const align_right_to_left_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.r.toFixed(1)) ===
          Number(targetShape.getEdge().l.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.y - b.p.y);

  if (
    align_right_to_left_shapes[0] &&
    align_right_to_left_shapes[align_right_to_left_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: baseEdge.r + 1,
        y: align_right_to_left_shapes[0].getCenter().m.y,
      },
      to: {
        x: baseEdge.r + 1,
        y: align_right_to_left_shapes[
          align_right_to_left_shapes.length - 1
        ].getCenter().m.y,
      },
    });
  }

  // bottom & bottom
  const align_bottom_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.b.toFixed(1)) ===
          Number(targetShape.getEdge().b.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.x - b.p.x);

  if (
    align_bottom_shapes[0] &&
    align_bottom_shapes[align_bottom_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_bottom_shapes[0].getCenter().m.x,
        y: baseEdge.b + 1,
      },
      to: {
        x: align_bottom_shapes[align_bottom_shapes.length - 1].getCenter().m.x,
        y: baseEdge.b + 1,
      },
    });
  }

  // bottom & top
  const align_bottom_to_top_shapes = shapes
    .filter(
      (targetShape) =>
        Number(baseEdge.b.toFixed(1)) ===
          Number(targetShape.getEdge().t.toFixed(1)) ||
        targetShape.id === baseShape.id
    )
    .sort((a, b) => a.p.x - b.p.x);

  if (
    align_bottom_to_top_shapes[0] &&
    align_bottom_to_top_shapes[align_bottom_to_top_shapes.length - 1]
  ) {
    lines.push({
      from: {
        x: align_bottom_to_top_shapes[0].getCenter().m.x,
        y: baseEdge.b + 1,
      },
      to: {
        x: align_bottom_to_top_shapes[
          align_bottom_to_top_shapes.length - 1
        ].getCenter().m.x,
        y: baseEdge.b + 1,
      },
    });
  }

  return lines;
};

const getShapesInView = (shapes: (Terminal | Process | Data | Desicion)[]) => {
  const shapesInView: (Terminal | Process | Data | Desicion)[] = [];
  const viewport = {
    l: 0,
    t: 0,
    r: window.innerWidth,
    b: window.innerHeight,
  };

  shapes.forEach((shape) => {
    const edge = shape.getEdge();

    if (
      ((edge.l >= viewport.l && edge.l <= viewport.r) ||
        (edge.r >= viewport.l && edge.r <= viewport.r)) &&
      ((edge.t >= viewport.t && edge.t <= viewport.b) ||
        (edge.b >= viewport.t && edge.b <= viewport.b))
    ) {
      shapesInView.push(shape);
    }
  });

  return shapesInView;
};

const frameSelect = (
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  // define which shape in select area
  const shapesInSelectingArea = (() => {
    const shapesInSelectArea: (Terminal | Data | Process | Desicion)[] = [];

    if (!selectionFrameP) return [];

    const normalSelectAreaP = {
      start: getNormalP(selectionFrameP.start, offset, scale),
      end: getNormalP(selectionFrameP.end, offset, scale),
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
        shapesInSelectArea.push(shape);
      }
    });

    return shapesInSelectArea;
  })();

  // define select status
  if (shapesInSelectingArea.length === 1) {
    shapesInSelectingArea[0].selecting = true;
  } else if (shapesInSelectingArea.length > 1) {
    multiSelect.shapes = shapesInSelectingArea;
  }
};

const pushAction = () => {
  actions.push({
    shapes: cloneDeep(shapes),
    curves: cloneDeep(curves),
  });
};

const getCurve = (
  id: string,
  d: CommonTypes.Direction,
  w: number,
  h: number,
  p: CommonTypes.Vec,
  distance: number
) => {
  let p1: CommonTypes.Vec = { x: 0, y: 0 };
  let p2: CommonTypes.Vec = { x: 0, y: 0 };
  let cp1: CommonTypes.Vec = { x: 0, y: 0 };
  let cp2: CommonTypes.Vec = { x: 0, y: 0 };

  const arrow_h = 12;

  switch (d) {
    case CommonTypes.Direction.l:
      p1 = {
        x: p.x - w / 2,
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
        y: p.y - h / 2,
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
        x: p.x + w / 2,
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
        y: p.y + h / 2,
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
  ctx: null | undefined | CanvasRenderingContext2D,
  pressingCurve: PageIdTypes.PressingCurve,
  p: CommonTypes.Vec,
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  if (!ctx || !pressingCurve) return;

  const [toD, p2] = (() => {
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];

      if (shape.id === pressingCurve.from.shape.id) continue;

      const quarterD = shape.checkQuarterArea(getNormalP(p, offset, scale));
      if (quarterD) {
        return [quarterD, shape.getCenter()[quarterD]];
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
    if (!p1 || !cp1 || !cp2 || !p2) return;

    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
    pressingCurve?.shape.locateHandler(CurveTypes.PressingTarget.p2, p2);
  } else {
    // move
    const p2 = getNormalP(p, offset, scale);
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
};

const moveSenderCurve = (
  fromD: CommonTypes.Direction,
  toD: CommonTypes.Direction,
  curve: null | undefined | Curve,
  sender: null | undefined | Terminal | Process | Data | Desicion
) => {
  if (!sender || !curve) return;

  const p1 = sender.getCenter()[fromD];
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
  reciever: null | undefined | Terminal | Process | Data | Desicion
) => {
  if (!reciever || !curve) return;

  const p1 = curve.p1;
  const p2 = reciever.getCenter()[toD];
  const [cp1, cp2] = getCurveStickingCp1Cp2(fromD, toD, curve, p1, p2);

  if (!p1 || !p2 || !cp1 || !cp2) return;

  curve.locateHandler(CurveTypes.PressingTarget.cp1, cp1);
  curve.locateHandler(CurveTypes.PressingTarget.cp2, cp2);
  curve.locateHandler(CurveTypes.PressingTarget.p2, p2);
};

const moveCurve = (
  shape: null | undefined | Terminal | Process | Desicion | Data
) => {
  if (!shape) return;
  for (let i = curves.length - 1; i > -1; i--) {
    const curve = curves[i];
    if (curve.from.shape.id === shape.id) {
      moveSenderCurve(curve.from.d, curve.to.d, curve.shape, curve.from.shape);
    }
    if (curve.to.shape.id === shape.id) {
      moveRecieverCurve(curve.from.d, curve.to.d, curve.shape, curve.to.shape);
    }
  }
};

const triggerCurve = (
  p: CommonTypes.Vec,
  offest: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 0
) => {
  const [triggerShape, curveTriggerD] = (() => {
    let triggerShape: null | Terminal | Process | Desicion | Data = null;
    let curveTriggerD: null | CommonTypes.Direction = null;

    for (let i = shapes.length - 1; i > -1; i--) {
      const shape = shapes[i];
      const triggerD = shape.getTriggerDirection(getNormalP(p, offest, scale));
      if (triggerD) {
        triggerShape = shape;
        curveTriggerD = triggerD;
        break;
      }
    }

    return [triggerShape, curveTriggerD];
  })();

  if (triggerShape && curveTriggerD) {
    triggerShape.selecting = false;

    pressingCurve = {
      from: {
        shape: triggerShape,
        origin: cloneDeep(triggerShape),
        d: curveTriggerD,
      },
      to: null,
      shape: getCurve(
        `curve_${Date.now()}`,
        curveTriggerD,
        triggerShape.w,
        triggerShape.h,
        triggerShape.p,
        triggerShape.curveTrigger.distance
      ),
    };

    pressingCurve.shape.selecting = true;
    return false;
  }

  return true;
};

const selectCurve = (
  p: CommonTypes.Vec,
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  for (let i = curves.length - 1; i > -1; i--) {
    const curve = curves[i];
    if (
      curve.shape.selecting &&
      curve.shape.checkControlPointsBoundry(getNormalP(p, offset, scale))
    ) {
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
    if (curve.shape.checkBoundry(getNormalP(p, offset, scale))) {
      curve.shape.selecting = true;
      return false;
    }
  }
  return true;
};

const deSelectCurve = () => {
  curves.forEach((curve) => {
    curve.shape.selecting = false;
  });

  return true;
};

const selectShape = (
  p: CommonTypes.Vec,
  offset: CommonTypes.Vec,
  scale: number
) => {
  const normalP = getNormalP(p, offset, scale);
  shapes.forEach((shape) => {
    const _ghost = cloneDeep(shape);
    _ghost.title = "ghost";
    const pressingVertex = shape.checkVertexesBoundry(normalP);
    if (pressingVertex) {
      pressing = {
        origin: cloneDeep(shape),
        shape: shape,
        ghost: _ghost,
        curveId: null,
        target: pressingVertex,
        direction: null,
      };
    } else if (shape.checkBoundry(normalP)) {
      pressing = {
        origin: cloneDeep(shape),
        shape: shape,
        ghost: _ghost,
        curveId: null,
        target: CoreTypes.PressingTarget.m,
        direction: null,
      };
    }
  });

  if (pressing?.shape) {
    pressing.shape.selecting = true;
    return false;
  }

  return true;
};

const deSelectShape = () => {
  shapes.forEach((shape) => {
    shape.selecting = false;
  });

  return true;
};

const getMultSelectingMaps = () => {
  const map: { [id: string]: true } = {};

  multiSelect.shapes.forEach((shape) => {
    map[shape.id] = true;
  });

  return map;
};

const deleteMultiSelectShapes = () => {
  if (multiSelect.shapes.length === 0) return true;

  const selectings = getMultSelectingMaps();

  curves = curves.filter(
    (curve) =>
      !selectings[curve.from.shape.id] && !selectings[curve.to.shape.id]
  );
  shapes = shapes.filter((shape) => !selectings[shape.id]);
  multiSelect = cloneDeep(init.multiSelect);
  return false;
};

const deleteSelectedShape = () => {
  const selectedShapeI = shapes.findIndex((shape) => shape.selecting);

  if (selectedShapeI === -1) return false;
  pushAction();

  curves = curves.filter(
    (curve) =>
      curve.from.shape.id !== shapes[selectedShapeI].id &&
      curve.to.shape.id !== shapes[selectedShapeI].id
  );

  shapes.splice(selectedShapeI, 1);

  // actions.push({
  //   type: CommonTypes.Action.delete,
  //   target: {
  //     shape: removedShape,
  //     i: selectedShapeI,
  //     curves: removedCurves,
  //   },
  // }); // TODO: temp close

  return false;
};

const moveMultiSelectingShapes = (offsetP: CommonTypes.Vec) => {
  if (multiSelect.shapes.length < 2) return;
  multiSelect.shapes.forEach((shape) => {
    shape.move(offsetP);
  });
};

const resizeMultiSelectingShapes = (
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
  if (!target || multiSelect.shapes.length < 2) return;
  const [multiSelectingAreaStartP, multiSelectingAreaEndP] =
    getMultiSelectingAreaP();
  const multiSelectingAreaP = {
    start: multiSelectingAreaStartP,
    end: multiSelectingAreaEndP,
  };
  const multiSelectingAreaSize = {
    w: Math.abs(multiSelectingAreaP.end.x - multiSelectingAreaP.start.x),
    h: Math.abs(multiSelectingAreaP.end.y - multiSelectingAreaP.start.y),
  };

  switch (target) {
    case CommonTypes.SelectAreaTarget.lt:
      {
        const canResize = {
          x: multiSelectingAreaSize.w - offsetP.x > 0 || offsetP.x < 0,
          y: multiSelectingAreaSize.h - offsetP.y > 0 || offsetP.y < 0,
        };

        multiSelect.shapes.forEach((shape) => {
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

        multiSelect.shapes.forEach((shape) => {
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

        multiSelect.shapes.forEach((shape) => {
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

        multiSelect.shapes.forEach((shape) => {
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
    pushAction();
    disconnect(
      curves.findIndex((curve) => curve.shape.id === pressingCurve?.shape.id)
    );

    // actions.push({
    //   type: CommonTypes.Action.disconnect,
    //   curve: _curve,
    // }); // temp close
  }

  if (
    to.d &&
    to.shape &&
    to.d !== pressingCurve.to?.d &&
    to.shape !== pressingCurve.to?.shape
  ) {
    pushAction();
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
    // actions.push({
    //   type: CommonTypes.Action.connect,
    // }); // temp close
  }
};

const disconnect = (curveI: number) => {
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

const getMultiSelectingAreaP = () => {
  const startP = { x: -1, y: -1 };
  const endP = { x: -1, y: -1 };

  multiSelect.shapes.forEach((shape) => {
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
};

const drawMultiSelectedShapesArea = (
  ctx: undefined | null | CanvasRenderingContext2D,
  offset: CommonTypes.Vec = { x: 0, y: 0 },
  scale: number = 1
) => {
  if (!ctx || multiSelect.shapes.length < 2) return;

  const [startP, endP] = getMultiSelectingAreaP();

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
  ctx.lineWidth = selectAnchor.size.stroke;

  ctx?.beginPath();
  ctx.arc(
    screenStartP.x,
    screenStartP.y,
    selectAnchor.size.fill,
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
    selectAnchor.size.fill,
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
    selectAnchor.size.fill,
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
    selectAnchor.size.fill,
    0,
    2 * Math.PI,
    false
  ); // left, bottom
  ctx.stroke();
  ctx.fill();
  ctx?.closePath();
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

  tests.forEach((test) => {
    test.draw(ctx);
  });

  drawShapes(ctx, shapes, offset, scale);
  drawShapes(
    ctx,
    curves.map((curve) => curve.shape),
    offset,
    scale
  );
  drawAlignLines(ctx, alginLines, offset, scale);

  if (!isScreenshot) {
    // draw sending point
    shapes.forEach((shape) => {
      if (!ctx || !shape.selecting) return;
      if (
        shape instanceof Terminal ||
        shape instanceof Process ||
        shape instanceof Data ||
        (shape instanceof Desicion && !(shape.getText().y && shape.getText().n))
      ) {
        shape.drawSendingPoint(ctx, offset, scale);
      }
    });
  }

  // draw curves in shapes
  // shapes.forEach((shape) => {
  //   if (!ctx) return;

  //   shape.drawCurve(ctx);
  // });
  if (!pressingCurve?.to) {
    pressingCurve?.shape.draw(ctx, offset, scale);
  }

  // shapes.forEach((shape) => {
  //   console.log('shape', shape)
  //   if(!ctx) return
  //   shape.drawRecievingPoint(ctx, offset, scale)
  // })

  if (!isScreenshot) {
    // draw selectArea
    if (selectionFrameP) {
      ctx?.beginPath();

      ctx.fillStyle = "#2436b155";
      ctx.fillRect(
        selectionFrameP?.start.x,
        selectionFrameP?.start.y,
        selectionFrameP?.end.x - selectionFrameP?.start.x,
        selectionFrameP?.end.y - selectionFrameP?.start.y
      );

      ctx.strokeStyle = "#2436b1";
      ctx.strokeRect(
        selectionFrameP?.start.x,
        selectionFrameP?.start.y,
        selectionFrameP?.end.x - selectionFrameP?.start.x,
        selectionFrameP?.end.y - selectionFrameP?.start.y
      );

      ctx?.closePath();
    }
  }

  if (!isScreenshot) {
    drawMultiSelectedShapesArea(ctx, offset, scale);
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

const resizeShape = (
  shapes: null | undefined | (Terminal | Process | Data | Desicion)[],
  pressing: {
    shape: null | undefined | Terminal | Process | Data | Desicion;
    ghost: null | undefined | Terminal | Process | Data | Desicion;
    target:
      | null
      | undefined
      | CoreTypes.PressingTarget.lt
      | CoreTypes.PressingTarget.rt
      | CoreTypes.PressingTarget.rb
      | CoreTypes.PressingTarget.lb;
  },
  offsetP: CommonTypes.Vec
) => {
  if (!shapes || !pressing.shape || !pressing.ghost || !pressing.target) return;

  const shapesInView = getShapesInView(
    shapes.filter((shape) => shape.id !== pressing?.shape?.id)
  );

  const directions = (() => {
    switch (pressing.target) {
      case CoreTypes.PressingTarget.lt:
        return [CommonTypes.Direction.l, CommonTypes.Direction.t];

      case CoreTypes.PressingTarget.rt:
        return [CommonTypes.Direction.r, CommonTypes.Direction.t];

      case CoreTypes.PressingTarget.rb:
        return [CommonTypes.Direction.r, CommonTypes.Direction.b];

      case CoreTypes.PressingTarget.lb:
        return [CommonTypes.Direction.l, CommonTypes.Direction.b];
    }
  })();

  if (!directions) return;

  const center = {
    shape: pressing.shape.getCenter(),
    ghost: pressing.ghost.getCenter(),
  };

  const alignLines_vertical = getVertexAlignLines(
    shapesInView,
    center.shape[directions[0]]
  );

  const alginLines_horizental = getVertexAlignLines(
    shapesInView,
    center.shape[directions[1]]
  );

  alginLines = alignLines_vertical.concat(alginLines_horizental);

  const alignVertixP = getAlignVertixP(
    shapesInView,
    center.ghost[pressing.target]
  );

  if (alignVertixP?.x && !alignVertixP?.y) {
    pressing.shape.resize(
      {
        x: alignVertixP.x - center.shape[pressing.target].x,
        y: offsetP.y,
      },
      pressing.target
    );
  }

  if (!alignVertixP?.x && alignVertixP?.y) {
    pressing.shape.resize(
      {
        x: offsetP.x,
        y: alignVertixP.y - center.shape[pressing.target].y,
      },
      pressing.target
    );
  }

  if (alignVertixP?.x && alignVertixP?.y) {
    pressing.shape.resize(
      {
        x: alignVertixP.x - center.shape[pressing.target].x,
        y: alignVertixP.y - center.shape[pressing.target].y,
      },
      pressing.target
    );
  }

  if (!alignVertixP?.x && !alignVertixP?.y) {
    if (pressing.shape.p.x !== pressing.ghost?.p.x) {
      pressing.shape.resize(
        {
          x: center.ghost[pressing.target].x - center.shape[pressing.target].x,
          y: 0,
        },
        pressing.target
      );
    }
    if (pressing.shape.p.y !== pressing.ghost?.p.y) {
      pressing.shape.resize(
        {
          x: 0,
          y: center.ghost[pressing.target].y - center.shape[pressing.target].y,
        },
        pressing.target
      );
    }
  }

  pressing.ghost.resize(offsetP, pressing.target);
  moveCurve(pressing?.shape);
};

const undo = (
  ctx: undefined | null | CanvasRenderingContext2D,
  offset?: CommonTypes.Vec,
  scale?: number
) => {
  if (!ctx || !shapes) return;

  // TODO: temp close
  const action = actions.peek();
  if (!action) return;
  shapes = action?.shapes;
  curves = action?.curves;

  // switch (action?.type) {
  //   case CommonTypes.Action.add:
  //     shapes.pop();
  //     break;

  //   case CommonTypes.Action.delete:
  //     shapes.splice(action.target.i, 0, action.target.shape);
  //     for(let i =action.target.curves.length-1; i>-1; i--){
  //       curves.splice(action.target.curves[i].i, 0,action.target.curves[i].shape)
  //     }

  //     break;

  //   // case CommonTypes.Action.resize:
  //   case CommonTypes.Action.move: {
  //     const returnToOrigin = () => {
  //       action.target.move(action.displacement);
  //     };

  //     returnToOrigin();
  //     moveCurve(action.target);
  //     break;
  //   }

  //   case CommonTypes.Action.connect: {
  //     disconnect(curves.length - 1);
  //     // TODO: should check data
  //     break;
  //   }

  //   case CommonTypes.Action.disconnect: {
  //     connect(action.curve.shape, action.curve.from, action.curve.to);
  //     moveCurve(action.curve.to.shape);
  //     // TODO: should check data
  //     break;
  //   }
  // }

  actions.pop();

  drawCanvas(offset, scale);
  drawScreenshot(offset, scale);
};

// const Editor = (props: { className: string; shape: Core }) => {
//   const [title, setTitle] = useState<CommonTypes.Title>(""),
//     [selections, setSelections] = useState<DataFrameTypes.Selections>({}),
//     [data, setData] = useState<CommonTypes.Data>([]);

//   const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setTitle(e.currentTarget.value);
//   };

//   const onClickCheckedBox = (DataText: CommonTypes.DataItem["text"]) => {
//     const _selections: DataFrameTypes.Selections = cloneDeep(selections);

//     _selections[DataText] = !_selections[DataText];

//     setSelections(_selections);
//   };

//   const onClickPlus = () => {
//     const _data = cloneDeep(data);
//     _data.push({ id: uuidv4(), text: "" });
//     setData(_data);
//   };

//   const onClickMinus = (id: string) => {
//     const _data = cloneDeep(data).filter((datdItem) => datdItem.id !== id);
//     setData(_data);
//   };

//   const onChangeData = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
//     const _data = cloneDeep(data);
//     _data[i].text = e.currentTarget.value;
//     setData(_data);
//   };

//   const onClickConfirm = () => {
//     const selectedData = (() => {
//       const data: CommonTypes.Data = [];

//       props.shape.options.forEach((option) => {
//         if (selections[option.text]) {
//           data.push(option);
//         }
//       });

//       props.shape.redundancies.forEach((option) => {
//         if (selections[option.text]) {
//           data.push(option);
//         }
//       });

//       return data;
//     })();

//     // onConfirm(title, data, selectedData);
//   };

//   useEffect(() => {
//     setTitle(props.shape.title);

//     const _selections: DataFrameTypes.Selections = (() => {
//       const output: DataFrameTypes.Selections = {};

//       props.shape.options.forEach((option) => {
//         output[option.text] = false;
//       });

//       props.shape.selectedData.forEach((selectedDataItem) => {
//         output[selectedDataItem.text] = true;
//       });

//       return output;
//     })();

//     setSelections(_selections);

//     if (props.shape instanceof Data) {
//       setData(props.shape.data);
//     }
//   }, [props.shape]);

//   return (
//     <div className={props.className && props.className}>
//       <div>
//         {props.shape instanceof Data && (
//           <div>
//             <p className="mb-1">Data</p>
//             {/* <div
//               className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
//               onClick={onClickScalePlusIcon}
//             >
//               +
//             </div> */}
//             <ul className="ps-2">
//               {props.shape.data.map((dataItem) => (
//                 <li className="mb-1"> · {dataItem.text}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//         {(props.shape instanceof Process ||
//           props.shape instanceof Data ||
//           props.shape instanceof Desicion) && (
//           <>
//             <div>
//               <p className="mb-1">Data Usage</p>
//               <ul className="ps-2">
//                 {props.shape.options.map((option) => (
//                   <li className="mb-1">
//                     <span className="bg-indigo-100 text-indigo-500 w-4 h-4 rounded-full inline-flex items-center justify-center">
//                       {selections[option.text] && (
//                         <svg
//                           fill="none"
//                           stroke="currentColor"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="3"
//                           className="w-3 h-3"
//                           viewBox="0 0 24 24"
//                         >
//                           <path d="M20 6L9 17l-5-5"></path>
//                         </svg>
//                       )}
//                     </span>
//                     {option.text}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//             <div>
//               <div className="mb-1">Redundancies</div>
//               <ul className="ps-2">
//                 {props.shape.redundancies.map((redundancy) => (
//                   <li className="mb-1"> · {redundancy.text}</li>
//                 ))}
//               </ul>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }; TODO: open after content is added

export default function IdPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);
  let { current: $screenshot } = useRef<HTMLCanvasElement | null>(null);
  const qas = isBrowser && window.location.href.includes("qas");
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [dataFrame, setDataFrame] = useState<
    { p: CommonTypes.Vec } | undefined
  >(undefined);
  const [dbClickedShape, setDbClickedShape] = useState<
    Terminal | Data | Process | Desicion | null
  >(null);
  const [space, setSpace] = useState(false);
  const [control, setControl] = useState(false);
  const [scale, setScale] = useState(1);
  const [leftMouseBtn, setLeftMouseBtn] = useState(false);
  const [isDataSidePanelOpen, setIsDataSidePanelOpen] = useState(false);
  const [isRenameFrameOpen, setIsRenameFrameOpen] = useState(false);
  const [isProfileFrameOpen, setIsProfileFrameOpen] = useState(false);
  const [steps, setSteps] = useState<PageTypes.Steps>({});
  const [dataFrameWarning, setDataFrameWarning] =
    useState<DataFrameTypes.Warning>(init.dataFrameWarning);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [projects, setProjects] = useState<
    ProjectAPITypes.GetProjects["resData"]
  >([]);
  const [selectedProjectId, setSelectedProjectId] = useState<
    null | ProjectTypes.Project["id"]
  >(null);
  const [hasEnter, setHasEnter] = useState(false);
  const [projectName, setProjectName] = useState({
    inputVal: "Untitled",
    val: "Untitled",
  });

  const checkData = (shapes: (Terminal | Process | Data | Desicion)[]) => {
    const dataShapes: Data[] = [];

    shapes.forEach((shape) => {
      shape.options = [];
      if (shape instanceof Data) {
        dataShapes.push(shape);
      }
    });

    dataShapes.forEach((dataShape) => {
      // traversal all relational steps
      const queue: (Core | Terminal | Process | Data | Desicion)[] = [
          dataShape,
        ],
        locks: { [curveId: string]: boolean } = {}, // prevent from graph cycle
        deletedDataMap: { [text: string]: boolean } = {};

      // while (queue.length !== 0) {
      //   const shape = queue[0];

      //   ds.forEach((d) => {
      //     shape.curves[d].forEach((curve) => {
      //       const theSendToShape = curve.sendTo?.shape;

      //       if (!theSendToShape) return;

      //       dataShape.data.forEach((dataItem) => {
      //         if (
      //           theSendToShape.options.some(
      //             (option) => option.text === dataItem.text
      //           ) ||
      //           deletedDataMap[dataItem.text]
      //         )
      //           return;
      //         theSendToShape.options.push(dataItem);
      //       });

      //       theSendToShape.deletedData.forEach((deleteDataItem) => {
      //         deletedDataMap[deleteDataItem.text] = true;
      //       });

      //       if (!locks[curve.shape.id]) {
      //         queue.push(theSendToShape);
      //         locks[curve.shape.id] = true;
      //       }
      //     });
      //   });

      //   queue.shift();
      // }
    });

    // check all correspondants of shapes' between options and selectedData
    shapes.forEach((shape) => {
      shape.getRedundancies();
    });

    const errorShapes: Core[] = shapes.filter(
      (shape) => shape.status === CoreTypes.Status.error
    );

    errorShapes.forEach((errorShape) => {
      // traversal all relational steps
      const queue: (Core | Terminal | Process | Data | Desicion)[] = [
          errorShape,
        ],
        locks: { [curveId: string]: boolean } = {}; // prevent from graph cycle

      while (queue.length !== 0) {
        const shape = queue[0];

        if (shape.status !== CoreTypes.Status.error) {
          shape.status = CoreTypes.Status.disabled;
        }

        // ds.forEach((d) => {
        //   shape.curves[d].forEach((curve) => {
        //     const theSendToShape = curve.sendTo?.shape;

        //     if (!theSendToShape) return;

        //     if (!locks[curve.shape.id]) {
        //       queue.push(theSendToShape);
        //       locks[curve.shape.id] = true;
        //     }
        //   });
        // });

        queue.shift();
      }
    });
  };

  const checkGroups = () => {
    const _steps: PageTypes.Steps = {};

    shapes.forEach((shape) => {
      _steps[shape.id] = {
        shape: cloneDeep(shape),
        open: steps[shape.id] ? steps[shape.id].open : false,
      };
    });

    setSteps(_steps);
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

  const fetchProjects = async () => {
    const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
      await projectAPIs.getProjecs();
    setProjects(res.data);
  };

  const verifyToken = async () => {
    const token = localStorage.getItem("Authorization");

    if (token) {
      const res: AxiosResponse<AuthTypes.JWTLogin["resData"]> =
        await authAPIs.jwtLogin(token);

      if (res.data.isPass) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setLeftMouseBtn(true);

    const p = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
    const normalP = getNormalP(p, offset, scale);
    if (space) {
      lastP = p;
    } else {
      if (multiSelect.shapes.length >= 2) {
        // when multi multiSelect shapes
        let _target: null | CommonTypes.SelectAreaTarget = null;
        const [multiSelectingAreaStartP, multiSelectingAreaEndP] =
          getMultiSelectingAreaP();
        const pInSelectingArea = {
          m:
            normalP.x > multiSelectingAreaStartP.x &&
            normalP.y > multiSelectingAreaStartP.y &&
            normalP.x < multiSelectingAreaEndP.x &&
            normalP.y < multiSelectingAreaEndP.y,
          lt:
            normalP.x > multiSelectingAreaStartP.x - selectAnchor.size.fill &&
            normalP.y > multiSelectingAreaStartP.y - selectAnchor.size.fill &&
            normalP.x < multiSelectingAreaStartP.x + selectAnchor.size.fill &&
            normalP.y < multiSelectingAreaStartP.y + selectAnchor.size.fill,
          rt:
            normalP.x > multiSelectingAreaEndP.x - selectAnchor.size.fill &&
            normalP.y > multiSelectingAreaStartP.y - selectAnchor.size.fill &&
            normalP.x < multiSelectingAreaEndP.x + selectAnchor.size.fill &&
            normalP.y < multiSelectingAreaStartP.y + selectAnchor.size.fill,
          rb:
            normalP.x > multiSelectingAreaEndP.x - selectAnchor.size.fill &&
            normalP.y > multiSelectingAreaEndP.y - selectAnchor.size.fill &&
            normalP.x < multiSelectingAreaEndP.x + selectAnchor.size.fill &&
            normalP.y < multiSelectingAreaEndP.y + selectAnchor.size.fill,
          lb:
            normalP.x > multiSelectingAreaStartP.x - selectAnchor.size.fill &&
            normalP.y > multiSelectingAreaEndP.y - selectAnchor.size.fill &&
            normalP.x < multiSelectingAreaStartP.x + selectAnchor.size.fill &&
            normalP.y < multiSelectingAreaEndP.y + selectAnchor.size.fill,
        };

        if (pInSelectingArea.m) {
          _target = CommonTypes.SelectAreaTarget.m;
        } else if (pInSelectingArea.lt) {
          _target = CommonTypes.SelectAreaTarget.lt;
        } else if (pInSelectingArea.rt) {
          _target = CommonTypes.SelectAreaTarget.rt;
        } else if (pInSelectingArea.rb) {
          _target = CommonTypes.SelectAreaTarget.rb;
        } else if (pInSelectingArea.lb) {
          _target = CommonTypes.SelectAreaTarget.lb;
        }

        if (_target) {
          pressing = {
            origin: null,
            shape: null,
            ghost: null,
            target: _target,
            direction: null,
          };
        } else {
          multiSelect = cloneDeep(init.multiSelect);
        }
      } else {
        // when single multiSelect shape
        handleUtils.handle([
          () => triggerCurve(p, offset, scale),
          () => deSelectShape(),
          () => selectCurve(p, offset, scale),
          () => deSelectCurve(),
          () => selectShape(p, offset, scale),
        ]);
      }

      if (!pressing) {
        selectionFrameP = {
          start: p,
          end: p,
        };
      }
    }

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
      normalOffsetP = getNormalP(offsetP, null, scale);

    const movingViewport = space && leftMouseBtn;

    if (movingViewport) {
      setDataFrame(undefined);
      offset.x += normalOffsetP.x;
      offset.y += normalOffsetP.y;
    }

    if (!movingViewport && multiSelect.shapes.length >= 2) {
      if (pressing?.target === CommonTypes.SelectAreaTarget.m) {
        moveMultiSelectingShapes(normalOffsetP);
      }

      if (
        pressing?.target === CommonTypes.SelectAreaTarget.lt ||
        pressing?.target === CommonTypes.SelectAreaTarget.rt ||
        pressing?.target === CommonTypes.SelectAreaTarget.rb ||
        pressing?.target === CommonTypes.SelectAreaTarget.lb
      ) {
        resizeMultiSelectingShapes(pressing?.target, offsetP, scale);
      }

      multiSelect.shapes.forEach((shape) => {
        moveCurve(shape);
      });
    }

    if (!movingViewport && pressing?.shape) {
      if (pressing?.shape && pressing?.target === CoreTypes.PressingTarget.m) {
        const shapesInView = getShapesInView(shapes);
        alginLines = getAlignLines(shapesInView, pressing.shape);

        const alignP = getAlignP(shapesInView, pressing.ghost);

        if (alignP?.x || alignP?.y) {
          pressing.shape.locate(alignP);
        }

        if (alignP?.x && !alignP?.y) {
          pressing.shape.move(
            getNormalP(
              {
                x: 0,
                y: p.y - lastP.y,
              },
              null,
              scale
            )
          );
        }

        if (!alignP?.x && alignP?.y) {
          pressing.shape.move(
            getNormalP(
              {
                x: p.x - lastP.x,
                y: 0,
              },
              null,
              scale
            )
          );
        }

        if (!alignP?.x && !alignP?.y) {
          if (pressing.ghost && pressing.shape.p.x !== pressing.ghost?.p.x) {
            pressing.shape.locate({
              x: pressing.ghost.getCenter().m.x,
              y: null,
            });
          }

          if (pressing.ghost && pressing.shape.p.y !== pressing.ghost?.p.y) {
            pressing.shape.locate({
              x: null,
              y: pressing.ghost.getCenter().m.y,
            });
          }
          pressing.shape.move(
            getNormalP(
              {
                x: p.x - lastP.x,
                y: p.y - lastP.y,
              },
              null,
              scale
            )
          );
        }

        pressing.ghost?.move(
          getNormalP(
            {
              x: p.x - lastP.x,
              y: p.y - lastP.y,
            },
            null,
            scale
          )
        );

        moveCurve(pressing?.shape);
      }

      if (
        pressing?.target === CoreTypes.PressingTarget.lt ||
        pressing?.target === CoreTypes.PressingTarget.rt ||
        pressing?.target === CoreTypes.PressingTarget.rb ||
        pressing?.target === CoreTypes.PressingTarget.lb
      ) {
        resizeShape(
          shapes,
          {
            shape: pressing.shape,
            ghost: pressing.ghost,
            target: pressing.target,
          },
          getNormalP(offsetP, null, scale)
        );
      }
    }

    if (!movingViewport && !!pressingCurve) {
      movePressingCurve(ctx, pressingCurve, p, offset, scale);
    } else if (!movingViewport && selectionFrameP) {
      selectionFrameP = {
        ...selectionFrameP,
        end: p,
      };
    }

    if (dbClickedShape) {
      setDataFrame({
        p: getFramePosition(dbClickedShape, offset, scale),
      });
    }

    lastP = p;

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
    frameSelect(offset, scale);
    checkConnect(getNormalP(p, offset, scale));

    if (
      pressing?.target &&
      pressing?.shape &&
      pressing?.origin &&
      (pressing?.shape?.p.x !== pressing?.origin?.p.x ||
        pressing?.shape?.p.y !== pressing?.origin?.p.y)
    ) {
      if (
        pressing?.target === CoreTypes.PressingTarget.lt ||
        pressing?.target === CoreTypes.PressingTarget.rt ||
        pressing?.target === CoreTypes.PressingTarget.rb ||
        pressing?.target === CoreTypes.PressingTarget.lb
      ) {
        // actions.push({
        //   type: CommonTypes.Action.resize,
        //   targets: [
        //     {
        //       id: pressing.shape.id,
        //       index: shapes.findIndex(
        //         (shape) => shape.id === pressing?.shape?.id
        //       ),
        //       origin: pressing.origin,
        //     },
        //   ],
        // });
        pushAction()
      } else if (pressing?.target === CoreTypes.PressingTarget.m) {
        pushAction()
        // actions.push({
        //   type: CommonTypes.Action.move,
        //   target: pressing.shape,
        //   displacement: {
        //     x: pressing.origin.p.x - pressing.shape.p.x,
        //     y: pressing.origin.p.y - pressing.shape.p.y,
        //   },
        // }); // temp close
      }
    }

    checkData(shapes);
    checkGroups();

    selectionFrameP = null;
    pressing = null;
    pressingCurve = null;
    alginLines = [];

    drawCanvas(offset, scale);

    console.log("actions", actions);
  };

  const onMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    zoom(e.deltaY, { x: e.clientX, y: e.clientY });
  };

  const onDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const p = {
        x: e.nativeEvent.x,
        y: e.nativeEvent.y,
      };

      shapes.forEach((shape) => {
        if (shape.checkBoundry(p)) {
          setDataFrameWarning(init.dataFrameWarning);
          setDbClickedShape(shape);
          setDataFrame({
            p: getFramePosition(shape, offset, scale),
          });
        }
      });
    },
    []
  );

  function handleKeyDown(this: Window, e: KeyboardEvent) {
    if (e.key === "Control") {
      setControl(true);
    }
    if (e.key === "z" && control) {
      undo(ctx, offset, scale);
    }
    if (e.key === " " && !space) {
      setSpace(true);
    } else if (e.key === "Backspace" && !dataFrame && !dbClickedShape) {
      const $canvas = document.querySelector("canvas");
      if (!$canvas || !ctx) return;

      handleUtils.handle([deleteMultiSelectShapes, deleteSelectedShape]);

      drawCanvas(offset, scale);
      drawScreenshot(offset, scale);
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

  const onClickCreateShapeButton = (
    e: React.MouseEvent<HTMLButtonElement>,
    type: CommonTypes.Type,
    actions: PageIdTypes.Actions
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isBrowser) return;
    pushAction()

    let intiShape = getInitializedShape(type, offset, scale);
    shapes.push(intiShape);


    // actions.push({
    //   type: CommonTypes.Action.add,
    // }); // temp close

    checkData(shapes);
    checkGroups();
    drawCanvas(offset, scale);
    drawScreenshot(offset, scale);
  };

  const onConfirmDataFrame: DataFrameTypes.Props["onConfirm"] = (
    title,
    data,
    selectedData,
    deletedData
  ) => {
    // validate repeated title name
    const titleWarning = title ? "" : "required field.";

    setDataFrameWarning((dataFrameWarning) => ({
      ...dataFrameWarning,
      title: titleWarning,
    }));

    const dataWarningMapping: DataFrameTypes.Warning["data"] = {};

    const dataMapping: { [dataText: string]: number } = {};

    // data.forEach((shapeData, shapeDataI) => {
    //   // validate repeated data name in data frame
    //   if (!(shapeData.text in dataMapping)) {
    //     dataMapping[shapeData.text] = shapeDataI;
    //   } else {
    //     dataWarningMapping[shapeDataI] = "欄位名稱重複";
    //   }
    // });

    // data.forEach((shapeData, shapeDataItemI) => {
    //   // validate repeated data name in global data
    //   if (
    //     shape.id !== allData.mapping[shapeData.text] &&
    //     shapeData.text in allData.mapping
    //   ) {
    //     dataWarningMapping[shapeDataItemI] = "欄位名稱重複";
    //   }
    // });

    data.forEach((dataItem, dataItemI) => {
      // validate required data
      if (!dataItem.text) {
        dataWarningMapping[dataItemI] = "required field.";
      }
    });

    setDataFrameWarning((dataFrameWarning) => ({
      ...dataFrameWarning,
      data: dataWarningMapping,
    }));

    if (!!titleWarning || Object.keys(dataWarningMapping).length > 0) return;

    if (
      dbClickedShape instanceof Process ||
      dbClickedShape instanceof Desicion
    ) {
      dbClickedShape?.onDataChange(title, selectedData, deletedData);
    } else if (dbClickedShape instanceof Data) {
      dbClickedShape?.onDataChange(title, data, selectedData, deletedData);
    } else if (dbClickedShape instanceof Terminal) {
      dbClickedShape?.onDataChange(title);
    }

    setDataFrame(undefined);
    setDbClickedShape(null);
    checkData(shapes);
    checkGroups();
  };

  const onClickScalePlusIcon = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    zoom(-100, {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickScaleMinusIcon = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    zoom(100, {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickScaleNumber = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;

    zoom(-((1 / scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickDataSidePanelSwitch = () => {
    setIsDataSidePanelOpen((open) => !open);
  };

  const onClickProfile = () => {
    setIsProfileFrameOpen((isProfileFrameOpen) => !isProfileFrameOpen);
  };

  const onClickProjectsButton = async () => {
    setIsProjectsModalOpen(true);
    setIsProfileFrameOpen(false);
    await fetchProjects();
  };

  const onClickStep = (shapeP: CommonTypes.Vec) => {
    if (!isBrowser) return;

    offset = {
      x: window.innerWidth / 2 / scale - shapeP.x,
      y: window.innerHeight / 2 / scale - shapeP.y,
    };

    drawCanvas(offset, scale);
  };

  const onClickSaveButton: MouseEventHandler<HTMLSpanElement> = () => {
    const $canvas = document.querySelector("canvas");
    const $screenshot: HTMLCanvasElement | null = document.querySelector(
      "canvas[role='screenshot']"
    );

    if (!$canvas || !$screenshot || selectedProjectId === null) return;

    const modifyData: ProjectAPITypes.UpdateProject["data"] = {
      orders: [],
      shapes: {},
      curves: {},
      data: {},
      img: $screenshot.toDataURL("image/png"),
    };

    shapes.forEach((shape) => {
      modifyData.orders.push(shape.id);

      if (
        !(shape instanceof Terminal) &&
        !(shape instanceof Process) &&
        !(shape instanceof Data) &&
        !(shape instanceof Desicion)
      )
        return;

      modifyData.shapes[shape.id] = {
        w: shape.w,
        h: shape.h,
        title: shape.title,
        type: (() => {
          if (shape instanceof Terminal) {
            return CommonTypes.Type.terminator;
          } else if (shape instanceof Process) {
            return CommonTypes.Type.process;
          } else if (shape instanceof Data) {
            return CommonTypes.Type.data;
          } else if (shape instanceof Desicion) {
            return CommonTypes.Type.decision;
          }

          return CommonTypes.Type.process;
        })(),
        p: shape.p,
        curves: (() => {
          const curves: {
            l: string[];
            t: string[];
            r: string[];
            b: string[];
          } = { l: [], t: [], r: [], b: [] };

          return curves;
        })(),
        data: (() => {
          if (shape instanceof Data) {
            return shape.data.map((dataItem) => {
              modifyData.data[dataItem.id] = dataItem.text;

              return dataItem.id;
            });
          }

          return [];
        })(),
        selectedData: shape.selectedData.map(
          (selectedDataItem) => selectedDataItem.id
        ),
        deletedData: shape.deletedData.map((deleteData) => deleteData.id),
        text: shape instanceof Desicion ? shape?.text : null,
      };
    });

    projectAPIs
      .updateProject(selectedProjectId, modifyData)
      .then((res: AxiosResponse<ProjectAPITypes.UpdateProject["resData"]>) => {
        if (res.status !== 200) return;
        const projectI = projects.findIndex(
          (project) => project.id === res.data.data.id
        );

        if (!projectI) return;
        const _projects = cloneDeep(projects);
        _projects[projectI].img = res.data.data.img;

        setProjects(_projects);
      });
  };

  const onClickProjectCard = (id: ProjectTypes.Project["id"]) => {
    setSelectedProjectId(id);
  };

  const initProject = async (id: ProjectTypes.Project["id"]) => {
    try {
      const res: AxiosResponse<ProjectAPITypes.GetProject["resData"], any> =
        await projectAPIs.getProject(id);

      const projectData = res.data as ProjectAPITypes.ProjectData;

      setScale(1);
      setSelectedProjectId(id);
      offset = cloneDeep(init.offset);
      const initShapes = getInitializedShapes(
        projectData.orders,
        projectData.shapes,
        projectData.curves,
        projectData.data
      );
      shapes = initShapes;
      multiSelect = cloneDeep(init.multiSelect);
      checkData(shapes);
      checkGroups();
      drawCanvas(offset, scale);
      drawScreenshot(offset, scale);
      setIsProjectsModalOpen(false);
      setProjectName({
        inputVal: projectData.projectName,
        val: projectData.projectName,
      });

      if (!hasEnter) {
        setHasEnter(true);
      }
    } catch (error) {
      router.push("/");
    }
  };

  const onClickConfrimProject = async (id: ProjectTypes.Project["id"]) => {
    router.push(`/${id}`);
  };

  const onClickDeleteProject = async (id: ProjectTypes.Project["id"]) => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas || !ctx) return;

    try {
      const res: AxiosResponse<ProjectAPITypes.DeleteProject["resData"]> =
        await projectAPIs.deleteProject(id);

      if (id === selectedProjectId) {
        shapes = [];
        setSelectedProjectId(null);
        setHasEnter(false);
        setProjects(
          cloneDeep(projects).filter((project) => project.id !== res.data.id)
        );
      }
    } catch (err) {
      // TODO: handle error
    }
  };

  const onClickNewProjectButton = async () => {
    if (qas) {
      setHasEnter(true);
      setIsProjectsModalOpen(false);
      return;
    }
    shapes = [];
    const newProject: AxiosResponse<ProjectAPITypes.CreateProject["resData"]> =
      await projectAPIs.createProject();

    const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
      await projectAPIs.getProjecs();

    setIsProjectsModalOpen(false);
    setProjects(res.data);
    setSelectedProjectId(newProject.data.id);
    setHasEnter(true);
  };

  const onClickProjectsModalX = () => {
    setIsProjectsModalOpen(false);
  };

  const onClickLogOutButton = () => {
    localStorage.removeItem("Authorization");
    router.push("/");
  };

  const onClickProjectName = () => {
    setIsRenameFrameOpen((isRenameFrameOpen) => !isRenameFrameOpen);
  };

  const onChangeProjectName: ChangeEventHandler<HTMLInputElement> = (e) => {
    setProjectName((projectName) => ({
      ...projectName,
      inputVal: e.target.value,
    }));
  };

  const onClickSaveProjectNameButton: MouseEventHandler<
    HTMLButtonElement
  > = async (e) => {
    if (!selectedProjectId) return;
    const res: AxiosResponse<
      ProjectAPITypes.UpdateProjectName["resData"],
      any
    > = await projectAPIs.updateProjectName(
      selectedProjectId,
      projectName.inputVal
    );

    try {
      if (
        res.status === 201 &&
        res.data.status === statusConstants.SUCCESSFUL
      ) {
        setProjectName({
          val: res.data.name,
          inputVal: res.data.name,
        });
        fetchProjects();
      }
    } catch (error) {
      setProjectName({
        val: projectName.inputVal,
        inputVal: projectName.inputVal,
      });
    }

    setIsRenameFrameOpen(false);
  };

  useEffect(() => {
    if (!isBrowser) return;

    (async () => {
      await verifyToken();
      await fetchProjects();
      await initProject(Number(params.id));

      // offset = { x: 0, y: 0 };

      // const arrow = new Arrow(
      //   `arrow_${Date.now()}`,
      //   100,
      //   100,
      //   "#000",
      //   { x: 500, y: 500 },
      //   (0 / 360) * Math.PI
      // );
      // arrow.selecting = true;
      // arrow.scale = 1;
      // arrow.offset = { x: 0, y: 0 };

      // const curve = new Curve(
      //   "curve_01",
      //   {
      //     x: 500,
      //     y: 500,
      //   },
      //   {
      //     x: 500,
      //     y: 400,
      //   },
      //   {
      //     x: 500,
      //     y: 300,
      //   },
      //   {
      //     x: 500,
      //     y: 200,
      //   }
      // );
      // curve.selecting = true;
      // curve.scale = 1.5;
      // curve.offset = { x: 50, y: 50 };
      // tests.push(arrow);
      // tests.push(curve);

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
  }, [dataFrame, dbClickedShape, space, steps, control]);

  const createShapeButtons = [
    { shape: CommonTypes.Type["terminator"], icon: IconTypes.Type.ellipse },
    { shape: CommonTypes.Type["process"], icon: IconTypes.Type.square },
    { shape: CommonTypes.Type["data"], icon: IconTypes.Type.parallelogram },
    { shape: CommonTypes.Type["decision"], icon: IconTypes.Type.dimond },
  ].map((type) => ({
    type: type.shape,
    icon: (
      <Icon type={type.icon} w={16} h={16} fill={tailwindColors.white["500"]} />
    ),
  }));

  return (
    <>
      <Modal
        isOpen={isProjectsModalOpen}
        width="1120px"
        onClickX={onClickProjectsModalX}
      >
        <div>
          <section className="rounded-lg text-gray-600 bg-white-500 p-8 body-font">
            <div className="mb-6 pb-3 ps-4 border-b border-grey-5 flex justify-between items-end">
              <h2 className="text-gray-900 title-font text-lg font-semibold">
                Projects
              </h2>
              <Button onClick={onClickNewProjectButton} text={"New Project"} />
            </div>
            <div className="grid grid-cols-3 gap-4 h-[500px] overflow-auto">
              {projects.map((project) => (
                <div>
                  <Card
                    className="cursor-pointer"
                    key={project.id}
                    text={
                      <h2 className="title-font text-lg font-medium">
                        {project.name}
                      </h2>
                    }
                    selected={selectedProjectId === project.id}
                    src={project.img}
                    onClick={() => {
                      onClickProjectCard(project.id);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center mt-6 pt-3 border-t border-grey-5">
              <Button
                className="me-3"
                onClick={() => {
                  if (!selectedProjectId) return;
                  onClickDeleteProject(selectedProjectId);
                }}
                text={"Delete"}
                disabled={selectedProjectId === null}
                danger
              />
              <Button
                onClick={() => {
                  if (!selectedProjectId) return;
                  onClickConfrimProject(selectedProjectId);
                }}
                text={"Confirm"}
                disabled={selectedProjectId === null}
              />
            </div>
          </section>
        </div>
      </Modal>
      <header className="w-full fixed z-50 text-gray-600 body-font bg-primary-500 shadow-md">
        <ul className="container mx-auto grid grid-cols-3 py-3 px-4">
          <li>
            <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                className="w-10 h-10 text-white p-2 bg-secondary-500 rounded-full"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#FFFFFF"
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                ></path>
              </svg>
              <span className="ml-3 text-xl text-white-500">Minder</span>
            </a>
          </li>
          <li className="justify-self-center self-center text-base">
            <div>
              <nav
                className="cursor-pointer flex items-center relative [&:hover>div:nth-child(2)]:translate-x-full [&:hover>div:nth-child(2)]:opacity-100 transition ease-in-out duration-150"
                onClick={onClickProjectName}
              >
                <a className="text-white-500">{projectName.val}</a>
                <div className="absolute right-0 translate-x-[0px] opacity-0 transition ease-in-out duration-150 ps-1">
                  <PencilSquareIcon
                    width={20}
                    height={20}
                    fill={tailwindColors.white["500"]}
                  />
                </div>
              </nav>
              <motion.div
                className={`${isRenameFrameOpen ? "block" : "hidden"}`}
                variants={{
                  open: {
                    display: "block",
                    opacity: 1,
                    y: "4px",
                  },
                  closed: {
                    transitionEnd: {
                      display: "none",
                    },
                    opacity: 0,
                    y: "-2px",
                  },
                }}
                initial={isRenameFrameOpen ? "open" : "closed"}
                animate={isRenameFrameOpen ? "open" : "closed"}
                transition={{ type: "easeInOut", duration: 0.15 }}
              >
                <Frame
                  className={
                    "absolute -bottom-[6px] left-1/2 -translate-x-1/2 translate-y-full w-[300px]"
                  }
                >
                  <div className="flex">
                    <Input
                      value={projectName.inputVal}
                      onChange={onChangeProjectName}
                    />
                    <Button
                      className="ms-4"
                      text="Save"
                      onClick={onClickSaveProjectNameButton}
                    />
                  </div>
                </Frame>
              </motion.div>
            </div>
          </li>
          <li className="flex justify-self-end self-center text-base">
            <Button
              className={"mr-4 bg-secondary-500"}
              onClick={onClickSaveButton}
              text={
                <div className="d-flex items-center">
                  <span className="text-white-500">Save</span>
                  {/* <div
                  className="mx-2 w-2 h-2 inline-flex items-center justify-center rounded-full bg-info-500 text-indigo-500 flex-shrink-0 cursor-pointer"
                /> */}
                </div>
              }
            />
            <div className="relative">
              <div
                className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-info-500 text-white-500 flex-shrink-0 cursor-pointer"
                onClick={onClickProfile}
              >
                L
              </div>
              <motion.div
                className={`${isProfileFrameOpen ? "block" : "hidden"}`}
                variants={{
                  open: {
                    display: "block",
                    opacity: 1,
                    y: "4px",
                  },
                  closed: {
                    transitionEnd: {
                      display: "none",
                    },
                    opacity: 0,
                    y: "-2px",
                  },
                }}
                initial={isProfileFrameOpen ? "open" : "closed"}
                animate={isProfileFrameOpen ? "open" : "closed"}
                transition={{ type: "easeInOut", duration: 0.15 }}
              >
                <Frame className="absolute top-full right-0 translate-y-[8px]">
                  <Button text={"Projects"} onClick={onClickProjectsButton} />
                  <Button
                    className="mt-2"
                    text={"Log Out"}
                    onClick={onClickLogOutButton}
                    danger
                  />
                </Frame>
              </motion.div>
            </div>
          </li>
        </ul>
      </header>
      <SidePanel
        open={isDataSidePanelOpen}
        w={"360px"}
        h={"calc(100vh - 64px)"}
        d={["b"]}
        onClickSwitch={onClickDataSidePanelSwitch}
      >
        <h3 className="text-lg font-semibold py-3 px-5 border-b border-grey-5 text-black-2 shadow-sm">
          Shapes
        </h3>
        <ul
          style={{ height: "calc(100% - 52px)" }}
          className="overflow-y-auto overflow-x-hidden"
        >
          <li className="h-[8px]" />
          {Object.entries(steps).map(([stepId, step]) => {
            return (
              <li key={stepId}>
                <Accordion
                  showArrow={false}
                  title={step.shape.title}
                  hoverRender={
                    <div className="h-full justify-end items-center">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <svg
                          width={18}
                          height={18}
                          xmlns="http://www.w3.org/2000/svg"
                          xmlnsXlink="http://www.w3.org/1999/xlink"
                          version="1.1"
                          x="0px"
                          y="0px"
                          viewBox="0 0 100 100"
                          enable-background="new 0 0 100 100"
                          xmlSpace="preserve"
                        >
                          <path
                            fill="#233C53"
                            d="M84.6,45C82.4,29.7,70.3,17.5,55,15.3V5H45v10.3C29.7,17.5,17.6,29.7,15.4,45H5v10h10.4C17.6,70.3,29.7,82.4,45,84.6V95h10  V84.6C70.3,82.4,82.4,70.3,84.6,55H95V45H84.6z M50,75c-13.8,0-25-11.2-25-25s11.2-25,25-25s25,11.2,25,25S63.8,75,50,75z"
                          />
                          <circle cx="50" cy="50" r="10" />
                        </svg>
                      </div>
                    </div>
                  }
                  open={step.open}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickStep(step.shape.p);
                    // onClickaAccordionArrow(stepId); // TODO: open after content is added
                  }}
                >
                  {/* <Editor className="ps-6" shape={step.shape} /> TODO: open after content is added */}
                </Accordion>
              </li>
            );
          })}
          <li className="h-[8px]" />
        </ul>
      </SidePanel>

      <div className="fixed p-4 bottom-[16px] left-1/2 -translate-x-1/2 bg-white-500 shadow-md rounded-full">
        <div className="justify-self-center">
          <div className="flex">
            {createShapeButtons.map((createShapeButton) => (
              <RoundButton
                size={32}
                className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
                content={createShapeButton.icon}
                onClick={(e) => {
                  onClickCreateShapeButton(e, createShapeButton.type, actions);
                }}
                onKeyDown={(e) => {
                  e.preventDefault();
                  return false;
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <ul className="fixed p-4 bottom-[16px] right-4 rounded-full shadow-md bg-white-500">
        {" "}
        <li className="justify-self-end">
          <div className="flex items-center">
            <div
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickScaleMinusIcon}
            >
              -
            </div>
            <div
              className="flex mx-2 items-center justify-center cursor-pointer w-[48px]"
              onClick={onClickScaleNumber}
            >
              {Math.ceil(scale * 100)}%
            </div>
            <div
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickScalePlusIcon}
            >
              +
            </div>
          </div>
        </li>
      </ul>
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
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
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
      {dataFrame && dbClickedShape && (
        <DataFrame
          shape={dbClickedShape}
          coordinate={dataFrame.p}
          onConfirm={onConfirmDataFrame}
          feature={{
            import: dbClickedShape instanceof Data,
            usage:
              dbClickedShape instanceof Process ||
              dbClickedShape instanceof Data ||
              dbClickedShape instanceof Desicion,
            redundancy:
              dbClickedShape instanceof Process ||
              dbClickedShape instanceof Data ||
              dbClickedShape instanceof Desicion,
          }}
          warning={dataFrameWarning}
        />
      )}
    </>
  );
}
