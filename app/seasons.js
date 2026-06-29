window.seasonName=function(r){
  let warm=r.rec.temp>20,cool=r.rec.temp<-20,deep=r.rec.value<-25,light=r.rec.value>25,soft=r.rec.chroma<-20,bright=r.rec.chroma>20||r.rec.def>20;
  if(warm&&deep)return soft?'Soft Autumn':'Deep Autumn';
  if(warm&&light)return bright?'Bright Spring':'Light Spring';
  if(warm)return bright?'Warm Spring':'Warm Autumn';
  if(cool&&deep)return bright?'Deep Winter':'Cool Winter';
  if(cool&&light)return bright?'Bright Winter':'Light Summer';
  if(cool)return bright?'Cool Winter':'Cool Summer';
  if(soft)return deep?'Soft Autumn':'Soft Summer';
  if(bright)return light?'Bright Spring':'Bright Winter';
  return 'Balanced Classic';
};
window.seasonBadge=r=>`<span class="season-badge">${seasonName(r)}</span>`;
window.paletteDescription=function(r){
  let warm=r.rec.temp>20,cool=r.rec.temp<-20,light=r.rec.value>25,deep=r.rec.value<-25,clear=r.rec.chroma>20,soft=r.rec.chroma<-20,defined=r.rec.def>20,low=r.rec.def<-20;
  let colors=warm?'warm colors like cream, camel, olive, terracotta, and soft red':cool?'cool colors like soft white, gray, navy, berry, blue, and emerald':'balanced colors like stone, denim, burgundy, charcoal, and soft white';
  let value=light?'Lighter means colors with a little white mixed in will usually feel easier on you.':deep?'Deeper means darker, richer colors will usually support your features better.':'Middle value means stay away from colors that are extremely pale or extremely dark.';
  let strength=clear?'Clear color means stronger color is okay, as long as it still feels wearable.':soft?'Soft color means quieter, less bright colors will usually look smoother.':'Balanced color means you can wear some color, but skip anything too dull or too neon.';
  let contrast=defined?'Defined means you can handle clearer light-and-dark contrast.':low?'Soft contrast means outfits with less light-and-dark contrast will usually feel calmer.':'Tailored means use some light-and-dark contrast, but keep it clean and not harsh.';
  return `${r.direction}. For fun, this is ${seasonName(r)} territory. You look great in ${colors}. ${value} ${strength} ${contrast}`;
};
