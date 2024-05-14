import axios from "axios";

const getShapes = async (_projectId: number) => {
  return axios.get("/shape/shapes", {
    params: { projectId: _projectId },
  });
};

export { getShapes };
