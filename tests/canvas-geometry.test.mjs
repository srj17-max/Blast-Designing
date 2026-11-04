import test from "node:test";
import assert from "node:assert/strict";
import{assignRowsByY,expandCanvasToPoint,layoutRowsByY}from"../lib/canvasGeometry.mjs";

test("canvas expands on both axes to keep a dragged hole inside its margin",()=>{
  assert.deepEqual(expandCanvasToPoint({width:760,height:450},{x:810,y:510}),{width:864,height:576});
});

test("canvas remains stable while the dragged hole stays inside",()=>{
  const size={width:760,height:450};
  assert.equal(expandCanvasToPoint(size,{x:400,y:220}),size);
});

test("row labels and counts follow the vertical hole grid",()=>{
  const holes=[{id:1,x:40,y:48,row:9},{id:2,x:90,y:50,row:9},{id:3,x:40,y:136,row:9}];
  assert.deepEqual(layoutRowsByY(holes).map(({number,count})=>[number,count]),[[1,2],[2,1]]);
  assert.deepEqual(assignRowsByY(holes).map(hole=>hole.row),[1,1,2]);
});
