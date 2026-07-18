(function(){
  'use strict';

  const WEIGHTS={temp:1.25,value:1.1,chroma:1,def:.9,hue:.55};
  const SEASONS={
    trueAutumn:{label:'True Autumn',family:'Autumn',trait:'True',vector:{temp:65,value:-18,chroma:-4,def:0,hue:34}},
    deepAutumn:{label:'Deep Autumn',family:'Autumn',trait:'Deep',vector:{temp:34,value:-70,chroma:8,def:34,hue:24}},
    softAutumn:{label:'Soft Autumn',family:'Autumn',trait:'Soft',vector:{temp:27,value:-14,chroma:-60,def:-40,hue:15}},
    trueSpring:{label:'True Spring',family:'Spring',trait:'True',vector:{temp:65,value:24,chroma:43,def:30,hue:30}},
    lightSpring:{label:'Light Spring',family:'Spring',trait:'Light',vector:{temp:35,value:66,chroma:15,def:-4,hue:15}},
    brightSpring:{label:'Bright Spring',family:'Spring',trait:'Bright',vector:{temp:24,value:14,chroma:76,def:66,hue:20}},
    trueSummer:{label:'True Summer',family:'Summer',trait:'True',vector:{temp:-62,value:10,chroma:-18,def:-5,hue:-30}},
    lightSummer:{label:'Light Summer',family:'Summer',trait:'Light',vector:{temp:-30,value:66,chroma:-20,def:-10,hue:-15}},
    softSummer:{label:'Soft Summer',family:'Summer',trait:'Soft',vector:{temp:-22,value:-4,chroma:-60,def:-40,hue:-10}},
    trueWinter:{label:'True Winter',family:'Winter',trait:'True',vector:{temp:-65,value:-16,chroma:56,def:65,hue:-30}},
    deepWinter:{label:'Deep Winter',family:'Winter',trait:'Deep',vector:{temp:-31,value:-70,chroma:32,def:56,hue:-16}},
    brightWinter:{label:'Bright Winter',family:'Winter',trait:'Bright',vector:{temp:-25,value:4,chroma:80,def:80,hue:-20}}
  };

  const PALETTE_KEYS={
    trueAutumn:'trueAutumn',deepAutumn:'deepAutumn',softAutumn:'softAutumn',
    trueSpring:'trueSpring',lightSpring:'lightSpring',brightSpring:'trueSpring',
    trueSummer:'trueSummer',lightSummer:'lightSummer',softSummer:'softSummer',
    trueWinter:'trueWinter',deepWinter:'deepWinter',brightWinter:'trueWinter'
  };

  function valuesFrom(input){return input?.rec||input||{}}

  function distance(values,season){
    let weighted=0,total=0;
    Object.entries(WEIGHTS).forEach(([axis,weight])=>{
      const delta=(Number(values[axis])||0)-season.vector[axis];
      weighted+=weight*delta*delta;
      total+=weight;
    });
    return Math.sqrt(weighted/total)/100;
  }

  function rank(values){
    return Object.entries(SEASONS).map(([key,season])=>({key,...season,distance:distance(values,season)})).sort((a,b)=>a.distance-b.distance);
  }

  function isNeighbor(a,b){return a.family===b.family||a.trait===b.trait}

  function crossPaletteKey(primary,secondary){
    const pair=new Set([primary.key,secondary?.key]);
    if(pair.has('deepAutumn')&&pair.has('deepWinter'))return primary.key==='deepAutumn'?'deepAutumnWinter':'deepWinterAutumn';
    if(pair.has('softAutumn')&&pair.has('softSummer'))return 'softSummerAutumn';
    if(pair.has('lightSpring')&&pair.has('lightSummer'))return 'lightSpringSummer';
    if(pair.has('brightSpring')&&pair.has('brightWinter'))return 'brightSpringWinter';
    return PALETTE_KEYS[primary.key]||'softSummerAutumn';
  }

  function combinedLabel(primary,secondary,hasSecondary){
    if(!hasSecondary||!secondary)return primary.label;
    if(primary.family===secondary.family)return `${primary.label} with ${secondary.label} influence`;
    if(primary.trait===secondary.trait)return `${primary.label}–${secondary.family}`;
    return `${primary.label} with ${secondary.label} influence`;
  }

  function analyze(input){
    const values=valuesFrom(input);
    const ranked=rank(values);
    const primary=ranked[0];
    const secondary=ranked.slice(1).find(candidate=>isNeighbor(primary,candidate))||ranked[1];
    const closeness=secondary?primary.distance/Math.max(secondary.distance,.0001):0;
    const hasSecondary=Boolean(secondary&&isNeighbor(primary,secondary)&&closeness>=.66);
    return {
      primary,
      secondary:hasSecondary?secondary:null,
      nearestSecondary:secondary,
      hasSecondary,
      closeness,
      secondaryStrength:Math.round(closeness*100),
      combinedLabel:combinedLabel(primary,secondary,hasSecondary),
      paletteKey:crossPaletteKey(primary,hasSecondary?secondary:null),
      ranked
    };
  }

  window.SEASON_ARCHETYPES=SEASONS;
  window.seasonAnalysis=analyze;
  window.seasonPaletteKey=input=>analyze(input).paletteKey;
})();
