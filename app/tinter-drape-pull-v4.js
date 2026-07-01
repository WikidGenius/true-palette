Tinter.clearDrapeStyles=function(){['tinterLeft','tinterRight'].forEach(id=>{let e=document.querySelector('#'+id);if(e){e.style.width='';e.style.height='';e.style.top='';e.style.bottom='';e.style.opacity='';e.style.transform='';e.style.filter='';e.style.clipPath='';e.style.background=''}})};
Tinter.renderPair=function(){
  let p=TINTER_PAIRS[Tinter.i],stage=document.querySelector('#tinterStage');
  stage.classList.remove('drag-left','drag-right','commit-left','commit-right','rebound','pick-left','pick-right','pull-left','pull-right');
  stage.style.setProperty('--pull',0);stage.style.setProperty('--solid','45%');stage.style.setProperty('--fade','70%');stage.style.setProperty('--leftColor',p.left.hex);stage.style.setProperty('--rightColor',p.right.hex);
  document.querySelector('#tinterPrompt').textContent=p.prompt;
  let l=document.querySelector('#tinterLeft'),r=document.querySelector('#tinterRight');
  l.querySelector('.tinter-label').textContent=p.left.name;r.querySelector('.tinter-label').textContent=p.right.name;
  l.style.background=`linear-gradient(135deg,${p.left.hex} 0%,${p.left.hex} 56%,${p.left.hex}cc 76%,transparent 100%)`;
  r.style.background=`linear-gradient(225deg,${p.right.hex} 0%,${p.right.hex} 56%,${p.right.hex}cc 76%,transparent 100%)`;
  document.querySelector('#tinterBar').style.width=(Tinter.i/TINTER_PAIRS.length*100)+'%';
  if(Tinter.ensureBalance)Tinter.ensureBalance();
};
Tinter.applyDrapePull=function(side,p){let stage=document.querySelector('#tinterStage'),pair=TINTER_PAIRS[Tinter.i],hex=side==='left'?pair.left.hex:pair.right.hex;stage.style.setProperty('--pull',p);stage.style.setProperty('--solid',Math.round(28+p*42)+'%');stage.style.setProperty('--fade',Math.round(58+p*34)+'%');stage.style.setProperty(side==='left'?'--leftColor':'--rightColor',hex);stage.classList.toggle('drag-left',side==='left');stage.classList.toggle('drag-right',side==='right')};
Tinter.resetPull=function(){let s=document.querySelector('#tinterStage');s.classList.add('rebound');s.classList.remove('drag-left','drag-right','commit-left','commit-right');s.style.setProperty('--pull',0);setTimeout(()=>s.classList.remove('rebound'),240)};
Tinter.choose=function(side){let p=TINTER_PAIRS[Tinter.i],pick=p[side],stage=document.querySelector('#tinterStage'),weight=Tinter.lightingConfidence==='low'?.7:Tinter.lightingConfidence==='okay'?.85:1;stage.classList.remove('drag-left','drag-right');stage.classList.add(side==='left'?'commit-left':'commit-right');Object.entries(pick.nudge).forEach(([k,v])=>Tinter.nudges[k]=(Tinter.nudges[k]||0)+Math.round(v*weight));Tinter.answers.push({prompt:p.prompt,pick:pick.name});setTimeout(()=>{Tinter.i++;if(Tinter.i>=TINTER_PAIRS.length)Tinter.done();else Tinter.renderPair()},300)};
Tinter.wireSwipe=function(){let start=0,drag=false,stage=document.querySelector('#tinterStage');stage.addEventListener('pointerdown',e=>{drag=true;start=e.clientX;stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-start,p=Math.min(1,Math.abs(dx)/165);if(dx>8)Tinter.applyDrapePull('left',p);else if(dx<-8)Tinter.applyDrapePull('right',p)});stage.addEventListener('pointerup',e=>{if(!drag)return;drag=false;let dx=e.clientX-start;if(dx>88)Tinter.choose('left');else if(dx<-88)Tinter.choose('right');else Tinter.resetPull()})};
(function activateDrapePull(){let old=document.querySelector('#tinterStage');if(old){let fresh=old.cloneNode(true);old.replaceWith(fresh);Tinter.wireSwipe()}})();
