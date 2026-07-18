import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

globalThis.window=globalThis;
const load=path=>vm.runInThisContext(fs.readFileSync(new URL(path,import.meta.url),'utf8'),{filename:path});
load('../app/tinter-survey-v11.js');
load('../app/season-hybrid-v11.js');

const survey=globalThis.TinterSurvey;
assert.ok(survey,'TinterSurvey should load');

const fixed=()=>0.25;
const queue=survey.buildInitialQueue(fixed);
assert.equal(queue.length,9,'initial survey should contain nine rounds');
assert.equal(queue[0].stage,'practice');
assert.equal(queue.filter(item=>item.control).length,2);

const diagnostic=queue.find(item=>item.axis&&!item.control);
const left=survey.scoreResponse(diagnostic,'left','good');
const right=survey.scoreResponse(diagnostic,'right','good');
for(const axis of survey.AXES){
  assert.ok(Math.abs(left.delta[axis]+right.delta[axis])<1e-9,`diagnostic scoring should be symmetric for ${axis}`);
}

const responses=[
  {axis:'temp',vote:1,control:false,validation:false},
  {axis:'temp',vote:1,control:false,validation:false},
  {axis:'value',vote:-1,control:false,validation:false},
  {axis:'chroma',vote:-1,control:false,validation:false},
  {axis:'def',vote:0,control:false,validation:false},
  {axis:'hue',vote:1,control:false,validation:false}
];
const scores={temp:28,value:-15,chroma:-14,def:0,hue:12};
const evidence={temp:30,value:18,chroma:18,def:8,hue:14};

const adaptive=survey.planAdaptive({responses,scores,evidence,queue,random:fixed});
assert.equal(adaptive.length,3,'adaptive survey should add three focused questions');
assert.ok(adaptive.some(item=>item.reason==='pattern-confirmation'),'adaptive survey should challenge the strongest pattern');

const validation=survey.planValidation({responses,scores,evidence,queue:[...queue,...adaptive],random:fixed,count:2});
assert.equal(validation.length,2,'holdout validation should add two unseen questions');
for(const item of validation){
  assert.equal(item.validation,true);
  const result=survey.scoreResponse(item,'left','good');
  assert.deepEqual(Object.values(result.delta),[0,0,0,0,0],'validation must not change palette scores');
  assert.deepEqual(Object.values(result.evidence),[0,0,0,0,0],'validation must not add diagnostic evidence');
}

const firstValidation=validation[0];
const correctSide=['left','right'].find(side=>survey.scoreResponse(firstValidation,side,'good').vote===firstValidation.predictedSign);
assert.ok(correctSide,'validation should contain a side matching the prediction');
const validationSummary=survey.validationSummary([
  {validation:true,predictedSign:firstValidation.predictedSign,vote:firstValidation.predictedSign},
  {validation:true,predictedSign:-1,vote:0}
]);
assert.equal(validationSummary.correct,1);
assert.equal(validationSummary.ties,1);

const stable=survey.compareSessions(
  {temp:20,value:-40,chroma:-25,def:-15,hue:8},
  {temp:18,value:-37,chroma:-21,def:-12,hue:10}
);
assert.ok(stable.score>=88,'nearby repeat sessions should be very stable');

const hybrid=globalThis.seasonAnalysis({temp:20,value:-55,chroma:2,def:34,hue:10});
assert.equal(hybrid.combinedLabel,'Deep Autumn + Winter');
assert.equal(hybrid.paletteKey,'deepAutumnWinter');

const reverseHybrid=globalThis.seasonAnalysis({temp:-20,value:-55,chroma:2,def:34,hue:-10});
assert.equal(reverseHybrid.combinedLabel,'Deep Winter + Autumn');
assert.equal(reverseHybrid.paletteKey,'deepWinterAutumn');

assert.equal(globalThis.seasonAnalysis({temp:0,value:-55,chroma:0,def:12,hue:0}).combinedLabel,'Deep Neutral');
assert.equal(globalThis.seasonAnalysis({temp:0,value:0,chroma:-45,def:-30,hue:0}).combinedLabel,'Soft Neutral');
assert.equal(globalThis.seasonAnalysis({temp:0,value:0,chroma:0,def:0,hue:0}).combinedLabel,'Balanced Neutral');

console.log('Tinter v11 intelligence and hybrid tests passed.');
