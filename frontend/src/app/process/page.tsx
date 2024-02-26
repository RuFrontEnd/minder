// TODO: core shape sendTo 搬遷至 curves sendTo / core shape onMouseMove 邏輯拆小 => move 和 resize 邏輯 拆開 / shape 在有 recieve curve 情況下還會有 recieve point / curve control point 被蓋住時要跳離 shape 範圍 / 以 terminal 為群組功能 / 雙擊 cp1 || cp2 可自動對位 / focus 功能 / zoom 功能 / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 後端判斷新增的 data 是否資料重名 / 對齊功能
"use client";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Curve from "@/shapes/curve";
import Desicion from "@/shapes/decision";
import DataFrame from "@/components/dataFrame";
import { useState, useRef, useEffect, useCallback, use } from "react";
import { PressingTarget, ConnectTarget } from "@/types/shapes/core";
import { Vec, Direction } from "@/types/shapes/common";
import { Props as DataFrameProps } from "@/types/components/dataFrame";

let useEffected = false,
  ctx: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  sender: null | ConnectTarget = null,
  pressing: null | {
    shape: Terminal | Process | Data | Desicion,
    dx: number, // distance between event px & pressing shape px
    dy: number // distance between event py & pressing shape py
  } = null,
  offset: Vec = { x: 0, y: 0 },
  scale: number = 1,
  dragP: Vec = { x: 0, y: 0 },
  alignment: {
    offset: number,
    p: null | Vec
  } = {
    offset: 5,
    p: null
  }

const getFramePosition = (shape: Core) => {
  const frameOffset = 12;
  return {
    x: shape.getScreenP().x + shape.w / 2 + frameOffset,
    y: shape.getScreenP().y,
  };
};

export default function ProcessPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const [dataFrame, setDataFrame] = useState<{ p: Vec } | undefined>(undefined),
    [dbClickedShape, setDbClickedShape] = useState<
      Terminal | Data | Process | Desicion | null
    >(null),
    [space, setSpace] = useState(false),
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

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setLeftMouseBtn(true);

      let $canvas = document.querySelector("canvas");

      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      shapes.forEach((shape, shapeI) => {
        if (!$canvas) return;

        if (shape instanceof Process || Data || Desicion) {
          let currentShape =
            (shapes[shapeI] as Process) ||
            (shapes[shapeI] as Data) ||
            (shapes[shapeI] as Desicion);

          currentShape.onMouseDown($canvas, p);

          if (
            currentShape.pressing.activate &&
            currentShape.pressing.target === PressingTarget.clp2
          ) {
            if (!shape.curves.l) return;
            sender = {
              shape: shape,
              direction: Direction.l,
            };
          } else if (
            currentShape.pressing.activate &&
            currentShape.pressing.target === PressingTarget.ctp2
          ) {
            if (!shape.curves.t) return;
            sender = {
              shape: shape,
              direction: Direction.t,
            };
          } else if (
            currentShape.pressing.activate &&
            currentShape.pressing.target === PressingTarget.crp2
          ) {
            if (!shape.curves.r) return;
            sender = {
              shape: shape,
              direction: Direction.r,
            };
          } else if (
            currentShape.pressing.activate &&
            currentShape.pressing.target === PressingTarget.cbp2
          ) {
            if (!shape.curves.b) return;
            sender = {
              shape: shape,
              direction: Direction.b,
            };
          }

          if (currentShape.pressing.activate && currentShape.pressing.target) {
            pressing = {
              shape: currentShape,
              dx: (p.x - dragP.x) * (1 / scale) - currentShape?.getScreenP().x,
              dy: (p.y - dragP.y) * (1 / scale) - currentShape?.getScreenP().y,
            }
          }
        }
      });

      if (space) {
        dragP = p;
      }
    },
    [space, setLeftMouseBtn]
  );

  const onMouseMove =
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      },
        screenP = {
          x: (p.x - dragP.x) * (1 / scale),
          y: (p.y - dragP.y) * (1 / scale),
        }

      const movingCanvas = space && leftMouseBtn;

      if (movingCanvas) {
        setDataFrame(undefined);
        offset.x += screenP.x;
        offset.y += screenP.y;
        dragP = p;
      }

      const shapesInView: (Terminal | Process | Data | Desicion)[] = []

      shapes.forEach((shape) => {
        if (!$canvas) return

        const sticking = (alignment.p && shape.id === pressing?.shape.id)

        if (!sticking) {
          shape.onMouseMove(
            p,
            sender && sender.shape.id !== shape.id ? true : false
          );
        }

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
          isShapeInView = ((shapeEdge.l >= 0 && shapeEdge.l <= $canvas.width) ||
            (shapeEdge.r >= 0 && shapeEdge.r <= $canvas.width)) &&
            ((shapeEdge.t >= 0 && shapeEdge.t <= $canvas.height) ||
              (shapeEdge.b >= 0 && shapeEdge.b <= $canvas.height))

        if (isShapeInView) {
          shapesInView.push(shape)
        }
      });

      // align feature
      const thePressing = pressing,
        stickyOffset = 5

      if (thePressing) {
        shapesInView.forEach(shapeInView => {
          if (shapeInView.id === thePressing.shape.id) return

          if (thePressing.shape.pressing.activate && thePressing.shape.pressing.target === PressingTarget.m) {
            const shouldAlignX = screenP.x - thePressing.dx >= shapeInView.getScreenP().x - stickyOffset &&
              screenP.x - thePressing.dx <= shapeInView.getScreenP().x + stickyOffset
            if (shouldAlignX) {
              alignment.p = {
                x: screenP.x,
                y: 0
              }
              thePressing.shape.p.x = shapeInView.p.x
            } else {
              alignment.p = null
            }
          }
        })
      }
    }

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setLeftMouseBtn(false);

      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      // create relationships between shapes and shapes
      if (sender) {
        shapes.forEach((shape) => {

          shape.options = [];

          if (shape.id === sender?.shape?.id) {
            shape.onMouseUp(p);
          } else {
            if (!sender) return;
            shape.onMouseUp(p, sender);
          }
        });
      } else {
        shapes.forEach((shape) => {
          shape.onMouseUp(p);
        });
      }

      if (sender) {
        checkData();
      }

      if (pressing) {
        pressing = null
      }

      sender = null;
    },
    [dbClickedShape, setLeftMouseBtn]
  );

  const onMouseWeel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (!$canvas) return;

    const deltaY = e.deltaY;
    const scaleAmount = -deltaY / 500;
    scale = scale * (1 + scaleAmount);

    // zoom the page based on where the cursor is
    var distX = e.clientX / $canvas.width;
    var distY = e.clientY / $canvas.height;

    // calculate how much we need to zoom
    const unitsZoomedX = $canvas.width / scale * scaleAmount;
    const unitsZoomedY = $canvas.height / scale * scaleAmount;

    const unitsAddLeft = unitsZoomedX * distX;
    const unitsAddTop = unitsZoomedY * distY;

    offset.x -= unitsAddLeft;
    offset.y -= unitsAddTop;

    shapes.forEach((shape) => {
      shape.scale = scale;
      shape.offset = offset
    });
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
          direction: Direction;
        } = null;

      const ds = [Direction.l, Direction.t, Direction.r, Direction.b];

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
          removeShape?.resetConnection(d, true);
          removeShape?.resetConnection(d, false);
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

  const onConfirmDataFrame: DataFrameProps["onConfirm"] = (
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

  const draw = useCallback(() => {
    if (!ctx) return
    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx?.beginPath();
    ctx.fillStyle = '#F6F7FA';
    ctx?.fillRect(0, 0, window.innerWidth, window.innerHeight)
    ctx?.closePath();


    shapes.forEach((shape) => {
      if (!ctx) return;
      shape.draw(ctx);
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
    </>
  );
}
