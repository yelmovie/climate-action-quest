// Embed the unmodified official fonts so a downloaded SVG keeps the same typography offline.
// License and copyright notice: /assets/fonts/NanumSquareNeo-OFL.txt.
export async function certificateFontStyle(fetcher = fetch) {
  const fonts = [[400, 'bRg'], [700, 'cBd']];
  const rules = await Promise.all(fonts.map(async ([weight, suffix]) => {
    const response = await fetcher(`/assets/fonts/NanumSquareNeoTTF-${suffix}.woff2`);
    if (!response.ok) throw new Error('인증서 글꼴을 불러오지 못했어요.');
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (String.fromCharCode(...bytes.subarray(0, 4)) !== 'wOF2') throw new Error('인증서 글꼴 파일을 확인해 주세요.');
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return `@font-face{font-family:NanumSquareNeo;font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${btoa(binary)}) format('woff2')}`;
  }));
  const licenseResponse = await fetcher('/assets/fonts/NanumSquareNeo-OFL.txt');
  if (!licenseResponse.ok) throw new Error('인증서 글꼴 라이선스를 불러오지 못했어요.');
  const license = (await licenseResponse.text()).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<metadata>${license}</metadata><style>${rules.join('')}</style>`;
}
