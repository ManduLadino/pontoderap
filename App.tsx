
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { streamDefinition, generateSpeech, WORLD_RHYTHMS_LIST, ARCHETYPES_LIST, RhythmData, ArchetypeData } from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import InfinityHeader from './components/InfinityHeader';
import LoadingSkeleton from './components/LoadingSkeleton';
import RhythmSelector from './components/RhythmSelector';

const CATEGORY_TOPICS: Record<string, string[]> = {
  RAIZ_HIPHOP: ['Raiz do Hip Hop: Fundamento', 'Cultura de Rua Original', 'MPC 60 Street'],
  BOOMBAP: ['Pancadaria Boom Bap', 'Batida Seca Raw', 'Flow de MPC Clássico'],
  RAP: ['Rap Nacional: Visão', 'Poesia de Concreto', 'Lírica de Sobrevivência'],
  TRAP: ['Trap Hype 333', 'Lifestyle e Ouro', 'Futuro do 808'],
  DRILL: ['Tensão Drill', 'Guerra de Rima', 'Slide Tático'],
  GANGSTAR_RAP: ['Gangstar Rap: Realidade', 'Crônicas do Gueto', 'Flow Criminoso'],
  GANGSTAR_TRAP: ['Gangstar Trap: Poder', 'Máfia Digital', 'Ostentação Perigosa'],
  GANGSTAR_BOOMBAP: ['Gangstar Boom Bap: Pesado', 'Classic Street Crime', 'Peso do Asfalto'],
  FRESTYLE: ['Improviso de Rua Afiado', 'Batalha de MCs: Fogo Cruzado', 'Flow Livre Sem Limites'],
  REPENTE_DRIL: ['Repente com Grave de Drill', 'Cordel Urbano Tático', 'Tradição Nordestina e Tensão'],
  NOTICIAS: ['Street News: Rap + Trap + Boombap', 'Visão Diária do Mundo', 'Notícias do Asfalto'],
  BRASIL: ['Música Brasil: Rua Séria', 'Sinfonia Tropical de Elite', 'Identidade Verde-Amarela'],
  URBANOS: ['Urban Beats: Jersey Club', 'Grime London Streets', 'Baile Mandelão Inovação', 'Amapiano Urban Mix'],
  REGGAE: ['Reggae Funk: O Grave e a Brisa', 'Roots Street Style', 'Dancehall de Favela', 'Swing da Ilha Matrix'],
  RITMOS: ['Exploração de 200 Ritmos do Mundo'],
};

const INITIAL_TABS = [
  { id: 0, category: 'RAIZ_HIPHOP', label: 'RAIZ HIP HOP' },
  { id: 1, category: 'BOOMBAP', label: 'BOOM BAP' },
  { id: 2, category: 'RAP', label: 'RAP' },
  { id: 3, category: 'TRAP', label: 'TRAP' },
  { id: 4, category: 'DRILL', label: 'DRILL' },
  { id: 5, category: 'GANGSTAR_RAP', label: 'GANGSTAR RAP' },
  { id: 6, category: 'GANGSTAR_TRAP', label: 'GANGSTAR TRAP' },
  { id: 7, category: 'GANGSTAR_BOOMBAP', label: 'GANGSTAR BAP' },
  { id: 13, category: 'FRESTYLE', label: 'FREESTYLE' },
  { id: 14, category: 'REPENTE_DRIL', label: 'REPENTE DRIL' },
  { id: 8, category: 'NOTICIAS', label: 'NOTÍCIAS DO DIA' },
  { id: 9, category: 'BRASIL', label: 'MÚSICA BRASIL' },
  { id: 12, category: 'URBANOS', label: 'URBANOS' },
  { id: 11, category: 'REGGAE', label: 'REGGAE' },
  { id: 10, category: 'RITMOS', label: '200 RITMOS' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedRhythm, setSelectedRhythm] = useState<RhythmData | null>(null);
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeData>(ARCHETYPES_LIST[0]); 
  const [isRhythmSelectorOpen, setIsRhythmSelectorOpen] = useState(false);
  const [isZeusActive, setIsZeusActive] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const streamRequestIds = useRef<Record<string, string>>({});

  const [tabStates, setTabStates] = useState(INITIAL_TABS.map(tab => ({
    ...tab,
    topic: CATEGORY_TOPICS[tab.category][0],
    contentAlfa: '',
    contentBeta: '',
    contentZeus: '',
    isLoading: false, 
  })));

  const generateTriModularContent = useCallback(async (tabId: number, topic: string) => {
    if (tabId === 10) return;
    const requestId = Math.random().toString(36).substring(7);
    streamRequestIds.current[tabId] = requestId;

    setTabStates(prev => prev.map(t => t.id === tabId ? { ...t, topic, contentAlfa: '', contentBeta: '', contentZeus: '', isLoading: true } : t));

    const runStream = async (ver: 'ALFA' | 'BETA' | 'ZEUS') => {
      let accumulated = '';
      const motor = streamDefinition(topic, INITIAL_TABS.find(t => t.id === tabId)!.category, ver, selectedRhythm?.name, selectedArchetype);
      for await (const chunk of motor) {
        if (streamRequestIds.current[tabId] !== requestId) break;
        accumulated += chunk;
        setTabStates(prev => prev.map(t => t.id === tabId ? { ...t, [`content${ver.charAt(0).toUpperCase() + ver.slice(1).toLowerCase()}`]: accumulated } : t));
      }
    };

    const tasks = [runStream('ALFA'), runStream('BETA')];
    if (isZeusActive) tasks.push(runStream('ZEUS'));

    await Promise.all(tasks);
    setTabStates(prev => prev.map(t => t.id === tabId ? { ...t, isLoading: false } : t));
  }, [selectedRhythm, selectedArchetype, isZeusActive]);

  const handleCopy = async (textToCopy: string, label: string) => {
    if (!textToCopy) return;
    const cleanText = textToCopy.trim();
    if (cleanText.length < 1) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cleanText;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopyStatus(label);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  useEffect(() => {
    generateTriModularContent(0, CATEGORY_TOPICS['RAIZ_HIPHOP'][0]);
  }, []);

  const currentTab = useMemo(() => tabStates.find(t => t.id === activeTab) || tabStates[0], [tabStates, activeTab]);

  const parseText = (content: string) => {
    const result = { letra: '', beat: '', vozGil: '' };
    if (!content) return result;
    
    const blocks = content.split(/###/);
    blocks.forEach(block => {
      const trimmed = block.trim();
      if (/^BEAT/i.test(trimmed)) {
        result.beat = trimmed.replace(/^BEAT/i, '').trim();
      } else if (/^LETRA/i.test(trimmed)) {
        result.letra = trimmed.replace(/^LETRA/i, '').trim();
      } else if (/^VOZ/i.test(trimmed)) {
        result.vozGil = trimmed.replace(/^VOZ\s*(GIL\s*BV)?/i, '').trim();
      }
    });

    return result;
  };

  const ActionGroup = ({ content, prefix }: { content: string, prefix: string }) => {
    const parsed = parseText(content);
    if (content.length < 10) return null;

    const masterPrompt = `PROMPT DE INSTRUMENTAL:\n${parsed.beat}\n\nPROMPT DE VOZ:\n${parsed.vozGil}`;

    return (
      <div className="action-grid-wrapper top-placement">
        <div className="action-row">
          <button 
            onClick={() => handleCopy(parsed.letra, `${prefix}-l`)} 
            className={`btn-copy ${copyStatus === `${prefix}-l` ? 'ok' : ''}`}
            disabled={!parsed.letra}
          >
            {copyStatus === `${prefix}-l` ? 'LETRA COPIADA!' : 'COPIAR LETRA'}
          </button>
        </div>
        <div className="action-row" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => handleCopy(parsed.beat, `${prefix}-b`)} 
            className={`btn-copy ${copyStatus === `${prefix}-b` ? 'ok' : ''}`}
            disabled={!parsed.beat}
            style={{ flex: 1 }}
          >
            {copyStatus === `${prefix}-b` ? 'BEAT COPIADO!' : 'COPIAR BEAT'}
          </button>
          <button 
            onClick={() => handleCopy(parsed.vozGil, `${prefix}-v`)} 
            className={`btn-copy ${copyStatus === `${prefix}-v` ? 'ok' : ''}`}
            disabled={!parsed.vozGil}
            style={{ flex: 1 }}
          >
            {copyStatus === `${prefix}-v` ? 'VOZ COPIADA!' : 'COPIAR VOZ'}
          </button>
        </div>
        <div className="action-row">
           <button 
            onClick={() => handleCopy(masterPrompt, `${prefix}-m`)} 
            className={`btn-copy btn-master ${copyStatus === `${prefix}-m` ? 'ok' : ''}`}
            disabled={!parsed.beat && !parsed.vozGil}
          >
            {copyStatus === `${prefix}-m` ? 'MESTRE COPIADO!' : 'PROMPT MESTRE (BEAT+VOZ)'}
          </button>
        </div>
        <button onClick={() => generateSpeech(content)} className="btn-listen" disabled={!content || content.length < 20}>
          OUVIR NO FLOW GIL BV
        </button>
      </div>
    );
  };

  return (
    <div className="rei-das-ruas-app">
      <InfinityHeader 
        onSearch={(q) => generateTriModularContent(activeTab, q)} 
        onRandom={() => {
          const topics = CATEGORY_TOPICS[currentTab.category];
          generateTriModularContent(activeTab, topics[Math.floor(Math.random()*topics.length)]);
        }} 
        isLoading={currentTab.isLoading} 
      />
      
      <main>
        <div className="fixed-logo-container">
          <h1 className="fixed-logo-text">INFINITUS MATRIX v12.0</h1>
          <p className="infinitus-motto">GILBV SÓ NA PRODUÇÃO</p>
          <p className="subtitle">NO COMANDO DO TRATOR ESTEIRA - GIL BV SUSTENTA</p>
          <div className="logo-line"></div>
        </div>

        <nav className="cyber-tabs-grid">
          {tabStates.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-item-block ${activeTab === tab.id ? 'active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </nav>

        {currentTab.category === 'RITMOS' ? (
          <div className="rhythms-library-view full-block">
             <div className="section-header center">
                <div className="topic-badge">SISTEMA · 200 RITMOS</div>
                <h2 className="topic-title">BIBLIOTECA MUNDIAL GIL BV</h2>
             </div>
             <div className="rhythms-grid">
                {WORLD_RHYTHMS_LIST.map((r, i) => (
                  <div key={i} className="rhythm-item-card" onClick={() => { setSelectedRhythm(r); setActiveTab(0); }}>
                    <div className="rhythm-tag">{r.name}</div>
                    <p>{r.description}</p>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          <>
            <div className="voice-controls-container">
              <div className="params-grid">
                <div className="control-group">
                  <label className="cyber-label">Arquetipo:</label>
                  <select className="style-select-active" value={selectedArchetype.name} onChange={(e) => setSelectedArchetype(ARCHETYPES_LIST.find(a => a.name === e.target.value)!)}>
                    {ARCHETYPES_LIST.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                  </select>
                </div>
                <div className="control-group">
                  <label className="cyber-label">Batida:</label>
                  <button className="selector-btn" onClick={() => setIsRhythmSelectorOpen(true)}>
                    {selectedRhythm ? selectedRhythm.name : 'ESCOLHER BEAT'}
                  </button>
                </div>
                <div className="control-group">
                  <label className="cyber-label">Vértebra Zeus:</label>
                  <button className={`zeus-toggle ${isZeusActive ? 'active' : ''}`} onClick={() => setIsZeusActive(!isZeusActive)}>
                    {isZeusActive ? 'ZEUS ATIVO' : 'ATIVAR ZEUS'}
                  </button>
                </div>
              </div>
            </div>

            <div className="soul-master-command-area">
                <button 
                  className={`master-largada-btn ${currentTab.isLoading ? 'streaming' : ''}`} 
                  onClick={() => generateTriModularContent(activeTab, currentTab.topic)}
                  disabled={currentTab.isLoading}
                >
                  <div className="btn-glow"></div>
                  <span className="btn-text">
                    {currentTab.isLoading ? 'SINTETIZANDO ALMAS...' : 'LARGADA SUPREMA MATRIX'}
                  </span>
                  <div className="btn-sub">VEM NA ESTRADA - GIL BV PRODUÇÕES</div>
                </button>
            </div>

            <div className={`dual-content-wrapper ${isZeusActive ? 'triple' : ''}`}>
              <div className="dual-column alfa">
                <div className="column-header">ALFA (ACAPELLA / BRUTAL)</div>
                <ActionGroup content={currentTab.contentAlfa} prefix="alfa" />
                <div className="result-card">
                  <ContentDisplay content={currentTab.contentAlfa} isLoading={currentTab.isLoading} onWordClick={(w) => generateTriModularContent(activeTab, w)} />
                </div>
              </div>

              <div className="dual-column beta">
                <div className="column-header">BETA (HIT / PLATINA)</div>
                <ActionGroup content={currentTab.contentBeta} prefix="beta" />
                <div className="result-card">
                  <ContentDisplay content={currentTab.contentBeta} isLoading={currentTab.isLoading} onWordClick={(w) => generateTriModularContent(activeTab, w)} />
                </div>
              </div>

              {isZeusActive && (
                <div className="dual-column zeus">
                  <div className="column-header">ZEUS (VANGUARDA / 200%)</div>
                  <ActionGroup content={currentTab.contentZeus} prefix="zeus" />
                  <div className="result-card">
                    <ContentDisplay content={currentTab.contentZeus} isLoading={currentTab.isLoading} onWordClick={(w) => generateTriModularContent(activeTab, w)} />
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {isRhythmSelectorOpen && (
          <RhythmSelector rhythms={WORLD_RHYTHMS_LIST} onSelect={(r) => { setSelectedRhythm(r); setIsRhythmSelectorOpen(false); }} onClose={() => setIsRhythmSelectorOpen(false)} />
        )}
      </main>

      <footer className="sticky-footer">
        <p className="footer-text">INFINITUS MATRIX · GILBV SUSTENTA ( NO COMANDO DO TRATOR ESTEIRA )</p>
      </footer>
    </div>
  );
};

export default App;
