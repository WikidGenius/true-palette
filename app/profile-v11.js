(function(){
  'use strict';

  const analysis=report=>window.seasonAnalysis?.(report)||{
    primary:{label:'Balanced Neutral',family:'Neutral',trait:'Balanced'},
    secondary:null,hasSecondary:false,combinedLabel:'Balanced Neutral',paletteKey:'softSummerAutumn',kind:'neutral'
  };

  window.seasonResult=analysis;
  window.seasonName=report=>analysis(report).combinedLabel;
  window.primarySeasonName=report=>analysis(report).primary.label;
  window.secondarySeasonName=report=>analysis(report).secondary?.label||'';
  window.seasonRelationshipText=function(report){
    const result=analysis(report);
    if(result.kind==='neutral')return 'Temperature stayed balanced, so depth, softness, and contrast shape the palette more than a single season.';
    if(!result.hasSecondary)return '';
    return `Primary direction: ${result.primary.label} · Neighboring influence: ${result.secondary.label}`;
  };

  window.profileWords=function(report){
    const values=report.rec;
    const temperature=values.temp>20?'Warm':values.temp<-20?'Cool':'Neutral';
    const depth=values.value<-25?'Deep':values.value>25?'Light':'Medium';
    const finish=values.chroma<-20||values.def<-20?'Soft':values.chroma>25||values.def>25?'Clear':'Balanced';
    return `${temperature}, ${depth}, and ${finish}`;
  };

  window.styleReportText=function(report){
    const palette=window.paletteFromValues(report.rec);
    const values=report.rec;
    const seasons=analysis(report);
    const examples=[palette[0],palette[1],palette[4],palette[5],palette[6]].map(color=>color[0]).join(', ');
    const depth=values.value<-25?'Deeper anchors and grounded mid-tones support your features.':values.value>25?'Lighter neutrals and lifted color keep the face fresh.':'Mid-value colors give you the easiest range.';
    const clarity=values.chroma<-20||values.def<-20?'Softened, fabric-like color is more reliable than neon or glossy brights.':values.chroma>25||values.def>25?'Cleaner color and firmer contrast stay wearable when the finish remains refined.':'Moderate color strength and contrast are the most flexible.';
    const relationship=window.seasonRelationshipText(report);
    return `${seasons.combinedLabel} best describes your result. Your practical direction is ${window.profileWords(report)}, with wardrobe colors such as ${examples}. ${relationship} ${depth} ${clarity}`.replace(/\s+/g,' ').trim();
  };

  window.outfitCombinations=function(report){
    const palette=window.paletteFromValues(report.rec);
    return [[0,2,5],[1,3,6],[0,1,4]].map(indexes=>indexes.map(index=>palette[index]));
  };

  window.cautionColors=function(report){
    const values=report.rec;
    const colors=[];
    if(values.temp>20)colors.push('Optic white','Icy lavender');
    else if(values.temp<-20)colors.push('Golden camel','Orange coral');
    else colors.push('Extreme orange','Very icy blue');
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
  window.seasonBadge=report=>`<span class="season-badge">${window.seasonName(report)}</span>`;
})();
