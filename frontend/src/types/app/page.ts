import Core from "@/shapes/core";

type Steps = {
  [shapeId: string]: {
    shape: Core;
    open: boolean;
  };
};

type Procedures = { [shapeId: string]: string[] };

type OtherStepIds = string[];

export type { Steps, Procedures, OtherStepIds };
