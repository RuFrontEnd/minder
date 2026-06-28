"use client";

import {
  Combobox,
  HStack,
  Image,
  Portal,
  Span,
  Stack,
  Text,
  useComboboxContext,
  useFilter,
  useListCollection,
} from "@chakra-ui/react";
import * as ComboboxTypes from "@/types/components/combobox";

function ComboboxValue() {
  const combobox = useComboboxContext();
  const selectedItems = combobox.selectedItems as ComboboxTypes.Item[];

  if (!selectedItems?.length) return null;

  return (
    <Stack mt="2">
      {selectedItems.map((item) => (
        <HStack key={item.value} textStyle="sm" p="1" borderWidth="1px">
          {item.logo && (
            <Image
              boxSize="10"
              p="2"
              src={item.logo}
              alt={item.label + " logo"}
            />
          )}
          <Text>{item.label}</Text>
        </HStack>
      ))}
    </Stack>
  );
}

const ChakraCombobox = (props: ComboboxTypes.Props) => {
  const { contains } = useFilter({ sensitivity: "base" });

  const { collection, filter } = useListCollection({
    initialItems: props.items,
    filter: contains,
  });

  return (
    <Combobox.Root
      id={props.id}
      className={props.className}
      collection={collection}
      onInputValueChange={(e) => filter(e.inputValue)}
      onValueChange={(e) => props.onValueChange?.(e.value as string[])}
      value={props.value}
      width={props.width}
      placeholder={props.placeholder}
      multiple={props.multiple}
      closeOnSelect={props.closeOnSelect}
    >
      {props.label && <Combobox.Label>{props.label}</Combobox.Label>}

      <Combobox.Control>
        <Combobox.Input />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>

      {props.showSelectedItems && <ComboboxValue />}

      <Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.Empty>{props.emptyText}</Combobox.Empty>
            {collection.items.map((item) => (
              <Combobox.Item item={item} key={item.value}>
                {item.logo && (
                  <Image
                    boxSize="5"
                    src={item.logo}
                    alt={item.label + " logo"}
                  />
                )}
                <Span flex="1">{item.label}</Span>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
  );
};

ChakraCombobox.defaultProps = {
  width: "320px",
  placeholder: "Example: Audi",
  label: "Search and select options",
  multiple: true,
  closeOnSelect: true,
  showSelectedItems: true,
  emptyText: "No items found",
};

export default ChakraCombobox;
