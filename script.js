const $ = id => document.getElementById(id);

/* ===== 1. Menu do celular ===== */
$("menuBtn").addEventListener("click", () => {
  const aberto = $("menu").classList.toggle("aberto");
  $("menuBtn").setAttribute("aria-expanded", aberto);
});
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => $("menu").classList.remove("aberto")));

/* ===== 2. Rolagem: progresso, sombra do topo, botão de subir e menu ativo ===== */
const links = [...document.querySelectorAll("#menu a")];
const secoes = links.map(a => document.querySelector(a.getAttribute("href")));
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  $("progresso").style.width = (scrollY / max * 100) + "%";
  $("topo").classList.toggle("rolou", scrollY > 10);
  $("subir").classList.toggle("mostra", scrollY > 600);
  let atual = -1;
  secoes.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.35) atual = i; });
  links.forEach((a, i) => a.classList.toggle("ativo", i === atual));
}, { passive: true });
$("subir").addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

/* Seções aparecem suavemente ao entrar na tela */
const obs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); } }), { threshold: 0.08 });
document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

const coresAmbiente = {
  inicio: "#5fc287", quem: "#5fc287", cardapio: "#f4e4a0", conexoes: "#5fc287",
  agua: "#4cc9f0", tempo: "#ff9b71", energia: "#ffd84d", noticias: "#8dbaf2", resultados: "#ecd987"
};
const fundoAmbiente = $("fundoAmbiente");
const areasVisiveis = new Map();
const obsAmbiente = new IntersectionObserver(entries => {
  entries.forEach(entry => areasVisiveis.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0));
  const atual = [...areasVisiveis].filter(([, proporcao]) => proporcao > 0).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (atual) fundoAmbiente.style.setProperty("--cor-ambiente", coresAmbiente[atual.dataset.ambiente] || "#5fc287");
}, { rootMargin: "-20% 0px -20% 0px", threshold: [0, .15, .3, .5, .75] });
document.querySelectorAll(".topo-hero, main > section").forEach(area => {
  area.dataset.ambiente = area.id || "inicio";
  obsAmbiente.observe(area);
});

/* Efeito 3D leve nos itens com data-tilt e nas notícias (segue o mouse) */
function inclinar(el) {
  el.addEventListener("mousemove", e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(700px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
  });
  el.addEventListener("mouseleave", () => el.style.transform = "");
}
document.querySelectorAll("[data-tilt]").forEach(inclinar);

/* ===== 3. Prato interativo ===== */
const fatias = [...document.querySelectorAll(".fatias path")];
function atualizaPrato() {
  const comidas = fatias.filter(f => f.classList.contains("comido")).length;
  $("pratoReset").hidden = comidas === 0;
  $("pratoMsg").textContent = comidas === 4 ? "Prato limpo! Nenhuma sobra para o lixo."
    : comidas ? `Você já comeu ${comidas} de 4 porções.` : "Clique nas porções do prato.";
}
fatias.forEach(f => {
  const comer = () => { f.classList.add("comido"); atualizaPrato(); };
  f.addEventListener("click", comer);
  f.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); comer(); } });
});
$("pratoReset").addEventListener("click", () => { fatias.forEach(f => f.classList.remove("comido")); atualizaPrato(); });

/* ===== 4. Cardápio mensal – pratos reais da Matriz de Planejamento de Cardápios 2026 (Polo 5 e 6, Pará de Minas) =====
   Cada linha: [dia, grupo (1 a 6), prato, o que acompanha]. O ciclo tem 5 semanas e só se repete depois dele. */
const GRUPOS = {
  1: "Arroz temperado", 2: "Preparações diversas", 3: "Feijão",
  4: "Canjiquinha, mingau, polenta ou sopa", 5: "Preparações doces", 6: "Doces regionais"
};
const cardapio = {
  "1ª semana": [
    ["Segunda", 2, "Macarronada à bolonhesa", "—"],
    ["Terça",   4, "Polenta à jardineira", "—"],
    ["Quarta",  3, "Feijão tropeiro", "Laranja"],
    ["Quinta",  1, "Arroz com ovos mexidos", "Fruta"],
    ["Sexta",   2, "Carne moída com batatas, arroz e feijão", "—"]],
  "2ª semana": [
    ["Segunda", 3, "Tutu de feijão com molho de carne, ovos e hortaliças", "—"],
    ["Terça",   2, "Purê de batatas com molho de frango e arroz", "—"],
    ["Quarta",  1, "Arroz colorido com carne moída", "Fruta"],
    ["Quinta",  4, "Sopa de macarrão", "Fruta"],
    ["Sexta",   2, "Pão com molho de carne", "Suco"]],
  "3ª semana": [
    ["Segunda", 2, "Farofa com carne, ovos e couve", "Suco"],
    ["Terça",   3, "Feijoada light e arroz", "Laranja"],
    ["Quarta",  6, "Arroz doce", "—"],
    ["Quinta",  4, "Sopa de mandioca com frango e arroz", "Fruta"],
    ["Sexta",   1, "Arroz à grega com frango", "Fruta"]],
  "4ª semana": [
    ["Segunda", 3, "Feijão maravilha", "—"],
    ["Terça",   1, "Arroz com pernil e legumes", "Fruta"],
    ["Quarta",  4, "Mingau/bambá de couve com carne", "—"],
    ["Quinta",  2, "Estrogonofe de frango e arroz", "—"],
    ["Sexta",   2, "Macarrão ao molho de frango com feijão", "—"]],
  "5ª semana": [
    ["Segunda", 2, "Mexidão", "—"],
    ["Terça",   2, "Macarrão temperado", "—"],
    ["Quarta",  1, "Arroz com carne bovina desfiada e legumes", "Fruta"],
    ["Quinta",  2, "Farofão de arroz com banana, ovos e carne", "Suco"],
    ["Sexta",   2, "Molho de carne e hortaliças com arroz e feijão", "—"]]
};
const dicas = ["Sirva só o que vai comer. Repetir é permitido.", "Experimente um pouco de tudo antes de colocar mais.", "Legumes e verduras trazem vitaminas e fibras: dê uma chance.", "Sobras no prato viram lixo. Prato limpo, menos desperdício.", "Mastigue devagar: fica mais fácil perceber quando está satisfeito."];

function mostrarSemana(nome) {
  $("corpo").innerHTML = "";
  cardapio[nome].forEach((linha, i) => {
    const tr = document.createElement("tr");
    const [dia, grupo, prato, extra] = linha;
    tr.innerHTML = `<td>${dia}</td><td>${prato}</td>`
      + `<td><span class="grupo g${grupo}" title="${GRUPOS[grupo]}">Grupo ${grupo}</span></td><td>${extra}</td>`;
    const dica = () => $("dica").textContent = "Dica: " + dicas[i % dicas.length];
    tr.addEventListener("mouseenter", dica);
    tr.addEventListener("click", dica);   // toque no celular
    $("corpo").appendChild(tr);
  });
  $("abas").querySelectorAll("button").forEach(b => b.classList.toggle("ativa", b.textContent === nome));
}
Object.keys(cardapio).forEach(nome => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = nome;
  b.addEventListener("click", () => mostrarSemana(nome));
  $("abas").appendChild(b);
});
mostrarSemana("1ª semana");

/* ===== 4b. Fotos do cardápio: clique para ampliar ===== */
const ampliada = $("ampliada");
document.querySelectorAll(".foto").forEach(b => b.addEventListener("click", () => {
  $("ampliadaImg").src = b.dataset.src;
  $("ampliadaImg").alt = b.dataset.alt;
  $("ampliadaLegenda").textContent = b.dataset.alt;
  ampliada.showModal();
}));
$("ampliadaFechar").addEventListener("click", () => ampliada.close());
ampliada.addEventListener("click", e => { if (e.target === ampliada) ampliada.close(); });   // clique fora fecha

/* ===== 5. Notícias que se atualizam sozinhas =====
   Busca o Google Notícias (RSS) separadamente para cada tema, pega as mais recentes e renova a cada 5 minutos.
   Se der erro (sem internet, limite do serviço), mostra as notícias salvas do tema escolhido. */
const TEMAS = {   // aspas = frase exata, para trazer só o que é do tema
  "Desperdício de alimentos": '"desperdício de alimentos"',
  "Merenda escolar": '"merenda escolar" desperdício',
  "Desperdício de água": '"desperdício de água"',
  "Desperdício de energia": '"desperdício de energia"',
  "Consumo consciente": '"consumo consciente"'
};
const RENOVA_MS = 5 * 60 * 1000;           // renova sozinho a cada 5 minutos
const RESERVA = {   // notícias salvas, por tema, usadas só se a busca falhar (edite à vontade)
  "Desperdício de alimentos": [
    { title: "Campanha #FazAXepa pede engajamento para reduzir o desperdício de comida", link: "https://www.correiodamanha.com.br/nacional/2026/10/324143-campanha-busca-engajamento-para-reduzir-desperdicio-de-comida.html", fonte: "Correio da Manhã", data: "2026-10-05" },
    { title: "Desperdício global de alimentos pode chegar a US$ 540 bilhões em 2026", link: "https://www.cnnbrasil.com.br/agro/desperdicio-global-de-alimentos-pode-atingir-us-540-bilhoes-em-2026/", fonte: "CNN Brasil", data: "2026-04-02" },
    { title: "O que a Copa de 2026 revelou sobre o desperdício de alimentos", link: "https://jornaldobras.com.br/noticia/139234/muito-alem-dos-grandes-eventos-o-que-a-copa-do-mundo-de-2026-revelou-sobre-o-desperdicio-de-alimentos", fonte: "Jornal do Brás" }
  ],
  "Merenda escolar": [
    { title: "Plataforma do Banco do Brasil reduz desperdício de merenda em escolas públicas", link: "https://acritica.net/noticias/plataforma-bb-reduz-desperdicio-merenda-escolas-publicas/", fonte: "A Crítica" },
    { title: "Alunos refletem sobre consumo consciente e combate ao desperdício", link: "https://prefeitura.pbh.gov.br/noticias/alunos-refletem-sobre-consumo-consciente-e-combate-ao-desperdicio", fonte: "Prefeitura de Belo Horizonte" }
  ],
  "Desperdício de água": [
    { title: "Desperdício de água no Brasil poderia abastecer 77 milhões de pessoas", link: "https://www.cnnbrasil.com.br/nacional/brasil/total-de-desperdicio-de-agua-no-brasil-poderia-abastecer-77-milhoes/", fonte: "CNN Brasil" },
    { title: "Trata Brasil alerta: país perde cerca de 39% da água tratada", link: "https://www.portaltela.com/noticias/ciencia/2026/06/02/alerta-do-trata-brasil-captacao-de-agua-nos-rios-esta-40-acima-do-ideal/", fonte: "Portal Tela", data: "2026-06-02" },
    { title: "Governo federal sanciona lei com medidas contra desperdício de água", link: "https://tribunaonline.com.br/_/137694", fonte: "A Tribuna" }
  ],
  "Desperdício de energia": [
    { title: "Cortar o desperdício de energia em casa pode gerar economia bilionária até 2050", link: "https://olhardigital.com.br/curiosidades/?p=19459", fonte: "Olhar Digital", data: "2026-09-02" },
    { title: "Desperdício de energia custa R$ 61,7 bilhões ao ano no Brasil, aponta ABESCO", link: "https://cenarioenergia.com.br/tag/abesco/", fonte: "Cenário Energia" },
    { title: "Brasil desperdiça 20,6% da energia limpa e perde R$ 6 bilhões em 2025", link: "https://movimentoeconomico.com.br/tag/habitos-de-consumo-de-energia/", fonte: "Movimento Econômico" }
  ],
  "Consumo consciente": [
    { title: "Consumo consciente: como gastar melhor e preservar o meio ambiente", link: "https://www.bnews.com.br/noticias/meio-ambiente/consumo-consciente-como-gastar-melhor-e-preservar-o-meio-ambiente.html", fonte: "BNews", data: "2026-06-15" },
    { title: "Relatório global aponta consumo mais consciente e estratégico", link: "https://gironews.com/food-service/relatorio-global-aponta-tendencia-de-consumo-mais-consciente-e-estrategica-neste-ano/", fonte: "Giro News", data: "2026-01-22" }
  ]
};
let temaAtual = Object.keys(TEMAS)[0];
let ultimaAtualizacao = 0, buscaId = 0;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function paraData(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  const dt = /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T12:00:00")
    : /^\d{4}-\d{2}-\d{2}/.test(d) ? new Date(d.replace(" ", "T") + (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? "" : "Z"))
    : new Date(d);
  return isNaN(dt) ? null : dt;
}
function quando(dt) {   // "há 12 min", "há 3 h", "há 2 dias" ou a data
  const min = Math.floor((Date.now() - dt) / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.floor(min / 60)} h`;
  if (min < 10080) { const d = Math.floor(min / 1440); return `há ${d} ${d === 1 ? "dia" : "dias"}`; }
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
function cartoes(itens) {
  $("listaNoticias").innerHTML = itens.map(n => {
    const dt = paraData(n.data);
    return `
    <article data-tilt>
      ${dt ? `<time datetime="${dt.toISOString()}" title="${esc(dt.toLocaleString("pt-BR"))}">${quando(dt)}</time>` : ""}
      <h3><a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.title)}</a></h3>
      <span class="fonte">${esc(n.fonte)}</span>
    </article>`;
  }).join("");
  $("listaNoticias").querySelectorAll("[data-tilt]").forEach(inclinar);
}
/* "há 12 min" se atualiza sozinho a cada minuto */
setInterval(() => document.querySelectorAll("#listaNoticias time[datetime]").forEach(t => t.textContent = quando(new Date(t.getAttribute("datetime")))), 60000);

/* Lê o RSS: os 3 caminhos são tentados AO MESMO TEMPO e vale o que responder primeiro (limite de 6 s) */
function lerXml(txt) {
  const d = new DOMParser().parseFromString(txt, "text/xml");
  const itens = [...d.querySelectorAll("item")].map(i => ({ title: i.querySelector("title")?.textContent || "", link: i.querySelector("link")?.textContent || "", data: i.querySelector("pubDate")?.textContent || "" }));
  if (!itens.length) throw new Error("vazio");
  return itens;
}
const CAMINHOS = [
  (url, signal) => fetch("https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(url), { signal }).then(r => r.json())
    .then(j => { if (!j.items || !j.items.length) throw new Error("vazio"); return j.items.map(i => ({ title: i.title, link: i.link, data: i.pubDate })); }),
  (url, signal) => fetch("https://api.allorigins.win/raw?url=" + encodeURIComponent(url), { signal }).then(r => r.text()).then(lerXml),
  (url, signal) => fetch("https://corsproxy.io/?" + encodeURIComponent(url), { signal }).then(r => r.text()).then(lerXml)
];
function comLimite(fn, ms) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  return fn(c.signal).finally(() => clearTimeout(t));
}
const buscarRss = url => Promise.any(CAMINHOS.map(c => comLimite(sig => c(url, sig), 6000)));

function organizar(itens) {
  const vistos = new Set();
  return itens.map(i => {
    const p = i.title.lastIndexOf(" - ");   // o Google coloca " - Fonte" no fim do título
    return { title: p > 0 ? i.title.slice(0, p) : i.title, fonte: p > 0 ? i.title.slice(p + 3) : "Google Notícias", link: i.link, data: paraData(i.data) };
  }).filter(n => n.title && n.link && n.data && !vistos.has(n.title.toLowerCase()) && vistos.add(n.title.toLowerCase()))
    .sort((a, b) => b.data - a.data).slice(0, 6);
}
const urlRss = (tema, janela) => "https://news.google.com/rss/search?q=" + encodeURIComponent(TEMAS[tema] + " when:" + janela) + "&hl=pt-BR&gl=BR&ceid=BR:pt-419";
async function buscarTema(tema) {
  let lista = [];
  try { lista = organizar(await buscarRss(urlRss(tema, "30d"))); } catch (e) {}
  if (lista.length < 3) {   // poucas notícias no último mês: amplia a janela
    try { lista = organizar(await buscarRss(urlRss(tema, "180d"))); } catch (e) { if (!lista.length) throw e; }
  }
  if (!lista.length) throw new Error("vazio");
  return lista;
}

/* Cópia guardada no navegador: ao abrir ou trocar de tema, a última lista aparece na hora */
const lerCache = tema => { try { return JSON.parse(localStorage.getItem("noticias:" + tema)); } catch (e) { return null; } };
const salvarCache = (tema, itens) => { try { localStorage.setItem("noticias:" + tema, JSON.stringify({ itens })); } catch (e) {} };

async function carregarNoticias(silencioso = false) {
  const id = ++buscaId, tema = temaAtual;
  if (!silencioso) { const c = lerCache(tema); cartoes(c && c.itens && c.itens.length ? c.itens : RESERVA[tema]); }   // aparece na hora
  $("statusNoticias").textContent = "Buscando notícias novas...";
  try {
    const itens = await buscarTema(tema);
    salvarCache(tema, itens);
    if (id !== buscaId) return;   // o aluno já trocou de tema
    cartoes(itens);
    ultimaAtualizacao = Date.now();
    $("statusNoticias").textContent = "Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) + ". Renova sozinho a cada 5 minutos.";
  } catch (e) {
    if (id !== buscaId) return;
    $("statusNoticias").textContent = "Não foi possível buscar notícias novas agora. Mostrando as últimas salvas.";
  }
}

Object.keys(TEMAS).forEach(t => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = t;
  b.addEventListener("click", () => { temaAtual = t; document.querySelectorAll("#temas button").forEach(x => x.classList.toggle("ativa", x === b)); carregarNoticias(); });
  if (t === temaAtual) b.classList.add("ativa");
  $("temas").appendChild(b);
});
$("recarregar").addEventListener("click", () => carregarNoticias());
carregarNoticias();
setInterval(() => carregarNoticias(true), RENOVA_MS);   // renova sozinho a cada 5 minutos
document.addEventListener("visibilitychange", () => { if (!document.hidden && Date.now() - ultimaAtualizacao > RENOVA_MS) carregarNoticias(true); });


/* ===== 6. Brilho que segue o mouse nos cartões (usado pelo CSS no hover) ===== */
document.addEventListener("mousemove", e => {
  const el = e.target.closest("details, .caixa, .passos li, .noticias article, .cta, .quest");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", (e.clientX - r.left) + "px");
  el.style.setProperty("--my", (e.clientY - r.top) + "px");
});


/* ===== 7. NOVAS ÁREAS: água, tempo e energia ===== */

/* Rede "Tudo está ligado": clique nos círculos */
const REDE = {
  alimento: ["Alimento", "Uma refeição envolve alimento, água, tempo e energia. Quando sobra no prato, desperdiçamos esses recursos e o alimento que poderia ajudar outras pessoas.", "var(--verde-vivo)"],
  agua: ["Água", "Irriga a plantação, lava, cozinha e limpa. Alimento jogado fora desperdiça a água usada para produzi-lo.", "var(--agua)"],
  tempo: ["Tempo", "É o trabalho de quem planta, colhe, transporta e cozinha. Desperdiçar comida é desperdiçar essas horas.", "var(--tempo)"],
  energia: ["Energia", "Move tratores, caminhões, geladeiras e fogões. Comida no lixo ainda gera metano ao se decompor.", "var(--energia)"]
};
function rede(k) {
  document.querySelectorAll(".no").forEach(n => n.classList.toggle("ativo", n.dataset.k === k));
  document.querySelectorAll(".elos line").forEach(l => l.classList.toggle("vivo", l.dataset.p.split("-").includes(k)));
  $("redeInfo").style.setProperty("--c", REDE[k][2]);
  $("redeInfo").innerHTML = `<h3>${REDE[k][0]}</h3><p>${REDE[k][1]}</p>`;
}
document.querySelectorAll(".no").forEach(n => {
  const f = () => rede(n.dataset.k);
  n.addEventListener("click", f);
  n.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); f(); } });
});
rede("alimento");

/* Calculadora: litros de água por kg de alimento (valores médios aproximados) */
const AGUA_KG = [["Carne bovina", 15400], ["Frango", 4300], ["Ovo", 3300], ["Feijão", 4000], ["Arroz", 2500], ["Pão (trigo)", 1600], ["Banana", 790], ["Hortaliças", 300]];
AGUA_KG.forEach(([n], i) => $("alim").add(new Option(n, i)));
function calcular() {
  const g = +$("gramas").value, l = Math.round(AGUA_KG[$("alim").value][1] * g / 1000);
  $("gOut").textContent = g + " g";
  $("calcRes").textContent = `≈ ${l.toLocaleString("pt-BR")} litros de água, o equivalente a ${Math.max(1, Math.round(l / 45))} banho(s) de 5 minutos.`;
}
$("alim").addEventListener("change", calcular);
$("gramas").addEventListener("input", calcular);
calcular();

const entendendoDialog = $("entendendoDialog");
$("abrirEntendendo").addEventListener("click", () => entendendoDialog.showModal());
$("fecharEntendendo").addEventListener("click", () => entendendoDialog.close());
entendendoDialog.addEventListener("click", e => {
  if (e.target === entendendoDialog) entendendoDialog.close();
});

/* Água: tanque que enche com os dias da torneira pingando (~40 L por dia) */
function tanque() {
  const d = +$("dias").value;
  $("diasOut").textContent = d + (d === 1 ? " dia" : " dias");
  $("litros").textContent = (d * 40).toLocaleString("pt-BR") + " L";
  $("nivel").style.height = (d / 30 * 100) + "%";
}
$("dias").addEventListener("input", tanque);
tanque();

/* Água: ondas na tela seguem o mouse */
(function () {
  const sec = $("agua"), cv = $("ondas"), c = cv.getContext("2d");
  let rs = [];
  const tam = () => { cv.width = sec.clientWidth; cv.height = sec.clientHeight; };
  tam(); addEventListener("resize", tam);
  sec.addEventListener("pointermove", e => {
    const r = sec.getBoundingClientRect();
    if (Math.random() < .2) rs.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0 });
  });
  (function anima() {
    c.clearRect(0, 0, cv.width, cv.height);
    rs = rs.filter(o => o.r < 90);
    rs.forEach(o => { o.r += 1.2; c.beginPath(); c.arc(o.x, o.y, o.r, 0, 7); c.strokeStyle = `rgba(76,201,240,${1 - o.r / 90})`; c.lineWidth = 2; c.stroke(); });
    requestAnimationFrame(anima);
  })();
})();

/* Tempo: ponteiro do relógio gira a cada etapa da produção */
const ETAPAS = [
  ["Plantar e cuidar", "Semanas ou meses de trabalho: preparar a terra, semear, regar e cuidar contra pragas."],
  ["Colher", "Muitas vezes feita à mão e sob sol forte. Colher na hora certa exige experiência."],
  ["Transportar", "Horas de estrada em caminhões até o mercado e até a escola."],
  ["Cozinhar", "As merendeiras começam cedo: lavar, cortar, temperar, cozinhar e servir no horário."],
  ["Servir", "Em poucos minutos o prato é servido. Tudo o que veio antes cabe nesse momento."]
];
function etapa(i) {
  $("ponteiro").style.transform = `rotate(${i * 72}deg)`;
  $("etapaTxt").textContent = ETAPAS[i][1];
  [...$("etapas").children].forEach((b, j) => b.classList.toggle("ativa", i === j));
}
ETAPAS.forEach(([n], i) => {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = n;
  b.addEventListener("click", () => etapa(i));
  b.addEventListener("mouseenter", () => etapa(i));
  $("etapas").appendChild(b);
});
etapa(0);

/* Energia: lâmpada liga e desliga e conta o tempo acesa */
let acesaDesde = 0, relogioLuz;
$("lampada").addEventListener("click", () => {
  const liga = $("lampada").getAttribute("aria-pressed") !== "true";
  $("lampada").setAttribute("aria-pressed", liga);
  $("energia").classList.toggle("ligada", liga);
  clearInterval(relogioLuz);
  if (!liga) { $("lampTxt").textContent = "Apagada! Energia economizada."; return; }
  acesaDesde = Date.now();
  const t = () => $("lampTxt").textContent = `Acesa há ${Math.round((Date.now() - acesaDesde) / 1000)} s. Se ninguém está usando, é energia jogada fora. Clique para apagar.`;
  t(); relogioLuz = setInterval(t, 1000);
});

/* Rastro de luz que muda de cor conforme a área (água, tempo, energia) */
let ultimoRastro = 0;
document.addEventListener("mousemove", e => {
  if (Date.now() - ultimoRastro < 60) return;
  ultimoRastro = Date.now();
  const t = e.target.closest(".tema"), d = document.createElement("i");
  d.className = "rastro";
  d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
  d.style.background = t ? getComputedStyle(t).getPropertyValue("--cor") : "#f4e4a0";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 700);
});


/* ===== 8. Resultados da pesquisa (Google Forms, 67 respostas) =====
   Cada alternativa tem [texto, número de respostas]. As porcentagens são calculadas a partir de TOTAL.
   Para atualizar a pesquisa, edite só os números abaixo. */
const TOTAL = 67;
const CORES = ["#5fc287", "#8dbaf2", "#ecd987", "#f08a7e"];   // verde, azul, amarelo, coral (a cor de cada alternativa)
const PERGUNTAS = [
  { q: "Você costuma consumir a alimentação oferecida pela escola?", o: [["Sempre", 25], ["Frequentemente", 15], ["Às vezes", 15], ["Raramente", 12]] },
  { q: "Quando pega a alimentação escolar, costuma comer tudo o que recebeu?", o: [["Sempre", 31], ["Na maioria das vezes", 28], ["Às vezes", 3], ["Raramente", 5]] },
  { q: "Quando sobra comida no seu prato, normalmente sobra:", o: [["Muito", 3], ["Uma quantidade média", 8], ["Pouco", 42], ["Nada", 14]] },
  { q: "Qual é o principal motivo para deixar comida no prato?", o: [["Não gosto do alimento", 12], ["A quantidade é maior do que consigo comer", 17], ["Não gosto do gosto", 17], ["Falta de tempo para comer", 21]] },
  { q: "Você acha que existe desperdício de alimentos na nossa escola?", o: [["Muito", 49], ["Razoável", 14], ["Pouco", 3], ["Não sei", 1]] },
  { q: "Onde você percebe maior desperdício de alimentos?", o: [["Nos pratos dos alunos", 66], ["Durante o preparo", 0], ["Os alimentos que não são utilizados", 1], ["No armazenamento", 0]] },
  { q: "Você sabe o que acontece com as sobras da alimentação escolar?", o: [["Sim, sei exatamente", 4], ["Tenho uma ideia", 13], ["Não tenho certeza", 19], ["Não sei", 31]] },
  { q: "Você considera o desperdício de alimentos um problema ambiental?", o: [["Sim", 42], ["Não", 1], ["Talvez", 18], ["Não sei", 6]] },
  { q: "Antes deste projeto, você já havia pensado que, ao jogar comida fora, também são desperdiçados água, energia, trabalho e outros recursos?", o: [["Sim, já tinha pensado nisso", 30], ["Não, nunca tinha pensado", 13], ["Já tinha pensado um pouco", 20], ["Não tenho certeza", 4]] },
  { q: "Você acredita que os próprios estudantes podem ajudar a diminuir o desperdício?", o: [["Sim, com certeza", 45], ["Sim, em parte", 20], ["Talvez", 2], ["Não", 0]] },
  { q: "Qual ação você considera mais eficiente para diminuir o desperdício?", o: [["Servir porções menores e permitir repetir", 35], ["Fazer campanhas de conscientização", 11], ["Melhorar o planejamento das quantidades", 11], ["Conhecer melhor o cardápio", 10]] },
  { q: "Você participaria de uma campanha contra o desperdício de alimentos na escola?", o: [["Sim", 20], ["Talvez", 27], ["Não", 16], ["Não tenho certeza", 4]] },
  { q: "Qual tipo de alimento oferecido pela escola costuma ter maior aceitação?", o: [["Arroz e feijão", 10], ["Carnes ou proteínas", 36], ["Massas e preparações semelhantes", 12], ["Frutas e sobremesas", 9]] },
  { q: "Qual tipo de alimento você percebe que costuma gerar mais sobras?", o: [["Arroz e feijão", 48], ["Carnes e proteínas", 4], ["Saladas e verduras", 12], ["Frutas e sobremesas", 3]] },
  { q: "Qual atitude você considera mais importante para diminuir o desperdício de alimentos na escola?", o: [["Colocar no prato somente o que pretender comer", 37], ["Evitar pegar alimentos de que não gosta", 17], ["Incentivar campanhas contra o desperdício", 9], ["Aproveitar melhor os alimentos disponíveis", 4]] }
];
const pct = n => { const v = (n / TOTAL * 100).toFixed(1).replace(".", ","); return (v.endsWith(",0") ? v.slice(0, -2) : v) + "%"; };

$("listaPesquisa").innerHTML = PERGUNTAS.map((p, i) => {
  const top = p.o.reduce((a, b) => b[1] > a[1] ? b : a);
  return `
    <article class="quest">
      <header><span class="num">${i + 1}</span><h3>${p.q}</h3></header>
      <ul class="barras">${p.o.map(([t, n], k) => `
        <li><div class="rotulo"><span>${t}</span><strong>${pct(n)}</strong></div>
        <div class="trilho"><div class="preench" style="--w:${n / TOTAL * 100}%;--cor:${CORES[k]}"></div></div></li>`).join("")}
      </ul>
      <footer><span class="nota">Mais votada: <strong>${top[0]}</strong></span>
        <button class="btn btn-claro btn-pequeno" type="button" data-q="${i}">Ver gráfico</button></footer>
    </article>`;
}).join("");

/* Abre a janela com o gráfico de pizza (rosca) da pergunta escolhida */
function abrirGrafico(i) {
  const p = PERGUNTAS[i], R = 70, C = 2 * Math.PI * R;
  let acc = 0;
  const fatiasPizza = p.o.map(([t, n], k) => {
    const len = n / TOTAL * C;
    const el = n ? `<circle cx="100" cy="100" r="${R}" fill="none" stroke="${CORES[k]}" stroke-width="38" stroke-dasharray="${len - 1.5} ${C}" stroke-dashoffset="${-acc}" transform="rotate(-90 100 100)"/>` : "";
    acc += len;
    return el;
  }).join("");
  $("gmTitulo").textContent = `${i + 1}. ${p.q}`;
  $("gmDonut").innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="Gráfico de pizza da pergunta ${i + 1}">${fatiasPizza}
    <text x="100" y="99" text-anchor="middle" class="gm-total">${TOTAL}</text><text x="100" y="117" text-anchor="middle" class="gm-sub">respostas</text></svg>`;
  $("gmLegenda").innerHTML = p.o.map(([t, n], k) =>
    `<li><span class="ponto" style="background:${CORES[k]}"></span><span class="gm-rot">${t}</span><strong>${pct(n)}</strong><small>${n} ${n === 1 ? "resposta" : "respostas"}</small></li>`).join("");
  $("graficoModal").showModal();
}
$("listaPesquisa").addEventListener("click", e => { const b = e.target.closest("[data-q]"); if (b) abrirGrafico(+b.dataset.q); });
$("gmFechar").addEventListener("click", () => $("graficoModal").close());
$("graficoModal").addEventListener("click", e => { if (e.target === $("graficoModal")) $("graficoModal").close(); });
