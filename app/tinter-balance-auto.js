Tinter.autoBalance=function(){
  let v=document.querySelector('#tinterVideo'),note=document.querySelector('#tinterBalanceNote');
  if(!v.videoWidth){note.textContent='Camera is still starting. Try again in a second.';return}
  let c=document.createElement('canvas'),s=90;c.width=s;c.height=s;
  let ctx=c.getContext('2d'),x=(v.videoWidth-s)/2,y=(v.videoHeight-s)/2;ctx.drawImage(v,x,y,s,s,0,0,s,s);
  let data=ctx.getImageData(0,0,s,s).data,r=0,g=0,b=0,n=0;
  for(let i=0;i<data.length;i+=4){r+=data[i];g+=data[i+1];b+=data[i+2];n++}
  r/=n;g/=n;b/=n;
  let warm=Math.max(-75,Math.min(75,Math.round((b-r)*.55)));
  let tint=Math.max(-55,Math.min(55,Math.round((g-(r+b)/2)*.45)));
  document.querySelector('#tinterWarmth').value=warm;
  document.querySelector('#tinterTint').value=tint;
  Tinter.applyBalance();
  let strength=Math.abs(warm)+Math.abs(tint);
  Tinter.lightingConfidence=strength<25?'good':strength<70?'okay':'low';
  note.textContent=strength<25?'Looks close to neutral.':strength<70?'Auto balance added. Fine tune if white still looks tinted.':'Strong color cast. Use daylight if possible, or fine tune manually.';
};
