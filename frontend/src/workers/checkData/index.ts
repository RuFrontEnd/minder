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
  // self.postMessage({ ms: "shapes", log: shapes });
  // self.postMessage({ ms: "curves", log: curves });

  const createSteps = (
    shapes: CheckDataTypes.Shapes,
    curves: CommonTypes.ConnectionCurves
  ) => {
    const steps: CheckDataTypes.Steps = {};
    const cloneShapes = cloneDeep(shapes);
    const cloneCurves = cloneDeep(curves);

    cloneShapes.forEach((shape) => {
      // self.postMessage({ ms: "shape", log: shape });
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

    // self.postMessage({ ms: "steps", log: steps });

    return {
      steps: steps,
    };
  };

  const group = (lastResult: { steps: CheckDataTypes.Steps }) => {
    self.postMessage({ ms: "lastResult.steps", log: lastResult.steps });

    const groups: any = [];
    const visited: any = {};

    Object.keys(lastResult.steps).forEach((stepId) => {
      if (visited[stepId]) return;
      const queue = [stepId];
      const currentGroup: any = [];
      while (queue.length !== 0) {
        const currentStepId = queue[0];
        if (visited[currentStepId]) {
          queue.shift();
          continue;
        }
        currentGroup.push(currentStepId);
        visited[currentStepId] = true;
        const nextSteps = lastResult.steps[currentStepId].to;
        Object.entries(nextSteps).forEach(([_, nextStepIds]) => {
          nextStepIds.forEach((nextStepId) => {
            if (!visited[nextStepId]) {
              queue.push(nextStepId);
            }
          });
        });
      }
      groups.push(currentGroup);
    });

    self.postMessage({ ms: "groups", log: groups });

    return true;
  };

  handleUtils.handle([() => createSteps(shapes, curves), group]);
  // const dataShapes: Data[] = [];

  // shapes.forEach((shape) => {
  //   shape.options = [];
  //   if (shape instanceof Data) {
  //     dataShapes.push(shape);
  //   }
  // });

  // dataShapes.forEach((dataShape) => {
  // traversal all relational steps
  // const queue: (Core | Terminal | Process | Data | Desicion)[] = [
  //   dataShape,
  // ],
  //   locks: { [curveId: string]: boolean } = {}, // prevent from graph cycle
  //   deletedDataMap: { [text: string]: boolean } = {};

  // while (queue.length !== 0) {
  //   const shape = queue[0];

  //   ds.forEach((d) => {
  //     shape.curves[d].forEach((curve) => {
  //       const theSendToShape = curve.sendTo?.shape;

  //       if (!theSendToShape) return;

  //       dataShape.data.forEach((dataItem) => {
  //         if (
  //           theSendToShape.options.some(
  //             (option) => option.text === dataItem.text
  //           ) ||
  //           deletedDataMap[dataItem.text]
  //         )
  //           return;
  //         theSendToShape.options.push(dataItem);
  //       });

  //       theSendToShape.deletedData.forEach((deleteDataItem) => {
  //         deletedDataMap[deleteDataItem.text] = true;
  //       });

  //       if (!locks[curve.shape.id]) {
  //         queue.push(theSendToShape);
  //         locks[curve.shape.id] = true;
  //       }
  //     });
  //   });

  //   queue.shift();
  // }
  // });

  // check all correspondants of shapes' between options and selectedData
  // shapes.forEach((shape) => {
  //   shape.getRedundancies();
  // });

  // const errorShapes: Core[] = shapes.filter(
  //   (shape) => shape.status === CoreTypes.Status.error
  // );

  // errorShapes.forEach((errorShape) => {
  //   // traversal all relational steps
  //   const queue: (Core | Terminal | Process | Data | Desicion)[] = [
  //     errorShape,
  //   ],
  //     locks: { [curveId: string]: boolean } = {}; // prevent from graph cycle

  //   while (queue.length !== 0) {
  //     const shape = queue[0];

  //     if (shape.status !== CoreTypes.Status.error) {
  //       shape.status = CoreTypes.Status.disabled;
  //     }

  // ds.forEach((d) => {
  //   shape.curves[d].forEach((curve) => {
  //     const theSendToShape = curve.sendTo?.shape;

  //     if (!theSendToShape) return;

  //     if (!locks[curve.shape.id]) {
  //       queue.push(theSendToShape);
  //       locks[curve.shape.id] = true;
  //     }
  //   });
  // });

  // queue.shift();
  // }
  // });

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
