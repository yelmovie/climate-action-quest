import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {emphasizeConcept,bindConceptFocus} from '../src/concept-focus.js';
test('concept terms are highlighted without changing readable science text',()=>{
 const text='행성은 별에서 온 빛을 반사해 보여요.';
 const html=emphasizeConcept(text,['행성','별','반사']);
 assert.equal(html.replace(/<[^>]+>/g,''),text);
 assert.equal((html.match(/<mark/g)||[]).length,3);
});
test('longest literal term wins and unsafe text is escaped',()=>{
 assert.equal(emphasizeConcept('기후 변화 <img>', ['기후','기후 변화']),'<mark class="science-keyword">기후 변화</mark> &lt;img&gt;');
 assert.equal(emphasizeConcept('a+b', ['a+b']),'<mark class="science-keyword">a+b</mark>');
});
test('missing media context is harmless and returns cleanup',()=>{assert.doesNotThrow(bindConceptFocus(null,null,{}));});
test('concept controls have their stylesheet before the first dialog opens',async()=>{
 const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/<link[^>]+rel="stylesheet"[^>]+href="\/src\/concept-focus.css"[^>]+data-concept-focus-style/);
});
