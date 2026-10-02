import { useEffect } from "react";

const SCRIPT_ID = "n8n-chat-embed";

// Gera mensagem personalizada baseada em horário, localização e clima
const generatePersonalizedGreeting = async (): Promise<string> => {
  try {
    // 1. Detectar horário
    const hour = new Date().getHours();
    let period = "noite";
    let emoji = "🌙";

    if (hour >= 5 && hour < 12) {
      period = "manhã";
      emoji = "🌅";
    } else if (hour >= 12 && hour < 18) {
      period = "tarde";
      emoji = "☀️";
    } else if (hour >= 18 && hour < 22) {
      period = "noite (que lindo fim de tarde)";
      emoji = "🌆";
    }

    // 2. Pegar localização do usuário
    const location = await new Promise<{ city: string; lat: number; lon: number }>((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            // Tentar reverter coordenadas pra nome da cidade
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { "Accept-Language": "pt-BR" } }
              );
              const data = await res.json();
              const city = data.address?.city || data.address?.county || "sua região";
              resolve({ city, lat: latitude, lon: longitude });
            } catch {
              resolve({ city: "sua região", lat: latitude, lon: longitude });
            }
          },
          () => resolve({ city: "seu lugar", lat: -20.3155, lon: -40.3128 }) // fallback Serra, BR
        );
      } else {
        resolve({ city: "seu lugar", lat: -20.3155, lon: -40.3128 });
      }
    });

    // 3. Buscar clima
    const weather = await new Promise<{ temp: number; code: number } | null>((resolve) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,weather_code&timezone=auto`
      )
        .then((res) => res.json())
        .then((data) => {
          const temp = Math.round(data.current?.temperature_2m || 0);
          const code = data.current?.weather_code || 0;
          resolve({ temp, code });
        })
        .catch(() => resolve(null));
    });

    // 4. Mapear código de tempo pra emoji e descrição
    const weatherMap: Record<number, { emoji: string; desc: string }> = {
      0: { emoji: "☀️", desc: "lindo demais" },
      1: { emoji: "🌤️", desc: "quase limpo" },
      2: { emoji: "⛅", desc: "parcialmente nublado" },
      3: { emoji: "☁️", desc: "nublado" },
      45: { emoji: "🌫️", desc: "neblina" },
      51: { emoji: "🌦️", desc: "garoa" },
      61: { emoji: "🌧️", desc: "chovendo" },
      71: { emoji: "❄️", desc: "nevando" },
      95: { emoji: "⛈️", desc: "tempestade" },
    };

    const weatherInfo = weatherMap[weather?.code || 0] || {
      emoji: "🌤️",
      desc: "tempo agradável",
    };

    // 5. Gerar frase personalizada
    const temp = weather?.temp || 0;
    let weatherPhrase = "";

    if (temp > 30) {
      weatherPhrase = `está quentíssimo! ${temp}°C e ${weatherInfo.emoji} ${weatherInfo.desc}`;
    } else if (temp > 25) {
      weatherPhrase = `está morno e agradável! ${temp}°C com ${weatherInfo.emoji} ${weatherInfo.desc}`;
    } else if (temp > 18) {
      weatherPhrase = `está fresco e legal! ${temp}°C e ${weatherInfo.emoji} ${weatherInfo.desc}`;
    } else {
      weatherPhrase = `tá friozinho! ${temp}°C mas ${weatherInfo.emoji} ${weatherInfo.desc}`;
    }

    return `Bom ${period}! ${emoji}\\nAqui em ${location.city} ${weatherPhrase}\\nO que posso te ajudar hoje?`;
  } catch {
    return "Olá! 👋\\nSeja bem-vindo(a)! Como posso te ajudar hoje?";
  }
};

/**
 * Injeta o widget de chat (@n8n/chat via cdn.n8nchatui.com) em tempo de execução.
 *
 * Antes esse script vivia direto no index.html como <script type="module" defer>,
 * mas um <script type="module"> inline que importa uma URL externa não sobrevive
 * ao `vite build` (some silenciosamente do HTML final, tanto local quanto em
 * produção). Injetando via useEffect ele passa a fazer parte do bundle JS,
 * que não sofre esse processamento de HTML.
 */
export default function N8nChatWidget() {
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return; // evita duplicar (StrictMode / remounts)

    generatePersonalizedGreeting().then((welcomeMessage) => {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "module";
      script.textContent = `
        import Chatbot from "https://cdn.n8nchatui.com/v1/embed.js";
        Chatbot.init({
          n8nChatUrl: "/.netlify/functions/n8n-chat",
          metadata: {},
          theme: {
            button: {
              backgroundColor: "#000000",
              right: 20,
              bottom: 80,
              size: 50,
              iconColor: "#ffffff",
              customIconSrc: "https://brunokobi.netlify.app/int-icon.png",
              customIconSize: 80,
              customIconBorderRadius: 0,
              autoWindowOpen: { autoOpen: false, openDelay: 2 },
              borderRadius: "rounded",
            },
            tooltip: {
              showTooltip: true,
              tooltipMessage: "Fale com a IA",
              tooltipBackgroundColor: "#39ff14",
              tooltipTextColor: "#000000",
              tooltipFontSize: 12,
              hideTooltipOnMobile: true,
            },
            allowProgrammaticMessage: false,
            chatWindow: {
              borderRadiusStyle: "rounded",
              avatarBorderRadius: 25,
              messageBorderRadius: 6,
              showTitle: true,
              title: "Chat IA",
              titleAvatarSrc: "https://brunokobi.netlify.app/favicon.svg",
              avatarSize: 40,
              welcomeMessage: "${welcomeMessage}",
              errorMessage: "Entre em contato com o suporte",
              backgroundColor: "#0a0a0a",
              height: 600,
              width: 400,
              fontSize: 16,
              starterPromptFontSize: 15,
              renderHTML: false,
              clearChatOnReload: false,
              showScrollbar: false,
              botMessage: {
                backgroundColor: "#1a1a1a",
                textColor: "#00e055",
                showAvatar: true,
                avatarSrc: "https://jetsoftpro.com/wp-content/themes/JSP/img/jetty-and-starships/Jetty-hover.gif",
                showCopyToClipboardIcon: false,
              },
              userMessage: {
                backgroundColor: "#00e055",
                textColor: "#000000",
                showAvatar: true,
                avatarSrc: "https://cdn-icons-png.flaticon.com/512/9672/9672521.png",
              },
              textInput: {
                placeholder: "Digite sua pergunta...",
                backgroundColor: "#1a1a1a",
                textColor: "#ffffff",
                sendButtonColor: "#00e055",
                maxChars: 50,
                maxCharsWarningMessage: "Você excedeu o limite de caracteres.",
                autoFocus: false,
                borderRadius: 6,
                sendButtonBorderRadius: 50,
              },
            },
          },
        });
      `;
      document.body.appendChild(script);
    });
  }, []);

  return null;
}
