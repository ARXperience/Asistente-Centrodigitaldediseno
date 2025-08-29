// ================== bot.js ==================
const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');
const talk  = document.getElementById('talk');

const STORAGE_KEY = 'cdd_chat_history_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

// Contacto oficial para cotización
const OFICIAL_PHONE = "573202608864";
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

const CTA = `\n\n¿Quieres cotizar tu proyecto? ✨<br>
Escribe <strong>cotizar</strong> o contáctanos:<br>
📲 WhatsApp: +${OFICIAL_PHONE} · ✉️ ${OFICIAL_MAIL}`;

// ===== Base de conocimiento =====
const KB = {
  servicios:
`### Servicios principales
1. <strong>Diseño web moderno y optimizado</strong> (landing, multipágina, e-commerce).<br>
2. <strong>Branding & diseño de marca</strong> (logo, identidad, manual de marca).<br>
3. <strong>Creación de contenido visual</strong> (posts, reels, videos cortos).<br>
4. <strong>Marketing digital</strong> (campañas, funnels, anuncios en Meta/Google/TikTok).<br>
5. <strong>Gestión de redes sociales</strong> (SMM, crecimiento orgánico).<br>
6. <strong>SEO</strong> (redes y web).<br>
7. <strong>Fotografía de producto</strong> profesional.<br>
8. <strong>Automatizaciones con IA</strong> (procesos, atención al cliente).<br>
9. <strong>Videos con IA</strong> (conceptuales, publicitarios).<br>
10. <strong>Generación de imágenes/AV con IA</strong>.<br>
11. <strong>Bots de mensajes y llamadas</strong> (asistentes virtuales).<br>
12. <strong>Embudos de ventas automatizados</strong>.<br>
13. <strong>Realidad aumentada</strong> para negocios.<br>
14. <strong>Plataforma de Apps Premium</strong> (VPN, YouTube Premium, PhotoRoom…).<br>
15. <strong>Marketing con IA</strong> (análisis predictivo y personalización).${CTA}`,

  web:
`### Páginas web (moderno + conversión)
- Diseño <strong>responsive</strong> (landing, multipágina, e-commerce).<br>
- <strong>SEO técnico</strong> y Core Web Vitals.<br>
- Integración con <strong>WhatsApp, CRM y analítica</strong>.<br>
- Optimización de <strong>copy</strong> y estructura para conversión.<br><br>

<strong>Portafolio — Webs</strong><br>
🔗 <a href="https://marketflix.com.co" target="_blank">Marketflix.com.co</a><br>
<img src="assets/marketflix.png" width="260" alt="Marketflix"><br>
Plataforma con autenticación, base de datos, multimedia y correos.<br><br>

🔗 <a href="https://centrodigitaldis.wixsite.com/volservice" target="_blank">Volservice</a><br>
<img src="assets/volservice.png" width="260" alt="Volservice"><br>
Sitio con tienda, blog SEO, correos e indexación.<br><br>

🔗 <a href="https://almaverde.com.co/" target="_blank">AlmaVerde.com.co</a><br>
<img src="assets/almaverde.png" width="260" alt="Almaverde"><br>
Portafolio comercial, proyectos, captación de leads, correos, blog SEO.<br><br>

🔗 <a href="https://premiumappscol.wixsite.com/inicio" target="_blank">Premium Apps</a><br>
<img src="assets/premiumapps.png" width="260" alt="Premium Apps"><br>
Sitio en construcción, catálogo de APKs gratuitas por tiempo limitado.${CTA}`,

  automat:
`### Automatizaciones & Bots
- <strong>ManyChat/WhatsApp</strong>: flujos y campañas.<br>
- <strong>Make</strong>: integra formularios, CRM, Google, Meta, Email.<br>
- <strong>Bots de IA</strong> entrenados con tus textos/FAQs.<br><br>

<strong>Ejemplo real — Bot “Emilia” (Servimil)</strong><br>
<img src="assets/emilia.png" width="260" alt="Bot Emilia"><br>
Asistente virtual para responder y guiar clientes.<br><br>

<a href="https://wa.me/573157019885?text=Hola%20Emilia,%20quiero%20informaci%C3%B3n" target="_blank"
style="display:inline-block;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600">Probar en WhatsApp</a>${CTA}`,

  branding:
`### Branding & diseño de marca
- Identidad visual completa (logo, paleta, tipografías).<br>
- Manual de marca y sistemas de uso.<br>
- Kit para redes, presentaciones y piezas base.${CTA}`,

  mktia:
`### Marketing con IA
- Segmentación y creatividades asistidas por IA.<br>
- <strong>Analítica predictiva</strong> y personalización de campañas.<br>
- Testing continuo y dashboards de KPIs.${CTA}`,

  cotiz:
`### Cotización
Trabajamos <strong>por alcance y objetivos</strong>. El valor depende de páginas, integraciones, contenido y automatizaciones.<br><br>
<strong>Cómo cotizamos</strong><br>
1) Brief rápido + llamada de 15–20 min.<br>
2) Propuesta con entregables, tiempos y valor.<br>
3) Arranque del Sprint 1.${CTA}`
};

// ===== Estado del flujo de cotización =====
let flow = loadFlowState() || {activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};

// ===== Inicio =====
if (!localStorage.getItem(STORAGE_KEY)) {
  botMsg("👋 <strong>Hola</strong>, soy el asistente del Centro Digital de Diseño. Puedo contarte de <strong>servicios</strong>, <strong>páginas web</strong>, <strong>automatizaciones</strong> o ayudarte a <strong>cotizar</strong>.");
}

send.onclick = () => {
  const txt = input.value.trim();
  if (!txt) return;
  input.value = "";
  userMsg(txt);
  route(txt);
};

input.addEventListener("keydown", e=>{
  if (e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send.click(); }
});

document.querySelectorAll(".chip").forEach(c=>{
  c.onclick = () => { userMsg(c.dataset.q); route(c.dataset.q); };
});

if (clear){
  clear.onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FLOW_KEY);
    msgs.innerHTML = "";
    flow = {activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
    botMsg("🧹 Historial limpio. Escribe <strong>cotizar</strong> para iniciar una nueva cotización.");
  };
}

// ===== Router =====
function route(q){
  const qn = norm(q);

  if (flow.activo) { handleCotizacion(q); return; }
  if (/cotiz/i.test(qn)) { startCotizacion(); return; }

  // Servicios -> texto + botones
  if (/^servicio(s)?$|que hacen|ofrecen|todo/i.test(qn)){
    botMsg(KB.servicios);
    botMsg(servicesButtonsHTML());
    return;
  }

  // Categorías
  if (/web|tienda|landing|site/i.test(qn)) { botMsg(KB.web); return; }
  if (/automat|bot|ia|whatsapp|manychat|make/i.test(qn)) { botMsg(KB.automat); return; }
  if (/branding/i.test(qn)) { botMsg(KB.branding); return; }
  if (/marketing con ia|mkt ia|marketing ia/i.test(qn)) { botMsg(KB.mktia); return; }

  botMsg("Puedo contarte sobre <strong>servicios</strong>, <strong>páginas web</strong>, <strong>automatizaciones</strong> o ayudarte a <strong>cotizar</strong>.");
}

// ===== Botones tipo “chips” dentro del mensaje de Servicios =====
function servicesButtonsHTML(){
  const style = "display:inline-block;margin:6px 8px 0 0;padding:8px 14px;border-radius:999px;border:1px solid #d0d7e2;text-decoration:none;color:inherit;background:#fff";
  return `
<div style="margin-top:6px">
  <a href="#" class="chip-link" data-q="Páginas web" style="${style}">🌐 Páginas web</a>
  <a href="#" class="chip-link" data-q="Branding" style="${style}">🎨 Branding</a>
  <a href="#" class="chip-link" data-q="Automatizaciones" style="${style}">⚙️ Automatizaciones</a>
  <a href="#" class="chip-link" data-q="Marketing con IA" style="${style}">🤖 Marketing con IA</a>
</div>`;
}

// Delegación de eventos para esos chips
document.addEventListener("click", (e)=>{
  const a = e.target.closest(".chip-link");
  if (!a) return;
  e.preventDefault();
  const q = a.dataset.q || a.textContent.trim();
  userMsg(q);
  route(q);
});

// ===== Flujo de Cotización =====
function startCotizacion(){
  flow = {activo:true, paso:1, datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
  saveFlowState();
  botMsg("Perfecto 🙌 Para cotizar necesito unos datos.<br>1️⃣ ¿Cuál es tu <strong>nombre completo</strong>?");
}

function handleCotizacion(txt){
  switch (flow.paso){
    case 1:
      flow.datos.nombre = txt; flow.paso = 2; saveFlowState();
      botMsg("2️⃣ ¿Qué <strong>servicios</strong> te interesan?");
      break;
    case 2:
      flow.datos.servicios = txt; flow.paso = 3; saveFlowState();
      botMsg("3️⃣ ¿Nombre de tu <strong>empresa o proyecto</strong>?");
      break;
    case 3:
      flow.datos.empresa = txt; flow.paso = 4; saveFlowState();
      botMsg("4️⃣ Tu <strong>número de WhatsApp</strong> (ej. 3001234567 o +57 3001234567)");
      break;
    case 4:
      flow.datos.telefono = txt;
      finalizeQuote();
      break;
  }
}

function finalizeQuote(){
  const {nombre,servicios,empresa,telefono} = flow.datos;
  const wapp = `https://wa.me/${OFICIAL_PHONE}?text=${encodeURIComponent(`Hola soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}`)}`;
  const mail = `mailto:${OFICIAL_MAIL}?subject=Cotización&body=${encodeURIComponent(`Nombre: ${nombre}\nServicios: ${servicios}\nEmpresa: ${empresa}\nTeléfono: ${telefono}`)}`;

  botMsg(
`### ¡Gracias ${escapeHTML(nombre)}!
Resumen de tu solicitud:
- <strong>Servicios:</strong> ${escapeHTML(servicios)}<br>
- <strong>Empresa:</strong> ${escapeHTML(empresa)}<br>
- <strong>Teléfono:</strong> ${escapeHTML(telefono)}<br><br>
👉 Para continuar, <strong>presiona uno de los botones</strong>:<br>
<a href="${wapp}" target="_blank" style="display:inline-block;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600;margin-right:8px">📲 WhatsApp</a>
<a href="${mail}" style="display:inline-block;background:#10a37f;color:#fff;text-decoration:none;padding:8px 14px;border-radius:10px;font-weight:600">✉️ Email</a>
${CTA}`
  );

  flow = {activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
  saveFlowState();
}

// ===== Render =====
function render(role, html){
  const row = document.createElement("div");
  row.className = "row " + (role === "assistant" ? "assistant" : "user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role === "assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";
  bub.innerHTML = html;

  row.appendChild(av); row.appendChild(bub);
  msgs.appendChild(row);
  requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });
}

function userMsg(t){ render("user", escapeHTML(t)); }
function botMsg(t){ render("assistant", t); }

// ===== Utils =====
function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){ return (s||'').toLowerCase().trim(); }

// ===== Persistencia mínima del flujo =====
function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
function loadFlowState(){ try{ return JSON.parse(localStorage.getItem(FLOW_KEY)||"null"); } catch { return null; } }

// ===== Voz (dictado) =====
let recognition;
if ('webkitSpeechRecognition' in window){
  recognition = new webkitSpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  let silenceTimer;
  recognition.onresult = (e) => {
    let finalChunk = "";
    for (let i=e.resultIndex; i<e.results.length; i++){
      if (e.results[i].isFinal){
        finalChunk += e.results[i][0].transcript + " ";
      }
    }
    if (finalChunk){
      input.value = (input.value + " " + finalChunk).trim();
    }
    clearTimeout(silenceTimer);
    silenceTimer = setTimeout(()=>{ if (input.value.trim()) send.click(); }, 1500);
  };
}

if (talk){
  talk.onclick = ()=>{
    if (recognition) recognition.start();
    botMsg("🎤 Estoy escuchando; cuando haya 1.5 s sin voz enviaré tu mensaje automáticamente.");
  };
}
// ================== fin bot.js ==================