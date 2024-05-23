import * as CommonTypes from "./common";

type Register = {
  resData: {
    status: CommonTypes.Status;
    message: CommonTypes.Message;
  };
};

type Login = {
  resData: {
    status: CommonTypes.Status;
    message: CommonTypes.Message;
    token: string;
  };
};

type JWTLogin = {
  resData: {
    status: CommonTypes.Status;
    isPass: boolean;
    message: CommonTypes.Message;
  };
};

export type { Register, Login, JWTLogin };
