# 🏋️‍♂️ AI Personal Trainer - Biomechanics & Form Check con Gemini

Applicazione web Streamlit **ottimizzata specificamente per smartphone** (iOS Safari & Android Chrome) che ti permette di:
1. Registrare i tuoi esercizi direttamente con la fotocamera del telefono in palestra (o caricare video dalla galleria).
2. Inviare il video direttamente a **Google Gemini 2.5 Flash** (visione multimodale ad alta velocità).
3. Ricevere in pochi secondi un **report biomeccanico completo da Master Personal Trainer**:
   - 🚦 **Verdetto sull'esecuzione**: se è ottimale, buona o rischiosa per infortuni (voto 1-10).
   - 🔍 **Analisi dettagliata per fasi**: allineamento colonna, ROM/profondità, traiettoria del bilanciere/manubri, stabilità articolare e tempo esecutivo.
   - ⚠️ **Errori critici rilevati** con spiegazione del perché si verificano.
   - 💡 **3 Cue mentali pratici** da ripetersi a mente durante la prossima serie per correggersi subito.
   - 🎯 **Esercizi correttivi o di mobilità** raccomandati per risolvere l'anello debole.

---

## 🚀 Avvio Rapido con UV

L'ambiente virtuale e le dipendenze sono gestite interamente con **`uv`**, senza alcuna installazione globale:

```bash
# Avvia l'applicazione Streamlit
uv run streamlit run app.py
```

---

## 📱 Come usarla dal Telefono

1. Assicurati che il tuo computer e il tuo smartphone siano connessi alla **stessa rete Wi-Fi** (oppure attiva l'Hotspot dal telefono).
2. Avvia l'app con `uv run streamlit run app.py`.
3. Nell'interfaccia comparirà un **QR Code dedicato** con l'indirizzo locale (es. `http://192.168.x.x:8501`).
4. **Apri la fotocamera del tuo smartphone, inquadra il QR Code** e tocca il link per aprire l'app su Safari o Chrome!
5. Quando tocchi il pulsante di caricamento video, lo smartphone ti chiederà se vuoi **"Registrare un video" sul posto** o sceglierne uno già registrato.

---

## 🔑 Configurazione API Key Gemini

Puoi inserire la tua chiave API di Gemini in due modi:
1. **Dall'interfaccia dell'app**: Apri la barra laterale (o usa il campo a comparsa) e incolla la tua chiave. C'è anche il pulsante per testare la connessione!
2. **Tramite file `.env`**:
   ```bash
   cp .env.example .env
   # Modifica .env inserendo la tua chiave:
   # GEMINI_API_KEY=AIzaSy...
   ```

> Se non hai ancora una chiave API, puoi ottenerne una **gratuita** in 1 minuto su [Google AI Studio](https://aistudio.google.com/).
