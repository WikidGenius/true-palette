const TINTER_FOUNDATION=[
  {id:'light-neutral',axis:'temp',label:'Light neutral',a:{name:'Cream',hex:'#eadcc8',score:{temp:16,value:2}},b:{name:'Soft White',hex:'#f3f1ee',score:{temp:-16,value:4}}},
  {id:'main-neutral',axis:'temp',label:'Main neutral',a:{name:'Saddle',hex:'#8f5f3d',score:{temp:15,value:-2}},b:{name:'Pewter',hex:'#8c8d89',score:{temp:-15}}},
  {id:'warm-depth',axis:'value',label:'Warm depth',a:{name:'Camel',hex:'#b88954',score:{value:16,temp:4}},b:{name:'Espresso',hex:'#2e221c',score:{value:-18,temp:4}}},
  {id:'cool-depth',axis:'value',label:'Cool depth',a:{name:'Powder Blue',hex:'#9fb8c4',score:{value:15,temp:-3,chroma:-2}},b:{name:'Ink Navy',hex:'#17263a',score:{value:-18,temp:-4,def:4}}},
  {id:'rose-clarity',axis:'chroma',label:'Color strength',a:{name:'Dusty Rose',hex:'#b88691',score:{chroma:-16,def:-5}},b:{name:'Oxblood',hex:'#702c36',score:{chroma:15,def:9,value:-7}}},
  {id:'green-clarity',axis:'chroma',label:'Green direction',a:{name:'Sage',hex:'#8a9870',score:{chroma:-14,def:-4,temp:3}},b:{name:'Pine',hex:'#25483b',score:{chroma:11,def:6,value:-8,temp:-2}}},
  {id:'neutral-contrast',axis:'def',label:'Outfit contrast',a:{name:'Mushroom',hex:'#8d8179',score:{def:-16,chroma:-5}},b:{name:'Charcoal',hex:'#2b2f36',score:{def:17,value:-8}}},
  {id:'accent-direction',axis:'hue',label:'Accent direction',a:{name:'Terracotta',hex:'#9e4f34',score:{temp:11,hue:14}},b:{name:'Storm Blue',hex:'#405f75',score:{temp:-11,hue:-14}}}
];

const TINTER_TIEBREAKERS={
  temp:[
    {id:'temp-tie-1',axis:'temp',label:'Temperature check',a:{name:'Cafe au Lait',hex:'#cdb79e',score:{temp:14}},b:{name:'Dove Gray',hex:'#b7b7b2',score:{temp:-14}}},
    {id:'temp-tie-2',axis:'temp',label:'Temperature check',a:{name:'Rust Brown',hex:'#83432f',score:{temp:13,hue:7}},b:{name:'Blue Spruce',hex:'#315e5f',score:{temp:-13,hue:-7}}}
  ],
  value:[
    {id:'value-tie-1',axis:'value',label:'Depth check',a:{name:'Light Camel',hex:'#c0996f',score:{value:16}},b:{name:'Espresso',hex:'#3b2a23',score:{value:-18}}},
    {id:'value-tie-2',axis:'value',label:'Depth check',a:{name:'Aegean Mist',hex:'#91adb2',score:{value:14,chroma:-3}},b:{name:'Black Navy',hex:'#17263a',score:{value:-18,def:4}}}
  ],
  chroma:[
    {id:'chroma-tie-1',axis:'chroma',label:'Color strength check',a:{name:'Clay Pink',hex:'#b98578',score:{chroma:-13}},b:{name:'Cherry Red',hex:'#b93a46',score:{chroma:16,def:5}}},
    {id:'chroma-tie-2',axis:'chroma',label:'Color strength check',a:{name:'Sage Gray',hex:'#8a9870',score:{chroma:-13}},b:{name:'Deep Teal',hex:'#1e5560',score:{chroma:14,def:5}}}
  ],
  def:[
    {id:'def-tie-1',axis:'def',label:'Contrast check',a:{name:'Soft Taupe',hex:'#9b8d7c',score:{def:-15}},b:{name:'Black Navy',hex:'#17263a',score:{def:17,value:-6}}},
    {id:'def-tie-2',axis:'def',label:'Contrast check',a:{name:'Mauvewood',hex:'#9a7884',score:{def:-13,chroma:-4}},b:{name:'Sapphire Ink',hex:'#24395f',score:{def:16,chroma:6}}}
  ],
  hue:[
    {id:'hue-tie-1',axis:'hue',label:'Accent check',a:{name:'Rosewood',hex:'#7f4e55',score:{hue:12,temp:4}},b:{name:'Petrol',hex:'#244f57',score:{hue:-12,temp:-4}}},
    {id:'hue-tie-2',axis:'hue',label:'Accent check',a:{name:'Aged Brass',hex:'#a68738',score:{hue:11,temp:5}},b:{name:'Brushed Silver',hex:'#c9d0d4',score:{hue:-11,temp:-5}}}
  ]
};

(function(){
  'use strict';

  const q=s=>document.querySelector(s);
  const qa=s=>Array.from(document.querySelectorAll(s));
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const initialScores=()=>({temp:0,value:0,chroma:0,def:0,hue:0});
  const initialVotes=()=>({temp:[],value:[],chroma:[],def:[],hue:[]});
  const startButtonHtml=()=>'<span class="tinter-logo-lockup"><span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span></span><span class="tinter-primary-copy">Find my colors</span>';
  const completeButtonHtml=()=>'<span class="tinter-complete-check" aria-hidden="true">✓</span><span class="tinter-complete-copy">tinter built your palette</span>';

  window.Tinter={
    i:0,queue:[],answers:[],scores:initialScores(),axisVotes:initialVotes(),result:null,
    stream:null,lightingConfidence:'skipped',busy:false,adaptiveAdded:false
  };

  const modalHtml=()=>`<section id="tinterModal" class="tinter-modal" hidden><div id="tinterCard" class="tinter-card"><div class="tinter-head"><div><p class="kicker">Tinter</p><h2>Color drape</h2></div><button type="button" id="tinterClose" class="secondary tinter-close" aria-label="Close Tinter">×</button></div><div class="tinter-progress" aria-hidden="true"><i id="tinterBar"></i></div><p id="tinterPrompt" class="tinter-question"></p><div id="tinterStage" class="tinter-stage"><video id="tinterVideo" autoplay playsinline muted></video><div id="tinterWarmFilter" class="tinter-video-filter"></div><div id="tinterTintFilter" class="tinter-video-filter"></div><div id="smoothDrape" class="smooth-drape-preview"></div><div id="smoothDeck" class="smooth-deck"></div><div class="tinter-choice-footer"><button type="button" id="tinterTie" class="tinter-no-diff">No clear difference</button></div></div><div id="tinterBalance" class="tinter-balance"><div class="tinter-balance-top"><b>Camera balance</b><button type="button" id="tinterAutoTemp" class="secondary">Auto Temp</button></div><p class="tinter-balance-note">Point at white paper or a white wall, tap Auto Temp, then return to your face.</p><div class="tinter-balance-grid"><label>Warmth<input type="range" id="tinterWarmth" min="-100" max="100" value="0"></label><label>Tint<input type="range" id="tinterTint" min="-100" max="100" value="0"></label></div><p id="tinterBalanceNote" class="tinter-balance-note">Fine tune only when white does not look neutral.</p></div><p id="tinterStatus" class="tinter-status" aria-live="polite"></p><div id="tinterSummary" class="tinter-summary"><b>✓ Tinter analysis complete.</b><p>Building your wardrobe palette…</p></div></div></section>`;

  const isComplete=()=>Boolean(Tinter.result);
  const currentPair=()=>Tinter.queue[Tinter.i];
  const copyPair=definition=>JSON.parse(JSON.stringify(definition));

  function orientPair(definition){
    const pair=copyPair(definition);
    if(Math.random()<.5){pair.left=pair.a;pair.right=pair.b}
    else{pair.left=pair.b;pair.right=pair.a}
    return pair;
  }

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
  }

  function setPreview(side,progress){
    const drape=q('#smoothDrape');
    const color=currentPair()[side].hex;
    if(drape.dataset.color!==color){
      drape.dataset.color=color;
      drape.style.background=`linear-gradient(to top,${color} 0%,${color} 46%,${color}99 68%,transparent 100%)`;
    }
    drape.style.opacity=String(.08+progress*.68);
    drape.style.transform=`translate3d(0,0,0) scaleY(${.18+progress*.82})`;
  }

  function renderPair(){
    const pair=currentPair();
    const deck=q('#smoothDeck');
    if(!pair||!deck)return;
    Tinter.busy=false;
    q('#tinterCard').classList.remove('done');
    q('#tinterStage').classList.remove('smooth-done');
    q('#tinterSummary').style.display='none';
    q('#tinterPrompt').innerHTML=`${pair.label}: Which color makes your face look clearer?<span class="tinter-step-count">${Tinter.i+1} of ${Tinter.queue.length}</span>`;
    q('#tinterBar').style.width=`${Tinter.i/Tinter.queue.length*100}%`;
    deck.innerHTML=cardHtml('left',pair.left)+cardHtml('right',pair.right);
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

  function recordChoice(side){
    const pair=currentPair();
    if(!pair)return;
    if(!side){
      Tinter.axisVotes[pair.axis].push(0);
      Tinter.answers.push({id:pair.id,axis:pair.axis,prompt:pair.label,pick:'No clear difference',left:pair.left.name,right:pair.right.name,vote:0});
      return;
    }
    const selected=pair[side];
    const rejected=pair[side==='left'?'right':'left'];
    const primaryOption=selected===pair.a?1:-1;
    Tinter.axisVotes[pair.axis].push(primaryOption);
    const lightingWeight=Tinter.lightingConfidence==='low'?.72:Tinter.lightingConfidence==='okay'?.88:1;
    Object.entries(selected.score).forEach(([key,value])=>Tinter.scores[key]+=value*lightingWeight);
    Tinter.answers.push({id:pair.id,axis:pair.axis,prompt:pair.label,pick:selected.name,rejected:rejected.name,vote:primaryOption});
  }

  function axisStats(){
    return Object.fromEntries(Object.entries(Tinter.axisVotes).map(([axis,votes])=>{
      const count=votes.length;
      const sum=votes.reduce((total,vote)=>total+vote,0);
      const ties=votes.filter(vote=>vote===0).length;
      const raw=count?Math.abs(sum)/count:0;
      const coverage=Math.min(1,count/2);
      return [axis,{axis,count,sum,ties,confidence:raw*coverage}];
    }));
  }

  function addAdaptivePairs(){
    if(Tinter.adaptiveAdded)return;
    Tinter.adaptiveAdded=true;
    const stats=axisStats();
    const tieHeavy=Object.values(stats).filter(stat=>stat.ties>0).length;
    const count=tieHeavy>=2?3:2;
    const axes=Object.values(stats).sort((a,b)=>a.confidence-b.confidence).slice(0,count).map(stat=>stat.axis);
    axes.forEach(axis=>{
      const used=new Set(Tinter.queue.map(pair=>pair.id));
      const candidate=(TINTER_TIEBREAKERS[axis]||[]).find(pair=>!used.has(pair.id));
      if(candidate)Tinter.queue.push(orientPair(candidate));
    });
  }

  function advance(){
    if(Tinter.i===TINTER_FOUNDATION.length-1)addAdaptivePairs();
    window.setTimeout(()=>{
      Tinter.i++;
      if(Tinter.i>=Tinter.queue.length)finishTinter();
      else renderPair();
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
    qa('.smooth-card').forEach(card=>card.classList.add('is-muted'));
    clearPreview();
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
      card.setPointerCapture(event.pointerId);
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

  function confidenceSummary(stats){
    const values=Object.values(stats);
    const average=values.reduce((sum,stat)=>sum+stat.confidence,0)/values.length;
    const tieCount=values.reduce((sum,stat)=>sum+stat.ties,0);
    const tieRate=tieCount/Math.max(1,Tinter.answers.length);
    if(average>=.66&&tieRate<.22)return {key:'high',label:'High confidence',description:'Your choices were consistent across the major color dimensions.'};
    if(average>=.38&&tieRate<.38)return {key:'moderate',label:'Moderate confidence',description:'Your strongest preferences are clear, with one or two balanced areas.'};
    return {key:'mixed',label:'Balanced / mixed result',description:'Several comparisons were close, so the palette stays near cross-season territory.'};
  }

  function buildEvidence(){
    const seen=new Set();
    const evidence=[];
    Tinter.answers.forEach(answer=>{
      if(seen.has(answer.axis))return;
      if(answer.vote===0)evidence.push(`No clear difference between ${answer.left} and ${answer.right}.`);
      else evidence.push(`Preferred ${answer.pick} over ${answer.rejected}.`);
      seen.add(answer.axis);
    });
    return evidence.slice(0,5);
  }

  function buildResult(){
    const scales={temp:1.7,value:1.8,chroma:2,def:2.1,hue:2.6};
    const rec=Object.fromEntries(Object.entries(Tinter.scores).map(([key,value])=>[key,clampValue(value*scales[key])]));
    const stats=axisStats();
    const confidence=confidenceSummary(stats);
    const direction=[rec.temp>22?'Warm':rec.temp<-22?'Cool':'Balanced',rec.value<-25?'Deep':rec.value>25?'Light':'Medium',rec.def>20?'Defined':rec.def<-20?'Soft':'Tailored'].join(' ');
    const contrast=rec.def<-20?'soft':rec.def>20?'sharp':'balanced';
    const locks=lockRanges({contrast},rec.temp,-rec.value/70,rec.hue>15?1:rec.hue<-15?-1:0);
    return {
      client:'Client',direction,rec,alt:{...rec},locks,source:'tinter',
      tinter:{answers:[...Tinter.answers],scores:{...Tinter.scores},axisConfidence:stats,confidence,evidence:buildEvidence(),comparisons:Tinter.answers.length}
    };
  }

  function finishTinter(){
    Tinter.result=buildResult();
    q('#tinterBar').style.width='100%';
    q('#tinterCard').classList.add('done');
    q('#tinterStatus').textContent='Tinter analysis complete.';
    q('#smoothDeck').innerHTML='';
    q('#tinterSummary').style.display='block';
    q('#tinterSummary').innerHTML='<b>✓ Tinter analysis complete.</b><p>Building your wardrobe palette…</p>';
    disableRefinement?.();
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
    stopCamera();
    Tinter.i=0;
    Tinter.queue=TINTER_FOUNDATION.map(orientPair);
    Tinter.answers=[];
    Tinter.scores=initialScores();
    Tinter.axisVotes=initialVotes();
    Tinter.result=null;
    Tinter.lightingConfidence='skipped';
    Tinter.busy=false;
    Tinter.adaptiveAdded=false;
    if(q('#tinterWarmth'))q('#tinterWarmth').value=0;
    if(q('#tinterTint'))q('#tinterTint').value=0;
  }

  Tinter.open=async function(){
    resetSession();
    clearButtonComplete();
    disableRefinement?.();
    q('#tinterModal').hidden=false;
    q('#tinterCard').classList.remove('done');
    q('#tinterSummary').style.display='none';
    q('#tinterStatus').textContent='';
    renderPair();
    try{
      Tinter.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:720},height:{ideal:960},frameRate:{ideal:30,max:30}},audio:false});
      const video=q('#tinterVideo');
      video.srcObject=Tinter.stream;
      await video.play();
    }catch{
      q('#tinterStatus').textContent='Camera unavailable. You can still compare the swatch colors, or use the camera-free refinement form.';
    }
  };

  Tinter.close=function(){q('#tinterModal').hidden=true;stopCamera()};
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
