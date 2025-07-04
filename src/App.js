import { useState } from 'react';
import ChatbotWidget from './components/ChatbotWidget';
import { content } from './content';
import './index.css';

function App() {
  const [lang, setLang] = useState('en');
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <ChatbotWidget lang={lang} setLang={setLang} />
    </div>
  );
}

export default App;