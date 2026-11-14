import {ipsaeDialogueArt} from './characters.js';
const portraits = Object.freeze({ipsae:'잎새',mulbangul:'물방울'});
export function npcName(speaker) { return portraits[speaker]; }
export function npcPortrait(speaker) {
  if(speaker==='ipsae')return `<div class="npc-art-frame npc-parrot" aria-hidden="true" style="--npc-frame-ratio:1;--npc-sprite:url('${ipsaeDialogueArt}')"></div>`;
  return portraits[speaker]
    ? `<div class="npc-art-frame" aria-hidden="true" style="--npc-frame-ratio:576/620;--npc-sprite:url('/assets/npc-dialogue/${speaker}.webp')"></div>`
    : '';
}
