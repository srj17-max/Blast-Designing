export function expandCanvasToPoint(size,point,margin=48,grid=24){
  const width=Math.max(size.width,Math.ceil((point.x+margin)/grid)*grid);
  const height=Math.max(size.height,Math.ceil((point.y+margin)/grid)*grid);
  return width===size.width&&height===size.height?size:{width,height};
}

export function layoutRowsByY(holes,tolerance=34){
  const rows=[];
  for(const hole of [...holes].sort((a,b)=>a.y-b.y||a.x-b.x)){
    let row=rows.find(candidate=>Math.abs(candidate.y-hole.y)<=tolerance);
    if(!row){row={y:hole.y,ids:[]};rows.push(row)}
    row.ids.push(hole.id);
    row.y=row.ids.reduce((sum,id)=>sum+(holes.find(item=>item.id===id)?.y??0),0)/row.ids.length;
  }
  return rows.sort((a,b)=>a.y-b.y).map((row,index)=>({number:index+1,y:row.y,count:row.ids.length,ids:row.ids}));
}

export function assignRowsByY(holes,tolerance=34){
  const rowById=new Map(layoutRowsByY(holes,tolerance).flatMap(row=>row.ids.map(id=>[id,row.number])));
  return holes.map(hole=>({...hole,row:rowById.get(hole.id)??hole.row}));
}
