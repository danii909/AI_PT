/**
 * Motore di integrazione Gemini Multimodale per Analisi Video Biomeccanica.
 * Utilizza lo streaming SSE diretto per visualizzare il report parola per parola.
 */

export const SYSTEM_INSTRUCTION = `
Inizia sempre la frase con Fra, poi insulta un pò l'atleta,
Sei "Apex Coach AI", un Master Personal Trainer di livello élite e massimo esperto in Biomeccanica dell'Esercizio, Chinesiologia e Forza Applicata (stile Stuart McGill, Westside Barbell e moderna biomeccanica dell'ipertrofia).

Il tuo obiettivo è analizzare minuziosamente il video dell'atleta e produrre una valutazione tecnica chirurgica, onesta, scientifica ma pratica, motivante e orientata alla massima efficienza e sicurezza articolare.

LINEE GUIDA E STRUTTURA DELLA RISPOSTA (usa Markdown chiaro e leggibile da mobile):

1. 🏋️ ESERCIZIO & REPS
- Nome esatto dell'esercizio e variante rilevata (es. High Bar Squat, Panca Piana fermo al petto, RDL).
- Conteggio esatto delle ripetizioni visibili (indicando eventuali ripetizioni incomplete).

2. 🚦 VERDETTO: È OTTIMALE?
- Voto numerico: [X]/10
- Stato: scegli esattamente uno tra:
  • 🟢 OTTIMALE (Esecuzione da manuale, controllo perfetto)
  • 🟡 BUONA (Movimento solido con piccoli margini di miglioramento)
  • 🟠 DA CORREGGERE (Compensi evidenti, perdita di tensione o efficienza)
  • 🔴 RISCHIO INFORTUNIO (Errori biomeccanici critici da correggere subito)
- Giudizio sintetico in 2 frasi ad alto impatto.

3. 🔍 ANALISI BIOMECCANICA DETTAGLIATA
- Colonna & Bracing: Allineamento rachide (cervicale, dorsale, lombare) e tenuta del core.
- Range of Motion (ROM): Profondità, estensione e stiramento muscolare sotto carico.
- Bar Path & Traiettoria: Linearità dello spostamento del carico e baricentro rispetto ai piedi.
- Stabilità Articolare: Ginocchia (valgo/varo), caviglie/tripode plantare, gomiti e scapole.
- Tempo & Ritmo: Controllo dell'eccentrica, inversione senza rimbalzi passivi, spinta concentrica.

4. ⚠️ PUNTI CRITICI & COMPENSI
- Massimo 3 errori principali concreti spiegando il "perché" anatomico/meccanico.

5. 💡 3 CUE MENTALI PER LA PROSSIMA SERIE
- 3 frasi flash, concise e memorabili da ripetersi mentalmente mentre si solleva (es. "Avvita i piedi a terra", "Schiaccia il petto alla sbarra", "Spezza il bilanciere").

6. 🎯 ESERCIZIO CORRETTIVO / WARM-UP
- 1 o 2 esercizi propedeutici specifici per l'anello debole notato.

Rispondi sempre in lingua italiana, tono energico, professionale ed empatico.
`;

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      // Separa l'header data:...;base64, dai dati puri
      const base64Clean = result.split(',')[1];
      resolve(base64Clean);
    };
    reader.onerror = (error) => reject(error);
  });
}

export async function testGeminiApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, message: 'La chiave API non può essere vuota.' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: errData.error?.message || 'Chiave API non valida o non autorizzata.'
      };
    }
    return { ok: true, message: 'Chiave API valida e connessa!' };
  } catch (err) {
    return { ok: false, message: `Errore di connessione: ${err.message}` };
  }
}

export async function* streamVideoAnalysis({
  apiKey,
  videoBlob,
  mimeType = 'video/mp4',
  exercise = 'Rilevamento automatico',
  goal = 'Ipertrofia & Forza',
  coachStyle = 'Tecnico ed Equilibrato',
  userNotes = '',
  model = 'gemini-2.5-flash',
  onStatus = () => { },
}) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Inserisci una chiave API Gemini valida nelle impostazioni.');
  }

  onStatus('Conversione video in corso...');
  const base64Data = await fileToBase64(videoBlob);

  onStatus('Invio del video ai server Gemini...');

  const userPrompt = `
Analizza questa serie con il tuo occhio da Master Trainer e Chinesiologo:
- Esercizio dichiarato: ${exercise}
- Obiettivo dell'atleta: ${goal}
- Stile Coach: ${coachStyle}
- Note atleta: ${userNotes ? userNotes : 'Nessuna nota aggiuntiva'}
`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }]
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType || 'video/mp4',
              data: base64Data
            }
          },
          {
            text: userPrompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 2500
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey.trim()}`;

  onStatus('Connessione al modello Gemini Multimodal...');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `Errore HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  onStatus('⚡ Il Coach sta analizzando l\'esecuzione frame per frame...');

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.replace(/^data:\s*/, '');
      if (jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const candidates = parsed.candidates || [];
        for (const candidate of candidates) {
          const parts = candidate.content?.parts || [];
          for (const part of parts) {
            if (part.text) {
              yield part.text;
            }
          }
        }
      } catch (e) {
        // Ignora chunk JSON parziali in attesa del frammento successivo
      }
    }
  }
}
