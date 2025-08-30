// bot.js — Asistente CDD • Portafolio por categorías + servicios detallados + CTA en botones
// (Con Markdown simple, autoscroll, copiar código, voz ya existente aparte)

const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');

const STORAGE_KEY = 'cdd_chat_history_v1';
const QUOTE_KEY   = 'cdd_quote_leads_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

// === Datos oficiales de contacto ===
const OFICIAL_PHONE_E164 = "573202608864"; // para wa.me (sin +)
const OFICIAL_PHONE_TXT  = "+573202608864"; // visible
const OFICIAL_MAIL       = "centrodigitaldediseno@gmail.com";

// ====== Utilidades de estilo de botón inline (dentro del mensaje) ======
const BTN = {
  solid(label) {
    return `<button data-role="btn" data-variant="solid" style="
      display:inline-block;margin:8px 10px 0 0;border:none;cursor:pointer;
      background:#10a37f;color:#fff;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px;box-shadow:0 6px 16px rgba(16,163,127,.25)
    ">${label}</button>`;
  },
  ghost(label) {
    return `<button data-role="btn" data-variant="ghost" style="
      display:inline-block;margin:8px 10px 0 0;cursor:pointer;
      background:transparent;color:inherit;padding:9px 13px;border-radius:12px;
      border:1px solid #d0d7e2;font-weight:600;font-size:14px
    ">${label}</button>`;
  },
  link(label, href, target="_blank") {
    return `<a href="${href}" target="${target}" style="
      display:inline-block;margin:8px 10px 0 0;text-decoration:none;
      background:#10a37f;color:#fff;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px;box-shadow:0 6px 16px rgba(16,163,127,.25)
    ">${label}</a>`;
  }
};

// ====== Contenido (catálogo) ======
const CATEGORIES = [
  {
    key: "branding",
    emoji: "🖥️",
    title: "Diseño & Branding",
    services: [
      {
        id: "web_moderno",
        name: "Diseño web moderno y optimizado",
        desc: [
          "Sitios **responsive** (landing, multipágina, e-commerce) orientados a **conversión**.",
          "SEO técnico y **Core Web Vitals**.",
          "Integración con **WhatsApp**, CRM y **analítica**.",
          "Optimización de **copy** y **estructura**."
        ]
      },
      {
        id: "branding",
        name: "Branding & diseño de marca",
        desc: [
          "Identidad visual completa: **logo**, paleta, tipografías, íconos.",
          "**Manual de marca** y guías de uso.",
          "Adaptaciones a perfiles, documentos y piezas clave."
        ]
      }
    ]
  },
  {
    key: "marketing",
    emoji: "📱",
    title: "Contenido & Marketing",
    services: [
      {
        id: "contenido_visual",
        name: "Creación de contenido visual",
        desc: [
          "Producción de **posts**, **reels** y **videos cortos**.",
          "Guiones, edición, motion ligero y formatos por plataforma."
        ]
      },
      {
        id: "marketing_digital",
        name: "Marketing digital",
        desc: [
          "Campañas y **embudos** de conversión.",
          "Anuncios en **Meta**, **Google** y **TikTok**."
        ]
      },
      {
        id: "social_manager",
        name: "Gestión de redes (SMM)",
        desc: [
          "Calendario editorial, **community management**, reportes y crecimiento orgánico."
        ]
      },
      {
        id: "seo",
        name: "SEO (redes y web)",
        desc: [
          "Posicionamiento orgánico, **keywords**, on-page y optimización de contenidos."
        ]
      },
      {
        id: "foto_producto",
        name: "Fotografía de producto",
        desc: [
          "Producción para catálogos, e-commerce y **redes**."
        ]
      }
    ]
  },
  {
    key: "ia",
    emoji: "🤖",
    title: "IA & Automatizaciones",
    services: [
      {
        id: "auto_ia",
        name: "Automatizaciones con IA",
        desc: [
          "Flujos automáticos para **atención**, **ventas** y procesos internos.",
          "Integraciones con **ManyChat**, **Make**, CRMs y formularios."
        ]
      },
      {
        id: "video_ia",
        name: "Creación de videos con IA",
        desc: [
          "Piezas **conceptuales**, publicitarias y **explicativas** con IA."
        ]
      },
      {
        id: "imagenes_ia",
        name: "Generación de imágenes con IA",
        desc: [
          "Creativos para anuncios, redes y material promocional."
        ]
      },
      {
        id: "asistentes",
        name: "Asistentes virtuales empresariales",
        desc: [
          "Bots de **mensajes** o **llamadas** 24/7 con derivación a humano."
        ]
      },
      {
        id: "embudos_auto",
        name: "Embudos de ventas automatizados",
        desc: [
          "Nurture, **dashboards** y **KPIs** de desempeño."
        ]
      },
      {
        id: "ra",
        name: "Realidad aumentada para negocios",
        desc: [
          "Experiencias inmersivas para productos y activaciones."
        ]
      },
      {
        id: "apps_premium",
        name: "Apps Premium",
        desc: [
          "Acceso a plataformas como **VPN**, **YouTube Premium**, **PhotoRoom**, etc."
        ]
      },
      {
        id: "mkt_ia",
        name: "Marketing con IA",
        desc: [
          "**Personalización** de campañas y **análisis predictivo**."
        ]
      }
    ]
  },
  {
    key: "webs",
    emoji: "🌐",
    title: "Páginas Web & Portafolio",
    services: [
      { id: "web_info", name: "Qué incluye un proyecto web", desc: [
        "Arquitectura, **wireframes**, diseño, desarrollo y QA.",
        "SEO técnico inicial y **analítica**.",
        "Implementación de **formularios** y flujos de correo."
      ]},
      { id: "pf_marketflix", name: "Marketflix.com.co", desc: [
        "Plataforma con **autenticación** y **base de datos**.",
        "Interactividad multimedia y **workflows de correos**."
      ], img: "assets/marketflix.png" },
      { id: "pf_volservice", name: "Volservice (Wix)", desc: [
        "Tienda online, **blog SEO**, captación de leads y correos.",
        "Indexación y páginas orientadas a keywords."
      ], img: "assets/volservice.png" },
      { id: "pf_almaverde", name: "Alma Verde (almaverde.com.co)", desc: [
        "Portafolio comercial, proyectos, captación de **leads**.",
        "Blog con artículos para **posicionamiento SEO**."
      ], img: "assets/almaverde.png" },
      { id: "pf_premiumapps", name: "Premium Apps (en construcción)", desc: [
        "Sitio de **apps premium**, descarga de APKs temporales."
      ], img: "assets/premiumapps.png" }
    ]
  },
  {
    key: "bots",
    emoji: "💬",
    title: "Bots & Asistentes",
    services: [
      {
        id: "servimil",
        name: "Emilia (Servimil) — Bot en WhatsApp",
        desc: [
          "Bot de atención automática con respuestas rápidas a clientes.",
          "Prueba directa por WhatsApp."
        ],
        ctaExtra: function(){
          const url = "https://wa.me/573157019885?text=" + encodeURIComponent("Hola Emilia, quiero información");
          return BTN.link("Probar bot Emilia", url);
        }
      }
    ]
  }
];

// ==== CTA global por mensaje ====
function ctaBlock(){
  const wappURL = `https://wa.me/${OFICIAL_PHONE_E164}?text=${encodeURIComponent("Hola, quiero cotizar mi proyecto con el Centro Digital de Diseño.")}`;
  const mailURL = `mailto:${OFICIAL_MAIL}?subject=${encodeURIComponent("Cotización")}&&body=${encodeURIComponent("Hola, quiero cotizar mi proyecto.")}`;
  return `
  <div style="margin-top:10px">
    ${BTN.link(`📲 WhatsApp ${OFICIAL_PHONE_TXT}`, wappURL)}
    ${BTN.link("✉️ Email", mailURL, "_self")}
  </div>`;
}

// ==== Estado del flujo de cotización (conservamos tu lógica) ====
let flow = loadFlowState() || {
  activo:false, paso:0, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" }
};

// ====== Inicio ======
restoreHistory();
if (historyEmpty()) {
  botMsg("👋 **Hola**, soy el asistente del Centro Digital de Diseño. Puedo contarte sobre **servicios**, **páginas web**, **automatizaciones** o ayudarte a **cotizar**.");
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
document.querySelectorAll(".chip").forEach(c => {
  c.onclick = () => { userMsg(c.dataset.q); route(c.dataset.q); };
});
if (clear) {
  clear.onclick = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FLOW_KEY);
    msgs.innerHTML = "";
    typing.style.display="none";
    flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
    botMsg("🧹 Historial limpio. Escribe **cotizar** para iniciar una nueva cotización.");
  };
}

// ====== Delegación de clicks (botones dentro de mensajes) ======
document.addEventListener("click", (e) => {
  const b = e.target.closest('[data-role="btn"]');
  if (!b) return;

  // ¿Es un botón de categoría?
  if (b.dataset.cat) {
    const key = b.dataset.cat;
    showCategory(key);
    return;
  }
  // ¿Es un botón de servicio?
  if (b.dataset.service && b.dataset.catKey) {
    showServiceDetail(b.dataset.catKey, b.dataset.service);
    return;
  }
  // ¿Es botón para volver a categorías?
  if (b.dataset.nav === "categories") {
    showPortfolio();
    return;
  }
  // ¿Es botón para ver servicios de una categoría (desde el detalle)?
  if (b.dataset.nav === "list" && b.dataset.catKey) {
    listServices(b.dataset.catKey);
    return;
  }
});

// ====== Router ======
function route(q){
  if (/^cancelar$/i.test(q.trim())) {
    if (flow.activo){
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      saveFlowState();
      return botMsg("Flujo de cotización **cancelado**. Escribe *cotizar* para retomarlo.");
    }
  }
  if (flow.activo) { handleCotizacion(q); return; }

  const qn = norm(q);
  if (/(portafolio( de)? servicios|ver servicios|qué ofrecen|que ofrecen)/i.test(q)) {
    showPortfolio(); return;
  }
  if (/(cotiz|presupuesto|precio|cu[aá]nto vale|cu[aá]nto cuesta)/.test(qn)) {
    startCotizacion(); return;
  }

  // Rutas rápidas de antes
  if (/(servicios)/.test(qn)) { showPortfolio(); return; }
  if (/(p[aá]gina|web|ecommerce|tienda)/.test(qn)) { showCategory("webs"); return; }
  if (/(automat|whatsapp|manychat|make|bot|ia)/.test(qn)) { showCategory("ia"); return; }

  // Fallback
  respond(q);
}

// ====== Portafolio ======
function showPortfolio(){
  let html = `<div style="margin-bottom:8px;font-weight:700">📂 Portafolio de servicios</div>
  <div style="color:#6b7280;margin:6px 0 10px">Elige una categoría:</div>`;
  CATEGORIES.forEach(cat=>{
    html += `<button data-role="btn" data-cat="${cat.key}" style="
      display:inline-block;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">${cat.emoji} ${cat.title}</button>`;
  });
  html += ctaBlock();
  botMsg(html);
}

function showCategory(key){
  const cat = CATEGORIES.find(c=>c.key===key);
  if (!cat) return botMsg("No encontré esa categoría.");
  // encabezado + call para listar servicios
  let html = `<div style="margin-bottom:8px;font-weight:800">${cat.emoji} ${cat.title}</div>`;
  html += `<div style="color:#6b7280;margin-bottom:8px">Selecciona un servicio para ver el detalle:</div>`;
  // Si es la categoría de webs, mostramos lista con imágenes tipo “cards”
  if (key === "webs") {
    // Primero botón “Qué incluye un proyecto web”
    html += BTN.ghost("📋 Qué incluye un proyecto web")
              .replace('data-role="btn"', `data-role="btn" data-service="web_info" data-cat-key="webs"`);
    html += "<div style='margin-top:8px'></div>";
    cat.services.filter(s=>s.id!=="web_info").forEach(s=>{
      html += projectCard(s);
    });
    html += navButtons(cat.key);
    html += ctaBlock();
    botMsg(html);
    return;
  }
  // Otras categorías: listado de servicios como botones
  cat.services.forEach(s=>{
    html += `<button data-role="btn" data-service="${s.id}" data-cat-key="${cat.key}" style="
      display:block;width:fit-content;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">${s.name}</button>`;
  });
  html += navButtons(cat.key);
  html += ctaBlock();
  botMsg(html);
}

function listServices(key){
  const cat = CATEGORIES.find(c=>c.key===key);
  if (!cat) return;
  let html = `<div style="margin-bottom:8px;font-weight:800">${cat.emoji} ${cat.title}</div>
  <div style="color:#6b7280;margin-bottom:8px">Selecciona un servicio:</div>`;
  cat.services.forEach(s=>{
    html += `<button data-role="btn" data-service="${s.id}" data-cat-key="${key}" style="
      display:block;width:fit-content;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">${s.name}</button>`;
  });
  html += navButtons(key);
  html += ctaBlock();
  botMsg(html);
}

function showServiceDetail(catKey, serviceId){
  const cat = CATEGORIES.find(c=>c.key===catKey);
  if (!cat) return;
  const svc = cat.services.find(s=>s.id===serviceId);
  if (!svc) return;

  let html = `<div style="margin-bottom:6px;font-weight:800">${cat.emoji} ${cat.title}</div>
  <div style="font-weight:800;margin:6px 0">${svc.name}</div>`;
  if (svc.img) {
    html += `<img src="${svc.img}" alt="${svc.name}" style="width:100%;max-width:720px;border-radius:14px;border:1px solid #e1e6ef;margin:6px 0 8px">`;
  }
  // descripción
  if (Array.isArray(svc.desc)) {
    html += "<ul style='margin:6px 0 6px 20px'>";
    svc.desc.forEach(p => { html += `<li style="margin:6px 0">${mdInlineToHTML(p)}</li>`; });
    html += "</ul>";
  }
  // CTA extra (Emilia)
  if (typeof svc.ctaExtra === "function") {
    html += svc.ctaExtra();
  }

  // Navegación
  html += `<div style="margin-top:12px;color:#6b7280">Seguir explorando:</div>`;
  html += `<button data-role="btn" data-nav="list" data-cat-key="${catKey}" style="
      display:inline-block;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">Ver más de ${cat.title}</button>`;
  html += `<button data-role="btn" data-nav="categories" style="
      display:inline-block;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">📂 Otras categorías</button>`;

  // CTA global (una vez)
  html += ctaBlock();

  botMsg(html);
}

function projectCard(s){
  let html = `<div style="
    border:1px solid #e1e6ef;border-radius:14px;padding:10px;margin:10px 0
  ">`;
  if (s.img) {
    html += `<img src="${s.img}" alt="${s.name}" style="width:100%;border-radius:12px;border:1px solid #eef2f6;margin-bottom:8px">`;
  }
  html += `<div style="font-weight:800;margin-bottom:4px">${s.name}</div>`;
  if (Array.isArray(s.desc)) {
    html += "<ul style='margin:6px 0 6px 20px'>";
    s.desc.forEach(p => { html += `<li style="margin:6px 0">${mdInlineToHTML(p)}</li>`; });
    html += "</ul>";
  }
  html += `<div>${BTN.ghost("Ver detalle")
                .replace('data-role="btn"', `data-role="btn" data-service="${s.id}" data-cat-key="webs"`)}</div>`;
  html += "</div>";
  return html;
}

function navButtons(currentCatKey){
  // Botón para volver a categorías
  return `<div style="margin-top:6px">
    <button data-role="btn" data-nav="categories" style="
      display:inline-block;margin:8px 10px 0 0;border:1px solid #d0d7e2;
      background:transparent;color:inherit;padding:10px 14px;border-radius:12px;
      font-weight:700;font-size:14px
    ">📂 Ver otras categorías</button>
  </div>`;
}

// ====== Respuesta general (fallback de ayuda) ======
function respond(_q){
  const txt = `Puedo contarte sobre **servicios**, **páginas web**, **automatizaciones** o ayudarte a **cotizar**. 
¿Quieres ver el **Portafolio de servicios**?`;
  botMsg(txt + `<div>${BTN.solid("📂 Portafolio de servicios").replace('data-role="btn"', 'data-role="btn" data-nav="categories"')}</div>`);
}

// ====== Cotización (tu flujo previo se mantiene) ======
function startCotizacion(){
  flow = { activo:true, paso:1, datos:{ nombre:"", servicios:"", empresa:"", telefono:"" } };
  saveFlowState();
  botMsg("¡Perfecto! Para darte una **cotización personalizada** necesito unos datos.\n\n1️⃣ ¿Cuál es tu **nombre completo**?\n\n*(Puedes escribir `cancelar` para salir del flujo.)*");
}
function handleCotizacion(respuesta){
  const text = respuesta.trim();
  switch(flow.paso){
    case 1:
      flow.datos.nombre = text;
      flow.paso = 2; saveFlowState();
      botMsg(`Gracias, **${escapeHTML(text)}**.  
2️⃣ Cuéntame: ¿Qué **servicios** te interesan?  
_Ej.: “Landing page + automatización WhatsApp”, “E-commerce con branding”, “Bot de IA para atención”, etc._`);
      break;
    case 2:
      flow.datos.servicios = text;
      flow.paso = 3; saveFlowState();
      botMsg("3️⃣ ¿Cómo se llama tu **empresa o proyecto**?");
      break;
    case 3:
      flow.datos.empresa = text;
      flow.paso = 4; saveFlowState();
      botMsg("4️⃣ ¿Cuál es tu **número de WhatsApp o teléfono** para compartirte la propuesta?");
      break;
    case 4:
      if (!isValidPhone(text)) {
        botMsg("Parece que el número no es válido. Intenta con un formato como `3001234567` o incluye código de país `+57 3001234567`.");
        return;
      }
      flow.datos.telefono = cleanPhone(text);
      finalizeQuote();
      break;
    default:
      flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
      saveFlowState();
      botMsg("He reiniciado el flujo. Escribe **cotizar** para empezar de nuevo.");
  }
}
function finalizeQuote(){
  const leads = JSON.parse(localStorage.getItem(QUOTE_KEY) || "[]");
  const lead = { ...flow.datos, fecha: new Date().toISOString() };
  leads.push(lead);
  localStorage.setItem(QUOTE_KEY, JSON.stringify(leads));

  const { nombre, servicios, empresa, telefono } = flow.datos;
  const wappText = encodeURIComponent(`Hola, soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}.`);
  const mailBody = encodeURIComponent(
`Nombre: ${nombre}
Servicios: ${servicios}
Empresa/Proyecto: ${empresa}
Teléfono: ${telefono}

Mensaje: Hola, quiero avanzar con la cotización.`);

  const resumen = `
  <div style="font-weight:800;margin-bottom:6px">¡Genial, ${escapeHTML(nombre)}! 🙌</div>
  <div>Con estos datos armamos tu propuesta con <strong>entregables, tiempos y valor</strong>. Te contactaremos en breve.</div>

  <ul style="margin:10px 0 10px 20px">
    <li><strong>Servicios:</strong> ${escapeHTML(servicios)}</li>
    <li><strong>Empresa/Proyecto:</strong> ${escapeHTML(empresa)}</li>
    <li><strong>WhatsApp/Teléfono:</strong> ${escapeHTML(telefono)}</li>
  </ul>

  <div style="margin:8px 0 4px">Para **enviar la cotización**, pulsa uno de estos:</div>
  ${BTN.link("📲 WhatsApp oficial", `https://wa.me/${OFICIAL_PHONE_E164}?text=${wappText}`)}
  ${BTN.link("✉️ Email oficial", `mailto:${OFICIAL_MAIL}?subject=${encodeURIComponent("Cotización")}&body=${mailBody}`, "_self")}
  <div style="color:#6b7280;margin-top:8px">Toca uno de los dos para continuar el proceso.</div>
  `;

  flow = { activo:false, paso:0, datos:{nombre:"",servicios:"",empresa:"",telefono:""} };
  saveFlowState();
  botMsg(resumen);
}

// ====== Render (Markdown ligero + autoscroll + copiar) ======
function render(role, mdText){
  const row = document.createElement("div");
  row.className = "row " + (role === "assistant" ? "assistant" : "user");

  const av = document.createElement("div");
  av.className = "avatar";
  av.textContent = role === "assistant" ? "AI" : "Tú";

  const bub = document.createElement("div");
  bub.className = "bubble";

  let html = mdToHTML(mdText);

  // correo/whatsapp autolink si vienen en texto llano
  html = html
    .replace(/WhatsApp:\s*(https?:\/\/[^\s<]+)/gi, (_m, url) =>
      BTN.link("📲 WhatsApp", url))
    .replace(/Email:\s*(mailto:[^\s<]+)/gi, (_m, url) =>
      BTN.link("✉️ Email", url, "_self"));

  bub.innerHTML = html;

  // Botón Copiar para <pre>
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

  row.appendChild(av); row.appendChild(bub);
  msgs.appendChild(row);

  requestAnimationFrame(()=>{ msgs.scrollTop = msgs.scrollHeight; });

  saveToHistory(role, mdText);
}
function userMsg(text){ render("user", escapeHTML(text)); }
function botMsg(text){ render("assistant", text); }

// ====== Markdown mini ======
function mdInlineToHTML(s){
  return s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
}
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
    if (/^<h\d|^<pre|^<ul|^li|^<\/li|^<\/ul|^<a |^<img /i.test(line)) return line;
    return line.trim()? `<p>${line}</p>` : '<p style="margin:4px 0"></p>';
  });
  const joined = lines.join('\n').replace(/(?:<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`);
  return joined;
}

// ====== Helpers ======
function escapeHTML(s){return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){return (s||'').toLowerCase()
  .normalize('NFD').replace(/\p{Diacritic}/gu,'')
  .replace(/[^a-z0-9áéíóúñü\s]/g,' ')
  .replace(/\s+/g,' ')
  .trim();
}
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

// Persistencia
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
    botMsg("Teníamos un **flujo de cotización** pendiente. ¿Deseas **continuar**? Escribe `cancelar` para salir.");
  }
}
function historyEmpty(){
  const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  return arr.length === 0;
}
function saveFlowState(){ localStorage.setItem(FLOW_KEY, JSON.stringify(flow)); }
function loadFlowState(){ try { return JSON.parse(localStorage.getItem(FLOW_KEY) || "null"); } catch { return null; } }
