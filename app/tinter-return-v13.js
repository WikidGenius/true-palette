(function(){
  'use strict';

  const active=new Map();
  const q=selector=>document.querySelector(selector);

  function ensureReturnZone(){
    const stage=q('#tinterStage');
    if(!stage||q('#tinterReturnZone'))return;
    const zone=document.createElement('div');
    zone.id='tinterReturnZone';
    zone.className='tinter-return-zone';
    zone.setAttribute('aria-hidden','true');
    zone.innerHTML='<span>Release here to put the card back</span>';
    stage.appendChild(zone);
  }

  function threshold(stage){
    return Math.max(190,(stage?.clientHeight||640)*.30);
  }

  function cleanup(pointerId){
    const state=active.get(pointerId);
    if(!state)return;
    state.stage.classList.remove('card-drag-active','card-commit-ready');
    state.card.classList.remove('is-commit-ready');
    const zone=q('#tinterReturnZone span');
    if(zone)zone.textContent='Release here to put the card back';
    active.delete(pointerId);
  }

  function cancelExistingGesture(event,state){
    try{
      state.card.dispatchEvent(new PointerEvent('pointercancel',{
        pointerId:event.pointerId,
        pointerType:event.pointerType,
        bubbles:false,
        cancelable:true
      }));
    }catch{
      state.card.dispatchEvent(new Event('pointercancel',{bubbles:false,cancelable:true}));
    }
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  document.addEventListener('pointerdown',event=>{
    const card=event.target.closest?.('.smooth-card');
    const stage=card?.closest?.('#tinterStage');
    if(!card||!stage||card.getAttribute('aria-disabled')==='true')return;
    ensureReturnZone();
    active.set(event.pointerId,{
      card,stage,
      startX:event.clientX,
      startY:event.clientY,
      dx:0,dy:0
    });
    stage.classList.add('card-drag-active');
  },true);

  document.addEventListener('pointermove',event=>{
    const state=active.get(event.pointerId);
    if(!state)return;
    state.dx=event.clientX-state.startX;
    state.dy=event.clientY-state.startY;
    const ready=state.dy<=-threshold(state.stage);
    state.stage.classList.toggle('card-commit-ready',ready);
    state.card.classList.toggle('is-commit-ready',ready);
    const zone=q('#tinterReturnZone span');
    if(zone)zone.textContent=ready?'Release now to choose this color':'Release lower to put the card back';
  },true);

  document.addEventListener('pointerup',event=>{
    const state=active.get(event.pointerId);
    if(!state)return;
    const moved=Math.hypot(state.dx,state.dy);
    const deliberateChoice=state.dy<=-threshold(state.stage);
    if(moved>=10&&!deliberateChoice)cancelExistingGesture(event,state);
    cleanup(event.pointerId);
  },true);

  document.addEventListener('pointercancel',event=>cleanup(event.pointerId),true);

  function install(){
    ensureReturnZone();
    const modal=q('#tinterModal');
    if(!modal)return;
    const observer=new MutationObserver(ensureReturnZone);
    observer.observe(modal,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
