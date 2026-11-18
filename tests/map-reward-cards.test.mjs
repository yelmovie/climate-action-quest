import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {REWARD_CARDS,ownedRewardCards,newRewardCards} from '../src/map-reward-cards.js';
import {stages} from '../src/state.js';
import {CARD_CUES,MAP_CUES} from '../src/audio.js';

const root=new URL('../',import.meta.url);

test('one achievement card per map villain, in facility order, with its art and thumbnail',()=>{
 assert.deepEqual(REWARD_CARDS.map(card=>card.id),['0','1','2','3','4']);
 assert.deepEqual(REWARD_CARDS.map(card=>card.stage),stages.map(stage=>stage.name));
 assert.equal(new Set(REWARD_CARDS.map(card=>card.title)).size,5);
 REWARD_CARDS.forEach((card,index)=>{
  assert.equal(card.art,`/assets/reward-cards/card-${index+1}-${index}.webp`);
  assert.equal(card.thumb,`/assets/reward-cards/thumb-${index+1}-${index}.webp`);
  for(const file of [card.art,card.thumb])assert.ok(existsSync(new URL('.'+file,root)),file);
 });
});

test('a card is owned only after the third hit, read from the existing hit record',()=>{
 assert.deepEqual(ownedRewardCards({}),[false,false,false,false,false]);
 assert.deepEqual(ownedRewardCards(undefined),[false,false,false,false,false]);
 assert.deepEqual(ownedRewardCards({0:3,1:2,3:3}),[true,false,false,true,false]);
});

test('a card is won only by the hit that takes a villain from under three to three',()=>{
 assert.deepEqual(newRewardCards({},{1:1}),[]);
 assert.deepEqual(newRewardCards({1:2},{1:3}),[1]);
 assert.deepEqual(newRewardCards({1:3},{1:3}),[]);
 assert.deepEqual(newRewardCards({0:3,4:2},{0:3,4:3}),[4]);
 assert.deepEqual(newRewardCards({0:3,4:3},{}),[]);
});

test('card cues are local CC0 files with a credit line, apart from the map cues',()=>{
 assert.deepEqual(Object.keys(CARD_CUES),['card-whoosh','card-reveal','card-epic','card-slot','card-complete']);
 assert.equal(Object.keys(CARD_CUES).filter(name=>name in MAP_CUES).length,0);
 const credits=readFileSync(new URL('assets/CREDITS.md',root),'utf8');
 for(const parts of Object.values(CARD_CUES))for(const {src} of parts){
  assert.ok(existsSync(new URL('.'+src,root)),src);
  assert.ok(credits.includes('`'+src.split('/').pop()+'`'),src);
 }
});

test('the shared card module and its stylesheet are loaded as shipped',()=>{
 assert.match(readFileSync(new URL('index.html',root),'utf8'),/<link rel="stylesheet" href="\/src\/reward-cards\.css">\s*<link rel="stylesheet" href="\/src\/map-reward-cards\.css">/);
 // The app's own overrides never use the font shorthand, which would reset the family.
 assert.doesNotMatch(readFileSync(new URL('src/map-reward-cards.css',root),'utf8'),/(?<![\w-])font\s*:/);
 assert.match(readFileSync(new URL('src/reward-cards.js',root),'utf8'),/export function createRewardCards/);
});
