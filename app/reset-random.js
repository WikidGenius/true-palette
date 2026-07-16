(function(){
  'use strict';

  const q=s=>document.querySelector(s);

  function resetTinter(){
    if(window.Tinter?.reset)Tinter.reset();
    else if(window.Tinter?.stream){Tinter.stream.getTracks().forEach(track=>track.stop());Tinter.stream=null}
    const modal=q('#tinterModal');
    if(modal)modal.hidden=true;
  }

  function clearReport(){
    if(window.state){state.last=null;state.adjusted=false}
    if(typeof closeDock==='function')closeDock();
    const result=q('#result');
    if(result){result.className='empty';result.innerHTML='Complete Tinter to create your wardrobe palette.'}
    const copy=q('#copy');
    if(copy)copy.textContent='Copy Style Report';
    document.body.classList.add('report-waiting');
    document.body.classList.remove('report-ready','has-analysis');
  }

  function hideRefinement(){
    const section=q('#refineSection');
    if(section)section.hidden=true;
    const details=q('#refineDetails');
    if(details)details.open=false;
  }

  function clearQuiz(){
    if(typeof renderIntake==='function')renderIntake();
    const client=q('#client');
    if(client)client.value='';
    disableRefinement?.();
    resetTinter();
    clearReport();
    hideRefinement();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function randomizeQuiz(){
    if(typeof renderIntake==='function')renderIntake();
    const section=q('#refineSection');
    const details=q('#refineDetails');
    if(section)section.hidden=false;
    if(details)details.open=true;
    const form=q('#quiz');
    if(!form)return;
    const client=q('#client');
    if(client)client.value='Demo Client';
    const groups={};
    form.querySelectorAll('input[type=radio]').forEach(input=>{(groups[input.name]||=[]).push(input);input.checked=false});
    Object.values(groups).forEach(group=>{group[Math.floor(Math.random()*group.length)].checked=true});
    form.querySelectorAll('input[type=checkbox]').forEach(input=>input.checked=Math.random()>.2);
    form.querySelectorAll('input[type=range]').forEach(input=>{
      const value=Math.round(12+Math.random()*76);
      input.value=value;
      const output=q(`#${input.name}Val`);
      if(output)output.value=value;
    });
    disableRefinement?.();
    resetTinter();
    clearReport();
  }

  function install(){
    const sample=q('#sample');
    if(sample){sample.textContent='Demo answers';sample.setAttribute('aria-label','Fill the camera-free form with demo answers');sample.onclick=event=>{event.preventDefault();randomizeQuiz()}}
    const form=q('#quiz');
    if(form&&!form.dataset.resetRandom){
      form.dataset.resetRandom='true';
      form.addEventListener('reset',event=>{event.preventDefault();clearQuiz()});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
  window.clearTruePaletteQuiz=clearQuiz;
  window.randomizeTruePaletteQuiz=randomizeQuiz;
})();
