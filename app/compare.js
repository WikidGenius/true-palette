window.swatchHtml=p=>`<div class="palette">${p.map(x=>`<div class="color"><div class="patch" style="background:${x[1]}"><span>${x[0]}</span></div><p class="muted">${x[1]}</p></div>`).join('')}</div>`;
window.paletteCompareHtml=function(rec,alt,adjusted=false){
  let roles=['Light neutral','Main neutral','Anchor color','Main color','Accent color','Metal'];
  let head=adjusted?'<div class="compare-head"><b>Color job</b><b>Recommended</b><b>Alternate</b></div>':'';
  let rows=rec.map((r,i)=>`<div class="compare-row"><div class="compare-role">${roles[i]}</div><div class="compare-swatch" style="background:${r[1]}"><span>${r[0]}</span><small>Recommended · ${r[1]}</small></div>${adjusted?`<div class="compare-swatch alternate" style="background:${alt[i][1]}"><span>${alt[i][0]}</span><small>Alternate · ${alt[i][1]}</small></div>`:''}</div>`).join('');
  return `<div class="palette-compare ${adjusted?'adjusted':'single'}">${head}${rows}</div>`;
};
