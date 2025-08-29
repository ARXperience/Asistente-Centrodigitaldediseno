const msgs  = document.getElementById('messages');
const input = document.getElementById('input');
const send  = document.getElementById('send');
const typing= document.getElementById('typing');
const clear = document.getElementById('clear');
const talk  = document.getElementById('talk');

const STORAGE_KEY = 'cdd_chat_history_v1';
const FLOW_KEY    = 'cdd_quote_flow_state_v1';

const OFICIAL_PHONE = "573202608864";
const OFICIAL_MAIL  = "centrodigitaldediseno@gmail.com";

const CTA = `\n\n¿Quieres cotizar tu proyecto? ✨  
Escribe **cotizar** o contáctanos:  
📲 WhatsApp: +${OFICIAL_PHONE} · ✉️ ${OFICIAL_MAIL}`;

// ==== Base de conocimiento ====
const KB = {
  servicios: 
`### Servicios principales
1. **Diseño web moderno y optimizado** (landing, multipágina, e-commerce).  
2. **Branding & diseño de marca** (logos, identidad, manual de marca).  
3. **Creación de contenido visual** (posts, reels, videos cortos).  
4. **Marketing digital** (campañas, funnels, anuncios en Meta/Google/TikTok).  
5. **Gestión de redes sociales** (social media manager, crecimiento orgánico).  
6. **SEO** (posicionamiento en redes sociales y web).  
7. **Fotografía de producto profesional**.  
8. **Automatizaciones con IA** (procesos, atención al cliente).  
9. **Videos con IA** (conceptuales, publicitarios, explicativos).  
10. **Generación de imágenes y contenido con IA**.  
11. **Bots de mensajes y llamadas** (asistentes virtuales empresariales).  
12. **Embudos de ventas automatizados**.  
13. **Realidad aumentada para negocios**.  
14. **Plataforma de Apps Premium** (VPN, YouTube Premium, PhotoRoom, etc.).  
15. **Marketing con IA** (análisis predictivo y personalización).  
${CTA}`,

  web: 
`### Páginas web (moderno + conversión)
- Diseño **responsive** (landing, multipágina, e-commerce).  
- **SEO técnico** y Core Web Vitals.  
- Integración con **WhatsApp, CRM y analítica**.  
- Optimización de **copy** y estructura para conversión.  

**Portafolio — Webs**
🔗 [Marketflix.com.co](https://marketflix.com.co)  
<img src="assets/marketflix.png" width="260"/>  
Plataforma con autenticación, base de datos, multimedia y correos.  

🔗 [Volservice](https://centrodigitaldis.wixsite.com/volservice)  
<img src="assets/volservice.png" width="260"/>  
Sitio con tienda, blog SEO, correos e indexación.  

🔗 [AlmaVerde.com.co](https://almaverde.com.co/)  
<img src="assets/almaverde.png" width="260"/>  
Portafolio comercial, proyectos, leads, correos, blog SEO.  

🔗 [Premium Apps](https://premiumappscol.wixsite.com/inicio)  
<img src="assets/premiumapps.png" width="260"/>  
Sitio en construcción, catálogo de APKs gratuitas por tiempo limitado.  

${CTA}`,

  automat: 
`### Automatizaciones & Bots
- **ManyChat/WhatsApp**: flujos y campañas.  
- **Make**: conecta formularios, CRM, Google, Meta, Email.  
- **Bots de IA** entrenados con tus textos y FAQs.  

**Ejemplo real — Bot Emilia (Servimil)**  
<img src="assets/emilia.png" width="260"/>  
Asistente virtual para responder y guiar clientes.  

👉 [Probar en WhatsApp](https://wa.me/573157019885?text=Hola%20Emilia,%20quiero%20información)  

${CTA}`,

  cotiz: 
`### Cotización
Trabajamos **por alcance y objetivos**. El valor depende de páginas, integraciones, contenido y automatizaciones.  

**Cómo cotizamos**
1. Brief rápido + llamada de 15–20 min.  
2. Propuesta con entregables, tiempos y valor.  
3. Arranque del Sprint 1.  
${CTA}`
};

// ==== Flujo de cotización ====
let flow = loadFlowState() || {activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};

send.onclick = () => {
  const txt = input.value.trim();
  if (!txt) return;
  input.value = "";
  userMsg(txt);
  route(txt);
};

input.addEventListener("keydown", e=>{
  if (e.key==="Enter" && !e.shiftKey){e.preventDefault(); send.click();}
});

document.querySelectorAll(".chip").forEach(c=>{
  c.onclick=()=>{userMsg(c.dataset.q); route(c.dataset.q);}
});

if (clear){
  clear.onclick=()=>{
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FLOW_KEY);
    msgs.innerHTML=""; flow={activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
    botMsg("🧹 Historial limpio. Escribe **cotizar** para iniciar una nueva cotización.");
  };
}

// ==== Router principal ====
function route(q){
  const qn = norm(q);
  if (flow.activo){handleCotizacion(q);return;}
  if (/cotiz/i.test(qn)){startCotizacion();return;}
  if (/servicio|todo/i.test(qn)) return botMsg(KB.servicios);
  if (/web|tienda|landing|site/i.test(qn)) return botMsg(KB.web);
  if (/automat|bot|ia|whatsapp/i.test(qn)) return botMsg(KB.automat);
  if (/marketing|funnels|ads/i.test(qn)) return botMsg("### Estrategias de marketing & funnels\n- Embudos tráfico → lead → venta → fidelización\n- Ads en Meta/Google/TikTok\n- Dashboards y KPIs\n"+CTA);
  botMsg("Puedo contarte sobre **servicios**, **páginas web**, **automatizaciones** o ayudarte a **cotizar**.");
}

// ==== Flujo cotización ====
function startCotizacion(){
  flow={activo:true,paso:1,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
  saveFlowState();
  botMsg("Perfecto 🙌 Para cotizar necesito unos datos.\n1️⃣ ¿Cuál es tu **nombre completo**?");
}

function handleCotizacion(txt){
  switch(flow.paso){
    case 1: flow.datos.nombre=txt; flow.paso=2; saveFlowState(); botMsg("2️⃣ ¿Qué **servicios** te interesan?"); break;
    case 2: flow.datos.servicios=txt; flow.paso=3; saveFlowState(); botMsg("3️⃣ ¿Nombre de tu **empresa o proyecto**?"); break;
    case 3: flow.datos.empresa=txt; flow.paso=4; saveFlowState(); botMsg("4️⃣ ¿Tu **número de WhatsApp**?"); break;
    case 4: flow.datos.telefono=txt; finalizeQuote(); break;
  }
}

function finalizeQuote(){
  const {nombre,servicios,empresa,telefono}=flow.datos;
  const wapp=`https://wa.me/${OFICIAL_PHONE}?text=${encodeURIComponent(`Hola soy ${nombre} (${empresa}). Me interesa: ${servicios}. Mi contacto: ${telefono}`)}`;
  const mail=`mailto:${OFICIAL_MAIL}?subject=Cotización&body=${encodeURIComponent(`Nombre: ${nombre}\nServicios: ${servicios}\nEmpresa: ${empresa}\nTeléfono: ${telefono}`)}`;
  botMsg(`### ¡Gracias ${nombre}!  
Resumen de tu solicitud:
- **Servicios:** ${servicios}
- **Empresa:** ${empresa}
- **Teléfono:** ${telefono}

👉 Para continuar, presiona uno de los botones:  
<a href="${wapp}" target="_blank" style="background:#10a37f;color:#fff;padding:8px 14px;border-radius:10px;text-decoration:none">📲 WhatsApp</a>  
<a href="${mail}" style="background:#10a37f;color:#fff;padding:8px 14px;border-radius:10px;text-decoration:none">✉️ Email</a>

${CTA}`);
  flow={activo:false,paso:0,datos:{nombre:"",servicios:"",empresa:"",telefono:""}};
  saveFlowState();
}

// ==== Render ====
function render(role,text){
  const row=document.createElement("div"); row.className="row "+(role==="assistant"?"assistant":"user");
  const av=document.createElement("div"); av.className="avatar"; av.textContent=role==="assistant"?"AI":"Tú";
  const bub=document.createElement("div"); bub.className="bubble"; bub.innerHTML=text;
  row.appendChild(av); row.appendChild(bub); msgs.appendChild(row);
  requestAnimationFrame(()=>{msgs.scrollTop=msgs.scrollHeight});
}
function userMsg(t){render("user",escapeHTML(t));}
function botMsg(t){render("assistant",mdToHTML(t));}

// ==== Utils ====
function mdToHTML(md){
  return md.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
           .replace(/`([^`]+)`/g,'<code>$1</code>')
           .replace(/\n/g,'<br>');
}
function escapeHTML(s){return (s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function norm(s){return s.toLowerCase();}

// ==== Persistencia ====
function saveFlowState(){localStorage.setItem(FLOW_KEY,JSON.stringify(flow));}
function loadFlowState(){try{return JSON.parse(localStorage.getItem(FLOW_KEY)||"null");}catch{return null;}}

// ==== Voz ====
let recognition;
if ('webkitSpeechRecognition' in window){
  recognition=new webkitSpeechRecognition();
  recognition.lang="es-ES"; recognition.continuous=true; recognition.interimResults=true;
  let timeout;
  recognition.onresult=e=>{
    let final=""; for(let i=e.resultIndex;i<e.results.length;++i){
      if(e.results[i].isFinal){final+=e.results[i][0].transcript+" ";}
    }
    if(final){input.value=(input.value+" "+final).trim();}
    clearTimeout(timeout);
    timeout=setTimeout(()=>{if(input.value){send.click();}},1500);
  };
}
if(talk){
  talk.onclick=()=>{
    if(recognition) recognition.start();
    botMsg("🎤 Estoy escuchando, habla y enviaré tu mensaje automáticamente...");
  };
}