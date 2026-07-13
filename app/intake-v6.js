(function(){
  'use strict';

  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const q=s=>document.querySelector(s);

  window.clampValue=n=>clamp(Math.round(Number(n)||0),-100,100);
  window.signed=n=>`${n>0?'+':''}${Math.round(Number(n)||0)}`;
  window.SLIDER_DEFS=[
    ['temp','Warm or Cool','Color temperature','Cool','Warm'],
    ['value','Light or Dark','Overall depth','Deep','Light'],
    ['chroma','Color Strength','Softness or clarity','Quiet','Clear'],
    ['def','Light/Dark Contrast','Feature definition','Soft','Sharp'],
    ['hue','Accent Direction','Supporting color family','Cool Colors','Warm Colors']
  ];

  window.lockRanges=function({contrast},warmth,depth,hueCue){
    return {
      temp:warmth>22?[20,90,'The observations point warm.']:warmth<-22?[-90,-20,'The observations point cool.']:[-35,35,'The observations are balanced.'],
      value:depth>.33?[-90,10,'Deeper colors carry the features better.']:depth<-.33?[-70,90,'Very dark colors may feel heavy near the face.']:[-60,60,'Extreme light and dark values are less reliable.'],
      chroma:contrast==='soft'?[-90,15,'Soft features favor blended color.']:contrast==='sharp'?[-5,90,'Defined features support clearer color.']:[-45,60,'Balanced features favor wearable color strength.'],
      def:contrast==='soft'?[-85,15,'Lower contrast supports softer features.']:contrast==='sharp'?[-5,90,'Higher contrast supports stronger definition.']:[-40,65,'Clean, moderate contrast is the safest range.'],
      hue:hueCue>0?[15,90,'Hair and eye cues lean warm.']:hueCue<0?[-90,-15,'Hair and eye cues lean cool.']:[-45,45,'Hair and eye cues are mixed.']
    };
  };

  const swatches=colors=>`<div class="quiz-swatch-row" aria-hidden="true">${colors.map(color=>`<i class="quiz-swatch" style="background:${color}"></i>`).join('')}</div>`;
  const choice=(name,value,title,description,colors,checked=false)=>`<label class="choice"><input type="radio" name="${name}" value="${value}" ${checked?'checked':''}><span class="box"><span class="name">${title}</span>${swatches(colors)}<span class="desc">${description}</span></span></label>`;
  const confidenceEmojis=()=>'<div class="confidence-emoji-row" aria-hidden="true"><span>😩</span><span>😬</span><span>🤔</span><span>☺️</span><span>😎</span></div>';
  const contrastExamples=()=>`<div class="contrast-pair-row" aria-hidden="true">
    <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#1b1410"></i><i style="background:#3b271f"></i></span><small>low deep</small></span>
    <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#d7b477"></i><i style="background:#efd5bf"></i></span><small>low light</small></span>
    <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#6f452e"></i><i style="background:#9f6f52"></i></span><small>balanced</small></span>
    <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#2b1d18"></i><i style="background:#d8ad8f"></i></span><small>medium high</small></span>
    <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#080808"></i><i style="background:#f2dccd"></i></span><small>high</small></span>
  </div>`;
  const range=({name,title,description,left,middle,right,value=50,visual=''})=>`<div class="range-card"><div class="range-head"><div><b>${title}</b><p class="desc">${description}</p>${visual}</div><output id="${name}Val" for="${name}">${value}</output></div><input id="${name}" type="range" name="${name}" min="0" max="100" value="${value}" data-output="${name}Val"><div class="range-labels"><span>${left}</span><span>${middle}</span><span>${right}</span></div></div>`;
  const section=(step,title,copy,content)=>`<section class="app-section quiz-section"><header class="app-section-head"><p class="app-section-kicker">Step ${step}</p><h3 class="app-section-title">${title}</h3><p class="app-section-copy">${copy}</p></header>${content}</section>`;

  function renderIntake(){
    const root=q('#questions');
    if(!root)return;
    root.innerHTML=[
      section(1,'Prep','Set the conditions so the color comparisons are easier to trust.',`<div class="field"><div class="field-title">Lighting and appearance <span>check all</span></div><div class="setup-grid">
        <label class="setup-card"><input type="checkbox" name="daylight" checked><span><b>Natural light</b><span class="desc">Daylight or bright indirect light.</span></span></label>
        <label class="setup-card"><input type="checkbox" name="noHeavyMakeup" checked><span><b>Minimal color correction</b><span class="desc">No heavy makeup or artificial tan.</span></span></label>
        <label class="setup-card"><input type="checkbox" name="naturalHair" checked><span><b>Natural coloring visible</b><span class="desc">Roots, brows, or natural hair are visible.</span></span></label>
      </div></div>`),
      section(2,'Drape tests','Compare simple props near the face to establish warm, cool, or balanced coloring.',`<div class="field"><div class="field-title">White or cream <span>pick one</span></div><p class="how">Hold white near the face, then cream. Which makes the face look clearer and healthier?</p><div class="choices">
        ${choice('whiteCream','cool','White wins','White looks fresh; cream looks yellow or heavy.',['#ffffff','#f4f6fb','#dfe7f5'],true)}
        ${choice('whiteCream','warm','Cream wins','Cream looks rich; white looks stark or gray.',['#fff4df','#efdfc3','#d8ba8d'])}
        ${choice('whiteCream','neutral','Both work','The difference is small or both look natural.',['#ffffff','#f2e7d5','#d9d5ce'])}
      </div><div class="confidence">${range({name:'whiteConfidence',title:'How clear was the difference?',description:'Move right only when one option clearly wins.',left:'Subtle',middle:'Clear',right:'Obvious',value:55,visual:confidenceEmojis()})}</div></div>
      <div class="field"><div class="field-title">Silver or gold <span>pick one</span></div><p class="how">Compare silver and gold near the face. Which looks smoother and more natural?</p><div class="choices">
        ${choice('jewelry','cool','Silver wins','Silver or pewter looks cleaner.',['#f7f7f5','#c9d0d4','#8f979d'],true)}
        ${choice('jewelry','warm','Gold wins','Gold or bronze looks warmer.',['#ead9a4','#c7a356','#8a6335'])}
        ${choice('jewelry','neutral','Both work','Both metals look natural.',['#c9d0d4','#c8ae70','#9aa0a4'])}
      </div><div class="confidence">${range({name:'metalConfidence',title:'How clear was the difference?',description:'Move right only when one metal clearly wins.',left:'Subtle',middle:'Clear',right:'Obvious',value:55,visual:confidenceEmojis()})}</div></div>`),
      section(3,'Feature depth','Set the light-to-dark weight of the face before judging color strength.',`<div class="field"><div class="field-title">Skin, hair, and eyes <span>sliders</span></div><p class="how">Judge overall lightness or depth, not ethnicity or undertone.</p>
        ${range({name:'skinDepth',title:'Skin light/dark level',description:'Compare the skin with the hair and eyes.',left:'Light',middle:'Medium',right:'Deep',visual:swatches(['#f4dfd2','#d8ad8f','#a56f52','#6a3f2f','#2f1d17'])})}
        ${range({name:'hairDepth',title:'Hair light/dark level',description:'Use roots, brows, or the most natural section.',left:'Light',middle:'Medium',right:'Deep',visual:swatches(['#f3dfad','#b9854f','#6f452e','#2d211b','#0e0e0d'])})}
        ${range({name:'eyeDepth',title:'Eye light/dark level',description:'Judge the overall visual weight of the eyes.',left:'Light',middle:'Medium',right:'Deep',visual:swatches(['#b7d1d1','#98a471','#7a5a35','#3a2920','#151414'])})}
      </div><div class="field"><div class="field-title">Face contrast <span>slider</span></div>${range({name:'contrastDepth',title:'Light/dark contrast',description:'Compare the lightest and darkest natural features.',left:'Soft',middle:'Balanced',right:'Sharp',visual:contrastExamples()})}</div>`),
      section(4,'Color clues','Use visible hair shine and eye flecks as supporting evidence, not the main decision.',`<div class="field"><p class="mini-question color-clue-heading">Hair shine<span class="mini-help">Look for the reflection in natural hair, roots, or brows.</span></p><div class="choices">
        ${choice('hairHue','cool','Ash / smoke','The reflection reads gray, smoky, or cool.',['#8a8580','#5d6370','#25313d'],true)}
        ${choice('hairHue','warm','Gold / copper','The reflection reads gold, copper, or red-brown.',['#c28a45','#9b4d32','#70442d'])}
        ${choice('hairHue','neutral','Hard to tell','There is no clear warm or cool reflection.',['#8b7562','#625b53','#746b62'])}
      </div><p class="mini-question color-clue-heading">Eye flecks<span class="mini-help">Look for the strongest flecks, ring, or overall cast.</span></p><div class="choices">
        ${choice('eyeHue','cool','Cool flecks','Blue, slate, gray, or cool green.',['#7b9db4','#536575','#416b5a'],true)}
        ${choice('eyeHue','warm','Warm flecks','Gold, amber, copper, or olive.',['#a9783e','#7f753b','#b08a4e'])}
        ${choice('eyeHue','neutral','Mixed / quiet','The signals are mixed or subtle.',['#687064','#7a5c3d','#607b87'])}
      </div></div>`)
    ].join('');
  }

  window.calculateReport=function(){
    const values=Object.fromEntries(new FormData(q('#quiz')).entries());
    const whiteConfidence=Number(values.whiteConfidence||50);
    const metalConfidence=Number(values.metalConfidence||50);
    let warmth=0,hueCue=0;
    if(values.whiteCream==='warm')warmth+=18+whiteConfidence*.35;
    if(values.whiteCream==='cool')warmth-=18+whiteConfidence*.35;
    if(values.jewelry==='warm')warmth+=14+metalConfidence*.28;
    if(values.jewelry==='cool')warmth-=14+metalConfidence*.28;
    if(values.hairHue==='warm'){warmth+=14;hueCue++}
    if(values.hairHue==='cool'){warmth-=14;hueCue--}
    if(values.eyeHue==='warm'){warmth+=14;hueCue++}
    if(values.eyeHue==='cool'){warmth-=14;hueCue--}
    warmth=clampValue(warmth);

    const skin=Number(values.skinDepth||50),hair=Number(values.hairDepth||50),eyes=Number(values.eyeDepth||50);
    const weightedDepth=.35*skin+.45*hair+.20*eyes;
    const depth=(weightedDepth-50)/50;
    const contrast=Number(values.contrastDepth||50);
    const contrastWord=contrast<35?'soft':contrast>65?'sharp':'balanced';
    const rec={
      temp:warmth,
      value:clampValue(-70*depth),
      chroma:clampValue((contrast-50)*1.05+6),
      def:clampValue((contrast-50)*1.15+6),
      hue:hueCue>0?55:hueCue<0?-55:0
    };
    const locks=lockRanges({contrast:contrastWord},warmth,depth,hueCue);
    Object.keys(rec).forEach(key=>rec[key]=clampValue(clamp(rec[key],locks[key][0],locks[key][1])));
    const direction=[warmth>22?'Warm':warmth<-22?'Cool':'Balanced',depth>.33?'Deep':depth<-.33?'Light':'Medium',rec.def>20?'Defined':rec.def<-20?'Soft':'Tailored'].join(' ');
    return {client:values.client?.trim()||'Client',direction,rec,alt:{...rec},locks,confidence:{white:whiteConfidence,metal:metalConfidence}};
  };

  function handleRange(e){
    const input=e.target.closest('input[type="range"][data-output]');
    if(!input)return;
    const output=q(`#${input.dataset.output}`);
    if(output)output.value=input.value;
  }

  window.renderIntake=renderIntake;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{renderIntake();q('#quiz')?.addEventListener('input',handleRange)});
  else{renderIntake();q('#quiz')?.addEventListener('input',handleRange)}
})();
