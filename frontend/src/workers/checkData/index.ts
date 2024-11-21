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

    cloneShapes.forEach((shape) => {
      steps[shape.id] = {
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

  class CheckPointStep {
    id: string;
    from: CheckDataTypes.Step["from"];
    to: CheckDataTypes.Step["to"];
    datas: CheckDataTypes.Step["datas"];

    constructor(stepId: string, step: CheckDataTypes.Step) {
      this.id = stepId;
      this.from = step.from;
      this.to = step.to;
      this.datas = step.datas;
    }
  }

  const findEndStpes = (lastResult: { steps: CheckDataTypes.Steps }) => {
    const endSteps: CheckDataTypes.CheckPointSteps = [];

    Object.entries(lastResult.steps).forEach(([stepId, step]) => {
      if (
        step.to.l.length !== 0 ||
        step.to.t.length !== 0 ||
        step.to.r.length !== 0 ||
        step.to.b.length !== 0
      )
        return;

      endSteps.push(new CheckPointStep(stepId, step));
    });

    return {
      steps: lastResult.steps,
      endSteps: endSteps,
    };
  };

  const checkMissingDatasFromEndSteps = (lastResult: {
    steps: CheckDataTypes.Steps;
    endSteps: CheckDataTypes.CheckPointSteps;
  }) => {
    const visited: CheckDataTypes.Visited = {};
    const missingDatas: CheckDataTypes.MissingDatas = [];

    lastResult.endSteps.forEach((endStep) => {
      const queue = [endStep];
      const currentMissingData: CheckDataTypes.MissingDatas[number] = {};

      while (queue.length !== 0) {
        const currentStep = queue[0];
        currentStep.datas.using.forEach((usingData) => {
          if (currentMissingData[usingData.text]) {
            currentMissingData[usingData.text].push(currentStep.id);
          } else {
            currentMissingData[usingData.text] = [currentStep.id];
          }
        });

        currentStep.datas.import.forEach((importData) => {
          if (!currentMissingData[importData.text]) return;
          delete currentMissingData[importData.text];
        });

        visited[currentStep.id] = true;
        queue.pop();

        ds.forEach((d) => {
          currentStep.from[d].forEach((fromStepId) => {
            if (visited[fromStepId]) return;
            queue.push(
              new CheckPointStep(fromStepId, lastResult.steps[fromStepId])
            );
          });
        });
      }

      if (isEmpty(currentMissingData)) return;
      missingDatas.push(currentMissingData);
    });

    return {
      steps: lastResult.steps,
      visitedByEndSteps: visited,
      missingDatas: missingDatas,
    };
  };

  const findCircularStpes = (lastResult: {
    steps: CheckDataTypes.Steps;
    visitedByEndSteps: CheckDataTypes.Visited;
    missingDatas: CheckDataTypes.MissingDatas;
  }) => {
    const circularSteps: CheckDataTypes.CheckPointSteps = [];

    Object.entries(lastResult.steps).forEach(([stepId, step]) => {
      if (lastResult.visitedByEndSteps[stepId]) return;

      circularSteps.push(new CheckPointStep(stepId, step));
    });

    return {
      steps: lastResult.steps,
      circularSteps: circularSteps,
      missingDatas: lastResult.missingDatas,
    };
  };

  const checkMissingDatasFromCircularSteps = (lastResult: {
    steps: CheckDataTypes.Steps;
    circularSteps: CheckDataTypes.CheckPointSteps;
    missingDatas: CheckDataTypes.MissingDatas;
  }) => {
    const visited: { [stepId: string]: boolean } = {};
    const missingDatas: CheckDataTypes.MissingDatas = [
      ...lastResult.missingDatas,
    ];

    lastResult.circularSteps.forEach((step) => {
      if (visited[step.id]) return;

      const queue = [step];
      const currentMissingData: CheckDataTypes.MissingDatas[number] = {};

      while (queue.length !== 0) {
        const currentStep = queue[0];

        currentStep.datas.using.forEach((usingData) => {
          if (currentMissingData[usingData.text]) {
            currentMissingData[usingData.text].push(currentStep.id);
          } else {
            currentMissingData[usingData.text] = [currentStep.id];
          }
        });

        currentStep.datas.import.forEach((importData) => {
          if (!currentMissingData[importData.text]) return;
          delete currentMissingData[importData.text];
        });

        visited[currentStep.id] = true;
        queue.pop();

        ds.forEach((d) => {
          currentStep.from[d].forEach((fromStepId) => {
            if (visited[fromStepId]) return;
            queue.push(
              new CheckPointStep(fromStepId, lastResult.steps[fromStepId])
            );
          });
        });
      }

      if (isEmpty(currentMissingData)) return;
      missingDatas.push(currentMissingData);
    });

    self.postMessage({ ms: "missingDatas", log: missingDatas });

    return true;
  };

  handleUtils.handle([
    () => createSteps(shapes, curves),
    findEndStpes,
    checkMissingDatasFromEndSteps,
    findCircularStpes,
    checkMissingDatasFromCircularSteps,
  ]);

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
