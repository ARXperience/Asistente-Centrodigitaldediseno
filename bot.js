// bot.js — PRO + Flujo de Cotización + Voz + Portafolio por categorías
// (Markdown + Copiar + Typing + Persistencia + Chips + Autoscroll)

const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');

const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

// === Datos oficiales ===
const OFICIAL_PHONE = "573202608864";  // botón de cotización (WhatsApp oficial)
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

// === CTA (lo mostramos como bloque al final, 1 vez) ===
const CTA = (
  `\n\n<strong>¿Quieres cotizar tu proyecto?</strong><br>` +
  `Escribe <strong>cotizar</strong> o contáctanos: ` +
  `<a href="https://wa.me/${OFICIAL_PHONE}" target="_blank">+${OFICIAL_PHONE}</a> · ${OFICIAL_MAIL}`
);

// ====== Portafolio de servicios (categorías y servicios) ======
const CATS = [
  {
    id:"diseno_branding",
    emoji:"🎨",
    title:"Diseño & Branding",
    services: [
      {
        name:"Diseño web moderno y optimizado",
        desc:"Landing, multipágina o e-commerce con foco en conversión, velocidad (Core Web Vitals), estructura clara, copy orientado a objetivos e integración con WhatsApp, CRM y analítica."
      },
      {
        name:"Branding & diseño de marca",
        desc:"Creación de identidad: logo maestro y variantes, sistema tipográfico y cromático, retícula, iconografía y manual de marca listo para impresión y uso digital."
      },
      {
        name:"Fotografía de producto",
        desc:"Producción y edición para e-commerce, catálogos y anuncios. Fondos limpios, retratos de producto y sets creativos listos para performance ads."
      }
    ]
  },
  {
    id:"contenido_marketing",
    emoji:"📣",
    title:"Contenido & Marketing",
    services: [
      {
        name:"Creación de contenido visual",
        desc:"Piezas para redes (posts, carruseles, stories), y video corto (reels/shorts/TikTok) con guion, edición y optimización para retención."
      },
      {
        name:"Marketing digital",
        desc:"Plan de campañas, embudos por etapas, email/SMS, creatividades, pruebas A/B y optimización basada en métricas."
      },
      {
        name:"Gestión de redes sociales",
        desc:"Calendario editorial, publicación, moderación, reporting y crecimiento orgánico con buenas prácticas por plataforma."
      },
      {
        name:"SEO",
        desc:"SEO técnico (estructura, metadatos, rendimiento) y de contenido (keyword research, clusters, blog) para mejorar visibilidad en web y social."
      }
    ]
  },
  {
    id:"ia_automatizaciones",
    emoji:"🤖",
    title:"IA & Automatizaciones",
    services: [
      {
        name:"Automatizaciones con IA",
        desc:"Flujos con ManyChat/Make/WhatsApp Business API para calificar leads, responder FAQs y enviar información 24/7."
      },
      {
        name:"Videos con IA",
        desc:"Piezas conceptuales, publicitarias o explicativas con generación asistida y postproducción lista para pauta."
      },
      {
        name:"Imágenes y contenido audiovisual con IA",
        desc:"Dirección de arte asistida (prompts, estilos), generación y tratamiento avanzado para campañas."
      },
      {
        name:"Bots de mensajes y llamadas",
        desc:"Asistentes virtuales para WhatsApp, web o voz que atienden, derivan y registran conversaciones."
      },
      {
        name:"Asistentes virtuales empresariales",
        desc:"Bots entrenados con documentos y procesos internos para soporte, ventas o capacitación."
      },
      {
        name:"Embudos de ventas automatizados",
        desc:"Captura → nutrición → conversión con integraciones a CRM, formularios, pagos y notificaciones."
      },
      {
        name:"Realidad aumentada",
        desc:"Filtros, probadores y experiencias AR para awareness y performance."
      },
      {
        name:"Apps Premium",
        desc:"Gestión de licencias y herramientas (p.ej. VPN, YouTube Premium, PhotoRoom) para equipos."
      },
      {
        name:"Marketing con IA",
        desc:"Análisis predictivo, segmentación inteligente y personalización creativa a escala."
      }
    ]
  }
];

// === Estado (flujo cotización) ===
let flow = loadFlowState() || {
  activo:false, paso:0, datos:{nombre:"", servicios:"", empresa:"", telefono:""}
};

// ====== Arranque ======
restoreHistory();
if (historyEmpty()){
  botMsg("👋 <strong>Hola</strong>, soy el asistente del Centro Digital de Diseño. Puedo contarte de <strong>servicios</strong>, <strong>páginas web</strong>, <strong>automatizaciones</strong> o ayudarte a <strong>cotizar</strong>.");
}

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
document.querySelectorAll(".chip").forEach(c=>{
  c.onclick = ()=>{ userMsg(c.dataset.q); route(c.dataset.q); };
});
if (clear){
  clear.onclick = ()=>{
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FLOW_KEY);
    msgs.innerHTML = "";
    typing.style.display="none";
    flow = {activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
    botMsg("🧹 Historial limpio. Escribe <strong>cotizar</strong> para iniciar una nueva cotización.");
  };
}

// ====== Delegación de clicks en botones dentro del chat ======
msgs.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  // abrir categoría del portafolio
  if (action === "open-cat" && btn.dataset.id){
    const cat = CATS.find(c=>c.id===btn.dataset.id);
    if (cat) showCategory(cat);
  }
});

// ====== Router ======
function route(q){
  if (/^cancelar$/i.test(q.trim())){
    if (flow.activo){
      flow = {activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
      saveFlowState();
      return botMsg("Flujo de cotización <strong>cancelado</strong>. Cuando quieras, escribe <em>cotizar</em> para retomarlo.");
    }
  }
  if (flow.activo){ handleCotizacion(q); return; }

  const qn = norm(q);
  if (/(cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta)/.test(qn)) { startCotizacion(); return; }

  // Portafolio de servicios
  if (/(portafolio\s*de\s*servicios|portafolio|servicios principales)/.test(qn)){
    return showPortfolio();
  }

  respond(q);
}

// ====== Flujo de Cotización ======
function startCotizacion(){
  flow = { activo:true, paso:1, datos:{nombre:"", servicios:"", empresa:"", telefono:""} };
  saveFlowState();
  botMsg("Perfecto, armemos tu <strong>cotización</strong>. <br>1) ¿Cuál es tu <strong>nombre completo</strong>?<br><small>(Escribe <code>cancelar</code> para salir.)</small>");
}
function handleCotizacion(respuesta){
  const text = respuesta.trim();
  switch(flow.paso){
    case 1:{
      flow.datos.nombre = text; flow.paso=2; saveFlowState();
      botMsg(`Gracias, <strong>${escapeHTML(text)}</strong>.<br>2) ¿Qué <strong>servicios</strong> te interesan?<br><small>Ej.: “Landing + automatización WhatsApp”, “E-commerce con branding”, “Bot de IA para atención”.</small>`);
      break;
    }
    case 2:{
      flow.datos.servicios = text; flow.paso=3; saveFlowState();
      botMsg("3) ¿Cómo se llama tu <strong>empresa o proyecto</strong>?");
      break;
    }
    case 3:{
      flow.datos.empresa = text; flow.paso=4; saveFlowState();
      botMsg("4) ¿Cuál es tu <strong>número de WhatsApp</strong> para compartirte la propuesta?");
      break;
    }
    case 4:{
      if (!isValidPhone(text)){
        botMsg("El número no parece válido. Intenta con <code>3001234567</code> o incluye código de país <code>+57 3001234567</code>.");
        return;
      }
      flow.datos.telefono = cleanPhone(text);
      finalizeQuote();
      break;
    }
    default:{
      flow = {activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
      saveFlowState();
      botMsg("He reiniciado el flujo. Escribe <strong>cotizar</strong> para empezar de nuevo.");
    }
  }
}
function finalizeQuote(){
  const leads = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
  leads.push({...flow.datos, fecha:new Date().toISOString()});
  localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

  const {nombre, servicios, empresa, telefono} = flow.datos;
  const wappText = encodeURIComponent(`Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`);
  const mailBody = encodeURIComponent(
`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

  const btn = styleBtn();
  const resumen =
    `<strong>¡Genial, ${escapeHTML(nombre)}!</strong> Con estos datos armamos tu propuesta con entregables, tiempos y valor.<br><br>` +
    `<strong>Resumen</strong><br>` +
    `• <strong>Servicios:</strong> ${escapeHTML(servicios)}<br>` +
    `• <strong>Empresa/Proyecto:</strong> ${escapeHTML(empresa)}<br>` +
    `• <strong>WhatsApp/Teléfono:</strong> ${escapeHTML(telefono)}<br><br>` +
    `<em>Para avanzar, presiona uno de los botones:</em><br>` +
    `<a href="https://wa.me/${OFICIAL_PHONE}?text=${wappText}" target="_blank" ${btn}>📲 WhatsApp oficial</a>` +
    `<a href="mailto:${OFICIAL_MAIL}?subject=Cotización&body=${mailBody}" ${btn}>✉️ Email</a>` +
    CTA;

  flow = {activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
  saveFlowState();
  botMsg(resumen);
}

// ====== Respuestas estándar ======
function respond(q){
  showTyping(true);
  setTimeout(()=>{
    showTyping(false);
    const qn = norm(q);

    if ( /(servicios|qué hacen|que hacen|ofrecen|todo lo que hacen)/.test(qn) ){
      return showPortfolio(); // manda al portafolio organizado
    }
    if ( /(web|landing|tienda|ecommerce|shopify|woocommerce|página|pagina)/.test(qn) ){
      const text =
        `<strong>Páginas web</strong> (moderno + conversión)<br>` +
        `• Diseño responsive: landing, multipágina o e-commerce.<br>` +
        `• SEO técnico y Core Web Vitals.<br>` +
        `• Integración con WhatsApp, CRM y analítica.<br>` +
        `• Optimización de copy y estructura para conversión.` +
        CTA;
      return botMsg(text);
    }
    if ( /(automat|whatsapp|manychat|make|bot|ia|integraci[oó]n|crm)/.test(qn) ){
      const text =
        `<strong>Automatizaciones & Bots de IA</strong><br>` +
        `• ManyChat/Make/WhatsApp Business API.<br>` +
        `• Calificación de leads, respuestas 24/7, derivación a humano.<br>` +
        `• Dashboards y métricas para iterar.` +
        CTA;
      return botMsg(text);
    }
    if ( /(precio|cu[aá]nto vale|cu[aá]nto cuesta|cotizaci[oó]n|presupuesto|cotizar)/.test(qn) ){
      return botMsg(`Trabajamos por alcance y objetivos. Puedo iniciar el flujo aquí: escribe <strong>cotizar</strong>.` + CTA);
    }

    botMsg("Puedo contarte sobre <strong>servicios</strong>, <strong>páginas web</strong>, <strong>automatizaciones</strong> o ayudarte a <strong>cotizar</strong>. Escribe por ejemplo: <em>“Portafolio de servicios”</em>." + CTA);
  }, 420 + Math.random()*260);
}

// ====== Portafolio: vista categorías ======
function showPortfolio(){
  const pill = pillStyle();
  const header = `<strong>Portafolio de servicios</strong>`;
  const buttons = CATS.map(c =>
    `<button ${pill} data-action="open-cat" data-id="${c.id}">${c.emoji} ${c.title}</button>`
  ).join(" ");
  botMsg(`${header}<br>${buttons}` + CTA);
}

// ====== Portafolio: vista de una categoría ======
function showCategory(cat){
  const list = cat.services.map(s =>
    `<li style="margin:6px 0 10px"><strong>${s.name}</strong><br><span>${s.desc}</span></li>`
  ).join("");
  const html =
    `<strong>${cat.emoji} ${cat.title}</strong><br>` +
    `<ul style="margin:10px 0 0 18px; line-height:1.55">${list}</ul>` +
    CTA;
  botMsg(html);
}

// ====== Estilos inline reutilizables para botones en mensajes ======
function pillStyle(){
  return `style="display:inline-block;margin:8px 8px 0 0;padding:8px 12px;border-radius:999px;border:1px solid #d0d7e2;background:#fff;color:#1a1f29;cursor:pointer;font-weight:600;font-size:14px"`;
}
function styleBtn(){
  return `style="display:inline-block;margin:8px 10px 0 0;background:#10a37f;color:#fff;text-decoration:none;padding:10px 14px;border-radius:12px;font-weight:700;font-size:14px"`;
}

// ====== Render con “mini-markdown”, copiar y autoscroll ======
function render(role, mdText){
  const row = document.createElement("div");
  row.className = "row " + (role==="assistant" ? "assistant":"user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role==="assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";

  let html = mdToHTML(mdText);

  bub.innerHTML = html;

  // Botón Copiar en bloques <pre>
  bub.querySelectorAll("pre").forEach(pre=>{
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
  requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });

  saveToHistory(role, mdText);
}
function userMsg(text){ render("user", escapeHTML(text)); }
function botMsg(text){ render("assistant", text); }

// ====== Utilidades UI ======
function showTyping(v){ typing.style.display = v ? "flex":"none"; }

// ====== Mini Markdown (negritas/código y párrafos) ======
function mdToHTML(md){
  md = md.replace(/```([\s\S]*?)```/g, (_,code)=> `<pre><code>${escapeHTML(code.trim())}</code></pre>`);
  md = md
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+?)`/g,'<code>$1</code>');
  const lines = md.split('\n').map(line=>{
    if (/^\s*-\s+/.test(line)) return `<li>${line.replace(/^\s*-\s+/, '')}</li>`;
    if (/^\s*•\s+/.test(line)) return `<li>${line.replace(/^\s*•\s+/, '')}</li>`;
    if (/^<h\d|^<pre|^<ul|^<li|^<\/li|^<\/ul|^<a |^<button /.test(line)) return line;
    return line.trim()? `<p style="margin:8px 0; line-height:1.6">${line}</p>` : '<p style="margin:4px 0"></p>';
  });
  const joined = lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul style="margin:8px 0 8px 18px; line-height:1.55">${m}</ul>`);
  return joined;
}
function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function norm(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9áéíóúñü\s]/g,' ').replace(/\s+/g,' ').trim(); }

// ====== Validaciones ======
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

// ====== Persistencia ======
function saveToHistory(role, text){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  arr.push({ role, text, t: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}
function restoreHistory(){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  if (!arr.length) return;
  arr.forEach(m => { (m.role === 'assistant') ? botMsg(m.text) : userMsg(m.text); });
  const savedFlow = loadFlowState();
  if (savedFlow?.activo){
    flow = savedFlow;
    botMsg("Teníamos un flujo de cotización pendiente. ¿Deseas continuar? Escribe <code>cancelar</code> para salir.");
  }
}
function historyEmpty(){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return arr.length === 0;
}
function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
function loadFlowState(){ try { return JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); } catch { return null; } }

// ====== (Opcional) Voz — tu versión actual se mantiene si ya la tienes en otro archivo ======
// Si estás usando la versión con voz del proyecto, este archivo no la altera. 
// Sólo asegúrate de que el botón “Hablar” siga conectando con tu lógica actual.