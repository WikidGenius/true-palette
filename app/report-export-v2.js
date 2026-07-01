(function(){
  function loadHtml2Canvas(){return new Promise((resolve,reject)=>{if(window.html2canvas)return resolve();let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  async function exportPng(){
    const card=document.querySelector('#styleReportCard')||document.querySelector('#result');
    if(!card||card.classList.contains('empty')){alert('Build a palette first.');return}
    const btn=document.querySelector('#pngExport'),old=btn?btn.textContent:'';if(btn)btn.textContent='Creating PNG...';
    try{await loadHtml2Canvas();let canvas=await html2canvas(card,{backgroundColor:'#fffdf8',scale:2,useCORS:true});let a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='true-palette-style-report.png';a.click()}catch(e){alert('PNG export failed. Try Print / PDF instead.')}finally{if(btn)btn.textContent=old||'PNG'}
  }
  function installExportButtons(){
    const copy=document.querySelector('#copy'),json=document.querySelector('#json'),actions=document.querySelector('.report .actions');
    if(copy)copy.classList.add('export-hidden');
    if(json)json.classList.add('export-hidden');
    if(!actions||document.querySelector('#pngExport'))return;
    const print=[...actions.querySelectorAll('button')].find(b=>/print/i.test(b.textContent));
    if(print){print.textContent='Print / PDF';print.classList.remove('secondary')}
    const png=document.createElement('button');png.type='button';png.id='pngExport';png.className='secondary';png.textContent='PNG';png.onclick=exportPng;
    actions.appendChild(png);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installExportButtons);else installExportButtons();
})();
