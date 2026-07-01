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
    let old=contrast.querySelector('.contrast-pair-row');
    if(old)old.remove();
    contrast.querySelector('input[type=range]').insertAdjacentHTML('beforebegin',`<div class="contrast-pair-row">
      <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#1b1410"></i><i style="background:#3b271f"></i></span><small>low deep</small></span>
      <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#d7b477"></i><i style="background:#efd5bf"></i></span><small>low light</small></span>
      <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#6f452e"></i><i style="background:#9f6f52"></i></span><small>balanced</small></span>
      <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#2b1d18"></i><i style="background:#d8ad8f"></i></span><small>medium high</small></span>
      <span class="contrast-pair"><span class="contrast-pair-chip"><i style="background:#080808"></i><i style="background:#f2dccd"></i></span><small>high</small></span>
    </div>`);
  }
};
const oldRenderMixedQuizForVisuals=window.renderMixedQuiz;
if(oldRenderMixedQuizForVisuals){
  window.renderMixedQuiz=function(){oldRenderMixedQuizForVisuals();applyConfidenceAndContrastVisuals()};
  renderMixedQuiz();
}
