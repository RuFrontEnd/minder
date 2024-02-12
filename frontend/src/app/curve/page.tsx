"use client";
import { useRef, useEffect, useCallback } from "react";
import Curve from '@/shapes/curve'

let ctx: CanvasRenderingContext2D | null | undefined = null;

enum ShapeType {
  curve = "curve",
}

const initPressingShape = {
  type: null,
  index: -1,
};

let pressingShape: {
  type: ShapeType | null;
  index: number;
} = initPressingShape;

let shapes: any[] = [];

export default function CurvePage() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    let $canvas = document.querySelector("canvas");
    if (!ctx || !$canvas) return;
    let cpline = {
        w: 1,
        c: "#c00",
      },
      curve = {
        w: 6,
        c: "#333",
      },
      pressingP = {
        x: e.nativeEvent.x,
        y: e.nativeEvent.y,
      };

    shapes.forEach((shape, shapeI) => {
      if (shape.checkBoundry($canvas, pressingP)) {
        pressingShape = {
          type: ShapeType.curve,
          index: shapeI,
        };
      }
    });

    if (pressingShape.index > -1) {
      shapes[pressingShape.index].onMouseDown($canvas);
      return;
    }

    // if(type === 'curve'){ // TODO: 待之後有不同工具時做判斷
    let newCurve = new Curve(cpline, curve, 300);
    shapes.push(newCurve);
    newCurve.init(pressingP);
    // }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    shapes.forEach((shape) => {
      if (shape instanceof Curve) {
        shape.onMouseMove({
          x: e.nativeEvent.x,
          y: e.nativeEvent.y,
        });
      }
    });
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    let $canvas = document.querySelector("canvas");
    if (!$canvas) return;

    shapes.forEach((shape) => {
      if (!$canvas) return;
      if (shape instanceof Curve) {
        shape.onMouseUp($canvas);
      }
    });
    pressingShape = initPressingShape;
  }, []);

  const draw = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    shapes.forEach((shape) => {
      if (!ctx) return;
      if (shape instanceof Curve) {
        shape.draw(ctx);
      }
    });
    window.requestAnimationFrame(draw);
  };

  useEffect(() => {
    if ($canvas) {
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      window.requestAnimationFrame(draw);
    }
  }, []);

  return (
    <canvas
      ref={(el) => {
        $canvas = el;
        ctx = $canvas?.getContext("2d");
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}
