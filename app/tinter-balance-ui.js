Tinter.ensureBalance=function(){
  const stage=document.querySelector('#tinterStage');
  if(!document.querySelector('#tinterWarmFilter'))stage.insertAdjacentHTML('afterbegin','<div id="tinterWarmFilter" class="tinter-video-filter"></div><div id="tinterTintFilter" class="tinter-video-filter"></div>');
  if(!document.querySelector('#tinterBalance'))stage.insertAdjacentHTML('afterend','<div id="tinterBalance" class="tinter-balance"><div class="tinter-balance-top"><b>Balance the camera</b><button type="button" id="tinterAutoTemp" class="secondary">Auto Temp</button></div><div class="tinter-balance-grid"><label>Warmth<input type="range" id="tinterWarmth" min="-100" max="100" value="0"></label><label>Tint<input type="range" id="tinterTint" min="-100" max="100" value="0"></label></div><p id="tinterBalanceNote" class="tinter-balance-note">Move until white paper looks white. Then swipe a color over yourself.</p></div>');
  document.querySelector('#tinterWarmth').oninput=()=>Tinter.applyBalance();
  document.querySelector('#tinterTint').oninput=()=>Tinter.applyBalance();
  document.querySelector('#tinterAutoTemp').onclick=Tinter.autoBalance;
};
Tinter.applyBalance=function(){
  let w=+document.querySelector('#tinterWarmth')?.value||0,t=+document.querySelector('#tinterTint')?.value||0;
  Tinter.lightingCorrection=w;Tinter.tintCorrection=t;
  let wa=Math.min(.42,Math.abs(w)/190),ta=Math.min(.28,Math.abs(t)/220);
  let wf=document.querySelector('#tinterWarmFilter'),tf=document.querySelector('#tinterTintFilter');
  if(wf)wf.style.background=w<0?`rgba(70,120,255,${wa})`:w>0?`rgba(255,170,70,${wa})`:'transparent';
  if(tf)tf.style.background=t<0?`rgba(60,180,110,${ta})`:t>0?`rgba(220,80,190,${ta})`:'transparent';
};
