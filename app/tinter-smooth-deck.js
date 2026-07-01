(function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function stage(){return document.querySelector('#tinterStage')}
  function cloneStageOnce(){
    const s=stage();
    if(!s||s.dataset.smoothReady)return s;
    const fresh=s.cloneNode(true);
    s.replaceWith(fresh);
    fresh.dataset.smoothReady='true';
    return fresh;
  }
  function htmlCard(side,c){
    return `<article class="smooth-card" data-side="${side}"><div class="smooth-chip" style="background:${c.hex}"></div><b class="smooth-name">${c.name}</b><span class="smooth-hex">${c.hex}</span></article>`;
  }
  function ensureSmoothDeck(){
    const s=cloneStageOnce();
    if(!s||!TINTER_PAIRS||!TINTER_PAIRS[Tinter.i])return;
    s.classList.add('smooth-swatch-mode');
    if(!s.querySelector('#smoothDrape'))s.insertAdjacentHTML('beforeend','<div id="smoothDrape" class="smooth-drape-preview"></div>');
    if(!s.querySelector('#smoothHint'))s.insertAdjacentHTML('beforeend','<div id="smoothHint" class="smooth-hint">Drag a swatch up toward your face</div>');
    if(!s.querySelector('#smoothDeck'))s.insertAdjacentHTML('beforeend','<div id="smoothDeck" class="smooth-deck"></div>');
    renderSmoothCards();
    if(Tinter.ensureBalance)Tinter.ensureBalance();
  }
  function renderSmoothCards(){
    const p=TINTER_PAIRS[Tinter.i],deck=document.querySelector('#smoothDeck');
    if(!p||!deck)return;
    deck.innerHTML=htmlCard('left',p.left)+htmlCard('right',p.right);
    deck.querySelectorAll('.smooth-card').forEach(wireSmoothCard);
    clearSmoothPreview();
  }
  function setPreview(side,progress){
    const s=stage(),p=TINTER_PAIRS[Tinter.i];
    if(!s||!p)return;
    s.style.setProperty('--smoothColor',p[side].hex);
    s.style.setProperty('--smoothScale',String(.18+progress*.82));
    s.style.setProperty('--smoothAlpha',String(.08+progress*.68));
  }
  function clearSmoothPreview(){
    const s=stage();
    if(!s)return;
    s.classList.remove('smooth-done');
    s.style.setProperty('--smoothScale','0');
    s.style.setProperty('--smoothAlpha','0');
    document.querySelectorAll('.smooth-card').forEach(c=>c.classList.remove('is-muted','is-dragging','is-throwing'));
  }
  function wireSmoothCard(card){
    let sx=0,sy=0,dx=0,dy=0,drag=false,raf=0,side=card.dataset.side;
    const s=stage();
    function draw(){
      raf=0;
      const up=Math.max(0,-dy),progress=clamp(up/(s.clientHeight*.42),0,1),rot=clamp(dx/16,-12,12),scale=1+progress*.1;
      card.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rot}deg) scale(${scale})`;
      setPreview(side,progress);
      document.querySelectorAll('.smooth-card').forEach(c=>{if(c!==card)c.classList.toggle('is-muted',progress>.08)});
    }
    card.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag=true;sx=e.clientX;sy=e.clientY;dx=dy=0;card.classList.add('is-dragging');card.setPointerCapture(e.pointerId)});
    card.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();e.stopPropagation();dx=e.clientX-sx;dy=e.clientY-sy;if(!raf)raf=requestAnimationFrame(draw)});
    card.addEventListener('pointerup',e=>{if(!drag)return;e.preventDefault();e.stopPropagation();drag=false;card.classList.remove('is-dragging');const progress=clamp(Math.max(0,-dy)/(s.clientHeight*.42),0,1);progress>.52||dy<-145?commitSmooth(card,side,dx,dy):cancelSmooth(card)});
  }
  function cancelSmooth(card){card.style.transform='';clearSmoothPreview()}
  function commitSmooth(card,side,dx,dy){
    const s=stage();
    card.classList.add('is-throwing');
    card.style.transform=`translate3d(${dx*1.15}px,${dy-260}px,0) rotate(${dx>0?18:-18}deg) scale(1.18)`;
    s.classList.add('smooth-done');
    s.style.setProperty('--smoothScale','1');
    s.style.setProperty('--smoothAlpha','.82');
    chooseSmooth(side);
  }
  function chooseSmooth(side){
    const p=TINTER_PAIRS[Tinter.i],pick=p[side],weight=Tinter.lightingConfidence==='low'?.7:Tinter.lightingConfidence==='okay'?.85:1;
    Object.entries(pick.nudge).forEach(([k,v])=>Tinter.nudges[k]=(Tinter.nudges[k]||0)+Math.round(v*weight));
    Tinter.answers.push({prompt:p.prompt,pick:pick.name});
    setTimeout(()=>{Tinter.i++;Tinter.i>=TINTER_PAIRS.length?Tinter.done():Tinter.renderPair()},230);
  }
  Tinter.choose=chooseSmooth;
  Tinter.wireSwipe=function(){};
  const priorRender=Tinter.renderPair;
  Tinter.renderPair=function(){priorRender();ensureSmoothDeck()};
  const priorDone=Tinter.done;
  Tinter.done=function(){priorDone();const s=stage();if(s)s.classList.add('smooth-done')};
  const oldOpen=Tinter.open;
  Tinter.open=async function(){
    Tinter.i=0;Tinter.answers=[];Tinter.nudges={temp:0,value:0,chroma:0,def:0,hue:0};
    Tinter.lightingCorrection=0;Tinter.tintCorrection=0;Tinter.lightingConfidence='skipped';
    document.querySelector('#tinterModal').hidden=false;
    document.querySelector('#tinterCard').classList.remove('done');
    document.querySelector('#tinterSummary').style.display='none';
    Tinter.renderPair();
    try{Tinter.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});document.querySelector('#tinterVideo').srcObject=Tinter.stream;document.querySelector('#tinterStatus').textContent='Balance the camera, then drag a swatch toward your face.'}
    catch(e){document.querySelector('#tinterStatus').textContent='Camera unavailable. You can still drag the swatch cards.'}
  };
  (function rebindOpen(){const b=document.querySelector('#tinterOpen');if(!b)return;const c=b.cloneNode(true);b.replaceWith(c);c.onclick=Tinter.open})();
  ensureSmoothDeck();
})();
