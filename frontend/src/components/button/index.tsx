import * as ButtonTypes from '@/types/components/button'

const Button = (props: ButtonTypes.Props) => {
  const { id, className, text, onClick } = props;

  return (
    <button
      id={id}
      className={`${className && className} text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-md`}
      onClick={onClick}
    >{text}</button>
  );
};

export default Button;
