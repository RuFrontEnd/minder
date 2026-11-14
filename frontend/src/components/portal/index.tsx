"use client";
import {
  Portal as ChakraPortal,
  type PortalProps,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

type Props = PortalProps & {
  children?: ReactNode;
};

const Portal = (props: Props) => <ChakraPortal {...props} />;

export default Portal;
