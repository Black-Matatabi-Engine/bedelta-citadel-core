
Even Cursor 做左野都好, 好多時間未出現update UI 的Reason
Local Development 時 .vite cache 好多時會咬住Cache 要manual Restart 


# 1. 刪除 Vite 的快取目錄，強制乾淨編譯
rm -rf node_modules/.vite

# 1.5 強制 Vite 變更 Build Hash（在 package.json 加上指令）
pnpm build --force

# 2. 重新啟動開發伺服器
pnpm dev

# 3.  Crtl + Shift + R

