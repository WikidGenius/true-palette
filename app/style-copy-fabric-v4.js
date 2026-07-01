window.styleReportText=function(r){
  const p=paletteFromValues(r.rec);
  const profile=profileWords?profileWords(r):r.direction;
  const examples=[p[0][0],p[1][0],p[4][0],p[5][0],p[6][0]].filter(Boolean).join(', ');
  const deep=r.rec.value<-25,light=r.rec.value>25,soft=r.rec.chroma<-20||r.rec.def<-20,defined=r.rec.def>20,warm=r.rec.temp>20,cool=r.rec.temp<-20;
  let temp=warm?'warm':cool?'cool':'balanced';
  let value=deep?'deeper anchors and grounded mid-tones':light?'lighter neutrals and airy color':'balanced mid-depth color';
  let clarity=soft?'Keep the colors softened, dusty, and fabric-like rather than bright or neon.':defined?'Use clear contrast, but keep the colors wearable and grounded.':'Use clean contrast without going harsh or overly bright.';
  return `Your color profile is ${profile}. You shine in ${temp}, fabric-realistic colors like ${examples}. Build outfits around ${value}, then add one complementary color for interest. ${clarity}`;
};
window.paletteDescription=function(r){return styleReportText(r)};
