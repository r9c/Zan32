use anyhow::Result;
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Once}; // <- Once added here
use tokio::sync::Mutex as AMutex;
use tokio_tungstenite::connect_async;
use webrtc::{
    api::APIBuilder,
    data_channel::data_channel_init::RTCDataChannelInit,
    data_channel::data_channel_message::DataChannelMessage,
    data_channel::RTCDataChannel,
    ice_transport::ice_candidate::RTCIceCandidateInit,
    ice_transport::ice_server::RTCIceServer,
    peer_connection::configuration::RTCConfiguration,
    peer_connection::peer_connection_state::RTCPeerConnectionState,
    peer_connection::sdp::session_description::RTCSessionDescription,
    peer_connection::RTCPeerConnection,
};

// ---- rustls provider (required for rustls 0.23) ----
use rustls::crypto::CryptoProvider;

fn install_rustls_provider() {
    static ONCE: Once = Once::new();
    ONCE.call_once(|| {
        // If something else already installed a provider, this will return Err — that’s fine.
        let _ = rustls::crypto::ring::default_provider().install_default();
    });
}
// ----------------------------------------------------

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
enum Sig {
    // old flow (still used by joiner & some server echoes)
    #[serde(rename = "join")]
    Join { code: String },
    #[serde(rename = "joined")]
    Joined { code: String },
    #[serde(rename = "peer-joined")]
    PeerJoined,
    #[serde(rename = "offer")]
    Offer { sdp: String, typ: String },
    #[serde(rename = "answer")]
    Answer { sdp: String, typ: String },
    #[serde(rename = "ice")]
    Ice { candidate: String },

    // new room + alias flow
    #[serde(rename = "host")]
    Host,
    #[serde(rename = "hosted")]
    Hosted { #[serde(rename = "roomId")] room_id: String }, // local snake_case, wire stays "roomId"
    #[serde(rename = "alias")]
    Alias { code: String },
    #[serde(rename = "alias-ok")]
    AliasOk { code: String },
    #[serde(rename = "alias-busy")]
    AliasBusy { code: String, #[serde(default)] reason: Option<String> },

    // optional errors
    #[serde(rename = "error")]
    Error { error: String },
}

#[tokio::main]
async fn main() -> Result<()> {
    // Install rustls crypto provider BEFORE any TLS sockets are created
    install_rustls_provider();

    // Args: --host CODE  or  --join CODE
    let mut args = std::env::args().skip(1).collect::<Vec<_>>();
    if args.len() != 2 || (args[0] != "--host" && args[0] != "--join") {
        eprintln!("usage:\n  p2p-webrtc --host 123456\n  p2p-webrtc --join 123456");
        std::process::exit(1);
    }
    let mode = args.remove(0);
    let code = args.remove(0);

    // Signaling URL via env, default to local
    let ws_url = std::env::var("WS_URL").unwrap_or_else(|_| "ws://127.0.0.1:8080".to_string());

    // --- WebRTC API + STUN ---
    let cfg = RTCConfiguration {
        ice_servers: vec![RTCIceServer {
            urls: vec!["stun:stun.l.google.com:19302".to_owned()],
            ..Default::default()
        }],
        ..Default::default()
    };
    let api = APIBuilder::new().build();
    let pc: Arc<RTCPeerConnection> = api.new_peer_connection(cfg).await?.into();

    pc.on_peer_connection_state_change(Box::new(|s: RTCPeerConnectionState| {
        println!("[pc] state: {s:?}");
        Box::pin(async {})
    }));

    // DataChannel holder for sending from stdin
    let send_dc: Arc<AMutex<Option<Arc<RTCDataChannel>>>> = Arc::new(AMutex::new(None));

    // JOIN side receives the DC from host
    {
        let send_dc = send_dc.clone();
        pc.on_data_channel(Box::new(move |dc: Arc<RTCDataChannel>| {
            let send_dc = send_dc.clone();
            Box::pin(async move {
                println!("[pc] got datachannel: {}", dc.label());
                {
                    let mut slot = send_dc.lock().await;
                    *slot = Some(dc.clone());
                }
                dc.on_open(Box::new(|| Box::pin(async move { println!("[dc] open (join)"); })));
                dc.on_message(Box::new(|msg: DataChannelMessage| {
                    let txt = String::from_utf8_lossy(&msg.data);
                    println!("[peer] {}", txt);
                    Box::pin(async {})
                }));
            })
        }));
    }

    // --- Signaling websocket ---
    let (ws_stream, _) = connect_async(&ws_url).await?;
    println!("[ws] connected to {}", ws_url);

    let (ws_tx_raw, mut ws_rx) = ws_stream.split();
    let ws_tx = Arc::new(AMutex::new(ws_tx_raw));

    // Send initial message to server
    if mode == "--host" {
        ws_tx
            .lock()
            .await
            .send(tungstenite::Message::Text(serde_json::to_string(&Sig::Host)?))
            .await?;
        println!("[sig] sent host request");
    } else {
        ws_tx
            .lock()
            .await
            .send(tungstenite::Message::Text(serde_json::to_string(&Sig::Join { code: code.clone() })?))
            .await?;
        println!("[sig] sent join for code {}", code);
    }

    // HOST creates DC immediately
    if mode == "--host" {
        let dc = pc.create_data_channel("chat", Some(RTCDataChannelInit::default())).await?;
        {
            let mut slot = send_dc.lock().await;
            *slot = Some(dc.clone());
        }
        dc.on_open(Box::new(|| Box::pin(async move { println!("[dc] open (host)"); })));
        dc.on_message(Box::new(|msg: DataChannelMessage| {
            let txt = String::from_utf8_lossy(&msg.data);
            println!("[peer] {}", txt);
            Box::pin(async {})
        }));
    }

    // ICE candidates we gather -> send to signaling
    {
        let ws_tx_cand = ws_tx.clone();
        pc.on_ice_candidate(Box::new(move |cand| {
            let ws_tx_cand = ws_tx_cand.clone();
            Box::pin(async move {
                if let Some(c) = cand {
                    let json = c.to_json().unwrap(); // 0.10: sync
                    let candidate = serde_json::to_string(&json).unwrap();
                    let msg = Sig::Ice { candidate };
                    let mut tx = ws_tx_cand.lock().await;
                    let _ = tx
                        .send(tungstenite::Message::Text(serde_json::to_string(&msg).unwrap()))
                        .await;
                }
            })
        }));
    }

    // Handle signaling messages
    let pc_sig = pc.clone();
    let ws_tx_sig = ws_tx.clone();
    let mode_sig = mode.clone();
    let code_sig = code.clone();
    tokio::spawn(async move {
        while let Some(Ok(msg)) = ws_rx.next().await {
            let Ok(txt) = msg.to_text() else { continue };
            let Ok(sig) = serde_json::from_str::<Sig>(txt) else { continue };

            match sig {
                // server echo; ignore on client
                Sig::Alias { .. } | Sig::Host | Sig::Join { .. } => {}

                // server just created our room (host path) -> publish our alias (the 6-digit code)
                Sig::Hosted { room_id } => {
                    println!("[sig] hosted room {}", room_id);
                    if mode_sig == "--host" {
                        let out = Sig::Alias { code: code_sig.clone() };
                        let mut tx = ws_tx_sig.lock().await;
                        let _ = tx
                            .send(tungstenite::Message::Text(serde_json::to_string(&out).unwrap()))
                            .await;
                    }
                }

                // alias accepted (host path) -> send offer
                Sig::AliasOk { code } => {
                    println!("[sig] alias-ok {}", code);
                    if mode_sig == "--host" {
                        if let Ok(offer) = pc_sig.create_offer(None).await {
                            if pc_sig.set_local_description(offer.clone()).await.is_ok() {
                                let out = Sig::Offer {
                                    sdp: offer.sdp.clone(),
                                    typ: offer.sdp_type.to_string(),
                                };
                                let mut tx = ws_tx_sig.lock().await;
                                let _ = tx
                                    .send(tungstenite::Message::Text(serde_json::to_string(&out).unwrap()))
                                    .await;
                                println!("[sig] host sent offer");
                            }
                        }
                    }
                }

                Sig::AliasBusy { code, reason } => {
                    eprintln!("[sig] alias-busy {} {:?}", code, reason);
                }

                // optional: when any peer joins, host can re-send offer
                Sig::PeerJoined => {
                    if mode_sig == "--host" {
                        if let Ok(offer) = pc_sig.create_offer(None).await {
                            if pc_sig.set_local_description(offer.clone()).await.is_ok() {
                                let out = Sig::Offer {
                                    sdp: offer.sdp.clone(),
                                    typ: offer.sdp_type.to_string(),
                                };
                                let mut tx = ws_tx_sig.lock().await;
                                let _ = tx
                                    .send(tungstenite::Message::Text(serde_json::to_string(&out).unwrap()))
                                    .await;
                                println!("[sig] host resent offer after peer-joined");
                            }
                        }
                    }
                }

                // joiner path: receive offer -> answer
                Sig::Offer { sdp, .. } => {
                    if let Ok(desc) = RTCSessionDescription::offer(sdp) {
                        if pc_sig.set_remote_description(desc).await.is_ok() {
                            if let Ok(answer) = pc_sig.create_answer(None).await {
                                if pc_sig.set_local_description(answer.clone()).await.is_ok() {
                                    let out = Sig::Answer {
                                        sdp: answer.sdp,
                                        typ: answer.sdp_type.to_string(),
                                    };
                                    let mut tx = ws_tx_sig.lock().await;
                                    let _ = tx
                                        .send(tungstenite::Message::Text(serde_json::to_string(&out).unwrap()))
                                        .await;
                                    println!("[sig] join sent answer");
                                }
                            }
                        }
                    }
                }

                // host path: receive answer
                Sig::Answer { sdp, .. } => {
                    if let Ok(desc) = RTCSessionDescription::answer(sdp) {
                        let _ = pc_sig.set_remote_description(desc).await;
                        println!("[sig] host got answer");
                    }
                }

                // both sides: add ICE
                Sig::Ice { candidate } => {
                    if let Ok(init) = serde_json::from_str::<RTCIceCandidateInit>(&candidate) {
                        let _ = pc_sig.add_ice_candidate(init).await;
                    }
                }

                Sig::Joined { code } => {
                    println!("[sig] joined via code {}", code);
                }

                Sig::Error { error } => {
                    eprintln!("[sig] error: {}", error);
                }
            }
        }
    });

    // stdin -> send over DC
    {
        let send_dc_for_send = send_dc.clone();
        tokio::spawn(async move {
            use tokio::io::{AsyncBufReadExt, BufReader};
            let mut lines = BufReader::new(tokio::io::stdin()).lines();
            loop {
                match lines.next_line().await {
                    Ok(Some(line)) => {
                        if let Some(dc) = send_dc_for_send.lock().await.as_ref().cloned() {
                            let _ = dc.send_text(line).await;
                        } else {
                            println!("(waiting for datachannel...)");
                            tokio::time::sleep(std::time::Duration::from_millis(300)).await;
                        }
                    }
                    _ => {
                        tokio::time::sleep(std::time::Duration::from_millis(200)).await;
                    }
                }
            }
        });
    }

    futures::future::pending::<()>().await;
    #[allow(unreachable_code)]
    Ok(())
}
