// signaling/server.js
const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8080 });

// Data structures
const rooms    = new Map(); // roomId -> Set<ws>
const aliases  = new Map(); // code   -> roomId
const hostOf   = new Map(); // ws     -> roomId
const lastCode = new Map(); // roomId -> code

function send(ws, obj) {
  try { ws.send(JSON.stringify(obj)); } catch {}
}
function roomPeers(roomId) {
  return rooms.get(roomId) || new Set();
}
function fanout(roomId, from, obj) {
  const peers = roomPeers(roomId);
  let n = 0;
  for (const ws of peers) {
    if (ws !== from && ws.readyState === ws.OPEN) {
      send(ws, obj); n++;
    }
  }
  if (obj && obj.type) {
    console.log(`[fanout] ${obj.type} to ${n} peer(s) in room ${roomId}`);
  }
}
function cleanupRoom(roomId) {
  const set = rooms.get(roomId);
  if (set && set.size) return;
  rooms.delete(roomId);
  const prev = lastCode.get(roomId);
  if (prev && aliases.get(prev) === roomId) aliases.delete(prev);
  lastCode.delete(roomId);
  console.log(`[room] deleted ${roomId}`);
}
function setAlias(roomId, code) {
  // remove this room's previous code
  const prev = lastCode.get(roomId);
  if (prev && aliases.get(prev) === roomId) aliases.delete(prev);

  // if another room already uses this code, reject
  if (aliases.has(code) && aliases.get(code) !== roomId) return false;

  aliases.set(code, roomId);
  lastCode.set(roomId, code);
  console.log(`[alias] room ${roomId} -> code ${code}`);
  return true;
}

wss.on('listening', () => console.log('Signaling on ws://0.0.0.0:8080'));

wss.on('connection', (ws) => {
  console.log('[ws] new connection');

  ws.on('message', (raw) => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }

    // HOST announces itself → create a room
    if (msg.type === 'host') {
      if (!hostOf.has(ws)) {
        const roomId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        rooms.set(roomId, new Set([ws]));
        hostOf.set(ws, roomId);
        ws.roomId = roomId;
        console.log('[host] new room', roomId);
        send(ws, { type: 'hosted', roomId });
      }
      return;
    }

    // HOST updates the current 6-digit alias (you’ll rotate it every 60s client-side)
    if (msg.type === 'alias') {
      const roomId = hostOf.get(ws);
      if (!roomId) { send(ws, { type: 'error', error: 'not_host' }); return; }
      const code = String(msg.code || '').trim();
      if (!/^\d{6}$/.test(code)) { send(ws, { type: 'alias-busy', code, reason: 'bad_code' }); return; }
      const ok = setAlias(roomId, code);
      send(ws, { type: ok ? 'alias-ok' : 'alias-busy', code });
      return;
    }

    // JOINER: resolve code -> room and join it
    if (msg.type === 'join' && typeof msg.code === 'string') {
      const code = msg.code.trim();
      const roomId = aliases.get(code);
      if (!roomId) { send(ws, { type: 'error', error: 'no_such_code' }); return; }
      const set = rooms.get(roomId);
      if (!set) { send(ws, { type: 'error', error: 'room_gone' }); return; }
      if (set.size >= 2) { send(ws, { type: 'busy' }); return; } // optional: 1:1 rooms

      set.add(ws);
      ws.roomId = roomId;
      console.log(`[join] code=${code} | clients in room=${set.size}`);
      send(ws, { type: 'joined', code });
      fanout(roomId, ws, { type: 'peer-joined' });
      return;
    }

    // Pass offer/answer/ice within the room
    if (ws.roomId && ['offer','answer','ice'].includes(msg.type)) {
      fanout(ws.roomId, ws, msg);
    }
  });

  ws.on('close', () => {
    console.log('[ws] closed');
    const roomId = ws.roomId;
    if (roomId) {
      const set = rooms.get(roomId);
      if (set) {
        set.delete(ws);
        console.log(`[leave] room=${roomId} | remaining=${set.size}`);
        if (set.size === 0) setTimeout(() => cleanupRoom(roomId), 250);
      }
    }
    if (hostOf.has(ws)) {
      const r = hostOf.get(ws);
      const prev = lastCode.get(r);
      if (prev && aliases.get(prev) === r) aliases.delete(prev);
      hostOf.delete(ws);
    }
  });
});
