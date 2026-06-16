# 台灣巴士車內資訊顯示系統

A web-based **in-vehicle LCD information display & announcement system** for Taiwan
buses, inspired by Japanese (Kyoto-style) bus displays.

設定一條路線（業者、去/返程、配色、站序、轉乘、座標），即可在車上**全螢幕輪播**
三種畫面並產生**中文 / 英文 / 日文**語音廣播。

## 功能

- **三種顯示畫面**
  - 下一站 Next Stop（含票價列）
  - 接下來各站列表 Stop List（弧線視覺，下一站高亮）
  - 轉乘資訊 Transfer
- **三語廣播**（中→英→日，瀏覽器內建語音合成）：僅播放「路線開始告知 → 下站廣播 → 轉乘資訊」。
- **設定頁**：內建業者主題 + 自訂色票、逐站輸入站名（中/英/日）、票價、轉乘、座標；JSON 匯入/匯出。
- **鍵盤控制**與**全螢幕**播放。
- **GPS 自動到站**（實驗性）。
- 純前端，可部署於 GitHub Pages。

## 開發

```bash
npm install
npm run dev      # 開發伺服器
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 鍵盤操作（播放頁）

| 鍵 | 動作 |
|----|------|
| `空白` / `→` | 到站推進 |
| `←` | 上一站 |
| `1` / `2` / `3` | 切換 下一站 / 各站列表 / 轉乘 |
| `A` | 重播目前廣播 |
| `S` | 播放路線開始告知 |
| `F` | 全螢幕 |
| `P` | 暫停 / 繼續輪播 |
| `M` | 切換 手動 / GPS 模式 |

> 首次播放需點「開始播放」以解鎖瀏覽器音訊並進入全螢幕。

## 部署（GitHub Pages）

推送到 `main` 後，`.github/workflows/deploy.yml` 會自動建置並部署。
若 repository 名稱不是 `taiwan-bus-display`，請同步修改 `vite.config.ts` 的 `base`。

## 技術

Vite · React · TypeScript · Web Speech API · Geolocation API · Fullscreen API
