import React, { useEffect, useState } from 'react';
import { Copy, Share2, Check, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AnalysisReport({ reportText, isStreaming, onClose }) {
  const [copied, setCopied] = useState(false);
  const [score, setScore] = useState(null);
  const [verdictType, setVerdictType] = useState('good');

  useEffect(() => {
    if (!reportText) return;

    const scoreMatch = reportText.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
    if (scoreMatch) {
      const val = parseFloat(scoreMatch[1]);
      setScore(val);

      if (val >= 9) {
        setVerdictType('optimal');
        if (!isStreaming) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#ffffff', '#d4ff00', '#38bdf8']
            });
          } catch (e) {}
        }
      } else if (val >= 7) {
        setVerdictType('good');
      } else if (val >= 5) {
        setVerdictType('warning');
      } else {
        setVerdictType('danger');
      }
    } else if (reportText.includes('OTTIMALE')) {
      setVerdictType('optimal');
    } else if (reportText.includes('RISCHIO')) {
      setVerdictType('danger');
    }
  }, [reportText, isStreaming]);

  const handleCopy = () => {
    if (!reportText) return;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!reportText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Apex Coach - Report Biomeccanico',
          text: reportText,
        });
      } catch (err) {}
    } else {
      handleCopy();
    }
  };

  const renderFormattedMarkdown = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ') || line.match(/^[1-6]\.\s+/)) {
        return <h2 key={idx}>{line.replace(/^##\s+/, '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx}>{line.replace('# ', '')}</h1>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const content = line.trim().replace(/^[-•]\s+/, '');
        return (
          <li key={idx} style={{ marginBottom: 4 }}>
            {parseBold(content)}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} style={{ borderColor: 'var(--border-subtle)', margin: '12px 0' }} />;
      }
      if (line.trim().length > 0) {
        return (
          <p key={idx} style={{ marginBottom: 6 }}>
            {parseBold(line)}
          </p>
        );
      }
      return null;
    });
  };

  const parseBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
        }}
      >
        {/* Header Report */}
        <div className="report-header" style={{ marginBottom: 12, paddingBottom: 10 }}>
          <div>
            {score !== null ? (
              <div className={`score-badge score-${verdictType}`}>
                <Award size={18} />
                <span>{score} / 10</span>
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                Verdetto Biomeccanico
              </span>
            )}
          </div>

          <div className="report-actions">
            <button onClick={handleCopy} className="icon-btn" title="Copia" style={{ width: 34, height: 34 }}>
              {copied ? <Check size={15} color="var(--accent-green)" /> : <Copy size={15} />}
            </button>
            <button onClick={handleShare} className="icon-btn" title="Condividi" style={{ width: 34, height: 34 }}>
              <Share2 size={15} />
            </button>
            {onClose && (
              <button onClick={onClose} className="icon-btn" title="Chiudi" style={{ width: 34, height: 34, marginLeft: 4 }}>
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Contenuto scrollabile solo dentro il foglio del report */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          <div className="markdown-body">
            {renderFormattedMarkdown(reportText)}
          </div>

          {isStreaming && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              marginTop: 10,
              fontFamily: 'var(--font-mono)'
            }}>
              <span className="spinner-volt" style={{ width: 12, height: 12 }} />
              Analisi in corso...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
