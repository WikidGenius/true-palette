(function(){
  'use strict';

  const COPY={
    'depth-anchor':{
      question:'Which depth keeps your face from looking washed out or weighed down?',
      hint:'Choose the option that keeps the eyes and brows easy to see without making the face look pale, shadowed, or heavy.'
    },
    'green-balance':{
      question:'Which green makes your skin look more even?',
      hint:'Look for less redness, grayness, or yellowing rather than choosing the green you like best.'
    },
    'main-neutral':{
      question:'Which neutral distracts less from your face?',
      hint:'Choose the one that lets your skin, eyes, and brows stay more noticeable than the swatch.'
    },
    'contrast-anchor':{
      question:'Which option makes your eyes, brows, lips, and jawline look clearer?',
      hint:'Choose stronger contrast only if it sharpens those features without making under-eye or jaw shadows look harsher.'
    },
    'value-tie-1':{
      question:'Which option keeps your face from looking washed out or weighed down?',
      hint:'The better depth keeps the skin even and the eyes and brows visible.'
    },
    'value-tie-2':{
      question:'Which depth keeps your eyes and brows easiest to see?',
      hint:'Choose the option that gives the features presence without making shadows look heavier.'
    },
    'def-tie-1':{
      question:'Which option makes your features clearer without making facial shadows harsher?',
      hint:'Compare the eyes, brows, lips, and jawline. Better contrast adds clarity without emphasizing texture or darkness.'
    },
    'def-tie-2':{
      question:'Which option makes the skin look more even and the eyes and brows more defined?',
      hint:'Look for softer facial shadows and clearer features at the same time.'
    },
    'temp-warm-challenge-1':{
      question:'Which close neutral makes the skin look more even?',
      hint:'Watch for less redness, yellowing, or grayness in the complexion.'
    },
    'temp-cool-challenge-2':{
      question:'Which muted color creates less redness, yellowing, or grayness?',
      hint:'Ignore which swatch is prettier and compare only what changes in the face.'
    },
    'value-deep-challenge-1':{
      question:'Which grounded neutral keeps your eyes and brows more visible?',
      hint:'The better option gives the features presence without making the skin look heavy.'
    },
    'value-deep-challenge-2':{
      question:'Which darker color keeps the skin more even and the features easier to see?',
      hint:'Look for fewer heavy shadows under the eyes and around the jaw.'
    },
    'def-sharp-challenge-1':{
      question:'Which contrast level makes the eyes, brows, and jawline easier to see?',
      hint:'Choose stronger contrast only when it clarifies the features without deepening facial shadows.'
    },
    'def-soft-challenge-1':{
      question:'Which contrast level softens shadows without washing out your features?',
      hint:'The better option should smooth the face while keeping the eyes and brows visible.'
    },
    'hue-warm-challenge-2':{
      question:'Which finish makes the skin look more even and the eyes brighter?',
      hint:'Compare changes in redness, grayness, and the whites of the eyes.'
    },
    'hue-cool-challenge-2':{
      question:'Which finish creates less redness, yellowing, or grayness in the skin?',
      hint:'Judge the complexion and eyes, not which metal you normally prefer.'
    }
  };

  function applyCopy(item){
    const patch=COPY[item?.id];
    return patch?Object.assign(item,patch):item;
  }

  function wrap(name){
    const base=window.TinterSurvey?.[name];
    if(typeof base!=='function'||base.__languageWrapped)return;
    const wrapped=function(){
      const result=base.apply(this,arguments);
      return Array.isArray(result)?result.map(applyCopy):applyCopy(result);
    };
    wrapped.__languageWrapped=true;
    window.TinterSurvey[name]=wrapped;
  }

  function install(){
    if(!window.TinterSurvey)return;
    ['buildInitialQueue','planAdaptive','planResolution'].forEach(wrap);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
