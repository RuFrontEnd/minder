import Core from "@/shapes/core";
import Process from "@/shapes/process";
import Curve from "@/shapes/curve";

type Id = string;

type W = number;

type H = number;

type C = string;

type Vec = { x: number; y: number };

type Shapes = Core | Process | Curve;

enum Direction {
  l = "l",
  t = "t",
  r = "r",
  b = "b",
}

type Title = string;

type DataItem = { id: string; text: string };

type Data = DataItem[];

export type { Id, W, H, C, Vec, Shapes, Title, DataItem, Data };
export { Direction };
