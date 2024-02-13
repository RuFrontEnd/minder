// TODO: 刪除 shape 時要進行走訪 / 刪除 shape 時要連同關聯 shape 的關係一併清除 / checkData 時 setDbClickedShape 是否需要 / 修正 arrow 跟隨位置 / 新增 arrow 點擊範圍偵測 / terminal 新增 / infinite whiteboard / zoom 功能 / 修正 receive point 出現時會影響 curve 渲染 / 禁止 shape 頂點未從 terminal 出發 ( 會造成無法 traversal ) / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 後端判斷新增的 data 是否資料重名
"use client";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import StatusFrame from "@/components/statusFrame";
import ImportFrame from "@/components/importFrame";
import SelectDataFrame from "@/components/selectDataFrame";
import { useState, useRef, useEffect, useCallback, use } from "react";
import { PressingTarget, ConnectTarget } from "@/types/shapes/core";
import { Vec, Direction, Data as DataType } from "@/types/shapes/common";
import Core from "@/shapes/core";
import cloneDeep from "lodash/cloneDeep";

let useEffected = false,
  ctx: CanvasRenderingContext2D | null | undefined = null,
  shapes: (Terminal | Process | Data | Desicion)[] = [],
  sender: null | ConnectTarget = null,
  offset: Vec = { x: 0, y: 0 },
  dragP: Vec = { x: 0, y: 0 }

const getFramePosition = (shape: Core) => {
  const frameOffset = 12;
  return { x: shape.getOffsetP().x + shape.w / 2 + frameOffset, y: shape.getOffsetP().y };
};

export default function ProcessPage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const [statusFrame, setStatusFrame] = useState<{ p: Vec } | undefined>(
    undefined
  ),
    [importFrame, setImportFrame] = useState<{ p: Vec } | undefined>(
      undefined
    ),
    [selectFrame, setSelectFrame] = useState<{ p: Vec } | undefined>(undefined),
    [dbClickedShape, setDbClickedShape] = useState<
      Terminal | Data | Process | Desicion | null
    >(null),
    [space, setSpace] = useState(false),
    [leftMouseBtn, setLeftMouseBtn] = useState(false);


  const checkData = (dbClickedShapeId?: string) => {
    // traversal to give all shapes corresponding options
    const terminal = shapes.find(
      (shape) => shape instanceof Terminal && shape.isStart
    );
    if (terminal && terminal instanceof Terminal) {
      terminal.onTraversal();
    }

    // check all correspondants of shapes' between options and selectedData
    shapes.forEach((shape) => {
      shape.getRedundancies();
      if (shape.id === dbClickedShapeId) {
        setDbClickedShape(cloneDeep(shape));
      } // TODO: check if is neccessary
    });
  };

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setLeftMouseBtn(true)

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
      }
    });

    if (space) {
      dragP = p
    }
  }, [space, setLeftMouseBtn]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const p = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };

      const movingCanvas = space && leftMouseBtn;

      if (movingCanvas) {
        setStatusFrame(undefined)
        setSelectFrame(undefined);
        setImportFrame(undefined)
        offset.x += p.x - dragP.x
        offset.y += p.y - dragP.y
        dragP = p
      }

      shapes.forEach((shape) => {
        shape.onMouseMove(
          p,
          sender && sender.shape.id !== shape.id ? true : false
        );

        if (movingCanvas) {
          shape.offset = offset
        }

        if (shape.checkBoundry(p) && dbClickedShape?.id === shape.id) {
          if (shape instanceof Terminal) {
            const $StatusFrame = document.getElementById(dbClickedShape?.id);
            if ($StatusFrame) {
              const framePosition = getFramePosition(shape);
              $StatusFrame.style.left = `${framePosition.x}px`;
              $StatusFrame.style.top = `${framePosition.y}px`;
            }
          } else if (shape instanceof Data) {
            const $importFrame = document.getElementById(dbClickedShape?.id);
            if ($importFrame) {
              const framePosition = getFramePosition(shape);
              $importFrame.style.left = `${framePosition.x}px`;
              $importFrame.style.top = `${framePosition.y}px`;
            }
          } else if (shape instanceof Process || shape instanceof Desicion) {
            const $selectFrame = document.getElementById(dbClickedShape?.id);
            if ($selectFrame) {
              const framePosition = getFramePosition(shape);
              $selectFrame.style.left = `${framePosition.x}px`;
              $selectFrame.style.top = `${framePosition.y}px`;
            }
          }
        }
      });
    },
    [dbClickedShape, space, leftMouseBtn]
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      setLeftMouseBtn(false)

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
        checkData(dbClickedShape?.id);
      }

      sender = null;
    },
    [dbClickedShape, setLeftMouseBtn]
  );

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

          if (shape instanceof Terminal) {
            setStatusFrame({
              p: getFramePosition(shape),
            });
            setImportFrame(undefined);
            setSelectFrame(undefined);
          } else if (shape instanceof Data) {
            setStatusFrame(undefined)
            setImportFrame({
              p: getFramePosition(shape),
            });
            setSelectFrame(undefined);
          } else if (shape instanceof Process || shape instanceof Desicion) {
            setStatusFrame(undefined)
            setImportFrame(undefined);
            setSelectFrame({
              p: getFramePosition(shape),
            });
          }
        }
      });
    },
    []
  );

  function handleKeyDown(this: Window, e: KeyboardEvent) {
    // delete
    if (
      e.key === "Backspace" &&
      !importFrame &&
      !selectFrame &&
      !dbClickedShape
    ) {
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
            if (currentShape.curves[d]?.selecting) {
              removeCurve = { shape: currentShape, direction: d };
            }
          }
        }
      }

      if (removeShape) {
        shapes = shapes.filter((shape) => shape.id !== removeShape?.id);
      } else if (removeCurve) {
        removeCurve.shape.removeCurve(removeCurve.direction);
      }
    }

    // space
    if (e.key === " " && !space) {
      setSpace(true)
    }
  }

  function handleKeyUp(this: Window, e: KeyboardEvent) {
    if (e.key === " " && space) {
      setSpace(false)
    }
  }

  const onClickProcess = () => {
    let process_new = new Process(
      `process_${shapes.length + 1}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "red"
    );
    process_new.offset = offset

    shapes.push(process_new);
  };

  const onClickData = () => {
    let data_new = new Data(
      `data_${shapes.length + 1}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "green"
    );
    data_new.offset = offset

    shapes.push(data_new);
  };

  const onClickDecision = () => {
    let data_new = new Desicion(
      `data_${shapes.length + 1}`,
      200,
      100,
      { x: -offset.x + 200, y: -offset.y + 200 },
      "#3498db"
    );
    data_new.offset = offset

    shapes.push(data_new);
  };

  const onConfirmStatusFrame = (title: string) => {
    if (!(dbClickedShape instanceof Terminal)) return;
    dbClickedShape?.onDataChange(title);
    setStatusFrame(undefined);
    setDbClickedShape(null);
    checkData();
  };

  const onConfirmImportFrame = (title: string, data: DataType) => {
    if (!(dbClickedShape instanceof Data)) return;
    dbClickedShape?.onDataChange(title, data);
    setImportFrame(undefined);
    setDbClickedShape(null);
    checkData();
  };

  const onConfirmSelectDataFrame = (title: string, data: DataType) => {
    if (
      !(dbClickedShape instanceof Process) &&
      !(dbClickedShape instanceof Desicion)
    )
      return;
    dbClickedShape?.onDataChange(title, data);
    setSelectFrame(undefined);
    setDbClickedShape(null);
    checkData();
  };

  const draw = useCallback(() => {

    ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);
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
      let terminal = new Terminal(
        "terminal_1",
        200,
        100,
        { x: 0, y: 0 },
        "orange",
        true
      );
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

      shapes.push(terminal);
      // shapes.push(process);
      // shapes.push(process_2);
      // shapes.push(data_1);
      // shapes.push(desicion_1);

      requestAnimationFrame(draw);
    }

    useEffected = true;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    };
  }, [statusFrame, importFrame, selectFrame, dbClickedShape, space]);

  return (
    <>
      <div className="fixed m-4">
        <div className="flex flex-col">
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
        className={space ? "cursor-grab" : ""}
        tabIndex={1}
        ref={(el) => {
          $canvas = el;
          ctx = $canvas?.getContext("2d");
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onDoubleClick={onDoubleClick}
      />

      {statusFrame && dbClickedShape instanceof Terminal &&
        <StatusFrame
          id={dbClickedShape.id}
          key={dbClickedShape.id}
          coordinate={statusFrame.p}
          onConfirm={onConfirmStatusFrame}
          init={{
            title: dbClickedShape?.title ? dbClickedShape?.title : "",
          }} />
      }

      {importFrame && dbClickedShape instanceof Data && (
        <ImportFrame
          id={dbClickedShape.id}
          key={dbClickedShape.id}
          coordinate={importFrame.p}
          onConfirm={onConfirmImportFrame}
          init={{
            title: dbClickedShape?.title ? dbClickedShape?.title : "",
            data: dbClickedShape?.data ? dbClickedShape?.data : [],
          }}
        />
      )}

      {selectFrame &&
        (dbClickedShape instanceof Process ||
          dbClickedShape instanceof Desicion) && (
          <SelectDataFrame
            shape={dbClickedShape}
            coordinate={selectFrame.p}
            onConfirm={onConfirmSelectDataFrame}
          />
        )}
    </>
  );
}
