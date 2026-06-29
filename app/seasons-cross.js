window.seasonName=function(r){
  let t=r.rec.temp,v=r.rec.value,c=r.rec.chroma,d=r.rec.def,warm=t>=25,cool=t<=-25,neutral=Math.abs(t)<25,deep=v<=-25,light=v>=25,soft=c<=-20||d<=-25,bright=c>=25||d>=25,defined=d>=15;
  if(neutral&&deep&&defined)return 'Deep Autumn-Winter';
  if(neutral&&soft)return 'Soft Summer-Autumn';
  if(neutral&&light)return 'Light Spring-Summer';
  if(neutral&&bright)return 'Bright Spring-Winter';
  if(warm&&deep&&defined&&t<55)return 'Deep Autumn-Winter';
  if(cool&&deep&&defined&&t>-55)return 'Deep Winter-Autumn';
  if(warm&&deep)return defined?'Deep Autumn':'True Autumn';
  if(warm&&light)return bright?'Bright Spring':'Light Spring';
  if(warm&&soft)return 'Soft Autumn';
  if(warm)return bright?'True Spring':'True Autumn';
  if(cool&&deep)return defined?'Deep Winter':'True Winter';
  if(cool&&light)return bright?'Light Summer-Winter':'Light Summer';
  if(cool&&soft)return 'Soft Summer';
  if(cool)return bright?'True Winter':'True Summer';
  return 'Balanced Classic';
};
window.profileWords=function(r){let t=r.rec.temp>20?'Warm':r.rec.temp<-20?'Cool':'Balanced',v=r.rec.value<-25?'Deep':r.rec.value>25?'Light':'Medium',d=r.rec.def>20?'Defined':r.rec.def<-20?'Soft':'Tailored';return `${t}, ${v}, and ${d}`};
window.styleReportText=function(r){
  let warm=r.rec.temp>20,cool=r.rec.temp<-20,deep=r.rec.value<-25,light=r.rec.value>25,clear=r.rec.chroma>20,soft=r.rec.chroma<-20,defined=r.rec.def>20,low=r.rec.def<-20;
  let colors=warm?(deep?'warm, rich tones like cream, camel, olive, terracotta, and soft red':'warm tones like cream, camel, peach, coral, olive, and soft gold'):cool?(deep?'cool, deep tones like charcoal, navy, berry, emerald, and brushed silver':'cool tones like soft white, gray, blue, berry, and silver'):'balanced tones like stone, denim, burgundy, charcoal, and soft white';
  let value=deep?'Choosing deeper, darker shades will beautifully enhance your features':light?'Choosing lighter, brighter shades will keep your look fresh and easy':'Choosing colors that are not too pale and not too dark will keep your look balanced';
  let contrast=defined?'while your defined quality means you can confidently wear higher contrast and clearer colors.':low?'while your soft quality means lower-contrast, blended outfits will usually look more natural.':'while your tailored quality means you look best with clean contrast that is polished but not harsh.';
  return `Your color profile is ${profileWords(r)}. You shine in ${colors}. ${value}, ${contrast}`;
};
window.seasonBadge=r=>`<span class="season-badge">${seasonName(r)}</span>`;
window.paletteDescription=function(r){return styleReportText(r)};
