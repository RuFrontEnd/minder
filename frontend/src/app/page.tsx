// TODO: core shape sendTo 搬遷至 curves sendTo / shape 在有 recieve curve 情況下還會有 recieve point / curve control point 被蓋住時要跳離 shape 範圍 / 以 terminal 為群組功能 / 雙擊 cp1 || cp2 可自動對位 / focus 功能 / zoom 功能 / 處理 data shape SelectFrame 開關(點擊 frame 以外要關閉) / 尋找左側列 icons / 後端判斷新增的 data 是否資料重名 / 對齊功能
"use client";
import Core from "@/shapes/core";
import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Curve from "@/shapes/curve";
import Desicion from "@/shapes/decision";
import DataFrame from "@/components/dataFrame";
import SidePanel from "@/components/sidePanel";
import Accordion from "@/components/accordion";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cloneDeep } from "lodash";
import * as CoreTypes from "@/types/shapes/core";
import * as CurveTypes from "@/types/shapes/curve";
import * as CommonTypes from "@/types/shapes/common";
import * as DataFrameTypes from "@/types/components/dataFrame";
import * as PageTypes from "@/types/app/page";

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
  },
  selectAreaP: null | {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
  } = null,
  initMultiSelect = {
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
  select: {
    start: CommonTypes.Vec;
    end: CommonTypes.Vec;
    shapes: Core[];
  } = initMultiSelect,
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
    [leftMouseBtn, setLeftMouseBtn] = useState(false),
    [isDataSidePanelOpen, setIsDataSidePanelOpen] = useState(true),
    [groups, setGroups] = useState<PageTypes.Groups>([]);

  const checkData = () => {
    const goThroughShapeMapping: { [shapeId: string]: boolean } = {};

    shapes.forEach((shape) => {
      shape.options = [];
      goThroughShapeMapping[shape.id] = true;
    });

    const _groups: PageTypes.Groups = [];

    shapes.forEach((shape) => {
      if (
        shape instanceof Terminal &&
        shape.receiveFrom.l === null &&
        shape.receiveFrom.t === null &&
        shape.receiveFrom.r === null &&
        shape.receiveFrom.b === null
      ) {
        const _children: PageTypes.Children = [];
        // shape is Terminator
        shape.onTraversal((goThroughShape, terminator) => {
          if (goThroughShape.id === terminator.id) {
            _groups.push({
              head: { open: false, shape: terminator },
              children: _children,
            });
          } else {
            _children.push({ open: false, shape: goThroughShape });
          }
          delete goThroughShapeMapping[goThroughShape.id];
        });
      }
    });

    // check all correspondants of shapes' between options and selectedData
    shapes.forEach((shape) => {
      if (goThroughShapeMapping[shape.id]) {
        _groups.push({
          head: { open: false, shape: shape },
          children: [],
        });
      }
      shape.getRedundancies();
    });

    setGroups(_groups);
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

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setLeftMouseBtn(true);

    let $canvas = document.querySelector("canvas");

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

        shapes.forEach((shape) => {
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
          const theCheckCurveTriggerBoundry = shape.checkCurveTriggerBoundry(p);
          if (theCheckCurveTriggerBoundry) {
            shape.selecting = false;

            if (!shape.curves[theCheckCurveTriggerBoundry].shape) {
              shape.createCurve(
                `curve_${Date.now()}`,
                CommonTypes.Direction[theCheckCurveTriggerBoundry]
              );
            }
          }

          for (const d of ds) {
            const theCurve = shape.curves[d].shape;

            const curveP = {
              x: p.x - shape?.getScreenP().x,
              y: p.y - shape?.getScreenP().y,
            };

            if (!theCurve) continue;
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
          }
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

      // close unselected shapes or curves
      shapes.forEach((shape) => {
        if (pressing?.shape instanceof Curve) {
          // click curve
          shape.selecting = false;

          for (const d of ds) {
            const theCurve = shape.curves[d].shape;
            if (theCurve && theCurve?.id !== pressing?.shape?.id) {
              theCurve.selecting = false;
            }
          }
        } else {
          // click shape or blank area
          for (const d of ds) {
            const theCurve = shape.curves[d].shape;
            if (theCurve) {
              theCurve.selecting = false;
            }
          }

          if (shape.id !== pressing?.shape?.id) {
            shape.selecting = false;
          }
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
  };

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
          pressing.parent.disConnect(pressing?.direction, true);

          shapes.forEach((shape) => {
            const theEdge = shape.getEdge(),
              threshold = 20,
              isNearShape =
                p.x >= theEdge.l - threshold &&
                p.y >= theEdge.t - threshold &&
                p.x <= theEdge.r + threshold &&
                p.y <= theEdge.b + threshold;

            for (const d of ds) {
              shape.receiving[d] =
                isNearShape &&
                !shape.curves[d]?.shape &&
                !shape.receiveFrom[d]?.shape;
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

    // const shapesInView: (Terminal | Process | Data | Desicion)[] = [];

    // shapes.forEach((shape) => {
    //   if (!$canvas) return;

    //   if (movingCanvas) {
    //     shape.offset = offset;
    //   }

    //   if (shape.checkBoundry(p) && dbClickedShape?.id === shape.id) {
    //     const $dataFrame = document.getElementById(dbClickedShape?.id);
    //     if ($dataFrame) {
    //       const framePosition = getFramePosition(shape);
    //       $dataFrame.style.left = `${framePosition.x}px`;
    //       $dataFrame.style.top = `${framePosition.y}px`;
    //     }
    //   }

    //   const shapeEdge = shape.getEdge(),
    //     isShapeInView =
    //       ((shapeEdge.l >= 0 && shapeEdge.l <= $canvas.width) ||
    //         (shapeEdge.r >= 0 && shapeEdge.r <= $canvas.width)) &&
    //       ((shapeEdge.t >= 0 && shapeEdge.t <= $canvas.height) ||
    //         (shapeEdge.b >= 0 && shapeEdge.b <= $canvas.height));

    //   if (isShapeInView) {
    //     shapesInView.push(shape);
    //   }
    // });

    // // align feature
    // const thePressing = pressing,
    //   stickyOffset = 5;

    // if (thePressing) {
    //   shapesInView.forEach((shapeInView) => {
    //     if (shapeInView.id === thePressing?.shape?.id) return;
    //     if (
    //       !(thePressing.shape instanceof Terminal) &&
    //       !(thePressing.shape instanceof Process) &&
    //       !(thePressing.shape instanceof Desicion) &&
    //       !(thePressing.shape instanceof Data)
    //     )
    //       return;

    //     if (thePressing?.shape?.p.x === shapeInView.p.x && !moveP) {
    //       moveP = {
    //         originalX: p.x,
    //         originalY: p.y,
    //         x: p.x,
    //         y: p.y,
    //       };
    //     } else if (moveP) {
    //       moveP.x = p.x;
    //       moveP.y = p.y;
    //     }

    //     if (
    //       moveP &&
    //       moveP.x &&
    //       moveP.originalX &&
    //       Math.abs(moveP.x - moveP?.originalX) > 10
    //     ) {
    //       moveP = null;
    //     }
    //   });
    // }

    if (selectAreaP && !space) {
      selectAreaP = {
        ...selectAreaP,
        end: p,
      };
    }

    dragP = p;
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

    selectAreaP = null;
    pressing = null;
    moveP = null;
  };

  const onMouseWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    setDataFrame(undefined);
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
      {
        x: -offset.x + window.innerWidth / 2,
        y: -offset.y + window.innerHeight / 2,
      },
      "orange"
    );
    terminal.offset = offset;
    terminal.scale = scale;

    shapes.push(terminal);
    checkData();
  };

  const onClickProcess = () => {
    let process_new = new Process(
      `process_${Date.now()}`,
      200,
      100,
      {
        x: -offset.x + window.innerWidth / 2,
        y: -offset.y + window.innerHeight / 2,
      },
      "red"
    );
    process_new.offset = offset;
    process_new.scale = scale;

    shapes.push(process_new);
    checkData();
  };

  const onClickData = () => {
    let data_new = new Data(
      `data_${Date.now()}`,
      200,
      100,
      {
        x: -offset.x + window.innerWidth / 2,
        y: -offset.y + window.innerHeight / 2,
      },
      "green"
    );
    data_new.scale = scale;
    data_new.offset = offset;

    shapes.push(data_new);
    checkData();
  };

  const onClickDecision = () => {
    let decision_new = new Desicion(
      `decision_${Date.now()}`,
      100,
      100,
      {
        x: -offset.x + window.innerWidth / 2,
        y: -offset.y + window.innerHeight / 2,
      },
      "#3498db"
    );
    decision_new.offset = offset;
    decision_new.scale = scale;

    shapes.push(decision_new);
    checkData();
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
    zoom(-100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
  };

  const onClickScaleMinusIcon = () => {
    if (!$canvas) return;
    zoom(100, { x: $canvas?.width / 2, y: $canvas?.height / 2 });
  };

  const onClickScaleNumber = () => {
    if (!$canvas) return;
    zoom(-((1 / scale - 1) * 500), {
      x: $canvas?.width / 2,
      y: $canvas?.height / 2,
    });
  };

  const onClickDataSidePanelSwitch = () => {
    setIsDataSidePanelOpen((open) => !open);
  };

  const draw = useCallback(() => {
    if (!ctx) return;
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

    // fraw curves in shapes
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

    if (select.shapes.length > 1) {
      // draw select area
      ctx?.beginPath();
      ctx.strokeStyle = "#2436b1";
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

      let terminal_new = new Terminal(
        `terminator_${Date.now()}`,
        200,
        100,
        {
          x: -offset.x + window.innerWidth / 2 + 300,
          y: -offset.y + window.innerHeight / 2 - 200,
        },
        "orange"
      );
      terminal_new.offset = offset;
      terminal_new.scale = scale;
      terminal_new.title = "起點";

      let data_new = new Data(
        `data_${Date.now()}`,
        200,
        100,
        {
          x: -offset.x + window.innerWidth / 2 + 200,
          y: -offset.y + window.innerHeight / 2,
        },
        "green"
      );
      data_new.offset = offset;
      data_new.scale = scale;
      data_new.title = "輸入資料_1";

      let process = new Process(
        `process_${Date.now()}`,
        200,
        100,
        {
          x: -offset.x + window.innerWidth / 2 + 200,
          y: -offset.y + window.innerHeight / 2 + 220,
        },
        "red"
      );
      process.offset = offset;
      process.scale = scale;
      process.title = "程序_1";

      shapes.push(terminal_new);
      shapes.push(data_new);
      shapes.push(process);
      // shapes.push(process_2);
      // shapes.push(data_1);
      // shapes.push(desicion_1);
      // shapes.push(curve);

      checkData()

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

  useEffect(() => {
    console.log("groups", groups);
  }, [groups]);

  const [v, setV] = useState(false);

  useEffect(() => {
    console.log("v", v);
  }, [v]);

  return (
    <>
      <header className="w-full fixed z-50 shadow-md text-gray-600 body-font bg-indigo-100">
        <div className="container mx-auto flex flex-wrap py-2 px-4 flex-col md:flex-row items-center">
          <a className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <span className="ml-3 text-xl">Minder</span>
          </a>
          <nav className="md:ml-auto md:mr-auto flex flex-wrap items-center text-base justify-center">
            <a className="mr-5 hover:text-gray-900">Project_1</a>
          </nav>
          <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-indigo-500 text-white flex-shrink-0 cursor-pointer">
            L
          </div>
        </div>
      </header>

      <div>
        <SidePanel
          open={isDataSidePanelOpen}
          w={"520px"}
          h={"calc(100vh - 56px)"}
          d={["b"]}
          onClickSwitch={onClickDataSidePanelSwitch}
        >
          <ul>
            {groups.map((group, groupI) => {
              const onClickHeadArrow = () => {
                const _groups = cloneDeep(groups);
                _groups[groupI].head.open = !_groups[groupI].head.open;
                setGroups(_groups);
              };

              const Editor = (props: { className: string; shape: Core }) => {
                console.log("props.shape", props.shape);
                return (
                  <>
                    {(props.shape instanceof Process ||
                      props.shape instanceof Data ||
                      props.shape instanceof Desicion) && (
                        <div className={props.className && props.className}>
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
                          <div>
                            <p className="mb-1">Data Usage</p>
                            <ul className="ps-2">
                              {props.shape.options.map((option) => (
                                <li className="mb-1"> · {option.text}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="mb-1">
                              Redundancies
                            </div>
                            <ul className="ps-2">
                              {props.shape.redundancies.map((redundancy) => (
                                <li className="mb-1"> · {redundancy.text}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                  </>
                );
              };

              return (
                <li key={group.head.shape.id} className="mb-1">
                  <Accordion
                    title={group.head.shape.title}
                    // open={group.head.open}
                    open={true}
                    onClickArrow={onClickHeadArrow}
                  >
                    <ul>
                      {group.children.map((child) => (
                        <li key={child.shape.id}>
                          <Accordion
                            className={"ps-2"}
                            title={
                              <div className="flex">
                                <p className="mr-1">{child.shape.title}</p>
                                {/* <svg
                                  className="w-6 h-6 text-gray-800 dark:text-white"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z"
                                  />
                                </svg> */}
                              </div>
                            }
                            // open={group.head.open}
                            open={true}
                          // onClickArrow={}
                          >
                            <Editor className="ps-6" shape={child.shape} />
                          </Accordion>
                        </li>
                      ))}
                    </ul>
                    <Editor className="ps-6" shape={group.head.shape} />
                  </Accordion>
                </li>
              );
            })}
          </ul>
        </SidePanel>
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
          />
        )}
      </div>

      <motion.ul
        className="fixed grid grid-cols-3 items-end p-4 bottom-0 right-0 shadow-md"
        variants={{
          open: {
            width: "calc(100vw - 520px)",
          },
          closed: {
            width: "calc(100vw - 0px)",
          },
        }}
        initial={isDataSidePanelOpen ? "open" : "closed"}
        animate={isDataSidePanelOpen ? "open" : "closed"}
        transition={{ type: "easeInOut" }}
      >
        <li></li>
        <li className="justify-self-center">
          <div className="flex">
            <div
              className="mx-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickTerminator}
            >
              T
            </div>
            <div
              className="mx-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickProcess}
            >
              P
            </div>
            <div
              className="mx-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickData}
            >
              D
            </div>
            <div
              className="mx-2 w-12 h-12 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickDecision}
            >
              De
            </div>
          </div>
        </li>
        <li className="justify-self-end">
          <div className="flex items-center">
            <div
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
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
              className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-indigo-100 text-indigo-500 flex-shrink-0 cursor-pointer"
              onClick={onClickScalePlusIcon}
            >
              +
            </div>
          </div>
        </li>
      </motion.ul>
    </>
  );
}
