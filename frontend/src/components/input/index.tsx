"use client"
import * as InputTypes from '@/types/components/input'

const Input = (props: InputTypes.Props) => {

  return (
    <div className={props.className} id={props.id}>
      <label
        htmlFor={props.name}
        className="leading-7 text-sm text-gray-600"
      >
        {props.label}
      </label>
      <input
        type={props.type}
        name={props.name}
        className={`w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out`}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
};

export default Input;
