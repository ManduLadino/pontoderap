
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';

interface InfinityHeaderProps {
  onSearch: (query: string) => void;
  onRandom: () => void;
  isLoading: boolean;
}

const InfinityHeader: React.FC<InfinityHeaderProps> = ({ onSearch, onRandom, isLoading }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        if (transcript.trim()) {
           onSearch(transcript.trim());
           setIsSearchVisible(false);
        }
      };
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onSearch]);

  const handleBuscaClick = () => {
    setIsSearchVisible(prev => !prev);
  };

  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
         alert("Seu navegador não suporta busca por voz.");
         return;
      }
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
      setQuery(''); 
      setIsSearchVisible(false);
    }
  };

  return (
    <div className="infinity-header-container">
      <div className="infinity-svg-wrapper">
        <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
          <defs>
            <linearGradient id="infinity-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#00aaff' }} />
              <stop offset="50%" style={{ stopColor: '#8a2be2' }} />
              <stop offset="100%" style={{ stopColor: '#ff00ff' }} />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M100,50 C100,20 180,20 200,50 C220,80 300,80 300,50 C300,20 220,20 200,50 C180,80 100,80 100,50 Z"
            stroke="url(#infinity-gradient)"
            strokeWidth="8"
            fill="none"
            filter="url(#glow)"
          />
        </svg>
        <div className="infinity-buttons">
          <button
            className="infinity-button left"
            onClick={handleBuscaClick}
            disabled={isLoading}
            aria-label="Busca de Texto"
          >
            Busca
          </button>
          <button
            className="infinity-button right"
            onClick={onRandom}
            disabled={isLoading}
            aria-label="Aleatório"
          >
            Sorte
          </button>
        </div>
      </div>

      <div className="header-voice-trigger">
          <button 
            className={`header-mic-btn ${isListening ? 'active' : ''}`} 
            onClick={toggleVoiceSearch}
            disabled={isLoading}
            title="Buscar por Voz"
          >
            <span className="mic-icon">{isListening ? '⏺' : '🎤'}</span>
            <span className="mic-text">{isListening ? 'OUVINDO O REI...' : 'FALAR COM O REI'}</span>
          </button>
      </div>

      {isSearchVisible && (
        <form onSubmit={handleSubmit} className="infinity-search-form" role="search">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que quer ouvir do Rei?"
            className="infinity-search-input"
            aria-label="Buscar um tópico"
            disabled={isLoading}
            autoFocus
          />
          <button type="submit" className="infinity-submit-button" disabled={isLoading}>
            Ir
          </button>
        </form>
      )}
    </div>
  );
};

export default InfinityHeader;
