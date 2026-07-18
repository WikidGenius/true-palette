(function(){
  'use strict';

  const COPY={
    'light-neutral':{
      question:'Which neutral makes your skin look more even?',
      hint:'Look for less redness, yellowing, or grayness and softer shadows under the eyes.'
    },
    'main-neutral':{
      question:'Which neutral distracts less from your face?',
      hint:'Choose the one that lets your skin, eyes, and brows stay more noticeable than the swatch.'
    },
    'depth-anchor':{
      question:'Which depth keeps your face from looking washed out or weighed down?',
      hint:'Choose the option that keeps the eyes and brows easy to see without making the face look pale, shadowed, or heavy.'
    },
    'rose-strength':{
      question:'Which rose leaves your skin looking more even?',
      hint:'Compare redness, grayness, under-eye shadows, and whether the color overwhelms your face.'
    },
    'contrast-anchor':{
      question:'Which option makes your eyes, brows, lips, and jawline look clearer?',
      hint:'Choose stronger contrast only if it sharpens those features without making under-eye or jaw shadows look harsher.'
    },
    'accent-direction':{
      question:'Which accent makes your eyes and lips stand out more?',
      hint:'Choose the one that emphasizes your features without adding redness, yellowing, or grayness to the skin.'
    },
    'green-balance':{
      question:'Which green makes your skin look more even?',
      hint:'Look for less redness, grayness, or yellowing rather than choosing the green you like best.'
    },
    'temp-tie-1':{
      question:'Which neutral makes your skin look less red, yellow, or gray?',
      hint:'Compare the complexion and under-eye area rather than the swatches themselves.'
    },
    'temp-tie-2':{
      question:'Which color creates fewer red, yellow, or gray casts in your skin?',
      hint:'Choose the one that changes your natural skin tone the least.'
    },
    'value-tie-1':{
      question:'Which depth keeps your face from looking pale or heavily shadowed?',
      hint:'The better depth keeps the skin even and the eyes and brows visible.'
    },
    'value-tie-2':{
      question:'Which depth keeps your eyes and brows easiest to see?',
      hint:'Choose the option that gives the features presence without making shadows look heavier.'
    },
    'chroma-tie-1':{
      question:'Which color keeps your skin even without looking faded or overpowering?',
      hint:'Reject the option that makes the face look dull, red, gray, or dominated by the color.'
    },
    'chroma-tie-2':{
      question:'Which teal leaves less redness or grayness in your skin?',
      hint:'Look at the cheeks, under-eye area, and jaw rather than which teal you prefer.'
    },
    'def-tie-1':{
      question:'Which option makes your features clearer without making facial shadows harsher?',
      hint:'Compare the eyes, brows, lips, and jawline. Better contrast adds clarity without emphasizing texture or darkness.'
    },
    'def-tie-2':{
      question:'Which option makes the skin look more even and the eyes and brows easier to see?',
      hint:'Look for softer facial shadows and clearer features at the same time.'
    },
    'hue-tie-1':{
      question:'Which accent makes your eyes and lips stand out more?',
      hint:'Choose the one that connects to your features without changing the apparent color of your skin.'
    },
    'hue-tie-2':{
      question:'Which metal makes your skin look less red, yellow, or gray?',
      hint:'Judge the complexion and whites of the eyes, not which metal you normally wear.'
    },
    'temp-warm-challenge-1':{
      question:'Which close neutral makes the skin look more even?',
      hint:'Watch for less redness, yellowing, or grayness in the complexion.'
    },
    'temp-warm-challenge-2':{
      question:'Which muted color leaves less redness or grayness in your face?',
      hint:'Compare the cheeks, under-eye area, and jaw.'
    },
    'temp-cool-challenge-1':{
      question:'Which close neutral makes the skin look less red, yellow, or gray?',
      hint:'The better option changes your natural complexion less.'
    },
    'temp-cool-challenge-2':{
      question:'Which muted color creates less redness, yellowing, or grayness?',
      hint:'Ignore which swatch is prettier and compare only what changes in the face.'
    },
    'value-light-challenge-1':{
      question:'Which depth keeps your face from looking washed out?',
      hint:'Choose the one that keeps the skin alive and the eyes and brows visible.'
    },
    'value-light-challenge-2':{
      question:'Which depth keeps the eyes visible without making the face look heavy?',
      hint:'Compare the under-eye and jaw shadows.'
    },
    'value-deep-challenge-1':{
      question:'Which depth keeps your eyes and brows more visible?',
      hint:'The better option gives the features presence without making the skin look heavy.'
    },
    'value-deep-challenge-2':{
      question:'Which darker color keeps the skin more even and the features easier to see?',
      hint:'Look for fewer heavy shadows under the eyes and around the jaw.'
    },
    'chroma-clear-challenge-1':{
      question:'Which color makes your face look more alive without overpowering it?',
      hint:'Choose clearer color only when the skin stays even and the features remain more noticeable than the swatch.'
    },
    'chroma-clear-challenge-2':{
      question:'Which rose makes your skin and lips look healthier?',
      hint:'Look for less dullness or grayness without added redness.'
    },
    'chroma-soft-challenge-1':{
      question:'Which color leaves your skin looking smoother and more even?',
      hint:'Choose the softened option only if it reduces redness or harshness without making the face look dull.'
    },
    'chroma-soft-challenge-2':{
      question:'Which rose creates less redness, grayness, or facial shadow?',
      hint:'Compare the cheeks and under-eye area.'
    },
    'def-sharp-challenge-1':{
      question:'Which contrast level makes the eyes, brows, and jawline easier to see?',
      hint:'Choose stronger contrast only when it clarifies the features without deepening facial shadows.'
    },
    'def-sharp-challenge-2':{
      question:'Which option makes your eyes, brows, lips, and jawline look clearer?',
      hint:'Reject stronger contrast if it makes under-eye darkness or skin texture more noticeable.'
    },
    'def-soft-challenge-1':{
      question:'Which contrast level softens shadows without washing out your features?',
      hint:'The better option should smooth the face while keeping the eyes and brows visible.'
    },
    'def-soft-challenge-2':{
      question:'Which option reduces facial shadows without making your features disappear?',
      hint:'Compare the under-eye area, brows, lips, and jawline.'
    },
    'hue-warm-challenge-1':{
      question:'Which accent makes your eyes and lips stand out more?',
      hint:'Choose the one that does not add redness, yellowing, or grayness to the skin.'
    },
    'hue-warm-challenge-2':{
      question:'Which metal makes the skin look more even and the eyes brighter?',
      hint:'Compare changes in redness, grayness, and the whites of the eyes.'
    },
    'hue-cool-challenge-1':{
      question:'Which accent makes your eyes stand out more?',
      hint:'Choose the one that leaves the complexion closest to its natural color.'
    },
    'hue-cool-challenge-2':{
      question:'Which metal creates less redness, yellowing, or grayness in the skin?',
      hint:'Judge the complexion and eyes, not which metal you normally prefer.'
    },
    'temp-holdout':{
      question:'Which neutral makes your skin look less red, yellow, or gray?',
      hint:'This is a new color pair used to check whether the earlier pattern still holds.'
    },
    'value-holdout':{
      question:'Which depth keeps your eyes and brows easier to see?',
      hint:'Choose the one that does not make the face look pale or heavily shadowed.'
    },
    'chroma-holdout':{
      question:'Which berry keeps your skin looking more even?',
      hint:'Reject the option that makes the face look dull, red, gray, or overpowered.'
    },
    'def-holdout':{
      question:'Which option makes your features clearer without making shadows harsher?',
      hint:'Compare the eyes, brows, lips, jawline, and under-eye area.'
    },
    'hue-holdout':{
      question:'Which accent makes your eyes and lips stand out more?',
      hint:'Choose the one that changes your apparent skin tone less.'
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
    ['buildInitialQueue','planAdaptive','planResolution','planValidation'].forEach(wrap);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
  else install();
})();
