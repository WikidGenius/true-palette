(function(){
  'use strict';

  const PURE={
    trueAutumn:{key:'trueAutumn',label:'True Autumn',family:'Autumn',trait:'Warm'},
    deepAutumn:{key:'deepAutumn',label:'Deep Autumn',family:'Autumn',trait:'Deep'},
    softAutumn:{key:'softAutumn',label:'Soft Autumn',family:'Autumn',trait:'Soft'},
    trueSpring:{key:'trueSpring',label:'True Spring',family:'Spring',trait:'Warm'},
    lightSpring:{key:'lightSpring',label:'Light Spring',family:'Spring',trait:'Light'},
    brightSpring:{key:'brightSpring',label:'Bright Spring',family:'Spring',trait:'Bright'},
    trueSummer:{key:'trueSummer',label:'True Summer',family:'Summer',trait:'Cool'},
    softSummer:{key:'softSummer',label:'Soft Summer',family:'Summer',trait:'Soft'},
    lightSummer:{key:'lightSummer',label:'Light Summer',family:'Summer',trait:'Light'},
    trueWinter:{key:'trueWinter',label:'True Winter',family:'Winter',trait:'Cool'},
    deepWinter:{key:'deepWinter',label:'Deep Winter',family:'Winter',trait:'Deep'},
    brightWinter:{key:'brightWinter',label:'Bright Winter',family:'Winter',trait:'Bright'}
  };

  const neutralResult=(label,paletteKey,trait)=>({
    primary:{key:label.replace(/\s+/g,'').replace(/^./,c=>c.toLowerCase()),label,family:'Neutral',trait},
    secondary:null,hasSecondary:false,combinedLabel:label,paletteKey,kind:'neutral'
  });

  function hybrid(primary,secondary,paletteKey){
    return {
      primary:PURE[primary],secondary:PURE[secondary],hasSecondary:true,
      combinedLabel:`${PURE[primary].label} with ${PURE[secondary].label} influence`,
      paletteKey,kind:'hybrid'
    };
  }

  function pure(key){
    const item=PURE[key]||PURE.trueSummer;
    return {primary:item,secondary:null,hasSecondary:false,combinedLabel:item.label,paletteKey:item.key,kind:'pure'};
  }

  function valuesFrom(input){return input?.rec||input||{}}

  function analyze(input){
    const v=valuesFrom(input);
    const temp=Number(v.temp)||0,value=Number(v.value)||0,chroma=Number(v.chroma)||0,def=Number(v.def)||0,hue=Number(v.hue)||0;
    const lean=temp*.72+hue*.28;
    const neutralCore=Math.abs(temp)<=14&&Math.abs(hue)<=18;
    const neutralZone=Math.abs(temp)<30;
    const deep=value<=-30;
    const light=value>=30;
    const soft=chroma<=-22||def<=-24;
    const bright=chroma>=28||def>=30;

    if(neutralCore){
      if(deep)return neutralResult('Deep Neutral',lean>=0?'deepAutumnWinter':'deepWinterAutumn','Deep');
      if(light)return neutralResult('Light Neutral','lightSpringSummer','Light');
      if(soft)return neutralResult('Soft Neutral','softSummerAutumn','Soft');
      if(bright)return neutralResult('Bright Neutral','brightSpringWinter','Bright');
      return neutralResult('Balanced Neutral','softSummerAutumn','Balanced');
    }

    if(neutralZone){
      if(deep)return lean>=0?hybrid('deepAutumn','deepWinter','deepAutumnWinter'):hybrid('deepWinter','deepAutumn','deepWinterAutumn');
      if(light)return lean>=0?hybrid('lightSpring','lightSummer','lightSpringSummer'):hybrid('lightSummer','lightSpring','lightSpringSummer');
      if(soft)return lean>=0?hybrid('softAutumn','softSummer','softSummerAutumn'):hybrid('softSummer','softAutumn','softSummerAutumn');
      if(bright)return lean>=0?hybrid('brightSpring','brightWinter','brightSpringWinter'):hybrid('brightWinter','brightSpring','brightSpringWinter');
      return neutralResult('Balanced Neutral','softSummerAutumn','Balanced');
    }

    if(lean>0){
      if(deep)return pure('deepAutumn');
      if(light)return pure(bright?'brightSpring':'lightSpring');
      if(soft)return pure('softAutumn');
      if(bright)return pure('brightSpring');
      return pure(value<0?'trueAutumn':'trueSpring');
    }

    if(deep)return pure('deepWinter');
    if(light)return pure('lightSummer');
    if(soft)return pure('softSummer');
    if(bright)return pure('brightWinter');
    return pure(value<0||def>12?'trueWinter':'trueSummer');
  }

  window.seasonAnalysis=analyze;
  window.seasonPaletteKey=input=>analyze(input).paletteKey;
})();