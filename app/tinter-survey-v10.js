(function(){
  'use strict';

  const AXES=['temp','value','chroma','def','hue'];
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const shuffle=(items,random=Math.random)=>{
    const copy=[...items];
    for(let i=copy.length-1;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [copy[i],copy[j]]=[copy[j],copy[i]];
    }
    return copy;
  };
  const color=(name,hex,score={})=>({name,hex,score});
  const question=(id,stage,axis,label,text,a,b,options={})=>({
    id,stage,axis,label,question:text,a,b,
    hint:options.hint||'Watch your face rather than deciding which swatch you like more.',
    weight:options.weight??1,
    control:Boolean(options.control),
    expectedTie:Boolean(options.expectedTie),
    reason:options.reason||stage,
    predictedSign:options.predictedSign||0
  });

  const PRACTICE=question(
    'practice-same','practice',null,'Practice round',
    'These two swatches are identical. Try the controls, then choose “They look about the same.”',
    color('Fabric A','#8d8179'),color('Fabric B','#8d8179'),
    {control:true,expectedTie:true,weight:0,hint:'This round teaches the tie option and is not used in your palette.'}
  );

  const FOUNDATION=[
    question('light-neutral','foundation','temp','Light neutral','Which neutral makes your complexion look smoother?',
      color('Cream','#eadcc8',{temp:16,value:2}),color('Soft White','#f3f1ee',{temp:-16,value:4}),
      {hint:'Look for less grayness, yellowing, or redness in the skin.'}),
    question('main-neutral','foundation','temp','Everyday neutral','Which one sits more quietly beside your face?',
      color('Saddle','#8f5f3d',{temp:15,value:-2}),color('Pewter','#8c8d89',{temp:-15}),
      {hint:'The better neutral should support your face rather than compete with it.'}),
    question('depth-anchor','foundation','value','Color depth','Which depth makes your features look more awake?',
      color('Light Camel','#c0996f',{value:16,temp:3}),color('Espresso','#2e221c',{value:-18,temp:3}),
      {hint:'Notice whether the lighter or deeper option gives the face more presence.'}),
    question('rose-strength','foundation','chroma','Color strength','Which rose makes your skin look calmer and more even?',
      color('Dusty Rose','#b88691',{chroma:-16,def:-5}),color('Oxblood','#702c36',{chroma:15,def:9,value:-7}),
      {hint:'Watch for redness, shadows, and whether the color overwhelms the face.'}),
    question('contrast-anchor','foundation','def','Feature contrast','Which one gives your features cleaner definition?',
      color('Mushroom','#8d8179',{def:-16,chroma:-5}),color('Charcoal','#2b2f36',{def:17,value:-8}),
      {hint:'Look at the eyes, brows, jawline, and the transition between features.'}),
    question('accent-direction','foundation','hue','Accent color','Which accent makes the eyes and lips stand out more naturally?',
      color('Terracotta','#9e4f34',{temp:11,hue:14}),color('Storm Blue','#405f75',{temp:-11,hue:-14}),
      {hint:'The better accent should sharpen the features without making the skin look uneven.'}),
    question('green-balance','foundation','chroma','Green balance','Which green feels more harmonious with your natural coloring?',
      color('Sage','#8a9870',{chroma:-14,def:-4,temp:3}),color('Pine','#25483b',{chroma:11,def:6,value:-8,temp:-2}),
      {hint:'Notice whether softer or stronger color looks more polished near the face.'})
  ];

  const CALIBRATION=question(
    'close-call-control','calibration',null,'Close-call calibration',
    'These swatches are intentionally very close. Use “They look about the same” unless one genuinely changes your face.',
    color('Mushroom I','#8d8179'),color('Mushroom II','#8f837b'),
    {control:true,expectedTie:true,weight:0,hint:'This checks how you use the tie option and does not steer your palette.'}
  );

  const TIEBREAKERS={
    temp:[
      question('temp-tie-1','tiebreaker','temp','Neutral balance','Which subtle neutral leaves the skin looking more rested?',
        color('Cafe au Lait','#cdb79e',{temp:13}),color('Dove Gray','#b7b7b2',{temp:-13}),
        {hint:'This is intentionally closer than the first warm/cool comparison.'}),
      question('temp-tie-2','tiebreaker','temp','Color balance','Which color creates fewer unwanted red, yellow, or gray casts?',
        color('Rust Brown','#83432f',{temp:12,hue:6}),color('Blue Spruce','#315e5f',{temp:-12,hue:-6}))
    ],
    value:[
      question('value-tie-1','tiebreaker','value','Depth balance','Which option gives the face better visual weight?',
        color('Oat Milk','#e8ddcf',{value:13}),color('Walnut','#7e5a43',{value:-13}),
        {hint:'Neither is extremely light or dark, so watch the face carefully.'}),
      question('value-tie-2','tiebreaker','value','Anchor balance','Which depth makes the eyes and brows feel more connected?',
        color('Aegean Mist','#91adb2',{value:12,chroma:-2}),color('Ink Navy','#17263a',{value:-14,def:4}))
    ],
    chroma:[
      question('chroma-tie-1','tiebreaker','chroma','Color intensity','Which color looks polished rather than washed out or overpowering?',
        color('Clay Pink','#b98578',{chroma:-12}),color('Cherry Red','#b93a46',{chroma:14,def:5})),
      question('chroma-tie-2','tiebreaker','chroma','Color intensity','Which teal keeps the complexion looking smoother?',
        color('Dusty Teal','#6a8e92',{chroma:-12}),color('Deep Teal','#1e5560',{chroma:13,def:5}))
    ],
    def:[
      question('def-tie-1','tiebreaker','def','Contrast balance','Which option gives definition without making shadows look harsher?',
        color('Soft Taupe','#9b8d7c',{def:-13}),color('Black Navy','#17263a',{def:15,value:-5})),
      question('def-tie-2','tiebreaker','def','Contrast balance','Which one makes the face look more finished?',
        color('Mauvewood','#9a7884',{def:-12,chroma:-3}),color('Sapphire Ink','#24395f',{def:14,chroma:5}))
    ],
    hue:[
      question('hue-tie-1','tiebreaker','hue','Accent balance','Which accent feels more naturally connected to your features?',
        color('Rosewood','#7f4e55',{hue:12,temp:4}),color('Petrol','#244f57',{hue:-12,temp:-4})),
      question('hue-tie-2','tiebreaker','hue','Metal direction','Which finish makes the skin look more luminous?',
        color('Aged Brass','#a68738',{hue:11,temp:5}),color('Brushed Silver','#c9d0d4',{hue:-11,temp:-5}))
    ]
  };

  const BRANCHES={
    temp:{
      positive:[
        question('temp-warm-challenge-1','challenge','temp','Pattern check','Which of these close neutrals gives your face a more polished finish?',
          color('Warm Taupe','#a58e79',{temp:11}),color('Rose Greige','#a89a98',{temp:-6}),{weight:1.15}),
        question('temp-warm-challenge-2','final','temp','Final temperature check','Which muted color keeps the complexion calmer?',
          color('Rusted Rose','#9b5d55',{temp:10,hue:4}),color('Mauvewood','#927985',{temp:-7,hue:-3}),{weight:1.2})
      ],
      negative:[
        question('temp-cool-challenge-1','challenge','temp','Pattern check','Which of these close neutrals makes the skin look more balanced?',
          color('Mushroom Cream','#d8cec2',{temp:6}),color('Pearl Gray','#d5d8d8',{temp:-11}),{weight:1.15}),
        question('temp-cool-challenge-2','final','temp','Final temperature check','Which muted color gives the face a cleaner finish?',
          color('Soft Olive','#85856c',{temp:7}),color('Blue Spruce','#567477',{temp:-10,hue:-4}),{weight:1.2})
      ]
    },
    value:{
      positive:[
        question('value-light-challenge-1','challenge','value','Pattern check','Which mid-light neutral keeps the face looking fresher?',
          color('Cafe au Lait','#d0bba2',{value:11}),color('Ink Taupe','#655952',{value:-6}),{weight:1.15}),
        question('value-light-challenge-2','final','value','Final depth check','Which depth keeps the eyes visible without weighing down the face?',
          color('Soft Slate','#8b959f',{value:9}),color('Slate Navy','#445468',{value:-9}),{weight:1.2})
      ],
      negative:[
        question('value-deep-challenge-1','challenge','value','Pattern check','Which grounded neutral gives your features more presence?',
          color('Light Camel','#c0996f',{value:7}),color('Walnut','#6f4b34',{value:-11}),{weight:1.15}),
        question('value-deep-challenge-2','final','value','Final depth check','Which anchor makes the complexion look more composed?',
          color('Dusty Sky','#95aeb7',{value:8}),color('Ink Blue','#24364e',{value:-12}),{weight:1.2})
      ]
    },
    chroma:{
      positive:[
        question('chroma-clear-challenge-1','challenge','chroma','Pattern check','Which color keeps its energy without overpowering your face?',
          color('Dusty Teal','#6f9190',{chroma:-6}),color('Peacock Teal','#1f5f65',{chroma:11}),{weight:1.15}),
        question('chroma-clear-challenge-2','final','chroma','Final intensity check','Which rose makes the features look more alive?',
          color('Clay Pink','#b98578',{chroma:-6}),color('Cherry Rose','#a84655',{chroma:11,def:3}),{weight:1.2})
      ],
      negative:[
        question('chroma-soft-challenge-1','challenge','chroma','Pattern check','Which softened color looks more refined beside your face?',
          color('Sage Gray','#8a9870',{chroma:-11}),color('Pine','#315846',{chroma:7}),{weight:1.15}),
        question('chroma-soft-challenge-2','final','chroma','Final intensity check','Which rose keeps the complexion looking smoother?',
          color('Dusty Rose','#b88691',{chroma:-11}),color('Oxblood','#7b3540',{chroma:7,def:3}),{weight:1.2})
      ]
    },
    def:{
      positive:[
        question('def-sharp-challenge-1','challenge','def','Pattern check','Which contrast level gives the face cleaner structure?',
          color('Mushroom Charcoal','#5a534f',{def:-6}),color('Ink Navy','#17263a',{def:11}),{weight:1.15}),
        question('def-sharp-challenge-2','final','def','Final contrast check','Which option makes the eyes, brows, and jawline look more connected?',
          color('Mauvewood','#9a7884',{def:-6}),color('Sapphire Ink','#24395f',{def:11}),{weight:1.2})
      ],
      negative:[
        question('def-soft-challenge-1','challenge','def','Pattern check','Which contrast level looks smoother and more expensive?',
          color('Warm Taupe','#9b8d7c',{def:-11}),color('Charcoal','#343940',{def:7}),{weight:1.15}),
        question('def-soft-challenge-2','final','def','Final contrast check','Which option softens shadows without making the face disappear?',
          color('Rose Taupe','#9a7f7f',{def:-10}),color('Black Navy','#1f2b3a',{def:7}),{weight:1.2})
      ]
    },
    hue:{
      positive:[
        question('hue-warm-challenge-1','challenge','hue','Pattern check','Which accent looks more naturally echoed in your features?',
          color('Rosewood','#7f4e55',{hue:8,temp:3}),color('Petrol','#315b61',{hue:-6,temp:-2}),{weight:1.15}),
        question('hue-warm-challenge-2','final','hue','Final accent check','Which finish gives the complexion a healthier glow?',
          color('Aged Brass','#a68738',{hue:10,temp:4}),color('Pewter Silver','#aab1b4',{hue:-7,temp:-3}),{weight:1.2})
      ],
      negative:[
        question('hue-cool-challenge-1','challenge','hue','Pattern check','Which accent feels more naturally connected to the eyes?',
          color('Rosewood','#875d63',{hue:6,temp:2}),color('Petrol','#244f57',{hue:-9,temp:-3}),{weight:1.15}),
        question('hue-cool-challenge-2','final','hue','Final accent check','Which finish looks cleaner against the skin?',
          color('Soft Gold','#b99d68',{hue:7,temp:3}),color('Brushed Silver','#c9d0d4',{hue:-10,temp:-4}),{weight:1.2})
      ]
    }
  };

  function orient(definition,random=Math.random){
    const item=clone(definition);
    if(random()<.5){item.left=item.a;item.right=item.b}
    else{item.left=item.b;item.right=item.a}
    return item;
  }

  function buildInitialQueue(random=Math.random){
    const first=shuffle(FOUNDATION.slice(0,4),random);
    const second=shuffle(FOUNDATION.slice(4),random);
    return [PRACTICE,...first,CALIBRATION,...second].map(item=>orient(item,random));
  }

  function scoreResponse(item,choice,lightingConfidence='good'){
    const delta=Object.fromEntries(AXES.map(axis=>[axis,0]));
    const evidence=Object.fromEntries(AXES.map(axis=>[axis,0]));
    if(item.control){
      const selected=choice?item[choice]:null;
      const rejected=choice?item[choice==='left'?'right':'left']:null;
      return {delta,evidence,vote:choice?(choice==='left'?1:-1):0,selected,rejected};
    }
    const lightWeight=lightingConfidence==='low'?.72:lightingConfidence==='okay'?.88:1;
    if(!choice){
      if(item.axis)evidence[item.axis]=6*item.weight*lightWeight;
      return {delta,evidence,vote:0,selected:null,rejected:null};
    }
    const selected=item[choice];
    const rejected=item[choice==='left'?'right':'left'];
    AXES.forEach(axis=>{
      const difference=(selected.score?.[axis]||0)-(rejected.score?.[axis]||0);
      delta[axis]=difference*.5*item.weight*lightWeight;
      evidence[axis]=Math.abs(difference)*.5*item.weight*lightWeight;
    });
    const primaryDifference=item.axis?delta[item.axis]:0;
    return {delta,evidence,vote:Math.sign(primaryDifference),selected,rejected};
  }

  function axisStats(responses,scores,evidence){
    return Object.fromEntries(AXES.map(axis=>{
      const axisResponses=responses.filter(response=>response.axis===axis&&!response.control);
      const votes=axisResponses.map(response=>response.vote||0);
      const sum=votes.reduce((total,vote)=>total+vote,0);
      const ties=votes.filter(vote=>vote===0).length;
      const decisive=Math.max(0,votes.length-ties);
      const ratio=evidence[axis]>0?Math.abs(scores[axis]/evidence[axis]):0;
      const consistency=decisive?Math.abs(sum)/decisive:0;
      const coverage=Math.min(1,votes.length/2);
      const confidence=clamp((ratio*.52+consistency*.38+coverage*.10)*(1-Math.min(.45,ties*.12)),0,1);
      const direction=Math.sign(scores[axis]||sum);
      return [axis,{axis,count:votes.length,ties,sum,ratio,consistency,coverage,confidence,direction}];
    }));
  }

  function unusedQuestion(pool,usedIds){return (pool||[]).find(item=>!usedIds.has(item.id))}

  function planAdaptive({responses,scores,evidence,queue,random=Math.random}){
    const stats=axisStats(responses,scores,evidence);
    const used=new Set(queue.map(item=>item.id));
    const ranked=Object.values(stats).sort((a,b)=>b.confidence-a.confidence);
    const strongest=ranked.find(stat=>stat.direction!==0);
    const weakest=[...ranked].sort((a,b)=>a.confidence-b.confidence);
    const additions=[];

    if(strongest){
      const branch=strongest.direction>0?'positive':'negative';
      const candidate=unusedQuestion(BRANCHES[strongest.axis]?.[branch],used);
      if(candidate){
        const item=clone(candidate);
        item.predictedSign=strongest.direction;
        item.reason='pattern-confirmation';
        additions.push(item);
        used.add(item.id);
      }
    }

    weakest.forEach(stat=>{
      if(additions.length>=3)return;
      if(strongest&&stat.axis===strongest.axis&&stat.confidence>.42)return;
      const candidate=unusedQuestion(TIEBREAKERS[stat.axis],used);
      if(candidate){
        const item=clone(candidate);
        item.reason='uncertainty';
        additions.push(item);
        used.add(item.id);
      }
    });

    if(additions.length<3){
      ranked.forEach(stat=>{
        if(additions.length>=3)return;
        const candidate=unusedQuestion(TIEBREAKERS[stat.axis],used);
        if(candidate){additions.push(clone(candidate));used.add(candidate.id)}
      });
    }

    return additions.map(item=>orient(item,random));
  }

  function planResolution({responses,scores,evidence,queue,random=Math.random}){
    const used=new Set(queue.map(item=>item.id));
    const challengeResponses=responses.filter(response=>response.predictedSign);
    const additions=[];

    challengeResponses.forEach(response=>{
      if(additions.length>=2||response.vote===response.predictedSign)return;
      const branch=response.predictedSign>0?'positive':'negative';
      const candidate=unusedQuestion(BRANCHES[response.axis]?.[branch],used);
      if(candidate){
        const item=clone(candidate);
        item.stage='final';
        item.predictedSign=response.predictedSign;
        item.reason='contradiction-resolution';
        additions.push(item);
        used.add(item.id);
      }
    });

    if(!additions.length){
      const stats=axisStats(responses,scores,evidence);
      const weakest=Object.values(stats).sort((a,b)=>a.confidence-b.confidence)[0];
      if(weakest&&weakest.confidence<.30){
        const candidate=unusedQuestion(TIEBREAKERS[weakest.axis],used);
        if(candidate){
          const item=clone(candidate);
          item.stage='final';
          item.reason='low-confidence-resolution';
          additions.push(item);
        }
      }
    }

    return additions.map(item=>orient(item,random));
  }

  function normalizeScores(scores,evidence){
    return Object.fromEntries(AXES.map(axis=>{
      const ratio=evidence[axis]>0?scores[axis]/evidence[axis]:0;
      return [axis,Math.round(clamp(ratio*82,-92,92))];
    }));
  }

  function reliability(responses){
    const controls=responses.filter(response=>response.control&&response.expectedTie);
    const calibrationScore=controls.length?controls.reduce((sum,response)=>sum+(response.vote===0?1:0),0)/controls.length:1;
    const timed=responses.filter(response=>Number.isFinite(response.responseMs)&&!response.control);
    const fastRate=timed.length?timed.filter(response=>response.responseMs<420).length/timed.length:0;
    const decisive=responses.filter(response=>!response.control&&response.vote!==0);
    const leftRate=decisive.length?decisive.filter(response=>response.choice==='left').length/decisive.length:.5;
    const sideBias=decisive.length>=6?Math.abs(leftRate-.5)*2:0;
    const challenges=responses.filter(response=>response.predictedSign);
    const held=challenges.filter(response=>response.vote===response.predictedSign).length;
    const contradicted=challenges.filter(response=>response.vote!==0&&response.vote!==response.predictedSign).length;
    const challengeConsistency=challenges.length?held/challenges.length:1;
    const score=clamp(1-(1-calibrationScore)*.24-fastRate*.20-sideBias*.16-(challenges.length?contradicted/challenges.length*.18:0),0,1);
    return {score,calibrationScore,fastRate,sideBias,challengeConsistency,held,contradicted,challengeCount:challenges.length};
  }

  function confidenceSummary(stats,quality){
    const covered=Object.values(stats).filter(stat=>stat.count);
    const axisAverage=covered.length?covered.reduce((sum,stat)=>sum+stat.confidence,0)/covered.length:0;
    const combined=axisAverage*.76+quality.score*.24;
    if(combined>=.68&&quality.score>=.68)return {key:'high',label:'High confidence',description:'Your pattern stayed consistent through calibration and the closer adaptive checks.'};
    if(combined>=.44)return {key:'moderate',label:'Moderate confidence',description:'Several preferences were clear, while one or two dimensions remained close.'};
    return {key:'mixed',label:'Balanced / exploratory result',description:'Your responses were mixed or several comparisons were genuinely close, so the palette stays flexible.'};
  }

  function axisNarrative(axis,value){
    const direction=Math.sign(value);
    if(axis==='temp')return direction>0?'Warmer neutrals and accents repeatedly supported the complexion.':direction<0?'Cooler neutrals and accents repeatedly kept the complexion calmer.':'Warm and cool comparisons were closely balanced.';
    if(axis==='value')return direction>0?'Lighter and mid-light colors kept the face fresher.':direction<0?'Deeper anchors held the features more effectively.':'The face handled both lighter and deeper values well.';
    if(axis==='chroma')return direction>0?'Clearer color continued to work even in the subtler checks.':direction<0?'Softened, fabric-like color looked more refined near the face.':'Both softened and clearer colors remained wearable.';
    if(axis==='def')return direction>0?'Stronger contrast gave the features cleaner structure.':direction<0?'Blended contrast softened shadows and looked more harmonious.':'Moderate contrast was the most reliable direction.';
    return direction>0?'Warmer accent families connected more naturally to the features.':direction<0?'Cooler accent families connected more naturally to the features.':'Warm and cool accent families were closely balanced.';
  }

  function evidenceLines(stats,normalized){
    return Object.values(stats).filter(stat=>stat.count).sort((a,b)=>b.confidence-a.confidence).slice(0,4).map(stat=>axisNarrative(stat.axis,normalized[stat.axis]));
  }

  function phaseLabel(stage){
    return ({practice:'Practice',foundation:'Core comparison',calibration:'Calibration',tiebreaker:'Fine tuning',challenge:'Pattern check',final:'Final check'})[stage]||'Color comparison';
  }

  window.TinterSurvey={AXES,buildInitialQueue,scoreResponse,axisStats,planAdaptive,planResolution,normalizeScores,reliability,confidenceSummary,evidenceLines,phaseLabel};
})();
