
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RhythmData } from '../services/geminiService';

interface RhythmSelectorProps {
  rhythms: RhythmData[];
  onSelect: (rhythm: RhythmData) => void;
  onClose: () => void;
}

const RhythmSelector: React.FC<RhythmSelectorProps> = ({ rhythms, onSelect, onClose }) => {
  const [filter, setFilter] = useState('');

  const filteredRhythms = rhythms.filter(r => 
    r.name.toLowerCase().includes(filter.toLowerCase()) || 
    r.description.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="rhythm-modal-overlay">
      <div className="rhythm-modal-content">
        <header className="modal-header">
          <h3>200 RITMOS DO MUNDO</h3>
          <button className="close-modal" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-filter">
          <input 
            type="text" 
            placeholder="Filtrar ritmo ou origem..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
            autoFocus
          />
        </div>
        <div className="rhythm-list-container">
          {filteredRhythms.map((r, idx) => (
            <div key={idx} className="rhythm-card" onClick={() => onSelect(r)}>
              <span className="rhythm-name">{r.name}</span>
              <p className="rhythm-desc">{r.description}</p>
            </div>
          ))}
          {filteredRhythms.length === 0 && (
            <p className="no-results">Nenhum ritmo encontrado para esta frequência.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RhythmSelector;
