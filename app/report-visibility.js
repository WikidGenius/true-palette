(function(){
  function hideReport(){document.body.classList.add('report-waiting');document.body.classList.remove('report-ready')}
  function showReport(){document.body.classList.remove('report-waiting');document.body.classList.add('report-ready')}
  function install(){
    hideReport();
    const baseRender=window.renderReport;
    if(baseRender&&!baseRender.__visibilityWrapped){
      window.renderReport=function(){showReport();return baseRender.apply(this,arguments)};
      window.renderReport.__visibilityWrapped=true;
    }
    const form=document.querySelector('#quiz');
    if(form&&!form.dataset.reportVisibility){form.dataset.reportVisibility='true';form.addEventListener('reset',()=>setTimeout(hideReport,0))}
    const oldClear=window.clearTruePaletteQuiz;
    if(oldClear&&!oldClear.__visibilityWrapped){window.clearTruePaletteQuiz=function(){const r=oldClear.apply(this,arguments);hideReport();return r};window.clearTruePaletteQuiz.__visibilityWrapped=true}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
