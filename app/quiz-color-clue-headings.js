window.applyColorClueHeadings=function(){
  const fields=[...document.querySelectorAll('.field')];
  const field=fields.find(f=>f.querySelector('.field-title')?.textContent.includes('Color clues'));
  if(!field||field.querySelector('.color-clue-heading'))return;
  const choices=[...field.querySelectorAll('.choices')];
  if(choices[0])choices[0].insertAdjacentHTML('beforebegin','<p class="mini-question color-clue-heading">HAIR SHINE<span class="mini-help">Choose the reflection you see in the hair, roots, or brows.</span></p>');
  if(choices[1])choices[1].insertAdjacentHTML('beforebegin','<p class="mini-question color-clue-heading">EYE FLECKS<span class="mini-help">Choose the strongest flecks, ring, or overall color in the eyes.</span></p>');
};
const oldRenderMixedQuizForHeadings=window.renderMixedQuiz;
if(oldRenderMixedQuizForHeadings){
  window.renderMixedQuiz=function(){oldRenderMixedQuizForHeadings();applyColorClueHeadings()};
  renderMixedQuiz();
}
