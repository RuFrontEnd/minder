import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as handleUtils from "@/utils/handle";
import * as CheckDataTypes from "@/types/workers/checkData";
import { cloneDeep, isEmpty } from "lodash";

const ds = [
  CommonTypes.Direction.l,
  CommonTypes.Direction.t,
  CommonTypes.Direction.r,
  CommonTypes.Direction.b,
];

const checkData = (
  shapes: CheckDataTypes.Shapes,
  curves: CommonTypes.ConnectionCurves
) => {
  const createSteps = (
    shapes: CheckDataTypes.Shapes,
    curves: CommonTypes.ConnectionCurves
  ) => {
    const steps: CheckDataTypes.Steps = {};
    const cloneShapes = cloneDeep(shapes);
    const cloneCurves = cloneDeep(curves);

    cloneShapes.forEach((shape, shapeI) => {
      steps[shape.id] = {
        id: shape.id,
        index: shapeI,
        from: {
          l: [],
          t: [],
          r: [],
          b: [],
        },
        to: {
          l: [],
          t: [],
          r: [],
          b: [],
        },
        datas: {
          import: shape.__importDatas__,
          using: shape.__usingDatas__,
          delete: shape.__deleteDatas__,
        },
      };
    });

    cloneCurves.forEach((curve) => {
      steps[curve.from.shape.id]["to"][curve.from.d].push(curve.to.shape.id);
      steps[curve.to.shape.id]["from"][curve.to.d].push(curve.from.shape.id);
    });

    return {
      steps: steps,
    };
  };

  const checkData = (lastResult: { steps: CheckDataTypes.Steps }) => {
    const missingDatas: CheckDataTypes.MissingDatas = [];

    Object.values(lastResult.steps).forEach((step) => {
      const currentMissingDatas: {
        [dataText: string]: boolean;
      } = {};
      step.datas.using.forEach((usingData) => {
        currentMissingDatas[usingData.text] = true;
      });

      const visited: CheckDataTypes.Visited = {};
      const queue = [step];

      while (queue.length !== 0) {
        const currentStep = queue.shift();

        if (!currentStep || visited[currentStep.id]) continue;
        visited[currentStep.id] = true;

        currentStep.datas.import.forEach((importData) => {
          if (currentMissingDatas[importData.text]) {
            delete currentMissingDatas[importData.text];
          }
        });

        ds.forEach((d) => {
          currentStep.from[d].forEach((fromStepId) => {
            if (!visited[fromStepId]) {
              queue.push(lastResult.steps[fromStepId]);
            }
          });
        });
      }

      Object.keys(currentMissingDatas).forEach((currentMissingData) => {
        missingDatas.push({
          stepId: step.id,
          index: step.index,
          data: currentMissingData,
        });
      });
    });

    self.postMessage({ ms: "missingDatas", log: missingDatas });

    return true;
  };

  handleUtils.handle([() => createSteps(shapes, curves), checkData]);

  return true;
};
let shapes: CheckDataTypes.Shapes = [];
let curves: CommonTypes.ConnectionCurves = [];

self.onmessage = function (event: MessageEvent<string>) {
  const currentChunck: CheckDataTypes.EventData = JSON.parse(event.data);

  const gatherChunks = (currentChunck: CheckDataTypes.EventData) => {
    if (currentChunck.shapes.length !== 0) {
      shapes = [...shapes, ...currentChunck.shapes];
    }

    if (currentChunck.curves.length !== 0) {
      curves = [...curves, ...currentChunck.curves];
    }

    if (
      currentChunck.shapes.length === 0 &&
      currentChunck.curves.length === 0 &&
      currentChunck.done
    ) {
      return true;
    }

    return false;
  };

  const postConsole = () => {
    // self.postMessage({ ms: "work", log: "work" });
    return false;
  };

  handleUtils.handle([
    () => gatherChunks(currentChunck),
    () => checkData(shapes, curves),
    () => postConsole(),
  ]);
};

// const logs = checkData(shapes);
// let index = 0;
// let chunckSize = 10000;

// const sendChunck = () => {
//   if (index > logs.length) return;
//   const chunck = logs.slice(index, index + chunckSize);
//   self.postMessage(chunck);
//   index += chunckSize;
//   setTimeout(sendChunck, 0);
// };

// sendChunck();
