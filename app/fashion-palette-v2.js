window.darkNeutralNames=function(warm,cool){
  if(warm)return [['Espresso','#22130d'],['Dark Olive','#27301f']];
  if(cool)return [['Black Navy','#090d16'],['Charcoal','#25282c']];
  return [['Charcoal','#292929'],['Espresso','#211611']];
};
window.paletteFromValues=function(v){
  let bv=bucket(v.value),bc=bucket(v.chroma),bd=bucket(v.def),bh=bucket(v.hue),warm=v.temp>20,cool=v.temp<-20;
  let neutralHue=warm?35:cool?220:38;
  let mainHue=warm?(bh>6?22:bh>4?42:170):cool?(bh<3?212:bh<6?330:155):(bh<4?210:bh>5?25:350);
  let compHue=(mainHue+180)%360,accentHue=(mainHue+34)%360;
  let neutralSat=10+bc*2,accentSat=24+bc*7,compSat=Math.max(22,accentSat-12),baseLight=20+bv*6,lightNeutral=Math.min(92,baseLight+18);
  let lights=warm?['Ivory Silk','Oat Milk','Vanilla Cream','Cafe au Lait','Almond Milk','Champagne','Warm Latte','Biscotti','Honey Silk','Sunlit Cream']:cool?['Porcelain','Pearl','Moonstone','Dove Wing','Silver Mist','Cloud Gray','Frosted Silk','Ice Milk','Winter White','Blue Pearl']:['Ecru','Oyster','Parchment','Driftwood','Pebble','Mushroom','Sandstone','Greige','Soft Taupe','Stone Silk'];
  let neutrals=warm?['Cocoa','Saddle','Chestnut','Toffee','Caramel','Camel','Maple','Amber Tan','Burnished Honey','Golden Beige']:cool?['Graphite','Slate','Charcoal','Steel Blue','Storm Blue','Blue Gray','Pewter','Ash','Smoky Navy','Cool Navy']:['Taupe','Mink','Mushroom','Stone Brown','Hazelnut','Fawn','Greige','Mocha','Latte','Truffle'];
  let darks=darkNeutralNames(warm,cool);
  return [
    [namePick(lights,bv),safeHex(neutralHue,neutralSat,lightNeutral)],
    [namePick(neutrals,bv),safeHex(neutralHue,neutralSat+4,baseLight+5)],
    darks[0],
    darks[1],
    [hueName(mainHue,bc),safeHex(mainHue,accentSat,Math.min(76,38+bv*4))],
    [hueName(compHue,Math.max(2,Math.min(7,bc))),safeHex(compHue,compSat,Math.min(70,34+bv*4))],
    [hueName(accentHue,bh),safeHex(accentHue,Math.min(88,accentSat+4),Math.min(74,40+bv*3))],
    [warm?'Antique Gold':cool?'Brushed Silver':'Mixed Metal',warm?'#d0a036':cool?'#c9d0d4':'#9aa0a4']
  ];
};
