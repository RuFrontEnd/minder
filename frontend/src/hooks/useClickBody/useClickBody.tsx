import { useEffect } from "react";
import * as Types from "./useClickBodyTypes.d";

const useClickBody = (
  callback: Types.Callback,
  targetId: Types.TargetId,
  _deps?: React.DependencyList
) => {
  const deps = _deps ? _deps : [];

  useEffect(() => {
    const onClickBody = (e: MouseEvent) => {
      if (e.target === null) return;

      let currentElement = e.target as Element;

      while (currentElement) {
        if (currentElement?.id == targetId) return;
        if (currentElement.nodeName === "BODY") {
          return callback();
        }
        currentElement = currentElement.parentNode as Element;
      }
    };

    document.body.addEventListener("click", onClickBody);

    return () => {
      document.body.removeEventListener("click", onClickBody);
    };
  }, [...deps]);
};

export default useClickBody;
