import test from "node:test";
import assert from "node:assert/strict";
import{togglePathHole}from"../lib/connectPath.mjs";

test("hovering a new hole adds it to the drag connection path",()=>{
  assert.deepEqual(togglePathHole([1,2],3),[1,2,3]);
});

test("hovering an already selected hole removes it from the drag connection path",()=>{
  assert.deepEqual(togglePathHole([1,2,3],2),[1,3]);
});
