import Terminal from "@/shapes/terminal";
import Process from "@/shapes/process";
import Data from "@/shapes/data";
import Desicion from "@/shapes/decision";
import * as CommonTypes from "@/types/common";
import * as handleUtils from "@/utils/handle";
import * as CheckDataTypes from "@/types/workers/checkData";

const checkData = (shapes: (Terminal | Process | Data | Desicion)[]) => {
  self.postMessage({ shapes: shapes });

  const group = (shapes: (Terminal | Process | Data | Desicion)[]) => {
    return true;
  };

  handleUtils.handle([() => group(shapes)]);
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

  return Array.from({ length: 1000000 }, (_, i) => i + 1);

  // [{ test: 1 }, { test: 2 }, { test: 3 }, { test: 4 }, { test: 5 }];
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

    self.postMessage({ ms: "shapes", log: shapes });
    self.postMessage({ ms: "curves", log: curves });

    return false;
  };

  const postConsole = () => {
    self.postMessage({ ms: "work", log: "work" });
    return false;
  };

  handleUtils.handle([() => gatherChunks(currentChunck), () => postConsole()]);
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
