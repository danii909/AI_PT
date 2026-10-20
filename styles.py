"""
Stili CSS ottimizzati per mobile (smartphone) e desktop.
Design Gym & Fitness: dark mode profondo, accenti neon lime (#ccff00 / #00ff88),
tipografia pulita, schede con effetto glassmorphism e target touch ampi (>48px).
"""

CUSTOM_CSS = """
<style>
/* Reset e ottimizzazione mobile viewport */
html, body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #e5e7eb;
    background-color: #0d1117;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
}

/* Stile container principale Streamlit */
.main .block-container {
    padding-top: 1rem;
    padding-bottom: 3rem;
    padding-left: 0.8rem;
    padding-right: 0.8rem;
    max-width: 680px; /* Ottimale per visualizzazione mobile / tablet */
    margin: 0 auto;
}

/* Header badge e titolo */
.hero-card {
    background: linear-gradient(135deg, rgba(20, 26, 35, 0.95), rgba(13, 17, 23, 0.98));
    border: 1px solid rgba(204, 255, 0, 0.25);
    border-radius: 18px;
    padding: 1.25rem 1rem;
    margin-bottom: 1.2rem;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(8px);
}

.hero-badge {
    display: inline-block;
    background: rgba(204, 255, 0, 0.15);
    color: #ccff00;
    border: 1px solid rgba(204, 255, 0, 0.4);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

.hero-title {
    color: #ffffff;
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 0.35rem 0;
    line-height: 1.15;
}

.hero-subtitle {
    color: #9ca3af;
    font-size: 0.88rem;
    line-height: 1.35;
    margin: 0;
}

/* Schede informative e impostazioni */
.pt-card {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 14px;
    padding: 1rem;
    margin-bottom: 1rem;
}

/* Pulsanti ampi e touch-friendly */
div.stButton > button {
    width: 100%;
    min-height: 52px;
    background: linear-gradient(135deg, #ccff00 0%, #a3e635 100%) !important;
    color: #0a0e14 !important;
    font-weight: 700 !important;
    font-size: 1.05rem !important;
    border-radius: 14px !important;
    border: none !important;
    box-shadow: 0 6px 20px rgba(204, 255, 0, 0.25) !important;
    transition: all 0.2s ease-in-out !important;
    margin-top: 0.5rem;
}

div.stButton > button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(204, 255, 0, 0.4) !important;
}

div.stButton > button:active {
    transform: scale(0.98);
}

/* Personalizzazione uploader su mobile */
[data-testid="stFileUploader"] {
    background: #13171f;
    border: 2px dashed rgba(204, 255, 0, 0.35);
    border-radius: 16px;
    padding: 1rem 0.5rem;
    text-align: center;
    transition: border-color 0.2s;
}

[data-testid="stFileUploader"]:hover {
    border-color: #ccff00;
}

/* Tips box per la ripresa video */
.tip-box {
    background: rgba(56, 189, 248, 0.08);
    border-left: 4px solid #38bdf8;
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    margin: 0.8rem 0;
    font-size: 0.83rem;
    color: #bae6fd;
    line-height: 1.4;
}

/* Box risultato analisi */
.analysis-container {
    background: #13171f;
    border: 1px solid #2d3748;
    border-radius: 16px;
    padding: 1.25rem 1rem;
    margin-top: 1rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

/* Stile per i tag del verdetto */
.verdict-tag {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-weight: bold;
    font-size: 0.95rem;
}

/* Riduzione padding sidebar per mobile */
section[data-testid="stSidebar"] {
    background-color: #0d1117;
    border-right: 1px solid #21262d;
}

/* Video player responsive con bordi arrotondati */
video {
    border-radius: 14px;
    width: 100% !important;
    max-height: 480px;
    background: #000;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
}

/* Nasconde intestazioni Streamlit non necessarie su mobile */
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header[data-testid="stHeader"] {background: transparent;}
</style>
"""
