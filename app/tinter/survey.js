'use strict';

const AXES=['temp','value','chroma','def','hue'];
const AXIS_LABELS={temp:'temperature',value:'depth',chroma:'color intensity',def:'contrast',hue:'accent direction'};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const clone=value=>JSON.parse(JSON.stringify(value));
const zeroMap=()=>Object.fromEntries(AXES.map(axis=>[axis,0]));
const shuffle=(items,random=Math.random)=>{
  const copy=[...items];
  for(let index=copy.length-1;index>0;index--){
    const swap=Math.floor(random()*(index+1));
    [copy[index],copy[swap]]=[copy[swap],copy[index]];
  }
  return copy;
};
const color=(name,hex,score={})=>({name,hex,score});
const question=(id,stage,axis,label,text,left,right,options={})=>({
  id,stage,axis,label,question:text,left,right,
  hint:options.hint||'Watch your face, not which swatch you like better.',
  weight:options.weight??1,
  control:Boolean(options.control),
  expectedTie:Boolean(options.expectedTie),
  validation:Boolean(options.validation),
  predictedSign:options.predictedSign||0,
  reason:options.reason||stage
});

const PRACTICE=question(
  'practice-same','practice',null,'Practice',
  'These colors are identical. Try the controls, then choose “They look about the same.”',
  color('Practice A','#8d8179'),color('Practice B','#8d8179'),
  {control:true,expectedTie:true,weight:0,hint:'This practice question does not affect your result.'}
);

const FOUNDATION=[
  question('light-neutral','foundation','temp','Warm or cool','Which neutral makes your skin look more even?',
    color('Cream','#eadcc8',{temp:16,value:2}),color('Soft White','#f3f1ee',{temp:-16,value:4}),
    {hint:'Look for less redness, yellowing, or grayness and softer shadows under the eyes.'}),
  question('main-neutral','foundation','temp','Warm or cool','Which neutral distracts less from your face?',
    color('Saddle','#8f5f3d',{temp:15,value:-2}),color('Pewter','#8c8d89',{temp:-15}),
    {hint:'Choose the one that lets your skin, eyes, and brows stay more noticeable than the swatch.'}),
  question('depth-anchor','foundation','value','Light or dark','Which depth keeps your face from looking washed out or heavily shadowed?',
    color('Light Camel','#c0996f',{value:16,temp:3}),color('Espresso','#2e221c',{value:-18,temp:3}),
    {hint:'Too dark can deepen shadows. Too light can make the eyes and brows fade.'}),
  question('rose-strength','foundation','chroma','Muted or bright','Which rose leaves your skin looking more even?',
    color('Dusty Rose','#b88691',{chroma:-16,def:-5}),color('Oxblood','#702c36',{chroma:15,def:9,value:-7}),
    {hint:'Compare redness, grayness, skin texture, and whether the color overwhelms your face.'}),
  question('contrast-anchor','foundation','def','Soft or strong contrast','Which option makes your eyes, brows, lips, and jawline easier to see?',
    color('Mushroom','#8d8179',{def:-16,chroma:-5}),color('Charcoal','#2b2f36',{def:17,value:-8}),
    {hint:'Choose stronger contrast only when it clarifies your features without making shadows harsher.'}),
  question('accent-direction','foundation','hue','Accent direction','Which accent makes your eyes and lips stand out more?',
    color('Terracotta','#9e4f34',{temp:11,hue:14}),color('Storm Blue','#405f75',{temp:-11,hue:-14}),
    {hint:'Choose the one that supports your features without adding redness, yellowing, or grayness.'}),
  question('green-balance','foundation','chroma','Muted or bright','Which green makes your skin look more even?',
    color('Sage','#8a9870',{chroma:-14,def:-4,temp:3}),color('Pine','#25483b',{chroma:11,def:6,value:-8,temp:-2}),
    {hint:'Look for less redness or grayness rather than choosing the green you prefer.'})
];

const CALIBRATION=question(
  'close-call-control','calibration',null,'Close comparison',
  'These colors are almost the same. Choose “They look about the same” unless one truly changes your face.',
  color('Mushroom I','#8d8179'),color('Mushroom II','#8f837b'),
  {control:true,expectedTie:true,weight:0,hint:'This calibration question does not affect your result.'}
);

const TIEBREAKERS={
  temp:[
    question('temp-tie-1','tiebreaker','temp','Warm or cool','Which neutral makes your skin look less red, yellow, or gray?',color('Cafe au Lait','#cdb79e',{temp:13}),color('Dove Gray','#b7b7b2',{temp:-13})),
    question('temp-tie-2','tiebreaker','temp','Warm or cool','Which muted color changes your natural skin tone less?',color('Rust Brown','#83432f',{temp:12,hue:6}),color('Blue Spruce','#315e5f',{temp:-12,hue:-6}))
  ],
  value:[
    question('value-tie-1','tiebreaker','value','Light or dark','Which depth keeps your face from looking pale or heavily shadowed?',color('Oat Milk','#e8ddcf',{value:13}),color('Walnut','#7e5a43',{value:-13})),
    question('value-tie-2','tiebreaker','value','Light or dark','Which depth keeps your eyes and brows easiest to see?',color('Aegean Mist','#91adb2',{value:12,chroma:-2}),color('Ink Navy','#17263a',{value:-14,def:4}))
  ],
  chroma:[
    question('chroma-tie-1','tiebreaker','chroma','Muted or bright','Which color keeps your skin even without looking faded or overpowering?',color('Clay Pink','#b98578',{chroma:-12}),color('Cherry Red','#b93a46',{chroma:14,def:5})),
    question('chroma-tie-2','tiebreaker','chroma','Muted or bright','Which teal leaves less redness or grayness in your skin?',color('Dusty Teal','#6a8e92',{chroma:-12}),color('Deep Teal','#1e5560',{chroma:13,def:5}))
  ],
  def:[
    question('def-tie-1','tiebreaker','def','Soft or strong contrast','Which option makes your features clearer without making facial shadows harsher?',color('Soft Taupe','#9b8d7c',{def:-13}),color('Black Navy','#17263a',{def:15,value:-5})),
    question('def-tie-2','tiebreaker','def','Soft or strong contrast','Which option keeps the skin even and the eyes and brows easy to see?',color('Mauvewood','#9a7884',{def:-12,chroma:-3}),color('Sapphire Ink','#24395f',{def:14,chroma:5}))
  ],
  hue:[
    question('hue-tie-1','tiebreaker','hue','Accent direction','Which accent makes your eyes and lips stand out more?',color('Rosewood','#7f4e55',{hue:12,temp:4}),color('Petrol','#244f57',{hue:-12,temp:-4})),
    question('hue-tie-2','tiebreaker','hue','Metal direction','Which metal makes your skin look less red, yellow, or gray?',color('Aged Brass','#a68738',{hue:11,temp:5}),color('Brushed Silver','#c9d0d4',{hue:-11,temp:-5}))
  ]
};

const BRANCHES={
  temp:{
    positive:[
      question('temp-warm-challenge-1','challenge','temp','Closer warm/cool check','Which close neutral makes your skin look more even?',color('Warm Taupe','#a58e79',{temp:11}),color('Rose Greige','#a89a98',{temp:-6}),{weight:1.15}),
      question('temp-warm-challenge-2','final','temp','Final warm/cool check','Which muted color leaves less redness or grayness in your face?',color('Rusted Rose','#9b5d55',{temp:10,hue:4}),color('Mauvewood','#927985',{temp:-7,hue:-3}),{weight:1.2})
    ],
    negative:[
      question('temp-cool-challenge-1','challenge','temp','Closer warm/cool check','Which close neutral changes your natural complexion less?',color('Mushroom Cream','#d8cec2',{temp:6}),color('Pearl Gray','#d5d8d8',{temp:-11}),{weight:1.15}),
      question('temp-cool-challenge-2','final','temp','Final warm/cool check','Which muted color creates less redness, yellowing, or grayness?',color('Soft Olive','#85856c',{temp:7}),color('Blue Spruce','#567477',{temp:-10,hue:-4}),{weight:1.2})
    ]
  },
  value:{
    positive:[
      question('value-light-challenge-1','challenge','value','Closer depth check','Which depth keeps your face from looking washed out?',color('Cafe au Lait','#d0bba2',{value:11}),color('Ink Taupe','#655952',{value:-6}),{weight:1.15}),
      question('value-light-challenge-2','final','value','Final depth check','Which depth keeps the eyes visible without making the face look heavy?',color('Soft Slate','#8b959f',{value:9}),color('Slate Navy','#445468',{value:-9}),{weight:1.2})
    ],
    negative:[
      question('value-deep-challenge-1','challenge','value','Closer depth check','Which depth keeps your eyes and brows more visible?',color('Light Camel','#c0996f',{value:7}),color('Walnut','#6f4b34',{value:-11}),{weight:1.15}),
      question('value-deep-challenge-2','final','value','Final depth check','Which darker color keeps the skin more even and the features easier to see?',color('Dusty Sky','#95aeb7',{value:8}),color('Ink Blue','#24364e',{value:-12}),{weight:1.2})
    ]
  },
  chroma:{
    positive:[
      question('chroma-clear-challenge-1','challenge','chroma','Closer intensity check','Which color makes your face look more alive without overpowering it?',color('Dusty Teal','#6f9190',{chroma:-6}),color('Peacock Teal','#1f5f65',{chroma:11}),{weight:1.15}),
      question('chroma-clear-challenge-2','final','chroma','Final intensity check','Which rose makes your skin and lips look healthier?',color('Clay Pink','#b98578',{chroma:-6}),color('Cherry Rose','#a84655',{chroma:11,def:3}),{weight:1.2})
    ],
    negative:[
      question('chroma-soft-challenge-1','challenge','chroma','Closer intensity check','Which color leaves your skin looking smoother and more even?',color('Sage Gray','#8a9870',{chroma:-11}),color('Pine','#315846',{chroma:7}),{weight:1.15}),
      question('chroma-soft-challenge-2','final','chroma','Final intensity check','Which rose creates less redness, grayness, or facial shadow?',color('Dusty Rose','#b88691',{chroma:-11}),color('Oxblood','#7b3540',{chroma:7,def:3}),{weight:1.2})
    ]
  },
  def:{
    positive:[
      question('def-sharp-challenge-1','challenge','def','Closer contrast check','Which contrast level makes the eyes, brows, and jawline easier to see?',color('Mushroom Charcoal','#5a534f',{def:-6}),color('Ink Navy','#17263a',{def:11}),{weight:1.15}),
      question('def-sharp-challenge-2','final','def','Final contrast check','Which option makes your eyes, brows, lips, and jawline look clearer?',color('Mauvewood','#9a7884',{def:-6}),color('Sapphire Ink','#24395f',{def:11}),{weight:1.2})
    ],
    negative:[
      question('def-soft-challenge-1','challenge','def','Closer contrast check','Which contrast level softens shadows without washing out your features?',color('Warm Taupe','#9b8d7c',{def:-11}),color('Charcoal','#343940',{def:7}),{weight:1.15}),
      question('def-soft-challenge-2','final','def','Final contrast check','Which option reduces facial shadows without making your features disappear?',color('Rose Taupe','#9a7f7f',{def:-10}),color('Black Navy','#1f2b3a',{def:7}),{weight:1.2})
    ]
  },
  hue:{
    positive:[
      question('hue-warm-challenge-1','challenge','hue','Closer accent check','Which accent makes your eyes and lips stand out more?',color('Rosewood','#7f4e55',{hue:8,temp:3}),color('Petrol','#315b61',{hue:-6,temp:-2}),{weight:1.15}),
      question('hue-warm-challenge-2','final','hue','Final accent check','Which metal makes the skin look more even and the eyes brighter?',color('Aged Brass','#a68738',{hue:10,temp:4}),color('Pewter Silver','#aab1b4',{hue:-7,temp:-3}),{weight:1.2})
    ],
    negative:[
      question('hue-cool-challenge-1','challenge','hue','Closer accent check','Which accent makes your eyes stand out more?',color('Rosewood','#875d63',{hue:6,temp:2}),color('Petrol','#244f57',{hue:-9,temp:-3}),{weight:1.15}),
      question('hue-cool-challenge-2','final','hue','Final accent check','Which metal creates less redness, yellowing, or grayness in the skin?',color('Soft Gold','#b99d68',{hue:7,temp:3}),color('Brushed Silver','#c9d0d4',{hue:-10,temp:-4}),{weight:1.2})
    ]
  }
};

const HOLDOUTS={
  temp:question('temp-holdout','validation','temp','Final prediction check','Which neutral makes your skin look less red, yellow, or gray?',color('Stone Beige','#b7a999',{temp:8}),color('Blue Gray','#a7afb5',{temp:-8}),{validation:true,weight:0}),
  value:question('value-holdout','validation','value','Final prediction check','Which depth keeps your eyes and brows easier to see?',color('Sandstone','#bca189',{value:8}),color('Slate Brown','#655955',{value:-8}),{validation:true,weight:0}),
  chroma:question('chroma-holdout','validation','chroma','Final prediction check','Which berry keeps your skin looking more even?',color('Muted Berry','#9a6f7b',{chroma:-8}),color('Clear Berry','#9d4057',{chroma:8}),{validation:true,weight:0}),
  def:question('def-holdout','validation','def','Final prediction check','Which option makes your features clearer without making shadows harsher?',color('Rose Taupe','#927b7b',{def:-8}),color('Ink Plum','#443544',{def:8}),{validation:true,weight:0}),
  hue:question('hue-holdout','validation','hue','Final prediction check','Which accent makes your eyes and lips stand out more?',color('Muted Coral','#a86f63',{hue:8}),color('Dusty Blue','#607d8f',{hue:-8}),{validation:true,weight:0})
};

function orient(definition,random=Math.random){
  const item=clone(definition);
  if(random()>=.5)[item.left,item.right]=[item.right,item.left];
  return item;
}

function buildInitialQueue(random=Math.random){
  const first=shuffle(FOUNDATION.slice(0,4),random);
  const second=shuffle(FOUNDATION.slice(4),random);
  return [PRACTICE,...first,CALIBRATION,...second].map(item=>orient(item,random));
}

function colorVote(item,colorValue){
  if(!item.axis||!colorValue)return 0;
  return Math.sign(Number(colorValue.score?.[item.axis])||0);
}

function scoreResponse(item,choice,lighting='good'){
  const delta=zeroMap();
  const evidence=zeroMap();
  const selected=choice?item[choice]:null;
  const rejected=choice?(choice==='left'?item.right:item.left):null;
  const vote=selected?colorVote(item,selected):0;
  if(item.control||item.validation||!item.axis||!selected)return {delta,evidence,selected,rejected,vote};
  const lightFactor=lighting==='low'?.72:lighting==='okay'?.88:lighting==='skipped'?.82:1;
  for(const axis of AXES){
    const selectedScore=Number(selected.score?.[axis])||0;
    const rejectedScore=Number(rejected?.score?.[axis])||0;
    const amount=((selectedScore-rejectedScore)/2)*(item.weight||1)*lightFactor;
    delta[axis]=amount;
    evidence[axis]=Math.abs(amount);
  }
  return {delta,evidence,selected,rejected,vote};
}

function normalizedAxis(score,evidence){
  if(!evidence)return 0;
  return clamp((score/evidence)*100,-100,100);
}

function normalizeScores(scores,evidence){
  return Object.fromEntries(AXES.map(axis=>[axis,Math.round(normalizedAxis(scores[axis]||0,evidence[axis]||0))]));
}

function axisStats(responses,scores,evidence){
  const result={};
  for(const axis of AXES){
    const relevant=responses.filter(response=>response.axis===axis&&!response.control&&!response.validation);
    const decisive=relevant.filter(response=>response.vote!==0);
    const direction=Math.sign(scores[axis]||0);
    const agreeing=direction===0?0:decisive.filter(response=>response.vote===direction).length;
    const consistency=decisive.length?agreeing/decisive.length:.5;
    const volume=clamp((evidence[axis]||0)/48,0,1);
    result[axis]={
      axis,label:AXIS_LABELS[axis],questions:relevant.length,decisive:decisive.length,
      positive:decisive.filter(response=>response.vote>0).length,
      negative:decisive.filter(response=>response.vote<0).length,
      ties:relevant.length-decisive.length,direction,
      normalized:Math.round(normalizedAxis(scores[axis]||0,evidence[axis]||0)),
      consistency,confidence:clamp((consistency*.72)+(volume*.28),0,1),evidence:evidence[axis]||0
    };
  }
  return result;
}

function planAdaptive({responses,scores,evidence,queue},random=Math.random){
  const stats=axisStats(responses,scores,evidence);
  const used=new Set(queue.map(item=>item.id));
  const ranked=AXES.map(axis=>stats[axis]).sort((a,b)=>b.confidence-a.confidence);
  const strongest=ranked[0];
  const weakest=[...ranked].sort((a,b)=>a.confidence-b.confidence).slice(0,2);
  const additions=[];
  if(strongest?.direction){
    const branch=BRANCHES[strongest.axis][strongest.direction>0?'positive':'negative'][0];
    const item=orient({...branch,predictedSign:strongest.direction,reason:'confirm strongest pattern'},random);
    if(!used.has(item.id)){additions.push(item);used.add(item.id)}
  }
  for(const stat of weakest){
    const candidate=TIEBREAKERS[stat.axis].find(item=>!used.has(item.id));
    if(candidate){additions.push(orient({...candidate,predictedSign:stat.direction,reason:'resolve uncertain dimension'},random));used.add(candidate.id)}
  }
  return additions.slice(0,3);
}

function planResolution({responses,scores,evidence,queue},random=Math.random){
  const used=new Set(queue.map(item=>item.id));
  const contradictions=responses.filter(response=>['challenge','final'].includes(response.stage)&&response.predictedSign&&response.vote&&response.vote!==response.predictedSign);
  const axes=[...new Set(contradictions.map(response=>response.axis))];
  const additions=[];
  const stats=axisStats(responses,scores,evidence);
  for(const axis of axes.slice(0,2)){
    const direction=stats[axis].direction||-contradictions.find(response=>response.axis===axis).predictedSign;
    const branch=BRANCHES[axis][direction>=0?'positive':'negative'][1];
    if(branch&&!used.has(branch.id))additions.push(orient({...branch,predictedSign:direction,reason:'recheck mixed signal'},random));
  }
  return additions;
}

function planValidation({scores,evidence,queue,count=2},random=Math.random){
  const used=new Set(queue.map(item=>item.id));
  const ranked=AXES.map(axis=>({axis,strength:Math.abs(normalizedAxis(scores[axis]||0,evidence[axis]||0)),sign:Math.sign(scores[axis]||0)})).sort((a,b)=>b.strength-a.strength);
  const additions=[];
  for(const item of ranked){
    const holdout=HOLDOUTS[item.axis];
    if(!holdout||used.has(holdout.id))continue;
    additions.push(orient({...holdout,predictedSign:item.sign,reason:'holdout validation'},random));
    if(additions.length>=count)break;
  }
  return additions;
}

function reliability(responses){
  const controls=responses.filter(response=>response.control);
  const calibrationCorrect=controls.filter(response=>response.expectedTie&&response.choice==='tie').length;
  const calibrationScore=controls.length?calibrationCorrect/controls.length:1;
  const scored=responses.filter(response=>!response.control&&!response.validation);
  const decisive=scored.filter(response=>response.choice!=='tie');
  const tieRate=scored.length?(scored.length-decisive.length)/scored.length:0;
  const rushedRate=scored.length?scored.filter(response=>response.responseMs>0&&response.responseMs<650).length/scored.length:0;
  const leftRate=decisive.length?decisive.filter(response=>response.choice==='left').length/decisive.length:.5;
  const sideBias=Math.abs(leftRate-.5)*2;
  const challenges=scored.filter(response=>response.predictedSign&&response.vote);
  const contradictions=challenges.filter(response=>response.vote!==response.predictedSign).length;
  const contradictionRate=challenges.length?contradictions/challenges.length:0;
  return {calibrationScore,tieRate,rushedRate,sideBias,contradictionRate};
}

function validationSummary(responses){
  const validation=responses.filter(response=>response.validation);
  let correct=0;
  let decisive=0;
  for(const response of validation){
    if(!response.vote)continue;
    decisive++;
    if(response.predictedSign&&response.vote===response.predictedSign)correct++;
  }
  return {total:validation.length,decisive,correct,accuracy:decisive?correct/decisive:null};
}

function confidenceSummary(stats,quality,validation={accuracy:null}){
  const axisValues=AXES.map(axis=>stats[axis]?.confidence||0);
  const evidenceScore=axisValues.reduce((sum,value)=>sum+value,0)/axisValues.length;
  const validationScore=validation.accuracy==null?.72:validation.accuracy;
  let score=(evidenceScore*.58)+(quality.calibrationScore*.16)+((1-quality.rushedRate)*.08)+((1-quality.sideBias)*.06)+((1-quality.contradictionRate)*.05)+(validationScore*.07);
  if(quality.calibrationScore<1)score=Math.min(score,.74);
  score=clamp(score,0,1);
  return {score,label:score>=.78?'High':score>=.58?'Moderate':'Low'};
}

function evidenceLines(stats,rec){
  const wording={
    temp:value=>value>18?'warmer colors repeatedly kept the complexion more even':value<-18?'cooler colors repeatedly kept the complexion more even':'warm and cool comparisons stayed close',
    value:value=>value>18?'lighter-to-medium depths kept the features visible':value<-18?'deeper colors gave the face stronger support':'light and dark comparisons stayed balanced',
    chroma:value=>value>18?'clearer colors held up without overpowering the face':value<-18?'muted colors reduced harshness and distraction':'muted and bright colors performed similarly',
    def:value=>value>18?'stronger contrast clarified the eyes, brows, lips, and jawline':value<-18?'softer contrast reduced shadows without losing the features':'soft and strong contrast stayed balanced',
    hue:value=>value>18?'warmer accents supported the eyes and lips more often':value<-18?'cooler accents supported the eyes and lips more often':'warm and cool accents stayed close'
  };
  return AXES.map(axis=>{
    const stat=stats[axis];
    if(!stat?.questions)return null;
    return `${wording[axis](rec[axis])} (${stat.questions} checks).`;
  }).filter(Boolean);
}

function compareSessions(current,previous){
  const averageDifference=AXES.reduce((sum,axis)=>sum+Math.abs((current[axis]||0)-(previous[axis]||0)),0)/AXES.length;
  const score=clamp(1-(averageDifference/160),0,1);
  return {score,percent:Math.round(score*100),label:score>=.82?'Very stable':score>=.65?'Mostly stable':'Changed'};
}

function phaseLabel(stage){
  return ({practice:'Practice',foundation:'Color comparison',calibration:'Calibration',tiebreaker:'Closer comparison',challenge:'Pattern check',final:'Final check',validation:'Prediction check'})[stage]||'Color comparison';
}

const TinterSurvey={
  AXES,AXIS_LABELS,buildInitialQueue,scoreResponse,normalizeScores,axisStats,
  planAdaptive,planResolution,planValidation,reliability,validationSummary,
  confidenceSummary,evidenceLines,compareSessions,phaseLabel
};

if(typeof window!=='undefined')window.TinterSurvey=TinterSurvey;
export { TinterSurvey };
