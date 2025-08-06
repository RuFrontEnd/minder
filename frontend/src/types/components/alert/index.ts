enum Type {
  succeess = "succeess",
  warning = "warning",
  error =  "error",
}

type Props = {
  id?: string;
  className?: string;
  text: string;
  type: Type;
};

export { Type };
export type { Props };
