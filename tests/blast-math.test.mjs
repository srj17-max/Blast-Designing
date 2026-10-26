import test from "node:test";
import assert from "node:assert/strict";
import{blastMetrics,firingWindows,totalExplosive}from"../lib/blastMath.mjs";

test("blast metrics use actual explosive mass and square-root scaled distance",()=>{
  const result=blastMetrics({holes:40,burden:2,spacing:2.5,benchHeight:3,rockDensity:2.3,totalExplosive:111.2,distance:300,maxCharge:5.56,siteConstant:1140,siteExponent:1.6});
  assert.equal(result.volume,600);
  assert.equal(result.rockMass,1380);
  assert.ok(Math.abs(result.chargeFactor-0.0805797)<1e-6);
  assert.ok(Math.abs(result.explosiveYield-12.4100719)<1e-6);
  assert.ok(Math.abs(result.scaledDistance-127.228)<0.001);
  assert.ok(Math.abs(result.ppv-0.489)<0.001);
});

test("no firing charge reports zero PPV without NaN",()=>{
  const result=blastMetrics({holes:1,burden:2,spacing:2.5,benchHeight:3,rockDensity:2.3,totalExplosive:2.78,distance:300,maxCharge:0,siteConstant:1140,siteExponent:1.6});
  assert.equal(result.scaledDistance,Infinity);
  assert.equal(result.ppv,0);
});

test("plus or minus seven millisecond firing windows include both boundary events",()=>{
  const windows=firingWindows([{time:100,charge:2.78},{time:107,charge:2.78},{time:115,charge:2.78}],7);
  assert.equal(Math.max(...windows.map(group=>group.reduce((sum,event)=>sum+event.charge,0))),5.56);
});

test("total explosive includes secondary deck charge only when enabled",()=>{
  const result=totalExplosive([
    {charge:2.78,deckCharging:false,deckCharge:1.2},
    {charge:2.5,deckCharging:true,deckCharge:1.5},
  ]);
  assert.ok(Math.abs(result-6.78)<1e-9);
});
