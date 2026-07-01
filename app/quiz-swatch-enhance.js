window.hexMix=function(a,b,t){let ah=a.replace('#',''),bh=b.replace('#',''),ar=parseInt(ah.slice(0,2),16),ag=parseInt(ah.slice(2,4),16),ab=parseInt(ah.slice(4,6),16),br=parseInt(bh.slice(0,2),16),bg=parseInt(bh.slice(2,4),16),bb=parseInt(bh.slice(4,6),16),h=n=>Math.round(n).toString(16).padStart(2,'0');return '#'+h(ar+(br-ar)*t)+h(ag+(bg-ag)*t)+h(ab+(bb-ab)*t)};
window.expandQuizSwatches=function(){
  document.querySelectorAll('.quiz-swatch-row').forEach(row=>{
    let sw=[...row.querySelectorAll('.quiz-swatch')];
    if(sw.length>=5||sw.length<2)return;
    let colors=sw.map(x=>x.style.backgroundColor||x.style.background).map(c=>{
      if(c[0]==='#')return c;
      let m=c.match(/\d+/g);return m?'#'+m.slice(0,3).map(n=>(+n).toString(16).padStart(2,'0')).join(''):'#999999';
    });
    let first=colors[0],last=colors[colors.length-1],mid=colors[Math.floor(colors.length/2)];
    let five=[first,hexMix(first,mid,.5),mid,hexMix(mid,last,.5),last];
    row.innerHTML=five.map(c=>`<i class="quiz-swatch" style="background:${c}"></i>`).join('');
  });
};
const oldRenderMixedQuiz=window.renderMixedQuiz;
if(oldRenderMixedQuiz){window.renderMixedQuiz=function(){oldRenderMixedQuiz();expandQuizSwatches()};renderMixedQuiz()}
