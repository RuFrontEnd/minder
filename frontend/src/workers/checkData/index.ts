import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as handleUtils from "@/utils/handle";
import * as CheckDataTypes from "@/types/workers/checkData";
import { cloneDeep } from "lodash";

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
    self.postMessage({ ms: "cloneCurves", log: cloneCurves });

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
          canUse: {},
        },
        records: {
          gottenBy: {},
          removedBy: {},
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
        ms: "----------------------------------------",
        log: ""
      });
      self.postMessage({
        ms: "step",
        log: step,
      });
      const currentCanUseDatas: CheckDataTypes.CanUseDatas = {};
      const currentGottenDatas: CheckDataTypes.RecordDatas = {};
      const currentRemovedDatas: CheckDataTypes.RecordDatas = {};
      const visited: CheckDataTypes.Visited = {};
      const queue = [step];

      while (queue.length !== 0) {
        const currentStep = queue.shift();

        if (!currentStep || visited[currentStep.id]) continue;

        if (step.id === currentStep.id) {
          step.datas.import.forEach((importData) => {
            currentGottenDatas[importData.text] = new Set([currentStep.id]);

            currentCanUseDatas[importData.text] = true;
          });

          step.datas.delete.forEach((deleteData) => {
            currentRemovedDatas[deleteData.text] = new Set([currentStep.id]);

            delete currentCanUseDatas[deleteData.text];
          });
        } else {
          currentStep.datas.import.forEach((importData) => {
            if (importData.text in currentGottenDatas) {
              currentGottenDatas[importData.text].add(currentStep.id);
            } else {
              currentGottenDatas[importData.text] = new Set([currentStep.id]);
            }

            if (!(importData.text in currentCanUseDatas)) return;
            currentCanUseDatas[importData.text] = true;
          });

          currentStep.datas.delete.forEach((deleteData) => {
            if (deleteData.text in currentRemovedDatas) {
              currentRemovedDatas[deleteData.text].add(currentStep.id);
            } else {
              currentRemovedDatas[deleteData.text] = new Set([currentStep.id]);
            }

            if (!(deleteData.text in currentCanUseDatas)) return;
            currentCanUseDatas[deleteData.text] = false;
          });
        }

        self.postMessage({ ms: "currentStep.id", log: currentStep.id });
        self.postMessage({
          ms: "currentGottenDatas",
          log: currentGottenDatas,
        });
        self.postMessage({
          ms: "currentRemovedDatas",
          log: currentRemovedDatas,
        });

        Object.entries(currentCanUseDatas).forEach(
          ([dataText, isAvailable]) => {
            if (!isAvailable) return;
            currentStep.datas.canUse[dataText] = true;
          }
        );

        currentStep.datas.using.forEach((data) => {
          if (data.text in currentGottenDatas) {
            currentGottenDatas[data.text].forEach((stepId) => {
              self.postMessage({
                ms: "currentStep.records.gottenBy",
                log: currentStep.records.gottenBy,
              });
              if (currentStep.records.gottenBy[data.text]) {
                currentStep.records.gottenBy[data.text].add(stepId);
              } else {
                currentStep.records.gottenBy[data.text] = new Set([stepId]);
              }
            });
          }

          if (data.text in currentRemovedDatas) {
            currentRemovedDatas[data.text].forEach((stepId) => {
              self.postMessage({
                ms: "currentStep.records.removedBy",
                log: currentStep.records.removedBy,
              });
              if (currentStep.records.removedBy[data.text]) {
                currentStep.records.removedBy[data.text].add(stepId);
              } else {
                currentStep.records.removedBy[data.text] = new Set([stepId]);
              }
            });
          }
        });

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
