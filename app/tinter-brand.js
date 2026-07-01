(function(){
  function brandTinter(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.innerHTML='<span class="tinter-mark">🧣</span><span class="tinter-word">tinter</span>';
    btn.setAttribute('aria-label','Open Tinter');
    btn.classList.add('tinter-entry','tinter-wordmark');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',brandTinter);else brandTinter();
  const oldInit=window.Tinter&&Tinter.init;
  if(oldInit){Tinter.init=function(){oldInit.apply(this,arguments);brandTinter()}}
})();
