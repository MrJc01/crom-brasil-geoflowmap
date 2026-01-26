
import { BrazilFlowMap } from './BrazilFlowMap';
import './App.css';

function App() {
  return (
    // Ensure no default margins affect the full-screen layout
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <BrazilFlowMap />
    </div>
  );
}

export default App;
