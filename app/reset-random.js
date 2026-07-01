(function(){
  function resetTinter(){
    if(window.Tinter){
      if(Tinter.stream){Tinter.stream.getTracks().forEach(t=>t.stop());Tinter.stream=null}
      Tinter.i=0;Tinter.answers=[];Tinter.nudges={temp:0,value:0,chroma:0,def:0,hue:0};
      Tinter.lightingCorrection=0;Tinter.tintCorrection=0;Tinter.lightingConfidence='skipped';
      if(typeof Tinter.clearCompleteButton==='function')Tinter.clearCompleteButton();
    }
    const modal=document.querySelector('#tinterModal');
    if(modal)modal.hidden=true;
  }
  function clearReport(){
    if(window.state){state.last=null;state.adjusted=false}
    if(typeof closeDock==='function')closeDock();
    else{let d=document.querySelector('#sliderDock');if(d)d.hidden=true;document.body.classList.remove('dock-open')}
    const result=document.querySelector('#result');
    if(result){result.className='empty';result.innerHTML='Complete the intake, then tap <b>Build My Palette</b>.'}
    const copy=document.querySelector('#copy');
    if(copy)copy.textContent='Copy Style Report';
  }
  function clearQuiz(){
    const form=document.querySelector('#quiz');
    if(!form)return;
    const client=document.querySelector('#client');
    if(client)client.value='';
    form.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(i=>i.checked=false);
    form.querySelectorAll('input[type=range]').forEach(i=>{i.value=50;let v=document.querySelector('#'+i.name+'Val');if(v)v.textContent='—'});
    resetTinter();clearReport();
  }
  function randomizeQuiz(){
    const form=document.querySelector('#quiz');
    if(!form)return;
    const client=document.querySelector('#client');
    if(client)client.value='Random Client';
    const groups={};
    form.querySelectorAll('input[type=radio]').forEach(i=>{(groups[i.name] ||= []).push(i);i.checked=false});
    Object.values(groups).forEach(g=>{g[Math.floor(Math.random()*g.length)].checked=true});
    form.querySelectorAll('input[type=checkbox]').forEach(i=>i.checked=Math.random()>.25);
    form.querySelectorAll('input[type=range]').forEach(i=>{let v=Math.round(10+Math.random()*80);i.value=v;let out=document.querySelector('#'+i.name+'Val');if(out)out.textContent=v});
    resetTinter();clearReport();
  }
  function install(){
    const sample=document.querySelector('#sample');
    if(sample){sample.textContent='Random Answers';sample.setAttribute('aria-label','Randomly answer quiz questions');sample.onclick=e=>{e.preventDefault();randomizeQuiz()}}
    const form=document.querySelector('#quiz');
    if(form&&!form.dataset.resetRandom){
      form.dataset.resetRandom='true';
      form.addEventListener('reset',e=>{e.preventDefault();clearQuiz()});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  window.clearTruePaletteQuiz=clearQuiz;
  window.randomizeTruePaletteQuiz=randomizeQuiz;
})();
