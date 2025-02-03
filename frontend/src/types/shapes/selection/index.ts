import * as CommonTypes from "@/types/common";

enum PressingTarget {
  m = "m",
  l = CommonTypes.Direction.l,
  t = CommonTypes.Direction.t,
  r = CommonTypes.Direction.r,
  b = CommonTypes.Direction.b,
  lt = CommonTypes.Corner.lt,
  rt = CommonTypes.Corner.rt,
  rb = CommonTypes.Corner.rb,
  lb = CommonTypes.Corner.lb,
  ls = "ls",
  ts = "ts",
  rs = "rs",
  bs = "bs",
}

type GetCenterReturn = {};

export type { GetCenterReturn };

export { PressingTarget };
