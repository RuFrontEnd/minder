"use client";

import styles from "./Frame.module.css";

export default function Frame(props: any) {
  return (
    <div
      role={props.role}
      key={props.key}
      id={props.id}
      style={props.style}
      className={`${styles.root} ${props.className ? props.className : ""}`}
      onClick={props.onClick}
    >
      {props.children}
    </div>
  );
}
