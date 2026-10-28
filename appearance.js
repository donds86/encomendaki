/* Preferência visual local, compartilhada pelas telas deste navegador. */
function savedAppearance(){try{const saved=localStorage.getItem('encomendaki-color-mode');if(saved==='light'||saved==='dark')return saved}catch{}try{return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{return 'light'}}
function applyAppearance(mode){const dark=mode==='dark';document.documentElement.dataset.colorMode=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';const button=document.getElementById('appearance-toggle');if(button){button.textContent=dark?'☀ Tema claro':'☾ Tema escuro';button.setAttribute('aria-pressed',String(dark));button.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');button.title=dark?'Ativar tema claro':'Ativar tema escuro'}}
function toggleAppearance(){const next=document.documentElement.dataset.colorMode==='dark'?'light':'dark';try{localStorage.setItem('encomendaki-color-mode',next)}catch{}applyAppearance(next)}
applyAppearance(savedAppearance());
document.addEventListener('DOMContentLoaded',()=>applyAppearance(document.documentElement.dataset.colorMode));
window.addEventListener('storage',event=>{if(event.key==='encomendaki-color-mode')applyAppearance(savedAppearance())});
