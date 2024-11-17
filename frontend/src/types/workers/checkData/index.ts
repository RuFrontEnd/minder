import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";

type EventData = {
  shapes: (Terminal | Process | Data | Desicion)[];
  curves: CommonTypes.ConnectionCurves;
  done: boolean;
};

export type { EventData };
