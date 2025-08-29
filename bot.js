// bot.js — Servicios por chip + Webs con portafolio + Automatizaciones incluyen Bots (Emilia) + cotización + voz + guardado

document.addEventListener('DOMContentLoaded', () => {
  const msgs  = document.getElementById('messages');
  const input = document.getElementById('input');
  const send  = document.getElementById('send');
  const typing= document.getElementById('typing');
  const clear = document.getElementById('clear');
  const micBtn= document.getElementById('mic'); // si existe en tu HTML

  if (!msgs || !input || !send) {
    console.error('[bot.js] Faltan elementos base (#messages, #input, #send)');
    return;
  }

  // ===== Datos / Storage
  const STORAGE_KEY = 'cdd_chat_history_v1';
  const QUOTE_KEY   = 'cdd_quote_leads_v1';
  const FLOW_KEY    = 'cdd_quote_flow_state_v1';

  const OFICIAL_PHONE = "573028618806";       // WhatsApp oficial para cotización
  const CTA_PHONE     = "573202608864";       // WhatsApp mostrado en CTA
  const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

  const CTA = `\n\n**¿Quieres cotizar tu proyecto?** Escribe **cotizar** o contáctanos: **+${CTA_PHONE}** · **${OFICIAL_MAIL}**`;
  const BTN = "display:inline-block;margin:6px 8px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px";

  // ===== Estado de flujo
  let flow = loadFlowState() || { activo:false, paso:0, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };

  // ===== Portafolio: Webs
  const PORTAFOLIO_WEB = [
    {
      nombre: "Marketflix.com.co",
      url: "https://marketflix.com.co",
      descr:
`**Plataforma con autenticación** y **base de datos** para usuarios.
**Interactividad multimedia** y **envío de correos** (workflows).
Optimizada para captar registros y retención.`,
      extra: "_Credenciales demo: Correo: **centro@admin** · Contraseña: **admin**_"
    },
    {
      nombre: "Volservice",
      url: "https://centrodigitaldedis.wixsite.com/volservice",
      descr:
`Tienda online con **experiencia interactiva/multimedia**.
Blog para **SEO orgánico** y **automatizaciones de correo**.
Arquitectura para posicionamiento e indexación.`,
      extra: ""
    },
    {
      nombre: "Almaverde",
      url: "https://almaverde.com.co/",
      descr:
`**Portafolio comercial** con proyectos, **captación de leads**,
**envíos de correos** y **blog** para posicionamiento (SEO / indexación).`,
      extra: ""
    },
    {
      nombre: "Premium Apps (en construcción)",
      url: "https://premiumappscol.wixsite.com/inicio",
      descr:
`Sitio de **apps premium** con **APKs gratuitas** por tiempo limitado.
Arquitectura preparada para escalado y conversión.`,
      extra: ""
    }
  ];

  // ===== Portafolio: Bots (Emilia / Servimil)
  const SERVIMIL = {
    nombre: "Emilia (Servimil)",
    // Link que compartiste (puede que algunos navegadores no lo muestren por ser URL indirecta)
    img: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fservimil.co%2F&psig=AOvVaw1T_CIc1DJ7FB3-M-Q3DqEW&ust=1756509440126000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICNhbLSro8DFQAAAAAdAAAAABAE",
    phone: "573157019885",
    textoWapp: "Hola Emilia, quiero información",
    descr:
`**Asistente conversacional** en **WhatsApp** para atención al cliente.
- Responde **FAQs**, **califica leads** y **deriva a asesor**.
- Integración con **CRM** (registro y seguimiento).
- Disponible **24/7** con medición de conversión.`
  };

  // ===== Catálogo de servicios (descripciones)
  const KB = {
    overview:
`### Portafolio de servicios
Selecciona qué deseas ver:

<a href="#" data-q="Páginas web" style="${BTN}">🖥️ Páginas web + Portafolio</a>
<a href="#" data-q="Automatizaciones" style="${BTN}">⚙️ Automatizaciones + Bots</a>
<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN}">🆓 Crear agente gratis</a>
<a href="#" data-q="Cotizar" style="${BTN}">💬 Cotizar ahora</a>
${CTA}`,

    web:
`### Páginas web (moderno + conversión)
- Diseño **responsive** (landing, multipágina, e-commerce)
- **SEO técnico** y Core Web Vitals
- Integración con **WhatsApp, CRM y analítica**
- Optimización de **copy** y **estructura** para conversión
${CTA}`,

    auto_ia:
`### Automatizaciones con IA
- **Procesos** empresariales y **atención** al cliente
- Integraciones **Make/Zapier**, email/WA/CRM
- Flujos 24/7 con **handoff** a humano
${CTA}`,

    bots_ia:
`### Bots y Asistentes IA
- Asistentes en **WhatsApp/IG/Messenger**
- **Bots de llamadas** con traspaso a asesor
- Calificación de **leads** + CRM
${CTA}`,

    cotiz:
`### Precios & cotización
Trabajamos **por alcance y objetivos** (web/branding/IA/ads).
1) Brief + llamada (15–20 min)
2) Propuesta con entregables/tiempos/valor
3) Arranque del Sprint 1
${CTA}`
  };

  // ===== Render Portafolio
  function renderPortafolioWeb(){
    let out = `### Portafolio — Webs`;
    PORTAFOLIO_WEB.forEach(p => {
      out += `\n\n**${p.nombre}**\n${p.descr}${p.extra ? `\n${p.extra}` : ''}\n<a href="${p.url}" target="_blank" style="${BTN}">🔗 Visitar</a>`;
    });
    return out;
  }
  function renderPortafolioBots(){
    const text = encodeURIComponent(SERVIMIL.textoWapp);
    return `### Portafolio — Bots
**${SERVIMIL.nombre}**
<img src="${SERVIMIL.img}" alt="${SERVIMIL.nombre}" style="max-width:100%;border-radius:14px;opacity:.96;display:block;margin:8px 0" />

${SERVIMIL.descr}

<a href="https://wa.me/${SERVIMIL.phone}?text=${text}" target="_blank" style="${BTN}">💬 Probar en WhatsApp</a>`;
  }

  // ===== Combinados: servicio + portafolio debajo
  function renderWebWithPortfolio(){
    return `${KB.web}\n\n${renderPortafolioWeb()}\n${CTA}`;
  }
  function renderAutomatizacionesWithBots(){
    // Al pedir "Automatizaciones" mostramos AUTOMATIZACIONES + BOTS + Portafolio (Emilia)
    return `${KB.auto_ia}\n\n${KB.bots_ia}\n\n${renderPortafolioBots()}\n${CTA}`;
  }

  // ===== Render + Markdown
  function render(role, mdText){
    const row = document.createElement("div");
    row.className = "row " + (role === "assistant" ? "assistant" : "user");
    const av = document.createElement("div");
    av.className = "avatar";
    av.textContent = role === "assistant" ? "AI" : "Tú";
    const bub = document.createElement("div");
    bub.className = "bubble";

    let html = mdToHTML(mdText)
      .replace(/WhatsApp:\s*(https?:\/\/[^\s<]+)/gi, (_m, url) => {
        const b = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
        return `<a href="${url}" target="_blank" style="${b}">📲 WhatsApp</a>`;
      })
      .replace(/Email:\s*(mailto:[^\s<]+)/gi, (_m, url) => {
        const b = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
        return `<a href="${url}" style="${b}">✉️ Email</a>`;
      });

    bub.innerHTML = html;

    bub.querySelectorAll("pre").forEach(pre=>{
      const head=document.createElement("div"); head.className="code-head"; head.innerHTML=`<span>código</span>`;
      const btn=document.createElement("button"); btn.className="copy"; btn.textContent="Copiar";
      btn.addEventListener("click", ()=>{ const code=pre.querySelector("code")?.innerText||pre.innerText; navigator.clipboard.writeText(code); btn.textContent="Copiado ✓"; setTimeout(()=>btn.textContent="Copiar",1100); });
      pre.parentNode.insertBefore(head, pre); head.appendChild(btn);
    });

    row.appendChild(av); row.appendChild(bub); msgs.appendChild(row);
    requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });
    saveToHistory(role, mdText);
  }
  function userMsg(text){ render("user", escapeHTML(text)); }
  function botMsg(text){ render("assistant", text); }

  function mdToHTML(md){
    md = md.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHTML(code.trim())}</code></pre>`);
    md = md.replace(/^### (.*)$/gim,'<h3>$1</h3>')
           .replace(/^## (.*)$/gim,'<h2>$1</h2>')
           .replace(/^# (.*)$/gim,'<h1>$1</h1>')
           .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
           .replace(/`([^`]+?)`/g,'<code>$1</code>');
    const lines = md.split('\n').map(line=>{
      if (/^\s*-\s+/.test(line)) return `<li>${line.replace(/^\s*-\s+/, '')}</li>`;
      if (/^\s*•\s+/.test(line)) return `<li>${line.replace(/^\s*•\s+/, '')}</li>`;
      if (/^<h\d|^<pre|^ul|^<ul|^<li|^<\/li|^<\/ul|^<a |^<img /.test(line)) return line;
      return line.trim()? `<p>${line}</p>` : '<p style="margin:4px 0"></p>';
    });
    return lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  }
  function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9áéíóúñü\s]/g,' ').replace(/\s+/g,' ').trim();}

  // ===== Delegación de eventos dentro de mensajes (botones data-q del overview)
  msgs.addEventListener('click', (e) => {
    const el = e.target.closest('[data-q], a[data-q]');
    if (el) {
      const q = el.getAttribute('data-q');
      if (q) { e.preventDefault(); userMsg(q); route(q); }
    }
  });

  // ===== Chips (los que ya tienes en el HTML)
  const chips = document.querySelector('.chips');
  if (chips) {
    chips.addEventListener('click', (e)=>{
      const btn = e.target.closest('.chip'); if (!btn) return;
      const q = btn.dataset.q || btn.getAttribute('data-q'); if (!q) return;
      e.preventDefault(); userMsg(q); route(q);
    });
  }

  // ===== Envío
  send.addEventListener('click', () => {
    const txt = input.value.trim(); if (!txt) return;
    input.value = ""; userMsg(txt); route(txt);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send.click(); }
  });
  if (clear) {
    clear.addEventListener('click', ()=>{
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(FLOW_KEY);
      msgs.innerHTML = ""; typing.style.display="none";
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      botMsg("🧹 Historial limpio. ¿Vemos **Páginas web** o **Automatizaciones + Bots**?");
    });
  }

  // ===== Bienvenida
  restoreHistory();
  if (historyEmpty()) {
    botMsg("👋 ¡Hola! Tengo **Páginas web + Portafolio** y **Automatizaciones + Bots** listos para mostrar. También puedo **cotizar**.");
    botMsg(KB.overview);
  }

  // ===== Voz (auto-envía tras 1.5s de silencio, si tienes #mic)
  let rec = null, micActive = false;
  let voiceBuffer = "";
  let silenceTimer = null;
  const SILENCE_MS = 1500;

  (function setupVoice(){
    if (!micBtn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micBtn.disabled = true; return; }
    rec = new SR(); rec.lang='es-ES'; rec.interimResults=true; rec.continuous=true;
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      const partial = last[0]?.transcript || ""; const isFinal = last.isFinal;
      if (isFinal) { voiceBuffer = (voiceBuffer + " " + partial).trim(); input.value = voiceBuffer; }
      else { input.value = (voiceBuffer + " " + partial).trim(); }
      scheduleAutoSend();
    };
    rec.onend = ()=>{ if (micActive) try{ rec.start(); }catch(_){} };
    rec.onerror = ()=>{ if (micActive) try{ rec.start(); }catch(_){} };
    micBtn.addEventListener('click', ()=>{
      if (!micActive){ voiceBuffer=""; input.value=""; try{ rec.start(); micActive=true; micBtn.classList.add('active'); micBtn.textContent='🎤 Escuchando'; }catch(_){ } }
      else { try{ rec.stop(); }catch(_){} micActive=false; micBtn.classList.remove('active'); micBtn.textContent='🎤 Hablar'; flushVoiceBuffer(); }
    });
    function scheduleAutoSend(){ if (silenceTimer) clearTimeout(silenceTimer); silenceTimer=setTimeout(()=>flushVoiceBuffer(), SILENCE_MS); }
    function flushVoiceBuffer(){ if (silenceTimer){ clearTimeout(silenceTimer); silenceTimer=null; } const text=(input.value||voiceBuffer||'').trim(); if (!text) return; voiceBuffer=""; input.value=""; userMsg(text); route(text); }
  })();

  // ===== Router
  function route(q){
    if (/^cancelar$/i.test(q.trim())) {
      if (flow.activo){
        flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
        saveFlowState();
        return botMsg("Flujo cancelado. Escribe **cotizar** para retomarlo.");
      }
    }
    if (flow.activo){ handleCotizacion(q); return; }

    const qn = norm(q);

    // CHIP: Páginas web → servicio + portafolio
    if (/(^|\b)(paginas web|p[aá]ginas web|webs|portafolio de webs|trabajos web|sitios)(\b|$)/.test(qn)) {
      return botMsg(renderWebWithPortfolio());
    }

    // CHIP: Automatizaciones → automatizaciones + bots + portafolio (Emilia)
    if (/(^|\b)(automatizaciones|manychat|make|bot|bots|asistentes ia)(\b|$)/.test(qn)) {
      return botMsg(renderAutomatizacionesWithBots());
    }

    // CHIP: Servicios / Portafolio general
    if (/servicios|portafolio|cat[aá]logo|categor[ií]as|todo$/.test(qn)) return botMsg(KB.overview);

    // Cotización
    if (/cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta/.test(qn)) { startCotizacion(); return; }

    // Búsqueda difusa
    const hit = smallSearch(qn); if (hit) return botMsg(hit);

    botMsg("Puedo mostrarte **Páginas web + Portafolio** o **Automatizaciones + Bots (Emilia)**, o iniciar **cotización**. " + CTA);
  }

  // ===== Flujo de Cotización
  function startCotizacion(){
    flow = { activo:true, paso:1, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };
    saveFlowState();
    botMsg("¡Perfecto! Para cotizar necesito unos datos.\n\n1️⃣ ¿Cuál es tu **nombre completo**?\n\n*(Escribe `cancelar` para salir.)*");
  }
  function handleCotizacion(respuesta){
    const text = respuesta.trim();
    switch(flow.paso){
      case 1:
        flow.datos.nombre = text; flow.paso = 2; saveFlowState();
        botMsg(`Gracias, **${escapeHTML(text)}**.\n2️⃣ ¿Qué **servicios** te interesan? _Ej.: “Landing + branding + automatización WhatsApp”_`);
        break;
      case 2:
        flow.datos.servicios = text; flow.paso = 3; saveFlowState();
        botMsg("3️⃣ ¿Cómo se llama tu **empresa o proyecto**?");
        break;
      case 3:
        flow.datos.empresa = text; flow.paso = 4; saveFlowState();
        botMsg("4️⃣ ¿Cuál es tu **número de WhatsApp o teléfono**?");
        break;
      case 4:
        if (!isValidPhone(text)) return botMsg("Formato no válido. Ej.: `3001234567` o `+57 3001234567`.");
        flow.datos.telefono = cleanPhone(text);
        finalizeQuote();
        break;
      default:
        flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
        saveFlowState();
        botMsg("He reiniciado el flujo. Escribe **cotizar** para empezar.");
    }
  }
  function finalizeQuote(){
    const leads = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
    leads.push({ ...flow.datos, fecha: new Date().toISOString() });
    localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

    const { nombre, servicios, empresa, telefono } = flow.datos;
    const wappText = encodeURIComponent(`Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`);
    const mailBody = encodeURIComponent(`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

    const btn = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";

    const resumen =
`### ¡Genial, ${escapeHTML(nombre)}! 🙌
Para **continuar con la cotización**, por favor **toca uno de estos botones**:

<a href="https://wa.me/${OFICIAL_PHONE}?text=${wappText}" target="_blank" style="${btn}">📲 WhatsApp Oficial</a>
<a href="mailto:${OFICIAL_MAIL}?subject=Cotización&body=${mailBody}" style="${btn}">✉️ Email Oficial</a>

**Resumen**
- **Servicios:** ${escapeHTML(servicios)}
- **Empresa/Proyecto:** ${escapeHTML(empresa)}
- **WhatsApp/Teléfono:** ${escapeHTML(telefono)}

> Si necesitas corregir algo, escribe **cotizar** para iniciar nuevamente.`;

    flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
    saveFlowState();
    botMsg(resumen);
    botMsg(KB.cotiz);

    try { persistConversationToServer({ nombre, servicios, empresa, telefono }); } catch(e) { console.warn('No se pudo guardar conversación:', e); }
  }

  // ===== Guardado en servidor (si tienes el PHP en assets/save_conversation.php)
  function persistConversationToServer(lead){
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const payload = { when:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, lead, conversation: history };
    fetch('assets/save_conversation.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).then(r=>r.json()).then(res=>{ if(!res?.ok) console.warn('Guardado falló:',res); })
      .catch(err=>console.warn('Error guardando:',err));
  }

  // ===== Búsqueda difusa
  function smallSearch(q){
    const pairs = [
      [renderWebWithPortfolio(), ["paginas web","páginas web","webs","portafolio de webs","trabajos web","sitios"]],
      [renderAutomatizacionesWithBots(), ["automatizaciones","manychat","make","bot","bots","asistentes ia","servimil","emilia"]],
      [KB.cotiz,["cotiz","presupuesto","precio","cuanto vale","cuánto vale","cuanto cuesta","cuánto cuesta"]],
      [KB.overview,["servicios","portafolio","catalogo","catálogo","categorias","categorías","todo"]]
    ];
    let best=null,score=0;
    pairs.forEach(([text,keys])=>{
      const s = keys.reduce((acc,k)=> acc + (q.includes(k)?1:0), 0);
      if (s>score){score=s; best=text;}
    });
    return score>0 ? best : null;
  }

  // ===== Validaciones / persistencia local
  function isValidPhone(v){ const d = onlyDigits(v); return /^57\d{10}$/.test(d) || /^\d{10}$/.test(d); }
  function cleanPhone(v){ let d = onlyDigits(v); if (/^\d{10}$/.test(d)) d = "57"+d; return d; }
  function onlyDigits(s){ return (s||'').replace(/\D+/g,''); }

  function saveToHistory(role, text){
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    arr.push({ role, text, t: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  function restoreHistory(){
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!arr.length) return;
    arr.forEach(m => { m.role === 'assistant' ? botMsg(m.text) : userMsg(m.text); });
    const savedFlow = loadFlowState();
    if (savedFlow?.activo){
      flow = savedFlow;
      botMsg("Teníamos un **flujo de cotización** pendiente. ¿Deseas **continuar**? Escribe `cancelar` para salir.");
    }
  }
  function historyEmpty(){ const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return arr.length === 0; }
  function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
  function loadFlowState(){ try { return JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); } catch { return null; } }
});
