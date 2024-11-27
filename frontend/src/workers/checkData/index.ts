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

    // self.postMessage({ ms: "shapes", log: shapes });
    // self.postMessage({ ms: "curves", log: curves });

    shapes.forEach((shape, shapeI) => {
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

    return {
      steps: lastResult.steps,
      shapes: lastResult.shapes,
    };
  };

  let output: { messages: null | CheckDataTypes.Message } = { messages: null };

  const createMessages = (lastResult: {
    steps: CheckDataTypes.Steps;
    shapes: CheckDataTypes.Shapes;
  }) => {
    // self.postMessage({ ms: "lastResult.steps", log: lastResult.steps });
    const messages: CheckDataTypes.Message = {
      errors: [],
      warnings: [],
    };

    Object.entries(lastResult.steps).forEach(([stepId, step]) => {
      step.datas.using.forEach((stepUsingData) => {
        if (step.datas.canUse[stepUsingData.text]) return;
        const shapeI = shapes.findIndex((shape) => shape.id === stepId);
        const dataI = shapes[shapeI].__usingDatas__.findIndex(
          (shapeUsingData) => shapeUsingData.text === stepUsingData.text
        );

        messages.errors.push({
          shape: {
            id: stepId,
            i: shapeI,
          },
          data: {
            id: stepUsingData.id,
            i: dataI,
            text: stepUsingData.text,
            status: CommonTypes.DataStatus.error,
          },
          console: {
            message: `${stepUsingData.text} is either not imported or already removed by preceding steps.`,
          },
        });
      });
    });

    // self.postMessage({ ms: "messages", log: messages });

    output = { messages: messages };

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

  const postToMainThread = async (lastResult: {
    messages: CheckDataTypes.Message;
  }) => {
    if (!lastResult.messages) return false;

    const sendChunks = async (
      messages: CheckDataTypes.TypeMessages,
      type: CheckDataTypes.MessageType
    ) => {
      let index = 0;
      const chunkSize = 1;

      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      const sendNextChunk = async () => {
        if (index < messages.length) {
          self.postMessage({
            type: type,
            messages: messages.slice(index, index + chunkSize),
            done: false,
          });
          index += chunkSize;

          // 延迟发送下一个区块
          await delay(0);
          await sendNextChunk();
        } else {
          // 所有块都已发送，标记为完成
          self.postMessage({
            type: type,
            messages: [],
            done: true,
          });
        }
      };

      await sendNextChunk();
    };

    // 按顺序发送 errors 和 warnings
    await sendChunks(
      lastResult.messages.errors,
      CheckDataTypes.MessageType.error
    );
    await sendChunks(
      lastResult.messages.warnings,
      CheckDataTypes.MessageType.warning
    );

    return false;
  };

  handleUtils.handle([
    () => gatherChunks(currentChunck),
    () => checkData(shapes, curves),
    postToMainThread,
  ]);
};
