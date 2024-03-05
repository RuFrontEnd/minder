// TODO: core shape sendTo 搬遷至 curves sendTo / shape 在有 recieve curve 情況下還會有 recieve point / curve control point 被蓋住時要跳離 shape 範圍 / 以 terminal 為群組功能 / 雙擊 cp1 || cp2 可自動對位 / focus 功能 / zoom 功能 / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 後端判斷新增的 data 是否資料重名 / 對齊功能
"use client";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Curve from "@/shapes/curve";
import Desicion from "@/shapes/decision";
import DataFrame from "@/components/dataFrame";
import { useState, useRef, useEffect, useCallback } from "react";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/shapes/common";
import * as DataFrameTypes from "@/types/components/dataFrame";

let useEffected = false,
  ctx: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  sender: null | CoreTypes.ConnectTarget = null,
  pressing: null | {
    parent: null | Terminal | Process | Data | Desicion;
    shape: null | Terminal | Process | Data | Desicion | Curve;
    direction: null | CommonTypes.Direction;
    target: null | CoreTypes.PressingTarget | CurveTypes.PressingTarget;
    dx: number; // distance between event px & pressing shape px
    dy: number; // distance between event py & pressing shape py
  } = null,
  offset: CommonTypes.Vec = { x: 0, y: 0 },
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
  };

const ds = [
    CommonTypes.Direction.l,
    CommonTypes.Direction.t,
    CommonTypes.Direction.r,
    CommonTypes.Direction.b,
  ],
  vs: (
    | CoreTypes.PressingTarget.lt
    | CoreTypes.PressingTarget.rt
    | CoreTypes.PressingTarget.rb
    | CoreTypes.PressingTarget.lb
  )[] = [
    CoreTypes.PressingTarget.lt,
    CoreTypes.PressingTarget.rt,
    CoreTypes.PressingTarget.rb,
    CoreTypes.PressingTarget.lb,
  ];

const getFramePosition = (shape: Core) => {
  const frameOffset = 12;
  return {
    x: shape.getScreenP().x + shape.getScaleSize().w / 2 + frameOffset,
    y: shape.getScreenP().y,
  };
};

export default function ProcessPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const [dataFrame, setDataFrame] = useState<
      { p: CommonTypes.Vec } | undefined
    >(undefined),
    [dbClickedShape, setDbClickedShape] = useState<
      Terminal | Data | Process | Desicion | null
    >(null),
    [space, setSpace] = useState(false),
    [scale, setScale] = useState(1),
    [leftMouseBtn, setLeftMouseBtn] = useState(false);

  const checkData = () => {
    shapes.forEach((shape) => {
      shape.options = [];
    });

    shapes.forEach((shape) => {
      if (
        shape instanceof Terminal &&
        shape.receiveFrom.l === null &&
        shape.receiveFrom.t === null &&
        shape.receiveFrom.r === null &&
        shape.receiveFrom.b === null
      ) {
        shape.onTraversal(); // shape is Terminator
      }
    });

    // check all correspondants of shapes' between options and selectedData
    shapes.forEach((shape) => {
      shape.getRedundancies();
    });
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

    // zoom the page based on where the cursor is
    var distX = client.x / $canvas.width;
    var distY = client.y / $canvas.height;

    // calculate how much we need to zoom
    const unitsZoomedX = ($canvas.width / _scale) * scaleAmount;
    const unitsZoomedY = ($canvas.height / _scale) * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offset.x -= unitsAddLeft;
    offset.y -= unitsAddTop;

    shapes.forEach((shape) => {
      shape.scale = _scale;
      shape.offset = offset;
    });
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setLeftMouseBtn(true);

      let $canvas = document.querySelector("canvas");

      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      shapes.forEach((shape) => {
        if (!$canvas) return;

        // onMouseDown shape
        if (shape.checkBoundry(p)) {
          shape.selecting = true;
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
        if (theCheckShapeVertexesBoundry) {
          shape.selecting = true;
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

        // onMouseDown curve trigger point and create curve
        const theCheckCurveTriggerBoundry = shape.checkCurveTriggerBoundry(p);
        if (theCheckCurveTriggerBoundry) {
          shape.selecting = false;

          if (!shape.curves[theCheckCurveTriggerBoundry].shape) {
            shape.createCurve(
              `curve_${Date.now()}`,
              CommonTypes.Direction[theCheckCurveTriggerBoundry]
            );
          }

          const theCurve = shape.curves[theCheckCurveTriggerBoundry].shape;

          if (theCurve) {
            theCurve.selecting = true;
          }

          pressing = {
            parent: null,
            shape: shape,
            target:
              CoreTypes.PressingTarget[`c${theCheckCurveTriggerBoundry}p2`],
            direction: null,
            dx: 0,
            dy: 0,
          };
        }

        // TOOD: select curve
        for (const d of ds) {
          const theCurve = shape.curves[d].shape;

          const curveP = {
            x: p.x - shape?.getScreenP().x,
            y: p.y - shape?.getScreenP().y,
          };

          if (!theCurve) continue;
          if (theCurve.checkBoundry(curveP)) {
            theCurve.selecting = true;
            pressing = {
              parent: shape,
              shape: theCurve,
              target: null,
              direction: d,
              dx: 0,
              dy: 0,
            };
          }

          if (theCurve.selecting) {
            const theCurveCheckControlPointsBoundry = theCurve.checkControlPointsBoundry(
              curveP
            );
            if (theCurveCheckControlPointsBoundry) {
              pressing = {
                parent: shape,
                shape: theCurve,
                target: theCurveCheckControlPointsBoundry,
                direction: d,
                dx: 0,
                dy: 0,
              };
            }
          }
        }

        console.log("pressing", pressing);

        if (
          pressing?.shape?.id !== shape.id ||
          (!(pressing?.shape instanceof Terminal) &&
            !(pressing?.shape instanceof Process) &&
            !(pressing?.shape instanceof Data) &&
            !(pressing?.shape instanceof Desicion))
        ) {
          shape.selecting = false;
        }

        if (!pressing || !(pressing?.shape instanceof Curve)) {
          for (const d of ds) {
            const theCurve = shape.curves[d].shape;
            if (!theCurve) continue;
            theCurve.selecting = false;
          }
        }
      });

      if (space) {
        dragP = p;
      }
    },
    [space, scale, setLeftMouseBtn]
  );

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
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
        } else if (pressing?.target === CoreTypes.PressingTarget.m) {
          pressing.shape.move(p, dragP);
        }
      }

      if (pressing.shape instanceof Curve) {
        if (
          pressing?.target === CurveTypes.PressingTarget.p2 &&
          pressing?.parent &&
          pressing?.direction
        ) {
          pressing.parent.disConnect(pressing?.direction, true);
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
        pressing.shape.move(pressing.target, curveP);

        shapes.forEach((shape) => {
          const theEdge = shape.getEdge(),
            threshold = 20,
            isReceiving =
              p.x >= theEdge.l - threshold &&
              p.y >= theEdge.t - threshold &&
              p.x <= theEdge.r + threshold &&
              p.y <= theEdge.b + threshold;

          shape.receiving = {
            l: isReceiving,
            t: isReceiving,
            r: isReceiving,
            b: isReceiving,
          };
        });
      }
    }

    const shapesInView: (Terminal | Process | Data | Desicion)[] = [];

    shapes.forEach((shape) => {
      if (!$canvas) return;


      if (movingCanvas) {
        shape.offset = offset;
      }

      if (shape.checkBoundry(p) && dbClickedShape?.id === shape.id) {
        const $dataFrame = document.getElementById(dbClickedShape?.id);
        if ($dataFrame) {
          const framePosition = getFramePosition(shape);
          $dataFrame.style.left = `${framePosition.x}px`;
          $dataFrame.style.top = `${framePosition.y}px`;
        }
      }

      const shapeEdge = shape.getEdge(),
        isShapeInView =
          ((shapeEdge.l >= 0 && shapeEdge.l <= $canvas.width) ||
            (shapeEdge.r >= 0 && shapeEdge.r <= $canvas.width)) &&
          ((shapeEdge.t >= 0 && shapeEdge.t <= $canvas.height) ||
            (shapeEdge.b >= 0 && shapeEdge.b <= $canvas.height));

      if (isShapeInView) {
        shapesInView.push(shape);
      }
    });

    // align feature
    const thePressing = pressing,
      stickyOffset = 5;

    if (thePressing) {
      shapesInView.forEach((shapeInView) => {
        if (shapeInView.id === thePressing?.shape?.id) return;
        if (
          !(thePressing.shape instanceof Terminal) &&
          !(thePressing.shape instanceof Process) &&
          !(thePressing.shape instanceof Desicion) &&
          !(thePressing.shape instanceof Data)
        )
          return;

        if (thePressing?.shape?.p.x === shapeInView.p.x && !moveP) {
          moveP = {
            originalX: p.x,
            originalY: p.y,
            x: p.x,
            y: p.y,
          };
        } else if (moveP) {
          moveP.x = p.x;
          moveP.y = p.y;
        }

        if (
          moveP &&
          moveP.x &&
          moveP.originalX &&
          Math.abs(moveP.x - moveP?.originalX) > 10
        ) {
          moveP = null;
        }
      });
    }

    dragP = p;
  };

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setLeftMouseBtn(false);

      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      shapes.forEach((shape) => {
        if (
          pressing?.shape &&
          pressing.shape instanceof Curve &&
          pressing?.target &&
          pressing?.parent &&
          pressing?.direction
        ) {
          const theCheckReceivingPointsBoundry = shape.checkReceivingPointsBoundry(
            p
          );

          if (theCheckReceivingPointsBoundry) {
            shape.connect(theCheckReceivingPointsBoundry, {
              shape: pressing.parent,
              direction: pressing.direction,
            });
          }
        }

        shape.receiving = {
          l: false,
          t: false,
          r: false,
          b: false,
        };
      });

      checkData();

      pressing = null;
      moveP = null;
    },
    [dbClickedShape, setLeftMouseBtn]
  );

  const onMouseWeel = (e: React.WheelEvent<HTMLCanvasElement>) => {
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
    // delete
    if (e.key === "Backspace" && !dataFrame && !dbClickedShape) {
      let removeShape: null | Terminal | Process | Data | Desicion = null,
        removeCurve: null | {
          shape: Terminal | Process | Data | Desicion;
          direction: CommonTypes.Direction;
        } = null;

      const ds = [
        CommonTypes.Direction.l,
        CommonTypes.Direction.t,
        CommonTypes.Direction.r,
        CommonTypes.Direction.b,
      ];

      for (const currentShape of shapes) {
        if (removeShape || removeCurve) break;

        if (currentShape.selecting) {
          removeShape = currentShape;
          break;
        } else {
          for (const d of ds) {
            if (currentShape.curves[d]?.shape?.selecting) {
              removeCurve = { shape: currentShape, direction: d };
            }
          }
        }
      }

      if (removeShape) {
        for (const d of ds) {
          removeShape?.disConnect(d, true);
          removeShape?.disConnect(d, false);
        }
        shapes = shapes.filter((shape) => shape.id !== removeShape?.id);
        checkData();
      } else if (removeCurve) {
        removeCurve.shape.removeCurve(removeCurve.direction);
        checkData();
      }
    }

    // space
    if (e.key === " " && !space) {
      setSpace(true);
    }
  }

  function handleKeyUp(this: Window, e: KeyboardEvent) {
    if (e.key === " " && space) {
      setSpace(false);
    }
  }

  const onClickTerminator = () => {
    let terminal = new Terminal(
      `terminator_${Date.now()}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "orange"
    );
    terminal.offset = offset;
    terminal.scale = scale;

    shapes.push(terminal);
  };

  const onClickProcess = () => {
    let process_new = new Process(
      `process_${Date.now()}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "red"
    );
    process_new.offset = offset;
    process_new.scale = scale;

    shapes.push(process_new);
  };

  const onClickData = () => {
    let data_new = new Data(
      `data_${Date.now()}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "green"
    );
    data_new.scale = scale;
    data_new.offset = offset;

    shapes.push(data_new);
  };

  const onClickDecision = () => {
    let decision_new = new Desicion(
      `data_${Date.now()}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "#3498db"
    );
    decision_new.offset = offset;
    decision_new.scale = scale;

    shapes.push(decision_new);
  };

  const onConfirmDataFrame: DataFrameTypes.Props["onConfirm"] = (
    title,
    data,
    selectedData
  ) => {
    if (
      dbClickedShape instanceof Process ||
      dbClickedShape instanceof Desicion
    ) {
      dbClickedShape?.onDataChange(title, selectedData);
    } else if (dbClickedShape instanceof Data) {
      dbClickedShape?.onDataChange(title, data, selectedData);
    } else if (dbClickedShape instanceof Terminal) {
      dbClickedShape?.onDataChange(title);
    }

    setDataFrame(undefined);
    setDbClickedShape(null);
    checkData();
  };

  const onClickScalePlusIcon = () => {
    if (!$canvas) return;
    zoom(100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
  };

  const onClickScaleMinusIcon = () => {
    if (!$canvas) return;
    zoom(-100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
  };

  const onClickScaleNumber = () => {
    if (!$canvas) return;
    zoom(-((1 / scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const draw = useCallback(() => {
    if (!ctx) return;
    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx?.beginPath();
    ctx.fillStyle = "#F6F7FA";
    ctx?.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx?.closePath();

    shapes.forEach((shape) => {
      if (!ctx) return;
      shape.draw(ctx);
    });
    shapes.forEach((shape) => {
      if (!ctx) return;

      shape.drawCurve(ctx);
    });
    requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (useEffected) return;

    if ($canvas) {
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      if (!ctx) return;
      // let terminal = new Terminal(
      //   "terminal_1",
      //   200,
      //   100,
      //   { x: 0, y: 0 },
      //   "orange",
      //   true
      // );
      // ,
      //   process = new Process("process_1", 200, 100, { x: 300, y: 350 }, "red"),
      //   process_2 = new Process(
      //     "process_2",
      //     200,
      //     100,
      //     { x: 1200, y: 300 },
      //     "blue"
      //   ),
      //   data_1 = new Data("data_1", 200, 100, { x: 600, y: 600 }, "green"),
      //   desicion_1 = new Desicion(
      //     "desicion_1",
      //     150,
      //     100,
      //     { x: 500, y: 100 },
      //     "#3498db"
      //   );

      // let curve: any = new Curve(
      //   { w: 1, c: "#c00" },
      //   { w: 2, c: "#333" },
      //   { x: 100, y: 200 },
      //   { x: 200, y: 200 },
      //   { x: 300, y: 200 },
      //   { x: 400, y: 200 }
      // );

      // shapes.push(terminal);
      // shapes.push(process);
      // shapes.push(process_2);
      // shapes.push(data_1);
      // shapes.push(desicion_1);
      // shapes.push(curve);

      requestAnimationFrame(draw);
    }

    useEffected = true;
  }, []);

  useEffect(() => {
    const resize = () => {
      if (!$canvas) return;
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);

    return () => {
      // 移除事件監聽器或進行其他清理操作
      window.removeEventListener("resize", resize);
    };
  }, [leftMouseBtn]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [dataFrame, dbClickedShape, space]);

  return (
    <>
      <div className="fixed m-4">
        <div className="flex flex-col">
          <div
            className="mb-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickTerminator}
          >
            T
          </div>
          <div
            className="mb-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickProcess}
          >
            P
          </div>
          <div
            className="mb-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickData}
          >
            D
          </div>
          <div
            className="mb-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickDecision}
          >
            De
          </div>
        </div>
      </div>
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
        onWheel={onMouseWeel}
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
        />
      )}

      <div className="fixed m-4 bottom-0 right-0">
        <div className="flex items-center">
          <div
            className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickScalePlusIcon}
          >
            +
          </div>
          <div
            className="flex mx-2 items-center justify-center cursor-pointer w-[48px]"
            onClick={onClickScaleNumber}
          >
            {Math.ceil(scale * 100)}%
          </div>
          <div
            className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
            onClick={onClickScaleMinusIcon}
          >
            -
          </div>
        </div>
      </div>
    </>
  );
}
