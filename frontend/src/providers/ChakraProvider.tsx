"use client";
import { ReactNode } from "react";
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// 1. 使用 defineConfig 定義你的自訂樣式
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          100: { value: "#f7fafc" },
          900: { value: "#1a202c" },
        },
      },
    },
  },
});

// 2. 使用 createSystem 結合預設配置與你的自訂配置
const system = createSystem(defaultConfig, config);

export default function Providers({ children }: { children: ReactNode }) {
  // 3. 注意：ChakraProvider 的屬性從 theme 改成了 value
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}