export function togglePathHole(path,holeId){
  return path.includes(holeId)?path.filter(id=>id!==holeId):[...path,holeId];
}

export function holesCrossedBySegment(from,to,holes,radius){
  const dx=to.x-from.x,dy=to.y-from.y,lengthSquared=dx*dx+dy*dy;
  return holes.map(hole=>{
    const projection=lengthSquared===0?0:((hole.x-from.x)*dx+(hole.y-from.y)*dy)/lengthSquared;
    const t=Math.max(0,Math.min(1,projection));
    const x=from.x+t*dx,y=from.y+t*dy;
    return{id:hole.id,t,distance:Math.hypot(hole.x-x,hole.y-y),projection};
  }).filter(hit=>hit.projection>=0&&hit.projection<=1&&hit.distance<=radius).sort((a,b)=>a.t-b.t).map(hit=>hit.id);
}
