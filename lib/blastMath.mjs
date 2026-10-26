export function firingWindows(events,tolerance=7){
  const seen=new Set();
  return events
    .map(anchor=>events.map((event,index)=>({event,index})).filter(({event})=>Math.abs(event.time-anchor.time)<=tolerance))
    .filter(group=>{const key=group.map(({index})=>index).join(",");if(seen.has(key))return false;seen.add(key);return true})
    .map(group=>group.map(({event})=>event));
}

export function totalExplosive(holes){
  return holes.reduce((sum,hole)=>sum+hole.charge+(hole.deckCharging?hole.deckCharge:0),0);
}

export function blastMetrics({holes,burden,spacing,benchHeight,rockDensity,totalExplosive,distance,maxCharge,siteConstant,siteExponent}){
  const volume=holes*burden*spacing*benchHeight;
  const rockMass=volume*rockDensity;
  const chargeFactor=rockMass>0?totalExplosive/rockMass:0;
  const explosiveYield=totalExplosive>0?rockMass/totalExplosive:0;
  const scaledDistance=maxCharge>0?distance/Math.sqrt(maxCharge):Infinity;
  const ppv=Number.isFinite(scaledDistance)&&scaledDistance>0?siteConstant*Math.pow(scaledDistance,-siteExponent):0;
  return{volume,rockMass,chargeFactor,explosiveYield,scaledDistance,ppv};
}
