import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

test('production client bundle exposes the critical blast controls', async () => {
  const assets = await readdir(new URL('../dist/client/assets/', import.meta.url));
  const page = assets.find(name => name.startsWith('page-') && name.endsWith('.js'));
  assert.ok(page, 'page client bundle should exist');
  const js = await readFile(new URL(`../dist/client/assets/${page}`, import.meta.url), 'utf8');
  assert.match(js, /Apply changes/i);
  assert.match(js, /Export CSV/i);
  assert.match(js, /Export PDF/i);
  assert.match(js, /Blast Pattern & Delay Design/i);
  assert.match(js, /Design data/i);
  assert.match(js, /Duplicate delays detected/i);
  assert.match(js, /Override and allow export/i);
  assert.match(js, /duplicateDelay/i);
  assert.match(js, /Delete H/i);
  assert.match(js, /V Pattern/i);
  assert.match(js, /Set north direction/i);
  assert.match(js, /Diagonal/i);
  assert.doesNotMatch(js, /Custom Diagonal Pattern/i);
  assert.match(js, /None/i);
  assert.match(js, /maximum 2,500 holes/i);
  assert.doesNotMatch(js, /API[_ -]?KEY|PRIVATE[_ -]?KEY|AUTH[_ -]?TOKEN/i);
});
