/** MediaMTX WHEP: POST local SDP offer, receive SDP answer (native WebRTC, no HLS). */

const DEFAULT_ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

/**
 * @param {string} requestUrl
 * @param {string | null} locationHeader
 * @returns {string | null}
 */
export function resolveWhepResourceUrl(requestUrl, locationHeader) {
  if (!locationHeader || typeof locationHeader !== 'string') return null;
  const trimmed = locationHeader.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return new URL(trimmed, requestUrl).href;
}

/**
 * @param {RTCPeerConnection} pc
 * @param {AbortSignal | undefined} signal
 * @param {number} timeoutMs
 * @returns {Promise<void>}
 */
function waitIceGathering(pc, signal, timeoutMs = 12_000) {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();

  return new Promise((resolve, reject) => {
    let settled = false;

    const finish = (fn) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onAbort = () => finish(() => reject(new DOMException('Aborted', 'AbortError')));

    const cleanup = () => {
      clearTimeout(timer);
      pc.removeEventListener('icegatheringstatechange', onGathering);
      signal?.removeEventListener('abort', onAbort);
    };

    const timer = setTimeout(() => finish(resolve), timeoutMs);

    const onGathering = () => {
      if (pc.iceGatheringState === 'complete') finish(resolve);
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });
    pc.addEventListener('icegatheringstatechange', onGathering);
  });
}

/**
 * @param {object} opts
 * @param {string} opts.whepUrl
 * @param {RTCTrackEvent | undefined} [opts.onTrack]
 * @param {AbortSignal | undefined} [opts.signal]
 * @param {RTCIceServer[]} [opts.iceServers]
 * @returns {Promise<{ pc: RTCPeerConnection, resourceUrl: string | null }>}
 */
export async function negotiateMediamtxWhep({
  whepUrl,
  onTrack,
  signal,
  iceServers = DEFAULT_ICE_SERVERS,
}) {
  const pc = new RTCPeerConnection({ iceServers });
  try {
    if (typeof onTrack === 'function') {
      pc.ontrack = onTrack;
    }
    pc.addTransceiver('video', { direction: 'recvonly' });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await waitIceGathering(pc, signal);

    const sdp = pc.localDescription?.sdp;
    if (!sdp) {
      throw new Error('WHEP: missing local SDP');
    }

    const res = await fetch(whepUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: sdp,
      signal,
    });

    if (!res.ok) {
      const err = new Error(`WHEP HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }

    const answerSdp = await res.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });

    const resourceUrl = resolveWhepResourceUrl(whepUrl, res.headers.get('Location'));
    return { pc, resourceUrl };
  } catch (e) {
    pc.close();
    throw e;
  }
}

/**
 * @param {RTCPeerConnection} pc
 * @param {string | null} resourceUrl
 */
export async function deleteWhepResource(pc, resourceUrl) {
  try {
    if (resourceUrl) {
      await fetch(resourceUrl, { method: 'DELETE' }).catch(() => {});
    }
  } finally {
    pc.close();
  }
}
