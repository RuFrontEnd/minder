// TODO: 支援多個 recieve set W 時, 跟隨錯誤 / 更換新增 shape icon / 取消 title 重名檢查 / 終點 terminator 要判斷是否沒有接收到其他 shape(要做錯誤題示) / core shape sendTo 搬遷至 curves sendTo / 雙擊 cp1 || cp2 可自動對位  / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 對齊功能
"use client";
import axios, { AxiosResponse } from "axios";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Curve from "@/shapes/curve";
import Desicion from "@/shapes/decision";
import DataFrame from "@/components/dataFrame";
import SidePanel from "@/components/sidePanel";
import Accordion from "@/components/accordion";
import Button from "@/components/button";
import Modal from "@/components/modal";
import Input from "@/components/input";
import Alert from "@/components/alert";
import Card from "@/components/card";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cloneDeep } from "lodash";
import { v4 as uuidv4 } from "uuid";
import { ChangeEventHandler, MouseEventHandler } from "react";
import { tailwindColors } from "@/variables/colors";
import * as authAPIs from "@/apis/auth";
import * as projectAPIs from "@/apis/project";
import * as shapeAPIs from "@/apis/shapes";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/shapes/common";
import * as PageTypes from "@/types/app/page";
import * as DataFrameTypes from "@/types/components/dataFrame";
import * as InputTypes from "@/types/components/input";
import * as AlertTypes from "@/types/components/alert";
import * as AuthTypes from "@/types/apis/auth";
import * as ProjectAPITypes from "@/types/apis/project";
import * as ShapeAPITypes from "@/types/apis/shape";
import * as ProjectTypes from "@/types/project";

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
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  pressing: null | {
    parent: null | Terminal | Process | Data | Desicion;
    shape: null | Terminal | Process | Data | Desicion | Curve;
    direction: null | CommonTypes.Direction;
    target:
      | null
      | CoreTypes.PressingTarget
      | CurveTypes.PressingTarget
      | "selectArea_m"
      | "selectArea_lt"
      | "selectArea_rt"
      | "selectArea_rb"
      | "selectArea_lb";
    dx: number; // distance between event px & pressing shape px
    dy: number; // distance between event py & pressing shape py
  } = null,
  offset: CommonTypes.Vec = cloneDeep(init.offset),
  offset_center: CommonTypes.Vec = cloneDeep(init.offset),
  dragP: CommonTypes.Vec = { x: 0, y: 0 },
  moveP: null | {
    originalX: number;
    originalY: number;
    x: number;
    y: number;
  } = null,
  alignment: {
    offset: number;
    p: null | CommonTypes.Vec;
  } = {
    offset: 5,
    p: null,
  },
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

const getInitializedShapes = (data: ShapeAPITypes.GetShapes["resData"]) => {
  const shapeMappings: {
    [shapeId: string]: Terminal | Process | Data | Desicion;
  } = {};

  const dataShapes = Object.entries(data.shapes);

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
            text: data.data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newTerminator.deletedData.push({
            id: dataId,
            text: data.data[dataId],
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
            text: data.data[dataId],
          });
        });

        info.selectedData.forEach((dataId) => {
          newData.selectedData.push({
            id: dataId,
            text: data.data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newData.deletedData.push({
            id: dataId,
            text: data.data[dataId],
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
            text: data.data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newProcess.deletedData.push({
            id: dataId,
            text: data.data[dataId],
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
            text: data.data[dataId],
          });
        });

        info.deletedData.forEach((dataId) => {
          newDesicion.deletedData.push({
            id: dataId,
            text: data.data[dataId],
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
        const curveInfo = data.curves[curveId];

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

  return data.orders.map((orderId) => shapeMappings[orderId]);
};

const Editor = (props: { className: string; shape: Core }) => {
  const [title, setTitle] = useState<CommonTypes.Title>(""),
    [selections, setSelections] = useState<DataFrameTypes.Selections>({}),
    [data, setData] = useState<CommonTypes.Data>([]);

  const onChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.currentTarget.value);
  };

  const onClickCheckedBox = (DataText: CommonTypes.DataItem["text"]) => {
    const _selections: DataFrameTypes.Selections = cloneDeep(selections);

    _selections[DataText] = !_selections[DataText];

    setSelections(_selections);
  };

  const onClickPlus = () => {
    const _data = cloneDeep(data);
    _data.push({ id: uuidv4(), text: "" });
    setData(_data);
  };

  const onClickMinus = (id: string) => {
    const _data = cloneDeep(data).filter((datdItem) => datdItem.id !== id);
    setData(_data);
  };

  const onChangeData = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const _data = cloneDeep(data);
    _data[i].text = e.currentTarget.value;
    setData(_data);
  };

  const onClickConfirm = () => {
    const selectedData = (() => {
      const data: CommonTypes.Data = [];

      props.shape.options.forEach((option) => {
        if (selections[option.text]) {
          data.push(option);
        }
      });

      props.shape.redundancies.forEach((option) => {
        if (selections[option.text]) {
          data.push(option);
        }
      });

      return data;
    })();

    // onConfirm(title, data, selectedData);
  };

  useEffect(() => {
    setTitle(props.shape.title);

    const _selections: DataFrameTypes.Selections = (() => {
      const output: DataFrameTypes.Selections = {};

      props.shape.options.forEach((option) => {
        output[option.text] = false;
      });

      props.shape.selectedData.forEach((selectedDataItem) => {
        output[selectedDataItem.text] = true;
      });

      return output;
    })();

    setSelections(_selections);

    if (props.shape instanceof Data) {
      setData(props.shape.data);
    }
  }, [props.shape]);

  return (
    <div className={props.className && props.className}>
      <div>
        {props.shape instanceof Data && (
          <div>
            <p className="mb-1">Data</p>
            {/* <div
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickScalePlusIcon}
            >
              +
            </div> */}
            <ul className="ps-2">
              {props.shape.data.map((dataItem) => (
                <li className="mb-1"> · {dataItem.text}</li>
              ))}
            </ul>
          </div>
        )}
        {(props.shape instanceof Process ||
          props.shape instanceof Data ||
          props.shape instanceof Desicion) && (
          <>
            <div>
              <p className="mb-1">Data Usage</p>
              <ul className="ps-2">
                {props.shape.options.map((option) => (
                  <li className="mb-1">
                    <span className="bg-indigo-100 text-indigo-500 w-4 h-4 rounded-full inline-flex items-center justify-center">
                      {selections[option.text] && (
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      )}
                    </span>
                    {option.text}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1">Redundancies</div>
              <ul className="ps-2">
                {props.shape.redundancies.map((redundancy) => (
                  <li className="mb-1"> · {redundancy.text}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function ProcessPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);
  const qas = isBrowser && window.location.href.includes("qas");

  const [dataFrame, setDataFrame] = useState<
      { p: CommonTypes.Vec } | undefined
    >(undefined),
    [dbClickedShape, setDbClickedShape] = useState<
      Terminal | Data | Process | Desicion | null
    >(null),
    [space, setSpace] = useState(false),
    [scale, setScale] = useState(1),
    [leftMouseBtn, setLeftMouseBtn] = useState(false),
    [isDataSidePanelOpen, setIsDataSidePanelOpen] = useState(true),
    [isUserSidePanelOpen, setIsUserSidePanelOpen] = useState(false),
    [steps, setSteps] = useState<PageTypes.Steps>({}),
    [procedures, setProcedures] = useState<PageTypes.Procedures>({}),
    [otherStepIds, setOtherStepIds] = useState<PageTypes.OtherStepIds>([]),
    [dataFrameWarning, setDataFrameWarning] = useState<DataFrameTypes.Warning>(
      init.dataFrameWarning
    ),
    [isAccountModalOpen, setIsAccountModalOpen] = useState(false),
    [isLogIn, setIsLogin] = useState(true),
    [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false),
    [authInfo, setAuthInfo] = useState<{
      account: {
        value: undefined | string;
        status: InputTypes.Status;
        comment: undefined | string;
      };
      password: {
        value: undefined | string;
        status: InputTypes.Status;
        comment: undefined | string;
      };
      email: {
        value: undefined | string;
        status: InputTypes.Status;
        comment: undefined | string;
      };
    }>(init.authInfo),
    [isAuthorizing, setIsAuthorizing] = useState(false),
    [authMessage, setAuthMessage] = useState({
      status: AlertTypes.Type.succeess,
      text: "",
    }),
    [isFetchingProjects, setIsFetchingProjects] = useState(false),
    [projects, setProjects] = useState<ProjectAPITypes.GetProjects["resData"]>(
      []
    ),
    [selectedProjectId, setSelectedProjectId] = useState<
      null | ProjectTypes.Project["id"]
    >(null),
    [hasEnter, setHasEnter] = useState(false);

  const checkData = () => {
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
          // console.log('shape', shape)
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

  const verifyToken = async () => {
    if (qas) {
      setIsAccountModalOpen(true);
      return;
    }

    const token = localStorage.getItem("Authorization");

    if (token) {
      const res: AxiosResponse<AuthTypes.JWTLogin["resData"]> =
        await authAPIs.jwtLogin(token);

      if (res.data.isPass) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setIsLogin(false);
        const res: AxiosResponse<ProjectAPITypes.GetProjects["resData"], any> =
          await projectAPIs.getProjecs();
        setProjects(res.data);
        setIsProjectsModalOpen(true);
      } else {
        setIsAccountModalOpen(true);
      }
    } else {
      setIsAccountModalOpen(true);
    }
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!$canvas || !ctx) return;

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
        p.y < select.end.y + selectAnchor.size.fill,
      isPInMultiSelectArea =
        pInSelectArea ||
        pInSelectArea_lt ||
        pInSelectArea_rt ||
        pInSelectArea_rb ||
        pInSelectArea_lb;

    if (space) {
      dragP = p;
    } else {
      if (select.shapes.length > 1) {
        // when multi select shapes
        let _target:
          | null
          | "selectArea_m"
          | "selectArea_lt"
          | "selectArea_rt"
          | "selectArea_rb"
          | "selectArea_lb" = null;

        select.shapes.forEach((shape) => {
          if (!$canvas) return;

          if (shape.checkBoundry(p)) {
            _target = "selectArea_m";
          }
        });

        if (pInSelectArea_lt) {
          _target = "selectArea_lt";
        } else if (pInSelectArea_rt) {
          _target = "selectArea_rt";
        } else if (pInSelectArea_rb) {
          _target = "selectArea_rb";
        } else if (pInSelectArea_lb) {
          _target = "selectArea_lb";
        }

        if (_target) {
          pressing = {
            parent: null,
            shape: null,
            target: _target,
            direction: null,
            dx: 0,
            dy: 0,
          };
        } else {
          select = {
            start: {
              x: -1,
              y: -1,
            },
            end: {
              x: -1,
              y: -1,
            },
            shapes: [],
          };
        }
      } else {
        // when single select shape
        shapes.forEach((shape) => {
          if (!$canvas) return;

          // onMouseDown curve trigger point and create curve

          const triggerD = shape.getCurveTriggerDirection(p);
          if (triggerD) {
            shape.selecting = false;

            shape.initializeCurve(
              `curve_${Date.now()}`,
              CommonTypes.Direction[triggerD]
            );
          }

          // drag curve
          ds.forEach((d) => {
            shape.curves[d].forEach((curveInShape) => {
              const theCurve = curveInShape.shape;

              const curveP = {
                x: p.x - shape?.getScreenP().x,
                y: p.y - shape?.getScreenP().y,
              };

              if (!theCurve) return;
              if (
                theCurve.checkBoundry(curveP) ||
                theCurve.checkControlPointsBoundry(curveP)
              ) {
                if (theCurve.checkBoundry(curveP)) {
                  pressing = {
                    parent: shape,
                    shape: theCurve,
                    target: null,
                    direction: d,
                    dx: 0,
                    dy: 0,
                  };
                }

                if (theCurve.checkControlPointsBoundry(curveP)) {
                  pressing = {
                    parent: shape,
                    shape: theCurve,
                    target: theCurve.checkControlPointsBoundry(curveP),
                    direction: d,
                    dx: 0,
                    dy: 0,
                  };
                }
              } else {
                theCurve.selecting = false;
              }
            });
          });
        });

        // if has already selected curve, never select any other shapes
        if (!(pressing?.shape instanceof Curve)) {
          // onMouseDown shape conditions
          shapes.forEach((shape) => {
            if (!$canvas) return;

            // onMouseDown shape
            if (shape.checkBoundry(p) && select.shapes.length === 0) {
              pressing = {
                parent: null,
                shape: shape,
                target: CoreTypes.PressingTarget.m,
                direction: null,
                dx: (p.x - dragP.x) * (1 / scale) - shape?.getScreenP().x,
                dy: (p.y - dragP.y) * (1 / scale) - shape?.getScreenP().y,
              };
            }

            // onMouseDown corner point and create curve
            const theCheckShapeVertexesBoundry = shape.checkVertexesBoundry(p);
            if (theCheckShapeVertexesBoundry && select.shapes.length <= 1) {
              pressing = {
                parent: null,
                shape: shape,
                target: theCheckShapeVertexesBoundry,
                direction: null,
                dx:
                  (p.x - dragP.x) * (1 / scale) -
                  shape?.getEdge()[
                    theCheckShapeVertexesBoundry[0] as CommonTypes.Direction
                  ],
                dy:
                  (p.y - dragP.y) * (1 / scale) -
                  shape?.getEdge()[
                    theCheckShapeVertexesBoundry[1] as CommonTypes.Direction
                  ],
              };
            }
          });
        }
      }

      // close selected status when click the blank area

      shapes.forEach((shape) => {
        if (pressing?.shape instanceof Curve) {
          // click curve
          shape.selecting = false;

          ds.forEach((d) => {
            for (const curveInShape of shape.curves[d]) {
              const theCurve = curveInShape.shape;
              if (theCurve && theCurve?.id !== pressing?.shape?.id) {
                theCurve.selecting = false;
              }
            }
          });
        } else {
          // click shape or blank area
          ds.forEach((d) => {
            for (const curveInShape of shape.curves[d]) {
              const theCurve = curveInShape.shape;
              if (theCurve) {
                theCurve.selecting = false;
              }
            }

            if (shape.id !== pressing?.shape?.id) {
              shape.selecting = false;
            }
          });
        }
      });

      if (pressing?.shape) {
        pressing.shape.selecting = true;
      } else {
        if (select.shapes.length > 0 && isPInMultiSelectArea) return;
        selectAreaP = {
          start: p,
          end: p,
        };
      }
    }

    draw($canvas, ctx);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!$canvas || !ctx) return;

    const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
      offsetP = {
        x: p.x - dragP.x,
        y: p.y - dragP.y,
      },
      screenOffsetP = {
        x: (p.x - dragP.x) * (1 / scale),
        y: (p.y - dragP.y) * (1 / scale),
      };

    const movingCanvas = space && leftMouseBtn;

    if (movingCanvas) {
      setDataFrame(undefined);
      offset.x += screenOffsetP.x;
      offset.y += screenOffsetP.y;
      shapes.forEach((shape) => {
        shape.offset = offset;
      });
    }

    if (pressing?.target && pressing?.shape) {
      if (
        pressing.shape instanceof Terminal ||
        pressing.shape instanceof Process ||
        pressing.shape instanceof Data ||
        pressing.shape instanceof Desicion
      ) {
        if (pressing?.target === CoreTypes.PressingTarget.lt) {
          pressing.shape.resize(offsetP, CoreTypes.PressingTarget.lt);
        } else if (pressing?.target === CoreTypes.PressingTarget.rt) {
          pressing.shape.resize(offsetP, CoreTypes.PressingTarget.rt);
        } else if (pressing?.target === CoreTypes.PressingTarget.rb) {
          pressing.shape.resize(offsetP, CoreTypes.PressingTarget.rb);
        } else if (pressing?.target === CoreTypes.PressingTarget.lb) {
          pressing.shape.resize(offsetP, CoreTypes.PressingTarget.lb);
        } else if (
          pressing?.target === CoreTypes.PressingTarget.m &&
          select.shapes.length === 0
        ) {
          pressing.shape.move(p, dragP);
        }
      } else if (pressing.shape instanceof Curve) {
        if (
          pressing?.target === CurveTypes.PressingTarget.p2 &&
          pressing?.parent &&
          pressing?.direction
        ) {
          pressing.parent.disConnect(pressing.parent, [pressing.shape.id]);

          shapes.forEach((shape) => {
            if (!ctx) return;
            const theEdge = shape.getEdge(),
              threshold = 20,
              isNearShape =
                p.x >= theEdge.l - threshold &&
                p.y >= theEdge.t - threshold &&
                p.x <= theEdge.r + threshold &&
                p.y <= theEdge.b + threshold;

            for (const d of ds) {
              shape.receiving[d] = isNearShape;
            }
          });
        }
        if (
          (pressing.target !== CurveTypes.PressingTarget.cp1 &&
            pressing.target !== CurveTypes.PressingTarget.cp2 &&
            pressing.target !== CurveTypes.PressingTarget.p2) ||
          !pressing.parent
        )
          return;
        const curveP = {
          x: p.x - pressing.parent?.getScreenP().x,
          y: p.y - pressing.parent?.getScreenP().y,
        };
        pressing.shape.moveHandler(pressing.target, curveP);
      }
    } else if (select.shapes.length > 0) {
      // multi select
      if (space && leftMouseBtn) {
        select.start.x += offsetP.x;
        select.start.y += offsetP.y;
        select.end.x += offsetP.x;
        select.end.y += offsetP.y;
      } else {
        const theSelect = {
          w: Math.abs(select.end.x - select.start.x),
          h: Math.abs(select.end.y - select.start.y),
        };

        if (pressing?.target === "selectArea_m") {
          select.shapes.forEach((shape) => {
            shape.move(p, dragP);
          });

          select.start.x += offsetP.x;
          select.start.y += offsetP.y;
          select.end.x += offsetP.x;
          select.end.y += offsetP.y;
        } else if (pressing?.target === "selectArea_lt") {
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
        } else if (pressing?.target === "selectArea_rt") {
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
        } else if (pressing?.target === "selectArea_rb") {
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
        } else if (pressing?.target === "selectArea_lb") {
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

    dragP = p;

    draw($canvas, ctx);
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!$canvas || !ctx) return;

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

    shapes.forEach((shape) => {
      if (
        pressing?.shape &&
        pressing.shape instanceof Curve &&
        pressing?.target &&
        pressing?.parent &&
        pressing?.direction
      ) {
        const theCheckReceivingPointsBoundryD =
          shape.checkReceivingPointsBoundry(p);

        const pressingShape = pressing.parent;

        if (!theCheckReceivingPointsBoundryD || !pressingShape) return;

        const relocateP2 = (() => {
          if (shape instanceof Data) {
            return (
              bridge: {
                d: CommonTypes.Direction;
                curve: CoreTypes.SendCurve;
              },
              targetShapeReceiveD: CommonTypes.Direction
            ) => {
              if (targetShapeReceiveD === CommonTypes.Direction.l) {
                bridge.curve.shape.p2 = {
                  x:
                    shape.p.x -
                    pressingShape.p.x +
                    (shape.getCorner().normal.tl.x +
                      shape.getCorner().normal.bl.x) /
                      2 -
                    6,
                  y: shape.p.y - pressingShape.p.y,
                };
              } else if (targetShapeReceiveD === CommonTypes.Direction.t) {
                bridge.curve.shape.p2 = {
                  x: shape.p.x - pressingShape.p.x,
                  y: shape.p.y - pressingShape.p.y - shape.h / 2 - 6,
                };
              } else if (targetShapeReceiveD === CommonTypes.Direction.r) {
                bridge.curve.shape.p2 = {
                  x:
                    shape.p.x -
                    pressingShape.p.x -
                    (shape.getCorner().normal.tl.x +
                      shape.getCorner().normal.bl.x) /
                      2 +
                    6,
                  y: shape.p.y - pressingShape.p.y,
                };
              } else if (targetShapeReceiveD === CommonTypes.Direction.b) {
                bridge.curve.shape.p2 = {
                  x: shape.p.x - pressingShape.p.x,
                  y: shape.p.y - pressingShape.p.y + shape.h / 2 + 6,
                };
              }
            };
          }

          return;
        })();

        pressingShape.connect(
          shape,
          theCheckReceivingPointsBoundryD,
          pressing.shape.id,
          relocateP2
        );
      }

      shape.receiving = {
        l: false,
        t: false,
        r: false,
        b: false,
      };
    });

    checkData();
    checkGroups();

    selectAreaP = null;
    pressing = null;
    moveP = null;

    draw($canvas, ctx);
  };

  const onMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!$canvas || !ctx) return;
    zoom(e.deltaY, { x: e.clientX, y: e.clientY });
    draw($canvas, ctx);
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

      draw($canvas, ctx);
    }
  }

  function handleKeyUp(this: Window, e: KeyboardEvent) {
    if (e.key === " " && space) {
      setSpace(false);
    }
  }

  const onClickTerminator = () => {
    if (!isBrowser || !$canvas || !ctx) return;

    let terminal = new Terminal(
      `terminator_s_${Date.now()}`,
      init.shape.size.t.w,
      init.shape.size.t.h,
      {
        x: -offset.x + window.innerWidth / 2 + offset_center.x,
        y: -offset.y + window.innerHeight / 2 + offset_center.y,
      },
      "terminator_start"
    );
    terminal.offset = offset;
    terminal.scale = scale;

    shapes.push(terminal);
    checkData();
    checkGroups();
    draw($canvas, ctx);
  };

  const onClickProcess = () => {
    if (!isBrowser || !$canvas || !ctx) return;

    let process_new = new Process(
      `process_${Date.now()}`,
      init.shape.size.p.w,
      init.shape.size.p.h,
      {
        x: -offset.x + window.innerWidth / 2 + offset_center.x,
        y: -offset.y + window.innerHeight / 2 + offset_center.y,
      },
      "process"
    );
    process_new.offset = offset;
    process_new.scale = scale;

    shapes.push(process_new);
    checkData();
    checkGroups();
    draw($canvas, ctx);
  };

  const onClickData = () => {
    if (!isBrowser || !$canvas || !ctx) return;

    let data_new = new Data(
      `data_${Date.now()}`,
      init.shape.size.d.w,
      init.shape.size.d.h,
      {
        x: -offset.x + window.innerWidth / 2 + offset_center.x,
        y: -offset.y + window.innerHeight / 2 + offset_center.y,
      },
      "data"
    );
    data_new.scale = scale;
    data_new.offset = offset;

    shapes.push(data_new);
    checkData();
    checkGroups();
    draw($canvas, ctx);
  };

  const onClickDecision = () => {
    if (!isBrowser || !$canvas || !ctx) return;

    let decision_new = new Desicion(
      `decision_${Date.now()}`,
      init.shape.size.dec.w,
      init.shape.size.dec.h,
      {
        x: -offset.x + window.innerWidth / 2 + offset_center.x,
        y: -offset.y + window.innerHeight / 2 + offset_center.y,
      },
      "decision"
    );
    decision_new.offset = offset;
    decision_new.scale = scale;

    shapes.push(decision_new);
    checkData();
    checkGroups();
    draw($canvas, ctx);
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
    checkData();
    checkGroups();
  };

  const onClickScalePlusIcon = () => {
    if (!$canvas || !ctx) return;
    zoom(-100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
    draw($canvas, ctx);
  };

  const onClickScaleMinusIcon = () => {
    if (!$canvas || !ctx) return;
    zoom(100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
    draw($canvas, ctx);
  };

  const onClickScaleNumber = () => {
    if (!$canvas || !ctx) return;
    zoom(-((1 / scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
    draw($canvas, ctx);
  };

  const onClickDataSidePanelSwitch = () => {
    setIsDataSidePanelOpen((open) => !open);
  };

  const onClickProfile = () => {
    setIsProjectsModalOpen(true);
  };

  const draw = useCallback(
    ($canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      if (!isBrowser) return;
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // draw background
      ctx?.beginPath();
      ctx.fillStyle = "#F6F7FA";
      ctx?.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx?.closePath();

      // draw shapes
      shapes.forEach((shape) => {
        if (!ctx) return;
        shape.draw(ctx);
      });

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

      // draw curves in shapes
      shapes.forEach((shape) => {
        if (!ctx) return;

        shape.drawCurve(ctx);
      });

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

      shapes.forEach((shape) => {
        shape.drawRecievingPoint(ctx);
      });

      if (select.shapes.length > 1) {
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
    [otherStepIds]
  );

  const onClickaAccordionArrow = (shapeId: string) => {
    const _steps = cloneDeep(steps);
    _steps[shapeId].open = !_steps[shapeId].open;
    setSteps(_steps);
  };

  const onClickStep = (shapeP: CommonTypes.Vec) => {
    if (!isBrowser || !$canvas || !ctx) return;

    offset = {
      x: offset_center.x + (window.innerWidth / 2 - shapeP.x),
      y: offset_center.y + (window.innerHeight / 2 - shapeP.y),
    };

    shapes.forEach((shape) => {
      shape.offset = offset;
    });

    draw($canvas, ctx);
  };

  const onClickChangeAuthButton = (_isLogining: boolean) => {
    setIsLogin(_isLogining);
    setAuthInfo(init.authInfo);
  };

  const onClickLoginButton = async () => {
    if (qas) {
      setIsAccountModalOpen(false);
      setAuthInfo(init.authInfo);
      setIsProjectsModalOpen(true);
      return;
    }

    const _authInfo = cloneDeep(authInfo);
    if (!authInfo.account.value) {
      _authInfo.account.status = InputTypes.Status.error;
      _authInfo.account.comment = "required field.";
    }
    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
    }

    if (!authInfo.account.value || !authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "required field.";
      setAuthInfo(_authInfo);
      return;
    }

    setIsAuthorizing(true);

    const res: AxiosResponse<AuthTypes.Login["resData"], any> =
      await authAPIs.login(authInfo.account.value, authInfo.password.value);

    if (res.status === 201) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.token}`;
      localStorage.setItem("Authorization", res.data.token);
      setTimeout(() => {
        setAuthMessage({
          status: AlertTypes.Type.succeess,
          text: res.data.message,
        });
        setIsAuthorizing(false);
        setTimeout(async () => {
          setIsLogin(true);
          setAuthMessage((authMessage) => ({
            ...authMessage,
            text: "",
          }));
          setIsAccountModalOpen(false);
          setAuthInfo(init.authInfo);
          const res: AxiosResponse<
            ProjectAPITypes.GetProjects["resData"],
            any
          > = await projectAPIs.getProjecs();
          setProjects(res.data);
          setIsProjectsModalOpen(true);
        }, 1000);
      }, 500);
    } else {
      setTimeout(() => {
        setIsAuthorizing(false);
        setAuthMessage({
          status: AlertTypes.Type.error,
          text: res.data.message,
        });
      }, 1000);
    }
  };

  const onClickSignUpButton = async () => {
    if (qas) return;
    const _authInfo = cloneDeep(authInfo);

    const isPasswordLengthGreaterThanSix =
        authInfo.password.value && authInfo.password.value?.length >= 6,
      isEmailFormatValid =
        authInfo.email.value &&
        new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(
          authInfo.email.value
        );

    if (!authInfo.account.value) {
      _authInfo.account.status = InputTypes.Status.error;
      _authInfo.account.comment = "required field.";
    } else {
      _authInfo.account.status = InputTypes.Status.normal;
      _authInfo.account.comment = "";
    }

    if (!authInfo.password.value) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment = "required field.";
    } else if (!isPasswordLengthGreaterThanSix) {
      _authInfo.password.status = InputTypes.Status.error;
      _authInfo.password.comment =
        "length should be greater than 6 characters.";
    } else {
      _authInfo.password.status = InputTypes.Status.normal;
      _authInfo.password.comment = "";
    }

    if (!authInfo.email.value) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "requied field.";
    } else if (!isEmailFormatValid) {
      _authInfo.email.status = InputTypes.Status.error;
      _authInfo.email.comment = "invalid email format.";
    } else {
      _authInfo.email.status = InputTypes.Status.normal;
      _authInfo.email.comment = "";
    }

    setAuthInfo(_authInfo);

    if (
      !isPasswordLengthGreaterThanSix ||
      !isEmailFormatValid ||
      !authInfo.account.value ||
      !authInfo.password.value ||
      !authInfo.email.value
    )
      return;

    setIsAuthorizing(true);

    const res: AxiosResponse<AuthTypes.Register["resData"], any> =
      await authAPIs.register(
        authInfo.account.value,
        authInfo.password.value,
        authInfo.email.value
      );

    if (res.status === 201) {
      setTimeout(() => {
        setAuthMessage({
          status: AlertTypes.Type.succeess,
          text: res.data.message,
        });
        setIsAuthorizing(false);
        setAuthInfo(init.authInfo);
        setTimeout(() => {
          setIsLogin(true);
          setAuthMessage((authMessage) => ({
            ...authMessage,
            text: "",
          }));
        }, 1500);
      }, 1000);
    } else {
      setTimeout(() => {
        setIsAuthorizing(false);
        setAuthMessage({
          status: AlertTypes.Type.error,
          text: res.data.message,
        });
      }, 1000);
    }
  };

  const onChangeAccount: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.account.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.password.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = (e) => {
    const _authInfo = cloneDeep(authInfo);
    _authInfo.email.value = e.target.value;
    setAuthInfo(_authInfo);
  };

  const onClickSaveButton: MouseEventHandler<HTMLSpanElement> = () => {
    if (selectedProjectId === null) return;
    const modifyData: ShapeAPITypes.UpdateShapes["data"] = {
      projectId: selectedProjectId,
      orders: [],
      shapes: {},
      curves: {},
      data: {},
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

    shapeAPIs.updateShapes(modifyData);
  };

  const onClickProjectCard = (id: ProjectTypes.Project["id"]) => {
    setSelectedProjectId(id);
  };

  const onClickConfrimProject = async (id: ProjectTypes.Project["id"]) => {
    let $canvas = document.querySelector("canvas");
    if (!$canvas || !ctx) return;

    const resShapes: AxiosResponse<ShapeAPITypes.GetShapes["resData"], any> =
      await shapeAPIs.getShapes(id);

    setScale(1);
    offset = cloneDeep(init.offset);
    offset_center = cloneDeep(init.offset);
    shapes = getInitializedShapes(resShapes.data);
    select = cloneDeep(init.select);
    checkData();
    checkGroups();
    draw($canvas, ctx);
    setIsProjectsModalOpen(false);

    if (!hasEnter) {
      setHasEnter(true);
    }
  };

  const onClickDeleteProject = async (id: ProjectTypes.Project["id"]) => {
    let $canvas = document.querySelector("canvas");
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

  const onClickNewProjectCard = async () => {
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
    shapes = [];
    let $canvas = document.querySelector("canvas");
    if (!$canvas || !ctx) return;
    draw($canvas, ctx);
    localStorage.removeItem("Authorization");
    setIsLogin(true);
    setProjects([]);
    setSelectedProjectId(null);
    setHasEnter(false);
    setAuthInfo(init.authInfo);
    setIsProjectsModalOpen(false);
    setIsAccountModalOpen(true);
    setSteps({});
  };

  useEffect(() => {
    if (!isBrowser) return;
    verifyToken();

    const $canvas = document.querySelector("canvas");
    if (!$canvas || !ctx) return;
    draw($canvas, ctx);

    const resize = () => {
      let $canvas = document.querySelector("canvas");
      if (!isBrowser || !$canvas || !ctx) return;
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      draw($canvas, ctx);
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
  }, [dataFrame, dbClickedShape, space, steps, procedures, otherStepIds]);

  return (
    <>
      <Modal
        isOpen={
          isAccountModalOpen && !isProjectsModalOpen && !isProjectsModalOpen
        }
        width="400px"
      >
        <div className="bg-white-500 rounded-lg p-8 flex flex-col w-full">
          <a className="flex title-font font-medium justify-center items-center text-gray-900 mb-4">
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
            <span className="ml-3 text-xl text-grey-1">Minder</span>
          </a>
          <Input
            className="mb-4"
            label={"Account"}
            type="text"
            name="account"
            value={authInfo.account.value}
            status={authInfo.account.status}
            comment={authInfo.account.comment}
            onChange={onChangeAccount}
          />
          <Input
            className="mb-4"
            label={"Password"}
            type="password"
            name="password"
            value={authInfo.password.value}
            status={authInfo.password.status}
            comment={authInfo.password.comment}
            onChange={onChangePassword}
          />
          {!isLogIn && (
            <Input
              className="mb-4"
              label={"Email"}
              type="email"
              name="email"
              value={authInfo.email.value}
              status={authInfo.email.status}
              comment={authInfo.email.comment}
              onChange={onChangeEmail}
            />
          )}
          <Button
            className="text-lg"
            text={isLogIn ? "Login" : "Sign Up"}
            onClick={isLogIn ? onClickLoginButton : onClickSignUpButton}
            loading={isAuthorizing}
          />
          {authMessage.text && (
            <Alert
              className="mt-2"
              type={authMessage.status}
              text={authMessage.text}
            />
          )}
          <p className="text-xs text-gray-500 mt-3">
            {isLogIn ? "No account yet? " : "Already have an account? "}
            <a
              className="text-info-500 cursor-pointer"
              onClick={() => {
                onClickChangeAuthButton(!isLogIn);
              }}
            >
              {isLogIn ? "Sign up" : "Login"}
            </a>
          </p>
        </div>
      </Modal>
      <Modal
        isOpen={isProjectsModalOpen}
        width="1120px"
        onClickX={
          hasEnter && selectedProjectId !== null
            ? onClickProjectsModalX
            : undefined
        }
      >
        <div>
          <section className="rounded-lg text-gray-600 bg-white-500 p-8 body-font">
            <div className="flex justify-end align-center">
              <Button onClick={onClickLogOutButton} text={"Log Out"} danger />
            </div>
            {/* <div className="text-right">
              <Button
                className="ms-auto inline-flex"
                onClick={() => {}}
                text={"Sign Out"}
              />
            </div> */}
            <div className="mb-6 py-2 px-4 border-b border-grey-5">
              <h2 className="text-gray-900 title-font text-lg font-semibold">
                Projects
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-4 h-[500px] overflow-auto">
              <div>
                <Card
                  className="cursor-pointer"
                  text={
                    <h2 className="text-info-500 title-font text-lg font-medium">
                      New Project
                    </h2>
                  }
                  onClick={onClickNewProjectCard}
                />
              </div>
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
                    onClick={() => {
                      onClickProjectCard(project.id);
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end items-center mt-6 pt-4 border-t border-grey-5">
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
            <nav>
              <a className="text-white-500">Project_1</a>
            </nav>
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
            <div
              className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-info-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickProfile}
            >
              L
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
        <div className="text-xl pb-4 mb-2 border-b border-grey-5 text-black-2">
          Shapes
        </div>
        <ul>
          {Object.entries(steps).map(([stepId, step], stepI) => {
            return (
              <li key={stepId}>
                <Accordion
                  showArrow={!(step.shape instanceof Terminal)}
                  title={step.shape.title}
                  hoverRender={
                    <div className="h-full flex justify-end items-center">
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          step.shape instanceof Terminal
                            ? undefined
                            : onClickStep(step.shape.p);
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
                    onClickaAccordionArrow(stepId);
                  }}
                >
                  <Editor className="ps-6" shape={step.shape} />
                </Accordion>
              </li>
            );
          })}
        </ul>
      </SidePanel>
      <SidePanel
        open={isUserSidePanelOpen}
        w={"300px"}
        h={"calc(100vh - 56px)"}
        d={["b", "r"]}
      >
        <div className="flex flex-col h-full">
          <ul className="flex-1">
            <li className="mb-2">
              <div className="h-full flex flex-col items-center text-center">
                <img
                  width={100}
                  height={100}
                  alt="team"
                  className="w-100 h-[120px] flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-2"
                  src="https://dummyimage.com/200x200"
                />
                <div className="w-full">
                  <p className="title-font text-gray-900">Project_1</p>
                </div>
              </div>
            </li>
            <li className="mb-2">
              <div className="h-full flex flex-col items-center text-center">
                <img
                  width={100}
                  height={100}
                  alt="team"
                  className="w-100 h-[120px] flex-shrink-0 rounded-lg w-full h-56 object-cover object-center mb-2"
                  src="https://dummyimage.com/200x200"
                />
                <div className="w-full">
                  <p className="title-font text-gray-900">Project_2</p>
                </div>
              </div>
            </li>
          </ul>
          <div className="text-red-500">
            <p className="text-end cursor-pointer">Sign Out</p>
          </div>
        </div>
      </SidePanel>
      <div className="fixed p-4 bottom-[16px] left-1/2 -translate-x-1/2 bg-white-500 shadow-md rounded-full">
        <div className="justify-self-center">
          <div className="flex">
            <div
              className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickTerminator}
            >
              <svg
                width={16}
                height={16}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 256 256"
                enable-background="new 0 0 256 256"
                xmlSpace="preserve"
              >
                <g>
                  <g>
                    <path
                      fill="#FFFFFF"
                      d="M246,128c0,49.2-39.9,89-89,89H99c-49.2,0-89-39.9-89-89l0,0c0-49.2,39.9-89,89-89H157C206.1,39,246,78.8,246,128L246,128z"
                    />
                  </g>
                </g>
              </svg>
            </div>
            <div
              className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickProcess}
            >
              <svg
                width={16}
                height={16}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                x="0px"
                y="0px"
                viewBox="0 0 100 100"
                xmlSpace="preserve"
              >
                <path
                  fill="#FFFFFF"
                  className="st0"
                  d="M93.44,78.48H6.56V21.52h86.88V78.48z"
                />
              </svg>
            </div>
            <div
              className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickData}
            >
              <svg
                width={16}
                height={16}
                xmlns="http://www.w3.org/2000/svg"
                data-name="Layer 21"
                viewBox="0 0 32 32"
                x="0px"
                y="0px"
              >
                <path
                  fill="#FFFFFF"
                  d="M30.387,5.683A.5.5,0,0,0,30,5.5H6a.5.5,0,0,0-.49.4l-4,20a.5.5,0,0,0,.49.6H26a.5.5,0,0,0,.49-.4l4-20A.5.5,0,0,0,30.387,5.683Z"
                />
              </svg>
            </div>
            <div
              className="mx-2 w-8 h-8 inline-flex items-center justify-center rounded-full bg-primary-500 text-white-500 flex-shrink-0 cursor-pointer"
              onClick={onClickDecision}
            >
              <svg
                width={16}
                height={16}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                x="0px"
                y="0px"
                viewBox="0 0 64 64"
                xmlSpace="preserve"
              >
                <rect
                  fill="#FFFFFF"
                  x="12.5545645"
                  y="12.5545635"
                  transform="matrix(0.7071068 -0.7071068 0.7071068 0.7071068 -13.2548332 32)"
                  width={"38.890873"}
                  height={"38.890873"}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <motion.ul
        className="fixed p-4 bottom-[16px] rounded-full shadow-md bg-white-500"
        variants={{
          open: {
            right: "316px",
          },
          closed: {
            right: "16px",
          },
        }}
        initial={isUserSidePanelOpen ? "open" : "closed"}
        animate={isUserSidePanelOpen ? "open" : "closed"}
        transition={{ type: "easeInOut" }}
      >
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
      </motion.ul>
      <canvas
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
