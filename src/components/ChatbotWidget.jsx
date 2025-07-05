import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import axios from 'axios';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { BASE_URL } from '../api/common';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    async function getUserId() {
      try {
        const res = await axios.get(BASE_URL + '/chatbot/get_chatbot_user', {
          credentials: 'same-origin'
        });
        if (!res.ok) throw new Error('No autorizado');
        const data = await res.json();
        setUserId(data.user_id);
      } catch (err) {
        console.error('Error obteniendo usuario:', err);
      }
    }
    getUserId();
  }, []);

  useEffect(() => {
    console.log('#userId', userId);
    if (!userId) return;
    const q = query(collection(db, 'chats', userId, 'mensajes'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => doc.data());
      setMessages(msgs);
    });
    return () => unsub();
  }, [userId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const pregunta = input.trim();

    await addDoc(collection(db, 'chats', userId, 'mensajes'), {
      pregunta,
      respuesta: '',
      timestamp: new Date()
    });

    // Simula respuesta
    const respuesta = 'Esta es una respuesta simulada (aquí va el OpenAI).';
    await addDoc(collection(db, 'chats', userId, 'mensajes'), {
      pregunta: '',
      respuesta,
      timestamp: new Date()
    });

    setInput('');
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl"
        >
          💬
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-4 w-80 max-h-[70vh] bg-white shadow-2xl rounded-lg flex flex-col border z-50">
          <div className="bg-blue-600 text-white p-3 rounded-t-lg font-semibold">
            🤖 Chatbot IA
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                {msg.pregunta && (
                  <div className="self-end bg-blue-100 text-blue-800 px-3 py-2 rounded-lg max-w-[75%] text-sm">
                    {msg.pregunta}
                  </div>
                )}
                {msg.respuesta && (
                  <div className="self-start bg-gray-100 text-gray-800 px-3 py-2 rounded-lg max-w-[75%] text-sm">
                    {msg.respuesta}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-2 border-t flex">
            <input
              className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Escribe tu mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 text-sm"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
