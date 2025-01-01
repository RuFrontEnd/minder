import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as handleUtils from "@/utils/handle";
import * as CheckDataTypes from "@/types/workers/checkData";
import * as CoreTypes from "@/types/shapes/core";
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

    // self.postMessage({ ms: "shapes", log: shapes });
    // self.postMessage({ ms: "curves", log: curves });

    shapes.forEach((shape, shapeI) => {
      steps[shape.id] = {
        title: shape.title,
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

    curves.forEach((curve) => {
      steps[curve.from.shape.id]["to"][curve.from.d].push(curve.to.shape.id);
      steps[curve.to.shape.id]["from"][curve.to.d].push(curve.from.shape.id);
    });

    // self.postMessage({ ms: "steps", log: steps });

    return {
      steps: steps,
      shapes: shapes,
    };
  };

  const checkData = (lastResult: {
    steps: CheckDataTypes.Steps;
    shapes: CheckDataTypes.Shapes;
  }) => {
    Object.values(lastResult.steps).forEach((step) => {
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

        Object.entries(currentCanUseDatas).forEach(
          ([dataText, isAvailable]) => {
            if (!isAvailable) return;
            currentStep.datas.canUse[dataText] = true;
          }
        );

        currentStep.datas.using.forEach((data) => {
          if (data.text in currentGottenDatas) {
            currentGottenDatas[data.text].forEach((stepId) => {
              if (currentStep.records.gottenBy[data.text]) {
                currentStep.records.gottenBy[data.text].add(stepId);
              } else {
                currentStep.records.gottenBy[data.text] = new Set([stepId]);
              }
            });
          }

          if (data.text in currentRemovedDatas) {
            currentRemovedDatas[data.text].forEach((stepId) => {
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

    // self.postMessage({ ms: "lastResult.steps", log: lastResult.steps });

    return {
      steps: lastResult.steps,
      shapes: lastResult.shapes,
    };
  };

  let output: CheckDataTypes.MessageShapes = [];

  const createMessages = (lastResult: {
    steps: CheckDataTypes.Steps;
    shapes: CheckDataTypes.Shapes;
  }) => {
    const steps = Object.entries(lastResult.steps);

    const messageShapes: CheckDataTypes.MessageShapes = Array.from(
      { length: steps.length },
      () => ({
        id: "",
        status: CoreTypes.Status.normal,
        datas: [],
      })
    );

    steps.forEach(([stepId, step]) => {
      const shapeI = shapes.findIndex((shape) => shape.id === stepId);
      messageShapes[shapeI].id = stepId;

      step.datas.using.forEach((stepUsingData) => {
        const dataI = shapes[shapeI].__usingDatas__.findIndex(
          (shapeUsingData) => shapeUsingData.text === stepUsingData.text
        );
        if (step.datas.canUse[stepUsingData.text]) {
          messageShapes[shapeI].datas.push({
            id: stepUsingData.id,
            i: dataI,
            text: stepUsingData.text,
            status: CommonTypes.DataStatus.pass,
            console: null,
          });
        } else if (
          !step.datas.canUse[stepUsingData.text] &&
          !step.records.gottenBy[stepUsingData.text]
        ) {
          messageShapes[shapeI].status = CoreTypes.Status.error;
          messageShapes[shapeI].datas.push({
            id: stepUsingData.id,
            i: dataI,
            text: stepUsingData.text,
            status: CommonTypes.DataStatus.error,
            console: {
              message: `[ ${step.title} ] "${stepUsingData.text}" is not imported by preceding steps.`,
              status: CommonTypes.DataStatus.error,
            },
          });
        } else if (
          !step.datas.canUse[stepUsingData.text] &&
          step.records.removedBy[stepUsingData.text]?.size > 0
        ) {
          messageShapes[shapeI].status = CoreTypes.Status.error;
          step.records.removedBy[stepUsingData.text].forEach(
            (removedByStepId) => {
              const removedByStep = lastResult.steps[removedByStepId].title;
              messageShapes[shapeI].datas.push({
                id: stepUsingData.id,
                i: dataI,
                text: stepUsingData.text,
                status: CommonTypes.DataStatus.pass,
                console: {
                  message: `[ ${step.title} ] "${stepUsingData.text}" has been removed by "${removedByStep}".`,
                  status: CommonTypes.DataStatus.error,
                },
              });
            }
          );
        }
      });
    });

    // self.postMessage({ ms: "messageShapes", log: messageShapes });

    output = messageShapes;
    return false;
  };

  handleUtils.handle([
    () => createSteps(shapes, curves),
    checkData,
    createMessages,
  ]);

  return output;
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

  const postToMainThread = async (messageShapes: any) => {
    if (!messageShapes) return false;

    self.postMessage({ ms: "messageShapes", log: messageShapes });

    const sendChunks = async (messageShapes: CheckDataTypes.TypeMessages) => {
      let index = 0;
      const chunkSize = 1;

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const sendNextChunk = async () => {
        if (index < messageShapes.length) {
          self.postMessage({
            messageShapes: messageShapes.slice(index, index + chunkSize),
            done: false,
          });
          index += chunkSize;

          await delay(1500);
          await sendNextChunk();
        } else {
          self.postMessage({
            messageShapes: [],
            done: true,
          });
        }
      };

      await sendNextChunk();
    };

    await sendChunks(messageShapes);

    return false;
  };

  handleUtils.handle([
    () => gatherChunks(currentChunck),
    () => checkData(shapes, curves),
    postToMainThread,
  ]);
};
