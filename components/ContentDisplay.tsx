
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
}

const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
}> = ({ content, onWordClick }) => {
  const words = content.split(/(\s+)/).filter(Boolean);

  return (
    <div className="content-text-wrapper">
      {words.map((word, index) => {
        if (/\S/.test(word)) {
          const cleanWord = word.replace(/[.,!?;:()"'*]/g, '');
          if (cleanWord) {
            return (
              <button
                key={index}
                onClick={() => onWordClick(cleanWord)}
                className="interactive-word"
                aria-label={`Explorar ${cleanWord}`}
              >
                {word}
              </button>
            );
          }
        }
        return <span key={index}>{word}</span>;
      })}
    </div>
  );
};

const StreamingContent: React.FC<{ content: string }> = ({ content }) => (
  <div className="content-text-wrapper streaming">
    {content}
    <span className="blinking-cursor">|</span>
  </div>
);

const ContentDisplay: React.FC<ContentDisplayProps> = ({ content, isLoading, onWordClick }) => {
  if (isLoading && content.length === 0) return null;

  const renderParsedContent = (rawText: string) => {
    const sections = rawText.split(/(###\s*[A-Z\s]+)/i).filter(Boolean);
    
    return sections.map((section, idx) => {
      if (section.trim().startsWith('###')) {
        return <h3 key={idx} className="block-header-tag">{section.replace(/###/g, '').trim()}</h3>;
      }
      
      const bracketParts = section.split(/(\[.*?\])/).filter(Boolean);
      
      return (
        <div key={idx} className="section-body-box">
          {bracketParts.map((part, pIdx) => {
            const trimmedPart = part.trim();
            const isBracketed = trimmedPart.startsWith('[') && trimmedPart.endsWith(']');
            if (isBracketed) {
              const text = trimmedPart.slice(1, -1).trim();
              
              const isTime = /^(\d+:\d+)(\s*-\s*\d+:\d+)?$/.test(text);
              const isStructural = ['HOOK', 'INTRO', 'OUTRO', 'PONTE', 'VERSO'].some(s => text.toUpperCase().includes(s));
              const isGolden = ['TRAP HYPE 333', 'LIFESTYLE E OURO', 'OURO', 'PLATINA'].some(s => text.toUpperCase().includes(s));
              
              let className = 'instrumental-prompt';
              if (isTime) className = 'timestamp-badge';
              else if (isStructural) className = 'structural-tag';
              else if (isGolden) className = 'golden-glow-tag';
              else if (text === text.toUpperCase() && text.length > 3) className = 'project-title-tag';

              return <div key={pIdx} className={className}>{part.toUpperCase()}</div>;
            }
            return <InteractiveContent key={pIdx} content={part} onWordClick={onWordClick} />;
          })}
        </div>
      );
    });
  };

  return (
    <div className="content-container">
      {isLoading ? (
        <StreamingContent content={content} />
      ) : (
        <div className="structured-render-area">
          {renderParsedContent(content)}
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
