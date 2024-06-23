import axios from "axios";
import * as ShapeAPITypes from "@/types/apis/shape";

const getShapes = async (_projectId: number) => {
  return axios.get("/shape/shapes", {
    params: { projectId: _projectId },
  });
};

const updateShapes = async (_data: ShapeAPITypes.UpdateShapes["data"]) => {
  return axios.put("/shape/shapes", {
    data: _data,
  });
};

export { getShapes, updateShapes };
