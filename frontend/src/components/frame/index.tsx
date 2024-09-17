"use client";

export default function Frame(props: any) {
  return (
    <div
      key={props.key}
      id={props.id}
      style={props.style}
      className={`rounded-lg p-4 flex flex-col bg-white-500 shadow-md ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
