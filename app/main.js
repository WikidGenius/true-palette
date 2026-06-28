const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
document.querySelector('#questions').innerHTML=QUESTIONS.map(q=>`<div class="field"><div class="field-title">${q[1]} <span>${q[2]}</span></div><p class="how"><b>How to test:</b> ${q[3]}</p><div class="choices">${q[4].map((o,i)=>`<label class="choice"><input type="radio" name="${q[0]}" value="${o[0]}" ${i==1?'checked':''}><span class="box"><span class="name">${o[1]}</span><span>${o[3].map(c=>`<i class="sw" style="background:${c}"></i>`).join('')}</span><p class="desc">${o[2]}</p></span></label>`).join('')}</div></div>`).join('');
function showLoading(){
  let b=$('#analyze');
  b.disabled=true;
  b.textContent='Crafting your palette...';
  $('#result').className='loading-card';
  $('#result').innerHTML='<div class="spinner"></div><b>Crafting your perfect palette</b><p>Reading undertone, depth, contrast, and hue cues.</p>';
}
function build(){
  showLoading();
  setTimeout(()=>{
    renderReport(calculateReport());
    let b=$('#analyze');
    b.disabled=false;
    b.textContent='Build My Palette';
  },850);
}
$('#analyze').onclick=build;
$('#sample').onclick=()=>{
  let sample={whiteCream:'warm',jewelry:'warm',skin:'mid',hair:'deep',hairHue:'warm',eyes:'deep',eyeHue:'warm',contrast:'sharp'};
  $('#client').value='Sample Client';
  Object.entries(sample).forEach(([k,v])=>$$(`input[name="${k}"]`).forEach(i=>i.checked=i.value===v));
  build();
};
$('#copy').onclick=async()=>{
  if(!state.last)renderReport(calculateReport());
  let r=state.last;
  let t=`${r.client}: ${r.direction}\n${paletteDescription(r)}\nRecommended: ${paletteFromValues(r.rec).map(x=>x[0]).join(', ')}\nAlternate: ${paletteFromValues(r.alt).map(x=>x[0]).join(', ')}\n`+SLIDER_DEFS.map(d=>`${d[1]}: ${signed(r.alt[d[0]])}`).join('\n');
  try{await navigator.clipboard.writeText(t);$('#copy').textContent='Copied'}catch{prompt('Copy report:',t)}
};
$('#json').onclick=()=>{
  if(!state.last)renderReport(calculateReport());
  let r=state.last;
  let b=new Blob([JSON.stringify({...r,recommendedPalette:paletteFromValues(r.rec),alternatePalette:paletteFromValues(r.alt)},null,2)],{type:'application/json'});
  let a=document.createElement('a');
  a.href=URL.createObjectURL(b);
  a.download='true-palette-style-report.json';
  a.click();
  URL.revokeObjectURL(a.href);
};
if('serviceWorker'in navigator)navigator.serviceWorker.getRegistrations().then(r=>r.forEach(x=>x.unregister())).catch(()=>{});
