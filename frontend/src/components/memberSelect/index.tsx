"use client";
import Avatar from "@/components/avatar";
import { Menu } from "@/components/menu";
import Portal from "@/components/portal";
import * as MemberSelectTypes from "@/types/components/memberSelect";
import styles from "./index.module.css";

const MemberSelect = (props: MemberSelectTypes.Props) => {
  const selectedOption = props.options.find(
    (option) => option.value === props.value
  );
  const avatarSize = props.avatarSize || "xs";

  return (
    <Menu.Root positioning={{ placement: "bottom-start" }}>
      <Menu.Trigger asChild>
        <button
          type="button"
          className={`${styles.trigger} ${props.triggerClassName || ""}`}
          aria-label={props.ariaLabel || "Select member"}
        >
          {selectedOption ? (
            <Avatar
              className={styles.avatar}
              src={selectedOption.src}
              name={props.showLabel ? selectedOption.label : undefined}
              fallback={selectedOption.label.charAt(0)}
              size={avatarSize}
            />
          ) : (
            <span className={styles.placeholderAvatar}>
              <span>{props.options[0]?.label.charAt(0) || "?"}</span>
            </span>
          )}
        </button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content className={`${styles.content} ${props.className || ""}`}>
            {props.options.map((option) => (
              <Menu.Item
                key={option.value}
                value={option.value}
                className={styles.item}
                onClick={() => props.onChange(option.value)}
              >
                <Avatar
                  className={styles.avatar}
                  src={option.src}
                  name={option.label}
                  fallback={option.label.charAt(0)}
                  size="2xs"
                />
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
};

export default MemberSelect;