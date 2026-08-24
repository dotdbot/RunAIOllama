// Run: node gate.test.js
// ponytail: hand-rolled DOM stub instead of jsdom — gate.js touches five APIs, not a browser.
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function run({ stored = null, storageThrows = false } = {}) {
  const listeners = {};
  const store = { v: stored };
  const html = { style: { visibility: '' } };
  const nodes = [];

  const mkEl = () => {
    const el = {
      style: { cssText: '' },
      _html: '',
      value: '',
      textContent: '',
      removed: false,
      set innerHTML(v) { this._html = v; },
      get innerHTML() { return this._html; },
      appendChild() {},
      remove() { this.removed = true; },
      select() {},
      addEventListener(ev, fn) { this['on' + ev] = fn; },
      querySelector(sel) { return (this.q ||= {})[sel] ||= mkEl(); },
    };
    nodes.push(el);
    return el;
  };

  const sandbox = {
    sessionStorage: {
      getItem() { if (storageThrows) throw new Error('blocked'); return store.v; },
      setItem(_, v) { if (storageThrows) throw new Error('blocked'); store.v = v; },
    },
    document: {
      documentElement: html,
      body: { appendChild(el) { sandbox._overlay = el; } },
      createElement: mkEl,
      addEventListener(ev, fn) { listeners[ev] = fn; },
    },
  };

  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('gate.js', 'utf8'), sandbox);
  return { sandbox, html, store, fire: () => listeners.DOMContentLoaded && listeners.DOMContentLoaded() };
}

// 1. Fresh visit: page is hidden and an overlay is mounted.
{
  const t = run();
  assert.strictEqual(t.html.style.visibility, 'hidden', 'page should be hidden before unlock');
  t.fire();
  assert.ok(t.sandbox._overlay, 'overlay should be mounted');
  assert.match(t.sandbox._overlay.innerHTML, /type="password"/, 'overlay needs a password field');
}

// 2. Wrong password: stays hidden, no unlock recorded.
{
  const t = run();
  t.fire();
  const ov = t.sandbox._overlay;
  ov.querySelector('form').onsubmit({ preventDefault() {} });   // empty value != password
  assert.strictEqual(t.html.style.visibility, 'hidden', 'wrong password must not reveal the page');
  assert.strictEqual(t.store.v, null, 'wrong password must not persist unlock');
  assert.strictEqual(ov.removed, false, 'overlay must stay up');
  assert.match(ov.querySelector('#gate-err').textContent, /Wrong/, 'user should see an error');
}

// 3. Right password: reveals, persists, removes overlay.
{
  const t = run();
  t.fire();
  const ov = t.sandbox._overlay;
  ov.querySelector('#gate-pw').value = 'danny123';
  ov.querySelector('form').onsubmit({ preventDefault() {} });
  assert.strictEqual(t.html.style.visibility, '', 'correct password should reveal the page');
  assert.strictEqual(t.store.v, '1', 'unlock should persist for the session');
  assert.strictEqual(ov.removed, true, 'overlay should be removed');
}

// 4. Already unlocked this session: no gate at all.
{
  const t = run({ stored: '1' });
  assert.strictEqual(t.html.style.visibility, '', 'unlocked session should not be hidden');
  t.fire();
  assert.strictEqual(t.sandbox._overlay, undefined, 'unlocked session should not get an overlay');
}

// 5. Storage blocked (private mode): fail open rather than lock the page shut forever.
{
  const t = run({ storageThrows: true });
  assert.strictEqual(t.html.style.visibility, '', 'must not hide a page the user could never unlock');
}

console.log('gate.js: 5 checks passed');
