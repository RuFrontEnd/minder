import styled, { css } from "styled-components/macro";
import { motion } from "framer-motion";
import * as variables from "@/variables/variables";
import * as ComponentTypes from "@/types/ComponentTypes";

const defineXDirection = (direction) => {
  if (direction === "left") {
    return "left: 0;";
  } else {
    return "right: 0;";
  }
};

const defineYDirection = (direction) => {
  if (direction === "top") {
    return "top: 0;";
  } else {
    return "bottom: 0;";
  }
};

const Container = styled(motion.div)<{
  visible?: ComponentTypes.SidePanel.Props["visible"];
  width?: ComponentTypes.SidePanel.Props["width"];
  height?: ComponentTypes.SidePanel.Props["height"];
  xDirection?: ComponentTypes.SidePanel.Props["xDirection"];
  yDirection?: ComponentTypes.SidePanel.Props["yDirection"];
  zIndex?: ComponentTypes.SidePanel.Props["zIndex"];
}>`
  position: fixed;
  z-index: 100;
  right: 0;
  width: ${(props) => (props.width ? `calc(${props.width})` : "500px")};
  height: ${(props) => (props.height ? `calc(${props.height})` : "100vh")};
  background-color: ${variables.__FFF__()};
  box-shadow: ${variables.__000__(0.2)} -4px 0px 8px;
  z-index: ${(props) => (props.zIndex ? props.zIndex : 100)};
  ${(props) => defineXDirection(props.xDirection)};
  ${(props) => defineYDirection(props.xDirection)};
`;

const CancelButton = styled.span`
  font-size: 18px;
  &:hover {
    cursor: pointer;
  }
`;

const Title = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: bold;
`;

const Header = styled.div<{ margin?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: ${(props) => props.margin};
  border-bottom: 1px solid ${variables.__000__()};
  padding: 12px 12px 10px;
  margin: 0px 16px;
`;

const Body = styled.div<{ bodyMargin?: string }>`
  margin: ${(props) => props.bodyMargin};
  height: 100%;
`;

const Footer = {
  Container: styled.div`
    padding: 0 16px;
    bottom: 0;
    position: absolute;
    width: 100%;
  `,
  Wrap: styled.div`
    border-top: 1px solid ${variables.__000__()};
    padding: 12px 0;
    display: flex;
    align-items: center;
    justify-content: end;
  `,
};

export { CancelButton, Title, Header, Container, Body, Footer };
