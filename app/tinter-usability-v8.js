(function(){
  'use strict';

  const q=selector=>document.querySelector(selector);

  function setSettingsOpen(open){
    const panel=q('#tinterBalance');
    const button=q('#tinterSettings');
    const card=q('#tinterCard');
    if(!panel||!button)return;
    panel.hidden=!open;
    button.setAttribute('aria-expanded',String(open));
    button.classList.toggle('is-active',open);
    card?.classList.toggle('settings-open',open);
    const label=button.querySelector('.tinter-settings-label');
    if(label)label.textContent=open?'Done':'Settings';
  }

  function rewritePrompt(){
    const prompt=q('#tinterPrompt');
    if(!prompt||prompt.querySelector('.tinter-question-main'))return;
    const step=prompt.querySelector('.tinter-step-count')?.textContent?.trim()||'';
    const raw=prompt.textContent.replace(step,'').trim();
    const label=(raw.split(':')[0]||'Color comparison').trim();
    prompt.innerHTML=`<span class="tinter-question-label">${label}</span><span class="tinter-question-main">Which color makes your skin look more even and your features look naturally defined?</span>${step?`<span class="tinter-step-count">${step}</span>`:''}<span class="tinter-judge-inline">Look for softer shadows, less redness or grayness, and eyes or lips that stand out without effort.</span>`;
  }

  function ensureRefinementControls(){
    if(typeof window.disableRefinement!=='function'){
      window.disableRefinement=function(){
        const section=q('#refineSection');
        if(section)section.hidden=true;
      };
    }
    if(typeof window.enableRefinement!=='function'){
      window.enableRefinement=function(open=false){
        const section=q('#refineSection');
        const details=q('#refineDetails');
        if(section)section.hidden=false;
        if(details)details.open=Boolean(open);
      };
    }
  }

  function installModalImprovements(){
    const modal=q('#tinterModal');
    const head=q('.tinter-head');
    const close=q('#tinterClose');
    const panel=q('#tinterBalance');
    const prompt=q('#tinterPrompt');
    if(!modal||!head||!close||!panel||!prompt)return;

    if(!q('#tinterSettings')){
      const actions=document.createElement('div');
      actions.className='tinter-head-actions';
      const settings=document.createElement('button');
      settings.type='button';
      settings.id='tinterSettings';
      settings.className='secondary tinter-settings-toggle';
      settings.setAttribute('aria-expanded','false');
      settings.setAttribute('aria-controls','tinterBalance');
      settings.setAttribute('aria-label','Open camera settings');
      settings.innerHTML='<span class="tinter-settings-icon" aria-hidden="true">⚙︎</span><span class="tinter-settings-label">Settings</span>';
      close.before(actions);
      actions.append(settings,close);
      settings.addEventListener('click',()=>setSettingsOpen(panel.hidden));
    }

    panel.hidden=true;
    q('.tinter-judge-line')?.remove();

    const tie=q('#tinterTie');
    if(tie){
      tie.textContent='They look about the same';
      tie.setAttribute('aria-label','The two colors look about the same');
    }

    const promptObserver=new MutationObserver(rewritePrompt);
    promptObserver.observe(prompt,{childList:true,subtree:true,characterData:true});
    rewritePrompt();

    q('#tinterOpen')?.addEventListener('click',()=>setSettingsOpen(false),true);
    close.addEventListener('click',()=>setSettingsOpen(false));

    q('#tinterAutoTemp')?.addEventListener('click',()=>{
      window.setTimeout(()=>{
        const note=q('#tinterBalanceNote');
        if(note&&!/still starting/i.test(note.textContent)){
          setSettingsOpen(false);
          const status=q('#tinterStatus');
          if(status)status.textContent='Camera balance saved. Compare the colors against your face.';
        }
      },420);
    });
  }

  function install(){
    ensureRefinementControls();
    installModalImprovements();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();