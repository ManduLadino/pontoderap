/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { VisualData } from '../services/geminiService';

interface VisualDisplayProps {
  visualData: VisualData | null;
  topic: string;
}

const VisualDisplay: React.FC<VisualDisplayProps> = ({ visualData, topic }) => {
  // While loading, show a placeholder.
  if (!visualData) {
    return (
      <div
        className="visual-placeholder"
        aria-label="Gerando imagem..."
        role="img"
      ></div>
    );
  }

  const imageUrl = `data:image/jpeg;base64,${visualData.base64}`;
  const accessibilityLabel = `Representação visual gerada por IA para ${topic}`;

  return (
    <img
      src={imageUrl}
      alt={accessibilityLabel}
      className="generated-visual"
    />
  );
};

export default VisualDisplay;
