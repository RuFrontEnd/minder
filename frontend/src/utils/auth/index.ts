import axios, { AxiosResponse } from "axios";
import * as AuthTypes from "@/types/apis/auth";
import * as authAPIs from "@/apis/auth";

const verifyToken = async (doWhenFail: () => void) => {
  const token = localStorage.getItem("Authorization");

  if (token) {
    const res: AxiosResponse<AuthTypes.JWTLogin["resData"]> =
      await authAPIs.jwtLogin(token);

    if (res.data.isPass) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      doWhenFail();
    }
  } else {
    doWhenFail();
  }
};

const logout = (callback: () => void) => {
  localStorage.removeItem("Authorization");
  callback()
};

export { verifyToken, logout };
