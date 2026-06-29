import axios from "axios";

// Ensure axios defaults are set correctly before any requests
const initializeAxios = () => {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  axios.defaults.withCredentials = true; // Enable cookies to be sent with requests
};

// Initialize on module load
if (typeof window !== "undefined") {
  initializeAxios();
}

const register = async (
  _account: string,
  _email: string,
  _password: string
) => {
  return axios.post("/auth/register", {
    account: _account,
    email: _email,
    password: _password,
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
