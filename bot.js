// bot.js — Servicios + Portafolio + Bots (Emilia) + Cotización + Voz (silencio 1.5s) + Guardado
document.addEventListener('DOMContentLoaded', () => {
  // ===== Nodos base
  const msgs  = document.getElementById('messages');
  const input = document.getElementById('input');
  const send  = document.getElementById('send');
  const typing= document.getElementById('typing');
  const clear = document.getElementById('clear');
  const micBtn= document.getElementById('mic'); // si no existe, se omite voz

  if (!msgs || !input || !send) {
    console.error('[bot.js] Faltan elementos base (#messages, #input, #send)');
    return;
  }

  // ===== Constantes y storage
  const STORAGE_KEY = 'cdd_chat_history_v1';
  const QUOTE_KEY   = 'cdd_quote_leads_v1';
  const FLOW_KEY    = 'cdd_quote_flow_state_v1';

  // Contacto
  const OFICIAL_PHONE = "573028618806";       // WhatsApp oficial recepción de cotizaciones
  const CTA_PHONE     = "573202608864";       // WhatsApp mostrado en CTA general
  const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

  const CTA = `\n\n**¿Quieres cotizar tu proyecto?** Escribe **cotizar** o contáctanos: **+${CTA_PHONE}** · **${OFICIAL_MAIL}**`;
  const BTN = "display:inline-block;margin:6px 8px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px";

  // ===== Estado del flujo de cotización
  let flow = loadFlowState() || { activo:false, paso:0, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };

  // ===== Portafolio — Webs
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
Arquitectura para posicionamiento e indexación.`
    },
    {
      nombre: "Almaverde",
      url: "https://almaverde.com.co/",
      descr:
`**Portafolio comercial** con proyectos, **captación de leads**,
**envíos de correos** y **blog** para posicionamiento (SEO / indexación).`
    },
    {
      nombre: "Premium Apps (en construcción)",
      url: "https://premiumappscol.wixsite.com/inicio",
      descr:
`Sitio de **apps premium** con **APKs gratuitas** por tiempo limitado.
Arquitectura preparada para escalado y conversión.`
    }
  ];

  // ===== Portafolio — Bots (Emilia / Servimil)
  const SERVIMIL = {
    nombre: "Emilia (Servimil)",
    img: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fservimil.co%2F&psig=AOvVaw1T_CIc1DJ7FB3-M-Q3DqEW&ust=1756509440126000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICNhbLSro8DFQAAAAAdAAAAABAE",
    phone: "573157019885",
    textoWapp: "Hola Emilia, quiero información",
    descr:
`**Asistente conversacional** en **WhatsApp** para atención al cliente.
- Responde **FAQs**, **califica leads** y **deriva a asesor**.
- Integración con **CRM** (registro y seguimiento).
- Disponible **24/7** con medición de conversión.`
  };

  // ===== Catálogo de servicios (texto detallado)
  const KB = {
    overview:
`### Portafolio de servicios
Selecciona qué deseas ver:

<a href="#" data-q="Páginas web" style="${BTN}">🖥️ Páginas web + Portafolio</a>
<a href="#" data-q="Automatizaciones" style="${BTN}">⚙️ Automatizaciones + Bots</a>
<a href="#" data-q="Bots y Asistentes IA" style="${BTN}">🤖 Bots + Portafolio</a>

<a href="#" data-q="Branding" style="${BTN}">🎨 Branding</a>
<a href="#" data-q="Contenido para redes" style="${BTN}">📱 Contenido para redes</a>
<a href="#" data-q="Social Media Manager" style="${BTN}">👥 Social Media Manager</a>
<a href="#" data-q="SEO" style="${BTN}">🔎 SEO</a>
<a href="#" data-q="Campañas Ads" style="${BTN}">💡 Campañas Ads</a>
<a href="#" data-q="Estrategias de marketing" style="${BTN}">📈 Estrategias de marketing</a>
<a href="#" data-q="Fotografía de producto" style="${BTN}">📷 Fotografía de producto</a>
<a href="#" data-q="Contenido con IA" style="${BTN}">🎬 Contenido con IA</a>
<a href="#" data-q="Embudos y Realidad Aumentada" style="${BTN}">🧭 Embudos & RA</a>
<a href="#" data-q="Apps Premium" style="${BTN}">🟣 Apps Premium</a>

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

    branding:
`### Branding y diseño de marca
- **Identidad visual**, **logo** y **sistema de marca**
- **Manual de marca** (uso, tipografía, color, aplicaciones)
- Paquetes de **aplicaciones** (RRSS, papelería, ads)
${CTA}`,

    contenido:
`### Contenido para redes
- **Posts**, **carruseles** y **video corto** (Reels/TikTok/Shorts)
- **Guion** + edición + **calendarización**
- Métricas y optimización continua
${CTA}`,

    social:
`### Social Media Manager
- Gestión de **comunidad** y crecimiento orgánico
- Estrategia por **plataforma** y frecuencia
- Reporting y **mejora continua** por datos
${CTA}`,

    seo:
`### SEO (web + social)
- Auditoría técnica, on-page y contenidos
- Estrategia de **keywords** + **blog** para SEO
- Apoyo en **indexación** y **buenas prácticas**
${CTA}`,

    ads:
`### Campañas publicitarias (Ads)
- **Meta**, **Google** y **TikTok** Ads
- Creativos, segmentación, **A/B testing**
- Escalado por **ROAS** y objetivos
${CTA}`,

    marketing:
`### Estrategias de marketing & funnels
- Embudos (tráfico → lead → venta → fidelización)
- **Automatizaciones** y nurture por etapas
- **Dashboards** y KPIs de negocio
${CTA}`,

    fotografia:
`### Fotografía de producto
- Foto y **micro-video** comercial
- Retoque y **formatos** por plataforma
- Preparación para **catálogo** y **ads**
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

    contenido_ia:
`### Contenido con IA (video e imagen)
- Videos **publicitarios/explicativos/conceptuales**
- Generación de **imágenes** y assets creativos
- Producción híbrida **IA + edición** profesional
${CTA}`,

    embudos_ra:
`### Embudos automatizados y Realidad Aumentada
- Captura → **nurturing** → conversión con IA
- Experiencias **AR** para promoción/retail
- Medición y optimización
${CTA}`,

    apps_premium:
`### Apps Premium
- Licencias (VPN, YouTube Premium, PhotoRoom, etc.)
- Gestión de **cuentas** y soporte a equipos
- Onboarding y **buenas prácticas**
${CTA}`,

    cotiz:
`### Precios & cotización
Trabajamos **por alcance y objetivos** (web/branding/IA/ads).
1) Brief + llamada (15–20 min)
2) Propuesta con entregables/tiempos/valor
3) Arranque del Sprint 1
${CTA}`
  };

  // ===== Helpers: Portafolio render
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
<img src="${SERVIMIL.img}" alt="${SERVIMIL.nombre}" style="max-width:100%;border-radius:14px;opacity:.96;display:block;margin:8px 0;animation:fadeIn .6s ease both" />

${SERVIMIL.descr}

<a href="https://wa.me/${SERVIMIL.phone}?text=${text}" target="_blank" style="${BTN}">💬 Probar en WhatsApp</a>`;
  }
  function renderWebWithPortfolio(){ return `${KB.web}\n\n${renderPortafolioWeb()}\n${CTA}`; }
  function renderAutomatizacionesWithBots(){ return `${KB.auto_ia}\n\n${KB.bots_ia}\n\n${renderPortafolioBots()}\n${CTA}`; }
  function renderBotsWithPortfolio(){ return `${KB.bots_ia}\n\n${renderPortafolioBots()}\n${CTA}`; }

  // ===== Render/chat
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

    // Copiar en bloques de código
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

  // ===== Markdown simple
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

  // ===== Delegación: botones dentro de mensajes (data-q)
  msgs.addEventListener('click', (e) => {
    const el = e.target.closest('[data-q], a[data-q]');
    if (el) {
      const q = el.getAttribute('data-q');
      if (q) { e.preventDefault(); userMsg(q); route(q); }
    }
  });

  // ===== Chips del HTML
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
    botMsg("👋 ¡Hola! Puedo mostrar **Páginas web + Portafolio** o **Automatizaciones + Bots (Emilia)**. También puedo **cotizar**.");
    botMsg(KB.overview);
  }

  // ===== Voz (auto-envío tras 1.5s de silencio) — CORREGIDO
  let rec = null, micActive = false;
  let lastTranscript = "";
  let silenceTimer = null;
  const SILENCE_MS = 1500;

  (function setupVoice(){
    if (!micBtn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { micBtn.disabled = true; return; }

    rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (ev) => {
      const result = ev.results[ev.results.length - 1];
      const transcript = result[0]?.transcript.trim() || "";

      if (result.isFinal) {
        lastTranscript = transcript;
        input.value = lastTranscript;
        scheduleAutoSend();
      } else {
        // mostrar provisional sin acumular en bucle
        input.value = transcript;
      }
    };
    rec.onend = ()=>{ if (micActive) try{ rec.start(); }catch(_){} };
    rec.onerror = ()=>{ if (micActive) try{ rec.start(); }catch(_){} };

    micBtn.addEventListener('click', ()=>{
      if (!micActive){
        lastTranscript = "";
        input.value = "";
        try {
          rec.start();
          micActive = true;
          micBtn.classList.add('active');
          micBtn.textContent = '🎤 Escuchando';
        } catch(_){}
      } else {
        try { rec.stop(); } catch(_){}
        micActive = false;
        micBtn.classList.remove('active');
        micBtn.textContent = '🎤 Hablar';
        flushVoiceBuffer();
      }
    });

    function scheduleAutoSend(){
      if (silenceTimer) clearTimeout(silenceTimer);
      silenceTimer = setTimeout(()=>flushVoiceBuffer(), SILENCE_MS);
    }
    function flushVoiceBuffer(){
      if (silenceTimer){ clearTimeout(silenceTimer); silenceTimer=null; }
      const text = (input.value || lastTranscript || "").trim();
      if (!text) return;
      lastTranscript = "";
      input.value = "";
      userMsg(text);
      route(text);
    }
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

    // Webs → servicio + portafolio
    if (/(^|\b)(paginas web|p[aá]ginas web|webs|portafolio de webs|trabajos web|sitios)(\b|$)/.test(qn)) {
      return botMsg(renderWebWithPortfolio());
    }

    // Automatizaciones → automatizaciones + bots + portafolio (Emilia)
    if (/(^|\b)(automatizaciones|manychat|make|bot|bots|asistentes ia)(\b|$)/.test(qn)) {
      return botMsg(renderAutomatizacionesWithBots());
    }

    // Bots directo (del overview)
    if (/^bots y asistentes ia$/i.test(q.trim())) {
      return botMsg(renderBotsWithPortfolio());
    }

    // Servicios detallados individuales
    if (/^branding$|dise[ñn]o de marca|logo|manual de marca/.test(qn)) return botMsg(KB.branding);
    if (/^contenido para redes$|reels|tiktok|shorts|post|posts/.test(qn)) return botMsg(KB.contenido);
    if (/^social media manager$|gesti[oó]n de redes|community/.test(qn)) return botMsg(KB.social);
    if (/^seo$|\bposicionamiento\b/.test(qn)) return botMsg(KB.seo);
    if (/^campañas ads$|ads|anuncios|google|meta|tiktok/.test(qn)) return botMsg(KB.ads);
    if (/^estrategias de marketing$|funnel|embudo|growth/.test(qn)) return botMsg(KB.marketing);
    if (/^fotograf[ií]a de producto$|foto de producto/.test(qn)) return botMsg(KB.fotografia);
    if (/^contenido con ia$|video ia|imagen ia|audiovisual ia/.test(qn)) return botMsg(KB.contenido_ia);
    if (/^embudos y realidad aumentada$|embudos automatizados|realidad aumentada|^ra$/.test(qn)) return botMsg(KB.embudos_ra);
    if (/^apps premium$|vpn|youtube premium|photoroom/.test(qn)) return botMsg(KB.apps_premium);

    // Cotización
    if (/cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta/.test(qn)) { startCotizacion(); return; }

    // Vista general
    if (/servicios|portafolio|cat[aá]logo|categor[ií]as|todo$/.test(qn)) return botMsg(KB.overview);

    // Fallback
    const hit = smallSearch(qn); if (hit) return botMsg(hit);
    botMsg("Puedo mostrarte **Páginas web + Portafolio** o **Automatizaciones + Bots (Emilia)**, ver **cualquier servicio** en detalle, o iniciar **cotización**." + CTA);
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

  // ===== Guardado (opcional) en /assets/save_conversation.php
  function persistConversationToServer(lead){
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const payload = { when:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, lead, conversation: history };
    fetch('assets/save_conversation.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    }).then(r=>r.json()).then(res=>{ if(!res?.ok) console.warn('Guardado falló:',res); })
      .catch(err=>console.warn('Error guardando:',err));
  }

  // ===== Fuzzy fallback
  function smallSearch(q){
    const pairs = [
      [renderWebWithPortfolio(), ["paginas web","páginas web","webs","portafolio de webs","trabajos web","sitios"]],
      [renderAutomatizacionesWithBots(), ["automatizaciones","manychat","make","bot","bots","asistentes ia","servimil","emilia"]],
      [KB.branding,["branding","marca","logo","manual"]],
      [KB.contenido,["contenido","reels","tiktok","shorts","post","posts"]],
      [KB.social,["social media","smm","gestion redes","gestión redes","community"]],
      [KB.seo,["seo","posicionamiento"]],
      [KB.ads,["ads","campañas","anuncios","google","meta","tiktok"]],
      [KB.marketing,["marketing","funnel","embudo","growth","estrategia"]],
      [KB.fotografia,["foto","fotografia","fotografía","producto"]],
      [KB.contenido_ia,["contenido ia","video ia","imagen ia","audiovisual ia"]],
      [KB.embudos_ra,["embudos automatizados","realidad aumentada","ra"]],
      [KB.apps_premium,["apps premium","vpn","youtube premium","photoroom"]],
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

  // ===== Utils persistencia
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


