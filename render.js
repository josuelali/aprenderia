/* AprenderIA — motor simple (sin frameworks)
   - Rutas por hash (#/articulo/slug)
   - Contenido desde /data/posts.json
*/
const $ = (sel) => document.querySelector(sel);

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, (m)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

async function loadPosts(){
  const r = await fetch("/data/posts.json", { cache: "no-store" });
  if(!r.ok) throw new Error("No pude cargar posts.json");
  return await r.json();
}

function setMeta({title, description, canonicalPath}){
  document.title = title;
  const d = $("#meta-description");
  if(d) d.setAttribute("content", description);

  const c = $("#canonical");
  if(c) c.setAttribute("href", `${location.origin}${canonicalPath}`);
}

function route(){
  const hash = location.hash || "#/";
  return hash;
}

function renderHome(posts){
  setMeta({
    title: "Aprender IA para ganar dinero — Guías prácticas",
    description: "Guías sencillas y prácticas para aprender inteligencia artificial y aplicarla para generar ingresos reales, paso a paso.",
    canonicalPath: "/"
  });

  const list = $("#posts");
  list.innerHTML = "";
  posts.forEach(p=>{
    const li = document.createElement("div");
    li.className = "card";
    li.innerHTML = `
      <div class="badge">${escapeHtml(p.level)}</div>
      <h2><a href="#/articulo/${encodeURIComponent(p.slug)}">${escapeHtml(p.title)}</a></h2>
      <p>${escapeHtml(p.description)}</p>
      <p class="notice">Tiempo de lectura: ${escapeHtml(p.readTime)}</p>
    `;
    list.appendChild(li);
  });
}

function renderArticle(post){
  setMeta({
    title: `${post.title} — Aprender IA`,
    description: post.description,
    canonicalPath: `/articulo/${post.slug}`
  });

  const main = $("#main");
  main.innerHTML = `
    <div class="wrap article">
      <h1>${escapeHtml(post.title)}</h1>
      <p class="notice">${escapeHtml(post.level)} · ${escapeHtml(post.readTime)}</p>

      <div class="ad" id="ad-top">[Espacio AdSense — arriba]</div>

      ${post.contentHtml}

      <div class="ad" id="ad-mid">[Espacio AdSense — medio]</div>

      <div class="kit">
        <strong>Recomendación (Amazon)</strong>
        <p class="notice">Enlaces de ejemplo. Aquí pondrás tus links de Afiliados.</p>
        ${post.affiliateHtml}
      </div>

      <div class="ad" id="ad-bottom">[Espacio AdSense — final]</div>

      <p><a href="#/">← Volver a la home</a></p>
    </div>
  `;
}

async function boot(){
  const posts = await loadPosts();
  const r = route();

  if(r.startsWith("#/articulo/")){
    const slug = decodeURIComponent(r.replace("#/articulo/",""));
    const post = posts.find(p=>p.slug===slug);
    if(!post){
      $("#main").innerHTML = `<div class="wrap"><h1>No encontrado</h1><p>Ese artículo no existe.</p><p><a href="#/">Volver</a></p></div>`;
      return;
    }
    renderArticle(post);
  }else{
    $("#main").innerHTML = `
      <header>
        <div class="wrap">
          <div class="brand">AprenderIA</div>
          <nav>
            <a href="#/">Inicio</a>
            <a href="/legal.html">Aviso legal</a>
            <a href="/privacy.html">Privacidad</a>
            <a href="/cookies.html">Cookies</a>
          </nav>
        </div>
      </header>

      <div class="wrap hero">
        <h1>Aprender IA para ganar dinero</h1>
        <p>Empieza fácil, aplica rápido y escala con calma. Guías pensadas para gente normal, sin tecnicismos.</p>
        <div class="ad">[Espacio AdSense — home]</div>
      </div>

      <div class="wrap">
        <div class="grid" id="posts"></div>
      </div>

      <footer>
        <div class="wrap">
          <small>© ${new Date().getFullYear()} AprenderIA · <a href="/privacy.html">Privacidad</a> · <a href="/cookies.html">Cookies</a> · <a href="/legal.html">Aviso legal</a></small>
          <div class="notice" style="margin-top:8px">Nota: esta es una demo. Sustituye los textos y enlaces por los tuyos y añade tu ID de AdSense.</div>
        </div>
      </footer>
    `;
    renderHome(posts);
  }
}

window.addEventListener("hashchange", ()=>boot().catch(console.error));
boot().catch(err=>{
  console.error(err);
  $("#main").innerHTML = `<div class="wrap"><h1>Error</h1><p>No pude cargar el contenido.</p><pre>${escapeHtml(err.message)}</pre></div>`;
});
