"use client";
import { useRef, useEffect, useCallback } from "react";

let ctx: CanvasRenderingContext2D | null | undefined = null;

export default function TextBox() {
  let { current: $canvas } = useRef<HTMLCanvasElement | null>(null);

  const drawScreen = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    ctx.fillStyle = 'black'
    ctx.font = "20pt Arial";
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';


    ctx.beginPath()
    ctx.fillRect(100, 100, 300, 300) // x: number, y: number, w: number, h: number
    ctx.fill();

    ctx.fillStyle = "red";

    ctx.fillText("SA", 250, 250);
    ctx.closePath()
  }

  function init() {
    drawScreen();
  }

  useEffect(() => {
    if ($canvas) {
      $canvas.width = window.innerWidth;
      $canvas.height = window.innerHeight;
      init();
    }
  }, []);

  return (
    <>
      <canvas
        ref={(el) => {
          $canvas = el;
          ctx = $canvas?.getContext("2d");
        }}
      />
      <input value="SA" style={{
        position: 'absolute',
        top: '250px',
        left: '250px',
        color: 'red',
        fontSize: '20px',
        fontFamily: 'Arial',
        opacity: '0.5',
        textAlign: 'center',
        transform: 'translate(-50%, -50%)',
        verticalAlign: 'middle'
      }} />
    </>
  );
}
