(function(){
  const ICON='https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/style/wght400grad0opsz24/24px.svg';
  function apply(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.innerHTML=`<span class="tinter-mark" aria-hidden="true"><img class="tinter-style-icon" src="${ICON}" alt=""></span><span class="tinter-word">tinter</span>`;
    btn.setAttribute('aria-label','Open Tinter');
    btn.classList.add('tinter-entry','tinter-wordmark');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  const oldInit=window.Tinter&&Tinter.init;
  if(oldInit){Tinter.init=function(){oldInit.apply(this,arguments);apply()}}
})();
