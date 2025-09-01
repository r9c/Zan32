# Zan32 — P2P WebRTC Chat

## Folders
- frontend/ — React + Vite UI
- signaling/ — Node WebSocket signaling server
- client-rust/ — Rust WebRTC client (host/join)

## Quick start

### Signaling
cd signaling
npm i
npm start   # runs server.js on :8080

### Expose (dev)
ngrok http 8080

### Rust client
cd client-rust
cargo build --release

# PowerShell (example)
`$env:WS_URL="wss://xxxxx.ngrok-free.app"`
.\target\release\p2p-webrtc.exe --host 123456
.\target\release\p2p-webrtc.exe --join 123456
"@ | Out-File -Encoding utf8 README.md
