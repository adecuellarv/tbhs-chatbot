import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import axios from 'axios';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import Lottie from 'lottie-react';
import { BASE_URL } from '../api/common';
import help from './img/help.png';
import dani from './img/dani.png';
import hi from './img/hi.json';

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
          className="bg-gray-300 hover:bg-gray-100 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl"
        >
          <img src={help} alt="help" />
        </button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-4 w-[30rem] max-h-[70vh] bg-white shadow-2xl rounded-2xl flex flex-col border z-50">
          <div className="bg-[#0585e1] text-white p-3 rounded-t-2xl font-semibold flex">
            <img className="w-[60px]" src={dani} alt="Danny" />
            <div className="mt-4">
              Dan Asistente
            </div>
          </div>

          {!!messages?.length ?
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
            :
            <div className="text-center p-5">
              <div className="w-[70%] m-auto mt-[-20px]">
                <Lottie
                  animationData={hi}
                  loop
                  autoplay
                />
              </div>
              <p className="text-4xl">¡Hola, <strong>Ade</strong>! </p>
              <p className="text-2xl text-gray-700 mt-2">Soy <strong>Dani</strong> tu asistente, ¿en que puedo ayudarte hoy?</p>
            </div>
          }

          <div className="">

            <form>
              <label for="chat" className="sr-only">Escribe tus dudas</label>
              <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg dark:bg-gray-700">
                <button type="button" className="inline-flex justify-center p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg>
                </button>
                <button type="button" className="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd"></path></svg>
                </button>

                <textarea
                  id="chat"
                  rows="1"
                  className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Escribe tus dudas..."></textarea>

                <button type="submit" className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                  <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
