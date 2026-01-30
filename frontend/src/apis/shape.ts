import axios from "axios";
import * as ShapeTypes from "@/types/apis/shape";

const upsert = async (payload: ShapeTypes.UpsertData[]) => {
  return axios.post("/shape", payload);
};

export { upsert };
