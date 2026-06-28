window.state={last:null,activeSlide:0,dockAutoHide:false,lastScrollY:0};
window.renderReport=function(r){
  state.last=r;
  document.querySelector('#result').className='';
  document.querySelector('#result').innerHTML=`<p class="kicker">Color Direction</p><div class="result-name">${r.direction}</div><p class="lead" style="font-size:16px;margin-top:-4px">${paletteDescription(r)}</p><div>${['Recommended palette is locked by analysis','Alternate palette updates from the bottom cards'].map(x=>`<span class="pill">${x}</span>`).join('')}</div><h3>Palette Comparison</h3><div class="palette-pair"><div><b>Recommended Palette</b>${swatchHtml(paletteFromValues(r.rec))}</div><div><b>Alternate Palette</b><div id="altPal">${swatchHtml(paletteFromValues(r.alt))}</div></div></div>`;
  renderDock(r);
};
window.sliderCardHtml=function(d,i){
  let id=d[0],l=state.last.locks[id],v=state.last.alt[id],lo=(l[0]+100)/2,hi=(l[1]+100)/2;
  return `<article class="slide"><div class="slide-head"><div><h3>${d[1]}</h3><div class="ios">${d[2]} · ${d[3]} ↔ ${d[4]}</div></div><strong id="v-${id}">${signed(v)}</strong></div><div class="lockbar" style="--lo:${lo}%;--hi:${hi}%"></div><input class="gslider" data-id="${id}" type="range" min="${l[0]}" max="${l[1]}" value="${v}"><p class="muted">Recommended ${signed(state.last.rec[id])} · Allowed ${signed(l[0])} to ${signed(l[1])}</p><p class="warn" id="w-${id}"></p><p class="muted">${l[2]}</p></article>`;
};
window.renderDock=function(r){
  document.body.classList.add('dock-open');
  let dock=document.querySelector('#sliderDock');
  dock.hidden=false;
  dock.classList.remove('is-hidden');
  document.querySelector('#outside').checked=false;
  document.querySelector('#deck').innerHTML=SLIDER_DEFS.map(sliderCardHtml).join('');
  document.querySelector('#dots').innerHTML=SLIDER_DEFS.map((d,i)=>`<span class="dot ${i===0?'active':''}"></span>`).join('');
  state.activeSlide=0;
  document.querySelector('#deck').scrollTo({left:0});
  wireDock();
  setupDockAutoHide();
};
window.setupDockAutoHide=function(){
  if(state.dockAutoHide)return;
  state.dockAutoHide=true;
  state.lastScrollY=window.scrollY;
  let dock=document.querySelector('#sliderDock');
  let show=()=>dock.classList.remove('is-hidden');
  let hide=()=>dock.classList.add('is-hidden');
  window.addEventListener('scroll',()=>{
    if(!state.last || dock.hidden)return;
    let y=window.scrollY;
    if(y>state.lastScrollY+8 && y>120)hide();
    if(y<state.lastScrollY-8)show();
    state.lastScrollY=y;
  },{passive:true});
  dock.addEventListener('pointerdown',show);
  dock.addEventListener('focusin',show);
  dock.addEventListener('touchstart',show,{passive:true});
};
window.updateDots=function(){
  let deck=document.querySelector('#deck');
  state.activeSlide=Math.round(deck.scrollLeft/deck.clientWidth);
  document.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('active',i===state.activeSlide));
  document.querySelector('#dockTitle').textContent=SLIDER_DEFS[state.activeSlide][1];
};
window.goSlide=function(n){
  let deck=document.querySelector('#deck');
  state.activeSlide=Math.max(0,Math.min(SLIDER_DEFS.length-1,state.activeSlide+n));
  deck.scrollTo({left:state.activeSlide*deck.clientWidth,behavior:'smooth'});
  setTimeout(updateDots,220);
};
window.refreshSliders=function(){
  let free=document.querySelector('#outside').checked;
  document.querySelectorAll('.gslider').forEach(i=>{
    let id=i.dataset.id,l=state.last.locks[id];
    i.min=free?-100:l[0]; i.max=free?100:l[1];
    let v=clampValue(+i.value);
    if(!free)v=Math.max(l[0],Math.min(l[1],v));
    i.value=v; state.last.alt[id]=v;
    document.querySelector('#v-'+id).textContent=signed(v);
    document.querySelector('#w-'+id).textContent=free&&(v<l[0]||v>l[1])?'Outside guidance: use carefully near the face.':'';
  });
  document.querySelector('#altPal').innerHTML=swatchHtml(paletteFromValues(state.last.alt));
};
window.wireDock=function(){
  const outside=document.querySelector('#outside'),deck=document.querySelector('#deck');
  outside.onchange=refreshSliders;
  document.querySelectorAll('.gslider').forEach(i=>i.oninput=refreshSliders);
  document.querySelector('#prevCard').onclick=()=>goSlide(-1);
  document.querySelector('#nextCard').onclick=()=>goSlide(1);
  deck.onscroll=()=>{clearTimeout(deck.t);deck.t=setTimeout(updateDots,80)};
  refreshSliders();
};
