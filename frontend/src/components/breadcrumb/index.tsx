import * as BreadcrumbTypes from "@/types/components/breadcrumb";

const Breadcrumb = (props: BreadcrumbTypes.Props) => {
  return (
    <div
      id={props.id}
      className={`flex items-center py-4 overflow-x-auto whitespace-nowrap ${props.className}`}
    >
      {props.ellipsis?.enabled &&
      props.paths.length > 3 &&
      props.paths.length > props.ellipsis?.maxLength ? (
        <>
          <p
            className={`text-gray-600 dark:text-gray-200 ${
              !!props.paths[0].onClick && "hover:underline cursor-pointer"
            }`}
            onClick={props.paths[0].onClick}
          >
            {props.paths[0].content}
          </p>

          <div className="mx-3 text-gray-500 dark:text-gray-300">/</div>

          <p
            className={`text-gray-600 dark:text-gray-200 ${
              !!props.ellipsis.onClick && "hover:underline cursor-pointer"
            }`}
            onClick={props.ellipsis.onClick}
          >
            ...
          </p>

          <div className="mx-3 text-gray-500 dark:text-gray-300">/</div>

          <p
            className={`text-gray-600 dark:text-gray-200 ${
              !!props.paths[props.paths.length - 2].onClick &&
              "hover:underline cursor-pointer"
            }`}
            onClick={props.paths[props.paths.length - 2].onClick}
          >
            {props.paths[props.paths.length - 2].content}
          </p>

          <div className="mx-3 text-gray-500 dark:text-gray-300">/</div>

          <p
            className={`text-gray-600 dark:text-gray-200 ${
              !!props.paths[props.paths.length - 1].onClick &&
              "hover:underline cursor-pointer"
            }`}
            onClick={props.paths[props.paths.length - 1].onClick}
          >
            {props.paths[props.paths.length - 1].content}
          </p>
        </>
      ) : (
        <>
          {props.paths.map((path, i) => (
            <>
              <p
                className={`text-gray-600 dark:text-gray-200 ${
                  !!path.onClick && "hover:underline cursor-pointer"
                }`}
                onClick={path.onClick}
              >
                {path.content}
              </p>

              {i !== props.paths.length - 1 && (
                <div className="mx-3 text-gray-500 dark:text-gray-300">/</div>
              )}
            </>
          ))}
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
