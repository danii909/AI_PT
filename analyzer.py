"""
Modulo di interazione con l'API Google Gemini tramite SDK google-genai.
Supporta:
- Fast-path inline per video leggeri (fino a 20MB) con avvio istantaneo
- Files API per video lunghi (>20MB)
- Streaming in tempo reale per mostrare l'analisi parola per parola senza attese
"""

import os
import time
import mimetypes
import tempfile
import warnings
from typing import Callable, Optional, Iterator

warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", message=".*NotOpenSSLWarning.*")

from google import genai
from google.genai import types
from prompts import SYSTEM_INSTRUCTION, build_user_prompt


def get_clean_mime_type(filename: str, mime_type: Optional[str] = None) -> str:
    """Rileva o corregge il MIME type per garantire compatibilità con Gemini."""
    if mime_type and mime_type not in ["application/octet-stream", ""]:
        return mime_type
    
    guessed, _ = mimetypes.guess_type(filename)
    if guessed:
        return guessed
    
    _, ext = os.path.splitext(filename.lower())
    if ext == ".mov":
        return "video/quicktime"
    elif ext in [".webm"]:
        return "video/webm"
    elif ext in [".avi"]:
        return "video/x-msvideo"
    return "video/mp4"


def validate_api_key(api_key: str) -> tuple[bool, str]:
    """Verifica se l'API key inserita è valida effettuando una chiamata di test minimale."""
    if not api_key or not api_key.strip():
        return False, "La chiave API non può essere vuota."
    
    clean_key = api_key.strip()
    try:
        client = genai.Client(api_key=clean_key)
        pager = client.models.list(config={"page_size": 1})
        for _ in pager:
            break
        return True, "API Key valida e connessa!"
    except Exception as e:
        err_msg = str(e)
        if "API_KEY_INVALID" in err_msg or "400" in err_msg or "403" in err_msg:
            return False, "Chiave API Gemini non valida o non abilitata."
        return False, f"Errore: {err_msg[:120]}"


def analyze_video_stream(
    api_key: str,
    video_bytes: bytes,
    filename: str,
    mime_type: Optional[str] = None,
    exercise_name: str = "Rilevamento automatico",
    goal: str = "Ipertrofia & Forza",
    coach_style: str = "Tecnico ed Equilibrato",
    user_notes: str = "",
    model_name: str = "gemini-2.5-flash",
    status_callback: Optional[Callable[[str], None]] = None,
) -> Iterator[str]:
    """
    Invia il video a Gemini e restituisce uno stream di testo in tempo reale.
    Per video fino a 20MB invia i byte direttamente (zero tempi di attesa per la coda Cloud).
    """
    clean_key = api_key.strip()
    client = genai.Client(api_key=clean_key)
    
    clean_mime = get_clean_mime_type(filename, mime_type)
    file_size_mb = len(video_bytes) / (1024 * 1024)

    prompt_text = build_user_prompt(
        exercise_name=exercise_name,
        goal=goal,
        coach_style=coach_style,
        user_notes=user_notes
    )

    temp_file_path = None
    uploaded_file = None

    try:
        # FAST-PATH: Se il video è sotto i 20 MB (come un video di pochi secondi),
        # inviamo i byte direttamente in linea (Part.from_bytes) evitando la coda di conversione Cloud
        if len(video_bytes) <= 20 * 1024 * 1024:
            if status_callback:
                status_callback(f"🚀 Invio istantaneo a Gemini ({file_size_mb:.1f} MB)...")
            
            video_content = types.Part.from_bytes(
                data=video_bytes,
                mime_type=clean_mime
            )
        else:
            # File più grandi: usiamo la Files API con monitoraggio
            if status_callback:
                status_callback(f"📤 Upload video grande ({file_size_mb:.1f} MB) sui server Gemini...")
            
            _, ext = os.path.splitext(filename)
            with tempfile.NamedTemporaryFile(suffix=ext or ".mp4", delete=False) as tmp:
                tmp.write(video_bytes)
                temp_file_path = tmp.name

            uploaded_file = client.files.upload(
                file=temp_file_path,
                config=types.UploadFileConfig(
                    mime_type=clean_mime,
                    display_name=f"workout_{os.path.basename(temp_file_path)}"
                )
            )

            # Polling con feedback immediato
            poll_count = 0
            while uploaded_file.state == types.FileState.PROCESSING and poll_count < 30:
                time.sleep(1.5)
                poll_count += 1
                if status_callback:
                    status_callback(f"⏳ Elaborazione frame in corso ({poll_count * 2}s)...")
                uploaded_file = client.files.get(name=uploaded_file.name)

            if uploaded_file.state == types.FileState.FAILED:
                raise RuntimeError("L'elaborazione video su Gemini è fallita.")
            
            video_content = uploaded_file

        if status_callback:
            status_callback("⚡ Il Coach sta analizzando l'esecuzione...")

        # Lista di modelli con fallback automatico in caso di picchi di traffico (503 UNAVAILABLE)
        candidate_models = [model_name]
        for fallback in ["gemini-2.5-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"]:
            if fallback not in candidate_models:
                candidate_models.append(fallback)

        last_error = None
        for current_model in candidate_models:
            for attempt in range(2):
                try:
                    response_stream = client.models.generate_content_stream(
                        model=current_model,
                        contents=[
                            video_content,
                            prompt_text
                        ],
                        config=types.GenerateContentConfig(
                            system_instruction=SYSTEM_INSTRUCTION,
                            temperature=0.25,
                        )
                    )

                    # Testa il primo chunk per verificare se il server risponde o dà 503
                    for chunk in response_stream:
                        if chunk.text:
                            yield chunk.text
                    return  # Successo!

                except Exception as e:
                    err_str = str(e)
                    last_error = e
                    # Se è un errore 503 / sovraccarico temporaneo, attendiamo o proviamo il fallback
                    if "503" in err_str or "UNAVAILABLE" in err_str or "high demand" in err_str:
                        if attempt == 0:
                            if status_callback:
                                status_callback("⏳ Server momentaneamente occupato, secondo tentativo in corso...")
                            time.sleep(2)
                            continue
                        else:
                            if status_callback:
                                status_callback(f"🔄 Passaggio automatico al server di backup ({current_model})...")
                            break
                    else:
                        raise e

        if last_error:
            raise last_error

    finally:
        # Pulizia file temporaneo locale
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass

        # Pulizia file remoto su Gemini Files API se utilizzato
        if uploaded_file and uploaded_file.name:
            try:
                client.files.delete(name=uploaded_file.name)
            except Exception:
                pass
