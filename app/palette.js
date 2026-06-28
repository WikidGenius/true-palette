window.bucket=n=>Math.max(0,Math.min(9,Math.round((n+100)/200*9)));
window.hslHex=function(h,s,l){s/=100;l/=100;let k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return '#'+[f(0),f(8),f(4)].map(x=>Math.round(255*x).toString(16).padStart(2,'0')).join('')};
window.paletteFromValues=function(v){
  let bt=bucket(v.temp),bv=bucket(v.value),bc=bucket(v.chroma),bd=bucket(v.def),bh=bucket(v.hue),warm=v.temp>20,cool=v.temp<-20;
  let tempName=warm?'Warm':cool?'Cool':'Balanced',valueName=['Deepest','Very Deep','Deep','Rich','Middle','Middle Light','Light','Bright','Airy','Lightest'][bv],strengthName=['Very Soft','Soft','Muted','Quiet','Balanced','Clear','Bright','Strong','Vivid','Bold'][bc];
  let neutralHue=warm?35:cool?220:38,accentHue=warm?(bh>6?20:bh>4?58:170):cool?(bh<3?212:bh<6?330:155):(bh<4?210:bh>5?25:350);
  let neutralSat=10+bc*2,accentSat=24+bc*7,baseLight=20+bv*6,anchorLight=Math.max(8,baseLight-10-bd),lightNeutral=Math.min(92,baseLight+18);
  return [
    [`${tempName} light neutral`,hslHex(neutralHue,neutralSat,lightNeutral)],
    [`${valueName} neutral`,hslHex(neutralHue,neutralSat+4,baseLight+5)],
    [`${valueName} anchor`,hslHex(neutralHue,neutralSat+8,anchorLight)],
    [`${strengthName} main color`,hslHex(accentHue,accentSat,Math.min(78,38+bv*4))],
    [`${tempName} accent`,hslHex((accentHue+38)%360,Math.min(92,accentSat+6),Math.min(80,42+bv*3))],
    [warm?'Gold finish':cool?'Silver finish':'Mixed metal',warm?'#d0a036':cool?'#c9d0d4':'#9aa0a4']
  ];
};
window.paletteDescription=function(r){
  let warm=r.rec.temp>20,cool=r.rec.temp<-20,light=r.rec.value>25,deep=r.rec.value<-25,clear=r.rec.chroma>20,soft=r.rec.chroma<-20,defined=r.rec.def>20,low=r.rec.def<-20;
  let colors=warm?'warm colors like cream, camel, olive, terracotta, and soft red':cool?'cool colors like soft white, gray, navy, berry, blue, and emerald':'balanced colors like stone, denim, burgundy, charcoal, and soft white';
  let value=light?'Lighter means colors with a little white mixed in will usually feel easier on you.':deep?'Deeper means darker, richer colors will usually support your features better.':'Middle value means stay away from colors that are extremely pale or extremely dark.';
  let strength=clear?'Clear color means stronger color is okay, as long as it still feels wearable.':soft?'Soft color means quieter, less bright colors will usually look smoother.':'Balanced color means you can wear some color, but skip anything too dull or too neon.';
  let contrast=defined?'Defined means you can handle clearer light-and-dark contrast.':low?'Soft contrast means outfits with less light-and-dark contrast will usually feel calmer.':'Tailored means use some light-and-dark contrast, but keep it clean and not harsh.';
  return `${r.direction}. You look great in ${colors}. ${value} ${strength} ${contrast}`;
};
window.swatchHtml=p=>`<div class="palette">${p.map(x=>`<div class="color"><div class="patch" style="background:${x[1]}"></div><b>${x[0]}</b><p class="muted">${x[1]}</p></div>`).join('')}</div>`;
window.paletteCompareHtml=function(rec,alt){return `<div class="palette-compare">${rec.map((r,i)=>`<div class="compare-row"><div class="compare-role">${i===0?'Light neutral':i===1?'Main neutral':i===2?'Anchor color':i===3?'Main color':i===4?'Accent color':'Metal'}</div><div class="compare-color"><i style="background:${r[1]}"></i><span><b>${r[0]}</b><small>${r[1]}</small></span></div><div class="compare-color"><i style="background:${alt[i][1]}"></i><span><b>${alt[i][0]}</b><small>${alt[i][1]}</small></span></div></div>`).join('')}</div>`};
