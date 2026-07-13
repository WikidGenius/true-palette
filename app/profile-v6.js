(function(){
  'use strict';

  const seasonLabels={
    trueAutumn:'True Autumn',deepAutumn:'Deep Autumn',softAutumn:'Soft Autumn',
    trueSpring:'True Spring',lightSpring:'Light Spring',
    trueSummer:'True Summer',softSummer:'Soft Summer',lightSummer:'Light Summer',
    trueWinter:'True Winter',deepWinter:'Deep Winter',
    softSummerAutumn:'Soft Summer–Autumn',deepAutumnWinter:'Deep Autumn–Winter',
    deepWinterAutumn:'Deep Winter–Autumn',lightSpringSummer:'Light Spring–Summer',
    brightSpringWinter:'Bright Spring–Winter'
  };

  window.seasonName=function(report){
    const key=typeof fabricProfile==='function'?fabricProfile(report.rec):'softSummerAutumn';
    return seasonLabels[key]||'Balanced Classic';
  };

  window.profileWords=function(report){
    const values=report.rec;
    const temperature=values.temp>20?'Warm':values.temp<-20?'Cool':'Balanced';
    const depth=values.value<-25?'Deep':values.value>25?'Light':'Medium';
    const definition=values.def>20?'Defined':values.def<-20?'Soft':'Tailored';
    return `${temperature}, ${depth}, and ${definition}`;
  };

  window.styleReportText=function(report){
    const palette=paletteFromValues(report.rec);
    const values=report.rec;
    const examples=[palette[0],palette[1],palette[4],palette[5],palette[6]].map(color=>color[0]).join(', ');
    const temperature=values.temp>20?'warm':values.temp<-20?'cool':'balanced';
    const depth=values.value<-25?'Use deeper anchors and grounded mid-tones.':values.value>25?'Keep the palette airy with lighter neutrals and lifted color.':'Stay near the middle of the light-to-dark range.';
    const clarity=values.chroma<-20||values.def<-20?'Choose softened, fabric-like color rather than anything neon or highly glossy.':values.def>20?'Use clean contrast and richer color, while keeping the finish wearable.':'Use polished contrast without pushing the palette too bright or too muted.';
    return `Your color profile is ${profileWords(report)}. You look strongest in ${temperature}, wardrobe-ready colors such as ${examples}. ${depth} ${clarity}`;
  };

  window.paletteDescription=window.styleReportText;
  window.seasonBadge=report=>`<span class="season-badge">${seasonName(report)}</span>`;
})();
