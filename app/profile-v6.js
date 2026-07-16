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
    const depth=values.value<-25?'Deeper anchors and grounded mid-tones will support your features.':values.value>25?'Lighter neutrals and lifted color will keep the face fresh.':'Stay near the middle of the light-to-dark range for the easiest harmony.';
    const clarity=values.chroma<-20||values.def<-20?'Choose softened, fabric-like color rather than anything neon or highly glossy.':values.def>20?'Use clean contrast and richer color while keeping the finish wearable.':'Use polished contrast without pushing the palette too bright or too muted.';
    return `Your strongest direction is ${profileWords(report)}. You consistently suit ${temperature}, wardrobe-ready colors such as ${examples}. ${depth} ${clarity}`;
  };

  window.outfitCombinations=function(report){
    const palette=paletteFromValues(report.rec);
    const combinations=[[0,2,5],[1,3,6],[0,1,4]];
    return combinations.map(indexes=>indexes.map(index=>palette[index]));
  };

  window.cautionColors=function(report){
    const values=report.rec;
    const colors=[];
    if(values.temp>20)colors.push('Optic white','Icy lavender');
    else if(values.temp<-20)colors.push('Golden camel','Orange coral');
    else colors.push('Extreme orange','Icy blue');
    if(values.chroma<-20)colors.push('Electric brights');
    else if(values.chroma>25)colors.push('Muddy gray-beige');
    else colors.push('Highlighter yellow');
    if(values.value<-25)colors.push('Very pale pastels');
    else if(values.value>25)colors.push('Near-black anchors');
    return [...new Set(colors)].slice(0,4);
  };

  window.reportConfidence=function(report){
    return report.tinter?.confidence||{
      key:'observational',label:'Observation-based result',
      description:'This palette was built from the optional camera-free observations.'
    };
  };

  window.paletteDescription=window.styleReportText;
  window.seasonBadge=report=>`<span class="season-badge">${seasonName(report)}</span>`;
})();
