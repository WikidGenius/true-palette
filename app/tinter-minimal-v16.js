(function(){
  'use strict';

  const q=selector=>document.querySelector(selector);
  const logoHtml=()=>'<span class="tinter-logo-lockup tinter-logo-minimal"><span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span></span>';

  function brandLaunchButton(){
    const button=q('#tinterOpen');
    if(!button)return;
    const apply=()=>{
      if(!button.querySelector('.tinter-logo-minimal')||button.querySelector('.tinter-primary-copy,.tinter-complete-copy,.tinter-complete-check')){
        button.innerHTML=logoHtml();
      }
      button.setAttribute('title',button.classList.contains('tinter-complete')?'Run Tinter again':'Start Tinter');
    };
    apply();
    const observer=new MutationObserver(apply);
    observer.observe(button,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  }

  function brandInterface(){
    const brand=q('.tinter-head>div:first-child');
    if(!brand)return;
    brand.classList.add('tinter-interface-brand');
    brand.innerHTML=logoHtml();
  }

  function quietLightingFeedback(){
    const status=q('#tinterStatus');
    const badge=q('#tinterLightBadge');
    if(!status||!badge)return;
    const sync=()=>{
      const text=status.textContent.trim();
      if(text==='Lighting check passed.'||text==='Checking exposure and color cast…')status.textContent='';
      const quality=badge.dataset.quality||'checking';
      badge.setAttribute('aria-label',quality==='good'?'Lighting looks good':badge.textContent.trim()||'Lighting status');
    };
    const observer=new MutationObserver(sync);
    observer.observe(status,{childList:true,subtree:true,characterData:true});
    observer.observe(badge,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-quality']});
    sync();
  }

  function scrollToResultsAfterCompletion(){
    const tinter=window.Tinter;
    if(!tinter||typeof tinter.close!=='function'||tinter.close.__resultsScrollWrapped)return;
    const original=tinter.close;
    const wrapped=function(){
      const completed=Boolean(tinter.result);
      const result=original.apply(this,arguments);
      if(completed){
        window.setTimeout(()=>{
          const target=q('.report-area');
          if(!target)return;
          const behavior=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
          target.scrollIntoView({behavior,block:'start'});
        },160);
      }
      return result;
    };
    wrapped.__resultsScrollWrapped=true;
    tinter.close=wrapped;
    const closeButton=q('#tinterClose');
    if(closeButton)closeButton.onclick=tinter.close;
  }

  function install(){
    brandLaunchButton();
    brandInterface();
    quietLightingFeedback();
    scrollToResultsAfterCompletion();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
