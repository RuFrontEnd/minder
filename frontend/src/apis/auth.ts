import axios from "axios";

const register = async (_password: string, _email: string) => {
  return axios.post("/auth/register", {
    password: _password,
    email: _email,
  });
};

const login = async (_email: string, _password: string) => {
  return axios.post("/auth/login", {
    email: _email,
    password: _password,
  });
};

const logout = async () => {
  return axios.post("/auth/logout");
};

const validateToken = async () => {
  return axios.post("/auth/validateToken");
};

const refresh = async () => {
  return axios.post("/auth/refresh");
};

export { register, login, logout, validateToken, refresh };
