(function(){
  function ensureDeck(){
    const stage=document.querySelector('#tinterStage');
    if(!stage||!window.TINTER_PAIRS)return;
    stage.classList.add('swatch-mode');
    if(!document.querySelector('#tinterDrapePreview'))stage.insertAdjacentHTML('beforeend','<div id="tinterDrapePreview" class="tinter-drape-preview"></div>');
    if(!document.querySelector('#swatchDeck'))stage.insertAdjacentHTML('beforeend','<div id="swatchHint" class="swatch-hint">Drag a swatch up toward your face</div><div id="swatchDeck" class="swatch-deck"></div>');
    renderCards();
  }
  function renderCards(){
    const pair=TINTER_PAIRS[Tinter.i],deck=document.querySelector('#swatchDeck');
    if(!pair||!deck)return;
    deck.innerHTML=['left','right'].map(side=>{let c=pair[side];return `<article class="swatch-card" data-side="${side}"><div class="swatch-chip" style="background:${c.hex}"></div><b class="swatch-name">${c.name}</b><span class="swatch-hex">${c.hex}</span></article>`}).join('');
    deck.querySelectorAll('.swatch-card').forEach(wireCard);
  }
  function setPreview(side,progress){
    const stage=document.querySelector('#tinterStage'),pair=TINTER_PAIRS[Tinter.i];
    if(!stage||!pair)return;
    stage.style.setProperty('--swatchColor',pair[side].hex);
    stage.style.setProperty('--drapeOpacity',Math.min(.72,.12+progress*.62));
    stage.classList.add('dragging-card');
  }
  function clearPreview(){let st=document.querySelector('#tinterStage');if(st){st.style.setProperty('--drapeOpacity',0);st.classList.remove('dragging-card','swatch-commit')}}
  function wireCard(card){
    let sx=0,sy=0,dx=0,dy=0,drag=false,raf=0,side=card.dataset.side;
    const stage=document.querySelector('#tinterStage');
    function draw(){raf=0;let up=Math.max(0,-dy),p=Math.min(1,up/(stage.clientHeight*.42)),rot=Math.max(-12,Math.min(12,dx/14+(side==='left'?-4:4))),scale=1+p*.1;card.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rot}deg) scale(${scale})`;setPreview(side,p);document.querySelectorAll('.swatch-card').forEach(c=>c!==card&&c.classList.toggle('is-muted',p>.08));}
    card.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;sy=e.clientY;dx=dy=0;card.classList.add('dragging');card.setPointerCapture(e.pointerId)});
    card.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;dy=e.clientY-sy;if(!raf)raf=requestAnimationFrame(draw)});
    card.addEventListener('pointerup',()=>{if(!drag)return;drag=false;let p=Math.min(1,Math.max(0,-dy)/(stage.clientHeight*.42));card.classList.remove('dragging');if(p>.52||dy<-145){commit(card,side,dx,dy)}else{cancel(card)}});
  }
  function cancel(card){card.style.transform='';document.querySelectorAll('.swatch-card').forEach(c=>c.classList.remove('is-muted'));clearPreview()}
  function commit(card,side,dx,dy){const stage=document.querySelector('#tinterStage');stage.classList.add('swatch-commit');card.classList.add('throwing');card.style.transform=`translate3d(${dx*1.25}px,${dy-260}px,0) rotate(${dx>0?18:-18}deg) scale(1.18)`;setTimeout(()=>{Tinter.choose(side);clearPreview()},210)}
  const oldRender=Tinter.renderPair;
  Tinter.renderPair=function(){oldRender();ensureDeck();clearPreview()};
  const oldDone=Tinter.done;
  Tinter.done=function(){oldDone();let d=document.querySelector('#swatchDeck'),h=document.querySelector('#swatchHint');if(d)d.innerHTML='';if(h)h.style.display='none'};
  ensureDeck();
})();
