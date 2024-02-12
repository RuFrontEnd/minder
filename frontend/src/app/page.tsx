"use client";
import { useState, useRef, useEffect, useCallback } from "react";

let ctx: CanvasRenderingContext2D | null | undefined = null;

export default function Home() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {},
    []
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {},
    []
  );

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {},
  []);

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
  );
}
