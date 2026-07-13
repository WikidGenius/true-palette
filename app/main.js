(function(){
  'use strict';

  const q=s=>document.querySelector(s);

  function showLoading(){
    const button=q('#analyze');
    document.body.classList.remove('report-waiting');
    document.body.classList.add('report-ready');
    button.disabled=true;
    button.textContent='Crafting your palette…';
    const result=q('#result');
    result.className='loading-card';
    result.innerHTML='<div class="spinner"></div><b>Crafting your palette</b><p>Balancing warmth, depth, contrast, and Tinter results.</p>';
  }

  window.buildPalette=function(){
    showLoading();
    window.setTimeout(()=>{
      renderReport(calculateReport());
      const button=q('#analyze');
      button.disabled=false;
      button.textContent='Build My Palette';
      if(window.matchMedia('(max-width: 900px)').matches)q('.report')?.scrollIntoView({behavior:'smooth',block:'start'});
    },520);
  };

  function bindActions(){
    const analyze=q('#analyze');
    if(analyze)analyze.onclick=window.buildPalette;

    const copy=q('#copy');
    if(copy)copy.onclick=async()=>{
      if(!state.last)return;
      const report=state.last;
      const text=`${report.client}: ${seasonName(report)}\n${styleReportText(report)}\n${paletteFromValues(report.rec).map(color=>`${color[0]} ${color[1]}`).join('\n')}`;
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
