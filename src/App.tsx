import React from 'react';
import { BrazilFlowMap } from './BrazilFlowMap';

function App() {
  return (
    // Resetando margens padrão para garantir tela cheia
    <div style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <BrazilFlowMap />
    </div>
  );
}

export default App;
