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
  assert.match(js, /Applied design parameters/i);
  assert.match(js, /Custom Diagonal Pattern/i);
  assert.match(js, /maximum 2,500 holes/i);
  assert.doesNotMatch(js, /API[_ -]?KEY|PRIVATE[_ -]?KEY|AUTH[_ -]?TOKEN/i);
});
