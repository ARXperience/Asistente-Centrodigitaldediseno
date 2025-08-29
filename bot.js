// bot.js — Catálogo unificado + Portafolio + Bot Servimil + Cotización + Voz + Delegación de eventos

/***** DOM *****/
const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');
const micBtn= document.getElementById('mic');

/***** Storage *****/
const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

/***** Contacto *****/
const OFICIAL_PHONE = "573028618806";                 // WhatsApp destino formal
const CTA_PHONE     = "573202608864";                 // WhatsApp mostrado en CTA
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

/***** Estado *****/
let flow = loadFlowState() || { activo:false, paso:0, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };

/***** Util *****/
const CTA = `\n\n**¿Quieres cotizar tu proyecto?** Escribe **cotizar** o contáctanos: **+${CTA_PHONE}** · **${OFICIAL_MAIL}**`;
const BTN = "display:inline-block;margin:6px 8px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px";

/***** Portafolio *****/
const PORTAFOLIO_WEB = [
  { nombre: "Marketflix.com.co", url: "https://marketflix.com.co", descr: "Inicio de sesión con base de datos para autenticación. Interactiva/multimedia. Envío de correos.", extra: "Credenciales demo — Correo: centro@admin · Contraseña: admin" },
  { nombre: "Volservice", url: "https://centrodigitaldedis.wixsite.com/volservice", descr: "Sitio con tienda, experiencia interactiva/multimedia, blog para SEO orgánico, correo e indexación.", extra: "" },
  { nombre: "Almaverde", url: "https://almaverde.com.co/", descr: "Portafolio comercial: proyectos, captación de leads, correos electrónicos, blog con artículos (SEO, indexación).", extra: "" },
  { nombre: "Premium Apps", url: "https://premiumappscol.wixsite.com/inicio", descr: "Sitio de apps premium (en construcción). APKs gratuitas por tiempo limitado.", extra: "" }
];

/***** KB (catálogo organizado unificado) *****/
const KB = {
  overview:
`### Accesos rápidos
<a href="#" class="inline-cta" data-q="Páginas web" style="${BTN}">🖥️ Páginas web</a>
<a href="#" class="inline-cta" data-q="Branding" style="${BTN}">🎨 Branding</a>
<a href="#" class="inline-cta" data-q="Contenido para redes" style="${BTN}">📱 Contenido</a>
<a href="#" class="inline-cta" data-q="Social Media Manager" style="${BTN}">👥 Social</a>
<a href="#" class="inline-cta" data-q="SEO" style="${BTN}">🔎 SEO</a>
<a href="#" class="inline-cta" data-q="Campañas Ads" style="${BTN}">💡 Ads</a>
<a href="#" class="inline-cta" data-q="Estrategias de marketing" style="${BTN}">📈 Marketing</a>
<a href="#" class="inline-cta" data-q="Automatizaciones con IA" style="${BTN}">⚙️ Automatizaciones IA</a>
<a href="#" class="inline-cta" data-q="Bots y Asistentes IA" style="${BTN}">🤖 Bots & Asistentes</a>
<a href="#" class="inline-cta" data-q="Contenido con IA" style="${BTN}">🎬 Contenido con IA</a>
<a href="#" class="inline-cta" data-q="Embudos y Realidad Aumentada" style="${BTN}">🧭 Embudos & RA</a>
<a href="#" class="inline-cta" data-q="Apps Premium" style="${BTN}">🟣 Apps Premium</a>
<a href="#" class="inline-cta" data-q="Portafolio" style="${BTN}">🗂️ Portafolio</a>
<a href="#" class="inline-cta" data-q="Probar bot Servimil" style="${BTN}">🤳 Probar bot Servimil</a>
<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN}">🚀 Crear agente gratis</a>
<a href="#" class="inline-cta" data-q="Cotizar" style="${BTN}">💬 Cotizar ahora</a>
${CTA}`,

  web:
`### Páginas web (moderno + conversión)
1. Diseño Web moderno y optimizado (landing, multipágina, e-commerce)  
2. Integración con WhatsApp/CRM, analítica y SEO técnico  
3. Performance y mejores prácticas Core Web Vitals${CTA}`,

  branding:
`### Branding y diseño de marca
- Logos, identidad visual y sistema de marca  
- Manual de marca y aplicaciones  
- Refresh/Rediseño de identidad${CTA}`,

  contenido:
`### Contenido para redes
- Posts, carruseles, video corto (Reels/TikTok/Shorts)  
- Guion + edición + calendario editorial  
- Métricas y mejora continua${CTA}`,

  social:
`### Social Media Manager
- Gestión de redes y comunidad  
- Crecimiento orgánico y reporting  
- Optimización de frecuencia y formatos${CTA}`,

  seo:
`### SEO (web + social)
- Auditoría técnica, on-page y contenidos  
- Estrategia de keywords y backlinks  
- SEO orgánico para blog y páginas clave${CTA}`,

  ads:
`### Campañas publicitarias (Ads)
- Meta Ads, Google Ads y TikTok Ads  
- Creativo, segmentación y medición  
- Testing A/B y escalado por ROAS${CTA}`,

  marketing:
`### Estrategias de marketing & funnels
- Embudos de ventas y automatizaciones  
- Campañas full-funnel (tráfico → conversión)  
- Dashboards de KPIs${CTA}`,

  fotografia:
`### Fotografía de producto
- Foto y micro-video comercial  
- Retoque y formatos por plataforma  
- Paquetes para catálogos y ads${CTA}`,

  auto_ia:
`### Automatizaciones con IA
- Procesos empresariales y atención al cliente  
- Integraciones Make/Zapier, email/WA/CRM  
- Flujos 24/7 con handoff a humano${CTA}`,

  bots_ia:
`### Bots y Asistentes (mensajes y llamadas)
- Asistentes en WhatsApp/IG/Messenger  
- Bots de llamadas con traspaso a asesor  
- Calificación de leads y CRM${CTA}`,

  contenido_ia:
`### Contenido con IA (video e imagen)
- Videos conceptuales/publicitarios/explicativos  
- Generación de imágenes y assets creativos  
- Producción híbrida IA + edición profesional${CTA}`,

  embudos_ra:
`### Embudos automatizados y Realidad Aumentada
- Captura → nurturing → conversión con IA  
- Experiencias AR para promoción/retail  
- Medición y optimización${CTA}`,

  apps_premium:
`### Apps Premium
- Licencias (VPN, YouTube Premium, PhotoRoom, etc.)  
- Gestión de cuentas y soporte a equipos  
- Onboarding y buenas prácticas${CTA}`,

  mkt_ia:
`### Marketing con IA
- Estrategias basadas en IA (análisis predictivo)  
- Personalización de campañas y audiencias  
- Experimentación continua con modelos${CTA}`,

  agente:
`### Crea tu **agente gratis**
Lanza un prototipo y pruébalo en tu web o WhatsApp.

<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN}">🚀 Crear agente gratis</a>`,

  cotiz:
`### Precios & cotización
Trabajamos **por alcance y objetivos** (web/branding/IA/ads).  
1) Brief + llamada (15–20 min)  
2) Propuesta con entregables/tiempos/valor  
3) Arranque del Sprint 1  
${CTA}`
};

/***** Render helpers *****/
function renderPortafolioWeb(){
  let out = `### Portafolio — Páginas web`;
  PORTAFOLIO_WEB.forEach(p => {
    out += `\n\n**${p.nombre}**  
${p.descr}${p.extra ? `\n_${p.extra}_` : ''}  
<a href="${p.url}" target="_blank" style="${BTN}">🔗 Visitar</a>`;
  });
  out += `\n${CTA}`;
  return out;
}
function renderBotServimil(){
  const servimilImg = "https://www.google.com/url?sa=i&url=https%3A%2F%2Fservimil.co%2F&psig=AOvVaw1T_CIc1DJ7FB3-M-Q3DqEW&ust=1756509440126000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCICNhbLSro8DFQAAAAAdAAAAABAE";
  const phone = "5731157019885";
  const text  = encodeURIComponent("Hola Emilia, quiero información");
  return `### Bot de Servimil — Demo
<img src="${servimilImg}" alt="Bot de Servimil" class="fade-in" />

Prueba el bot en WhatsApp:
<a href="https://wa.me/${phone}?text=${text}" target="_blank" style="${BTN}">💬 Hablar con Emilia</a>
${CTA}`;
}

/***** Arranque *****/
restoreHistory();
if (historyEmpty()) {
  botMsg("👋 **Hola!** Este es nuestro **catálogo unificado**. Usa los botones o di *“Cotizar”*.");
  botMsg(KB.overview);
}

/***** Listeners base *****/
send?.addEventListener('click', () => {
  const txt = input.value.trim(); if (!txt) return;
  input.value = ""; userMsg(txt); route(txt);
});
input?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send?.click(); }
});
clear?.addEventListener('click', ()=>{
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FLOW_KEY);
  msgs.innerHTML = ""; typing.style.display="none";
  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  botMsg("🧹 Historial limpio. ¿Escribes **cotizar** o vemos servicios?");
});

/***** Delegación de eventos (botones/links dinámicos dentro del chat) *****/
// Enlaces dentro del chat con data-q (Accesos rápidos, Portafolio, Servimil…)
msgs?.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  const q = link.getAttribute('data-q');
  if (q) {
    e.preventDefault(); e.stopPropagation();
    userMsg(q); route(q);
  }
});
// Chips (por si se crean dinámicos en el futuro)
document.querySelector('.chips')?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.chip');
  if (!btn) return;
  const q = btn.dataset.q || btn.getAttribute('data-q');
  if (!q) return;
  e.preventDefault(); e.stopPropagation();
  userMsg(q); route(q);
});

/***** Voz continua con auto-envío tras 1.5s de silencio *****/
let rec = null, micActive = false;
let voiceBuffer = "";
let silenceTimer = null;
const SILENCE_MS = 1500;

(function setupVoice(){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR || !micBtn) return;

  rec = new SR();
  rec.lang = 'es-ES';
  rec.interimResults = true;
  rec.continuous = true;

  rec.onresult = (ev) => {
    const last = ev.results[ev.results.length - 1];
    const isFinal = last.isFinal;
    const partial = last[0]?.transcript || "";

    if (isFinal) {
      voiceBuffer = (voiceBuffer + " " + partial).trim();
      input.value = voiceBuffer;
    } else {
      input.value = (voiceBuffer + " " + partial).trim();
    }
    scheduleAutoSend();
  };
  rec.onend = () => { if (micActive) try{ rec.start(); }catch(_){} };
  rec.onerror = () => { if (micActive) try{ rec.start(); }catch(_){} };

  micBtn.addEventListener('click', ()=>{
    if (!micActive){
      voiceBuffer = ""; input.value = "";
      try { rec.start(); micActive = true; micBtn.classList.add('active'); micBtn.textContent = '🎤 Escuchando'; } catch(_){}
    } else {
      try { rec.stop(); } catch(_){}
      micActive = false; micBtn.classList.remove('active'); micBtn.textContent = '🎤 Hablar';
      flushVoiceBuffer();
    }
  });

  function scheduleAutoSend(){
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(()=>{ flushVoiceBuffer(); }, SILENCE_MS);
  }
  function flushVoiceBuffer(){
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer=null; }
    const text = (input.value || voiceBuffer || '').trim();
    if (!text) return;
    voiceBuffer = ""; input.value = "";
    userMsg(text); route(text);
  }
})();

/***** Router *****/
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

  if (/^servicios$|cat[aá]logo|categor[ií]as|todo$/.test(qn)) return botMsg(KB.overview);
  if (/p[aá]gina|web|ecommerce|tienda|landing/.test(qn)) return botMsg(KB.web);
  if (/branding|marca|logo|manual/.test(qn)) return botMsg(KB.branding);
  if (/foto|fotograf/.test(qn)) return botMsg(KB.fotografia);
  if (/contenido.*red|reels|tiktok|shorts|posts?/.test(qn)) return botMsg(KB.contenido);
  if (/social.*manager|smm|gesti[oó]n.*red/.test(qn)) return botMsg(KB.social);
  if (/\bseo\b|posicionamiento/.test(qn)) return botMsg(KB.seo);
  if (/ads|camp[aá]ñas|anuncios|google|meta|tiktok/.test(qn)) return botMsg(KB.ads);
  if (/estrategias? de marketing|funnel|embudo|growth/.test(qn)) return botMsg(KB.marketing);

  if (/automatizaciones?.*ia/.test(qn)) return botMsg(KB.auto_ia);
  if (/bots?.*ia|asistentes?.*ia|llamadas?.*ia/.test(qn)) return botMsg(KB.bots_ia);
  if (/contenido.*ia|video.*ia|imagen.*ia|audiovisual.*ia/.test(qn)) return botMsg(KB.contenido_ia);
  if (/embudos?.*automatizados|realidad aumentada|ra\b/.test(qn)) return botMsg(KB.embudos_ra);
  if (/apps?.*premium|vpn|youtube premium|photoroom/.test(qn)) return botMsg(KB.apps_premium);
  if (/marketing.*ia|predictivo|personalizaci[oó]n/.test(qn)) return botMsg(KB.mkt_ia);

  if (/cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta/.test(qn)) { startCotizacion(); return; }
  if (/agente gratis|crear.*agente|chatbot gratis/.test(qn)) return botMsg(KB.agente);

  if (/^portafolio$|trabajos|proyectos|webs realizadas/.test(qn)) return botMsg(renderPortafolioWeb());
  if (/servimil|probar.*servimil|bot servimil|probar bot/.test(qn)) return botMsg(renderBotServimil());

  const hit = smallSearch(qn); if (hit) return botMsg(hit);
  botMsg("Puedo ayudarte con el **catálogo**, el **portafolio** o iniciar **cotización**. " + CTA);
}

/***** Flujo de cotización *****/
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

/***** Guardado en servidor (requiere assets/save_conversation.php) *****/
function persistConversationToServer(lead){
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const payload = { when:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, lead, conversation: history };
  // Debes crear assets/save_conversation.php para escribir JSONs en /assets/conversaciones con asistente/
  fetch('assets/save_conversation.php', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  })
  .then(r=>r.json()).then(res=>{ if(!res?.ok) console.warn('Guardado falló:',res); })
  .catch(err=>console.warn('Error guardando:',err));
}

/***** Buscador difuso *****/
function smallSearch(q){
  const pairs = [
    [KB.web,["web","ecommerce","tienda","landing","sitio"]],
    [KB.branding,["branding","marca","logo","manual"]],
    [KB.fotografia,["foto","fotografia","fotografía","producto"]],
    [KB.contenido,["contenido","reels","tiktok","shorts","post","posts"]],
    [KB.social,["social media","smm","gestion redes","gestión redes","community"]],
    [KB.seo,["seo","posicionamiento"]],
    [KB.ads,["ads","campañas","anuncios","google","meta","tiktok"]],
    [KB.marketing,["marketing","funnel","embudo","growth","estrategia"]],
    [KB.auto_ia,["automatizacion ia","automatización ia"]],
    [KB.bots_ia,["bots ia","asistentes ia","llamadas ia"]],
    [KB.contenido_ia,["contenido ia","video ia","imagen ia"]],
    [KB.embudos_ra,["embudos automatizados","realidad aumentada","ra"]],
    [KB.apps_premium,["apps premium","vpn","youtube premium","photoroom"]],
    [KB.mkt_ia,["marketing ia","predictivo","personalizacion","personalización"]],
    [KB.agente,["agente gratis","crear agente","chatbot gratis"]],
    [renderPortafolioWeb(),["portafolio","trabajos","proyectos","webs realizadas"]],
    [renderBotServimil(),["servimil","probar servimil","bot servimil","probar bot"]],
    [KB.overview,["servicios","catalogo","catálogo","categorias","categorías","todo"]],
    [KB.cotiz,["cotiz","presupuesto","precio","cuanto vale","cuánto vale","cuanto cuesta","cuánto cuesta"]],
  ];
  let best=null,score=0;
  pairs.forEach(([text,keys])=>{
    const s = keys.reduce((acc,k)=> acc + (q.includes(k)?1:0), 0);
    if (s>score){score=s; best=text;}
  });
  return score>0 ? best : null;
}

/***** Render y markdown *****/
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
    btn.addEventListener("click", ()=>{ const code=pre.querySelector("code")?.innerText||pre.innerText; navigator.clipboard.writeText(code); btn.textContent="C