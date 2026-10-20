"""
AI Personal Trainer - Applicazione Streamlit per Smartphone e Desktop.
Alimentata da Google Gemini Multimodal Video Analysis con Fast-Path e Streaming.
"""

import os
import io
import socket
from datetime import datetime
from dotenv import load_dotenv
import streamlit as st
import qrcode

# Carica variabili d'ambiente da file .env se presente
load_dotenv(override=True)

from styles import CUSTOM_CSS
from analyzer import analyze_video_stream, validate_api_key

# Configurazione pagina per smartphone
st.set_page_config(
    page_title="AI Personal Trainer",
    page_icon="🏋️‍♂️",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Iniezione stili CSS ottimizzati per mobile
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


def get_local_ip() -> str:
    """Rileva l'indirizzo IP locale della macchina per la connessione da smartphone."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip


def generate_qr_code(url: str) -> io.BytesIO:
    """Genera un QR Code scansionabile con la fotocamera dello smartphone."""
    qr = qrcode.QRCode(
        version=1,
        box_size=8,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0a0e14", back_color="#ccff00")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


# Inizializzazione Session State
env_key = os.getenv("GEMINI_API_KEY", "").strip()
if "api_key" not in st.session_state or not st.session_state.api_key:
    st.session_state.api_key = env_key
elif env_key and st.session_state.api_key != env_key:
    st.session_state.api_key = env_key

if "history" not in st.session_state:
    st.session_state.history = []


# ==========================================
# SIDEBAR: Impostazioni, API Key & QR Code
# ==========================================
with st.sidebar:
    st.markdown("### ⚙️ Impostazioni Coach")
    
    # Input Chiave API Gemini
    input_key = st.text_input(
        "🔑 Gemini API Key",
        value=st.session_state.api_key,
        type="password",
        placeholder="AIzaSy...",
        help="La tua chiave API di Google AI Studio. Viene memorizzata solo per questa sessione."
    )
    
    if input_key != st.session_state.api_key:
        st.session_state.api_key = input_key
    
    # Pulsante di verifica rapida della chiave
    col_v1, col_v2 = st.columns([1, 1])
    with col_v1:
        if st.button("🧪 Testa Chiave", key="test_key_btn"):
            if not st.session_state.api_key:
                st.error("Inserisci prima una chiave!")
            else:
                with st.spinner("Verifica..."):
                    is_valid, msg = validate_api_key(st.session_state.api_key)
                    if is_valid:
                        st.success("✅ Connesso a Gemini!")
                    else:
                        st.error(f"❌ {msg}")
    
    with col_v2:
        if st.session_state.api_key:
            st.caption("🟢 Chiave pronta")
        else:
            st.caption("🔴 Chiave mancante")

    st.markdown("---")
    
    # Scelta del Modello Gemini
    model_choice = st.selectbox(
        "🧠 Modello Gemini",
        options=["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"],
        index=0,
        help="Gemini 2.5 Flash è ultra-veloce ed eccellente nell'analisi video fotogramma per fotogramma."
    )

    st.markdown("---")

    # Box Scansione QR per smartphone
    st.markdown("### 📱 Connetti dal Telefono")
    local_ip = get_local_ip()
    port = 8501
    mobile_url = f"http://{local_ip}:{port}"
    
    st.caption("Assicurati che il telefono sia connesso alla **stessa rete Wi-Fi** di questo computer e apri:")
    st.code(mobile_url, language="bash")
    
    try:
        qr_buf = generate_qr_code(mobile_url)
        st.image(qr_buf, caption="Inquadra col telefono per aprire l'app", width="stretch")
    except Exception:
        pass


# ==========================================
# HEADER PRINCIPALE (Mobile-Optimized)
# ==========================================
st.markdown("""
<div class="hero-card">
    <div class="hero-badge">AI Biomechanics & Fitness Coach</div>
    <h1 class="hero-title">AI Personal Trainer</h1>
    <p class="hero-subtitle">
        Registra la tua serie col telefono, caricala e scopri subito se la tua esecuzione è ottimale, sicura ed efficace.
    </p>
</div>
""", unsafe_allow_html=True)


# Avviso se la chiave API non è ancora stata configurata
if not st.session_state.api_key:
    st.warning("⚠️ **Inserisci la tua API Key Gemini** per attivare il coach.")
    with st.expander("👉 Inserimento rapido API Key", expanded=True):
        direct_key = st.text_input("Incolla qui la tua API Key (inizia con AIzaSy...):", type="password", key="inline_key")
        if direct_key:
            st.session_state.api_key = direct_key
            st.rerun()


# ==========================================
# OPZIONI ALLENAMENTO
# ==========================================
with st.expander("🎯 Configura Esercizio & Obiettivo (Opzionale)", expanded=False):
    col1, col2 = st.columns(2)
    with col1:
        exercise_preset = st.selectbox(
            "Esercizio:",
            [
                "🔍 Rilevamento Automatico",
                "Squat (High Bar / Low Bar)",
                "Panca Piana con Bilanciere",
                "Panca con Manubri",
                "Stacco da Terra (Deadlift)",
                "Military Press / Lento Avanti",
                "Trazioni alla Sbarra (Pull-ups)",
                "Rematore con Bilanciere",
                "Affondi (Lunges)",
                "Dip alle Parallele",
                "Altro (specifica nelle note)"
            ]
        )
    with col2:
        goal_preset = st.selectbox(
            "Obiettivo Principale:",
            [
                "Ipertrofia (Massa Muscolare & Tensione)",
                "Forza Massimale (Powerlifting)",
                "Postura & Prevenzione Infortuni",
                "Fitness Generale & Funzionale"
            ]
        )

    col3, col4 = st.columns(2)
    with col3:
        coach_style_choice = st.selectbox(
            "Stile del Coach:",
            [
                "Tecnico ed Equilibrato",
                "Motivante ed Empatico",
                "Severo da Gara (Focus millimetrico)"
            ]
        )
    with col4:
        user_notes_input = st.text_input(
            "Note Atleta (kg, RPE, fastidi):",
            placeholder="Es: 90kg, RPE 8, leggero fastidio anca dx"
        )


# ==========================================
# REGISTRAZIONE / CARICAMENTO VIDEO
# ==========================================
st.markdown("### 📹 Video della Serie")

st.markdown("""
<div class="tip-box">
    💡 <strong>Consigli per la registrazione da smartphone:</strong><br/>
    • Posiziona il telefono ad altezza bacino, con <strong>inquadratura laterale o a 45°</strong>.<br/>
    • Inquadra tutto il corpo (piedi e bilanciere sempre visibili).<br/>
    • Tocca qui sotto per registrare al momento con la fotocamera o caricare dalla galleria!
</div>
""", unsafe_allow_html=True)

uploaded_file = st.file_uploader(
    "Tocca qui per registrare con la fotocamera o scegliere un video",
    type=["mp4", "mov", "avi", "webm", "m4v"],
    help="Supporta MP4, MOV (iPhone), WebM e formati standard per smartphone."
)

if uploaded_file is not None:
    st.video(uploaded_file)
    file_size_mb = uploaded_file.size / (1024 * 1024)
    st.caption(f"📁 Video: **{uploaded_file.name}** ({file_size_mb:.1f} MB)")

    # ==========================================
    # PULSANTE DI ANALISI (Streaming Live)
    # ==========================================
    start_analysis = st.button("🚀 ANALIZZA ESECUZIONE CON GEMINI", key="analyze_btn")

    if start_analysis:
        if not st.session_state.api_key:
            st.error("❌ Errore: Inserisci prima la tua API Key Gemini!")
        else:
            status_box = st.empty()
            result_container = st.container()

            def update_status(msg: str):
                status_box.info(msg)

            try:
                video_bytes = uploaded_file.getvalue()
                
                # Streaming generatore
                stream_gen = analyze_video_stream(
                    api_key=st.session_state.api_key,
                    video_bytes=video_bytes,
                    filename=uploaded_file.name,
                    mime_type=uploaded_file.type,
                    exercise_name=exercise_preset,
                    goal=goal_preset,
                    coach_style=coach_style_choice,
                    user_notes=user_notes_input,
                    model_name=model_choice,
                    status_callback=update_status
                )

                with result_container:
                    st.markdown("---")
                    st.markdown("## 📋 Report Biomeccanico")
                    # Scrive l'analisi in tempo reale man mano che Gemini risponde
                    full_response = st.write_stream(stream_gen)

                status_box.empty()
                st.success("✅ Analisi completata dal tuo AI Coach!")

                # Salvataggio nella cronologia sessione
                st.session_state.history.append({
                    "timestamp": datetime.now().strftime("%H:%M:%S"),
                    "exercise": exercise_preset,
                    "result": full_response
                })

            except Exception as e:
                status_box.empty()
                st.error(f"❌ Si è verificato un errore durante l'analisi: {str(e)}")

# Mostra l'ultima analisi se disponibile
elif st.session_state.history:
    last_analysis = st.session_state.history[-1]
    st.markdown("---")
    st.markdown(f"### 📋 Ultima Analisi Registrata ({last_analysis['timestamp']})")
    st.markdown(last_analysis['result'])


# ==========================================
# CRONOLOGIA SERIE DELLA SESSIONE
# ==========================================
if len(st.session_state.history) > 1:
    with st.expander(f"📚 Cronologia Serie della Sessione ({len(st.session_state.history)} serie analizzate)"):
        for idx, item in enumerate(reversed(st.session_state.history[:-1])):
            st.markdown(f"#### Serie registrata alle {item['timestamp']} - {item['exercise']}")
            st.markdown(item["result"])
            st.markdown("---")
