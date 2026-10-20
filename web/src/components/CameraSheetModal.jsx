import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

export default function CameraSheetModal({ isOpen, onClose, onVideoRecorded }) {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState('environment'); // camera posteriore default
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Avvia fotocamera quando il modal si apre
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      setIsRecording(false);
      return;
    }

    let active = true;

    async function startCamera() {
      try {
        setCameraError(null);
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }

        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (active) {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (err) {
        console.warn('Errore fotocamera:', err);
        if (active) {
          setCameraError('Permesso fotocamera non concesso.');
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Gestione timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      if (!stream) return;
      chunksRef.current = [];

      let options = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/mp4' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = {};
        }
      }

      try {
        const recorder = new MediaRecorder(stream, options);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const mime = recorder.mimeType || 'video/mp4';
          const blob = new Blob(chunksRef.current, { type: mime });
          onVideoRecorded(blob, 'serie.mp4', mime);
          if (navigator.vibrate) navigator.vibrate(80);
          onClose(); // Chiude il foglio e torna alla home con il video pronto!
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        if (navigator.vibrate) navigator.vibrate(40);
      } catch (e) {
        console.error('Errore MediaRecorder:', e);
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  const handleFlipCamera = () => {
    if (isRecording) return;
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          height: '82dvh',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          background: '#090b0e',
          borderTop: '1px solid rgba(204, 255, 0, 0.3)'
        }}
      >
        {/* Barra superiore foglio fotocamera */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-volt)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {isRecording ? 'Registrazione in corso' : 'Inquadra Esercizio'}
          </span>

          <div style={{ display: 'flex', gap: 8 }}>
            {!isRecording && (
              <button onClick={handleFlipCamera} className="icon-btn" title="Inverti camera">
                <RefreshCw size={16} />
              </button>
            )}
            <button onClick={onClose} className="icon-btn" title="Chiudi">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewfinder con bordi arrotondati */}
        <div style={{
          flex: 1,
          position: 'relative',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: '#000',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {cameraError ? (
            <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
              {cameraError}
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Griglia sottile lime */}
              <div className="hud-overlay" style={{ opacity: 0.6 }}>
                <div className="hud-grid-line" />
                <div className="hud-grid-line" />
                <div className="hud-grid-line" />
                <div className="hud-grid-line" />
              </div>

              {/* Badge REC */}
              {isRecording && (
                <div className="rec-badge" style={{ position: 'absolute', top: 12, left: 12 }}>
                  <div className="rec-dot" />
                  <span>{formatTime(recordSeconds)}</span>
                </div>
              )}

              {/* Shutter Button */}
              <div style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleToggleRecord}
                  className={`record-trigger ${isRecording ? 'is-recording' : ''}`}
                >
                  <div className="record-inner" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
