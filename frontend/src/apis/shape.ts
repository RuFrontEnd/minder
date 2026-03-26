import axios from "axios";
import * as ShapeTypes from "@/types/apis/shape";

const getShapes = async () => {
  return axios.get("/shape");
};

const upsert = async (payload: ShapeTypes.UpsertRequest | ShapeTypes.UpsertData[]) => {
  return axios.post("/shape", payload);
};

export { getShapes, upsert };
