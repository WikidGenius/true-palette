(function(){
  'use strict';

  const q=selector=>document.querySelector(selector);
  let lockedScrollY=0;

  function syncViewport(){
    const height=window.visualViewport?.height||window.innerHeight;
    document.documentElement.style.setProperty('--tinter-viewport-height',`${Math.round(height)}px`);
  }

  function lockPage(){
    if(document.body.classList.contains('tinter-active'))return;
    lockedScrollY=window.scrollY;
    syncViewport();
    document.body.classList.add('tinter-active');
    document.body.style.position='fixed';
    document.body.style.top=`-${lockedScrollY}px`;
    document.body.style.left='0';
    document.body.style.right='0';
    document.body.style.width='100%';
  }

  function unlockPage(){
    if(!document.body.classList.contains('tinter-active'))return;
    document.body.classList.remove('tinter-active');
    document.body.style.position='';
    document.body.style.top='';
    document.body.style.left='';
    document.body.style.right='';
    document.body.style.width='';
    window.scrollTo(0,lockedScrollY);
  }

  function installGestureHint(){
    const stage=q('#tinterStage');
    if(!stage||q('#tinterGestureHint'))return;
    const hint=document.createElement('p');
    hint.id='tinterGestureHint';
    hint.className='tinter-gesture-hint';
    hint.textContent='Tap a card or swipe it upward';
    stage.appendChild(hint);

    const prompt=q('#tinterPrompt');
    if(prompt){
      const observer=new MutationObserver(()=>{
        const step=prompt.querySelector('.tinter-step-count')?.textContent||'';
        hint.hidden=!/^1\s+of\s+/i.test(step.trim());
      });
      observer.observe(prompt,{childList:true,subtree:true,characterData:true});
    }
  }

  function install(){
    if(!window.Tinter||Tinter.__immersivePatched)return;
    const modal=q('#tinterModal');
    if(modal){
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.setAttribute('aria-label','Tinter color analysis');
    }

    const baseOpen=Tinter.open.bind(Tinter);
    const baseClose=Tinter.close.bind(Tinter);

    Tinter.open=async function(){
      lockPage();
      try{return await baseOpen()}
      catch(error){unlockPage();throw error}
    };

    Tinter.close=function(){
      const result=baseClose();
      unlockPage();
      return result;
    };

    Tinter.__immersivePatched=true;
    installGestureHint();

    window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});
    window.addEventListener('orientationchange',()=>window.setTimeout(syncViewport,120),{passive:true});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!q('#tinterModal')?.hidden)Tinter.close();
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();