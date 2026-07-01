Tinter.resetPull=function(){let s=document.querySelector('#tinterStage');if(!s)return;s.classList.add('rebound');s.classList.remove('drag-left','drag-right','pull-left','pull-right');s.style.setProperty('--pull',0);s.style.setProperty('--pullWidth','64%');window.setTimeout(()=>s.classList.remove('rebound'),230)};
Tinter.wireSwipe=function(){
  let startX=0,drag=false,stage=document.querySelector('#tinterStage');
  if(!stage)return;
  stage.addEventListener('pointerdown',e=>{drag=true;startX=e.clientX;stage.setPointerCapture(e.pointerId)});
  stage.addEventListener('pointermove',e=>{
    if(!drag)return;
    let dx=e.clientX-startX,side=dx>0?'left':dx<0?'right':'',p=Math.min(1,Math.abs(dx)/165),pair=TINTER_PAIRS[Tinter.i];
    stage.style.setProperty('--pull',p);stage.style.setProperty('--pullWidth',(64+p*46)+'%');
    if(side==='left'){stage.style.setProperty('--activeColor',pair.left.hex);stage.classList.add('drag-left');stage.classList.remove('drag-right')}
    if(side==='right'){stage.style.setProperty('--activeColor',pair.right.hex);stage.classList.add('drag-right');stage.classList.remove('drag-left')}
  });
  stage.addEventListener('pointerup',e=>{
    if(!drag)return;drag=false;
    let dx=e.clientX-startX;
    if(dx>88)Tinter.choose('left');
    else if(dx<-88)Tinter.choose('right');
    else Tinter.resetPull();
  });
};
const oldTinterRenderPairV3=Tinter.renderPair;
Tinter.renderPair=function(){oldTinterRenderPairV3();Tinter.resetPull()};
(function rewireTinterSwipe(){let old=document.querySelector('#tinterStage');if(!old)return;let fresh=old.cloneNode(true);old.replaceWith(fresh);Tinter.wireSwipe()})();
