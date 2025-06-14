import * as CommonTypes from "@/types/common";

enum PressingTarget {
  m = "m",
  lt = CommonTypes.Corner.lt,
  rt = CommonTypes.Corner.rt,
  rb = CommonTypes.Corner.rb,
  lb = CommonTypes.Corner.lb,
  sl = "sl",
  st = "st",
  sr = "sr",
  sb = "sb",
}

type GetCenterReturn = {};

export type { GetCenterReturn };

export { PressingTarget };
