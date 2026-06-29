window.renderReport=function(r){
  state.last=r; state.adjusted=false; closeDock();
  document.querySelector('#result').className='';
  document.querySelector('#result').innerHTML=`<p class="kicker">Style Report</p><div class="result-name">${seasonName(r)}</div><p class="lead" style="font-size:16px;margin-top:-4px">${styleReportText(r)}</p><div><span class="pill">${r.direction}</span><span class="pill">Tap Adjust palette to make an alternate</span></div><h3>Palette</h3><div id="paletteCompare">${paletteCompareHtml(paletteFromValues(r.rec),paletteFromValues(r.alt),false)}</div><button type="button" id="openDock" class="secondary adjust-palette">Adjust palette</button>`;
  document.querySelector('#openDock').onclick=()=>renderDock(r);
};
