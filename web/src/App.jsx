import React, { useState } from 'react';
import { Settings, History, Zap, Key } from 'lucide-react';
import CameraView from './components/CameraView';
import WorkoutOptions from './components/WorkoutOptions';
import AnalysisReport from './components/AnalysisReport';
import SettingsModal from './components/SettingsModal';
import HistoryDrawer from './components/HistoryDrawer';
import { streamVideoAnalysis } from './gemini';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apex_gemini_key') || '');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const [videoBlob, setVideoBlob] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [videoMime, setVideoMime] = useState('video/mp4');

  const [selectedExercise, setSelectedExercise] = useState('🔍 Auto');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('apex_history') || '[]');
    } catch {
      return [];
    }
  });

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('apex_gemini_key', key);
  };

  const handleVideoReady = (blob, name, mime) => {
    setVideoBlob(blob);
    setVideoName(name);
    setVideoMime(mime);
    setReportMarkdown('');
  };

  const handleClearVideo = () => {
    setVideoBlob(null);
    setVideoName('');
    setReportMarkdown('');
    setShowReportModal(false);
  };

  const handleStartAnalysis = async () => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    if (!videoBlob) return;

    setIsAnalyzing(true);
    setStatusMessage('Analisi video...');
    setReportMarkdown('');
    setShowReportModal(true); // Apre subito il foglio del report in streaming

    let accumulatedText = '';

    try {
      const stream = streamVideoAnalysis({
        apiKey,
        videoBlob,
        mimeType: videoMime,
        exercise: selectedExercise,
        model: selectedModel,
        onStatus: (msg) => setStatusMessage(msg),
      });

      for await (const chunk of stream) {
        accumulatedText += chunk;
        setReportMarkdown(accumulatedText);
      }

      setStatusMessage('');

      const newHistoryItem = {
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        exercise: selectedExercise,
        report: accumulatedText,
      };

      const updated = [newHistoryItem, ...history];
      setHistory(updated);
      localStorage.setItem('apex_history', JSON.stringify(updated));

    } catch (err) {
      console.error(err);
      setStatusMessage('');
      setReportMarkdown(`❌ **Errore durante l'analisi:**\n\n${err.message || 'Verifica la chiave API Gemini.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header minimale */}
      <header className="header-bar">
        <div className="brand-name">
          Apex<span>Coach</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {!apiKey && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--border-medium)',
                color: '#fff',
                fontSize: '0.74rem',
                fontWeight: 600,
                padding: '0 10px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer'
              }}
            >
              <Key size={13} /> Chiave API
            </button>
          )}

          <button className="icon-btn" onClick={() => setIsHistoryOpen(true)} title="Cronologia">
            <History size={16} />
          </button>
          <button className={`icon-btn ${apiKey ? 'has-key' : ''}`} onClick={() => setIsSettingsOpen(true)} title="Impostazioni">
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Selettore rapido esercizio (riga singola orizzontale) */}
      <WorkoutOptions
        selectedExercise={selectedExercise}
        onSelectExercise={setSelectedExercise}
      />

      {/* Card Fotocamera / Video che riempie lo spazio centrale */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CameraView
          onVideoReady={handleVideoReady}
          selectedVideo={videoBlob}
          onClearVideo={handleClearVideo}
        />
      </div>

      {/* Barra inferiore con azione primaria */}
      <div style={{ paddingTop: 10 }}>
        {videoBlob ? (
          <button
            className="btn-primary-volt"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
          >
            <Zap size={18} /> {isAnalyzing ? statusMessage || 'Analisi in corso...' : 'Analizza Esecuzione'}
          </button>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', padding: '6px 0' }}>
            Inquadra o carica un video per iniziare
          </div>
        )}
      </div>

      {/* Bottom Sheet del Report Biomeccanico */}
      {showReportModal && reportMarkdown && (
        <AnalysisReport
          reportText={reportMarkdown}
          isStreaming={isAnalyzing}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Modale Impostazioni */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      {/* Drawer Cronologia */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={(item) => {
          setReportMarkdown(item.report);
          setSelectedExercise(item.exercise);
          setShowReportModal(true);
        }}
        onClearHistory={() => {
          setHistory([]);
          localStorage.removeItem('apex_history');
        }}
      />
    </div>
  );
}
