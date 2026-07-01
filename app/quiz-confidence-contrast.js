window.applyConfidenceAndContrastVisuals=function(){
  document.querySelectorAll('.confidence .range-card').forEach(card=>{
    card.querySelectorAll('.quiz-swatch-row').forEach(x=>x.remove());
    if(!card.querySelector('.confidence-emoji-row')){
      card.querySelector('input[type=range]').insertAdjacentHTML('beforebegin','<div class="confidence-emoji-row"><span>😩</span><span>😬</span><span>🤔</span><span>☺️</span><span>😎</span></div>');
    }
  });
  let contrast=document.querySelector('input[name="contrastDepth"]')?.closest('.range-card');
  if(contrast){
    contrast.querySelectorAll('.quiz-swatch-row').forEach(x=>x.remove());
    if(!contrast.querySelector('.contrast-pair-row')){
      contrast.querySelector('input[type=range]').insertAdjacentHTML('beforebegin',`<div class="contrast-pair-row">
        <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#1b1410"></i><i style="background:#2f2119"></i></span><small>deep + deep</small></span>
        <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#e9d5bd"></i><i style="background:#d8c4aa"></i></span><small>light + light</small></span>
        <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#3a2418"></i><i style="background:#9b6f52"></i></span><small>balanced</small></span>
        <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#5a3925"></i><i style="background:#f2d7c4"></i></span><small>medium high</small></span>
        <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#050505"></i><i style="background:#f7efe7"></i></span><small>high</small></span>
      </div>`);
    }
  }
};
const oldRenderMixedQuizForVisuals=window.renderMixedQuiz;
if(oldRenderMixedQuizForVisuals){
  window.renderMixedQuiz=function(){oldRenderMixedQuizForVisuals();applyConfidenceAndContrastVisuals()};
  renderMixedQuiz();
}
