(function(){
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const $=s=>document.querySelector(s);
  function stage(){return $('#tinterStage')}
  function pair(){return TINTER_PAIRS[Tinter.i]}
  function prepareStage(){
    let s=stage();
    if(!s)return null;
    if(!s.dataset.optimized){let fresh=s.cloneNode(true);s.replaceWith(fresh);s=fresh;s.dataset.optimized='true'}
    s.classList.add('smooth-swatch-mode');
    if(!$('#smoothDrape'))s.insertAdjacentHTML('beforeend','<div id="smoothDrape" class="smooth-drape-preview"></div>');
    if(!$('#smoothHint'))s.insertAdjacentHTML('beforeend','<div id="smoothHint" class="smooth-hint">Drag a swatch up toward your face</div>');
    if(!$('#smoothDeck'))s.insertAdjacentHTML('beforeend','<div id="smoothDeck" class="smooth-deck"></div>');
    if(Tinter.ensureBalance)Tinter.ensureBalance();
    return s;
  }
  function cardHtml(side,c){return `<article class="smooth-card" data-side="${side}"><div class="smooth-chip" style="background:${c.hex}"></div><b class="smooth-name">${c.name}</b><span class="smooth-hex">${c.hex}</span></article>`}
  function clearPreview(){let s=stage(),d=$('#smoothDrape');if(s)s.classList.remove('smooth-done');if(d){d.style.opacity='0';d.style.transform='translate3d(0,0,0) scaleY(0)'}document.querySelectorAll('.smooth-card').forEach(c=>{c.classList.remove('is-muted','is-dragging','is-throwing');c.style.transform=''})}
  function render(){
    let s=prepareStage(),p=pair(),deck=$('#smoothDeck');if(!s||!p||!deck)return;
    $('#tinterPrompt').textContent=p.prompt;
    $('#tinterBar').style.width=(Tinter.i/TINTER_PAIRS.length*100)+'%';
    deck.innerHTML=cardHtml('left',p.left)+cardHtml('right',p.right);
    deck.querySelectorAll('.smooth-card').forEach(wireCard);
    if($('#smoothHint'))$('#smoothHint').style.display='block';
    clearPreview();
  }
  function setPreview(side,progress){
    let d=$('#smoothDrape'),p=pair();if(!d||!p)return;
    let hex=p[side].hex;
    if(d.dataset.color!==hex){d.dataset.color=hex;d.style.background=`linear-gradient(to top,${hex} 0%,${hex} 46%,${hex}99 68%,transparent 100%)`}
    d.style.opacity=String(.08+progress*.68);
    d.style.transform=`translate3d(0,0,0) scaleY(${.18+progress*.82})`;
  }
  function wireCard(card){
    let sx=0,sy=0,dx=0,dy=0,drag=false,raf=0,side=card.dataset.side,other=null,stageHeight=1;
    function draw(){raf=0;let up=Math.max(0,-dy),progress=clamp(up/(stageHeight*.42),0,1),rot=clamp(dx/16,-12,12),scale=1+progress*.1;card.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${rot}deg) scale(${scale})`;setPreview(side,progress);if(other)other.classList.toggle('is-muted',progress>.08)}
    card.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();drag=true;sx=e.clientX;sy=e.clientY;dx=dy=0;stageHeight=stage().clientHeight||1;other=[...document.querySelectorAll('.smooth-card')].find(c=>c!==card);card.classList.add('is-dragging');card.setPointerCapture(e.pointerId)});
    card.addEventListener('pointermove',e=>{if(!drag)return;e.preventDefault();e.stopPropagation();dx=e.clientX-sx;dy=e.clientY-sy;if(!raf)raf=requestAnimationFrame(draw)});
    card.addEventListener('pointerup',e=>{if(!drag)return;e.preventDefault();e.stopPropagation();drag=false;card.classList.remove('is-dragging');let progress=clamp(Math.max(0,-dy)/(stageHeight*.42),0,1);progress>.52||dy<-145?commit(card,side,dx,dy):cancel(card)});
    card.addEventListener('pointercancel',()=>{if(drag){drag=false;cancel(card)}});
  }
  function cancel(card){card.style.transform='';clearPreview()}
  function commit(card,side,dx,dy){let s=stage();card.classList.add('is-throwing');card.style.transform=`translate3d(${dx*1.15}px,${dy-260}px,0) rotate(${dx>0?18:-18}deg) scale(1.18)`;s.classList.add('smooth-done');let d=$('#smoothDrape');if(d){d.style.opacity='.82';d.style.transform='translate3d(0,0,0) scaleY(1)'}choose(side)}
  function choose(side){let p=pair(),pick=p[side],weight=Tinter.lightingConfidence==='low'?.7:Tinter.lightingConfidence==='okay'?.85:1;Object.entries(pick.nudge).forEach(([k,v])=>Tinter.nudges[k]=(Tinter.nudges[k]||0)+Math.round(v*weight));Tinter.answers.push({prompt:p.prompt,pick:pick.name});setTimeout(()=>{Tinter.i++;Tinter.i>=TINTER_PAIRS.length?Tinter.done():Tinter.renderPair()},230)}
  Tinter.renderPair=render;
  Tinter.choose=choose;
  Tinter.wireSwipe=function(){};
  const baseDone=Tinter.done;
  Tinter.done=function(){baseDone();let s=stage();if(s)s.classList.add('smooth-done');let h=$('#smoothHint'),d=$('#smoothDeck');if(h)h.style.display='none';if(d)d.innerHTML=''};
  Tinter.open=async function(){Tinter.i=0;Tinter.answers=[];Tinter.nudges={temp:0,value:0,chroma:0,def:0,hue:0};Tinter.lightingCorrection=0;Tinter.tintCorrection=0;Tinter.lightingConfidence='skipped';$('#tinterModal').hidden=false;$('#tinterCard').classList.remove('done');$('#tinterSummary').style.display='none';render();try{Tinter.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});$('#tinterVideo').srcObject=Tinter.stream;$('#tinterStatus').textContent='Balance the camera, then drag a swatch toward your face.'}catch(e){$('#tinterStatus').textContent='Camera unavailable. You can still drag the swatch cards.'}};
  (function bindOpen(){let b=$('#tinterOpen');if(!b)return;let c=b.cloneNode(true);b.replaceWith(c);c.onclick=Tinter.open})();
  render();
})();
