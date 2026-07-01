(function(){
  const sections=[
    {title:'Prep',kicker:'Step 1',copy:'Set the conditions so the rest of the read is cleaner.',match:['Quick setup']},
    {title:'Drape tests',kicker:'Step 2',copy:'Compare simple props near the face for warmth signals.',match:['The White Shirt Test','The Metal Test']},
    {title:'Feature depth',kicker:'Step 3',copy:'Set the light-to-dark read of skin, hair, eyes, and contrast.',match:['Feature light/dark levels','Face contrast']},
    {title:'Color clues',kicker:'Step 4',copy:'Use hair shine and eye flecks as supporting evidence.',match:['Color clues']}
  ];
  function fieldTitle(field){return field.querySelector('.field-title')?.childNodes?.[0]?.textContent?.trim()||''}
  function wrapFields(){
    const root=document.querySelector('#questions');
    if(!root)return;
    const fields=[...root.children].filter(x=>x.classList?.contains('field'));
    if(!fields.length)return;
    const frag=document.createDocumentFragment();
    sections.forEach(sec=>{
      const group=document.createElement('section');
      group.className='app-section quiz-section';
      group.innerHTML=`<header class="app-section-head"><p class="app-section-kicker">${sec.kicker}</p><h3 class="app-section-title">${sec.title}</h3><p class="app-section-copy">${sec.copy}</p></header>`;
      fields.filter(f=>sec.match.includes(fieldTitle(f))).forEach(f=>group.appendChild(f));
      if(group.querySelector('.field'))frag.appendChild(group);
    });
    const leftovers=fields.filter(f=>!sections.some(sec=>sec.match.includes(fieldTitle(f))));
    leftovers.forEach(f=>frag.appendChild(f));
    root.innerHTML='';
    root.appendChild(frag);
  }
  const prior=window.renderMixedQuiz;
  if(prior&&!prior.__sectionGrouped){
    window.renderMixedQuiz=function(){prior();wrapFields()};
    window.renderMixedQuiz.__sectionGrouped=true;
    renderMixedQuiz();
  }else wrapFields();
})();
