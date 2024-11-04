import * as HandleTypes from "@/types/utils/handle";

const handle = (handlers: HandleTypes.Handlers) => {
  let i = 0;
  let lastReturn = null;
  while (i < handlers.length) {
    const handlerReturn: HandleTypes.HandlerReturn =
      typeof lastReturn === "boolean" ? handlers[i]() : handlers[i](lastReturn);

    lastReturn = handlerReturn;

    if (!handlerReturn) break;
    i++;
  }
};

export { handle };
