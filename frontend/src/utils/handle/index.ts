import * as HandleTypes from "@/types/utils/handle";

const handle = (handlers: HandleTypes.Handlers) => {
  let i = 0;
  while (i < handlers.length) {
    const isGoOn = handlers[i]();
    if (!isGoOn) break;
    i++;
  }
};

export { handle };
