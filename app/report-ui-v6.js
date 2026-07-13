(function(){
  'use strict';

  const q=s=>document.querySelector(s);
  const qa=s=>Array.from(document.querySelectorAll(s));
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const roles=['Light neutral','Main neutral','Dark neutral','Second dark neutral','Main color','Complement color','Accent color','Metal'];

  window.state={last:null,activeSlide:0,dockAutoHide:false,lastScrollY:0,adjusted:false};

  window.paletteCompareHtml=function(recommended,alternate,adjusted=false){
    const card=(color,kind)=>`<article class="palette-swatch-card" data-kind="${kind}"><div class="palette-chip" style="background:${color[1]}"></div><b class="palette-card-name">${escapeHtml(color[0])}</b><span class="palette-card-hex">${escapeHtml(color[1])}</span></article>`;
    return `<div class="palette-card-grid ${adjusted?'adjusted':'single'}">${recommended.map((color,index)=>`<section class="palette-card-row"><div class="palette-card-role">${roles[index]||'Color'}</div><div class="palette-card-pair">${card(color,'Recommended')}${adjusted?card(alternate[index],'Alternate'):''}</div></section>`).join('')}</div>`;
  };

  window.closeDock=function(){
    const dock=q('#sliderDock');
    if(!dock)return;
    dock.hidden=true;
    dock.classList.remove('is-hidden');
    document.body.classList.remove('dock-open');
  };

  window.renderReport=function(report){
    state.last=report;
    state.adjusted=false;
    closeDock();
    const client=report.client&&report.client!=='Client'?report.client:'Unnamed Client';
    const result=q('#result');
    result.className='style-report-card';
    result.innerHTML=`<section id="styleReportCard" class="report-shell"><div class="report-mast"><p class="report-client-label">Client</p><p class="report-client">${escapeHtml(client)}</p><h2 class="report-palette">${escapeHtml(seasonName(report))}</h2><p class="report-desc">${escapeHtml(styleReportText(report))}</p><div class="report-pills"><span class="pill">${escapeHtml(report.direction)}</span><span class="pill">True Palette Atelier</span></div></div><p class="report-palette-title">Wardrobe palette</p><div id="paletteCompare">${paletteCompareHtml(paletteFromValues(report.rec),paletteFromValues(report.alt),false)}</div></section><button type="button" id="openDock" class="secondary adjust-palette">Adjust palette</button>`;
    q('#openDock').onclick=()=>renderDock(report);
  };

  window.sliderCardHtml=function(definition){
    const [id,title,subtitle,left,right]=definition;
    const lock=state.last.locks[id];
    const value=state.last.alt[id];
    const low=(lock[0]+100)/2;
    const high=(lock[1]+100)/2;
    return `<article class="slide"><div class="slide-head"><div><h3>${escapeHtml(title)}</h3><div class="ios">${escapeHtml(subtitle)} · ${escapeHtml(left)} ↔ ${escapeHtml(right)}</div></div><strong id="v-${id}">${signed(value)}</strong></div><div class="lockbar" style="--lo:${low}%;--hi:${high}%"></div><input class="gslider" data-id="${id}" type="range" min="${lock[0]}" max="${lock[1]}" step="1" value="${value}" aria-label="${escapeHtml(title)}"><p class="muted">Best range ${signed(lock[0])} to ${signed(lock[1])}</p><p class="warn" id="w-${id}"></p></article>`;
  };

  window.renderDock=function(report){
    state.last=report;
    document.body.classList.add('dock-open');
    const dock=q('#sliderDock');
    const top=q('.dock-top');
    if(!q('#closeDock'))top.insertAdjacentHTML('beforeend','<button type="button" id="closeDock" class="secondary dock-close" aria-label="Close palette controls">×</button>');
    dock.hidden=false;
    dock.classList.remove('is-hidden');
    q('#outside').checked=false;
    q('#deck').innerHTML=SLIDER_DEFS.map(sliderCardHtml).join('');
    q('#dots').innerHTML=SLIDER_DEFS.map((_,index)=>`<span class="dot ${index===0?'active':''}"></span>`).join('');
    state.activeSlide=0;
    q('#deck').scrollTo({left:0});
    wireDock();
    setupDockAutoHide();
  };

  window.setupDockAutoHide=function(){
    if(state.dockAutoHide)return;
    state.dockAutoHide=true;
    state.lastScrollY=window.scrollY;
    const dock=q('#sliderDock');
    const show=()=>dock.classList.remove('is-hidden');
    const hide=()=>dock.classList.add('is-hidden');
    window.addEventListener('scroll',()=>{
      if(!state.last||dock.hidden)return;
      const y=window.scrollY;
      if(y>state.lastScrollY+10&&y>140)hide();
      if(y<state.lastScrollY-10)show();
      state.lastScrollY=y;
    },{passive:true});
    dock.addEventListener('pointerdown',show);
    dock.addEventListener('focusin',show);
  };

  window.updateDots=function(){
    const deck=q('#deck');
    if(!deck||!deck.clientWidth)return;
    state.activeSlide=Math.round(deck.scrollLeft/deck.clientWidth);
    qa('.dot').forEach((dot,index)=>dot.classList.toggle('active',index===state.activeSlide));
    q('#dockTitle').textContent=SLIDER_DEFS[state.activeSlide]?.[1]||'Adjust palette';
  };

  window.goSlide=function(direction){
    const deck=q('#deck');
    state.activeSlide=Math.max(0,Math.min(SLIDER_DEFS.length-1,state.activeSlide+direction));
    deck.scrollTo({left:state.activeSlide*deck.clientWidth,behavior:'smooth'});
    window.setTimeout(updateDots,240);
  };

  window.refreshSliders=function(markAdjusted=false){
    if(!state.last)return;
    if(markAdjusted)state.adjusted=true;
    const free=q('#outside').checked;
    qa('.gslider').forEach(input=>{
      const id=input.dataset.id;
      const lock=state.last.locks[id];
      input.min=free?-100:lock[0];
      input.max=free?100:lock[1];
      let value=clampValue(input.value);
      if(!free)value=Math.max(lock[0],Math.min(lock[1],value));
      input.value=value;
      state.last.alt[id]=value;
      q(`#v-${id}`).textContent=signed(value);
      q(`#w-${id}`).textContent=free&&(value<lock[0]||value>lock[1])?'Outside the recommended range. Use carefully near the face.':'';
    });
    q('#paletteCompare').innerHTML=paletteCompareHtml(paletteFromValues(state.last.rec),paletteFromValues(state.last.alt),state.adjusted);
  };

  window.wireDock=function(){
    const deck=q('#deck');
    q('#outside').onchange=()=>refreshSliders(false);
    qa('.gslider').forEach(input=>input.oninput=()=>refreshSliders(true));
    q('#prevCard').onclick=()=>goSlide(-1);
    q('#nextCard').onclick=()=>goSlide(1);
    q('#closeDock').onclick=closeDock;
    let scrollTimer=0;
    deck.onscroll=()=>{window.clearTimeout(scrollTimer);scrollTimer=window.setTimeout(updateDots,70)};
    refreshSliders(false);
  };
})();
