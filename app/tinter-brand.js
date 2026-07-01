(function(){
  const STYLER_SVG='https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsrounded/styler/wght400grad0opsz24/24px.svg';
  function brandTinter(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.innerHTML=`<span class="tinter-mark" aria-hidden="true"><img class="tinter-styler-icon" src="${STYLER_SVG}" alt="" onerror="this.replaceWith(document.createTextNode('🧣'))"></span><span class="tinter-word">tinter</span>`;
    btn.setAttribute('aria-label','Open Tinter');
    btn.classList.add('tinter-entry','tinter-wordmark');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',brandTinter);else brandTinter();
  const oldInit=window.Tinter&&Tinter.init;
  if(oldInit){Tinter.init=function(){oldInit.apply(this,arguments);brandTinter()}}
})();
