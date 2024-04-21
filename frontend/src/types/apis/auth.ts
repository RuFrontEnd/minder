import * as CommonTypes from './common'

type Register = {
  ResData: {
    status: CommonTypes.Status,
    message: CommonTypes.Message
  }
}

type Login = {
  ResData: {
    status: CommonTypes.Status,
    message: CommonTypes.Message,
    token: string
  }
}

export type { Register, Login }