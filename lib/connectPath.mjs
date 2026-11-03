export function togglePathHole(path,holeId){
  return path.includes(holeId)?path.filter(id=>id!==holeId):[...path,holeId];
}
