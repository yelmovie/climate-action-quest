let registration;
export function registerOffline() {
  return registration ??= (async () => {
    if (!('serviceWorker' in navigator)) return null;
    const response = await fetch('/sw.js', { method: 'HEAD' });
    if (!response.ok) return null;
    await navigator.serviceWorker.register('/sw.js');
    return navigator.serviceWorker.ready;
  })().catch(error => {
    registration = undefined;
    throw error;
  });
}

export async function prepareOffline(onProgress) {
  const worker = (await registerOffline())?.active;
  if (!worker) throw new Error('Offline preparation requires the deployment build');
  return new Promise((resolve, reject) => {
    const { port1, port2 } = new MessageChannel();
    let timer;
    function end(error) {
      clearTimeout(timer);
      port1.close();
      if (error) reject(error);
      else resolve();
    }
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => end(new Error('Offline download timed out')), 30000);
    };
    port1.onmessage = ({ data }) => {
      if (data.type === 'CACHE_PROGRESS') { resetTimer(); onProgress?.(data.done, data.total); }
      else end(data.type === 'CACHE_READY' ? null : new Error('Offline download failed'));
    };
    resetTimer();
    worker.postMessage({ type: 'CACHE_ALL' }, [port2]);
  });
}
