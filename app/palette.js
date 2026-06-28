window.paletteFromValues=function(v){
  let t=v.temp>20?'warm':v.temp<-20?'cool':'neutral',deep=v.value<-25,light=v.value>25,clear=v.chroma>20,soft=v.chroma<-20,hv=v.hue>15?'warm':v.hue<-15?'cool':'neutral';
  if(t==='warm'){
    let base=deep?[['Espresso','#2d1b14'],['Olive','#5e6332']]:light?[['Cream','#f7ead0'],['Camel','#c49a67']]:[['Cream','#f6e3bd'],['Camel','#bc8c51']];
    let acc=soft?[['Peach','#e8a27d'],['Sage','#9aa77c'],['Soft Teal','#5f9693']]:clear?[['Paprika','#c34521'],['Marigold','#d69a1e'],['Emerald Teal','#007264']]:[['Terracotta','#bd6744'],['Coral','#e56f52'],['Teal','#1f6868']];
    if(hv==='cool')acc[2]=['Deep Teal','#1f6868'];
    return base.concat(acc,[['Gold','#d0a036']]);
  }
  if(t==='cool'){
    let base=deep?[['Black','#090909'],['True Navy','#0d2444']]:light?[['Soft White','#f5f5f0'],['Dove Gray','#b7b9b6']]:[['Charcoal','#2d3034'],['Navy','#17283f']];
    let acc=soft?[['Dusty Rose','#c48fa0'],['Lavender','#b7a7ca'],['Pewter','#777b80']]:clear?[['Ruby','#a41134'],['Cobalt','#193b93'],['Emerald','#006b54']]:[['Berry','#8d315f'],['Slate','#7e99aa'],['Pine','#214c43']];
    if(hv==='warm')acc[1]=['Burgundy','#743448'];
    return base.concat(acc,[['Silver','#c9d0d4']]);
  }
  return [['Soft White','#f4eee4'],['Stone','#b7aa9b'],['Charcoal','#333539'],['Denim','#496a89'],['Burgundy','#743448'],['Pewter','#9aa0a4']];
};
window.paletteDescription=function(r){
  let warm=r.rec.temp>20,cool=r.rec.temp<-20,light=r.rec.value>25,deep=r.rec.value<-25,clear=r.rec.chroma>20,soft=r.rec.chroma<-20,sharp=r.rec.def>20,low=r.rec.def<-20;
  let t=warm?'warm colors like cream, camel, olive, terracotta, and mixed reds':cool?'cool colors like soft white, charcoal, navy, berry, cobalt, and emerald':'balanced colors like stone, denim, burgundy, charcoal, and soft white';
  let v=light?'Prefer brighter or lighter colors, like the shade has been mixed with a bit of white.':deep?'Prefer deeper colors with more visual weight, like the shade has been mixed with espresso or navy.':'Prefer middle-value colors that are not too pale and not too heavy.';
  let c=clear?'Clear means saturated color looks intentional rather than loud.':soft?'Soft means muted, blended color looks more expensive than neon.':'Tailored means balanced clarity: polished, but not harsh.';
  let d=sharp?'Defined means crisp contrast and sharper edges flatter you.':low?'Soft definition means lower-contrast outfits flatter you.':'Tailored contrast means structure without looking stark.';
  return `${r.direction}. You look great in ${t}. ${v} ${c} ${d}`;
};
window.swatchHtml=function(p){
  return `<div class="palette">${p.map(x=>`<div class="color"><div class="patch" style="background:${x[1]}"></div><b>${x[0]}</b><p class="muted">${x[1]}</p></div>`).join('')}</div>`;
};
