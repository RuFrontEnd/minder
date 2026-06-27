# Minder — Copilot Instructions

## 專案概覽

Minder 是一個流程圖白板工具。使用者可以在畫布上拖放節點、連結曲線，並管理多個 project。

## 架構

```
minder/
├── frontend/          # Next.js 14 + TypeScript + Chakra UI + CSS Modules
├── backend/           # Node.js + Express + TypeScript (legacy)(MySQL + MongoDB)
└── backendCSharp/     # C# .NET WebApi (main backend)
```

### Frontend

- **框架**：Next.js 14，`src/app/page.tsx` 是主畫布入口頁面
- **樣式**：CSS Modules（每個元件有對應的 `*.module.css`），搭配 Tailwind CSS 變數（`tailwindColors`）
- **UI 元件**：`src/components/`（Button、Modal、Icon 等通用元件）
- **Sections**：`src/sections/`（navbar、console、overallSidePanel、indivisualSidePanel 等）
- **型別**：`src/types/`，資料夾結構對應元件/API/形狀，型別以 namespace import 方式使用（`import * as FooTypes from "@/types/foo"`）
- **API 呼叫**：`src/apis/`，axios，baseURL 為 `http://localhost:5000/api`

### Backend

- **框架**：Express + TypeScript，MVC 架構（controllers / services / models）
- **資料庫**：MySQL（關聯資料）+ MongoDB（shapes 資料）
- **入口**：`src/app.ts`

## 程式碼慣例

### Frontend

- 元件用 `export default function`，props 型別定義在 `src/types/` 對應資料夾
- CSS Modules 命名：`camelCase`（`.root`、`.actionButton`、`.centerProjectName`）
- 狀態：`useState` 命名為 `[isFooOpen, setIsFooOpen]`、`[fooData, setFooData]`
- Props 中的 callback 命名為 `onClickFoo`、`onChangeFoo`
- Icon 元件統一用 `<Icon type={IconTypes.Type.xxx} w={N} h={N} stroke={color} />`
- 不要加不必要的 comment、docstring、或 console.log

### Backend

- Controller / Service / Model 各自一個 class，同名 default export
- 錯誤統一用 `getError(err)` 包裝後回傳

## 執行方式

```bash
# Frontend
cd frontend && npm run dev      # http://localhost:4000

# Backend (Node.js)
cd backend && npm run dev       # http://localhost:5000
```

## 開發流程

1. 直接告訴我需求（中文即可）
2. 我會閱讀相關檔案、修改程式碼、確認型別無誤
3. 有破壞性操作（刪檔、force push 等）我會先詢問

## 重要檔案對照

| 功能 | 檔案 |
|------|------|
| 主畫布頁面 | `frontend/src/app/page.tsx` |
| Navbar | `frontend/src/sections/navbar/index.tsx` |
| Project Modal | `frontend/src/components/modal/ProjectModal.tsx` |
| 通用型別 | `frontend/src/types/common/index.ts` |
| Tailwind 色票 | `frontend/src/variables/colors.ts` |
| Backend API 路由 | `backend/src/routes/` |
