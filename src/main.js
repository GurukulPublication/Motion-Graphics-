import { scenes } from './scenes.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

const ui = {
  play: document.getElementById('play'),
  prev: document.getElementById('prev'),
  next: document.getElementById('next'),
  scene: document.getElementById('scene'),
  scrub: document.getElementById('scrub'),
  loop: document.getElementById('loop'),
};

scenes.forEach((s, i) => {
  s.setup?.(ctx, W, H);
  ui.scene.add(new Option(`${i + 1}. ${s.name}`, i));
});

let index = Number(new URLSearchParams(location.search).get('scene')) || 0;
index = Math.min(Math.max(index, 0), scenes.length - 1);
let time = 0;
let playing = true;
let last = performance.now();

function goTo(i) {
  index = (i + scenes.length) % scenes.length;
  time = 0;
  ui.scene.value = index;
}

function setPlaying(p) {
  playing = p;
  ui.play.textContent = p ? '⏸' : '▶';
}

function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;
  const scene = scenes[index];
  if (playing) {
    time += dt;
    if (time >= scene.duration) {
      if (ui.loop.checked) time = 0;
      else goTo(index + 1);
    }
  }
  const s = scenes[index];
  s.draw(ctx, Math.min(time, s.duration), W, H);
  ui.scrub.value = Math.round((time / s.duration) * 1000);
  requestAnimationFrame(frame);
}

ui.play.onclick = () => setPlaying(!playing);
ui.prev.onclick = () => goTo(index - 1);
ui.next.onclick = () => goTo(index + 1);
ui.scene.onchange = () => goTo(Number(ui.scene.value));
ui.scrub.oninput = () => {
  setPlaying(false);
  time = (ui.scrub.value / 1000) * scenes[index].duration;
};
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  if (e.code === 'ArrowRight') goTo(index + 1);
  if (e.code === 'ArrowLeft') goTo(index - 1);
});

goTo(index);
requestAnimationFrame(frame);
