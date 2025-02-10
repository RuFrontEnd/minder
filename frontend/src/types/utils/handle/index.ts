type HandlerReturn = boolean | { [lastReturn: string]: any };

type Handler = (lastReturn?: any) => HandlerReturn;

type Handlers = Handler[];

export type { HandlerReturn, Handler, Handlers };
