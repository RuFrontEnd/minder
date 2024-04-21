import axios from "axios";

const register = async (
  _account: string,
  _password: string,
  _email: string
) => {
  return axios.post("/auth/register", {
    account: _account,
    password: _password,
    email: _email,
  });
};

const login = async (
  _account: string,
  _password: string,
) => {
  return axios.post("/auth/login", {
    account: _account,
    password: _password,
  });
};

export { register, login };
