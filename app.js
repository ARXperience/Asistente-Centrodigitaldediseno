// bot.js — Catálogo unificado (Diseño + IA) + Flujo de Cotización + CTAs inline + Markdown + Copiar + Persistencia

/***** DOM *****/
const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');

/***** Storage *****/
const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

/***** Contacto oficial *****/
const OFICIAL_PHONE = "573028618806";
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

/***** Estado flujo *****/
let flow = loadFlowState() || {
  activo: false, paso: 0, datos: { nombre:"", servicios:"", empresa:"", telefono:"" }
};

/***** Util *****/
const CTA = `\n\n**Contáctanos:** WhatsApp +${OFICIAL_PHONE} · ${OFICIAL_MAIL}`;
const BTN_INLINE = "display:inline-block;margin:6px 8px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px";

/***** Catálogo UNIFICADO (todas las ofertas en una sola estructura) *****/
const KB = {
  overview:
`### Servicios (catálogo unificado)
Elige una categoría para ver detalles:

**Diseño & Marca**
- **Páginas web modernas y optimizadas** (landing, multipágina, e-commerce)
- **Branding** (logos, identidad visual, manual de marca)
- **Fotografía de producto** profesional

**Contenido & Social**
- **Contenido visual** (posts, reels, videos cortos)
- **Social Media Manager** (gestión de redes y crecimiento orgánico)
- **SEO** (posicionamiento en web y redes)

**Ads & Growth**
- **Campañas publicitarias** (Meta, Google, TikTok)
- **Estrategias de marketing digital** (campañas, funnels/embudos)

**Inteligencia Artificial**
- **Automatizaciones con IA** (procesos, atención al cliente, CRM)
- **Bots & Asistentes** (mensajes y llamadas)
- **Contenido con IA** (videos conceptuales/publicitarios/explicativos; generación de imágenes)
- **Embudos automatizados & Realidad Aumentada**
- **Apps Premium** (VPN, YouTube Premium, PhotoRoom, etc.)
- **Marketing basado en IA** (análisis predictivo, personalización)

**Accesos rápidos**  
<a href="#" class="inline-cta" data-q="Páginas web">🖥️ Páginas web</a>
<a href="#" class="inline-cta" data-q="Branding">🎨 Branding</a>
<a href="#" class="inline-cta" data-q="Contenido para redes">📱 Contenido</a>
<a href="#" class="inline-cta" data-q="Social Media Manager">👥 Social</a>
<a href="#" class="inline-cta" data-q="SEO">🔎 SEO</a>
<a href="#" class="inline-cta" data-q="Campañas Ads">💡 Ads</a>
<a href="#" class="inline-cta" data-q="Estrategias de marketing">📈 Marketing</a>
<a href="#" class="inline-cta" data-q="Automatizaciones con IA">⚙️ Automatizaciones IA</a>
<a href="#" class="inline-cta" data-q="Bots y Asistentes IA">🤖 Bots & Asistentes</a>
<a href="#" class="inline-cta" data-q="Contenido con IA">🎬 Contenido con IA</a>
<a href="#" class="inline-cta" data-q="Embudos y Realidad Aumentada">🧭 Embudos & RA</a>
<a href="#" class="inline-cta" data-q="Apps Premium">🟣 Apps Premium</a>
<a href="#" class="inline-cta" data-q="Marketing con IA">🧠 Marketing con IA</a>
<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN_INLINE}">🚀 Crear agente gratis</a>
<a href="#" class="inline-cta" data-q="Cotizar">💬 Cotizar ahora</a>
${CTA}`,

  web:
`### Páginas web (moderno + conversión)
- Landing pages, multipágina y e-commerce.
- Performance, SEO técnico y analítica.
- Integración con WhatsApp/CRM/automatizaciones.${CTA}`,

  branding:
`### Branding & Marca
- Logotipo, paleta, tipografía, sistema visual.
- Manual de marca y lineamientos aplicados a piezas.
- Reposicionamiento y refresh de identidad.${CTA}`,

  fotografia:
`### Fotografía de producto
- Fotografía y micro-video para catálogo y anuncios.
- Dirección de arte + retoque para e-commerce y social.
- Entregables optimizados por plataforma.${CTA}`,

  contenido:
`### Contenido para redes
- Reels/TikTok/Shorts, carruseles y estáticos.
- Guión, edición, motion y formatos por canal.
- Calendario editorial + kit de plantillas.${CTA}`,

  social:
`### Social Media Manager
- Gestión de redes y crecimiento orgánico.
- Moderación, reporting y optimización por cohortes.
- Integración con paid y performance creativo.${CTA}`,

  seo:
`### SEO (web + social)
- Auditoría on-page y técnica.
- Estrategia de contenidos con intención de búsqueda.
- Optimización para descubrimiento en social/short-form.${CTA}`,

  ads:
`### Campañas Ads (Meta, Google, TikTok)
- Performance creativo + segmentación.
- Píxeles, conversion API y medición por eventos.
- Experimentación A/B y escalado por ROAS.${CTA}`,

  marketing:
`### Estrategias de marketing & funnels
- Arquitectura de embudos full-funnel (orgánico + pago).
- Email/SMS/WA nurturing y lead scoring.
- Dashboards de KPIs de adquisición y LTV.${CTA}`,

  auto_ia:
`### Automatizaciones con IA
- Procesos operativos y atención al cliente 24/7.
- Integración con CRM, formularios, email/WA, etc.
- Orquestación con Make/Zapier y webhooks.${CTA}`,

  bots_ia:
`### Bots & Asistentes (mensajes y llamadas)
- Bots de WhatsApp/IG/Messenger y asistentes por voz.
- Calificación de leads + derivación a humano.
- Entrenamiento con tus textos/FAQs.${CTA}`,

  contenido_ia:
`### Contenido con IA (video e imagen)
- Videos conceptuales, publicitarios y explicativos.
- Generación de imágenes y assets para campañas.
- Guiones, estilos y prompts optimizados.${CTA}`,

  embudos_ra:
`### Embudos automatizados & Realidad Aumentada
- Captura → calificación → conversión con IA.
- Experiencias AR para productos/tiendas.
- Medición, iteración y escalado.${CTA}`,

  apps_premium:
`### Apps Premium
- Gestión de licencias y cuentas (VPN, YouTube Premium, PhotoRoom, etc.).
- Onboarding, soporte y administración para equipos.${CTA}`,

  mkt_ia:
`### Marketing con IA
- Análisis predictivo (propensión, churn, LTV).
- Personalización de creatividades y mensajes.
- Testing continuo con modelos y datos propios.${CTA}`,

  cotiz:
`### Precios & cotización
Trabajamos **por alcance y objetivos**. El valor depende de:
- complejidad (páginas/branding/automatizaciones),
- volumen de contenido,
- integraciones y licencias.

**Proceso**
1) **Brief** + **llamada** (15–20 min)  
2) Propuesta con **entregables, tiempos y valor**  
3) Alineación y **arranque** del Sprint 1
${CTA}`,

  agente:
`### Crea tu **agente gratis**
Lanza un prototipo en minutos y pruébalo en tu web o WhatsApp.

<a href="https://gold-snail-248674.hostingersite.com/chatbot.html" target="_blank" style="${BTN_INLINE}">🚀 Crear agente gratis</a>`
};

/***** Inicio *****/
restoreHistory();
if (historyEmpty()) {
  botMsg("👋 **Hola!** Aquí tienes nuestro **catálogo unificado** de servicios. Usa los botones o escribe lo que necesitas.");
  botMsg(KB.overview);
}

/***** Listeners *****/
send?.addEventListener('click', () => {
  const txt = input.value.trim();
  if (!txt) return;
  input.value = "";
  userMsg(txt);
  route(txt);
});
input?.addEventListener('keydown', e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send?.click(); }
});
document.querySelectorAll(".chip").forEach(c => {
  c.addEventListener('click', () => { userMsg(c.dataset.q); route(c.dataset.q); });
});
clear?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FLOW_KEY);
  msgs.innerHTML = "";
  typing.style.display="none";
  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  botMsg("🧹 Historial limpio. ¿Quieres **cotizar**? Puedo guiarte paso a paso.");
});

// Delegación para CTAs inline dentro de mensajes
msgs?.addEventListener('click', (e) => {
  const el = e.target.closest('[data-q]');
  if (el && el.classList.contains('inline-cta')) {
    e.preventDefault();
    const q = el.getAttribute('data-q') || '';
    if (q) { userMsg(q); route(q); }
  }
});

/***** Router *****/
function route(q){
  if (/^cancelar$/i.test(q.trim())) {
    if (flow.activo){
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      saveFlowState();
      return botMsg("Flujo de cotización **cancelado**. Cuando quieras, escribe *cotizar* para retomarlo.");
    }
  }
  if (flow.activo) { handleCotizacion(q); return; }

  const qn = norm(q);

  // Navegación por categorías unificadas
  if (/^servicios$|^cat[aá]logo|categor[ií]as|todo$/i.test(qn)) return botMsg(KB.overview);

  if (/p[aá]ginas? web|ecommerce|tienda|landing/.test(qn)) return botMsg(KB.web);
  if (/branding|marca|logotipo|logo|manual/.test(qn)) return botMsg(KB.branding);
  if (/foto|fotograf[ií]a/.test(qn)) return botMsg(KB.fotografia);

  if (/contenido.*red(es)?|reels|tiktok|shorts|posts?/.test(qn)) return botMsg(KB.contenido);
  if (/social.*manager|smm|gesti[oó]n.*red/.test(qn)) return botMsg(KB.social);
  if (/\bseo\b|posicionamiento/.test(qn)) return botMsg(KB.seo);

  if (/ads|camp[aá]ñas|anuncios|google|meta|tiktok ads?/.test(qn)) return botMsg(KB.ads);
  if (/estrategias? de marketing|funnel|embudo|growth/.test(qn)) return botMsg(KB.marketing);

  if (/automatizaciones?.*ia|automatizaci[oó]n.*ia/.test(qn)) return botMsg(KB.auto_ia);
  if (/bots?.*ia|asistentes?.*ia|llamadas?.*ia/.test(qn)) return botMsg(KB.bots_ia);
  if (/contenido.*ia|video.*ia|imagen(es)?.*ia|audiovisual.*ia/.test(qn)) return botMsg(KB.contenido_ia);
  if (/embudos?.*automatizados|realidad aumentada|ra\b/.test(qn)) return botMsg(KB.embudos_ra);
  if (/apps?.*premium|vpn|youtube premium|photoroom/.test(qn)) return botMsg(KB.apps_premium);
  if (/marketing.*ia|predictivo|personalizaci[oó]n.*camp[aá]ñas/.test(qn)) return botMsg(KB.mkt_ia);

  if (/cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta/.test(qn)) { startCotizacion(); return; }
  if (/agente gratis|crear.*agente|chatbot gratis/.test(qn)) return botMsg(KB.agente);

  // Atajos comunes
  if (/(servicios|qué hacen|que hacen|ofrecen|todo lo que hacen)/.test(qn)) return botMsg(KB.overview);

  const hit = smallSearch(qn);
  if (hit) return botMsg(hit);

  botMsg("Puedo ayudarte con cualquier categoría del **catálogo unificado**, o iniciar la **cotización** aquí mismo. " + CTA);
}

/***** Flujo de Cotización *****/
function startCotizacion(){
  flow = { activo:true, paso:1, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };
  saveFlowState();
  botMsg("¡Perfecto! Para darte una **cotización personalizada** necesito unos datos.\n\n1️⃣ ¿Cuál es tu **nombre completo**?\n\n*(Puedes escribir `cancelar` para salir del flujo.)*");
}
function handleCotizacion(respuesta){
  const text = respuesta.trim();
  switch(flow.paso){
    case 1: {
      flow.datos.nombre = text;
      flow.paso = 2; saveFlowState();
      botMsg(`Gracias, **${escapeHTML(text)}**.  
2️⃣ Cuéntame: ¿Qué **servicios** te interesan?  
_Ej.: “Landing + branding + automatización WhatsApp”, “Bot de IA + embudo”, etc._`);
      break;
    }
    case 2: {
      flow.datos.servicios = text;
      flow.paso = 3; saveFlowState();
      botMsg("3️⃣ ¿Cómo se llama tu **empresa o proyecto**?");
      break;
    }
    case 3: {
      flow.datos.empresa = text;
      flow.paso = 4; saveFlowState();
      botMsg("4️⃣ ¿Cuál es tu **número de WhatsApp o teléfono** para compartirte la propuesta?");
      break;
    }
    case 4: {
      if (!isValidPhone(text)) {
        botMsg("Formato no válido. Ej.: `3001234567` o con código `+57 3001234567`.");
        return;
      }
      flow.datos.telefono = cleanPhone(text);
      finalizeQuote();
      break;
    }
    default:
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      saveFlowState();
      botMsg("He reiniciado el flujo. Escribe **cotizar** para empezar de nuevo.");
  }
}
function finalizeQuote(){
  // Guardar lead
  const leads = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
  const lead = { ...flow.datos, fecha: new Date().toISOString() };
  leads.push(lead);
  localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

  const { nombre, servicios, empresa, telefono } = flow.datos;
  const wappText = encodeURIComponent(
    `Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`
  );
  const mailBody = encodeURIComponent(
`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

  const btnStyle = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";

  const resumen =
`### ¡Genial, ${escapeHTML(nombre)}! 🙌
Con estos datos armamos tu propuesta con **entregables, tiempos y valor**. Te contactaremos en breve.

**Resumen**
- **Servicios:** ${escapeHTML(servicios)}
- **Empresa/Proyecto:** ${escapeHTML(empresa)}
- **WhatsApp/Teléfono:** ${escapeHTML(telefono)}

**Acceso rápido**  
<a href="https://wa.me/${OFICIAL_PHONE}?text=${wappText}" target="_blank" style="${btnStyle}">📲 WhatsApp Oficial</a>
<a href="mailto:${OFICIAL_MAIL}?subject=Cotización&body=${mailBody}" style="${btnStyle}">✉️ Email Oficial</a>

> Si necesitas corregir algo, escribe **cotizar** para iniciar nuevamente.`;

  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  saveFlowState();
  botMsg(resumen);
  botMsg(KB.cotiz);
}

/***** Búsqueda difusa *****/
function smallSearch(q){
  const pairs = [
    [KB.web,         ["web","ecommerce","tienda","landing","sitio"]],
    [KB.branding,    ["branding","marca","logo","logotipo","manual"]],
    [KB.fotografia,  ["foto","fotografia","fotografía","producto"]],
    [KB.contenido,   ["contenido","reels","tiktok","shorts","post","posts"]],
    [KB.social,      ["social media","smm","gestion redes","gestión redes","community"]],
    [KB.seo,         ["seo","posicionamiento"]],
    [KB.ads,         ["ads","campañas","anuncios","google","meta","tiktok"]],
    [KB.marketing,   ["marketing","funnel","embudo","growth","estrategia"]],
    [KB.auto_ia,     ["automatizacion ia","automatización ia","procesos ia"]],
    [KB.bots_ia,     ["bots ia","asistentes ia","llamadas ia"]],
    [KB.contenido_ia,["contenido ia","video ia","imagen ia","audiovisual ia"]],
    [KB.embudos_ra,  ["embudos automatizados","realidad aumentada","ra"]],
    [KB.apps_premium,["apps premium","vpn","youtube premium","photoroom"]],
    [KB.mkt_ia,      ["marketing ia","predictivo","personalizacion","personalización"]],
    [KB.cotiz,       ["cotiz","presupuesto","precio","cuanto vale","cuánto vale","cuanto cuesta","cuánto cuesta"]],
    [KB.agente,      ["agente gratis","crear agente","chatbot gratis"]],
    [KB.overview,    ["servicios","catalogo","catálogo","categorias","categorías","todo"]]
  ];
  let best=null,score=0;
  pairs.forEach(([text,keys])=>{
    const s = keys.reduce((acc,k)=> acc + (q.includes(k)?1:0), 0);
    if (s>score){score=s; best=text;}
  });
  return score>0 ? best : null;
}

/***** Render + Markdown + Copiar + Autoscroll *****/
function render(role, mdText){
  const row = document.createElement("div");
  row.className = "row " + (role === "assistant" ? "assistant" : "user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role === "assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";

  // Markdown → HTML + auto-linkify de líneas especiales
  let html = mdToHTML(mdText)
    .replace(/WhatsApp:\s*(https?:\/\/[^\s<]+)/gi, (_m, url) => {
      const btnStyle = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
      return `<a href="${url}" target="_blank" style="${btnStyle}">📲 WhatsApp</a>`;
    })
    .replace(/Email:\s*(mailto:[^\s<]+)/gi, (_m, url) => {
      const btnStyle = "display:inline-block;margin-top:8px;margin-right:8px;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;font-size:14px";
      return `<a href="${url}" style="${btnStyle}">✉️ Email</a>`;
    });

  bub.innerHTML = html;

  // Botón Copiar en bloques <pre>
  bub.querySelectorAll("pre").forEach(pre => {
    const head = document.createElement("div");
    head.className = "code-head";
    head.innerHTML = `<span>código</span>`;
    const btn = document.createElement("button");
    btn.className = "copy";
    btn.textContent = "Copiar";
    btn.addEventListener("click", ()=>{
      const code = pre.querySelector("code")?.innerText || pre.innerText;
      navigator.clipboard.writeText(code);
      btn.textContent = "Copiado ✓";
      setTimeout(()=> btn.textContent = "Copiar", 1100);
    });
    pre.parentNode.insertBefore(head, pre);
    head.appendChild(btn);
  });

  row.appendChild(av);
  row.appendChild(bub);
  msgs.appendChild(row);

  // Autoscroll fiable
  requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });

  saveToHistory(role, mdText);
}
function userMsg(text){ render("user", escapeHTML(text)); }
function botMsg(text){ render("assistant", text); }
function showTyping(v){ typing.style.display = v ? "flex" : "none"; }

/***** Markdown mínimo *****/
function mdToHTML(md){
  md = md.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHTML(code.trim())}</code></pre>`);
  md = md
    .replace(/^### (.*)$/gim,'<h3>$1</h3>')
    .replace(/^## (.*)$/gim,'<h2>$1</h2>')
    .replace(/^# (.*)$/gim,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+?)`/g,'<code>$1</code>');
  const lines = md.split('\n').map(line=>{
    if (/^\s*-\s+/.test(line)) return `<li>${line.replace(/^\s*-\s+/, '')}</li>`;
    if (/^\s*•\s+/.test(line)) return `<li>${line.replace(/^\s*•\s+/, '')}</li>`;
    if (/^<h\d|^<pre|^<ul|^<li|^<\/li|^<\/ul|^<a /.test(line)) return line;
    return line.trim()? `<p>${line}</p>` : '<p style="margin:4px 0"></p>';
  });
  const joined = lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  return joined;
}
function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){return (s||'').toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu,'')
  .replace(/[^a-z0-9áéíóúñü\s]/g,' ')
  .replace(/\s+/g,' ')
  .trim();
}

/***** Validaciones *****/
function isValidPhone(v){
  const d = onlyDigits(v);
  if (/^57\d{10}$/.test(d)) return true;
  if (/^\d{10}$/.test(d))   return true;
  return false;
}
function cleanPhone(v){
  let d = onlyDigits(v);
  if (/^\d{10}$/.test(d)) d = "57" + d;
  return d;
}
function onlyDigits(s){ return (s||'').replace(/\D+/g,''); }

/***** Persistencia *****/
function saveToHistory(role, text){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  arr.push({ role, text, t: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function restoreHistory(){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!arr.length) return;
  arr.forEach(m => {
    if (m.role === 'assistant') botMsg(m.text);
    else userMsg(m.text);
  });
  const savedFlow = loadFlowState();
  if (savedFlow?.activo){
    flow = savedFlow;
    botMsg("Teníamos un **flujo de cotización** pendiente. ¿Deseas **continuar**? Si prefieres salir, escribe `cancelar`.");
  }
}
function historyEmpty(){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return arr.length === 0;
}
function saveFlowState(){
  localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
}
function loadFlowState(){
  try { return JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); }
  catch { return null; }
}
