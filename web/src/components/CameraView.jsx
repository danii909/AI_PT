import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Upload, X, Check, AlertCircle } from 'lucide-react';

export default function CameraView({ onVideoReady, selectedVideo, onClearVideo }) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraError, setCameraError] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isCameraActive || selectedVideo) {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
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
          setCameraError('Permesso non concesso.');
          setIsCameraActive(false);
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
  }, [isCameraActive, facingMode, selectedVideo]);

  useEffect(() => {
    if (videoRef.current && stream && !selectedVideo) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, selectedVideo]);

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

  const handleStartCamera = () => setIsCameraActive(true);

  const handleStopCamera = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

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
          const url = URL.createObjectURL(blob);
          setVideoPreviewUrl(url);
          onVideoReady(blob, 'serie.mp4', mime);
          handleStopCamera();
          if (navigator.vibrate) navigator.vibrate(80);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreviewUrl(url);
      onVideoReady(file, file.name, file.type || 'video/mp4');
      handleStopCamera();
    }
  };

  const handleRetake = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    onClearVideo();
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="camera-card">
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*"
        style={{ display: 'none' }}
        onClick={(e) => { e.target.value = null; }}
        onChange={handleFileChange}
      />

      {/* CASO 1: Video Selezionato -> Preview con tasto cambia */}
      {selectedVideo && videoPreviewUrl ? (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
          <video
            src={videoPreviewUrl}
            controls
            playsInline
            autoPlay
            loop
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <button
            onClick={handleRetake}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0, 0, 0, 0.75)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cambia
          </button>
        </div>

      ) : isCameraActive ? (
        /* CASO 2: Fotocamera aperta */
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-feed"
          />

          <div style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 10
          }}>
            <button onClick={handleStopCamera} className="glass-btn" style={{ width: 36, height: 36 }}>
              <X size={17} />
            </button>

            {isRecording ? (
              <div className="rec-badge">
                <div className="rec-dot" />
                <span>{formatTime(recordSeconds)}</span>
              </div>
            ) : (
              <button onClick={handleFlipCamera} className="glass-btn" style={{ width: 36, height: 36 }}>
                <RefreshCw size={16} />
              </button>
            )}
          </div>

          <div className="camera-controls-bar" style={{ justifyContent: 'center' }}>
            <button
              onClick={handleToggleRecord}
              className={`record-trigger ${isRecording ? 'is-recording' : ''}`}
            >
              <div className="record-inner" />
            </button>
          </div>
        </div>

      ) : (
        /* CASO 3: Stato iniziale minimal (due pulsanti puliti) */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 20,
          background: 'radial-gradient(circle at 50% 50%, #131620 0%, #090a0f 100%)'
        }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: 20
          }}>
            <Camera size={24} strokeWidth={1.75} />
          </div>

          <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 280 }}>
            <button
              onClick={handleStartCamera}
              className="btn-primary-volt"
              style={{ flex: 1.2, margin: 0, minHeight: 44, fontSize: '0.88rem' }}
            >
              <Camera size={16} /> Fotocamera
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-medium)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Upload size={15} /> Galleria
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
