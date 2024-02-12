"use client";
import { useState, useRef, useEffect, useCallback, EventHandler } from "react";
import Image from "next/image";

let lineOffset = 4, // increase operation area
  anchrSize = 2;

type Box = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineWidth: number;
  color: string;
};

let ctx: CanvasRenderingContext2D | null | undefined = null;


export default function StrechBox() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null),
    { current: mousedown } = useRef(false),
    { current: clickedArea } = useRef({ box: -1, pos: "o" }),
    { current: tmpBox } = useRef<Box | null>(null);

  let x1 = -1;
  let y1 = -1;
  let x2 = -1;
  let y2 = -1;
  let boxes: any[] = [];

  const findCurrentArea = (x: number, y: number) => {
    // x, y means the coordinate of mouse clicked point
    for (var i = 0; i < boxes.length; i++) {
      let box = boxes[i];

      const xCenter = box.x1 + (box.x2 - box.x1) / 2,
        yCenter = box.y1 + (box.y2 - box.y1) / 2;

      if (box.x1 - lineOffset < x && x < box.x1 + lineOffset) {
        if (box.y1 - lineOffset < y && y < box.y1 + lineOffset) {
          return { box: i, pos: "tl" };
        } else if (box.y2 - lineOffset < y && y < box.y2 + lineOffset) {
          return { box: i, pos: "bl" };
        } else if (yCenter - lineOffset < y && y < yCenter + lineOffset) {
          return { box: i, pos: "l" };
        }
      } else if (box.x2 - lineOffset < x && x < box.x2 + lineOffset) {
        if (box.y1 - lineOffset < y && y < box.y1 + lineOffset) {
          return { box: i, pos: "tr" };
        } else if (box.y2 - lineOffset < y && y < box.y2 + lineOffset) {
          return { box: i, pos: "br" };
        } else if (yCenter - lineOffset < y && y < yCenter + lineOffset) {
          return { box: i, pos: "r" };
        }
      } else if (xCenter - lineOffset < x && x < xCenter + lineOffset) {
        if (box.y1 - lineOffset < y && y < box.y1 + lineOffset) {
          return { box: i, pos: "t" };
        } else if (box.y2 - lineOffset < y && y < box.y2 + lineOffset) {
          return { box: i, pos: "b" };
        } else if (box.y1 - lineOffset < y && y < box.y2 + lineOffset) {
          return { box: i, pos: "i" };
        }
      } else if (box.x1 - lineOffset < x && x < box.x2 + lineOffset) {
        if (box.y1 - lineOffset < y && y < box.y2 + lineOffset) {
          return { box: i, pos: "i" };
        }
      }
    }
    return { box: -1, pos: "o" };
  };

  const newBox = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      const _x1 = x1 < x2 ? x1 : x2,
        _y1 = y1 < y2 ? y1 : y2,
        _x2 = x1 > x2 ? x1 : x2,
        _y2 = y1 > y2 ? y1 : y2;

      // if (_x2 - _x1 > lineOffset * 2 && _y2 - _y1 > lineOffset * 2) {
      return {
        x1: _x1,
        y1: _y1,
        x2: _x2,
        y2: _y2,
        lineWidth: 1,
        color: "DeepSkyBlue",
      };
      // } else {
      //   return null;
      // }
    },
    []
  );

  const drawBoxOn = useCallback((box: Box, ctx: CanvasRenderingContext2D) => {
    const xCenter = box.x1 + (box.x2 - box.x1) / 2,
      yCenter = box.y1 + (box.y2 - box.y1) / 2;

    ctx.beginPath();

    ctx.strokeStyle = box.color;
    ctx.fillStyle = box.color;
    ctx.lineWidth = box.lineWidth;

    ctx.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.stroke();

    // draw anchors
    ctx.fillRect(
      box.x1 - anchrSize,
      box.y1 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    ); // x, y, width, height
    ctx.fillRect(
      box.x1 - anchrSize,
      yCenter - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      box.x1 - anchrSize,
      box.y2 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      xCenter - anchrSize,
      box.y1 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      xCenter - anchrSize,
      yCenter - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      xCenter - anchrSize,
      box.y2 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      box.x2 - anchrSize,
      box.y1 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      box.x2 - anchrSize,
      yCenter - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );
    ctx.fillRect(
      box.x2 - anchrSize,
      box.y2 - anchrSize,
      2 * anchrSize,
      2 * anchrSize
    );

    ctx.closePath();
  }, []);

  const redraw = useCallback(() => {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < boxes.length; i++) {
      drawBoxOn(boxes[i], ctx);
    }
    if (clickedArea.box === -1) {
      tmpBox = newBox(x1, y1, x2, y2);
      if (tmpBox !== null) {
        drawBoxOn(tmpBox, ctx);
      }
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    mousedown = true;
    x1 = e.nativeEvent.offsetX;
    y1 = e.nativeEvent.offsetY;
    x2 = e.nativeEvent.offsetX;
    y2 = e.nativeEvent.offsetY;
    clickedArea = findCurrentArea(x1, y1);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mousedown && clickedArea.box === -1) { // clickedArea.box === -1 means not pressing on any boxes
      x2 = e.nativeEvent.offsetX;
      y2 = e.nativeEvent.offsetY;
      redraw();
    } else if (mousedown && clickedArea.box != -1) {
      x2 = e.nativeEvent.offsetX;
      y2 = e.nativeEvent.offsetY;

      let xOffset = x2 - x1,
        yOffset = y2 - y1;

      x1 = x2;
      y1 = y2;
      
      if (clickedArea.pos === 'i' ||
        clickedArea.pos === 'tl' ||
        clickedArea.pos === 'l' ||
        clickedArea.pos === 'bl') {
        boxes[clickedArea.box].x1 += xOffset;
      }
      if (clickedArea.pos === 'i' ||
        clickedArea.pos === 'tl' ||
        clickedArea.pos === 't' ||
        clickedArea.pos === 'tr') {
        boxes[clickedArea.box].y1 += yOffset;
      }
      if (clickedArea.pos === 'i' ||
        clickedArea.pos === 'tr' ||
        clickedArea.pos === 'r' ||
        clickedArea.pos === 'br') {
        boxes[clickedArea.box].x2 += xOffset;
      }
      if (clickedArea.pos === 'i' ||
        clickedArea.pos === 'bl' ||
        clickedArea.pos === 'b' ||
        clickedArea.pos === 'br') {
        boxes[clickedArea.box].y2 += yOffset;
      }

      redraw();
    }
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (clickedArea.box === -1 && tmpBox !== null) {
      boxes.push(tmpBox);
    }
    // else if (clickedArea.box != -1) {
    //   var selectedBox = boxes[clickedArea.box];
    //   if (selectedBox.x1 > selectedBox.x2) {
    //     var previousX1 = selectedBox.x1;
    //     selectedBox.x1 = selectedBox.x2;
    //     selectedBox.x2 = previousX1;
    //   }
    //   if (selectedBox.y1 > selectedBox.y2) {
    //     var previousY1 = selectedBox.y1;
    //     selectedBox.y1 = selectedBox.y2;
    //     selectedBox.y2 = previousY1;
    //   }
    // }
    tmpBox = null;
    mousedown = false;
  }, []);

  useEffect(() => {
    if ($canvas) {
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
    }
  }, []);

  return (
    <canvas
      ref={(el) => {
        $canvas = el;
        ctx = $canvas?.getContext("2d");
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    />
    // <main style={{ width: '100px', height: '100px' }}

    //   onClick={() => {
    //     setEditing(false)
    //   }}>

    //   <div className='fixed top-[50px] left-[50px] border border-black '
    //     onDoubleClick={() => {
    //       setEditing(true)
    //       if ($textArea.current) {
    //         $textArea.current.focus()
    //       }
    //     }}>
    //     <textarea style={{ height: height }}
    //       disabled={!editing}
    //       value={text}
    //       className='resize-none focus:outline-none overflow-hidden block'
    //       ref={$textArea}
    //       onClick={(e) => { e.stopPropagation() }}
    //       onInput={(e) => {
    //         const textarea = e.currentTarget;
    //         textarea.style.height = "auto";
    //         textarea.style.height = textarea.scrollHeight - 1 + "px";
    //         setText(textarea.value)
    //       }} />
    //   </div>
    // </main >
  );
}
