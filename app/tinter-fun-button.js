(function(){
  function refreshTinterButton(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.innerHTML='✨ Try Tinter <span class="muted">optional selfie swipe</span>';
    btn.setAttribute('aria-label','Try Tinter, optional selfie swipe');
    btn.classList.add('tinter-entry');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshTinterButton);else refreshTinterButton();
  const oldInit=window.Tinter&&Tinter.init;
  if(oldInit){Tinter.init=function(){oldInit.apply(this,arguments);refreshTinterButton()}}
})();
