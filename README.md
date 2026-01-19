# FF14 九宮幻卡模擬器 (Triple Triad Simulator & Solver)


這是一個專為《最終幻想14》（FF14）設計的高精度九宮幻卡（Triple Triad）模擬器與解法器。它不僅能幫助玩家模擬各種複雜的遊戲規則，還能提供最優解建議，助你輕鬆戰勝 NPC 或優化牌組戰術。

## 核心功能

*   **牌組管理 (Deck Management)**
    *   支持最多 **10 組** 自定義牌組。
    *   提供重命名、刪除與自動保存功能（基於 `localStorage`）。
    *   **編輯模式**：直接點擊卡牌即可修改數值（1-9, A）與種族（無、野獸、精靈、蛮神等）。

*   **交互式棋盤 (Interactive Board)**
    *   支持 **拖放 (Drag and Drop)** 操作，流暢的卡牌放置體驗。
    *   **敵方模擬**：點擊棋盤空白處即可快速輸入敵方卡牌信息，模擬對手行動。

*   **完整規則引擎 (Rule Engine)**
    *   支持 FF14 所有核心規則：
        *   **逆轉 (Reverse)**：數值小的勝。
        *   **同數 (Same)** / **加算 (Plus)**：觸發連擊佔領。
        *   **王牌殺手 (Fallen Ace)**：1 點可擊敗 A。
        *   **上升 (Ascension)** / **下降 (Descension)**：種族加成/減益。
        *   **順序 (Order)**：必須按牌組順序出牌。

*   **戰術 AI (Tactical AI)**
    *   **最佳路徑 (Best Move)**：根據當前盤面與規則，一鍵計算最高收益的出牌位置與卡牌。

*   **戰鬥日誌 (Battle Logs)**
    *   實時追蹤翻面（Flip）、連擊（Combo）及規則觸發（如「同數」、「加算」），讓戰局一目了然。

*   **極致 UI/UX**
    *   **FF14 風格設計**：沉浸式的遊戲介面，支持 **深色/淺色模式** 切換。
    *   **流暢動畫**：使用 Framer Motion 打造精緻的交互效果與響應式布局。

## 技術棧

*   **框架**: [React 19](https://react.dev/)
*   **語言**: [TypeScript](https://www.typescriptlang.org/)
*   **樣式**: [Tailwind CSS](https://tailwindcss.com/)
*   **動畫**: [Framer Motion](https://www.framer.com/motion/)
*   **圖標**: [Lucide React](https://lucide.dev/)
*   **構建工具**: [Vite](https://vitejs.dev/)

## 安裝與運行

### 前提條件
*   安裝了 [Node.js](https://nodejs.org/) (建議 v18+)

### 快速開始
1.  **安裝依賴**:
    ```bash
    npm install
    ```
2.  **啟動開發服務器**:
    ```bash
    npm run dev
    ```
3.  **構建項目**:
    ```bash
    npm run build
    ```

### 快捷腳本 (Windows)
*   `install.bat`: 自動安裝依賴。
*   `start.bat` / `start-dev.bat`: 啟動服務。
*   `update.bat`: 同步代碼並構建。

## 使用指南

1.  **配置牌組**：點擊左側牌組面板頂部的「編輯」圖標進入編輯模式。你可以點擊卡牌的上下左右數值進行修改，或更換卡牌種族。
2.  **設置規則**：在右側面板勾選本次對局的規則（如「同數」、「加算」等）。點擊規則旁的 `i` 圖標可查看詳細解釋。
3.  **放置卡牌**：
    *   將你的卡牌拖拽到棋盤的 1-9 號位。
    *   點擊空白格可彈出對話框，輸入敵方卡牌的數值以模擬對手出牌。
4.  **獲取 AI 建議**：點擊頂部導航欄的「最佳路徑」按鈕，系統會以發光特效標註出當前最佳的落子點，並在日誌中給出具體建議。

## 授權方式
本项目僅供學習與交流使用。FF14 相關遊戲素材權屬于 SQUARE ENIX CO., LTD.
