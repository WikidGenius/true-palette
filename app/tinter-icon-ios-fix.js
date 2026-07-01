(function(){
  function applyTinterIcon(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.innerHTML='<span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span>';
    btn.setAttribute('aria-label','Open Tinter');
    btn.classList.add('tinter-entry','tinter-wordmark');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyTinterIcon);else applyTinterIcon();
  const oldInit=window.Tinter&&Tinter.init;
  if(oldInit){Tinter.init=function(){oldInit.apply(this,arguments);applyTinterIcon()}}
})();
