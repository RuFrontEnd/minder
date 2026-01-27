import axios from "axios";

const register = async (
  _password: string,
  _email: string
) => {
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

const jwtLogin = async (token: string) => {
  return axios.post("/auth/jwt-login", undefined, {
    headers: {
      Authorization: `${token}`,
    },
  });
};

export { register, login, jwtLogin };
