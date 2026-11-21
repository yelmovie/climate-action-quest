# 16 기후 미래 작전실 인트로(33.5초)·파이널(29.5초) 최종 합성 (2026-11-21 마무리).
# 장면 영상(Flow·Gemini, 없으면 그림 카메라 움직임) → 끝 장면 모션그래픽(제목·호기심 한 줄 / 탐구 완료 배지·잎 꽃가루)
# → burn.py로 자막을 영상 안에(화자 이름표·키워드·진행 줄) → 웹용 인코딩. 목소리는 앱이 장면 시각에 튼다(src/story-film-data.js).
import subprocess, os, json, math, random, shutil
from PIL import Image, ImageDraw, ImageFont
W = '/Volumes/T7 Shield/iscreammedia_sc34/_scratch/films-16-20261121'
APP = '/Volumes/T7 Shield/iscreammedia_sc34/16 weatherchange'
BURN = '/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118/burn.py'
JUA = '/Volumes/T7 Shield/iscreammedia_sc34/_shared/caption-motion-20261118/fonts/Jua-Regular.ttf'
PY = os.path.expanduser('~/.local/share/uv/tools/earshot/bin/python')
OUT = f'{W}/render3'; os.makedirs(OUT, exist_ok=True)
F = f'{W}/frames'; C = f'{W}/clips'; FPS = 24
ENC = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), '-an']

def run(args): subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)

def kb(src, out, d, z0, z1, c0=(.5, .5), c1=(.5, .5), breathe=False):
    n = int(round(d * FPS)); p = f'(1-cos(PI*on/{n - 1}))/2'
    z = f'1+{z1 - 1}*sin(PI*on/{n - 1})' if breathe else f'{z0}+({z1}-{z0})*{p}'
    cx = f'({c0[0]}+({c1[0]}-{c0[0]})*{p})'; cy = f'({c0[1]}+({c1[1]}-{c0[1]})*{p})'
    vf = (f'scale=3840:2160:flags=lanczos,setsar=1,'
          f"zoompan=z='{z}':x='max(0,min(iw-iw/zoom,{cx}*iw-iw/zoom/2))':y='max(0,min(ih-ih/zoom,{cy}*ih-ih/zoom/2))':d={n}:s=1280x720:fps={FPS}")
    run(['-loop', '1', '-i', src, '-vf', vf, '-frames:v', str(n), *ENC, out])

def clip(src, out, d): run(['-i', src, '-t', str(d), '-vf', f'scale=1280:720:flags=lanczos,fps={FPS},setsar=1', *ENC, out])
def concat(parts, out):
    lst = f'{OUT}/concat.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts)); run(['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out])
def last(src, png): run(['-sseof', '-0.5', '-i', src, '-update', '1', png])

used = {}
def scene(key, still, out, length, kb_args):
    g = f'{C}/G-{key}.mp4'
    if os.path.exists(g) and dur(g) > 4:
        use = min(dur(g) - 0.1, length); clip(g, f'{OUT}/{key}-g.mp4', use); rest = round(length - use, 3)
        if rest < 0.2: shutil.move(f'{OUT}/{key}-g.mp4', out); used[key] = 'gemini'; return
        last(f'{OUT}/{key}-g.mp4', f'{OUT}/{key}-g-last.png'); kb(f'{OUT}/{key}-g-last.png', f'{OUT}/{key}-hold.mp4', rest, 1.0, 1.05)
        concat([f'{OUT}/{key}-g.mp4', f'{OUT}/{key}-hold.mp4'], out); used[key] = 'gemini+hold %.1fs' % rest; return
    kb(still, out, length, *kb_args); used[key] = 'still'

# ── 장면 영상 ──────────────────────────────────────────────
# 인트로 33.5초: i1 정지 3.0 → I1 8.0 → I1 끝 장면 숨 고르기 4.5 → I2 8.0 → I3 10.0(끝에 제목)
last(f'{C}/I1.mp4', f'{OUT}/I1-last.png')
kb(f'{F}/i1.png', f'{OUT}/a.mp4', 3.0, 1.07, 1.0, (.55, .45), (.5, .5))
clip(f'{C}/I1.mp4', f'{OUT}/b.mp4', 8.0)
kb(f'{OUT}/I1-last.png', f'{OUT}/c.mp4', 4.5, 1.0, 1.035, breathe=True)
clip(f'{C}/I2.mp4', f'{OUT}/d.mp4', 8.0)
scene('I3', f'{F}/i3.png', f'{OUT}/e.mp4', 10.0, (1.0, 1.12, (.5, .5), (.36, .6)))
concat([f'{OUT}/{x}.mp4' for x in 'abcde'], f'{OUT}/intro-scenes.mp4')
# 파이널 29.5초: F1 8.0 ─0.5초 디졸브→ F2 8.0 ─0.5초 흰빛→ F3 14.5(끝에 탐구 완료)
scene('F1', f'{F}/f1.png', f'{OUT}/f1.mp4', 8.0, (1.0, 1.18, (.5, .5), (.3, .66)))
scene('F2', f'{F}/f2.png', f'{OUT}/f2.mp4', 8.0, (1.0, 1.08, (.5, .5), (.4, .55)))
scene('F3', f'{F}/f3.png', f'{OUT}/f3.mp4', 14.5, (1.1, 1.1, (.38, .55), (.62, .5)))
run(['-i', f'{OUT}/f1.mp4', '-i', f'{OUT}/f2.mp4', '-i', f'{OUT}/f3.mp4', '-filter_complex',
     '[0:v][1:v]xfade=transition=fade:duration=0.5:offset=7.5[x1];[x1][2:v]xfade=transition=fadewhite:duration=0.5:offset=15.0[v]',
     '-map', '[v]', *ENC, f'{OUT}/finale-scenes.mp4'])

# ── 끝 장면 모션그래픽 ──────────────────────────────────────
def title_card(src, out, start, total):
    """인트로 끝: 앱 제목 그림이 떠오르고, 그 아래 호기심 한 줄(주아체, 앱 이야기 글)."""
    lg = f'{APP}/assets/logo-title.webp'
    line = f'{OUT}/title-line.txt'; open(line, 'w', encoding='utf-8').write('흩어진 기후 단서를 찾아 출발!')
    t1 = start + 0.6
    fc = (f"[1:v]scale=720:-1,format=rgba,fade=t=in:st={start}:d=0.8:alpha=1[lg];"
          f"color=c=black@0.0:s=1280x720,format=rgba,geq=r=0:g=0:b=0:a='if(lt(Y,360),110*(1-Y/360),0)'[gr];[gr]fade=t=in:st={start}:d=0.8:alpha=1[grf];"
          f"[0:v][grf]overlay=0:0:shortest=1[bg];"
          f"[bg][lg]overlay=x=(W-w)/2:y='58+14*max(0,1-(t-{start})/0.8)':enable='gte(t,{start})'[v1];"
          f"[v1]drawtext=fontfile='{JUA}':textfile='{line}':fontsize=44:fontcolor=#fff6cf:borderw=4:bordercolor=#0d3a31:"
          f"x=(w-text_w)/2:y=250:alpha='if(lt(t,{t1}),0,min(1,(t-{t1})/0.6))'[v]")
    run(['-i', src, '-loop', '1', '-i', lg, '-filter_complex', fc, '-map', '[v]', '-t', str(total), *ENC, out])

def badge_png(path):
    """탐구 완료 배지: 작전실 금빛 원판 + 초록 테두리 + 주아체 글자(앱 메달·인증서 도장 색)."""
    S = 520; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.ellipse((20, 26, S - 20, S - 14), fill=(9, 40, 33, 110))
    d.ellipse((16, 16, S - 24, S - 24), fill=(28, 94, 78, 255))
    d.ellipse((40, 40, S - 48, S - 48), fill=(255, 216, 116, 255))
    d.ellipse((58, 58, S - 66, S - 66), outline=(168, 114, 29, 255), width=6)
    for k in range(16):  # 테두리 별 무늬
        a = k * math.pi / 8; r = (S - 40) / 2 - 2; cx = cy = (S - 8) / 2
        x, y = cx + r * math.cos(a), cy + r * math.sin(a); d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=(255, 241, 190, 255))
    f1 = ImageFont.truetype(JUA, 92); f2 = ImageFont.truetype(JUA, 40)
    for txt, f, y in (('탐구 완료!', f1, 190), ('기후 미래 작전실', f2, 300)):
        w = d.textlength(txt, font=f); d.text(((S - 8 - w) / 2, y), txt, font=f, fill=(69, 41, 10, 255))
    im.save(path)

def confetti(dirp, n, seed=16):
    """잎사귀 꽃가루: 초록·금빛 잎이 흔들리며 떨어지는 투명 프레임(1280x720)."""
    os.makedirs(dirp, exist_ok=True); random.seed(seed)
    leaves = [dict(x=random.uniform(0, 1280), y=random.uniform(-500, -20), v=random.uniform(90, 170), sw=random.uniform(18, 40),
                   ph=random.uniform(0, 6.3), s=random.uniform(10, 20), c=random.choice([(124, 192, 67), (88, 160, 72), (255, 213, 92), (185, 229, 140)]))
              for _ in range(46)]
    for i in range(n):
        t = i / FPS; im = Image.new('RGBA', (1280, 720), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        for L in leaves:
            y = L['y'] + L['v'] * t
            if y < -30 or y > 760: continue
            x = L['x'] + L['sw'] * math.sin(L['ph'] + t * 2.2); a = 0.6 * math.sin(L['ph'] + t * 3)
            w, h = L['s'], L['s'] * 0.55; pts = []
            for k in range(12):
                q = k / 12 * 2 * math.pi; px, py = w * math.cos(q), h * math.sin(q) * (1 if math.cos(q) > -0.2 else 0.6)
                pts.append((x + px * math.cos(a) - py * math.sin(a), y + px * math.sin(a) + py * math.cos(a)))
            d.polygon(pts, fill=L['c'] + (235,))
        im.save(f'{dirp}/c{i:04d}.png')

def celebrate(src, out, start, total):
    bp = f'{OUT}/badge.png'; badge_png(bp); cdir = f'{OUT}/confetti'; n = int(round((total - start) * FPS)) + 2; confetti(cdir, n)
    st = start + 0.5
    fc = (f"[2:v]setpts=PTS+{start}/TB,format=rgba[cf];"
          f"[1:v]format=rgba,scale=w='trunc(210*min(1.12,max(0.01,(t-{st})/0.28)*(1+0.12*max(0,1-(t-{st}-0.28)/0.25)))/2)*2':h=-2:eval=frame[bd];"
          f"[0:v][cf]overlay=0:0:enable='gte(t,{start})'[v1];"
          f"[v1][bd]overlay=x=(W-w)/2:y=290+(210-h)/2:enable='gte(t,{st})'[v]")
    run(['-i', src, '-loop', '1', '-framerate', str(FPS), '-i', bp, '-framerate', str(FPS), '-i', f'{cdir}/c%04d.png', '-filter_complex', fc, '-map', '[v]', '-t', str(total), *ENC, out])

title_card(f'{OUT}/intro-scenes.mp4', f'{OUT}/intro-mg.mp4', 29.7, 33.5)
celebrate(f'{OUT}/finale-scenes.mp4', f'{OUT}/finale-mg.mp4', 25.6, 29.5)

# ── 자막(burn.py) ──────────────────────────────────────────
VOICE = {k: v for k, v in json.load(open(f'{W}/voice/durations.json')).items()}
def chunks(start, key, parts, who=None):
    total = VOICE[key]; L = [len(p.replace('\n', '').replace(' ', '').replace('[', '').replace(']', '')) for p in parts]
    out, t = [], start
    for i, (p, l) in enumerate(zip(parts, L)):
        d = total * l / sum(L); s0, s1 = t, t + d
        c = {'s': round(max(0, s0 - 0.15), 2), 'e': round(s1 + (0.05 if i < len(parts) - 1 else 0.45), 2), 'speech': [round(s0, 2), round(s1, 2)], 'text': p}
        if who: c['who'] = who
        out.append(c); t = s1
    return out
theme = {'box': '#0d2a22', 'accent': '#ffd35c', 'hot': '#ffd35c'}
speakers = {'잎새': ['#4f9b3a', '#ffffff']}
intro_cues = (chunks(0.5, 'story-1', ['끊어진 연구기지를 다시 연결해요.', '도시를 살펴보던 연구 기록이 흩어졌어요.', '무엇이 달라졌는지, 어떤 준비가 필요한지\n확인할 [단서]가 필요해요.'])
              + chunks(11.8, 'story-2', ['대원은 생각하고, 잎새는 함께 걸어요.', '[관측]하고 → 관련성을 찾고 → 영향을 실험해요.', '생활의 선택을 비교한 뒤,\n직접 설계한 도시를 시험해요.'])
              + chunks(24.2, 'intro-3', ['대원, 네 도움이 필요해!', '[다섯 시설]에 다시 불을 켜러 같이 가자!'], '잎새'))
final_cues = (chunks(0.4, 'ending-1', ['다섯 연구 기록이 모두 연결됐어요.', '모은 발견으로 [작전실]을 켜고\n탐구를 마무리해요.'])
              + chunks(8.0, 'finale-2', ['다섯 메달이 하나로 이어졌어요.', '이제 중앙 작전실에서\n[탐구 인증서]를 받아요.'])
              + chunks(15.4, 'ending-2', ['우리의 탐구는 계속돼요.', '모형 속 답을 찾았다면,\n이제 생활 속 [작은 실천]을 이어가요.'])
              + chunks(22.6, 'finale-4', ['대원, 우리가 [해냈어]!', '함께 탐구해서 정말 즐거웠어. 고마워!'], '잎새'))
for name, cues in (('intro', intro_cues), ('finale', final_cues)):
    j = {'src': f'{OUT}/{name}-mg.mp4', 'out': f'{OUT}/{name}-cap.mp4', 'theme': theme, 'speakers': speakers, 'bottom': 64, 'sweep': True, 'cues': cues}
    jp = f'{OUT}/{name}.json'; json.dump(j, open(jp, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    subprocess.run([PY, BURN, jp], check=True)
    run(['-i', f'{OUT}/{name}-cap.mp4', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', f'{OUT}/{name}-web.mp4'])
    run(['-ss', '1.2', '-i', f'{OUT}/{name}-mg.mp4', '-frames:v', '1', f'{OUT}/{name}-poster.png'])
    print(name, round(dur(f'{OUT}/{name}-web.mp4'), 2), os.path.getsize(f'{OUT}/{name}-web.mp4'))
print('USED', json.dumps(used))
