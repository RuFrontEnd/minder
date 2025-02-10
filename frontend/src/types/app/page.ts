import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";

type Steps = (Terminal | Process | Data | Desicion)[];

type Procedures = { [shapeId: string]: string[] };

type OtherStepIds = string[];

export type { Steps, Procedures, OtherStepIds };
