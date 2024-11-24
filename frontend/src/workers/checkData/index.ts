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

    self.postMessage({ ms: "cloneShapes", log: cloneShapes });

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
          options: {},
          removals: {},
        },
      };
    });

    cloneCurves.forEach((curve) => {
      steps[curve.from.shape.id]["to"][curve.from.d].push(curve.to.shape.id);
      steps[curve.to.shape.id]["from"][curve.to.d].push(curve.from.shape.id);
    });

    self.postMessage({ ms: "steps", log: steps });

    return {
      steps: steps,
    };
  };

  const checkData = (lastResult: { steps: CheckDataTypes.Steps }) => {
    self.postMessage({
      ms: "lastResult.steps",
      log: lastResult.steps,
    });

    Object.values(lastResult.steps).forEach((step) => {
      self.postMessage({
        ms: "----",
        log: "----",
      });
      self.postMessage({
        ms: "step",
        log: step,
      });
      const currentOptionAvailabilties: CheckDataTypes.ExternalDatas = {};
      const visited: CheckDataTypes.Visited = {};
      const queue = [step];

      while (queue.length !== 0) {
        const currentStep = queue.shift();

        if (!currentStep || visited[currentStep.id]) continue;

        if (step.id === currentStep.id) {
          step.datas.import.forEach((importData) => {
            currentOptionAvailabilties[importData.text] = true;
          });

          step.datas.delete.forEach((deleteData) => {
            delete currentOptionAvailabilties[deleteData.text];
          });
        } else {
          currentStep.datas.import.forEach((importData) => {
            if (!(importData.text in currentOptionAvailabilties)) return;
            currentOptionAvailabilties[importData.text] = true;
          });

          currentStep.datas.delete.forEach((deleteData) => {
            if (!(deleteData.text in currentOptionAvailabilties)) return;
            currentOptionAvailabilties[deleteData.text] = false;
          });
        }

        self.postMessage({ ms: "currentStep.id", log: currentStep.id });
        self.postMessage({ ms: "currentOptionAvailabilties", log: currentOptionAvailabilties });

        Object.entries(currentOptionAvailabilties).forEach(
          ([data, isAvailable]) => {

            self.postMessage({ ms: "data", log: data });
            self.postMessage({ ms: "isAvailable", log: isAvailable });
            if (!isAvailable) return;
            currentStep.datas.options[data] = true;
          }
        );

        visited[currentStep.id] = true;

        ds.forEach((d) => {
          currentStep.to[d].forEach((toStepId) => {
            if (!visited[toStepId]) {
              queue.push(lastResult.steps[toStepId]);
            }
          });
        });
      }
    });

    self.postMessage({ ms: "lastResult.steps", log: lastResult.steps });

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
