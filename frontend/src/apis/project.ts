import axios from "axios";

const getProjecs = async () => {
  return axios.get("/project/projects");
};

export { getProjecs };
