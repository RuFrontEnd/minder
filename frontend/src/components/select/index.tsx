"use client";
import type { ChangeEvent } from "react";
import { Portal, Select as ChakraSelect, createListCollection } from "@chakra-ui/react";
import * as SelectTypes from "@/types/components/select";
import styles from "./index.module.css";

const Select = (props: SelectTypes.Props) => {
  const collection = createListCollection({
    items: props.options.map((option) => ({ label: option, value: option })),
  });

  const value = props.value ?? "";

  const onValueChange = (details: { value: string[] }) => {
    const nextValue = details.value?.[0] ?? "";
    props.onChange?.(
      {
        target: { value: nextValue },
      } as ChangeEvent<HTMLSelectElement>
    );
  };

  return (
    <div className={props.className} id={props.id}>
      <ChakraSelect.Root
        collection={collection}
        size="sm"
        width={props.w ? props.w : "100%"}
        value={value ? [value] : []}
        onValueChange={onValueChange}
      >
        <ChakraSelect.HiddenSelect name={props.name} />
        {props.label && (
          <ChakraSelect.Label className={styles.label}>
            {props.label}
          </ChakraSelect.Label>
        )}
        <ChakraSelect.Control>
          <ChakraSelect.Trigger
            className={styles.select}
          >
            <ChakraSelect.ValueText placeholder={props.placeholder} />
          </ChakraSelect.Trigger>
          <ChakraSelect.IndicatorGroup>
            <ChakraSelect.Indicator />
          </ChakraSelect.IndicatorGroup>
        </ChakraSelect.Control>

        <Portal>
          <ChakraSelect.Positioner>
            <ChakraSelect.Content>
              {collection.items.map((option) => (
                <ChakraSelect.Item item={option} key={option.value}>
                  {option.label}
                  <ChakraSelect.ItemIndicator />
                </ChakraSelect.Item>
              ))}
            </ChakraSelect.Content>
          </ChakraSelect.Positioner>
        </Portal>
      </ChakraSelect.Root>
    </div>
  );
};

export default Select;
