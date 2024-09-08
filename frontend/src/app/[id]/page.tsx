// TODO: fix browser zoom and re calculate shape offset / multi select resize in scale
"use client";
import axios, { AxiosResponse } from "axios";
import { useParams, useRouter } from "next/navigation";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Curve from "@/shapes/curve";
import Arrow from "@/shapes/arrow";
import Desicion from "@/shapes/decision";
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
import * as authAPIs from "@/apis/auth";
import * as projectAPIs from "@/apis/project";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/shapes/common";
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
  select: {
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

let useEffected = false,
  ctx: CanvasRenderingContext2D | null | undefined = null,
  ctx_screenshot: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  tests: any[] = [], // TODO: should be deleted
  pressing: null | {
    shape: null | Terminal | Process | Data | Desicion;
    curveId?: null | CurveTypes.Id;
    direction: null | CommonTypes.Direction; // TODO: should be removed in the future
    target:
      | null
      | CoreTypes.PressingTarget
      | CurveTypes.PressingTarget
      | CommonTypes.SelectAreaTarget;
  } = null,
  offset: CommonTypes.Vec = cloneDeep(init.offset),
  offset_center: CommonTypes.Vec = cloneDeep(init.offset),
  lastP: CommonTypes.Vec = { x: 0, y: 0 },
  relativeCurveCp2: CommonTypes.Vec = { x: 0, y: 0 },
  selectAreaP: null | {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
  } = null,
  select: {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
    shapes: Core[];
  } = cloneDeep(init.select),
  selectAnchor = {
    size: {
      fill: 4,
      stroke: 2,
    },
  };

const ds = [
  CommonTypes.Direction.l,
  CommonTypes.Direction.t,
  CommonTypes.Direction.r,
  CommonTypes.Direction.b,
];

const getFramePosition = (shape: Core) => {
  const frameOffset = 12;
  return {
    x: shape.getScreenP().x + shape.getScaleSize().w / 2 + frameOffset,
    y: shape.getScreenP().y,
  };
};

const getInitializedShape = (
  type: CommonTypes.Type,
  offset: CommonTypes.Vec,
  offset_center: CommonTypes.Vec
) => {
  switch (type) {
    case CommonTypes.Type["terminator"]:
      return new Terminal(
        `${type}_${Date.now()}`,
        init.shape.size.t.w,
        init.shape.size.t.h,
        {
          x: -offset.x + window.innerWidth / 2 + offset_center.x,
          y: -offset.y + window.innerHeight / 2 + offset_center.y,
        },
        type
      );
    case CommonTypes.Type["process"]:
      return new Process(
        `${type}_${Date.now()}`,
        init.shape.size.p.w,
        init.shape.size.p.h,
        {
          x: -offset.x + window.innerWidth / 2 + offset_center.x,
          y: -offset.y + window.innerHeight / 2 + offset_center.y,
        },
        type
      );

    case CommonTypes.Type["data"]:
      return new Data(
        `${type}_${Date.now()}`,
        init.shape.size.d.w,
        init.shape.size.d.h,
        {
          x: -offset.x + window.innerWidth / 2 + offset_center.x,
          y: -offset.y + window.innerHeight / 2 + offset_center.y,
        },
        type
      );

    case CommonTypes.Type["decision"]:
      return new Desicion(
        `${type}_${Date.now()}`,
        init.shape.size.dec.w,
        init.shape.size.dec.h,
        {
          x: -offset.x + window.innerWidth / 2 + offset_center.x,
          y: -offset.y + window.innerHeight / 2 + offset_center.y,
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

        newTerminator.offset = offset;

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

        newData.offset = offset;

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

        newProcess.offset = offset;

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

        newDesicion.offset = offset;

        shapeMappings[id] = newDesicion;

        break;
    }
  });

  dataShapes.forEach(([shapeId, shapeInfo]) => {
    ds.forEach((d) => {
      if (shapeInfo.curves[d].length === 0) return;
      shapeInfo.curves[d].forEach((curveId) => {
        const curveInfo = curves[curveId];

        shapeMappings[shapeId].createCurve(
          curveId,
          d,
          curveInfo.p1,
          curveInfo.p2,
          curveInfo.cp1,
          curveInfo.cp2,
          curveInfo.sendTo
            ? {
                shape: shapeMappings[curveInfo.sendTo.id],
                d: curveInfo.sendTo.d,
                bridgeId: curveId,
              }
            : null
        );

        if (curveInfo.sendTo) {
          // initialize received shape
          shapeMappings[curveInfo.sendTo.id].receiveFrom[
            curveInfo.sendTo.d
          ].push({
            shape: shapeMappings[shapeId],
            d: d,
            bridgeId: curveId,
          });
        }
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

  screenshotShapes.forEach((screenshotShape, screenshotShapeI) => {
    ds.forEach((d) => {
      shapes[screenshotShapeI].curves[d].forEach((curve) => {
        screenshotShape.createCurve(
          curve.shape.id + suffix,
          d,
          curve.shape.p1,
          curve.shape.p2,
          curve.shape.cp1,
          curve.shape.cp2,
          curve.sendTo
        );
      });
    });
  });

  return screenshotShapes;
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

      while (queue.length !== 0) {
        const shape = queue[0];

        ds.forEach((d) => {
          shape.curves[d].forEach((curve) => {
            const theSendToShape = curve.sendTo?.shape;

            if (!theSendToShape) return;

            dataShape.data.forEach((dataItem) => {
              if (
                theSendToShape.options.some(
                  (option) => option.text === dataItem.text
                ) ||
                deletedDataMap[dataItem.text]
              )
                return;
              theSendToShape.options.push(dataItem);
            });

            theSendToShape.deletedData.forEach((deleteDataItem) => {
              deletedDataMap[deleteDataItem.text] = true;
            });

            if (!locks[curve.shape.id]) {
              queue.push(theSendToShape);
              locks[curve.shape.id] = true;
            }
          });
        });

        queue.shift();
      }
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

        ds.forEach((d) => {
          shape.curves[d].forEach((curve) => {
            const theSendToShape = curve.sendTo?.shape;

            if (!theSendToShape) return;

            if (!locks[curve.shape.id]) {
              queue.push(theSendToShape);
              locks[curve.shape.id] = true;
            }
          });
        });

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
    // --

    shapes.forEach((shape) => {
      shape.scale = _scale;
      shape.offset = offset;
    });

    // --- get center point offset value
    const distX_center = 1 / 2;
    const distY_center = 1 / 2;

    // calculate how much we need to zoom
    const unitsZoomedX_center = ($canvas.width / _scale) * scaleAmount;
    const unitsZoomedY_center = ($canvas.height / _scale) * scaleAmount;

    const unitsAddLeft_center = unitsZoomedX_center * distX_center;
    const unitsAddTop_center = unitsZoomedY_center * distY_center;

    offset_center.x -= unitsAddLeft_center;
    offset_center.y -= unitsAddTop_center;
    // ---

    if (select.shapes.length > 1) {
      select.start.x = -1;
      select.end.x = -1;
      select.start.y = -1;
      select.end.y = -1;
      select.shapes.forEach((shape) => {
        const theEdge = shape.getEdge();
        if (select?.start.x === -1 || theEdge.l < select?.start.x) {
          select.start.x = theEdge.l;
        }
        if (select?.start.y === -1 || theEdge.t < select?.start.y) {
          select.start.y = theEdge.t;
        }
        if (select.end.x === -1 || theEdge.r > select.end.x) {
          select.end.x = theEdge.r;
        }
        if (select.end.y === -1 || theEdge.b > select.end.y) {
          select.end.y = theEdge.b;
        }
      });
    }
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
      },
      pInSelectArea =
        p.x > select.start.x &&
        p.y > select.start.y &&
        p.x < select.end.x &&
        p.y < select.end.y,
      pInSelectArea_lt =
        p.x > select.start.x - selectAnchor.size.fill &&
        p.y > select.start.y - selectAnchor.size.fill &&
        p.x < select.start.x + selectAnchor.size.fill &&
        p.y < select.start.y + selectAnchor.size.fill,
      pInSelectArea_rt =
        p.x > select.end.x - selectAnchor.size.fill &&
        p.y > select.start.y - selectAnchor.size.fill &&
        p.x < select.end.x + selectAnchor.size.fill &&
        p.y < select.start.y + selectAnchor.size.fill,
      pInSelectArea_rb =
        p.x > select.end.x - selectAnchor.size.fill &&
        p.y > select.end.y - selectAnchor.size.fill &&
        p.x < select.end.x + selectAnchor.size.fill &&
        p.y < select.end.y + selectAnchor.size.fill,
      pInSelectArea_lb =
        p.x > select.start.x - selectAnchor.size.fill &&
        p.y > select.end.y - selectAnchor.size.fill &&
        p.x < select.start.x + selectAnchor.size.fill &&
        p.y < select.end.y + selectAnchor.size.fill;

    if (space) {
      lastP = p;
    } else {
      if (select.shapes.length > 1) {
        // when multi select shapes
        let _target: null | CommonTypes.SelectAreaTarget = null;

        if (pInSelectArea) {
          _target = CommonTypes.SelectAreaTarget.m;
        } else if (pInSelectArea_lt) {
          _target = CommonTypes.SelectAreaTarget.lt;
        } else if (pInSelectArea_rt) {
          _target = CommonTypes.SelectAreaTarget.rt;
        } else if (pInSelectArea_rb) {
          _target = CommonTypes.SelectAreaTarget.rb;
        } else if (pInSelectArea_lb) {
          _target = CommonTypes.SelectAreaTarget.lb;
        }

        if (_target) {
          pressing = {
            shape: null,
            target: _target,
            direction: null,
          };
        } else {
          select = cloneDeep(init.select);
        }
      } else {
        // when single select shape
        if (!pressing) {
          shapes.forEach((shape) => {
            const curveTriggerD = shape.getCurveTriggerDirection(p);
            if (curveTriggerD) {
              shape.selecting = false;

              const initCurveId = `curve_${Date.now()}`;

              shape.initializeCurve(
                initCurveId,
                CommonTypes.Direction[curveTriggerD]
              );

              shape.setIsCurveSelected(initCurveId, true);
            }

            switch (curveTriggerD) {
              case CommonTypes.Direction.l:
                relativeCurveCp2 = {
                  x: (-shape.curveTrigger.d * 1) / 3,
                  y: 0,
                };
                break;

              case CommonTypes.Direction.t:
                relativeCurveCp2 = {
                  x: 0,
                  y: (-shape.curveTrigger.d * 1) / 3,
                };
                break;

              case CommonTypes.Direction.r:
                relativeCurveCp2 = {
                  x: (shape.curveTrigger.d * 1) / 3,
                  y: 0,
                };
                break;

              case CommonTypes.Direction.b:
                relativeCurveCp2 = {
                  x: 0,
                  y: (shape.curveTrigger.d * 1) / 3,
                };
                break;
            }

            if (!!pressing) return;

            const withinHandlerRangeCurves =
              shape.checkCurveControlPointsBoundry(p);
            const firstDetectedCurve = withinHandlerRangeCurves[0];
            const withinRangeCurveIds = shape.checkCurvesBoundry(p);

            if (
              firstDetectedCurve &&
              firstDetectedCurve.target === CurveTypes.PressingTarget.p2
            ) {
              pressing = {
                shape: shape,
                curveId: firstDetectedCurve.id,
                target: CurveTypes.PressingTarget.p2,
                direction: firstDetectedCurve.d,
              };
            } else if (firstDetectedCurve && firstDetectedCurve.isSelecting) {
              pressing = {
                shape: shape,
                curveId: firstDetectedCurve.id,
                target: firstDetectedCurve.target,
                direction: firstDetectedCurve.d,
              };
            } else if (withinRangeCurveIds.length > 0) {
              pressing = {
                shape: shape,
                curveId: withinRangeCurveIds[0],
                target: null,
                direction: null,
              };
            }
          });
        }

        if (!pressing) {
          shapes.forEach((shape) => {
            if (!!pressing) return;
            const vertex = shape.checkVertexesBoundry(p);
            if (shape.selecting && vertex) {
              pressing = {
                shape: shape,
                curveId: null,
                target: vertex,
                direction: null,
              };
            } else if (shape.checkBoundry(p)) {
              pressing = {
                shape: shape,
                curveId: null,
                target: CoreTypes.PressingTarget.m,
                direction: null,
              };
            }
          });
        }

        // reset select status
        shapes.forEach((shape) => {
          shape.getCurveIds().map((curveId) => {
            shape.setIsCurveSelected(curveId, false);
          });
          shape.selecting = false;
        });

        // if has already selected curve, never select any other shapes
        if (pressing && pressing.shape && !!pressing.curveId) {
          pressing.shape?.setIsCurveSelected(pressing.curveId, true);

          if (pressing.target === CurveTypes.PressingTarget.p2) {
            const curveArrowTopP = pressing.shape.getPressingCurveP(
              CurveTypes.PressingTarget.p2,
              pressing.curveId
            );
            const curveCp2 = pressing.shape.getPressingCurveP(
              CurveTypes.PressingTarget.cp2,
              pressing.curveId
            );

            if (!curveArrowTopP || !curveCp2) return;

            relativeCurveCp2 = {
              x: curveArrowTopP.x - curveCp2.x,
              y: curveArrowTopP.y - curveCp2.y,
            };
          }
        } else if (pressing && pressing.shape && !pressing.curveId) {
          pressing.shape.selecting = true;
        }
      }

      if (!pressing) {
        selectAreaP = {
          start: p,
          end: p,
        };
      }
    }

    drawCanvas();
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
      screenOffsetP = {
        x: (p.x - lastP.x) * (1 / scale),
        y: (p.y - lastP.y) * (1 / scale),
      };

    const movingViewport = space && leftMouseBtn;

    if (movingViewport) {
      setDataFrame(undefined);
      offset.x += screenOffsetP.x;
      offset.y += screenOffsetP.y;
      shapes.forEach((shape) => {
        shape.offset = offset;
      });
      if (select.shapes.length > 0) {
        select.start.x += offsetP.x;
        select.start.y += offsetP.y;
        select.end.x += offsetP.x;
        select.end.y += offsetP.y;
      }
    } else if (select.shapes.length > 0) {
      // multi select

      const theSelect = {
        w: Math.abs(select.end.x - select.start.x),
        h: Math.abs(select.end.y - select.start.y),
      };

      if (pressing?.target === CommonTypes.SelectAreaTarget.m) {
        select.shapes.forEach((shape) => {
          shape.move({ x: p.x - lastP.x, y: p.y - lastP.y });
        });

        select.start.x += offsetP.x;
        select.start.y += offsetP.y;
        select.end.x += offsetP.x;
        select.end.y += offsetP.y;
      } else if (pressing?.target === CommonTypes.SelectAreaTarget.lt) {
        const canResize = {
          x: theSelect.w - offsetP.x > 0 || offsetP.x < 0,
          y: theSelect.h - offsetP.y > 0 || offsetP.y < 0,
        };

        select.shapes.forEach((shape) => {
          const ratioW = shape.getScaleSize().w / theSelect.w,
            unitW = offsetP.x * ratioW;

          if (canResize.x) {
            shape.w = shape.w - unitW / scale;

            const dx = Math.abs(shape.getScreenP().x - select.end.x),
              ratioX = dx / theSelect.w,
              unitX = offsetP.x * ratioX;

            shape.p = {
              ...shape.p,
              x: shape.p.x + unitX / scale,
            };
          }

          const ratioH = shape.getScaleSize().h / theSelect.h,
            unitH = offsetP.y * ratioH;

          if (canResize.y) {
            shape.h = shape.h - unitH / scale;

            const dy = Math.abs(shape.getScreenP().y - select.end.y),
              ratioY = dy / theSelect.h,
              unitY = offsetP.y * ratioY;

            shape.p = {
              ...shape.p,
              y: shape.p.y + unitY / scale,
            };
          }
        });

        if (canResize.x) {
          select.start.x += offsetP.x;
        }

        if (canResize.y) {
          select.start.y += offsetP.y;
        }
      } else if (pressing?.target === CommonTypes.SelectAreaTarget.rt) {
        const canResize = {
          x: theSelect.w + offsetP.x > 0 || offsetP.x > 0,
          y: theSelect.h - offsetP.y > 0 || offsetP.y < 0,
        };

        select.shapes.forEach((shape) => {
          const ratioW = shape.getScaleSize().w / theSelect.w,
            unitW = offsetP.x * ratioW;

          if (canResize.x) {
            shape.w = shape.w + unitW / scale;

            const dx = Math.abs(shape.getScreenP().x - select.start.x),
              ratioX = dx / theSelect.w,
              unitX = offsetP.x * ratioX;

            shape.p = {
              ...shape.p,
              x: shape.p.x + unitX / scale,
            };
          }

          const ratioH = shape.h / theSelect.h,
            unitH = offsetP.y * ratioH;

          if (canResize.y) {
            shape.h = shape.getScaleSize().h - unitH / scale;

            const dy = Math.abs(shape.getScreenP().y - select.end.y),
              ratioY = dy / theSelect.h,
              unitY = offsetP.y * ratioY;

            shape.p = {
              ...shape.p,
              y: shape.p.y + unitY / scale,
            };
          }
        });

        if (canResize.x) {
          select.end.x += offsetP.x;
        }

        if (canResize.y) {
          select.start.y += offsetP.y;
        }
      } else if (pressing?.target === CommonTypes.SelectAreaTarget.rb) {
        const canResize = {
          x: theSelect.w + offsetP.x > 0 || offsetP.x > 0,
          y: theSelect.h + offsetP.y > 0 || offsetP.y > 0,
        };

        select.shapes.forEach((shape) => {
          const ratioW = shape.getScaleSize().w / theSelect.w,
            unitW = offsetP.x * ratioW;

          if (canResize.x) {
            shape.w = shape.w + unitW / scale;

            const dx = Math.abs(shape.getScreenP().x - select.start.x),
              ratioX = dx / theSelect.w,
              unitX = offsetP.x * ratioX;

            shape.p = {
              ...shape.p,
              x: shape.p.x + unitX / scale,
            };
          }

          const ratioH = shape.getScaleSize().h / theSelect.h,
            unitH = offsetP.y * ratioH;

          if (canResize.y) {
            shape.h = shape.h + unitH / scale;

            const dy = Math.abs(shape.getScreenP().y - select.start.y),
              ratioY = dy / theSelect.h,
              unitY = offsetP.y * ratioY;

            shape.p = {
              ...shape.p,
              y: shape.p.y + unitY / scale,
            };
          }
        });

        if (canResize.x) {
          select.end.x += offsetP.x;
        }

        if (canResize.y) {
          select.end.y += offsetP.y;
        }
      } else if (pressing?.target === CommonTypes.SelectAreaTarget.lb) {
        const canResize = {
          x: theSelect.w - offsetP.x > 0 || offsetP.x < 0,
          y: theSelect.h + offsetP.y > 0 || offsetP.y > 0,
        };

        select.shapes.forEach((shape) => {
          const ratioW = shape.getScaleSize().w / theSelect.w,
            unitW = offsetP.x * ratioW;

          if (canResize.x) {
            shape.w = shape.w - unitW / scale;

            const dx = Math.abs(shape.getScreenP().x - select.end.x),
              ratioX = dx / theSelect.w,
              unitX = offsetP.x * ratioX;

            shape.p = {
              ...shape.p,
              x: shape.p.x + unitX / scale,
            };
          }

          const ratioH = shape.getScaleSize().h / theSelect.h,
            unitH = offsetP.y * ratioH;

          if (canResize.y) {
            shape.h = shape.h + unitH / scale;

            const dy = Math.abs(shape.getScreenP().y - select.start.y),
              ratioY = dy / theSelect.h,
              unitY = offsetP.y * ratioY;

            shape.p = {
              ...shape.p,
              y: shape.p.y + unitY / scale,
            };
          }
        });

        if (canResize.x) {
          select.start.x += offsetP.x;
        }

        if (canResize.y) {
          select.end.y += offsetP.y;
        }
      }
    } else if (pressing?.target && pressing?.shape) {
      if (
        pressing?.target === CoreTypes.PressingTarget.lt ||
        pressing?.target === CoreTypes.PressingTarget.rt ||
        pressing?.target === CoreTypes.PressingTarget.rb ||
        pressing?.target === CoreTypes.PressingTarget.lb
      ) {
        pressing.shape.resize(offsetP, pressing.target);
      } else if (pressing?.target === CoreTypes.PressingTarget.m) {
        pressing.shape.move({ x: p.x - lastP.x, y: p.y - lastP.y });
      }
      // else if (
      //   !!pressing.curveId &&
      //   pressing.direction &&
      //   pressing?.target === CurveTypes.PressingTarget.cp1
      // ) {
      //   pressing.shape.locateCurveHandler(
      //     pressing.curveId,
      //     CurveTypes.PressingTarget.cp1,
      //     p
      //   );
      // }
      // else if (
      //   !!pressing.curveId &&
      //   pressing.direction &&
      //   pressing?.target === CurveTypes.PressingTarget.cp2
      // ) {
      //   pressing.shape.locateCurveHandler(
      //     pressing.curveId,
      //     CurveTypes.PressingTarget.cp2,
      //     p
      //   );

      //   // get cp2 relative to p2 poistion
      //   const curveArrowTopP = pressing.shape.getPressingCurveP(
      //     CurveTypes.PressingTarget.p2,
      //     pressing.curveId
      //   );
      //   const curveCp2 = pressing.shape.getPressingCurveP(
      //     CurveTypes.PressingTarget.cp2,
      //     pressing.curveId
      //   );

      //   if (!curveArrowTopP || !curveCp2) return;

      //   relativeCurveCp2 = {
      //     x: curveArrowTopP.x - curveCp2.x,
      //     y: curveArrowTopP.y - curveCp2.y,
      //   };
      // }
      else if (
        !!pressing.curveId &&
        pressing.direction &&
        pressing?.target === CurveTypes.PressingTarget.p2
      ) {
        let sticking: PageIdTypes.Sticking = {
          bridgeId: null,
          from: {
            d: null,
            shape: null,
          },
          to: {
            d: null,
            shape: null,
          },
        };

        pressing.shape.disConnect([pressing.curveId]);

        shapes.forEach((shape) => {
          const quarterD = shape.checkQuarterArea(p);
          const receivingPointsBoundryD = shape.checkReceivingPointsBoundry(p);

          ds.forEach((d) => {
            shape.setReceivePointActivate(
              d,
              d === receivingPointsBoundryD || d === quarterD
            );
            shape.setReceivePointVisible(
              d,
              shape.checkBoundry(p, 20) && pressing?.shape !== shape
            );
            if (
              !!pressing?.curveId &&
              !!pressing?.direction &&
              !!pressing.shape &&
              (d === receivingPointsBoundryD || d === quarterD) &&
              shape !== pressing?.shape
            ) {
              sticking.bridgeId = pressing?.curveId;
              sticking.from.d = pressing?.direction;
              sticking.from.shape = pressing?.shape;
              sticking.to.d = d;
              sticking.to.shape = shape;
            }
          });
        });

        if (
          !!sticking?.bridgeId &&
          !!sticking?.from.d &&
          !!sticking?.from.shape &&
          !!sticking?.to.d &&
          !!sticking?.to.shape
        ) {
          const directionAdjustments = {
            l: { cp1: { x: -0.5, y: 0 }, cp2: { x: -0.5, y: 0 } },
            t: { cp1: { x: 0, y: -0.5 }, cp2: { x: 0, y: -0.5 } },
            r: { cp1: { x: 0.5, y: 0 }, cp2: { x: 0.5, y: 0 } },
            b: { cp1: { x: 0, y: 0.5 }, cp2: { x: 0, y: 0.5 } },
          };

          const updateControlPoints = (
            fromD: CommonTypes.Direction,
            toD: CommonTypes.Direction,
            fromP: CommonTypes.Vec,
            toP: CommonTypes.Vec
          ) => {
            let cp1, cp2;

            if (
              fromD === CommonTypes.Direction.t ||
              fromD === CommonTypes.Direction.b
            ) {
              cp1 = {
                x:
                  fromP.x +
                  directionAdjustments[fromD].cp1.x * Math.abs(fromP.x - toP.x),
                y:
                  fromP.y +
                  directionAdjustments[fromD].cp1.y * Math.abs(fromP.x - toP.x),
              };
            } else {
              cp1 = {
                x:
                  fromP.x +
                  directionAdjustments[fromD].cp1.x * Math.abs(fromP.x - toP.x),
                y:
                  fromP.y +
                  directionAdjustments[fromD].cp1.y * Math.abs(fromP.y - toP.y),
              };
            }

            if (
              toD === CommonTypes.Direction.t ||
              toD === CommonTypes.Direction.b
            ) {
              cp2 = {
                x:
                  toP.x +
                  directionAdjustments[toD].cp2.x * Math.abs(fromP.x - toP.x),
                y:
                  toP.y +
                  directionAdjustments[toD].cp2.y * Math.abs(fromP.x - toP.x),
              };
            } else {
              cp2 = {
                x:
                  toP.x +
                  directionAdjustments[toD].cp2.x * Math.abs(fromP.x - toP.x),
                y:
                  toP.y +
                  directionAdjustments[toD].cp2.y * Math.abs(fromP.y - toP.y),
              };
            }

            return { cp1, cp2 };
          };

          const handleStick = (
            sticking: PageIdTypes.Sticking,
            fromP: CommonTypes.Vec,
            toP: CommonTypes.Vec
          ) => {
            if (
              !sticking.from.shape ||
              !sticking.bridgeId ||
              sticking.from.d == null ||
              sticking.to.d == null
            ) {
              return;
            }

            const { cp1, cp2 } = updateControlPoints(
              sticking.from.d,
              sticking.to.d,
              fromP,
              toP
            );

            sticking.from.shape.stick(
              sticking.bridgeId,
              toP,
              cp1,
              cp2,
              sticking.to.d
            );

            return true;
          };

          const fromP =
            sticking.from.shape.getCenter().receivingPoints[sticking?.from?.d];
          const toP =
            sticking.to.shape.getCenter().receivingPoints[sticking?.to?.d];

          handleStick(sticking, fromP, toP);
        } else {
          pressing.shape.locateCurveHandler(
            pressing.curveId,
            CurveTypes.PressingTarget.p2,
            p
          );
        }
      }
    }

    if (dbClickedShape) {
      setDataFrame({
        p: getFramePosition(dbClickedShape),
      });
    }

    if (selectAreaP && !space) {
      selectAreaP = {
        ...selectAreaP,
        end: p,
      };
    }

    lastP = p;

    drawCanvas();
    drawScreenshot();
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    setLeftMouseBtn(false);

    const p = {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };

    // define which shape in select area
    const selectedShapes = (() => {
      let shapesInSelectArea: (Terminal | Data | Process | Desicion)[] = [];

      shapes.forEach((shape) => {
        if (!selectAreaP) return;
        const theEdge = shape.getEdge();

        const l =
            selectAreaP.start.x < selectAreaP.end.x
              ? selectAreaP.start.x
              : selectAreaP.end.x,
          t =
            selectAreaP.start.y < selectAreaP.end.y
              ? selectAreaP.start.y
              : selectAreaP.end.y,
          r =
            selectAreaP.start.x > selectAreaP.end.x
              ? selectAreaP.start.x
              : selectAreaP.end.x,
          b =
            selectAreaP.start.y > selectAreaP.end.y
              ? selectAreaP.start.y
              : selectAreaP.end.y;

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
    if (selectedShapes.length === 1) {
      selectedShapes[0].selecting = true;
    } else if (selectedShapes.length > 1) {
      selectedShapes.forEach((selectedShape) => {
        const theEdge = selectedShape.getEdge();
        if (select?.start.x === -1 || theEdge.l < select?.start.x) {
          select.start.x = theEdge.l;
        }
        if (select?.start.y === -1 || theEdge.t < select?.start.y) {
          select.start.y = theEdge.t;
        }
        if (select.end.x === -1 || theEdge.r > select.end.x) {
          select.end.x = theEdge.r;
        }
        if (select.end.y === -1 || theEdge.b > select.end.y) {
          select.end.y = theEdge.b;
        }
        select.shapes.push(selectedShape);
        selectedShape.selecting = false;
      });
    }

    shapes.forEach((targetShape) => {
      if (
        pressing?.shape &&
        !!pressing?.curveId &&
        pressing?.target &&
        pressing?.direction
      ) {
        const pressingShape = pressing.shape;
        const theCheckReceivingPointsBoundryD =
          targetShape.checkReceivingPointsBoundry(p);
        const theQuarterD = targetShape.checkQuarterArea(p);

        if (!pressingShape || pressing.target !== CurveTypes.PressingTarget.p2)
          return;

        if (!!theCheckReceivingPointsBoundryD) {
          pressingShape.connect(
            targetShape,
            theCheckReceivingPointsBoundryD,
            pressing.curveId
          );
        } else if (!!theQuarterD) {
          pressingShape.connect(targetShape, theQuarterD, pressing.curveId);
        }

        let relocateP: null | CommonTypes.Vec = null;
        switch (theCheckReceivingPointsBoundryD || theQuarterD) {
          case CommonTypes.Direction.l:
            if (targetShape instanceof Data) {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.l.x - 6,
                y: targetShape.getCenter().receivingPoints.l.y,
              };
            } else {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.l.x - 6,
                y: targetShape.getCenter().receivingPoints.l.y,
              };
            }
            break;
          case CommonTypes.Direction.t:
            if (targetShape instanceof Data) {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.t.x,
                y: targetShape.getCenter().receivingPoints.t.y - 6,
              };
            } else {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.t.x,
                y: targetShape.getCenter().receivingPoints.t.y - 6,
              };
            }
            break;
          case CommonTypes.Direction.r:
            if (targetShape instanceof Data) {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.r.x - 6,
                y: targetShape.getCenter().receivingPoints.r.y,
              };
            } else {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.r.x + 6,
                y: targetShape.getCenter().receivingPoints.r.y,
              };
            }
            break;
          case CommonTypes.Direction.b:
            if (targetShape instanceof Data) {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.b.x,
                y: targetShape.getCenter().receivingPoints.b.y + 6,
              };
            } else {
              relocateP = {
                x: targetShape.getCenter().receivingPoints.b.x,
                y: targetShape.getCenter().receivingPoints.b.y + 6,
              };
            }
            break;
        }

        // if (!!relocateP) {
        //   pressingShape.locateCurveHandler(
        //     pressing.curveId,
        //     CurveTypes.PressingTarget.p2,
        //     relocateP
        //   );
        // } // TODO: temprarily closed
      }
    });

    shapes.forEach((shape) => {
      ds.forEach((d) => {
        shape.setReceivePointVisible(d, false);
      });
    });

    checkData(shapes);
    checkGroups();

    selectAreaP = null;
    pressing = null;

    drawCanvas();
  };

  const onMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    zoom(e.deltaY, { x: e.clientX, y: e.clientY });
    drawCanvas();
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
            p: getFramePosition(shape),
          });
        }
      });
    },
    []
  );

  function handleKeyDown(this: Window, e: KeyboardEvent) {
    // space
    if (e.key === " " && !space) {
      setSpace(true);
    } else if (e.key === "Backspace" && !dataFrame && !dbClickedShape) {
      const $canvas = document.querySelector("canvas");
      if (!$canvas || !ctx) return;

      // delete
      for (const currentShape of shapes) {
        if (currentShape.selecting) {
          currentShape?.removeConnection();
          shapes = shapes.filter((shape) => shape.id !== currentShape?.id);
        } else {
          ds.forEach((d) => {
            currentShape.curves[d].forEach((currentCurve) => {
              if (!currentCurve.shape?.selecting) return;
              currentShape.removeCurve(d, currentCurve.shape.id);
            });
          });
        }
      }

      drawCanvas();
      drawScreenshot();
    }
  }

  function handleKeyUp(this: Window, e: KeyboardEvent) {
    if (e.key === " " && space) {
      setSpace(false);
    }
  }

  const onClickShapeButton = (
    e: React.MouseEvent<HTMLButtonElement>,
    type: CommonTypes.Type
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isBrowser) return;

    let intiShape = getInitializedShape(type, offset, offset_center);
    intiShape.offset = offset;
    intiShape.scale = scale;
    shapes.push(intiShape);

    checkData(shapes);
    checkGroups();
    drawCanvas();
    drawScreenshot();
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
    zoom(-100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
    drawCanvas();
  };

  const onClickScaleMinusIcon = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    zoom(100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
    drawCanvas();
  };

  const onClickScaleNumber = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas) return;
    zoom(-((1 / scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
    drawCanvas();
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

  const draw = useCallback(
    (
      $canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      shapes: (Terminal | Process | Data | Desicion)[],
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

      // // draw shapes
      shapes.forEach((shape) => {
        if (!ctx) return;
        shape.draw(ctx);
      });

      if (!isScreenshot) {
        // draw sending point
        shapes.forEach((shape) => {
          if (!ctx || !shape.selecting) return;
          if (
            shape instanceof Terminal ||
            shape instanceof Process ||
            shape instanceof Data ||
            (shape instanceof Desicion &&
              !(shape.getText().y && shape.getText().n))
          ) {
            shape.drawSendingPoint(ctx);
          }
        });
      }

      // draw curves in shapes
      shapes.forEach((shape) => {
        if (!ctx) return;

        shape.drawCurve(ctx);
      });

      if (!isScreenshot) {
        // draw selectArea
        if (selectAreaP) {
          ctx?.beginPath();

          ctx.fillStyle = "#2436b155";
          ctx.fillRect(
            selectAreaP?.start.x,
            selectAreaP?.start.y,
            selectAreaP?.end.x - selectAreaP?.start.x,
            selectAreaP?.end.y - selectAreaP?.start.y
          );

          ctx.strokeStyle = "#2436b1";
          ctx.strokeRect(
            selectAreaP?.start.x,
            selectAreaP?.start.y,
            selectAreaP?.end.x - selectAreaP?.start.x,
            selectAreaP?.end.y - selectAreaP?.start.y
          );

          ctx?.closePath();
        }
      }

      if (!isScreenshot) {
        shapes.forEach((shape) => {
          shape.drawRecievingPoint(ctx);
        });
      }

      if (select.shapes.length > 1 && !isScreenshot) {
        // draw select area
        ctx?.beginPath();
        ctx.strokeStyle = tailwindColors.info["500"];
        ctx.lineWidth = 1;
        ctx.strokeRect(
          select.start.x,
          select.start.y,
          select.end.x - select.start.x,
          select.end.y - select.start.y
        );
        ctx?.closePath();

        // draw select area anchors
        ctx.fillStyle = "white";
        ctx.lineWidth = selectAnchor.size.stroke;

        ctx?.beginPath();
        ctx.arc(
          select.start.x,
          select.start.y,
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
          select.end.x,
          select.start.y,
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
          select.end.x,
          select.end.y,
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
          select.start.x,
          select.end.y,
          selectAnchor.size.fill,
          0,
          2 * Math.PI,
          false
        ); // left, bottom
        ctx.stroke();
        ctx.fill();
        ctx?.closePath();
      }
    },
    []
  );

  const drawCanvas = () => {
    const $canvas = document.querySelector("canvas");
    if (!$canvas || !ctx) return;
    draw($canvas, ctx, shapes, false);
  };

  const drawScreenshot = () => {
    const $screenshot: HTMLCanvasElement | null = document.querySelector(
      "canvas[role='screenshot']"
    );
    if (!$screenshot || !ctx_screenshot) return;
    draw($screenshot, ctx_screenshot, getScreenshotShapes(shapes), true);
  };

  const onClickStep = (shapeP: CommonTypes.Vec) => {
    if (!isBrowser) return;

    offset = {
      x: offset_center.x + (window.innerWidth / 2 - shapeP.x),
      y: offset_center.y + (window.innerHeight / 2 - shapeP.y),
    };

    shapes.forEach((shape) => {
      shape.offset = offset;
    });

    drawCanvas();
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

          ds.forEach((d) => {
            shape.curves[d].forEach((curve) => {
              curves[d].push(curve.shape?.id);

              modifyData.curves[curve.shape?.id] = {
                p1: curve.shape.p1,
                p2: curve.shape.p2,
                cp1: curve.shape.cp1,
                cp2: curve.shape.cp2,
                sendTo: curve.sendTo
                  ? {
                      id: curve.sendTo.shape.id,
                      d: curve.sendTo.d,
                    }
                  : null,
              };
            });
          });

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
      offset_center = cloneDeep(init.offset);
      const initShapes = getInitializedShapes(
        projectData.orders,
        projectData.shapes,
        projectData.curves,
        projectData.data
      );
      shapes = initShapes;
      select = cloneDeep(init.select);
      checkData(shapes);
      checkGroups();
      drawCanvas();
      drawScreenshot();
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

      drawCanvas();
      drawScreenshot();
    })();

    const resize = () => {
      const $canvas = document.querySelector("canvas");
      const $screenshot: HTMLCanvasElement | null = document.querySelector(
        "canvas[role='screenshot']"
      );
      if (!isBrowser || !$canvas || !$screenshot) return;
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      $screenshot.width = window.innerWidth;
      $screenshot.height = window.innerHeight;
      drawCanvas();
      drawScreenshot();
    };

    window.addEventListener("resize", resize);
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    });

    return () => {
      if (!isBrowser) return;
      window.removeEventListener("resize", resize);
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
  }, [dataFrame, dbClickedShape, space, steps]);

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
          {Object.entries(steps).map(([stepId, step], stepI) => {
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
                  if ((e as any).key === " ") {
                    // 确保只在按下空格键时阻止默认行为
                    e.preventDefault();
                    e.stopPropagation(); // 确保事件不传播
                  }
                  onClickShapeButton(e, createShapeButton.type);
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
