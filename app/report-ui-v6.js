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

  function evidenceItems(report){
    const prepared=report.tinter?.evidence;
    if(Array.isArray(prepared)&&prepared.length)return prepared.slice(0,5);

    const answers=(report.tinter?.answers||[]).filter(answer=>answer.axis&&!answer.control);
    if(!answers.length){
      return [
        'Built from the camera-free observations.',
        'The result combines warmth, depth, color strength, and contrast.'
      ];
    }

    const axes=[];
    answers.forEach(answer=>{if(!axes.includes(answer.axis))axes.push(answer.axis)});
    return axes.slice(0,5).map(axis=>{
      const axisAnswers=answers.filter(answer=>answer.axis===axis);
      const decisive=[...axisAnswers].reverse().find(answer=>answer.vote!==0);
      const answer=decisive||axisAnswers[axisAnswers.length-1];
      if(!answer||answer.vote===0)return `No clear difference in the ${axis} comparisons.`;
      return `Preferred ${answer.pick} over ${answer.rejected}.`;
    });
  }

  function evidenceHtml(report){
    return `<ul>${evidenceItems(report).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function outfitsHtml(report){
    return `<div class="outfit-combos">${window.outfitCombinations(report).map(combo=>`<div class="outfit-combo"><span class="combo-dots">${combo.map(color=>`<i style="background:${color[1]}"></i>`).join('')}</span><span>${combo.map(color=>escapeHtml(color[0])).join(' + ')}</span></div>`).join('')}</div>`;
  }

  function surveyBadges(report){
    const tinter=report.tinter;
    if(!tinter)return '';
    const badges=[];
    if(tinter.comparisons)badges.push(`${tinter.comparisons} survey rounds`);
    if(tinter.adaptiveQuestions)badges.push(`${tinter.adaptiveQuestions} adaptive checks`);
    if(typeof tinter.calibrationPassed==='boolean')badges.push(tinter.calibrationPassed?'Calibration passed':'Calibration mixed');
    return badges.map(label=>`<span class="confidence-badge">${escapeHtml(label)}</span>`).join('');
  }

  window.renderReport=function(report){
    window.state.last=report;
    window.state.adjusted=false;
    window.closeDock();
    const named=report.client&&report.client!=='Client';
    const confidence=window.reportConfidence(report);
    const result=q('#result');
    result.className='style-report-card';
    result.innerHTML=`<section id="styleReportCard" class="report-shell">
      <div class="report-mast">
        <p class="report-client-label">${named?'Palette for':'Your color direction'}</p>
        <p class="report-client">${named?escapeHtml(report.client):escapeHtml(window.profileWords(report))}</p>
        <h2 class="report-palette">${escapeHtml(window.seasonName(report))}</h2>
        <p class="report-desc">${escapeHtml(window.styleReportText(report))}</p>
        <div class="report-confidence"><span class="confidence-badge">${escapeHtml(confidence.label)}</span>${surveyBadges(report)}${report.refined?'<span class="confidence-badge">Refined with observations</span>':''}</div>
      </div>
      <div class="report-insight-grid">
        <section class="report-insight"><h3>Why this result</h3>${evidenceHtml(report)}<p class="muted">${escapeHtml(confidence.description)}</p></section>
        <section class="report-insight"><h3>Easy outfit combinations</h3>${outfitsHtml(report)}</section>
        <section class="report-insight report-insight-wide"><h3>Use more carefully near the face</h3><ul>${window.cautionColors(report).map(color=>`<li>${escapeHtml(color)}</li>`).join('')}</ul></section>
      </div>
      <p class="report-palette-title">Wardrobe palette</p>
      <div id="paletteCompare">${window.paletteCompareHtml(window.paletteFromValues(report.rec),window.paletteFromValues(report.alt),false)}</div>
    </section>
    <div class="report-followup"><button type="button" id="refineResult" class="secondary">Refine result</button><button type="button" id="retakeTinter" class="secondary">${report.tinter?'Retake Tinter':'Try Tinter'}</button></div>
    <button type="button" id="openDock" class="secondary adjust-palette">Adjust palette</button>`;
    q('#openDock').onclick=()=>window.renderDock(report);
    q('#refineResult').onclick=()=>window.openRefinement?.({cameraFree:false});
    q('#retakeTinter').onclick=()=>window.Tinter?.open();
  };

  window.sliderCardHtml=function(definition){
    const [id,title,subtitle,left,right]=definition;
    const lock=window.state.last.locks[id];
    const value=window.state.last.alt[id];
    const low=(lock[0]+100)/2;
    const high=(lock[1]+100)/2;
    return `<article class="slide"><div class="slide-head"><div><h3>${escapeHtml(title)}</h3><div class="ios">${escapeHtml(subtitle)} · ${escapeHtml(left)} ↔ ${escapeHtml(right)}</div></div><strong id="v-${id}">${window.signed(value)}</strong></div><div class="lockbar" style="--lo:${low}%;--hi:${high}%"></div><input class="gslider" data-id="${id}" type="range" min="${lock[0]}" max="${lock[1]}" step="1" value="${value}" aria-label="${escapeHtml(title)}"><p class="muted">Best range ${window.signed(lock[0])} to ${window.signed(lock[1])}</p><p class="warn" id="w-${id}"></p></article>`;
  };

  window.renderDock=function(report){
    window.state.last=report;
    document.body.classList.add('dock-open');
    const dock=q('#sliderDock');
    const top=q('.dock-top');
    if(!q('#closeDock'))top.insertAdjacentHTML('beforeend','<button type="button" id="closeDock" class="secondary dock-close" aria-label="Close palette controls">×</button>');
    dock.hidden=false;
    dock.classList.remove('is-hidden');
    q('#outside').checked=false;
    q('#deck').innerHTML=window.SLIDER_DEFS.map(window.sliderCardHtml).join('');
    q('#dots').innerHTML=window.SLIDER_DEFS.map((_,index)=>`<span class="dot ${index===0?'active':''}"></span>`).join('');
    window.state.activeSlide=0;
    q('#deck').scrollTo({left:0});
    window.wireDock();
    window.setupDockAutoHide();
  };

  window.setupDockAutoHide=function(){
    if(window.state.dockAutoHide)return;
    window.state.dockAutoHide=true;
    window.state.lastScrollY=window.scrollY;
    const dock=q('#sliderDock');
    const show=()=>dock.classList.remove('is-hidden');
    const hide=()=>dock.classList.add('is-hidden');
    window.addEventListener('scroll',()=>{
      if(!window.state.last||dock.hidden)return;
      const y=window.scrollY;
      if(y>window.state.lastScrollY+10&&y>140)hide();
      if(y<window.state.lastScrollY-10)show();
      window.state.lastScrollY=y;
    },{passive:true});
    dock.addEventListener('pointerdown',show);
    dock.addEventListener('focusin',show);
  };

  window.updateDots=function(){
    const deck=q('#deck');
    if(!deck||!deck.clientWidth)return;
    window.state.activeSlide=Math.round(deck.scrollLeft/deck.clientWidth);
    qa('.dot').forEach((dot,index)=>dot.classList.toggle('active',index===window.state.activeSlide));
    q('#dockTitle').textContent=window.SLIDER_DEFS[window.state.activeSlide]?.[1]||'Adjust palette';
  };

  window.goSlide=function(direction){
    const deck=q('#deck');
    window.state.activeSlide=Math.max(0,Math.min(window.SLIDER_DEFS.length-1,window.state.activeSlide+direction));
    deck.scrollTo({left:window.state.activeSlide*deck.clientWidth,behavior:'smooth'});
    window.setTimeout(window.updateDots,240);
  };

  window.refreshSliders=function(markAdjusted=false){
    if(!window.state.last)return;
    if(markAdjusted)window.state.adjusted=true;
    const free=q('#outside').checked;
    qa('.gslider').forEach(input=>{
      const id=input.dataset.id;
      const lock=window.state.last.locks[id];
      input.min=free?-100:lock[0];
      input.max=free?100:lock[1];
      let value=window.clampValue(input.value);
      if(!free)value=Math.max(lock[0],Math.min(lock[1],value));
      input.value=value;
      window.state.last.alt[id]=value;
      q(`#v-${id}`).textContent=window.signed(value);
      q(`#w-${id}`).textContent=free&&(value<lock[0]||value>lock[1])?'Outside the recommended range. Use carefully near the face.':'';
    });
    q('#paletteCompare').innerHTML=window.paletteCompareHtml(window.paletteFromValues(window.state.last.rec),window.paletteFromValues(window.state.last.alt),window.state.adjusted);
  };

  window.wireDock=function(){
    const deck=q('#deck');
    q('#outside').onchange=()=>window.refreshSliders(false);
    qa('.gslider').forEach(input=>input.oninput=()=>window.refreshSliders(true));
    q('#prevCard').onclick=()=>window.goSlide(-1);
    q('#nextCard').onclick=()=>window.goSlide(1);
    q('#closeDock').onclick=window.closeDock;
    let scrollTimer=0;
    deck.onscroll=()=>{window.clearTimeout(scrollTimer);scrollTimer=window.setTimeout(window.updateDots,70)};
    window.refreshSliders(false);
  };
})();
