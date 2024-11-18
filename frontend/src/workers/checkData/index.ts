import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as handleUtils from "@/utils/handle";
import * as CheckDataTypes from "@/types/workers/checkData";
import { cloneDeep } from "lodash";

const checkData = (
  shapes: (Terminal | Process | Data | Desicion)[],
  curves: CommonTypes.ConnectionCurves
) => {
  self.postMessage({ ms: "shapes", log: shapes });
  self.postMessage({ ms: "curves", log: curves });

  const createGraph = (
    shapes: (Terminal | Process | Data | Desicion)[],
    curves: CommonTypes.ConnectionCurves
  ) => {
    const graph: {
      [index: number]: {
        id: string;
        from: {
          l: string[];
          t: string[];
          r: string[];
          b: string[];
        };
        to: {
          l: string[];
          t: string[];
          r: string[];
          b: string[];
        };
        datas: {
          import: CommonTypes.Datas;
          using: CommonTypes.Datas;
          delete: CommonTypes.Datas;
        };
      };
    } = {};
    const shapesIMap: { [id: string]: number } = {};
    const cloneShapes = cloneDeep(shapes);
    const cloneCurves = cloneDeep(curves);

    cloneShapes.forEach((shape, shapeI) => {
      shapesIMap[shape.id] = shapeI;

      graph[shapeI] = {
        id: shape.id,
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
          import: shape.importDatas,
          using: shape.usingDatas,
          delete: shape.deleteDatas,
        },
      };
    });

    cloneCurves.forEach((curve) => {
      const fromShapeI = shapesIMap[curve.from.shape.id];
      const toShapeI = shapesIMap[curve.to.shape.id];

      graph[fromShapeI]["to"][curve.from.d].push(curve.to.shape.id);
      graph[toShapeI]["from"][curve.to.d].push(curve.from.shape.id);
    });

    self.postMessage({ ms: graph, log: graph });

    return true;
  };

  handleUtils.handle([() => createGraph(shapes, curves)]);
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
let shapes: (Terminal | Process | Data | Desicion)[] = [];
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
    self.postMessage({ ms: "work", log: "work" });
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
