(function(){
  'use strict';

  const q=selector=>document.querySelector(selector);
  let lastQuestionId='';
  let syncing=false;

  const HELP={
    temp:{
      title:'Warm or cool?',
      body:'A color that is too warm can make skin look more yellow or red. A color that is too cool can make skin look gray or bluish. Choose the one that changes your natural skin tone the least.'
    },
    value:{
      title:'Light or dark?',
      body:'A color that is too dark can deepen shadows under the eyes and jaw. A color that is too light can wash out the eyes and brows. Choose the depth that keeps your face visible without looking heavy.'
    },
    chroma:{
      title:'Muted or bright?',
      body:'A color that is too bright can make redness or skin texture stand out. A color that is too muted can make the face look dull or gray. Choose the one that makes you look healthy without taking over.'
    },
    def:{
      title:'Soft or strong contrast?',
      body:'Too much contrast can make shadows and skin texture look harsher. Too little contrast can make the eyes, brows, and lips fade. Choose the amount that keeps your features clear without making the face look hard.'
    },
    hue:{
      title:'Which accent supports your face?',
      body:'The wrong accent can compete with your eyes and lips or add a red, yellow, or gray cast to the skin. Choose the one that supports your features instead of pulling attention away from them.'
    },
    generic:{
      title:'What should you compare?',
      body:'Watch your skin, facial shadows, eyes, brows, and lips. Choose the color that improves the face, not simply the swatch you like more.'
    }
  };

  function currentQuestion(){
    return window.Tinter?.queue?.[window.Tinter?.i]||null;
  }

  function helpFor(item){
    if(!item)return HELP.generic;
    if(item.stage==='practice'){
      return {
        title:'This is only practice',
        body:'The two swatches are identical. Try the controls, then choose “They look about the same.” This question does not affect your result.'
      };
    }
    if(item.stage==='calibration'){
      return {
        title:'This checks close comparisons',
        body:'These colors are intentionally almost the same. Choose “They look about the same” unless you can see a real change in your face. This question does not affect your result.'
      };
    }
    const base=HELP[item.axis]||HELP.generic;
    return {
      ...base,
      note:item.validation?'This is a final prediction check. It does not change your palette score.':''
    };
  }

  function ensurePanel(){
    const card=q('#tinterCard');
    if(!card)return null;
    let panel=q('#tinterQuestionHelpPanel');
    if(panel)return panel;
    panel=document.createElement('section');
    panel.id='tinterQuestionHelpPanel';
    panel.className='tinter-question-help-panel';
    panel.hidden=true;
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','false');
    panel.setAttribute('aria-labelledby','tinterQuestionHelpTitle');
    panel.innerHTML=`
      <p class="tinter-help-kicker">What to look for</p>
      <h3 id="tinterQuestionHelpTitle"></h3>
      <p id="tinterQuestionHelpBody"></p>
      <p id="tinterQuestionHelpNote" class="tinter-help-note" hidden></p>
      <button type="button" id="tinterQuestionHelpDone" class="tinter-help-done">Got it</button>`;
    card.appendChild(panel);
    q('#tinterQuestionHelpDone').addEventListener('click',closeHelp);
    return panel;
  }

  function positionPanel(){
    const panel=q('#tinterQuestionHelpPanel');
    const prompt=q('#tinterPrompt');
    if(!panel||!prompt||panel.hidden)return;
    panel.style.top=`${Math.round(prompt.offsetTop+prompt.offsetHeight+8)}px`;
  }

  function closeHelp(){
    const panel=q('#tinterQuestionHelpPanel');
    const button=q('#tinterQuestionHelpButton');
    const card=q('#tinterCard');
    if(panel)panel.hidden=true;
    if(button)button.setAttribute('aria-expanded','false');
    card?.classList.remove('question-help-open');
  }

  function openHelp(){
    const panel=ensurePanel();
    const item=currentQuestion();
    const button=q('#tinterQuestionHelpButton');
    const card=q('#tinterCard');
    if(!panel||!item)return;
    const help=helpFor(item);
    q('#tinterQuestionHelpTitle').textContent=help.title;
    q('#tinterQuestionHelpBody').textContent=help.body;
    const note=q('#tinterQuestionHelpNote');
    note.textContent=help.note||'';
    note.hidden=!help.note;
    panel.hidden=false;
    button?.setAttribute('aria-expanded','true');
    card?.classList.add('question-help-open');
    positionPanel();
  }

  function toggleHelp(){
    const panel=ensurePanel();
    if(!panel)return;
    if(panel.hidden)openHelp();
    else closeHelp();
  }

  function syncHelpButton(){
    if(syncing)return;
    syncing=true;
    try{
      const prompt=q('#tinterPrompt');
      const item=currentQuestion();
      if(!prompt||!item)return;
      if(item.id!==lastQuestionId){
        lastQuestionId=item.id;
        closeHelp();
      }
      let button=q('#tinterQuestionHelpButton');
      if(!button){
        button=document.createElement('button');
        button.type='button';
        button.id='tinterQuestionHelpButton';
        button.className='tinter-question-help';
        button.textContent='i';
        button.setAttribute('aria-expanded','false');
        button.setAttribute('aria-controls','tinterQuestionHelpPanel');
        button.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          toggleHelp();
        });
        prompt.appendChild(button);
      }
      button.setAttribute('aria-label',`More help for ${item.label||'this question'}`);
      button.setAttribute('title','What should I look for?');
    }finally{
      syncing=false;
    }
  }

  function install(){
    const prompt=q('#tinterPrompt');
    if(!prompt)return;
    ensurePanel();
    const observer=new MutationObserver(()=>window.queueMicrotask(syncHelpButton));
    observer.observe(prompt,{childList:true,subtree:true,characterData:true});
    syncHelpButton();

    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!q('#tinterQuestionHelpPanel')?.hidden)closeHelp();
    });
    document.addEventListener('click',event=>{
      const card=q('#tinterCard');
      if(!card?.classList.contains('question-help-open'))return;
      if(event.target.closest?.('#tinterQuestionHelpPanel,#tinterQuestionHelpButton'))return;
      closeHelp();
    });
    q('#tinterClose')?.addEventListener('click',closeHelp);
    q('#tinterSettings')?.addEventListener('click',closeHelp);
    window.addEventListener('resize',positionPanel);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();