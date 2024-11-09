"use client";

export default function Frame(props: any) {
  return (
    <div
      role={props.role}
      key={props.key}
      id={props.id}
      style={props.style}
      className={`rounded-lg flex flex-col bg-white-500 shadow-md ${props.className}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
