const TOKEN = "bfjEKWdbaWBkgcDC";
const BASE_URL = "https://ai.sifli.com";
const SCRIPT_ID = "dify-chatbot-embed-script";
const BUBBLE_ID = "dify-chatbot-bubble-button";
const RETRY_DELAYS = [2500, 5000, 10000, 20000];
const HEALTHCHECK_LIMIT = 10;

let loadAttempts = 0;
let healthcheckTimer = null;
let onlineListenerAttached = false;

function scheduleRetry() {
  if (loadAttempts >= RETRY_DELAYS.length) {
    return;
  }

  const delay = RETRY_DELAYS[loadAttempts];
  loadAttempts += 1;

  window.setTimeout(() => {
    appendScript({ force: true });
  }, delay);
}

function appendScript({ force = false } = {}) {
  if (!document.body) {
    window.setTimeout(() => appendScript({ force }), 100);
    return;
  }

  let script = document.getElementById(SCRIPT_ID);

  if (script) {
    if (!force) {
      const state = script.dataset.state;
      if (state === "loading" || state === "loaded") {
        return;
      }
    }

    script.remove();
  }

  script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `${BASE_URL}/embed.min.js`;
  script.defer = true;
  script.dataset.state = "loading";

  script.addEventListener("load", () => {
    script.dataset.state = "loaded";
    loadAttempts = 0;
    startHealthcheck();
  });

  script.addEventListener("error", () => {
    script.remove();
    scheduleRetry();
  });

  document.body.appendChild(script);
}

function startHealthcheck() {
  if (healthcheckTimer) {
    return;
  }

  let checks = 0;

  healthcheckTimer = window.setInterval(() => {
    if (document.getElementById(BUBBLE_ID)) {
      window.clearInterval(healthcheckTimer);
      healthcheckTimer = null;
      return;
    }

    checks += 1;

    if (checks >= HEALTHCHECK_LIMIT) {
      window.clearInterval(healthcheckTimer);
      healthcheckTimer = null;
      return;
    }

    appendScript({ force: checks % 2 === 0 });
  }, 6000);
}

function ensureChatbot() {
  if (typeof document === "undefined") {
    return;
  }

  window.difyChatbotConfig = window.difyChatbotConfig || {
    token: TOKEN,
    baseUrl: BASE_URL,
  };

  if (!onlineListenerAttached) {
    window.addEventListener("online", () => appendScript({ force: true }));
    onlineListenerAttached = true;
  }

  const initFn = () => {
    appendScript();
    startHealthcheck();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFn, { once: true });
  } else {
    initFn();
  }
}

export default {
  name: "sifli-dify-chatbot",

  initialize() {
    ensureChatbot();
  },
};
