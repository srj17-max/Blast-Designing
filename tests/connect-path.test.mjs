import test from "node:test";
import assert from "node:assert/strict";
import{holesCrossedBySegment,togglePathHole}from"../lib/connectPath.mjs";

test("hovering a new hole adds it to the drag connection path",()=>{
  assert.deepEqual(togglePathHole([1,2],3),[1,2,3]);
});

test("hovering an already selected hole removes it from the drag connection path",()=>{
  assert.deepEqual(togglePathHole([1,2,3],2),[1,3]);
});

test("fast pointer movement captures every hole crossed in order",()=>{
  const holes=[1,2,3,4].map((id,index)=>({id,x:index*50,y:20}));
  assert.deepEqual(holesCrossedBySegment({x:0,y:20},{x:160,y:20},holes,18),[1,2,3,4]);
});

test("holes outside the dragged corridor are ignored",()=>{
  const holes=[{id:1,x:0,y:0},{id:2,x:50,y:0},{id:3,x:75,y:40}];
  assert.deepEqual(holesCrossedBySegment({x:0,y:0},{x:100,y:0},holes,18),[1,2]);
});
