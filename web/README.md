# ⚡ APEX COACH AI — Web App Mobile-First per Biomeccanica & Form Check

Applicazione Web mobile-first ultra-moderna creata con **React + Vite + Vanilla CSS Moderno**, alimentata dall'API Multimodale di **Google Gemini (2.5 Flash / 2.0 Flash)** con streaming in tempo reale.

---

## ✨ Caratteristiche & UI

- 📱 **Camera Viewfinder Nativo:** Inquadratura fluida a tutto schermo con HUD biomeccanico (griglia dei terzi, marker di allineamento e scan line futuristica).
- 🔴 **Registratore con pulsante haptic:** Registrazione serie in palestra con timer live `00:05`, anello pulsante ed effetti di vibrazione aptica.
- 🔁 **Flip Fotocamera & Galleria:** Passa istantaneamente dalla fotocamera posteriore a quella frontale o carica un video registrato precedentemente.
- ⚡ **Streaming Gemini in tempo reale:** Il verdetto dell'AI Coach si scrive parola per parola istantaneamente senza tempi morti.
- 🏆 **Score Gauge & Confetti:** Voto su 10 con semaforo biomeccanico (🟢 Ottimale, 🟡 Buono, 🟠 Da Correggere, 🔴 Rischio) ed effetto coriandoli per esecuzioni da 9 e 10.
- 📋 **Cue Mentali & Condivisione:** 1-tap per copiare il report o condividerlo con il proprio preparatore atletico.
- 🔒 **Privacy Totale:** La chiave API e la cronologia delle serie sono salvate esclusivamente nel `localStorage` del tuo smartphone.
- 📲 **PWA Ready:** Puoi toccare "Aggiungi a schermata Home" su iPhone o Android per usarla come una vera app nativa a schermo intero senza barre del browser.

---

## 💻 Come Avviarla in Locale

Dalla cartella del progetto:

```bash
cd web
npm install
npm run dev
```

Il terminale mostrerà l'indirizzo per il computer e quello per il telefono (es. `http://192.168.x.x:5173`).
Apri quell'URL dal tuo smartphone connesso alla stessa rete Wi-Fi!

---

## 🚀 Dove e Come Deployarla (Gratis e in 1 Minuto)

Poiché l'app è completamente statica (client-side) e comunica direttamente con Gemini:
- Non necessita di server backend costosi.
- Gode di performance massime su CDN Edge globale.
- Dispone subito di **HTTPS gratuito** (fondamentale per consentire a iOS Safari e Android Chrome di accedere alla fotocamera).

### Opzione 1: Vercel (Consigliata al 100%)
1. Installa la CLI di Vercel:
   ```bash
   npm i -g vercel
   ```
2. Dalla cartella `web`, lancia:
   ```bash
   vercel
   ```
   (Premi Invio a tutte le domande predefinite).
3. In 20 secondi otterrai un link pubblico (es. `https://apex-coach-xxx.vercel.app`) da salvare nei preferiti dello smartphone o installare come app!

*In alternativa senza terminale:*
Carica il progetto su GitHub, vai su [vercel.com](https://vercel.com), clicca **"Add New Project"**, seleziona la cartella `web` e clicca **"Deploy"**.

---

### Opzione 2: Cloudflare Pages
1. Vai su [dash.cloudflare.com](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages**.
2. Collega il tuo repository GitHub oppure trascina direttamente la cartella `web/dist` dopo aver lanciato `npm run build`.

---

### Opzione 3: Netlify
Dalla cartella `web`:
```bash
npx netlify deploy --prod --dir=dist
```
