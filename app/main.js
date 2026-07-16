(function(){
  'use strict';

  const q=s=>document.querySelector(s);

  function showLoading(options={}){
    const button=q('#analyze');
    document.body.classList.remove('report-waiting');
    document.body.classList.add('report-ready','has-analysis');
    if(button){button.disabled=true;button.textContent=options.automatic?'Building palette…':'Applying refinements…'}
    const result=q('#result');
    result.className='loading-card';
    result.innerHTML=`<div class="spinner"></div><b>${options.automatic?'Building your palette':'Refining your palette'}</b><p>${options.automatic?'Reading your Tinter choices, consistency, depth, and contrast.':'Blending the optional observations with your Tinter result.'}</p>`;
  }

  window.buildPalette=function(options={}){
    showLoading(options);
    window.setTimeout(()=>{
      renderReport(calculateReport());
      const button=q('#analyze');
      if(button){button.disabled=false;button.textContent=window.Tinter?.result?'Apply refinements':'Build camera-free palette'}
      if(options.automatic||window.matchMedia('(max-width: 900px)').matches)q('.report')?.scrollIntoView({behavior:'smooth',block:'start'});
    },options.automatic?420:360);
  };

  window.openRefinement=function({cameraFree=false}={}){
    const section=q('#refineSection');
    const details=q('#refineDetails');
    if(!section)return;
    section.hidden=false;
    if(details)details.open=true;
    const button=q('#analyze');
    if(cameraFree){
      window.disableRefinement?.();
      if(button)button.textContent='Build camera-free palette';
    }else if(button){
      button.textContent='Apply refinements';
    }
    window.setTimeout(()=>section.scrollIntoView({behavior:'smooth',block:'start'}),40);
  };

  function bindActions(){
    const analyze=q('#analyze');
    if(analyze)analyze.onclick=()=>{
      if(window.Tinter?.result)window.enableRefinement?.();
      window.buildPalette({source:window.Tinter?.result?'refinement':'intake'});
    };

    const noCamera=q('#noCamera');
    if(noCamera)noCamera.onclick=()=>window.openRefinement({cameraFree:true});

    const copy=q('#copy');
    if(copy)copy.onclick=async()=>{
      if(!state.last)return;
      const report=state.last;
      const evidence=report.tinter?.evidence?.length?`\nWhy: ${report.tinter.evidence.join(' ')}`:'';
      const text=`${report.client}: ${seasonName(report)}\n${styleReportText(report)}${evidence}\n${paletteFromValues(report.rec).map(color=>`${color[0]} ${color[1]}`).join('\n')}`;
      try{await navigator.clipboard.writeText(text);copy.textContent='Copied'}catch{window.prompt('Copy report:',text)}
    };

    const json=q('#json');
    if(json)json.onclick=()=>{
      if(!state.last)return;
      const report={...state.last,recommendedPalette:paletteFromValues(state.last.rec),alternatePalette:paletteFromValues(state.last.alt)};
      const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));
      const link=document.createElement('a');
      link.href=url;
      link.download='true-palette-style-report.json';
      link.click();
      window.setTimeout(()=>URL.revokeObjectURL(url),0);
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindActions);
  else bindActions();

  if('serviceWorker' in navigator)navigator.serviceWorker.getRegistrations().then(registrations=>registrations.forEach(registration=>registration.unregister())).catch(()=>{});
})();
