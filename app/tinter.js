window.Tinter={i:0,answers:[],nudges:{temp:0,value:0,chroma:0,def:0,hue:0},stream:null};
Tinter.init=function(){
  let actions=document.querySelector('.builder-actions');
  if(actions&&!document.querySelector('#tinterOpen'))actions.insertAdjacentHTML('beforeend','<button type="button" id="tinterOpen" class="secondary tinter-entry">Try Tinter · optional selfie swipe</button>');
  if(!document.querySelector('#tinterModal'))document.body.insertAdjacentHTML('beforeend',Tinter.modalHtml());
  document.querySelector('#tinterOpen')?.addEventListener('click',Tinter.open);
  document.querySelector('#tinterClose').onclick=Tinter.close;
  document.querySelector('#tinterLeftBtn').onclick=()=>Tinter.choose('left');
  document.querySelector('#tinterRightBtn').onclick=()=>Tinter.choose('right');
  Tinter.wireSwipe();
};
Tinter.modalHtml=function(){return `<section id="tinterModal" class="tinter-modal" hidden><div id="tinterCard" class="tinter-card"><div class="tinter-head"><div><p class="kicker">Tinter</p><h2>Swipe your color drape</h2><p class="tinter-privacy">Live camera only. No photo is saved or uploaded.</p></div><button type="button" id="tinterClose" class="secondary tinter-close">×</button></div><div class="tinter-progress"><i id="tinterBar"></i></div><div id="tinterStage" class="tinter-stage"><video id="tinterVideo" autoplay playsinline muted></video><div id="tinterPrompt" class="tinter-prompt"></div><div id="tinterLeft" class="tinter-drape tinter-left"><span class="tinter-label"></span></div><div id="tinterRight" class="tinter-drape tinter-right"><span class="tinter-label"></span></div></div><div class="tinter-actions"><button type="button" id="tinterLeftBtn" class="secondary">Left looks better</button><button type="button" id="tinterRightBtn">Right looks better</button></div><p id="tinterStatus" class="tinter-status"></p><div id="tinterSummary" class="tinter-summary"><b>Tinter saved.</b><p>These swipes will nudge your palette the next time you build it.</p><button type="button" onclick="Tinter.applyNow()">Apply to palette now</button></div></div></section>`};
Tinter.open=async function(){
  Tinter.i=0;Tinter.answers=[];Tinter.nudges={temp:0,value:0,chroma:0,def:0,hue:0};
  document.querySelector('#tinterModal').hidden=false;document.querySelector('#tinterCard').classList.remove('done');document.querySelector('#tinterSummary').style.display='none';
  Tinter.renderPair();
  try{Tinter.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});document.querySelector('#tinterVideo').srcObject=Tinter.stream;document.querySelector('#tinterStatus').textContent='Swipe toward the color that makes your face look clearer.'}
  catch(e){document.querySelector('#tinterStatus').textContent='Camera unavailable. You can still tap left or right using the color drapes.'}
};
Tinter.close=function(){document.querySelector('#tinterModal').hidden=true;if(Tinter.stream){Tinter.stream.getTracks().forEach(t=>t.stop());Tinter.stream=null}};
Tinter.renderPair=function(){let p=TINTER_PAIRS[Tinter.i],stage=document.querySelector('#tinterStage');stage.classList.remove('pick-left','pick-right');document.querySelector('#tinterPrompt').textContent=p.prompt;let l=document.querySelector('#tinterLeft'),r=document.querySelector('#tinterRight');l.style.background=`linear-gradient(180deg,${p.left.hex}55,${p.left.hex}dd)`;r.style.background=`linear-gradient(180deg,${p.right.hex}55,${p.right.hex}dd)`;l.querySelector('.tinter-label').textContent=p.left.name;r.querySelector('.tinter-label').textContent=p.right.name;document.querySelector('#tinterBar').style.width=(Tinter.i/TINTER_PAIRS.length*100)+'%'};
Tinter.choose=function(side){let p=TINTER_PAIRS[Tinter.i],pick=p[side],stage=document.querySelector('#tinterStage');stage.classList.add(side==='left'?'pick-left':'pick-right');Object.entries(pick.nudge).forEach(([k,v])=>Tinter.nudges[k]=(Tinter.nudges[k]||0)+v);Tinter.answers.push({prompt:p.prompt,pick:pick.name});setTimeout(()=>{Tinter.i++;if(Tinter.i>=TINTER_PAIRS.length)Tinter.done();else Tinter.renderPair()},230)};
Tinter.done=function(){document.querySelector('#tinterBar').style.width='100%';document.querySelector('#tinterCard').classList.add('done');document.querySelector('#tinterSummary').style.display='block';document.querySelector('#tinterStatus').textContent='Tinter complete. Your swipes are saved for this session.'};
Tinter.applyNow=function(){if(window.renderReport&&window.calculateReport){renderReport(calculateReport());Tinter.close()}};
Tinter.wireSwipe=function(){let start=0,drag=false,stage=document.querySelector('#tinterStage');stage.addEventListener('pointerdown',e=>{drag=true;start=e.clientX;stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-start;stage.classList.toggle('pick-left',dx<-25);stage.classList.toggle('pick-right',dx>25)});stage.addEventListener('pointerup',e=>{if(!drag)return;drag=false;let dx=e.clientX-start;if(dx<-70)Tinter.choose('left');else if(dx>70)Tinter.choose('right');else stage.classList.remove('pick-left','pick-right')})};
const oldCalc=window.calculateReport;
window.calculateReport=function(){let r=oldCalc();if(Tinter.answers.length){['temp','value','chroma','def','hue'].forEach(k=>{r.rec[k]=clampValue((r.rec[k]||0)+(Tinter.nudges[k]||0));r.alt[k]=r.rec[k]});r.tinter={answers:Tinter.answers,nudges:Tinter.nudges}}return r};
Tinter.init();
