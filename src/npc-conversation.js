const portraits = Object.freeze({ipsae:'잎새',mulbangul:'물방울'});
export function npcName(speaker) { return portraits[speaker]; }
export function npcPortrait(speaker) {
  return portraits[speaker]
    ? `<div class="npc-art-frame" aria-hidden="true" style="--npc-frame-ratio:576/620;--npc-sprite:url('/assets/npc-dialogue/${speaker}.webp')"></div>`
    : '';
}
