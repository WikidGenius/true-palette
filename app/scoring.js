window.DEPTH_SCORE={light:-1,mid:0,deep:1};
window.clampValue=function(n){return Math.max(-100,Math.min(100,Math.round(n)))};
window.signed=function(n){return (n>0?'+':'')+n};
window.lockRanges=function(a,w,d,hc){
  let c=a.contrast;
  return {
    temp:w>22?[20,90,'Cool ranges are locked because the tests point warm.']:w<-22?[-90,-20,'Warm ranges are locked because the tests point cool.']:[-35,35,'Extreme warmth and coolness are locked for a balanced read.'],
    value:d>.33?[-90,10,'Bright airy values are locked near the face; deeper colors carry you better.']:d<-.33?[-70,90,'The blackest values are locked near the face; use black more safely in accessories or lower-body pieces.']:[-60,60,'Extreme light and dark values are locked for a middle-value read.'],
    chroma:c==='soft'?[-90,15,'High saturation is locked because soft features need blended color.']:c==='sharp'?[-5,90,'Very muted color is locked because high definition needs clearer color.']:[-45,60,'Extreme muted and neon ranges are locked for balanced contrast.'],
    def:c==='soft'?[-85,15,'Hard contrast is locked because it can overpower soft features.']:c==='sharp'?[-5,90,'Very low contrast is locked because it can flatten definition.']:[-40,65,'Extreme softness and sharpness are locked for a tailored read.'],
    hue:hc>0?[15,90,'Cool pop colors are locked because hair or eye cues point warm.']:hc<0?[-90,-15,'Warm pop colors are locked because hair or eye cues point cool.']:[-45,45,'Extreme hue swings are locked because the cues are mixed.']
  };
};
window.calculateReport=function(){
  let a=Object.fromEntries(new FormData(document.querySelector('#quiz')).entries()),w=0,hc=0;
  if(a.whiteCream==='warm')w+=38;if(a.whiteCream==='cool')w-=38;
  if(a.jewelry==='warm')w+=30;if(a.jewelry==='cool')w-=30;
  if(a.hairHue==='warm'){w+=18;hc++}if(a.hairHue==='cool'){w-=18;hc--}
  if(a.eyeHue==='warm'){w+=18;hc++}if(a.eyeHue==='cool'){w-=18;hc--}
  w=clampValue(w);
  let d=(DEPTH_SCORE[a.skin]+DEPTH_SCORE[a.hair]+DEPTH_SCORE[a.eyes])/3,c=a.contrast;
  let sat=c==='sharp'?42:c==='soft'?-35:10,def=c==='sharp'?34:c==='soft'?-22:8,val=clampValue(d*-42);
  let rec={temp:w,value:val,chroma:sat,def:def,hue:hc>0?55:hc<0?-55:0},locks=lockRanges(a,w,d,hc);
  Object.keys(rec).forEach(k=>rec[k]=clampValue(Math.max(locks[k][0],Math.min(locks[k][1],rec[k]))));
  let name=[w>22?'Warm':w<-22?'Cool':'Neutral',d>.33?'Deep':d<-.33?'Light':'',c==='sharp'?'Defined':c==='soft'?'Soft':'Tailored'].filter(Boolean).join(' ');
  return {client:a.client||'Client',direction:name,rec,alt:{...rec},locks};
};
