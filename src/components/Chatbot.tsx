import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import botAnimation from '../assets/bot.json';
import { useAuth } from '../context/AuthContext';

// Helper to handle potential default export mismatch in some build environments
const LottieComponent = (Lottie as any).default || Lottie;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { userData, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Conocimiento base del bot sobre los procesos
  const botKnowledge = {
    general: {
      "crear cuenta": "Para crear una cuenta personal, ve a /register. Si eres una empresa, usa /company-register.",
      "consultar datos": "Toda tu información personal está en la sección Mi Perfil (/profile).",
      "ayuda": "Puedo ayudarte a comprar boletos, ver reportes, registrar empresas o buses. ¿Qué necesitas?"
    },
    ERP: {
      "reporte": "Como administrador, puedes ver analíticas avanzadas en /erp/reports.",
      "boleto": "Para emitir un nuevo boleto de ventanilla, dirígete a /erp/ticketing.",
      "flota": "Puedes rastrear tus unidades en tiempo real en la sección Flota en Vivo (/erp/fleet).",
      "cierre": "Al terminar el turno, realiza el cierre en /erp/cash-close."
    },
    pasajero: {
      "compra": "Para comprar un boleto, ve al Dashboard principal y selecciona tu destino.",
      "mis tickets": "Tus boletos comprados están en /my-tickets.",
      "rutas": "Consulta todos los horarios y precios en /terminal-schedule."
    }
  };

  useEffect(() => {
    const getWelcomeMessage = () => {
      const name = userData?.nombre || '';
      if (location.pathname.startsWith('/erp')) {
        return `Hola ${name}, estoy listo para ayudarte con la gestión operativa. ¿Necesitas un reporte o emitir boletos?`;
      }
      if (role === 'CLIENTE') {
        return `¡Hola ${name}! ¿Listo para tu próximo viaje? Dime a dónde quieres ir.`;
      }
      return "¡Hola! Soy Andi, tu asistente inteligente. ¿Cómo puedo ayudarte hoy?";
    };

    setMessages([{ role: 'bot', content: getWelcomeMessage() }]);
  }, [location.pathname, userData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processAction = (text: string) => {
    const msg = text.toLowerCase();
    
    // Acciones Inteligentes Automáticas
    if (msg.includes('reporte') || msg.includes('estadisticas')) {
      if (role === 'OFICINA') {
        navigate('/erp/reports');
        return "Abriendo panel de telemetría y reportes...";
      }
      return "Los reportes son exclusivos para administradores del ERP.";
    }

    if (msg.includes('boleto') || msg.includes('ticket') || msg.includes('viajar')) {
      if (role === 'OFICINA') {
        navigate('/erp/ticketing');
        return "Dirigiéndote a la terminal de emisión de boletos...";
      }
      navigate('/dashboard');
      return "Busquemos el mejor ticket para ti. Redirigiendo...";
    }

    if (msg.includes('cuenca') || msg.includes('loja') || msg.includes('quito') || msg.includes('guayaquil')) {
       navigate('/dashboard');
       return `Entendido, buscando las mejores opciones para ir a ${msg.split(' ').pop()}.`;
    }

    if (msg.includes('configuracion') || msg.includes('empresa') || msg.includes('sucursal')) {
       if (role === 'OFICINA') {
         navigate('/erp/settings');
         return "Entrando a la configuración técnica de la cooperativa...";
       }
    }

    if (msg.includes('cierre') || msg.includes('caja')) {
      if (role === 'OFICINA') {
        navigate('/erp/cash-close');
        return "Abriendo módulo de cierre de caja...";
      }
    }

    return null;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const actionRes = processAction(userMsg);
      let response = actionRes || "Entiendo. Estoy procesando tu solicitud...";
      
      if (!actionRes) {
        // Respuesta genérica inteligente
        const lower = userMsg.toLowerCase();
        if (lower.includes('hola')) response = "¡Hola! Estoy a tus órdenes. ¿Qué proceso deseas realizar?";
        else if (lower.includes('gracias')) response = "¡De nada! Es un placer ayudarte.";
        else response = "No estoy seguro de cómo procesar eso aún, pero puedo ayudarte con boletos, reportes o configuración si me lo pides.";
      }
      
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-body flex flex-col items-end">
      {/* Ventana de Chat */}
      {isOpen && (
        <div className="mb-6 w-[380px] max-h-[550px] bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,33,110,0.2)] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-500 origin-bottom-right">
          {/* Header Premium */}
          <div className="p-6 bg-[#00216e] text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative">
                   <LottieComponent animationData={botAnimation} loop={true} className="w-14 h-14" />
                   <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#00216e] rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest">Andi AI</h3>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <p className="text-[10px] font-black uppercase">Sistema Operativo Conectado</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-[13px] leading-relaxed shadow-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-[#00216e] text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-slate-100 space-y-4">
             {/* Dynamic Suggestions per Role */}
            <div className="flex flex-wrap gap-2">
              {role === 'OFICINA' ? (
                <>
                  <button onClick={() => setInput("Generar un reporte")} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-blue-50 text-[#00216e] border border-slate-200 px-3 py-1.5 rounded-xl transition-all">📊 Reportes</button>
                  <button onClick={() => setInput("Venta de boletos")} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-blue-50 text-[#00216e] border border-slate-200 px-3 py-1.5 rounded-xl transition-all">🎟️ Taquilla</button>
                </>
              ) : (
                <>
                  <button onClick={() => setInput("Quiero comprar un ticket")} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-blue-50 text-[#00216e] border border-slate-200 px-3 py-1.5 rounded-xl transition-all">🚌 Comprar Boleto</button>
                  <button onClick={() => setInput("Ver mis viajes")} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 hover:bg-blue-50 text-[#00216e] border border-slate-200 px-3 py-1.5 rounded-xl transition-all">📜 Mis Tickets</button>
                </>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Solicita una acción (ej: 'Ir a reportes')"
                className="flex-grow bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#00216e]/10 outline-none font-medium"
              />
              <button 
                type="submit"
                className="bg-[#00216e] text-white w-14 h-14 rounded-2xl active:scale-90 transition-all flex items-center justify-center shadow-xl shadow-blue-900/20 disabled:opacity-30"
                disabled={!input.trim()}
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante con Lottie */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative w-20 h-20 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,33,110,0.25)] transition-all duration-500 hover:scale-110 active:scale-95 flex items-center justify-center border-2 ${isOpen ? 'border-[#00216e]' : 'border-transparent'}`}
      >
        <div className="w-16 h-16 pointer-events-none">
          <LottieComponent animationData={botAnimation} loop={true} />
        </div>
        {!isOpen && (
          <div className="absolute top-1/2 -left-28 -translate-y-1/2 bg-white px-5 py-3 rounded-2xl shadow-xl border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-x-4 group-hover:translate-x-0">
            <span className="text-xs font-black uppercase tracking-wider text-[#00216e]">Andi en línea</span>
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-[-45deg]"></div>
          </div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
