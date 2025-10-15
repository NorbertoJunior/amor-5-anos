// ========= CONFIG =========
const START_DATE_ISO = "2020-10-17";                   // 17/10/2020
const AUDIO_BASE = "assets/audio/i_wanna_be_yours";    // sem extensão

// ========= QUIZ =========
const questions = [
  { q: "Onde foi que nos conhecemos?", options: ["Praia", "Represa", "Praça", "Shopping"], correctIndex: 1 },
  { q: "Qual foi nosso primeiro date como casal?", options: ["Passeio no Shopping", "Passeio na zona rural", "Passeio no centro", "Passeio no cinema"], correctIndex: 1 },
  { q: "Qual nossa meta de casal?", options: ["Viajar o mundo", "Comprar uma mansão", "Fazer mil filhos", "Comprar uma casa na praia"], correctIndex: 0 },
  { q: "Quem disse eu te amo primeiro?", options: ["Norberto", "Letícia", "Os 2", "Nenhum"], correctIndex: 0 },
  { q: "Qual o nome do nosso futuro melhor jogador do mundo?", options: ["Arthur", "Cristiano", "Theo", "Leticio"], correctIndex: 0 },
  { q: "Qual o nome da nossa futura princesa?", options: ["Aurora", "Josefina", "Lívia", "Norberta"], correctIndex: 2 }
];

let idx = 0, correctCount = 0, hasAnswered = false;

// ========= ELEMENTOS =========
const hero = document.getElementById('section-hero');
const quiz = document.getElementById('section-quiz');
const result = document.getElementById('section-result');
const dedic = document.getElementById('section-dedicatoria');
const capsula = document.getElementById('section-capsula');

const btnStart = document.getElementById('btnStart');
const btnNext = document.getElementById('btnNext');
const btnRetry = document.getElementById('btnRetry');
const btnVoltarInicio = document.getElementById('btnVoltarInicio');
const btnRever = document.getElementById('btnRever');
const btnCapsula = document.getElementById('btnCapsula');
const btnVoltarDedicatoria = document.getElementById('btnVoltarDedicatoria');

const questionText = document.getElementById('questionText');
const optionsEl = document.getElementById('options');
const feedback = document.getElementById('feedback');
const progressText = document.getElementById('progressText');
const progressBar = document.getElementById('progressBar');

const daysCountEl = document.getElementById('daysCount');

const bgAudio = document.getElementById('bgAudio');
const btnPlay = document.getElementById('btnPlay');
const filePicker = document.getElementById('filePicker');
const audioStatus = document.getElementById('audioStatus');

// ========= CONTAGEM DE DIAS =========
(function updateDaysCounter(){
  const start = new Date(START_DATE_ISO + "T00:00:00");
  const today = new Date();
  const diffMs = today - start;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  daysCountEl.textContent = days.toLocaleString('pt-BR');
})();

// ========= UTILS IMAGEM =========
function attachSmartSrc(imgEl, basePath){
  const exts = ['jpeg','jpg','png','webp'];
  let i = 0;
  function tryNext(){
    if (i >= exts.length) { imgEl.alt = "Imagem não encontrada"; imgEl.style.opacity = .5; return; }
    imgEl.src = `${basePath}.${exts[i++]}`;
  }
  imgEl.addEventListener('error', tryNext);
  tryNext();
}

// ========= PLAYER (com diagnóstico + fallback) =========
async function findExistingAudio(base){
  const candidates = [
    {url:`${base}.mp3`, mime:'audio/mpeg'},
    {url:`${base}.m4a`, mime:'audio/mp4'},
    {url:`${base}.ogg`, mime:'audio/ogg'}
  ];
  const failed = [];
  for (const c of candidates){
    try{
      const res = await fetch(c.url, { method:'GET', cache:'no-store' });
      if (res.ok) return c;
      failed.push(`${c.url} [${res.status}]`);
    }catch(e){ failed.push(`${c.url} [erro]`); }
  }
  console.warn("Áudios não encontrados:", failed);
  return null;
}
function setSingleSource(audioEl, url, mime){
  audioEl.innerHTML = "";
  const s = document.createElement('source');
  s.src = url; s.type = mime || "";
  audioEl.appendChild(s);
  audioEl.load();
}
async function initPlayer(){
  if (!bgAudio || !btnPlay) return;
  btnPlay.disabled = true;

  const found = await findExistingAudio(AUDIO_BASE);
  if (!found){
    const msg = "Nenhum arquivo de áudio encontrado em assets/audio/ (mp3/m4a/ogg).";
    audioStatus.textContent = msg;
    btnPlay.textContent = "Tocar música (arquivo não encontrado)";
  } else {
    audioStatus.textContent = `Áudio pronto: ${found.url}`;
    setSingleSource(bgAudio, found.url, found.mime);
    btnPlay.disabled = false;
  }

  btnPlay.addEventListener('click', async () => {
    try {
      if (bgAudio.paused) { await bgAudio.play(); btnPlay.textContent = "⏸️ Pausar música"; }
      else { bgAudio.pause(); btnPlay.textContent = "▶️ Tocar música"; }
    } catch (e) {
      console.error(e);
      alert("Não consegui tocar. Tenta novamente ou usa o botão de selecionar arquivo.");
    }
  });

  // Fallback: escolher arquivo do computador
  filePicker.addEventListener('change', () => {
    const f = filePicker.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setSingleSource(bgAudio, url, f.type || "audio/mpeg");
    audioStatus.textContent = `Áudio pronto (arquivo local): ${f.name}`;
    btnPlay.disabled = false;
    btnPlay.textContent = "▶️ Tocar música";
  });
}
initPlayer();

// ========= FLUXO DO QUIZ =========
btnStart.addEventListener('click', () => {
  hero.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true;
  quiz.hidden = false;
  startQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnNext.addEventListener('click', () => {
  if (!hasAnswered) return;
  idx++;
  if (idx < questions.length) renderQuestion(); else finishQuiz();
});
btnRetry?.addEventListener('click', () => {
  resetQuiz();
  hero.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true;
  quiz.hidden = false;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnVoltarInicio?.addEventListener('click', () => {
  resetQuiz();
  quiz.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true;
  hero.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnRever?.addEventListener('click', () => {
  resetQuiz();
  dedic.hidden = true; capsula.hidden = true; hero.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========= NAVEGAÇÃO CÁPSULA =========
btnCapsula?.addEventListener('click', () => {
  dedic.hidden = true;
  capsula.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnVoltarDedicatoria?.addEventListener('click', () => {
  capsula.hidden = true;
  dedic.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========= FUNÇÕES DO QUIZ =========
function startQuiz(){ idx = 0; correctCount = 0; renderQuestion(); }
function resetQuiz(){ idx = 0; correctCount = 0; hasAnswered = false; btnNext.disabled = true; feedback.textContent = ""; progressBar.style.width = "0%"; }
function renderQuestion(){
  hasAnswered = false; btnNext.disabled = true; feedback.textContent = "";
  const { q, options } = questions[idx];
  questionText.textContent = q;
  progressText.textContent = `Pergunta ${idx + 1} de ${questions.length}`;
  progressBar.style.width = `${(idx / questions.length) * 100}%`;
  optionsEl.innerHTML = "";
  options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(i, btn));
    optionsEl.appendChild(btn);
  });
}
function handleAnswer(selectedIndex, btnEl){
  if (hasAnswered) return;
  hasAnswered = true; btnNext.disabled = false;
  const isCorrect = selectedIndex === questions[idx].correctIndex;
  if (isCorrect){ correctCount++; btnEl.classList.add('correct'); feedback.textContent = "Resposta certa! 💖"; }
  else {
    btnEl.classList.add('incorrect');
    [...optionsEl.children][questions[idx].correctIndex].classList.add('correct');
    feedback.textContent = "Hmm… quase! A correta está marcada em verde. 😉";
  }
}
function finishQuiz(){
  progressBar.style.width = "100%";
  quiz.hidden = true;
  if (correctCount === questions.length) dedic.hidden = false; else result.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========= GALERIA DA DEDICATÓRIA =========
const dedicatoriaBaseNames = ["1","2","3","4","5"];
(function buildDedicatoria(){
  const gal = document.getElementById('galeriaDedicatoria');
  if (!gal) return;
  gal.innerHTML = "";
  dedicatoriaBaseNames.forEach((name, idx) => {
    const img = document.createElement('img');
    img.alt = `Norberto & Letícia — foto ${idx+1}`;
    attachSmartSrc(img, `assets/fotos/${name}`);
    gal.appendChild(img);
  });
})();

// ========= CÁPSULA DO TEMPO =========
const capsulaItems = [
  {img:"Viagem1"},
  {img:"Viagem2"},
  {text:"Aqui temos fotos da nossa viagem pra Penha, onde nos divertimos como duas crianças no Beto Carreiro, pegamos uma prainha, conhecemos o céu pelo planetário de BC e o melhor, comemos muito nos Cowboys da Pizza!"},
  {img:"Viagem3"},
  {text:"Não podia deixar passar nossa ida ao Rio de janeiro, onde vivemos muito em pouco tempo, quem diria hein,  Rock in Rio, Asa delta, Baile de favela no Vidigal e o melhor de todos, Maracanã ver o nosso mengão! (Nosso hein!)."},
  {img:"Viagem4"},
  {text:"Tem também fotos nossa curtindo um joguinho pelo seu país Goias! Onde fizemos compras, comemos muito e nos divertimos como sempre."},
  {img:"Viagem5"},
  {img:"Viagem6"},
  {text:"Pra finalizar, tem foto nossa no nosso país original, Avaré, curtindo uma Emapinha, pois não importa o lugar, o importante é estar com você."}
];
(function buildCapsula(){
  const grid = document.getElementById('capsulaGrid');
  if (!grid) return;
  grid.innerHTML = "";
  capsulaItems.forEach(item => {
    if (item.img){
      const wrap = document.createElement('div');
      wrap.className = 'card-photo';
      const img = document.createElement('img');
      attachSmartSrc(img, `assets/fotos/${item.img}`);
      wrap.appendChild(img);
      grid.appendChild(wrap);
    } else if (item.text){
      const wrap = document.createElement('div');
      wrap.className = 'card-text';
      const p = document.createElement('p');
      p.textContent = item.text;
      wrap.appendChild(p);
      grid.appendChild(wrap);
    }
  });
})();
