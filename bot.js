// bot.js — estilizado de botones + delegación de eventos

const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');
const talk  = document.getElementById('talk');

const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

// Oficiales
const OFICIAL_PHONE = "573202608864";       // <- actualizado
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

// CTA reusable (texto simple para respuestas generales)
const CTA_TXT = `¿Quieres cotizar tu proyecto? Escribe **cotizar** o contáctanos: +${OFICIAL_PHONE} · ${OFICIAL_MAIL}`;

let flow = loadFlowState() || { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };

// ===== Arranque =====
restoreHistory();
if (historyEmpty()) {
  botMsg("👋 **Hola**, soy el asistente del Centro Digital de Diseño. Puedo contarte sobre **servicios**, **páginas web**, **automatizaciones** o ayudarte a **cotizar**.");
}

// Entradas
send.onclick = () => {
  const txt = input.value.trim();
  if (!txt) return;
  input.value = "";
  userMsg(txt);
  route(txt);
};
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send.click(); }
});
document.querySelectorAll(".chip").forEach(c => {
  c.onclick = () => { userMsg(c.textContent.trim()); route(c.dataset.q || c.textContent.trim()); };
});
clear?.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(FLOW_KEY);
  msgs.innerHTML = "";
  typing.style.display="none";
  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  botMsg("🧹 Historial limpio. Escribe **cotizar** para iniciar una nueva cotización.");
});

// ===== Router =====
function route(q){
  const qn = norm(q);

  if (/^cancelar$/i.test(q.trim()) && flow.activo){
    flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
    saveFlowState();
    return botMsg("Flujo de cotización **cancelado**. Escribe *cotizar* para retomarlo.");
  }
  if (flow.activo) return handleCotizacion(q);

  if (/(cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta)/.test(qn)) return startCotizacion();
  if (/^servicios$/i.test(q)) return mostrarCategorias();

  // atajos
  if (/p[aá]ginas web|webs?/i.test(q)) return seccionWeb();
  if (/automat/i.test(q)) return seccionAutomat();
  if (/agente gratis/i.test(q)) return agenteGratis();
  if (/marketing con ia/i.test(q)) return seccionMktIA();

  return responderGeneral(q);
}

// ===== Secciones =====
function mostrarCategorias(){
  const pills = [
    pillBtn('💻','Diseño & Branding','ver:branding'),
    pillBtn('📱','Contenido & Marketing','ver:contenido'),
    pillBtn('🤖','IA & Automatizaciones','ver:automat'),
    pillBtn('🌐','Páginas Web & Portafolio','ver:web'),
    pillBtn('💬','Bots & Asistentes','ver:bots')
  ].join(' ');
  botMsg(
`**📁 Portafolio de servicios**

Elige una categoría:

${pills}

${auxCTAonce()}`
  );
}

function seccionWeb(){
  botMsg(
`**🌐 Páginas web (moderno + conversión)**

• **Diseño responsive** (landing, multipágina, e-commerce)
• **SEO técnico** y Core Web Vitals
• Integración con **WhatsApp, CRM y analítica**
• Optimización de **copy** y **estructura** para conversión

**Portafolio — Webs**
- **Marketflix.com.co**  
  Plataforma con **autenticación** y **base de datos** para usuarios.  
  Interactividad multimedia y **workflows de correos**.  
  ![marketflix](assets/marketflix.jpg)
- **Volservice (Wix)**  
  Tienda integrada, sitio interactivo, **blog SEO**, **correo** e **indexación**.  
  ![volservice](assets/volservice.jpg)
- **Almaverde.com.co**  
  Portafolio comercial, captación de **leads**, **correos**, blog para **posicionamiento SEO** e indexación.  
  ![almaverde](assets/almaverde.jpg)
- **Premium Apps**  
  Sitio de apps premium en construcción; **APKs** gratuitas por tiempo limitado.  
  ![premiumapps](assets/premiumapps.jpg)

${ctaButtons()}`
  );
}

function seccionAutomat(){
  botMsg(
`**🤖 Automatizaciones con IA**
• Bots, flujos, segmentación, campañas (ManyChat / WhatsApp)
• Make / integraciones con formularios, CRMs, Google, Email, Meta
• Dashboards y **KPIs** por etapa
${ctaButtons()}`
  );
}

function seccionMktIA(){
  botMsg(
`**🧠 Marketing con IA**
• Estrategias basadas en IA (análisis predictivo, personalización)  
• **SEO** en redes y web; contenidos con IA (imágenes, video)  
• **AR** para activaciones  
${ctaButtons()}`
  );
}

function agenteGratis(){
  const url = "https://gold-snail-248674.hostingersite.com/chatbot.html";
  botMsg(
`**🧪 Crea un agente gratis**

Prueba nuestro generador básico para experimentar con un agente propio:

<a href="${url}" target="_blank" class="btn-cta"><span class="emo">🧩</span> Crear agente gratis</a>

${auxCTAonce()}`
  );
}

// ===== Cotización =====
function startCotizacion(){
  flow = { activo:true, paso:1, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };
  saveFlowState();
  botMsg("¡Perfecto! Para darte una **cotización personalizada** necesito unos datos.\n\n1️⃣ ¿Cuál es tu **nombre completo**?\n\n*(Puedes escribir `cancelar` para salir del flujo.)*");
}
function handleCotizacion(respuesta){
  const t = respuesta.trim();
  switch(flow.paso){
    case 1: flow.datos.nombre=t; flow.paso=2; saveFlowState();
      botMsg(`Gracias, **${escapeHTML(t)}**.  
2️⃣ ¿Qué **servicios** te interesan?  
_Ej.: “Landing + automatización WhatsApp”, “E-commerce con branding”, “Bot de IA para atención”, etc._`);
      break;
    case 2: flow.datos.servicios=t; flow.paso=3; saveFlowState();
      botMsg("3️⃣ ¿Cómo se llama tu **empresa o proyecto**?"); break;
    case 3: flow.datos.empresa=t; flow.paso=4; saveFlowState();
      botMsg("4️⃣ ¿Cuál es tu **número de WhatsApp o teléfono** para compartirte la propuesta?"); break;
    case 4:
      if (!isValidPhone(t)) return botMsg("Parece que el número no es válido. Formatos: `3001234567` o `+57 3001234567`.");
      flow.datos.telefono = cleanPhone(t);
      finalizeQuote(); break;
    default:
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      saveFlowState(); botMsg("Reinicié el flujo. Escribe **cotizar** para empezar de nuevo.");
  }
}
function finalizeQuote(){
  const leads = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
  leads.push({ ...flow.datos, fecha:new Date().toISOString() });
  localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

  const { nombre, servicios, empresa, telefono } = flow.datos;
  const wappText = encodeURIComponent(`Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`);
  const mailBody = encodeURIComponent(
`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

  const resumen =
`**¡Genial, ${escapeHTML(nombre)}! 🙌**
Con estos datos armamos tu propuesta con **entregables, tiempos y valor**. Te contactaremos en breve.

**Resumen**
- **Servicios:** ${escapeHTML(servicios)}
- **Empresa/Proyecto:** ${escapeHTML(empresa)}
- **WhatsApp/Teléfono:** ${escapeHTML(telefono)}

**Presiona uno de los botones para finalizar la cotización:**
<a href="https://wa.me/${OFICIAL_PHONE}?text=${wappText}" target="_blank" class="btn-cta"><span class="emo">📲</span> WhatsApp</a>
<a href="mailto:${OFICIAL_MAIL}?subject=Cotización&body=${mailBody}" class="btn-cta"><span class="emo">✉️</span> Email</a>`;

  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  saveFlowState();
  botMsg(resumen);
}

// ===== Respuestas generales =====
function responderGeneral(q){
  showTyping(true);
  setTimeout(() => {
    showTyping(false);
    const qn = norm(q);
    if (/servicios/.test(qn)) return mostrarCategorias();
    if (/web|landing|tienda|ecommerce|woocommerce|shopify|p[aá]gina/.test(qn)) return seccionWeb();
    if (/automat|whatsapp|manychat|make|bot|ia|crm/.test(qn)) return seccionAutomat();
    if (/marketing/.test(qn)) return seccionMktIA();

    botMsg(`Puedo ayudarte con **servicios**, **páginas web**, **automatizaciones** y **cotización**.\n\n${auxCTAonce()}`);
  }, 420 + Math.random()*260);
}

// ===== Helpers UI y render =====
function pillBtn(emoji, label, q){
  return `<a href="#" class="pill" data-q="${escapeHTML(q)}"><span class="emo">${emoji}</span><span>${escapeHTML(label)}</span></a>`;
}
function ctaButtons(){
  const w = `https://wa.me/${OFICIAL_PHONE}?text=${encodeURIComponent('Hola, quiero información / una cotización.')}`;
  const m = `mailto:${OFICIAL_MAIL}?subject=${encodeURIComponent('Información / Cotización')}`;
  return `<a href="${w}" target="_blank" class="btn-cta"><span class="emo">📲</span> WhatsApp</a><a href="${m}" class="btn-cta"><span class="emo">✉️</span> Email</a>`;
}
// CTA simple en texto (solo 1 vez)
function auxCTAonce(){ return `> ${CTA_TXT}`; }

function render(role, mdText){
  const row = document.createElement("div");
  row.className = "row " + (role === "assistant" ? "assistant" : "user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role === "assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";

  let html = mdToHTML(mdText);
  bub.innerHTML = html;

  // Copy button en <pre>
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

  // Delegación: cualquier elemento con data-q envía consulta
  bub.querySelectorAll("[data-q]").forEach(el=>{
    el.addEventListener("click",(e)=>{
      e.preventDefault();
      const q = el.getAttribute("data-q") || el.textContent.trim();
      userMsg(el.textContent.trim());
      route(q);
    });
  });

  row.appendChild(av);
  row.appendChild(bub);
  msgs.appendChild(row);
  requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });

  saveToHistory(role, mdText);
}
function userMsg(text){ render("user", escapeHTML(text)); }
function botMsg(text){ render("assistant", text); }
function showTyping(v){ typing.style.display = v ? "flex" : "none"; }

// Mini MD
function mdToHTML(md){
  md = md.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHTML(code.trim())}</code></pre>`);
  md = md
    .replace(/^### (.*)$/gim,'<h3>$1</h3>')
    .replace(/^## (.*)$/gim,'<h2>$1</h2>')
    .replace(/^# (.*)$/gim,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+?)`/g,'<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%;border-radius:12px;border:1px solid var(--border);margin:6px 0">');

  const lines = md.split('\n').map(line=>{
    if (/^\s*-\s+/.test(line)) return `<li>${line.replace(/^\s*-\s+/, '')}</li>`;
    if (/^\s*•\s+/.test(line)) return `<li>${line.replace(/^\s*•\s+/, '')}</li>`;
    if (/^<h\d|^<pre|^<ul|^<li|^<\/li|^<\/ul|^<a |^<img/.test(line)) return line;
    return line.trim()? `<p>${line}</p>` : '<p style="margin:4px 0"></p>';
  });
  const joined = lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  return joined;
}

// Utilidades
function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9áéíóúñü\s]/g,' ').replace(/\s+/g,' ').trim();}

// Teléfono
function isValidPhone(v){ const d = onlyDigits(v); return /^57\d{10}$/.test(d) || /^\d{10}$/.test(d); }
function cleanPhone(v){ let d = onlyDigits(v); if (/^\d{10}$/.test(d)) d = "57" + d; return d; }
function onlyDigits(s){ return (s||'').replace(/\D+/g,''); }

// Persistencia
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
  if (savedFlow?.activo){ flow = savedFlow; botMsg("Teníamos un **flujo de cotización** pendiente. ¿Deseas **continuar**? Escribe `cancelar` para salir."); }
}
function historyEmpty(){ const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return arr.length === 0; }
function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
function loadFlowState(){ try { return JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); } catch { return null; } }
