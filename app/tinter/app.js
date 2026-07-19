'use strict';

import { TinterSurvey } from './survey.js';
import { createTinterUI } from './ui.js';
import { createCameraController } from './camera.js';

const HISTORY_KEY='truePalette.tinter.sessions.v1';
const zeroMap=()=>Object.fromEntries(TinterSurvey.AXES.map(axis=>[axis,0]));

const state=window.Tinter={
  i:0,queue:[],responses:[],answers:[],scores:zeroMap(),evidence:zeroMap(),result:null,
  stream:null,lightingConfidence:'checking',lightingQuality:null,interactionReady:false,busy:false,
  adaptivePlanned:false,resolutionPlanned:false,validationPlanned:false,
  initialLength:0,estimatedTotal:14,progressPct:0,shownAt:0,sessionId:0
};

const currentQuestion=()=>state.queue[state.i]||null;
let camera;

const ui=createTinterUI({
  state,
  currentQuestion,
  phaseLabel:TinterSurvey.phaseLabel,
  onChoose:side=>choose(side),
  onTie:()=>choose(null),
  onClose:options=>close(options),
  onRecheckLighting:()=>camera?.checkLighting(state.sessionId),
  onAutoBalance:()=>camera?.autoBalance(),
  onBalanceChange:()=>camera?.applyBalance()
});

camera=createCameraController({state,ui,isCurrentSession:session=>session===state.sessionId});

function ensureRefinementControls(){
  window.disableRefinement=window.disableRefinement||function(){
    const section=document.querySelector('#refineSection');
    if(section)section.hidden=true;
  };
  window.enableRefinement=window.enableRefinement||function(open=false){
    const section=document.querySelector('#refineSection');
    const details=document.querySelector('#refineDetails');
    if(section)section.hidden=false;
    if(details)details.open=Boolean(open);
  };
}

function readHistory(){
  try{
    const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
    return Array.isArray(parsed)?parsed:[];
  }catch{return []}
}

function saveHistory(rec){
  try{
    const history=readHistory();
    history.unshift({rec:{...rec},timestamp:Date.now(),label:window.seasonAnalysis?.(rec)?.combinedLabel||''});
    localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(0,4)));
  }catch{}
}

function resetSession(){
  camera.stop();
  state.i=0;
  state.queue=TinterSurvey.buildInitialQueue();
  state.initialLength=state.queue.length;
  state.responses=[];
  state.answers=state.responses;
  state.scores=zeroMap();
  state.evidence=zeroMap();
  state.result=null;
  state.lightingConfidence='checking';
  state.lightingQuality=null;
  state.interactionReady=false;
  state.busy=false;
  state.adaptivePlanned=false;
  state.resolutionPlanned=false;
  state.validationPlanned=false;
  state.estimatedTotal=14;
  state.progressPct=0;
  camera.resetBalance();
}

function progressPercent(){
  const target=Math.min(96,(state.i/Math.max(1,state.estimatedTotal))*100);
  state.progressPct=Math.max(state.progressPct,target);
  return state.progressPct;
}

function renderQuestion(){
  const item=currentQuestion();
  if(!item)return;
  state.busy=false;
  state.shownAt=performance.now();
  ui.setDone(false);
  ui.renderQuestion(item,state.i);
  ui.setProgress(progressPercent());
}

function recordChoice(choice){
  const item=currentQuestion();
  if(!item)return;
  const scored=TinterSurvey.scoreResponse(item,choice,state.lightingConfidence);
  for(const axis of TinterSurvey.AXES){
    state.scores[axis]+=scored.delta[axis];
    state.evidence[axis]+=scored.evidence[axis];
  }
  const response={
    id:item.id,stage:item.stage,axis:item.axis,label:item.label,question:item.question,
    choice:choice||'tie',pick:scored.selected?.name||'They look about the same',
    rejected:scored.rejected?.name||null,left:item.left.name,right:item.right.name,
    vote:scored.vote,control:item.control,expectedTie:item.expectedTie,validation:item.validation,
    predictedSign:item.predictedSign||0,reason:item.reason,
    responseMs:Math.max(0,Math.round(performance.now()-state.shownAt))
  };
  state.responses.push(response);
  state.answers=state.responses;
}

function extendQueue(){
  if(!state.adaptivePlanned&&state.i>=state.initialLength){
    const additions=TinterSurvey.planAdaptive({responses:state.responses,scores:state.scores,evidence:state.evidence,queue:state.queue});
    state.queue.push(...additions);
    state.adaptivePlanned=true;
    state.estimatedTotal=Math.max(state.estimatedTotal,state.queue.length+3);
    if(additions.length)ui.setStatus('The next comparisons are closer.');
  }
  if(state.adaptivePlanned&&!state.resolutionPlanned&&state.i>=state.queue.length){
    const additions=TinterSurvey.planResolution({responses:state.responses,scores:state.scores,evidence:state.evidence,queue:state.queue});
    state.queue.push(...additions);
    state.resolutionPlanned=true;
    state.estimatedTotal=Math.max(state.estimatedTotal,state.queue.length+2);
    if(additions.length)ui.setStatus('One mixed signal is being checked again.');
  }
  if(state.resolutionPlanned&&!state.validationPlanned&&state.i>=state.queue.length){
    const additions=TinterSurvey.planValidation({responses:state.responses,scores:state.scores,evidence:state.evidence,queue:state.queue,count:2});
    state.queue.push(...additions);
    state.validationPlanned=true;
    state.estimatedTotal=Math.max(state.queue.length,state.estimatedTotal);
    if(additions.length)ui.setStatus('Final prediction check.');
  }
}

function choose(choice){
  if(state.busy||!state.interactionReady||ui.isHelpOpen())return false;
  state.busy=true;
  if(!choice)ui.animateTie();
  recordChoice(choice);
  window.setTimeout(()=>{
    state.i+=1;
    extendQueue();
    if(state.i>=state.queue.length)finish();
    else renderQuestion();
  },220);
  return true;
}

function buildResult(){
  const rec=TinterSurvey.normalizeScores(state.scores,state.evidence);
  const stats=TinterSurvey.axisStats(state.responses,state.scores,state.evidence);
  const quality=TinterSurvey.reliability(state.responses);
  const validation=TinterSurvey.validationSummary(state.responses);
  const confidence=TinterSurvey.confidenceSummary(stats,quality,validation);
  const direction=[rec.temp>22?'Warm':rec.temp<-22?'Cool':'Neutral',rec.value<-25?'Deep':rec.value>25?'Light':'Medium',rec.def>20?'Defined':rec.def<-20?'Soft':'Balanced'].join(' ');
  const contrast=rec.def<-20?'soft':rec.def>20?'sharp':'balanced';
  const locks=typeof window.lockRanges==='function'?window.lockRanges({contrast},rec.temp,-rec.value/70,rec.hue>15?1:rec.hue<-15?-1:0):{};
  const prior=readHistory()[0];
  const stability=prior?.rec?TinterSurvey.compareSessions(rec,prior.rec):null;
  const report={
    client:'Client',direction,rec,alt:{...rec},locks,source:'tinter',
    tinter:{
      answers:[...state.responses],responses:[...state.responses],scores:{...state.scores},evidenceWeights:{...state.evidence},
      axisConfidence:stats,confidence,evidence:TinterSurvey.evidenceLines(stats,rec),
      comparisons:state.responses.length,
      scoredComparisons:state.responses.filter(item=>!item.control&&!item.validation).length,
      adaptiveQuestions:state.responses.filter(item=>['tiebreaker','challenge','final'].includes(item.stage)).length,
      surveyQuality:quality,calibrationPassed:quality.calibrationScore===1,
      validation,stability,lighting:state.lightingQuality
    }
  };
  saveHistory(rec);
  return report;
}

function finish(){
  state.result=buildResult();
  state.progressPct=100;
  ui.setProgress(100);
  ui.setDone(true);
  ui.setStatus('');
  ui.clearCards();
  const validation=state.result.tinter.validation;
  const validated=Boolean(validation.decisive&&validation.correct===validation.decisive);
  ui.showSummary(validated?'Pattern validated':'Pattern refined');
  window.disableRefinement?.();
  window.setTimeout(()=>window.buildPalette?.({automatic:true,source:'tinter'}),220);
  window.setTimeout(()=>{
    close({scrollToResults:true});
    ui.setLaunchComplete(true);
  },980);
}

async function open(){
  state.sessionId+=1;
  const session=state.sessionId;
  resetSession();
  ui.setLaunchComplete(false);
  window.disableRefinement?.();
  ui.openModal();
  ui.setStatus('Starting camera…');
  renderQuestion();
  await camera.start(session);
}

function close({scrollToResults=false}={}){
  state.sessionId+=1;
  camera.stop();
  ui.closeModal({scrollToResults});
}

function reset(){
  close();
  resetSession();
  ui.setLaunchComplete(false);
}

function init(){
  ensureRefinementControls();
  ui.init();
  document.querySelector('#tinterOpen').onclick=open;
  resetSession();
}

Object.assign(state,{
  open,close,reset,
  clearCompleteButton:()=>ui.setLaunchComplete(false),
  isComplete:()=>Boolean(state.result),
  recheckLighting:()=>camera.checkLighting(state.sessionId)
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
else init();
