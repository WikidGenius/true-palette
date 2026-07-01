window.renderMixedQuiz=function(){
  const card=(name,val,label,copy,checked='')=>`<label class="choice"><input type="radio" name="${name}" value="${val}" ${checked}><span class="box"><span class="name">${label}</span><p class="desc">${copy}</p></span></label>`;
  const range=(name,title,copy,left,mid,right,val=50)=>`<div class="range-card"><div class="range-head"><div><b>${title}</b><p class="desc">${copy}</p></div><span id="${name}Val">${val}</span></div><input type="range" name="${name}" min="0" max="100" value="${val}" oninput="document.querySelector('#${name}Val').textContent=this.value"><div class="range-labels"><span>${left}</span><span>${mid}</span><span>${right}</span></div></div>`;
  document.querySelector('#questions').innerHTML=`
  <div class="field"><div class="field-title">Quick setup <span>result quality</span></div><div class="setup-grid">
    <label class="setup-card"><input type="checkbox" name="daylight" checked> <b>Daylight or bright natural light</b><span class="desc">Best for judging color.</span></label>
    <label class="setup-card"><input type="checkbox" name="noHeavyMakeup" checked> <b>No heavy makeup or fake tan</b><span class="desc">Keeps the read cleaner.</span></label>
    <label class="setup-card"><input type="checkbox" name="naturalHair" checked> <b>Natural roots or brows visible</b><span class="desc">Helpful if hair is colored.</span></label>
  </div></div>
  <div class="field"><div class="field-title">The White Shirt Test <span>warm or cool</span></div><p class="how">Hold white near the face, then cream. Which one makes the face look clearer and healthier?</p><div class="choices">${card('whiteCream','cool','White Wins','White looks cleaner; cream looks yellow or heavy.','checked')}${card('whiteCream','warm','Cream Wins','Cream looks richer; white looks harsh or gray.')}${card('whiteCream','neutral','Both / Not sure','Both work, or the difference is small.')}</div><div class="confidence">${range('whiteConfidence','How obvious was it?','Subtle means a small nudge. Obvious means a strong signal.','Subtle','Clear','Obvious',55)}</div></div>
  <div class="field"><div class="field-title">The Metal Test <span>gold or silver</span></div><p class="how">Compare gold and silver near the face. Which one looks smoother and more natural?</p><div class="choices">${card('jewelry','cool','Silver Looks Better','Silver or pewter looks cleaner.','checked')}${card('jewelry','warm','Gold Looks Better','Gold or bronze looks warmer.')}${card('jewelry','neutral','Both Metals Work','Both metals look good.')}</div><div class="confidence">${range('metalConfidence','How obvious was it?','Use this to show how strongly the metal test should count.','Subtle','Clear','Obvious',55)}</div></div>
  <div class="field"><div class="field-title">Feature light/dark levels <span>depth</span></div>${range('skinDepth','Skin Light/Dark Level','Look at the skin next to the hair and eyes.','Light','Medium','Deep',50)}${range('hairDepth','Hair Light/Dark Level','Use roots, brows, or the most natural section.','Light','Medium','Deep',50)}${range('eyeDepth','Eye Light/Dark Level','Do the eyes read bright, middle, or deep?','Light','Medium','Deep',50)}</div>
  <div class="field"><div class="field-title">Face contrast <span>soft or sharp</span></div>${range('contrastDepth','Light/Dark Contrast','Compare the lightest and darkest feature points.','Soft','Balanced','Sharp',50)}</div>
  <div class="field"><div class="field-title">Color clues <span>hair and eyes</span></div><p class="how">Use daylight. Pick what you actually see, not what you wish you saw.</p><div class="choices">${card('hairHue','cool','Ash / Smoke','Cool reflection.','checked')}${card('hairHue','warm','Gold / Copper','Warm reflection.')}${card('hairHue','neutral','Hard to Tell','No clear direction.')}</div><div class="choices" style="margin-top:10px">${card('eyeHue','cool','Cool Flecks','Blue, slate, gray, or cool green.','checked')}${card('eyeHue','warm','Warm Flecks','Gold, amber, copper, or olive.')}${card('eyeHue','neutral','Mixed / Quiet','Mixed signals.')}</div></div>
  <div class="field"><div class="field-title">Optional quick checks <span>bonus precision</span></div><p class="optional-note">Skip these if you are not sure. They help with border cases like Autumn-Winter or Summer-Autumn.</p><div class="confirm-grid">
    <div class="confirm-row"><label class="mini-choice"><input type="radio" name="neutralCheck" value="warm">Camel looks better</label><label class="mini-choice"><input type="radio" name="neutralCheck" value="cool">Soft gray looks better</label><label class="mini-choice"><input type="radio" name="neutralCheck" value="both" checked>Both / skip</label></div>
    <div class="confirm-row"><label class="mini-choice"><input type="radio" name="accentCheck" value="warm">Terracotta pops</label><label class="mini-choice"><input type="radio" name="accentCheck" value="cool">Berry pops</label><label class="mini-choice"><input type="radio" name="accentCheck" value="both" checked>Both / skip</label></div>
    <div class="confirm-row"><label class="mini-choice"><input type="radio" name="chromaCheck" value="soft">Muted looks smoother</label><label class="mini-choice"><input type="radio" name="chromaCheck" value="clear">Clear looks better</label><label class="mini-choice"><input type="radio" name="chromaCheck" value="both" checked>Both / skip</label></div>
  </div></div>`;
};
window.calculateReport=function(){
  let a=Object.fromEntries(new FormData(document.querySelector('#quiz')).entries()),w=0,hc=0;
  let wc=+(a.whiteConfidence||50),mc=+(a.metalConfidence||50);
  if(a.whiteCream==='warm')w+=18+wc*.35;if(a.whiteCream==='cool')w-=18+wc*.35;
  if(a.jewelry==='warm')w+=14+mc*.28;if(a.jewelry==='cool')w-=14+mc*.28;
  if(a.hairHue==='warm'){w+=14;hc++}if(a.hairHue==='cool'){w-=14;hc--}
  if(a.eyeHue==='warm'){w+=14;hc++}if(a.eyeHue==='cool'){w-=14;hc--}
  if(a.neutralCheck==='warm')w+=10;if(a.neutralCheck==='cool')w-=10;
  if(a.accentCheck==='warm'){hc++;w+=6}if(a.accentCheck==='cool'){hc--;w-=6}
  w=clampValue(w);
  let depthVals=[+(a.skinDepth||50),+(a.hairDepth||50),+(a.eyeDepth||50)].map(x=>(x-50)/50);
  let d=depthVals.reduce((s,x)=>s+x,0)/3,contrast=+(a.contrastDepth||50),sat=clampValue((contrast-50)*1.2+10),def=clampValue((contrast-50)*1.1+8);
  if(a.chromaCheck==='soft'){sat=clampValue(sat-15);def=clampValue(def-8)}if(a.chromaCheck==='clear'){sat=clampValue(sat+15);def=clampValue(def+8)}
  let val=clampValue(d*-42),contrastWord=contrast<35?'soft':contrast>65?'sharp':'balanced',rec={temp:w,value:val,chroma:sat,def:def,hue:hc>0?55:hc<0?-55:0},locks=lockRanges({contrast:contrastWord},w,d,hc);
  Object.keys(rec).forEach(k=>rec[k]=clampValue(Math.max(locks[k][0],Math.min(locks[k][1],rec[k]))));
  let name=[w>22?'Warm':w<-22?'Cool':'Balanced',d>.33?'Deep':d<-.33?'Light':'Medium',def>20?'Defined':def<-20?'Soft':'Tailored'].join(' ');
  return {client:a.client||'Client',direction:name,rec,alt:{...rec},locks};
};
renderMixedQuiz();
if(document.querySelector('#sample'))document.querySelector('#sample').onclick=()=>{document.querySelector('#client').value='Sample Client';renderMixedQuiz();document.querySelector('[name=whiteCream][value=warm]').checked=true;document.querySelector('[name=jewelry][value=warm]').checked=true;document.querySelector('[name=hairHue][value=warm]').checked=true;document.querySelector('[name=eyeHue][value=warm]').checked=true;['skinDepth','hairDepth','eyeDepth','contrastDepth'].forEach((n,i)=>{let e=document.querySelector(`[name=${n}]`);e.value=[55,85,80,82][i];document.querySelector('#'+n+'Val').textContent=e.value});build()};
