Tinter.choose=function(side){
  let p=TINTER_PAIRS[Tinter.i],pick=p[side],stage=document.querySelector('#tinterStage'),weight=Tinter.lightingConfidence==='low'?.7:Tinter.lightingConfidence==='okay'?.85:1;
  stage.classList.add(side==='left'?'commit-left':'commit-right');
  Object.entries(pick.nudge).forEach(([k,v])=>Tinter.nudges[k]=(Tinter.nudges[k]||0)+Math.round(v*weight));
  Tinter.answers.push({prompt:p.prompt,pick:pick.name});
  setTimeout(()=>{Tinter.i++;if(Tinter.i>=TINTER_PAIRS.length)Tinter.done();else Tinter.renderPair()},280);
};
Tinter.wireSwipe=function(){
  let start=0,drag=false,stage=document.querySelector('#tinterStage');
  stage.addEventListener('pointerdown',e=>{drag=true;start=e.clientX;stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{if(!drag)return;let dx=e.clientX-start,p=Math.min(1,Math.abs(dx)/155);stage.style.setProperty('--pull',p);stage.classList.toggle('pull-left',dx<-12);stage.classList.toggle('pull-right',dx>12)});
  stage.addEventListener('pointerup',e=>{if(!drag)return;drag=false;let dx=e.clientX-start;if(dx<-80)Tinter.choose('left');else if(dx>80)Tinter.choose('right');else{stage.classList.remove('pull-left','pull-right');stage.style.setProperty('--pull',0)}});
};
