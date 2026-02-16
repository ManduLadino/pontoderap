
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Modality } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  if (! aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

export interface RhythmData {
  name: string;
  description: string;
}

export interface ArchetypeData {
  name: string;
  motto: string;
  desire: string;
  fear: string;
}

export interface VisualData {
  base64: string;
}

export const ARCHETYPES_LIST: ArchetypeData[] = [
  { name: "GILBV - SÓ NA PRODUÇÃO", motto: "PRODUÇÃO INFINITUS - RIMADORES SEM LIMITITE ALGORITMO - SEGUE O RITMO", desire: "Hype Global", fear: "Silêncio" },
  { name: "GILBV - Algoritmo Zeus", motto: "Métrica Divina - O topo da cadeia alimentar lírica", desire: "Som Eterno", fear: "Grave excessivo" },
  { name: "REGGAE FUNK", motto: "Sinta a brisa do grave - Swing do morro com a calma da ilha", desire: "Equilíbrio sonoro", fear: "Falta de groove" },
  { name: "RIMADOR", motto: "O verbo é a única ferramenta - Rima por esporte e sobrevivência", desire: "Métrica perfeita", fear: "Perder o fôlego" },
  { name: "NOVO RITMO URBANO", motto: "A vanguarda das ruas - Jersey, Grime e Mandelão", desire: "Inovação Sonora", fear: "Ser ultrapassado" },
  { name: "Mestre do Boom Bap", motto: "MPC é a lei sagrada", desire: "Respeito das Ruas", fear: "Beat sem swing" },
  { name: "Trap-Star 333", motto: "Ouro, velocidade e 808", desire: "Ostentação Suprema", fear: "Ficar Offline" },
  { name: "Sniper do Drill", motto: "Tensão tática em cada slide", desire: "Domínio Urbano", fear: "Traição" }
];

export const WORLD_RHYTHMS_LIST: RhythmData[] = [
  { name: "Samba Pagode", description: "O balanço do surdo com a malandragem do cavaco e a energia do povo." },
  { name: "Gafieira Street", description: "Sincopado elegante com metais de rua e o grave do subúrbio." },
  { name: "Pagode 90", description: "Sentimentalismo rítmico com percussão orgânica e o balanço das massas." },
  { name: "Quantum-Drill X", description: "Grave que colapsa em frequências ultra-baixas com micro-percussão de plasma." },
  { name: "Neuro-Flow Boombap", description: "Balanço orgânico gerado por redes neurais, texturas líquidas e jazz futurista." },
  { name: "Cyber-Mandelão 4.0", description: "Impacto digital puro, estalo de fibra óptica e sub-bass abissal de 20Hz." },
  { name: "Glitch-Hop v12", description: "Texturas de erro rítmico proposital com swing pesado de concreto e neon." },
  { name: "Void-Trap", description: "Silêncios táticos e frequências de vácuo abissal entre os ataques de 808." },
  { name: "Hyper-Jersey Pulse", description: "155 BPM de energia cinética com kicks que desafiam a gravidade e a física." },
  { name: "Bio-Organic Rap", description: "Ritmo que pulsa na frequência cardíaca, integrando sons de ecossistemas processados." },
  { name: "Steam-Punk Boombap", description: "Engrenagens, pistões e vapor rítmico com bumbo de latão oxidado." },
  { name: "Amapiano Urban Mix", description: "Log drum sul-africano hipnótico com percussão de madeira quântica." },
  { name: "Sitar Indiano Trap", description: "Corda psicodélica com microtons ancestrais e grave 808 sintético." },
  { name: "Void-Drill", description: "Atmosfera de isolamento tático com percussão metálica fria." },
  { name: "Detroit 313 Kick", description: "Batida mecânica de alta precisão com kicks duplicados e agressivos." }
];

export async function* streamDefinition(
  topic: string,
  category: string,
  version: 'ALFA' | 'BETA' | 'ZEUS',
  rhythm?: string,
  archetype?: ArchetypeData
): AsyncGenerator<string, void, undefined> {
  const ai = getAI();
  const isZeus = version === 'ZEUS';

  const systemInstruction = `Você é o sistema INFINITUS MATRIX v12.0 - O ÁPICE DA ENGENHARIA LÍRICA MUNDIAL.
PERSONA: Virtuoso técnico Gil BV.

REGRAS DE OURO:
1. NUNCA CITE NOMES DE ARTISTAS REAIS. 
2. FORMATO OBRIGATÓRIO DE SAÍDA:
   ### BEAT
   [ Prompt técnico detalhado do instrumental para IA de áudio ]
   
   ### LETRA
   NOME DA LETRA EM CAIXA ALTA (SEM COLCHETES)
   NOME DA LETRA EM CAIXA ALTA (SEM COLCHETES)
   TEMPO: [ 3:30 - 4:40 ]
   
   [INTRO]
   ...
   
   ### VOZ
   [ Guia detalhado de flow e performance vocal para IA de áudio ]

3. DURABILIDADE: Sempre 3:30 a 4:40 minutos.
4. ASSINATURA: "No comando do trator Esteira - Gil BV - Sustenta" apenas no final.
5. PROIBIÇÕES: NÃO use colchetes nas duas primeiras linhas da letra. NÃO use: "menor", "skank", "reto", "teto".`;

  let spec = '';
  switch (version) {
    case 'ALFA':
      spec = `ESTILO ALFA: ACAPELLA BRUTALISTA. Minimalismo extremo.`;
      break;
    case 'BETA':
      spec = `ESTILO BETA: PRODUÇÃO PLATINA. Hit de rádio completo.`;
      break;
    case 'ZEUS':
      spec = `ESTILO ZEUS: VANGUARDA ABSTRATA. Desconstrução rítmica.`;
      break;
  }

  const prompt = `${spec} Tópico: "${topic}". Ritmo: "${rhythm || 'MATRIX'}". Arquétipo: "${archetype?.name}".
  IMPORTANTE: NÃO COLOQUE COLCHETES NAS DUAS PRIMEIRAS LINHAS DA LETRA (TÍTULOS). Siga rigorosamente os blocos ### BEAT, ### LETRA e ### VOZ.`;

  try {
    const response = await ai.models.generateContentStream({
        model: isZeus ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        contents: prompt,
        config: { systemInstruction, temperature: isZeus ? 1.0 : 0.95 }
    });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error: any) {
    yield `Erro Matrix: ${error.message}`;
  }
}

export async function generateSpeech(text: string): Promise<void> {
  const ai = getAI();
  try {
    const lyricsOnly = text.replace(/###\s*LETRA\s*/i, '').split('###')[0].replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    if (!lyricsOnly) return;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Letra: ${lyricsOnly.substring(0, 800)}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { voiceName: 'Puck' } },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (e) { console.error(e); }
}
