/* =====================================================================
   Business Dost AI — interactive assistant prototype
   Idle → listening → thinking → draft review → approved / rejected
   ===================================================================== */
(function () {
  "use strict";

  const icon = (n, cls = "") =>
    `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`;

  const LANG_ORDER = ["en", "hi", "hinglish"];

  const COPY = {
    en: {
      langLabel: "EN",
      langName: "English",
      ready: "Ready",
      listening: "Listening",
      thinking: "Thinking",
      greeting: "Hi Aarav. What should I record today?",
      hintIdle: "Tap the mic and speak naturally",
      hintListening: "Listening · tap to finish",
      hintThinking: "Understanding your words",
      hintReview: "Every draft is editable",
      thinkingText: "Matching your customer, item and stock…",
      suggestions: ["Today's total sales", "Udhaar for Ramesh", "Scan a bill"],
      transcript: "Sold 12 bags of cement to Ramesh for ₹4,200. He paid by UPI.",
      speech: "Sale",
      aiTitle: "Sale drafted — just needs your nod",
      aiText: "I found Ramesh Kumar in your customers and matched “cement” to Cement OPC 53. Stock will drop by 12 bags on approval.",
      audio: "0:06",
      draftLabel: "Draft transaction",
      conf: "96% sure",
      labels: { customer: "Customer", item: "Item", rate: "Rate", gst: "GST", total: "TOTAL" },
      values: { customer: "Ramesh Kumar", item: "Cement OPC 53 · 12 bags", rate: "₹350 / bag", gst: "Included" },
      payments: ["UPI", "Cash", "Udhaar"],
      note: "Nothing is saved until you approve.",
      reject: "Reject",
      approve: "Approve & save",
      savedLabel: "Saved · sale #24",
      saved: "Approved · added to today's sales",
      discarded: "Draft discarded. Nothing was saved.",
      undo: "Undo",
      again: "Start again",
      placeholder: "Ask a follow-up or edit…",
      history: "Recent voice commands",
      historyClose: "Close",
      reset: "Start over",
      viewSale: "View sale",
      historyItems: [
        ["Sale · Ramesh Kumar", "₹4,200 · 4:12 pm"],
        ["Expense · electricity bill", "₹4,800 · 2:05 pm"],
        ["Udhaar reminder · Meera Textiles", "₹12,500 · yesterday"],
      ],
    },
    hi: {
      langLabel: "हिं",
      langName: "हिंदी",
      ready: "तैयार",
      listening: "सुन रहे हैं",
      thinking: "सोच रहे हैं",
      greeting: "नमस्ते आरव। आज क्या दर्ज करना है?",
      hintIdle: "माइक दबाइए और सहज बोलिए",
      hintListening: "सुन रहे हैं · रोकने के लिए दबाएँ",
      hintThinking: "आपकी बात समझ रहे हैं",
      hintReview: "हर ड्राफ्ट बदला जा सकता है",
      thinkingText: "ग्राहक, सामान और स्टॉक मिला रहे हैं…",
      suggestions: ["आज की कुल बिक्री", "रमेश का उधार", "बिल स्कैन करो"],
      transcript: "रमेश को 12 बोरी सीमेंट ₹4,200 में बेची, UPI से पैसे मिले।",
      speech: "बिक्री",
      aiTitle: "बिक्री तैयार — बस आपकी हाँ चाहिए",
      aiText: "रमेश कुमार आपके ग्राहकों में मिले और सीमेंट को Cement OPC 53 से जोड़ा। मंज़ूरी पर स्टॉक 12 बोरी घटेगा।",
      audio: "0:06",
      draftLabel: "ड्राफ्ट लेन-देन",
      conf: "96% भरोसा",
      labels: { customer: "ग्राहक", item: "सामान", rate: "दर", gst: "GST", total: "कुल" },
      values: { customer: "रमेश कुमार", item: "सीमेंट OPC 53 · 12 बोरी", rate: "₹350 / बोरी", gst: "शामिल" },
      payments: ["UPI", "नकद", "उधार"],
      note: "मंज़ूरी तक कुछ सेव नहीं होता।",
      reject: "अस्वीकार",
      approve: "मंज़ूर करें",
      savedLabel: "सेव · बिक्री #24",
      saved: "मंज़ूर · आज की बिक्री में जुड़ा",
      discarded: "ड्राफ्ट रद्द। कुछ सेव नहीं हुआ।",
      undo: "वापस लें",
      again: "फिर शुरू करें",
      placeholder: "सवाल पूछें या बदलाव करें…",
      history: "हाल के वॉइस कमांड",
      historyClose: "बंद करें",
      reset: "फिर से शुरू",
      viewSale: "बिक्री देखें",
      historyItems: [
        ["बिक्री · रमेश कुमार", "₹4,200 · शाम 4:12"],
        ["खर्च · बिजली बिल", "₹4,800 · दोपहर 2:05"],
        ["उधार याद · मीरा टेक्सटाइल्स", "₹12,500 · कल"],
      ],
    },
    hinglish: {
      langLabel: "HI-EN",
      langName: "Hinglish",
      ready: "Ready",
      listening: "Sun rahe hain",
      thinking: "Soch rahe hain",
      greeting: "Namaste Aarav. Aaj kya record karna hai?",
      hintIdle: "Mic dabaiye aur aaram se boliye",
      hintListening: "Sun rahe hain · rokne ke liye dabaiye",
      hintThinking: "Aapki baat samajh rahe hain",
      hintReview: "Har draft badla ja sakta hai",
      thinkingText: "Customer, item aur stock match kar rahe hain…",
      suggestions: ["Aaj ki sale batao", "Ramesh ka udhaar", "Bill scan karo"],
      transcript: "Ramesh ko 12 bori cement bechi, ₹4,200, UPI se payment aaya.",
      speech: "Sale",
      aiTitle: "Sale ready hai — bas aapki haan chahiye",
      aiText: "Ramesh Kumar customers mein mile aur cement ko Cement OPC 53 se match kiya. Approve karne par stock 12 bags kam hoga.",
      audio: "0:06",
      draftLabel: "Draft transaction",
      conf: "96% sure",
      labels: { customer: "Customer", item: "Item", rate: "Rate", gst: "GST", total: "TOTAL" },
      values: { customer: "Ramesh Kumar", item: "Cement OPC 53 · 12 bags", rate: "₹350 / bag", gst: "Included" },
      payments: ["UPI", "Cash", "Udhaar"],
      note: "Aapki approval tak kuch save nahi hota.",
      reject: "Reject",
      approve: "Approve & save",
      savedLabel: "Saved · sale #24",
      saved: "Approved · aaj ki sale mein add hua",
      discarded: "Draft discard ho gaya. Kuch save nahi hua.",
      undo: "Undo",
      again: "Phir shuru karein",
      placeholder: "Sawaal poochhein ya badlav karein…",
      history: "Recent voice commands",
      historyClose: "Band karein",
      reset: "Phir se shuru",
      viewSale: "Sale dekhein",
      historyItems: [
        ["Sale · Ramesh Kumar", "₹4,200 · 4:12 pm"],
        ["Kharcha · electricity bill", "₹4,800 · 2:05 pm"],
        ["Udhaar reminder · Meera Textiles", "₹12,500 · kal"],
      ],
    },
  };

  const WAVE = [8, 16, 11, 22, 15, 28, 18, 24, 12, 20, 9, 26, 14, 21, 10, 17, 7, 23, 13, 19, 8, 15];
  const PAY = [4, 9, 6, 12, 8, 14, 7, 10, 5, 11, 6, 9, 4, 8, 5, 10, 6];

  const state = {
    mode: "idle",
    lang: "en",
    decision: null,
    playing: false,
    historyOpen: false,
    revealed: 0,
    take: 1,
  };
  let root = null;
  let timers = [];
  let playTimer = null;

  const clearTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(state.revealInterval);
    state.revealInterval = null;
  };

  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  };

  function statusbar() {
    const light = state.mode !== "review";
    return `<div class="statusbar ${light ? "statusbar--light" : ""}">
      <span>9:41</span>
      <span class="statusbar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.4" width="3" height="6.6" rx="1"/><rect x="10" y="2.8" width="3" height="9.2" rx="1"/><rect x="15" y=".4" width="3" height="11.6" rx="1"/></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M1.6 4.3a9.4 9.4 0 0 1 12.8 0"/><path d="M4.1 6.9a6 6 0 0 1 7.8 0"/><path d="M6.6 9.4a2.6 2.6 0 0 1 2.8 0"/><circle cx="8" cy="11" r=".7" fill="currentColor" stroke="none"/></svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true"><rect x=".7" y=".7" width="21" height="10.6" rx="3.2" stroke="currentColor" stroke-opacity=".38"/><rect x="2.6" y="2.6" width="15.8" height="6.8" rx="2" fill="currentColor"/><path d="M23.3 4.2v3.6a2 2 0 0 0 0-3.6z" fill="currentColor" fill-opacity=".38"/></svg>
      </span>
    </div>`;
  }

  function voiceScreen() {
    const t = COPY[state.lang];
    const listening = state.mode === "listening";
    const thinking = state.mode === "thinking";
    const words = t.transcript.split(" ");
    const shown = words.slice(0, state.revealed).join(" ");
    const transcript =
      state.mode === "idle"
        ? `<span class="dim">${t.greeting}</span>`
        : listening
        ? `${shown}${state.revealed >= words.length ? '<span class="caret"></span>' : '<span class="caret"></span>'}`
        : `<span class="dim">${t.thinkingText}</span>`;

    return `<div class="screen scr--voice screen--enter">
      ${statusbar()}
      <div class="voice-top">
        <button class="icon-btn icon-btn--plain" style="border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.7)" data-act="reset" aria-label="Close">${icon("close")}</button>
        <div class="voice-brand">
          <svg class="voice-brand__mark" viewBox="0 0 40 40" aria-hidden="true" style="color:#1c2a26"><use href="#logo"/></svg>
          <span class="voice-brand__name">Dost</span>
          <span class="voice-brand__badge">AI</span>
        </div>
        <button class="voice-lang" data-act="lang" aria-label="Change language">${icon("globe")} ${t.langLabel} ${icon("chevron-down")}</button>
      </div>
      <div class="voice-center">
        <div class="orb ${listening ? "" : "orb--calm"} ${thinking ? "orb--thinking" : ""}">
          <span class="orb__halo"></span>
          <span class="orb__ring"></span>
          <span class="orb__ring orb__ring--2"></span>
          <span class="orb__ring orb__ring--3"></span>
          <span class="orb__pulse"></span>
          <span class="orb__pulse orb__pulse--2"></span>
          <span class="orb__core">${thinking ? icon("ai") : icon("mic")}</span>
        </div>
        <div class="voice-status"><span class="voice-status__dot"></span> ${listening ? t.listening : thinking ? t.thinking : t.ready}</div>
        <p class="voice-transcript" aria-live="polite">${transcript}</p>
        ${thinking
          ? `<div class="thinking-dots" aria-hidden="true"><i></i><i></i><i></i></div>`
          : `<div class="waveform ${!listening ? "waveform--calm" : ""}" aria-hidden="true">
              ${WAVE.map((h, i) => `<i style="height:${listening ? h : Math.max(5, h * 0.45)}px;animation-delay:${(i * 0.07).toFixed(2)}s;${!listening ? "animation-play-state:paused" : ""}"></i>`).join("")}
            </div>`}
      </div>
      ${state.historyOpen ? historySheet(t) : ""}
      <div class="voice-suggest">
        ${t.suggestions.map((s) => `<button type="button" data-act="suggest" data-text="${s}">${s}</button>`).join("")}
      </div>
      <div class="voice-controls">
        <button class="voice-ctrl" data-act="type" aria-label="Type instead">${icon("keyboard")}</button>
        <button class="voice-ctrl voice-ctrl--main" data-act="mic" aria-label="${listening ? "Stop listening" : "Start listening"}">
          ${listening ? icon("pause") : thinking ? icon("ai") : icon("mic")}
        </button>
        <button class="voice-ctrl" data-act="history" aria-label="Recent voice commands">${icon("history")}</button>
      </div>
      <div class="voice-hint">${listening ? t.hintListening : thinking ? t.hintThinking : t.hintIdle}</div>
      <span class="home-indicator home-indicator--light"></span>
    </div>`;
  }

  function historySheet(t) {
    return `<div class="history-sheet">
      <div class="history-sheet__head">
        <b>${t.history}</b>
        <button class="icon-btn icon-btn--sm icon-btn--plain" style="color:rgba(255,255,255,.7)" data-act="history-close" aria-label="Close history">${icon("close")}</button>
      </div>
      ${t.historyItems
        .map(
          ([name, meta]) => `<div class="history-row">
            <span class="history-row__icon">${icon("mic")}</span>
            <span class="history-row__body"><b>${name}</b><small>${meta}</small></span>
            ${icon("chevron-right")}
          </div>`
        )
        .join("")}
      <div class="history-sheet__foot">${t.viewSale} · ${t.again}</div>
    </div>`;
  }

  function chatScreen() {
    const t = COPY[state.lang];
    const approved = state.decision === "approved";
    const rejected = state.decision === "rejected";

    return `<div class="screen screen--enter">
      ${statusbar()}
      <div class="chat-head">
        <button class="icon-btn icon-btn--plain" data-act="reset" aria-label="Back">${icon("chevron-left")}</button>
        <div class="chat-head__title">
          <b>Dost</b>
          <span><i></i> ${t.langName} · ${approved ? t.savedLabel : "Draft ready"}</span>
        </div>
        <button class="icon-btn icon-btn--plain" data-act="reset" aria-label="Start over">${icon("history")}</button>
      </div>
      <div class="screen__scroll">
        <div class="chat-scroll">
          <div class="bubble-user">
            ${t.transcript}
            <div class="voice-pill">
              <span class="voice-pill__play">${icon("play")}</span>
              <span class="voice-pill__wave">${PAY.map((h) => `<i style="height:${h}px"></i>`).join("")}</span>
              <span class="voice-pill__time">0:04</span>
            </div>
          </div>
          <div class="ai-row">
            <span class="ai-badge">${icon("ai")}</span>
            <div class="ai-bubble ${state.playing ? "is-speaking" : ""}">
              <div class="ai-bubble__head">
                <span class="ai-bubble__title">${t.aiTitle}</span>
                <span class="pill pill--brand">${t.conf}</span>
              </div>
              <p class="ai-bubble__text">${t.aiText}</p>
              <div class="ai-bubble__audio">
                <button class="play" data-act="play" aria-label="${state.playing ? "Pause response" : "Play response"}">${state.playing ? icon("pause") : icon("play")}</button>
                <span class="mini-wave ${state.playing ? "is-playing" : ""}">
                  ${PAY.map((h, i) => `<i class="${state.playing || i < 9 ? "on" : ""}" style="height:${h}px;animation-delay:${(i * 0.05).toFixed(2)}s"></i>`).join("")}
                </span>
                <span class="${state.playing ? "speaking-label" : ""}">${state.playing ? "Speaking" : t.audio}</span>
              </div>
            </div>
          </div>

          ${rejected
            ? `<div class="banner" style="border-radius:16px">
                 <span class="banner__icon" style="background:var(--danger-soft);color:var(--danger)">${icon("trash")}</span>
                 <div class="grow"><b style="color:var(--ink);font-weight:600">${t.discarded}</b>
                   <div class="hstack gap-2" style="margin-top:8px">
                     <button class="btn btn--outline btn--sm" data-act="undo" type="button">${t.undo}</button>
                     <button class="btn btn--soft btn--sm" data-act="reset" type="button">${t.again}</button>
                   </div>
                 </div>
               </div>`
            : `<div class="draft">
                 <div class="draft__top">
                   <span class="draft__label">${icon(approved ? "check-circle" : "edit")} ${approved ? t.savedLabel : t.draftLabel}</span>
                   <span class="draft__conf" style="${approved ? "color:var(--success)" : ""}">${approved ? icon("check") + " Saved" : icon("shield") + " AI draft · editable"}</span>
                 </div>
                 <div class="draft__body">
                   <div class="draft__row"><dt>${t.labels.customer}</dt><dd>${t.values.customer}</dd></div>
                   <div class="draft__row"><dt>${t.labels.item}</dt><dd>${t.values.item}</dd></div>
                   <div class="draft__row"><dt>${t.labels.rate}</dt><dd>${t.values.rate}</dd></div>
                   <div class="draft__row"><dt>${t.labels.gst}</dt><dd>${t.values.gst}</dd></div>
                 </div>
                 <div class="draft__total"><span>${t.labels.total}</span><b class="num">₹4,200</b></div>
                 <div class="draft__pay">
                   ${t.payments.map((p, i) => `<span class="pay-opt ${i === 0 ? "is-on" : ""}">${icon(i === 0 ? "card" : i === 1 ? "wallet" : "clock")} ${p}</span>`).join("")}
                 </div>
                 ${approved
                   ? `<div style="padding:2px 14px 12px"><div class="appr-done">${icon("check-circle")} ${t.saved}</div></div>`
                   : `<div class="draft__note">${t.note}</div>
                      <div class="draft__actions">
                        <button class="btn btn--ghost" data-act="reject" type="button">${icon("trash")} ${t.reject}</button>
                        <button class="btn btn--primary" data-act="approve" type="button">${icon("check")} ${t.approve}</button>
                      </div>`}
                 ${approved ? `<div class="draft__actions"><button class="btn btn--outline" data-act="reset" type="button">${icon("plus")} ${t.again}</button></div>` : ""}
               </div>`}
        </div>
      </div>
      <div class="chat-foot">
        <div class="chat-input">
            ${icon("plus", "i--sm")}
            <span>${t.placeholder}</span>
            <button class="mic" data-act="mic" aria-label="Speak again">${icon("mic")}</button>
          </div>
      </div>
      <span class="home-indicator"></span>
    </div>`;
  }

  function render() {
    if (!root) return;
    root.innerHTML = `<div class="device"><div class="island"></div>${state.mode === "review" ? chatScreen() : voiceScreen()}</div>`;
    const chips = document.querySelectorAll("[data-assistant]");
    chips.forEach((c) => {
      const active = c.dataset.assistant === (state.mode === "review" ? "review" : state.mode);
      c.classList.toggle("chip--active", active);
      c.setAttribute("aria-pressed", String(active));
    });
    if (state.mode === "review") {
      // Bring the AI reply and the draft into view; the voice note stays one
      // swipe up. Anchoring to the reply avoids a half-cut bubble.
      const sc = root.querySelector(".screen__scroll");
      const ai = root.querySelector(".ai-row");
      if (sc && ai) sc.scrollTop = Math.max(0, ai.offsetTop - 12);
    }
  }

  function jumpTo(target) {
    clearTimers();
    const total = COPY[state.lang].transcript.split(" ").length;
    if (target === "idle") { reset(); return; }
    if (target === "listening") { startListening(); return; }
    state.decision = null;
    state.revealed = total;
    state.mode = target === "review" ? "review" : "thinking";
    render();
  }

  function startListening() {
    clearTimers();
    state.mode = "listening";
    state.decision = null;
    state.historyOpen = false;
    state.revealed = 0;
    render();
    const words = COPY[state.lang].transcript.split(" ");
    state.revealInterval = setInterval(() => {
      state.revealed = Math.min(state.revealed + 1, words.length);
      // Update the transcript in place so the screen's entrance animation
      // does not restart on every word.
      const line = root.querySelector(".voice-transcript");
      if (line) {
        line.innerHTML = `${words.slice(0, state.revealed).join(" ")}<span class="caret"></span>`;
      }
      if (state.revealed >= words.length) {
        clearInterval(state.revealInterval);
        state.revealInterval = null;
        later(finishListening, 700);
      }
    }, 185);
  }

  function finishListening() {
    clearTimers();
    if (state.mode === "review") return;
    state.mode = "thinking";
    render();
    later(() => {
      state.mode = "review";
      render();
    }, 1500);
  }

  function reset() {
    clearTimers();
    state.mode = "idle";
    state.decision = null;
    state.playing = false;
    state.historyOpen = false;
    state.revealed = 0;
    render();
  }

  function bind(el) {
    root = el;
    render();
    if (!el.__bdChips) {
      el.__bdChips = true;
      document.querySelectorAll("[data-assistant]").forEach((chip) =>
        chip.addEventListener("click", () => jumpTo(chip.dataset.assistant))
      );
    }
    if (el.__bdBound) return;
    el.__bdBound = true;
    el.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      if (act === "mic") {
        if (state.mode === "idle") startListening();
        else if (state.mode === "listening") finishListening();
        else if (state.mode === "review") reset();
        return;
      }
      if (act === "type") { startListening(); return; }
      if (act === "suggest") { startListening(); return; }
      if (act === "lang") {
        const i = LANG_ORDER.indexOf(state.lang);
        state.lang = LANG_ORDER[(i + 1) % LANG_ORDER.length];
        render();
        return;
      }
      if (act === "history") { state.historyOpen = !state.historyOpen; render(); return; }
      if (act === "history-close") { state.historyOpen = false; render(); return; }
      if (act === "reset") { reset(); return; }
      if (act === "undo") { state.decision = null; render(); return; }
      if (act === "approve") {
        clearTimers();
        state.decision = "approved";
        render();
        return;
      }
      if (act === "reject") {
        clearTimers();
        state.decision = "rejected";
        render();
        return;
      }
      if (act === "play") {
        state.playing = !state.playing;
        render();
        clearTimeout(playTimer);
        if (state.playing) {
          playTimer = setTimeout(() => {
            state.playing = false;
            render();
          }, 3400);
        }
      }
    });
    document.querySelectorAll("[data-assistant]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const target = chip.dataset.assistant;
        clearTimers();
        if (target === "idle") reset();
        else if (target === "listening") startListening();
        else if (target === "thinking") {
          state.mode = "listening";
          state.revealed = COPY[state.lang].transcript.split(" ").length;
          finishListening();
        } else if (target === "review") {
          state.mode = "review";
          state.decision = null;
          state.revealed = 99;
          render();
        }
        document.querySelectorAll("[data-assistant]").forEach((c) => c.classList.toggle("chip--active", c === chip));
      });
    });
  }

  window.mountAssistant = bind;
})();
