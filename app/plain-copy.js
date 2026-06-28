window.lockRanges=function(a,w,d,hc){
  let c=a.contrast;
  return {
    temp:w>22?[20,90,'Stay warm because the white/cream or metal test pointed warm.']:w<-22?[-90,-20,'Stay cool because the white/cream or metal test pointed cool.']:[-35,35,'Stay near the middle because warm and cool both worked.'],
    value:d>.33?[-90,10,'Very light colors are locked near the face. Deeper colors usually help you more.']:d<-.33?[-70,90,'The darkest colors are locked near the face. Use black more safely in shoes, belts, bags, or pants.']:[-60,60,'Very pale and very dark colors are locked. Your best colors sit closer to the middle.'],
    chroma:c==='soft'?[-90,15,'Very bright color is locked. Softer, quieter color usually looks better.']:c==='sharp'?[-5,90,'Very dull color is locked. Stronger color helps your features stand out.']:[-45,60,'Very dull and very neon colors are locked. Stay in the middle.'],
    def:c==='soft'?[-85,15,'Very strong light/dark contrast is locked because it can overpower you.']:c==='sharp'?[-5,90,'Very low contrast is locked because it can make you look flat.']:[-40,65,'Very soft and very sharp contrast are locked. Keep contrast clean but not harsh.'],
    hue:hc>0?[15,90,'Stay with warmer accent colors because hair or eye clues point warm.']:hc<0?[-90,-15,'Stay with cooler accent colors because hair or eye clues point cool.']:[-45,45,'Stay near the middle because the color clues are mixed.']
  };
};
