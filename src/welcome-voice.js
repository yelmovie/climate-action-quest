import {voiceControl,stopNarration} from './narration.js';
// Optional welcome narration. Playback always begins with a deliberate button press.
export function mountWelcomeVoice(host, { caption }) {
  if (!host) return () => {};
  const panel = document.createElement('section');
  panel.className = 'npc-welcome-voice';
  panel.setAttribute('aria-label', '안내자 환영 인사');
  panel.style.cssText = 'max-width:480px;margin:12px 0;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.94);color:#193d43;text-align:left;position:relative;z-index:2;';
  const label = document.createElement('small');
  label.textContent = 'AI 생성 음성';
  label.style.cssText = 'display:inline-block;margin-left:10px;font-size:clamp(13px,.85vw,16px);';
  const subtitle = document.createElement('p');
  subtitle.textContent = caption;
  subtitle.style.cssText = 'margin:6px 0 0;font-size:clamp(15px,1.05vw,20px);line-height:1.55;word-break:keep-all;';
  panel.append(label, subtitle);
  host.append(panel);
  const button=voiceControl(panel,'welcome-1');
  panel.prepend(button);
  return () => { stopNarration(); panel.remove(); };
}
