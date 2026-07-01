(function(){
  function completed(){return window.Tinter&&Array.isArray(Tinter.answers)&&window.TINTER_PAIRS&&Tinter.answers.length>=TINTER_PAIRS.length}
  function setCompleteButton(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.classList.add('tinter-complete');
    btn.innerHTML='<span class="tinter-complete-check" aria-hidden="true">✓</span><span class="tinter-complete-copy">tinter results will influence palette</span>';
    btn.setAttribute('aria-label','Tinter results will influence palette');
  }
  function resetButton(){
    const btn=document.querySelector('#tinterOpen');
    if(!btn)return;
    btn.classList.remove('tinter-complete');
  }
  function patchTinter(){
    if(!window.Tinter||Tinter.__completePatched)return;
    const baseClose=Tinter.close;
    const baseOpen=Tinter.open;
    Tinter.close=function(){
      const done=completed();
      const r=baseClose.apply(this,arguments);
      if(done)setCompleteButton();
      return r;
    };
    Tinter.open=function(){resetButton();return baseOpen.apply(this,arguments)};
    Tinter.__completePatched=true;
  }
  function patchReset(){
    const baseClear=window.clearTruePaletteQuiz;
    if(baseClear&&!baseClear.__tinterCompletePatched){
      window.clearTruePaletteQuiz=function(){const r=baseClear.apply(this,arguments);resetButton();return r};
      window.clearTruePaletteQuiz.__tinterCompletePatched=true;
    }
  }
  function watchSummary(){
    const modal=document.querySelector('#tinterModal');
    if(!modal||modal.__tinterCompleteObserver)return;
    new MutationObserver(()=>{
      const summary=document.querySelector('#tinterSummary');
      if(summary&&/Tinter analysis complete/i.test(summary.textContent)){
        summary.innerHTML='<b>✓ Tinter analysis complete.</b><p>Tinter results will influence your palette.</p>';
      }
    }).observe(modal,{childList:true,subtree:true,characterData:true});
    modal.__tinterCompleteObserver=true;
  }
  function install(){patchTinter();patchReset();watchSummary()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.addEventListener('load',install);
})();
