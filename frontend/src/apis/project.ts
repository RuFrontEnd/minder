import axios from "axios";

const getProjecs = async () => {
  return axios.get("/project/projects");
};

const createProject = async () => {
  return axios.post("/project/project");
};

export { getProjecs, createProject };
