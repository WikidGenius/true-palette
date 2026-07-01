window.paletteCompareHtml=function(rec,alt,adjusted=false){
  const roles=['Light neutral','Main neutral','Dark neutral','Second dark neutral','Main color','Complement color','Accent color','Metal'];
  const card=(c,kind)=>`<article class="palette-swatch-card" data-kind="${kind}"><div class="palette-chip" style="background:${c[1]}"></div><b class="palette-card-name">${c[0]}</b><span class="palette-card-hex">${c[1]}</span></article>`;
  const rows=rec.map((r,i)=>`<section class="palette-card-row"><div class="palette-card-role">${roles[i]||'Color'}</div><div class="palette-card-pair">${card(r,'Recommended')}${adjusted?card(alt[i],'Alternate'):''}</div></section>`).join('');
  return `<div class="palette-card-grid ${adjusted?'adjusted':'single'}">${rows}</div>`;
};
window.renderReport=function(r){
  state.last=r;state.adjusted=false;closeDock();
  const client=(r.client&&r.client!=='Client')?r.client:'Unnamed Client';
  document.querySelector('#result').className='style-report-card';
  document.querySelector('#result').innerHTML=`<section id="styleReportCard" class="report-shell"><div class="report-mast"><p class="report-client-label">Client</p><p class="report-client">${client}</p><h2 class="report-palette">${seasonName(r)}</h2><p class="report-desc">${styleReportText(r)}</p><div class="report-pills"><span class="pill">${r.direction}</span><span class="pill">True Palette Atelier</span></div></div><p class="report-palette-title">Palette Cards</p><div id="paletteCompare">${paletteCompareHtml(paletteFromValues(r.rec),paletteFromValues(r.alt),false)}</div></section><button type="button" id="openDock" class="secondary adjust-palette">Adjust palette</button>`;
  document.querySelector('#openDock').onclick=()=>renderDock(r);
};
