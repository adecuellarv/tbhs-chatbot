import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Lottie from 'lottie-react';
import { BASE_URL } from '../api/common';
import { getHistory, sendHistory } from '../api/history';
import help from './img/help.png';
import dani from './img/dani.png';
import hi from './img/hi.json';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null)

  const sendMsg = async (msg) => {
    try {
      if (userInfo?.user_id && userInfo?.user_name && msg.trim()) {
        const messageId = 'temp-' + Date.now();

        //Agregar mensaje del usuario
        const newUserMsg = {
          id: messageId,
          userName: userInfo.user_name,
          message: msg.trim(),
          remitent: 'user',
          status: 'sending' // NEW
        };
        setMessages(prev => [...prev, newUserMsg]);
        setInput('');

        //Mostrar "..."
        const typingId = 'typing-' + Date.now();
        const typingMsg = {
          id: typingId,
          userName: 'Dani',
          message: 'Escribiendo...',
          remitent: 'ia',
          typing: true
        };
        setMessages(prev => [...prev, typingMsg]);

        const values = {
          userId: userInfo.user_id.toString(),
          userName: userInfo.user_name,
          message: newUserMsg.message
        };

        const resp = await sendHistory(values);

        //Mostrar respuesta
        if (resp?.respuesta) {
          setMessages(prev =>
            prev
              .filter(m => m.id !== typingId)
              .map(m =>
                m.id === messageId ? { ...m, status: 'sent' } : m
              )
              .concat({
                id: 'response-' + Date.now(),
                userName: 'Dani',
                message: resp.respuesta,
                remitent: 'ia'
              })
          );
        }

        //Mostrar opciones
        if (resp?.multipleMatches) {
          setMessages(prev => {
            const updated = prev.filter(m => m.id !== typingId);

            const withStatus = updated.map(m =>
              m.id === messageId ? { ...m, status: 'sent' } : m
            );

            const optionsMsg = {
              id: 'options-' + Date.now(),
              userName: 'Dani',
              remitent: 'ia',
              options: resp.options
            };

            return [...withStatus, optionsMsg];
          });

        }

      }
    } catch (error) {
      console.error(error);

      setMessages(prev =>
        prev.map(m =>
          m.status === 'sending' ? { ...m, status: 'error' } : m
        )
      );

      setMessages(prev => prev.filter(m => !m.typing));
    }
  };

  const sendTyped = () => {
    sendMsg(input);
  }

  const getHistoryByUserid = async () => {
    setLoading(true);
    const resp = await getHistory(userInfo?.user_id);
    setLoading(false);
    if (resp?.messages?.length) {
      setMessages(resp?.messages)
    }
  }

  useEffect(() => {
    async function getUserId() {
      try {
        const res = await axios.get(BASE_URL + '/chatbot/get_chatbot_user', {
          credentials: 'same-origin'
        });
        if (res.status !== 200) throw new Error('No autorizado');
        setUserInfo(res?.data);
      } catch (err) {
        setLoading(false);
        console.error('Error obteniendo usuario:', err);
      }
    }
    getUserId();
  }, []);

  useEffect(() => {
    if (userInfo?.user_id) {
      getHistoryByUserid();
    }
  }, [userInfo]);

  useEffect(() => {
    if (open, messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, open]);

  console.log('#messages', messages)

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

          {!!messages?.length && !loading ?
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col">
                  {msg.remitent === 'user' && (
                    <div className="self-end bg-blue-100 text-blue-800 px-3 py-2 rounded-lg max-w-[75%] text-sm relative">
                      {msg.message}
                      {msg.status === 'error' && (
                        <span className="ml-2 text-xs text-red-500">⚠️</span>
                      )}
                    </div>
                  )}

                  {msg.remitent === 'ia' && (
                    <div className="self-start bg-gray-100 text-gray-800 px-3 py-2 rounded-lg max-w-[75%] min-w-[40px] text-sm">
                      {msg.typing ? (
                        <span className="typing-dots"><span className="dots" /></span>
                      ) : msg.options ? (
                        <div className="flex flex-col gap-2">
                          <p className="mb-1 font-semibold text-gray-700">Elige una opción:</p>
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={() => sendMsg(opt.pregunta)}
                              className="text-left px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 shadow-sm transition"
                            >
                              {opt.pregunta}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div
                          className="text-sm text-gray-800 chat-html"
                          dangerouslySetInnerHTML={{ __html: msg.message }}
                        />


                      )}
                    </div>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            : !loading &&
            <div className="text-center p-5">
              <div className="w-[70%] m-auto mt-[-20px]">
                <Lottie
                  animationData={hi}
                  loop
                  autoplay
                />
              </div>
              <p className="text-4xl">¡Hola, <strong>{userInfo?.user_name}</strong>! </p>
              <p className="text-2xl text-gray-700 mt-2">Soy <strong>Dani</strong> tu asistente, ¿en que puedo ayudarte hoy?</p>
            </div>
          }
          {loading &&
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center p-5 flex flex-col items-center">
                <div className="w-[70%] mx-auto">
                  <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            </div>
          }
          <div className="">
            <div className="flex items-center py-2 px-3 bg-gray-50 rounded-lg dark:bg-gray-700">
              <textarea
                id="chat"
                rows="1"
                className="block mx-4 p-2.5 w-full h-[80px] text-lg text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 "
                placeholder="Escribe tus dudas..."
                value={input}
                onChange={(e) => setInput(e?.target?.value)}
              ></textarea>

              <button
                onClick={sendTyped}
                className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
              </button>
            </div>


          </div>
        </div>
      )}
    </>
  );
}
