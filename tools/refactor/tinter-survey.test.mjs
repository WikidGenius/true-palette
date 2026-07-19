import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../app/tinter/survey.js',import.meta.url),'utf8');
const moduleUrl=`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const { TinterSurvey: Survey }=await import(moduleUrl);

const zeros=()=>Object.fromEntries(Survey.AXES.map(axis=>[axis,0]));
const fixedRandom=()=>0.2;

assert.ok(Survey,'survey engine should be published');
assert.deepEqual([...Survey.AXES],['temp','value','chroma','def','hue']);

const initial=Survey.buildInitialQueue(fixedRandom);
assert.equal(initial[0].stage,'practice');
assert.ok(initial.some(item=>item.stage==='calibration'));
assert.equal(initial.filter(item=>item.stage==='foundation').length,7);

const practiceScore=Survey.scoreResponse(initial[0],'left','good');
assert.deepEqual({...practiceScore.delta},zeros());
assert.deepEqual({...practiceScore.evidence},zeros());

const tempQuestion=initial.find(item=>item.axis==='temp'&&!item.control);
const left=Survey.scoreResponse(tempQuestion,'left','good');
const right=Survey.scoreResponse(tempQuestion,'right','good');
for(const axis of Survey.AXES)assert.ok(Math.abs(left.delta[axis]+right.delta[axis])<1e-9,`score symmetry for ${axis}`);

const scores={temp:32,value:-6,chroma:4,def:2,hue:1};
const evidence={temp:40,value:18,chroma:15,def:12,hue:10};
const adaptive=Survey.planAdaptive({responses:[],scores,evidence,queue:initial},fixedRandom);
assert.equal(adaptive.length,3);
assert.ok(adaptive.some(item=>item.stage==='challenge'));
assert.equal(new Set(adaptive.map(item=>item.id)).size,adaptive.length);

const contradiction=[{stage:'challenge',axis:'temp',predictedSign:1,vote:-1,control:false,validation:false}];
const resolution=Survey.planResolution({responses:contradiction,scores,evidence,queue:[...initial,...adaptive]},fixedRandom);
assert.ok(resolution.length>=1);
assert.equal(resolution[0].stage,'final');

const validation=Survey.planValidation({scores,evidence,queue:[...initial,...adaptive,...resolution],count:2},fixedRandom);
assert.equal(validation.length,2);
assert.ok(validation.every(item=>item.validation));
const validationScore=Survey.scoreResponse(validation[0],'left','good');
assert.deepEqual({...validationScore.delta},zeros());

const reliabilityGood=Survey.reliability([
  {control:true,expectedTie:true,choice:'tie'},
  {control:true,expectedTie:true,choice:'tie'},
  {control:false,validation:false,choice:'left',responseMs:1400,predictedSign:1,vote:1},
  {control:false,validation:false,choice:'right',responseMs:1500,predictedSign:-1,vote:-1}
]);
assert.equal(reliabilityGood.calibrationScore,1);
assert.equal(reliabilityGood.rushedRate,0);

const stats=Survey.axisStats([],scores,evidence);
const capped=Survey.confidenceSummary(stats,{calibrationScore:.5,rushedRate:0,sideBias:0,contradictionRate:0},{accuracy:1});
assert.ok(capped.score<=.74);

const stable=Survey.compareSessions({temp:10,value:-20,chroma:5,def:-5,hue:8},{temp:12,value:-19,chroma:4,def:-4,hue:7});
assert.ok(stable.percent>90);

console.log('✓ Tinter survey tests passed');
