window.TINTER_PAIRS=[
  {prompt:'Which neutral makes your face look clearer?',left:{name:'Saddle',hex:'#8f5f3d',nudge:{temp:10}},right:{name:'Pewter',hex:'#8c8d89',nudge:{temp:-10}}},
  {prompt:'Which light neutral looks fresher?',left:{name:'Cream',hex:'#eadcc8',nudge:{temp:9,value:4}},right:{name:'Soft White',hex:'#f3f1ee',nudge:{temp:-9,value:5}}},
  {prompt:'Which dark anchor feels easier?',left:{name:'Espresso',hex:'#2e221c',nudge:{temp:7,value:-6}},right:{name:'Black Navy',hex:'#17263a',nudge:{temp:-7,value:-6}}},
  {prompt:'Which color brings your face to life?',left:{name:'Terracotta',hex:'#9e4f34',nudge:{temp:12,hue:10}},right:{name:'Rosewood',hex:'#8c5e63',nudge:{temp:-8,hue:-8}}},
  {prompt:'Which color strength looks better?',left:{name:'Dusty Rose',hex:'#b88691',nudge:{chroma:-12,def:-5}},right:{name:'Oxblood',hex:'#702c36',nudge:{chroma:10,def:8}}},
  {prompt:'Which green feels more natural?',left:{name:'Sage',hex:'#8a9870',nudge:{temp:5,chroma:-6}},right:{name:'Pine',hex:'#25483b',nudge:{temp:-4,chroma:8}}},
  {prompt:'Which eye-pop color works better?',left:{name:'Rosewood',hex:'#7f4e55',nudge:{temp:4,hue:6}},right:{name:'Storm Blue',hex:'#405f75',nudge:{temp:-6,hue:-8}}},
  {prompt:'Which outfit contrast feels more expensive?',left:{name:'Mushroom',hex:'#8d8179',nudge:{def:-10,chroma:-5}},right:{name:'Charcoal',hex:'#2b2f36',nudge:{def:12,value:-6}}}
];

(function(){
  'use strict';

  const q=s=>document.querySelector(s);
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const initialNudges=()=>({temp:0,value:0,chroma:0,def:0,hue:0});

  window.Tinter={i:0,answers:[],nudges:initialNudges(),stream:null,lightingConfidence:'skipped',busy:false};

  const logoHtml=()=>'<span class="tinter-logo-lockup"><span class="tinter-style-glyph" aria-hidden="true">style</span><span class="tinter-word">tinter</span></span>';
  const completeHtml=()=>'<span class="tinter-complete-check" aria-hidden="true">✓</span><span class="tinter-complete-copy">tinter results will influence palette</span>';
  const modalHtml=()=>`<section id="tinterModal" class="tinter-modal" hidden><div id="tinterCard" class="tinter-card"><div class="tinter-head"><div><p class="kicker">Tinter</p><h2>Color drape</h2></div><button type="button" id="tinterClose" class="secondary tinter-close" aria-label="Close Tinter">×</button></div><div class="tinter-progress" aria-hidden="true"><i id="tinterBar"></i></div><p id="tinterPrompt" class="tinter-question"></p><div id="tinterStage" class="tinter-stage"><video id="tinterVideo" autoplay playsinline muted></video><div id="tinterWarmFilter" class="tinter-video-filter"></div><div id="tinterTintFilter" class="tinter-video-filter"></div><div id="smoothDrape" class="smooth-drape-preview"></div><div id="smoothDeck" class="smooth-deck"></div></div><div id="tinterBalance" class="tinter-balance"><div class="tinter-balance-top"><b>Balance the camera</b><button type="button" id="tinterAutoTemp" class="secondary">Auto Temp</button></div><p class="tinter-balance-note">Point at white paper or a white wall, then use Auto Temp.</p><div class="tinter-balance-grid"><label>Warmth<input type="range" id="tinterWarmth" min="-100" max="100" value="0"></label><label>Tint<input type="range" id="tinterTint" min="-100" max="100" value="0"></label></div><p id="tinterBalanceNote" class="tinter-balance-note">Fine tune until white looks neutral.</p></div><p id="tinterStatus" class="tinter-status" aria-live="polite"></p><div id="tinterSummary" class="tinter-summary"><b>✓ Tinter analysis complete.</b><p>Tinter results will influence your palette.</p></div></div></section>`;

  const isComplete=()=>Tinter.answers.length>=TINTER_PAIRS.length;
  const pair=()=>TINTER_PAIRS[Tinter.i];

  function setButtonComplete(){
    const button=q('#tinterOpen');
    if(!button)return;
    button.classList.add('tinter-complete');
    button.innerHTML=completeHtml();
    button.setAttribute('aria-label','Tinter results will influence palette');
  }

  function clearButtonComplete(){
    const button=q('#tinterOpen');
    if(!button)return;
    button.classList.remove('tinter-complete');
    button.innerHTML=logoHtml();
    button.setAttribute('aria-label','Open Tinter color drape');
  }

  function cardHtml(side,color){
    return `<article class="smooth-card" data-side="${side}" role="button" tabindex="0" aria-label="Choose ${color.name}"><div class="smooth-chip" style="background:${color.hex}"></div><b class="smooth-name">${color.name}</b><span class="smooth-hex">${color.hex}</span></article>`;
  }

  function clearPreview(){
    const drape=q('#smoothDrape');
    if(drape){
      drape.style.opacity='0';
      drape.style.transform='translate3d(0,0,0) scaleY(0)';
    }
    document.querySelectorAll('.smooth-card').forEach(card=>{
      card.classList.remove('is-muted','is-dragging','is-throwing','is-returning');
      card.style.transform='';
    });
  }

  function setPreview(side,progress){
    const drape=q('#smoothDrape');
    const color=pair()[side].hex;
    if(drape.dataset.color!==color){
      drape.dataset.color=color;
      drape.style.background=`linear-gradient(to top,${color} 0%,${color} 46%,${color}99 68%,transparent 100%)`;
    }
    drape.style.opacity=String(.08+progress*.68);
    drape.style.transform=`translate3d(0,0,0) scaleY(${.18+progress*.82})`;
  }

  function renderPair(){
    const current=pair();
    const deck=q('#smoothDeck');
    if(!current||!deck)return;
    Tinter.busy=false;
    q('#tinterStage').classList.remove('smooth-done');
    q('#tinterPrompt').textContent=current.prompt;
    q('#tinterBar').style.width=`${Tinter.i/TINTER_PAIRS.length*100}%`;
    deck.innerHTML=cardHtml('left',current.left)+cardHtml('right',current.right);
    deck.querySelectorAll('.smooth-card').forEach(wireCard);
    clearPreview();
  }

  function cancelCard(card){
    const drape=q('#smoothDrape');
    card.classList.add('is-returning');
    if(drape){
      drape.style.opacity='0';
      drape.style.transform='translate3d(0,0,0) scaleY(0)';
    }
    document.querySelectorAll('.smooth-card').forEach(other=>{if(other!==card)other.classList.remove('is-muted')});
    requestAnimationFrame(()=>{card.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)'});
    const finish=()=>{
      card.classList.remove('is-returning');
      card.style.transform='';
      clearPreview();
    };
    card.addEventListener('transitionend',finish,{once:true});
    window.setTimeout(finish,340);
  }

  function choose(side){
    const current=pair();
    const selected=current[side];
    const weight=Tinter.lightingConfidence==='low'?.7:Tinter.lightingConfidence==='okay'?.85:1;
    Object.entries(selected.nudge).forEach(([key,value])=>Tinter.nudges[key]=(Tinter.nudges[key]||0)+Math.round(value*weight));
    Tinter.answers.push({prompt:current.prompt,pick:selected.name});
    window.setTimeout(()=>{
      Tinter.i++;
      if(Tinter.i>=TINTER_PAIRS.length)finishTinter();
      else renderPair();
    },230);
  }

  function commitCard(card,side,dx,dy){
    if(Tinter.busy)return;
    Tinter.busy=true;
    card.classList.add('is-throwing');
    card.style.transform=`translate3d(${dx*1.15}px,${dy-260}px,0) rotate(${dx>0?18:-18}deg) scale(1.18)`;
    q('#tinterStage').classList.add('smooth-done');
    q('#smoothDrape').style.opacity='.82';
    q('#smoothDrape').style.transform='translate3d(0,0,0) scaleY(1)';
    choose(side);
  }

  function wireCard(card){
    let startX=0,startY=0,dx=0,dy=0,dragging=false,frame=0,stageHeight=1;
    const side=card.dataset.side;
    let other=null;

    function draw(){
      frame=0;
      const progress=clamp(Math.max(0,-dy)/(stageHeight*.42),0,1);
      const rotation=clamp(dx/16,-12,12);
      card.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rotation}deg) scale(${1+progress*.1})`;
      setPreview(side,progress);
      if(other)other.classList.toggle('is-muted',progress>.08);
    }

    card.addEventListener('pointerdown',event=>{
      if(Tinter.busy)return;
      event.preventDefault();
      event.stopPropagation();
      dragging=true;
      startX=event.clientX;
      startY=event.clientY;
      dx=dy=0;
      stageHeight=q('#tinterStage').clientHeight||1;
      other=[...document.querySelectorAll('.smooth-card')].find(item=>item!==card);
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
      if(moved<9)commitCard(card,side,0,-30);
      else if(progress>.52||dy<-145)commitCard(card,side,dx,dy);
      else cancelCard(card);
    });

    card.addEventListener('pointercancel',()=>{
      if(!dragging)return;
      dragging=false;
      card.classList.remove('is-dragging');
      cancelCard(card);
    });

    card.addEventListener('keydown',event=>{
      if((event.key==='Enter'||event.key===' ')&&!Tinter.busy){
        event.preventDefault();
        commitCard(card,side,0,-30);
      }
    });
  }

  function finishTinter(){
    q('#tinterBar').style.width='100%';
    q('#tinterCard').classList.add('done');
    q('#tinterStatus').textContent='Tinter analysis complete.';
    q('#smoothDeck').innerHTML='';
    q('#tinterSummary').style.display='block';
    try{
      if(document.body.classList.contains('report-ready')&&window.renderReport&&window.calculateReport)renderReport(calculateReport());
    }catch{}
    window.setTimeout(()=>{
      Tinter.close();
      setButtonComplete();
    },1200);
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
    note.textContent=strength<25?'Camera looks close to neutral.':strength<70?'Auto balance applied. Fine tune if needed.':'Strong color cast detected. Daylight will be more reliable.';
  }

  function wireBuildGuard(){
    const button=q('#analyze');
    if(!button||button.dataset.tinterRequired)return;
    const build=button.onclick;
    button.dataset.tinterRequired='true';
    button.onclick=function(event){
      if(!isComplete()){
        event?.preventDefault();
        Tinter.open();
        q('#tinterStatus').textContent='Complete Tinter, then build your palette.';
        return false;
      }
      return build?.call(this,event);
    };
  }

  function stopCamera(){
    if(Tinter.stream){
      Tinter.stream.getTracks().forEach(track=>track.stop());
      Tinter.stream=null;
    }
    const video=q('#tinterVideo');
    if(video){video.pause();video.srcObject=null}
  }

  Tinter.open=async function(){
    stopCamera();
    clearButtonComplete();
    Tinter.i=0;
    Tinter.answers=[];
    Tinter.nudges=initialNudges();
    Tinter.lightingConfidence='skipped';
    Tinter.busy=false;
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
      q('#tinterStatus').textContent='Camera unavailable. The swatch comparison still works without it.';
    }
  };

  Tinter.close=function(){
    q('#tinterModal').hidden=true;
    stopCamera();
  };

  Tinter.clearCompleteButton=clearButtonComplete;

  function init(){
    const actions=q('.builder-actions');
    if(actions&&!q('#tinterOpen'))actions.insertAdjacentHTML('beforeend',`<button type="button" id="tinterOpen" class="secondary tinter-entry">${logoHtml()}</button>`);
    if(!q('#tinterModal'))document.body.insertAdjacentHTML('beforeend',modalHtml());
    q('#tinterOpen').onclick=Tinter.open;
    q('#tinterClose').onclick=Tinter.close;
    q('#tinterWarmth').oninput=applyBalance;
    q('#tinterTint').oninput=applyBalance;
    q('#tinterAutoTemp').onclick=autoBalance;
    wireBuildGuard();
    renderPair();
  }

  const baseCalculate=window.calculateReport;
  window.calculateReport=function(){
    const report=baseCalculate();
    if(Tinter.answers.length){
      ['temp','value','chroma','def','hue'].forEach(key=>{
        report.rec[key]=clampValue((report.rec[key]||0)+(Tinter.nudges[key]||0));
        report.alt[key]=report.rec[key];
      });
      report.tinter={answers:[...Tinter.answers],nudges:{...Tinter.nudges}};
    }
    return report;
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
