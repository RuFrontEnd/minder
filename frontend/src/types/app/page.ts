import Core from "@/shapes/core";

type Steps = {
  [shapeId: string]: {
    shape: Core;
    open: boolean;
  };
};

type Procedures = { [shapeId: string]: string[] };

type OtherSteps = string[];

export type { Steps, Procedures, OtherSteps };
