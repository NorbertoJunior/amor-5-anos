// ========= CONFIG =========
const START_DATE_ISO = "2020-10-17";
const AUDIO_URL = "assets/audio/i_wanna_be_yours.mp3";

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
const floatingPlayer = document.getElementById('floatingPlayer');

const backToTop = document.getElementById('backToTop');

// ========= CONTAGEM =========
(function updateDaysCounter(){
  const start = new Date(START_DATE_ISO+"T00:00:00");
  const today = new Date();
  const diff = Math.floor((today - start) / (1000*60*60*24));
  daysCountEl.textContent = diff.toLocaleString('pt-BR');
})();

// ========= ÁUDIO =========
function setBtnIcons(){
  const playing = !bgAudio.paused;
  btnPlay && (btnPlay.textContent = playing ? "⏸️ Pausar música" : "▶️ Tocar música");
  floatingPlayer.textContent = playing ? "⏸️" : "▶️";
}

function fadeIn(audio, ms=2000){
  audio.volume = 0;
  const step = 60, inc = step / ms;
  const t = setInterval(()=>{
    if(audio.volume < 1){ audio.volume = Math.min(1, audio.volume + inc); }
    else clearInterval(t);
  }, step);
}

async function tryPlay(){
  try{
    await bgAudio.play();
    fadeIn(bgAudio, 1200);
  }catch(e){ /* mobile bloqueia autoplay até gesto */ }
  setBtnIcons();
}

function toggleAudio(){
  if(bgAudio.paused) { bgAudio.play(); fadeIn(bgAudio, 800); }
  else bgAudio.pause();
  setBtnIcons();
}

btnPlay?.addEventListener('click', toggleAudio);
floatingPlayer?.addEventListener('click', toggleAudio);

// tenta iniciar quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
  // garante src
  if(!bgAudio.querySelector('source')) {
    const s = document.createElement('source'); s.src = AUDIO_URL; s.type="audio/mpeg";
    bgAudio.appendChild(s);
  }
  tryPlay();
});

// ========= VOLTAR TOPO =========
window.addEventListener('scroll', ()=>{
  backToTop.style.display = window.scrollY > 420 ? 'flex' : 'none';
});
backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// ========= REVEAL ON SCROLL (5 anos) =========
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('visible');
  })
},{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

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

btnStart.addEventListener('click', () => {
  hero.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true;
  quiz.hidden = false;
  startQuiz();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
btnNext.addEventListener('click', () => { if (!hasAnswered) return; idx++; (idx < questions.length) ? renderQuestion() : finishQuiz(); });
btnRetry?.addEventListener('click', () => { resetQuiz(); hero.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true; quiz.hidden = false; renderQuestion(); window.scrollTo({top:0,behavior:'smooth'}); });
btnVoltarInicio?.addEventListener('click', () => { resetQuiz(); quiz.hidden = true; result.hidden = true; dedic.hidden = true; capsula.hidden = true; hero.hidden = false; window.scrollTo({top:0,behavior:'smooth'}); });
btnRever?.addEventListener('click', () => { resetQuiz(); dedic.hidden = true; capsula.hidden = true; hero.hidden = false; window.scrollTo({top:0,behavior:'smooth'}); });

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
  else { btnEl.classList.add('incorrect'); [...optionsEl.children][questions[idx].correctIndex].classList.add('correct'); feedback.textContent = "Quase! A correta está marcada em verde. 😉"; }
}
function finishQuiz(){
  progressBar.style.width = "100%";
  quiz.hidden = true;
  (correctCount === questions.length) ? (confettiPop(), dedic.hidden = false) : (result.hidden = false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========= DEDICATÓRIA MINI GALERIA =========
(function buildDedicatoria(){
  const gal = document.getElementById('galeriaDedicatoria');
  const base = ["1","2","3","4","5"];
  gal.innerHTML = "";
  base.forEach((name, index) => {
    const img = document.createElement('img');
    img.alt = `Norberto & Letícia — foto ${index+1}`;
    attachSmartSrc(img, `assets/fotos/${name}`);
    gal.appendChild(img);
  });
})();

// ========= CÁPSULA (com legendas corrigidas) =========
const capsulaItems = [
  {img:"Viagem1", badge:"Cowboys da Pizza — Penha"},
  {img:"Viagem2", badge:"Passeio de bug — Penha"},
  {img:"Viagem3", badge:"Cristo — RJ"},
  {img:"Viagem4", badge:"Rock in Rio"},
  {img:"Viagem5", badge:"Serra Dourada — Goiânia"},
  {img:"Viagem6", badge:"Emapa — Avaré"}
];
(function buildCapsula(){
  const grid = document.getElementById('capsulaGrid');
  grid.innerHTML = "";
  capsulaItems.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'card-photo reveal';
    const img = document.createElement('img');
    attachSmartSrc(img, `assets/fotos/${item.img}`);
    wrap.appendChild(img);

    const badge = document.createElement('div');
    badge.className = 'photo-badge';
    badge.textContent = item.badge;
    wrap.appendChild(badge);

    grid.appendChild(wrap);
    observer.observe(wrap);
  });
})();

// navegação dedicatória <-> cápsula
btnCapsula?.addEventListener('click', () => { dedic.hidden = true; capsula.hidden = false; window.scrollTo({top:0,behavior:'smooth'}); });
btnVoltarDedicatoria?.addEventListener('click', () => { capsula.hidden = true; dedic.hidden = false; window.scrollTo({top:0,behavior:'smooth'}); });

// ========= UTILS =========
function attachSmartSrc(imgEl, basePath){
  const exts = ['jpeg','jpg','png','webp'];
  let i = 0;
  function tryNext(){
    if (i >= exts.length) { imgEl.alt = "Imagem não encontrada"; imgEl.style.opacity = .6; return; }
    imgEl.src = `${basePath}.${exts[i++]}`;
  }
  imgEl.addEventListener('error', tryNext);
  tryNext();
}

// confetti simples
function confettiPop(){
  const emojis = ["🎉","✨","💖","💫","🎊","🥳"];
  for(let i=0;i<24;i++){
    const s = document.createElement('div');
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    s.style.position = 'fixed';
    s.style.left = Math.random()*100+"%";
    s.style.top = "-10px";
    s.style.fontSize = (20 + Math.random()*14)+"px";
    s.style.animation = `fall ${2+Math.random()*1.5}s linear forwards`;
    s.style.pointerEvents = "none";
    s.style.zIndex = 80;
    document.body.appendChild(s);
    setTimeout(()=>s.remove(), 3500);
  }
}
const style = document.createElement('style');
style.textContent = `@keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity:.9 } }`;
document.head.appendChild(style);
