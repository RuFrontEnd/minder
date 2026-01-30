type Data = {
  id: string;
  text: string;
  status: string;
};

type UpsertData = {
  id: string;
  title: string;
  w: number;
  h: number;
  p: {
    x: number;
    y: number;
  };
  importDatas: Data[];
  usingDatas: Data[];
  deleteDatas: Data[];
  type: string;
};

export type { Data, UpsertData };
