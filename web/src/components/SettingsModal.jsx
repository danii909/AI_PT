import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, AlertTriangle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { testGeminiApiKey } from '../gemini';

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // { loading, ok, message }

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!tempKey.trim()) return;
    setTestStatus({ loading: true, ok: null, message: 'Verifica in corso...' });
    const res = await testGeminiApiKey(tempKey);
    setTestStatus({ loading: false, ok: res.ok, message: res.message });
  };

  const handleSave = () => {
    onSaveApiKey(tempKey.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={20} color="var(--accent-volt)" />
            <h2 className="modal-title">Impostazioni Coach</h2>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 34, height: 34 }}>
            <X size={18} />
          </button>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: 6,
            textTransform: 'uppercase'
          }}>
            Gemini API Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              className="input-field"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Salvata nel tuo browser (localStorage). Non passa per nessun server intermedio.
          </p>
        </div>

        {/* Test status banner */}
        {testStatus && (
          <div style={{
            background: testStatus.ok ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 51, 102, 0.1)',
            border: `1px solid ${testStatus.ok ? 'var(--accent-green)' : 'var(--accent-red)'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontSize: '0.82rem',
            marginBottom: 14,
            color: testStatus.ok ? 'var(--accent-green)' : 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            {testStatus.loading ? (
              <span className="spinner-volt" style={{ width: 14, height: 14 }} />
            ) : testStatus.ok ? (
              <Check size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            <span>{testStatus.message}</span>
          </div>
        )}

        {/* Model Selector */}
        <div style={{ marginBottom: 18 }}>
          <label style={{
            display: 'block',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: 6,
            textTransform: 'uppercase'
          }}>
            Modello Gemini
          </label>
          <div className="chips-scroll" style={{ marginBottom: 0 }}>
            {['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'].map((m) => (
              <button
                key={m}
                className={`chip ${selectedModel === m ? 'active' : ''}`}
                onClick={() => onSelectModel(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons Action */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <button
            onClick={handleTest}
            disabled={!tempKey.trim() || testStatus?.loading}
            style={{
              flex: 1,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '12px 0',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            🧪 Testa Chiave
          </button>

          <button
            onClick={handleSave}
            className="btn-primary-volt"
            style={{ flex: 1.5, margin: 0, minHeight: 'auto' }}
          >
            <ShieldCheck size={18} /> Salva e Chiudi
          </button>
        </div>

        {/* Get API Key link */}
        <div style={{
          textAlign: 'center',
          paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--accent-volt)',
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontWeight: 600
            }}
          >
            Ottieni una chiave gratuita su Google AI Studio <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
