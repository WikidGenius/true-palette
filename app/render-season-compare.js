window.renderReport=function(r){
  state.last=r; state.adjusted=false; closeDock();
  document.querySelector('#result').className='';
  document.querySelector('#result').innerHTML=`<p class="kicker">Color Direction</p><div class="result-name">${r.direction}${seasonBadge(r)}</div><p class="lead" style="font-size:16px;margin-top:-4px">${paletteDescription(r)}</p><div><span class="pill">Recommended palette is locked by analysis</span><span class="pill">Tap Adjust palette to make an alternate</span></div><h3>Palette</h3><div id="paletteCompare">${paletteCompareHtml(paletteFromValues(r.rec),paletteFromValues(r.alt),false)}</div><button type="button" id="openDock" class="secondary adjust-palette">Adjust palette</button>`;
  document.querySelector('#openDock').onclick=()=>renderDock(r);
};
window.refreshSliders=function(markAdjusted=false){
  if(markAdjusted)state.adjusted=true;
  let free=document.querySelector('#outside').checked;
  document.querySelectorAll('.gslider').forEach(i=>{let id=i.dataset.id,l=state.last.locks[id];i.min=free?-100:l[0];i.max=free?100:l[1];let v=clampValue(+i.value);if(!free)v=Math.max(l[0],Math.min(l[1],v));i.value=v;state.last.alt[id]=v;document.querySelector('#v-'+id).textContent=signed(v);document.querySelector('#w-'+id).textContent=free&&(v<l[0]||v>l[1])?'Outside your best range. Use carefully near the face.':''});
  document.querySelector('#paletteCompare').innerHTML=paletteCompareHtml(paletteFromValues(state.last.rec),paletteFromValues(state.last.alt),!!state.adjusted);
};
window.wireDock=function(){
  const outside=document.querySelector('#outside'),deck=document.querySelector('#deck');
  outside.onchange=()=>refreshSliders(false);
  document.querySelectorAll('.gslider').forEach(i=>i.oninput=()=>refreshSliders(true));
  document.querySelector('#prevCard').onclick=()=>goSlide(-1);
  document.querySelector('#nextCard').onclick=()=>goSlide(1);
  document.querySelector('#closeDock').onclick=closeDock;
  deck.onscroll=()=>{clearTimeout(deck.t);deck.t=setTimeout(updateDots,80)};
  refreshSliders(false);
};
