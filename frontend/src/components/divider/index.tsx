import * as DividerTypes from "@/types/components/divider";

const Divider = (props: DividerTypes.Props) => {

  return (
    <div id={props.id} className={props.className}>
      <div className="border-b border-grey-5 relative my-4">
        {!!props.text && <p className="text-sm text-grey-4 absolute top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-white-500 px-4">{props.text}</p>}
      </div>
    </div>
  );
};

export default Divider;
