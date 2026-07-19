(function(){
  'use strict';

  const analysis=report=>window.seasonAnalysis?.(report)||{
    primary:{label:'Balanced Neutral',family:'Neutral',trait:'Balanced'},
    secondary:null,hasSecondary:false,combinedLabel:'Balanced Neutral',paletteKey:'softSummerAutumn',kind:'neutral'
  };

  const joinList=items=>{
    const values=items.filter(Boolean);
    if(values.length<2)return values[0]||'';
    if(values.length===2)return `${values[0]} and ${values[1]}`;
    return `${values.slice(0,-1).join(', ')}, and ${values.at(-1)}`;
  };

  function profileTraits(report){
    const values=report.rec;
    return {
      temperature:values.temp>=30?'Warm temperature':values.temp<=-30?'Cool temperature':'Neutral temperature',
      depth:values.value<=-30?'Deep depth':values.value>=30?'Light depth':'Medium depth',
      finish:values.chroma<=-22||values.def<=-24?'Soft color':values.chroma>=28||values.def>=30?'Clear color':'Balanced color'
    };
  }

  window.seasonResult=analysis;
  window.seasonName=report=>analysis(report).combinedLabel;
  window.primarySeasonName=report=>analysis(report).primary.label;
  window.secondarySeasonName=report=>analysis(report).secondary?.label||'';
  window.seasonRelationshipText=function(report){
    const result=analysis(report);
    if(result.kind==='neutral')return 'Warm and cool comparisons were close, so depth, color clarity, and contrast matter more than a single seasonal family.';
    if(!result.hasSecondary)return `Your closest seasonal match is ${result.primary.label}.`;
    return `Your closest seasonal match is ${result.primary.label}, with some ${result.secondary.label} influence.`;
  };

  window.profileTraits=profileTraits;
  window.profileWords=function(report){
    const traits=profileTraits(report);
    return `${traits.temperature} · ${traits.depth} · ${traits.finish}`;
  };

  window.styleReportText=function(report){
    const palette=window.paletteFromValues(report.rec);
    const values=report.rec;
    const examples=[palette[0],palette[1],palette[4],palette[5],palette[6]].map(color=>color[0]);
    const traits=profileTraits(report);
    const direction=`${traits.temperature.toLowerCase()}, ${traits.depth.toLowerCase()}, and ${traits.finish.toLowerCase()}`;
    const depth=values.value<=-30?'Deeper anchors and grounded mid-tones give your features steady support.':values.value>=30?'Lighter neutrals and lifted mid-tones keep your face fresh without washing out your features.':'Medium-depth colors give you the broadest and easiest range.';
    const clarity=values.chroma<=-22||values.def<=-24?'Softened, fabric-like color reduces distraction and keeps facial shadows gentle.':values.chroma>=28||values.def>=30?'Clean color and defined contrast keep your eyes, brows, and lips easy to see.':'Moderate color strength and contrast are the most flexible.';
    return `${window.seasonRelationshipText(report)} Focus on ${direction}. Strong starting colors include ${joinList(examples)}. ${depth} ${clarity}`.replace(/\s+/g,' ').trim();
  };

  window.outfitCombinations=function(report){
    const palette=window.paletteFromValues(report.rec);
    return [[0,2,5],[1,3,6],[0,1,4]].map(indexes=>indexes.map(index=>palette[index]));
  };

  window.cautionColors=function(report){
    const values=report.rec;
    const colors=[];
    if(values.temp>=30)colors.push('Optic white','Icy lavender');
    else if(values.temp<=-30)colors.push('Golden camel','Orange coral');
    else colors.push('Strong orange','Very icy blue');
    if(values.chroma<=-22)colors.push('Electric brights');
    else if(values.chroma>=28)colors.push('Muddy gray-beige');
    else colors.push('Highlighter yellow');
    if(values.value<=-30)colors.push('Very pale pastels');
    else if(values.value>=30)colors.push('Near-black colors');
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