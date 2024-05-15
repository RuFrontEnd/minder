import axios from "axios";
import * as ShapeAPITypes from "@/types/apis/shape";

const getShapes = async (_projectId: number) => {
  return axios.get("/shape/shapes", {
    params: { projectId: _projectId },
  });
};

const createShapes = async (
  _data: ShapeAPITypes.CreateShapes["data"]
) => {
  return axios.post("/shape/shapes", {
    data: _data,
  });
};

export { getShapes, createShapes };
