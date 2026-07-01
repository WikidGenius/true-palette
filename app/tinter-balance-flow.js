const tinterOldRenderPair=Tinter.renderPair;
Tinter.renderPair=function(){
  tinterOldRenderPair();
  let st=document.querySelector('#tinterStage');
  st.classList.remove('pull-left','pull-right','commit-left','commit-right');
  st.style.setProperty('--pull',0);
  Tinter.ensureBalance();
};
Tinter.open=async function(){
  Tinter.i=0;Tinter.answers=[];Tinter.nudges={temp:0,value:0,chroma:0,def:0,hue:0};
  Tinter.lightingCorrection=0;Tinter.tintCorrection=0;Tinter.lightingConfidence='skipped';
  document.querySelector('#tinterModal').hidden=false;
  document.querySelector('#tinterCard').classList.remove('done');
  document.querySelector('#tinterSummary').style.display='none';
  Tinter.renderPair();
  try{
    Tinter.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
    document.querySelector('#tinterVideo').srcObject=Tinter.stream;
    document.querySelector('#tinterStatus').textContent='Balance the camera, then swipe the color over your face.';
  }catch(e){
    document.querySelector('#tinterStatus').textContent='Camera unavailable. You can still swipe using the color drapes.';
  }
};
(function rebindTinterOpen(){
  let b=document.querySelector('#tinterOpen');
  if(!b)return;
  let c=b.cloneNode(true);
  b.replaceWith(c);
  c.onclick=Tinter.open;
})();
