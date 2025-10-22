const TOKEN = "bfjEKWdbaWBkgcDC";
const BASE_URL = "https://ai.sifli.com";
const SCRIPT_ID = "dify-chatbot-embed-script";

function appendScript() {
  if (document.getElementById(SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `${BASE_URL}/embed.min.js`;
  script.defer = true;
  document.body.appendChild(script);
}

function ensureChatbot() {
  if (typeof document === "undefined") {
    return;
  }

  window.difyChatbotConfig = {
    token: TOKEN,
    baseUrl: BASE_URL,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", appendScript, { once: true });
  } else {
    appendScript();
  }
}

export default {
  name: "sifli-dify-chatbot",

  initialize() {
    ensureChatbot();
  },
};
