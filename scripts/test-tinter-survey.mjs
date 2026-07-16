import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('../app/tinter-survey-v10.js',import.meta.url),'utf8');
globalThis.window=globalThis;
vm.runInThisContext(source,{filename:'tinter-survey-v10.js'});

const survey=globalThis.TinterSurvey;
assert.ok(survey,'TinterSurvey should be available');

const deterministic=()=>0.25;
const queue=survey.buildInitialQueue(deterministic);
assert.equal(queue.length,9,'initial survey should contain nine rounds');
assert.equal(queue.filter(item=>item.control).length,2,'initial survey should contain two calibration rounds');
assert.equal(queue[0].stage,'practice','practice round should come first');

const practice=queue[0];
const practiceTie=survey.scoreResponse(practice,null,'good');
const practiceForced=survey.scoreResponse(practice,'left','good');
assert.deepEqual(Object.values(practiceTie.delta),[0,0,0,0,0],'practice round must not affect color scores');
assert.equal(practiceTie.vote,0,'using the tie control should pass calibration');
assert.notEqual(practiceForced.vote,0,'forcing a swatch choice must be detectable by calibration');
assert.deepEqual(Object.values(practiceForced.delta),[0,0,0,0,0],'failed calibration still must not affect color scores');

const firstDiagnostic=queue.find(item=>item.axis&&!item.control);
const left=survey.scoreResponse(firstDiagnostic,'left','good');
const right=survey.scoreResponse(firstDiagnostic,'right','good');
for(const axis of survey.AXES){
  assert.ok(Math.abs(left.delta[axis]+right.delta[axis])<1e-9,`left/right scoring must be symmetric for ${axis}`);
}

const responses=[
  {axis:'temp',vote:1,control:false},{axis:'temp',vote:1,control:false},
  {axis:'value',vote:0,control:false},{axis:'chroma',vote:1,control:false},
  {axis:'def',vote:0,control:false},{axis:'hue',vote:-1,control:false}
];
const scores={temp:28,value:0,chroma:12,def:0,hue:-10};
const evidence={temp:30,value:12,chroma:16,def:12,hue:14};
const adaptive=survey.planAdaptive({responses,scores,evidence,queue,random:deterministic});
assert.equal(adaptive.length,3,'adaptive survey should schedule three focused checks');
assert.ok(adaptive.some(item=>item.reason==='pattern-confirmation'&&item.axis==='temp'),'strongest pattern should receive a harder confirmation');
assert.ok(adaptive.some(item=>item.reason==='uncertainty'),'uncertain dimensions should receive tie-breakers');

const challenge=adaptive.find(item=>item.reason==='pattern-confirmation');
const contradiction={
  id:challenge.id,axis:challenge.axis,control:false,vote:-challenge.predictedSign,
  predictedSign:challenge.predictedSign,stage:'challenge'
};
const resolution=survey.planResolution({responses:[...responses,contradiction],scores,evidence,queue:[...queue,...adaptive],random:deterministic});
assert.ok(resolution.length>=1,'contradicted pattern should trigger a resolution question');
assert.equal(resolution[0].reason,'contradiction-resolution');

const normalized=survey.normalizeScores({temp:40,value:-25,chroma:0,def:100,hue:-100},{temp:40,value:50,chroma:10,def:20,hue:20});
assert.ok(normalized.temp>0&&normalized.value<0,'normalized scores should preserve direction');
assert.ok(Object.values(normalized).every(value=>value>=-92&&value<=92),'normalized scores should be clamped');

const reliableResponses=[
  {control:true,expectedTie:true,vote:0,responseMs:1200},
  {control:true,expectedTie:true,vote:0,responseMs:1100},
  {control:false,choice:'left',vote:1,responseMs:900,predictedSign:1},
  {control:false,choice:'right',vote:1,responseMs:1000,predictedSign:1},
  {control:false,choice:'left',vote:-1,responseMs:850,predictedSign:0},
  {control:false,choice:'right',vote:1,responseMs:940,predictedSign:0}
];
const quality=survey.reliability(reliableResponses);
assert.equal(quality.calibrationScore,1,'correct calibration answers should pass');
assert.ok(quality.score>.7,'careful balanced responses should receive strong survey quality');

const weakQuality=survey.reliability([
  {control:true,expectedTie:true,vote:1,responseMs:180},
  {control:true,expectedTie:true,vote:-1,responseMs:190},
  {control:false,choice:'left',vote:1,responseMs:160,predictedSign:1},
  {control:false,choice:'left',vote:-1,responseMs:170,predictedSign:1},
  {control:false,choice:'left',vote:1,responseMs:180,predictedSign:0},
  {control:false,choice:'left',vote:1,responseMs:190,predictedSign:0}
]);
assert.ok(weakQuality.score<quality.score,'failed calibration and rushed side-biased answers should reduce quality');

console.log('Tinter adaptive survey tests passed.');
