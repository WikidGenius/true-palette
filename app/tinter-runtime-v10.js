(function(){
  'use strict';

  const q=selector=>document.querySelector(selector);
  const qa=selector=>Array.from(document.querySelectorAll(selector));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const emptyAxisMap=()=>Object.fromEntries(window.TinterSurvey.AXES.map(axis=>[axis,0]));
  const startButtonHtml=()=>'<span class="tinter-logo-lockup"><span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span></span><span class="tinter-primary-copy">Find my colors</span>';
  const completeButtonHtml=()=>'<span class="tinter-complete-check" aria-hidden="true">✓</span><span class="tinter-complete-copy">tinter built your palette</span>';

  if(!window.TinterSurvey)throw new Error('TinterSurvey must load before the Tinter runtime.');

  window.Tinter={
    i:0,queue:[],responses:[],answers:[],scores:emptyAxisMap(),evidence:emptyAxisMap(),result:null,
    stream:null,lightingConfidence:'skipped',busy:false,adaptivePlanned:false,resolutionPlanned:false,
    initialLength:0,estimatedTotal:12,progressPct:0,shownAt:0,sessionId:0
  };

  const modalHtml=()=>`<section id="tinterModal" class="tinter-modal" hidden><div id="tinterCard" class="tinter-card"><div class="tinter-head"><div><p class="kicker">Tinter</p><h2>Color drape</h2></div><button type="button" id="tinterClose" class="secondary tinter-close" aria-label="Close Tinter">×</button></div><div class="tinter-progress" aria-hidden="true"><i id="tinterBar"></i></div><p id="tinterPrompt" class="tinter-question"></p><div id="tinterStage" class="tinter-stage"><video id="tinterVideo" autoplay playsinline muted></video><div id="tinterWarmFilter" class="tinter-video-filter"></div><div id="tinterTintFilter" class="tinter-video-filter"></div><div id="smoothDrape" class="smooth-drape-preview"></div><div id="smoothDeck" class="smooth-deck"></div><div class="tinter-choice-footer"><button type="button" id="tinterTie" class="tinter-no-diff">They look about the same</button></div></div><div id="tinterBalance" class="tinter-balance"><div class="tinter-balance-top"><b>Camera balance</b><button type="button" id="tinterAutoTemp" class="secondary">Auto Temp</button></div><p class="tinter-balance-note">Point at white paper or a white wall, tap Auto Temp, then return to your face.</p><div class="tinter-balance-grid"><label>Warmth<input type="range" id="tinterWarmth" min="-100" max="100" value="0"></label><label>Tint<input type="range" id="tinterTint" min="-100" max="100" value="0"></label></div><p id="tinterBalanceNote" class="tinter-balance-note">Fine tune only when white does not look neutral.</p></div><p id="tinterStatus" class="tinter-status" aria-live="polite"></p><div id="tinterSummary" class="tinter-summary"><b>✓ Tinter analysis complete.</b><p>Building your wardrobe palette…</p></div></div></section>`;

  const currentQuestion=()=>Tinter.queue[Tinter.i];
  const isComplete=()=>Boolean(Tinter.result);

  function setButtonComplete(){
    const button=q('#tinterOpen');
    if(!button)return;
    button.classList.add('tinter-complete');
    button.innerHTML=completeButtonHtml();
    button.setAttribute('aria-label','Retake Tinter color analysis');
  }

  function clearButtonComplete(){
    const button=q('#tinterOpen');
    if(!button)return;
    button.classList.remove('tinter-complete');
    button.innerHTML=startButtonHtml();
    button.setAttribute('aria-label','Start Tinter color analysis');
  }

  function cardHtml(side,color){
    return `<article class="smooth-card" data-side="${side}" role="button" tabindex="0" aria-label="Choose ${color.name}"><div class="smooth-chip" style="background:${color.hex}"></div><b class="smooth-name">${color.name}</b><span class="smooth-hex">${color.hex}</span></article>`;
  }

  function clearPreview(){
    const drape=q('#smoothDrape');
    if(drape){drape.style.opacity='0';drape.style.transform='translate3d(0,0,0) scaleY(0)'}
    qa('.smooth-card').forEach(card=>{card.classList.remove('is-muted','is-dragging','is-throwing','is-returning');card.style.transform='' });
    q('#tinterStage')?.classList.remove('tie-chosen');
  }

  function setPreview(side,progress){
    const drape=q('#smoothDrape');
    const item=currentQuestion();
    if(!drape||!item)return;
    const color=item[side].hex;
    if(drape.dataset.color!==color){
      drape.dataset.color=color;
      drape.style.background=`linear-gradient(to top,${color} 0%,${color} 46%,${color}99 68%,transparent 100%)`;
    }
    drape.style.opacity=String(.08+progress*.68);
    drape.style.transform=`translate3d(0,0,0) scaleY(${.18+progress*.82})`;
  }

  function progressWidth(){
    const target=Math.min(96,(Tinter.i/Math.max(1,Tinter.estimatedTotal))*100);
    Tinter.progressPct=Math.max(Tinter.progressPct,target);
    return Tinter.progressPct;
  }

  function renderQuestion(){
    const item=currentQuestion();
    const deck=q('#smoothDeck');
    if(!item||!deck)return;
    Tinter.busy=false;
    Tinter.shownAt=performance.now();
    q('#tinterCard').classList.remove('done');
    q('#tinterStage').classList.remove('smooth-done','tie-chosen');
    q('#tinterSummary').style.display='none';
    q('#tinterPrompt').innerHTML=`<span class="tinter-question-label">${window.TinterSurvey.phaseLabel(item.stage)}</span><span class="tinter-question-main">${item.question}</span><span class="tinter-step-count">Question ${Tinter.i+1}</span><span class="tinter-judge-inline">${item.hint}</span>`;
    q('#tinterBar').style.width=`${progressWidth()}%`;
    deck.innerHTML=cardHtml('left',item.left)+cardHtml('right',item.right);
    deck.querySelectorAll('.smooth-card').forEach(wireCard);
    q('#tinterTie').disabled=false;
    clearPreview();
  }

  function cancelCard(card){
    const drape=q('#smoothDrape');
    card.classList.add('is-returning');
    if(drape){drape.style.opacity='0';drape.style.transform='translate3d(0,0,0) scaleY(0)'}
    qa('.smooth-card').forEach(other=>{if(other!==card)other.classList.remove('is-muted')});
    requestAnimationFrame(()=>{card.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)'});
    let finished=false;
    const finish=()=>{
      if(finished)return;
      finished=true;
      card.classList.remove('is-returning');
      card.style.transform='';
      clearPreview();
    };
    card.addEventListener('transitionend',finish,{once:true});
    window.setTimeout(finish,360);
  }

  function recordChoice(choice){
    const item=currentQuestion();
    if(!item)return;
    const scored=window.TinterSurvey.scoreResponse(item,choice,Tinter.lightingConfidence);
    window.TinterSurvey.AXES.forEach(axis=>{
      Tinter.scores[axis]+=scored.delta[axis];
      Tinter.evidence[axis]+=scored.evidence[axis];
    });
    const responseMs=Math.max(0,Math.round(performance.now()-Tinter.shownAt));
    const response={
      id:item.id,stage:item.stage,axis:item.axis,label:item.label,question:item.question,
      choice:choice||'tie',pick:scored.selected?.name||'They look about the same',
      rejected:scored.rejected?.name||null,left:item.left.name,right:item.right.name,
      vote:scored.vote,control:item.control,expectedTie:item.expectedTie,
      predictedSign:item.predictedSign||0,reason:item.reason,responseMs
    };
    Tinter.responses.push(response);
    Tinter.answers=Tinter.responses;
  }

  function planNextPhase(completedCount){
    if(!Tinter.adaptivePlanned&&completedCount>=Tinter.initialLength){
      const additions=window.TinterSurvey.planAdaptive({responses:Tinter.responses,scores:Tinter.scores,evidence:Tinter.evidence,queue:Tinter.queue});
      Tinter.queue.push(...additions);
      Tinter.adaptivePlanned=true;
      Tinter.estimatedTotal=Math.max(Tinter.estimatedTotal,Tinter.queue.length+1);
      if(additions.length)q('#tinterStatus').textContent='The survey found a pattern. Now it is testing it with closer comparisons.';
    }

    if(Tinter.adaptivePlanned&&!Tinter.resolutionPlanned&&completedCount>=Tinter.queue.length){
      const additions=window.TinterSurvey.planResolution({responses:Tinter.responses,scores:Tinter.scores,evidence:Tinter.evidence,queue:Tinter.queue});
      Tinter.queue.push(...additions);
      Tinter.resolutionPlanned=true;
      Tinter.estimatedTotal=Math.max(Tinter.queue.length,Tinter.estimatedTotal-1);
      if(additions.length)q('#tinterStatus').textContent='One final close check will resolve a mixed signal.';
    }
  }

  function advance(){
    window.setTimeout(()=>{
      const completedCount=Tinter.i+1;
      planNextPhase(completedCount);
      Tinter.i=completedCount;
      if(Tinter.i>=Tinter.queue.length)finishTinter();
      else renderQuestion();
    },230);
  }

  function chooseCard(card,side,dx,dy){
    if(Tinter.busy)return;
    Tinter.busy=true;
    const rotation=dx===0?(side==='left'?-14:14):(dx>0?18:-18);
    card.classList.add('is-throwing');
    card.style.transform=`translate3d(${dx*1.15}px,${dy-260}px,0) rotate(${rotation}deg) scale(1.18)`;
    q('#tinterStage').classList.add('smooth-done');
    q('#smoothDrape').style.opacity='.82';
    q('#smoothDrape').style.transform='translate3d(0,0,0) scaleY(1)';
    recordChoice(side);
    advance();
  }

  function chooseTie(){
    if(Tinter.busy)return;
    Tinter.busy=true;
    q('#tinterTie').disabled=true;
    q('#tinterStage').classList.add('tie-chosen');
    qa('.smooth-card').forEach(card=>card.classList.add('is-muted'));
    const drape=q('#smoothDrape');
    if(drape){drape.style.opacity='0';drape.style.transform='translate3d(0,0,0) scaleY(0)'}
    recordChoice(null);
    advance();
  }

  function wireCard(card){
    let startX=0,startY=0,dx=0,dy=0,dragging=false,frame=0,stageHeight=1;
    const side=card.dataset.side;
    let other=null;

    const draw=()=>{
      frame=0;
      const progress=clamp(Math.max(0,-dy)/(stageHeight*.42),0,1);
      const rotation=clamp(dx/16,-12,12);
      card.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rotation}deg) scale(${1+progress*.1})`;
      setPreview(side,progress);
      if(other)other.classList.toggle('is-muted',progress>.08);
    };

    card.addEventListener('pointerdown',event=>{
      if(Tinter.busy)return;
      event.preventDefault();
      event.stopPropagation();
      dragging=true;
      startX=event.clientX;
      startY=event.clientY;
      dx=dy=0;
      stageHeight=q('#tinterStage').clientHeight||1;
      other=qa('.smooth-card').find(item=>item!==card);
      card.classList.add('is-dragging');
      try{card.setPointerCapture(event.pointerId)}catch{}
    });

    card.addEventListener('pointermove',event=>{
      if(!dragging||Tinter.busy)return;
      event.preventDefault();
      event.stopPropagation();
      dx=event.clientX-startX;
      dy=event.clientY-startY;
      if(!frame)frame=requestAnimationFrame(draw);
    });

    card.addEventListener('pointerup',event=>{
      if(!dragging||Tinter.busy)return;
      event.preventDefault();
      event.stopPropagation();
      dragging=false;
      card.classList.remove('is-dragging');
      const moved=Math.hypot(dx,dy);
      const progress=clamp(Math.max(0,-dy)/(stageHeight*.42),0,1);
      if(moved<9)chooseCard(card,side,0,-30);
      else if(progress>.52||dy<-145)chooseCard(card,side,dx,dy);
      else cancelCard(card);
    });

    card.addEventListener('pointercancel',()=>{
      if(!dragging)return;
      dragging=false;
      card.classList.remove('is-dragging');
      cancelCard(card);
    });

    card.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!Tinter.busy){event.preventDefault();chooseCard(card,side,0,-30)}
    });
  }

  function buildResult(){
    const rec=window.TinterSurvey.normalizeScores(Tinter.scores,Tinter.evidence);
    const stats=window.TinterSurvey.axisStats(Tinter.responses,Tinter.scores,Tinter.evidence);
    const quality=window.TinterSurvey.reliability(Tinter.responses);
    const confidence=window.TinterSurvey.confidenceSummary(stats,quality);
    const direction=[rec.temp>22?'Warm':rec.temp<-22?'Cool':'Balanced',rec.value<-25?'Deep':rec.value>25?'Light':'Medium',rec.def>20?'Defined':rec.def<-20?'Soft':'Tailored'].join(' ');
    const contrast=rec.def<-20?'soft':rec.def>20?'sharp':'balanced';
    const locks=window.lockRanges({contrast},rec.temp,-rec.value/70,rec.hue>15?1:rec.hue<-15?-1:0);
    const adaptiveQuestions=Tinter.responses.filter(response=>['tiebreaker','challenge','final'].includes(response.stage)).length;
    return {
      client:'Client',direction,rec,alt:{...rec},locks,source:'tinter',
      tinter:{
        answers:[...Tinter.responses],responses:[...Tinter.responses],scores:{...Tinter.scores},evidenceWeights:{...Tinter.evidence},
        axisConfidence:stats,confidence,evidence:window.TinterSurvey.evidenceLines(stats,rec),comparisons:Tinter.responses.length,
        adaptiveQuestions,surveyQuality:quality,calibrationPassed:quality.calibrationScore>=.5
      }
    };
  }

  function finishTinter(){
    Tinter.result=buildResult();
    Tinter.progressPct=100;
    q('#tinterBar').style.width='100%';
    q('#tinterCard').classList.add('done');
    q('#tinterStatus').textContent='Tinter analysis complete.';
    q('#smoothDeck').innerHTML='';
    q('#tinterSummary').style.display='block';
    q('#tinterSummary').innerHTML='<b>✓ Pattern confirmed.</b><p>Building your wardrobe palette…</p>';
    window.disableRefinement?.();
    window.setTimeout(()=>window.buildPalette?.({automatic:true,source:'tinter'}),260);
    window.setTimeout(()=>{Tinter.close();setButtonComplete()},1050);
  }

  function applyBalance(){
    const warmth=Number(q('#tinterWarmth').value)||0;
    const tint=Number(q('#tinterTint').value)||0;
    Tinter.lightingCorrection=warmth;
    Tinter.tintCorrection=tint;
    const warmthAlpha=Math.min(.42,Math.abs(warmth)/190);
    const tintAlpha=Math.min(.28,Math.abs(tint)/220);
    q('#tinterWarmFilter').style.background=warmth<0?`rgba(70,120,255,${warmthAlpha})`:warmth>0?`rgba(255,170,70,${warmthAlpha})`:'transparent';
    q('#tinterTintFilter').style.background=tint<0?`rgba(60,180,110,${tintAlpha})`:tint>0?`rgba(220,80,190,${tintAlpha})`:'transparent';
  }

  function autoBalance(){
    const video=q('#tinterVideo');
    const note=q('#tinterBalanceNote');
    if(!video.videoWidth){note.textContent='Camera is still starting. Try again.';return}
    const canvas=document.createElement('canvas');
    const size=72;
    canvas.width=canvas.height=size;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context){note.textContent='Camera balance is unavailable in this browser.';return}
    context.drawImage(video,(video.videoWidth-size)/2,(video.videoHeight-size)/2,size,size,0,0,size,size);
    const pixels=context.getImageData(0,0,size,size).data;
    let red=0,green=0,blue=0,count=0;
    for(let i=0;i<pixels.length;i+=4){red+=pixels[i];green+=pixels[i+1];blue+=pixels[i+2];count++}
    red/=count;green/=count;blue/=count;
    const warmth=clamp(Math.round((blue-red)*.55),-75,75);
    const tint=clamp(Math.round((green-(red+blue)/2)*.45),-55,55);
    q('#tinterWarmth').value=warmth;
    q('#tinterTint').value=tint;
    applyBalance();
    const strength=Math.abs(warmth)+Math.abs(tint);
    Tinter.lightingConfidence=strength<25?'good':strength<70?'okay':'low';
    note.textContent=strength<25?'White balance looks close to neutral.':strength<70?'Auto balance applied. Fine tune only if needed.':'Strong color cast detected. Daylight will give a more reliable result.';
  }

  function stopCamera(){
    if(Tinter.stream){Tinter.stream.getTracks().forEach(track=>track.stop());Tinter.stream=null}
    const video=q('#tinterVideo');
    if(video){video.pause();video.srcObject=null}
  }

  function resetSession(){
    Tinter.sessionId++;
    stopCamera();
    Tinter.i=0;
    Tinter.queue=window.TinterSurvey.buildInitialQueue();
    Tinter.initialLength=Tinter.queue.length;
    Tinter.estimatedTotal=Tinter.initialLength+3;
    Tinter.responses=[];
    Tinter.answers=Tinter.responses;
    Tinter.scores=emptyAxisMap();
    Tinter.evidence=emptyAxisMap();
    Tinter.result=null;
    Tinter.lightingConfidence='skipped';
    Tinter.busy=false;
    Tinter.adaptivePlanned=false;
    Tinter.resolutionPlanned=false;
    Tinter.progressPct=0;
    Tinter.shownAt=0;
    if(q('#tinterWarmth'))q('#tinterWarmth').value=0;
    if(q('#tinterTint'))q('#tinterTint').value=0;
    q('#tinterCard')?.classList.remove('settings-open','done');
  }

  Tinter.open=async function(){
    resetSession();
    const session=Tinter.sessionId;
    clearButtonComplete();
    window.disableRefinement?.();
    q('#tinterModal').hidden=false;
    q('#tinterSummary').style.display='none';
    q('#tinterStatus').textContent='';
    renderQuestion();
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:960},frameRate:{ideal:30,max:30}},audio:false});
      if(session!==Tinter.sessionId||q('#tinterModal').hidden){stream.getTracks().forEach(track=>track.stop());return}
      Tinter.stream=stream;
      const video=q('#tinterVideo');
      video.srcObject=stream;
      await video.play();
    }catch{
      if(session===Tinter.sessionId)q('#tinterStatus').textContent='Camera unavailable. Use “Analyze without camera” for a reliable fallback.';
    }
  };

  Tinter.close=function(){
    Tinter.sessionId++;
    q('#tinterModal').hidden=true;
    stopCamera();
  };
  Tinter.reset=function(){resetSession();clearButtonComplete()};
  Tinter.clearCompleteButton=clearButtonComplete;
  Tinter.isComplete=isComplete;

  function init(){
    if(!q('#tinterModal'))document.body.insertAdjacentHTML('beforeend',modalHtml());
    q('#tinterOpen').onclick=Tinter.open;
    q('#tinterClose').onclick=Tinter.close;
    q('#tinterTie').onclick=chooseTie;
    q('#tinterWarmth').oninput=applyBalance;
    q('#tinterTint').oninput=applyBalance;
    q('#tinterAutoTemp').onclick=autoBalance;
    resetSession();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
