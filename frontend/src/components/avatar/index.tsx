"use client";
import { Avatar as ChakraAvatar, HStack, Stack, Text } from "@chakra-ui/react";
import * as AvatarTypes from "@/types/components/avatar";

const Avatar = (props: AvatarTypes.Props) => {
  const hasMeta = !!props.name || !!props.email;

  return (
    <HStack
      key={props.key}
      gap="4"
      className={props.className}
      style={props.style}
    >
      <ChakraAvatar.Root id={props.id} size={props.size} shape={props.shape}>
        {props.src && <ChakraAvatar.Image src={props.src} />}
        <ChakraAvatar.Fallback name={props.name}>
          {props.fallback}
        </ChakraAvatar.Fallback>
      </ChakraAvatar.Root>

      {hasMeta && (
        <Stack gap="0">
          {props.name && <Text fontWeight="medium">{props.name}</Text>}
          {props.email && (
            <Text color="fg.muted" textStyle="sm">
              {props.email}
            </Text>
          )}
        </Stack>
      )}
    </HStack>
  );
};

Avatar.defaultProps = {
  size: "md",
  shape: "full",
};

export default Avatar;
