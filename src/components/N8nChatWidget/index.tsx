import { useEffect } from "react";

const SCRIPT_ID = "n8n-chat-embed";

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
            welcomeMessage: "Olá! 👋\\nSeja bem-vindo(a)! Como posso te ajudar hoje?",
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
  }, []);

  return null;
}
