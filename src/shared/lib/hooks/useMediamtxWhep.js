import { useCallback, useEffect, useRef, useState } from 'react';
import {
  deleteWhepResource,
  negotiateMediamtxWhep,
} from '@/shared/lib/webrtc/mediamtxWhep.js';

const MIN_RECONNECT_MS = 1_200;
const MAX_RECONNECT_MS = 30_000;
const DISCONNECTED_RECONNECT_MS = 4_000;

/**
 * Low-latency WebRTC (WHEP) playback for MediaMTX paths like /cam1/whep.
 *
 * @param {string} whepUrl — full HTTPS URL to WHEP endpoint
 * @returns {{ videoRef: React.RefObject<HTMLVideoElement | null>, status: 'connecting' | 'live' | 'offline' }}
 */
export function useMediamtxWhep(whepUrl) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('connecting');
  const attemptRef = useRef(0);
  const pcRef = useRef(null);
  const resourceUrlRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const disconnectTimerRef = useRef(null);
  const abortRef = useRef(null);

  const clearTimers = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (disconnectTimerRef.current != null) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
  }, []);

  const teardownLocal = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    const pc = pcRef.current;
    const resourceUrl = resourceUrlRef.current;
    pcRef.current = null;
    resourceUrlRef.current = null;
    if (pc) {
      deleteWhepResource(pc, resourceUrl).catch(() => {});
    }
    const v = videoRef.current;
    if (v) {
      v.srcObject = null;
    }
  }, []);

  useEffect(() => {
    let disposed = false;

    const reconnectAfterFailure = () => {
      if (disposed) return;
      clearTimers();
      setStatus('offline');
      const n = attemptRef.current + 1;
      attemptRef.current = n;
      const backoff = Math.min(
        MAX_RECONNECT_MS,
        MIN_RECONNECT_MS * 2 ** Math.min(n - 1, 4)
      );
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, backoff);
    };

    const armDisconnectedWatch = (pc) => {
      if (disconnectTimerRef.current != null) {
        clearTimeout(disconnectTimerRef.current);
      }
      disconnectTimerRef.current = window.setTimeout(() => {
        disconnectTimerRef.current = null;
        if (disposed) return;
        const state = pc.connectionState;
        if (state === 'disconnected' || state === 'failed') {
          teardownLocal();
          reconnectAfterFailure();
        }
      }, DISCONNECTED_RECONNECT_MS);
    };

    const connect = async () => {
      if (disposed) return;
      clearTimers();
      teardownLocal();

      if (disposed) return;
      setStatus('connecting');

      const ac = new AbortController();
      abortRef.current = ac;

      const onTrack = (ev) => {
        if (disposed) return;
        const v = videoRef.current;
        if (!v) return;
        const [stream] = ev.streams;
        if (stream) {
          v.srcObject = stream;
          v.play?.().catch(() => {});
          if (!disposed) setStatus('live');
        }
      };

      try {
        const { pc, resourceUrl } = await negotiateMediamtxWhep({
          whepUrl,
          onTrack,
          signal: ac.signal,
        });

        if (disposed) {
          await deleteWhepResource(pc, resourceUrl);
          return;
        }

        pcRef.current = pc;
        resourceUrlRef.current = resourceUrl;

        pc.onconnectionstatechange = () => {
          if (disposed) return;
          const s = pc.connectionState;
          if (s === 'connected') {
            attemptRef.current = 0;
            setStatus('live');
            if (disconnectTimerRef.current != null) {
              clearTimeout(disconnectTimerRef.current);
              disconnectTimerRef.current = null;
            }
          }
          if (s === 'failed') {
            teardownLocal();
            reconnectAfterFailure();
          }
          if (s === 'disconnected') {
            armDisconnectedWatch(pc);
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (disposed) return;
          if (pc.iceConnectionState === 'failed') {
            teardownLocal();
            reconnectAfterFailure();
          }
        };
      } catch (e) {
        if (e?.name === 'AbortError' || disposed) return;
        reconnectAfterFailure();
      }
    };

    connect();

    return () => {
      disposed = true;
      clearTimers();
      teardownLocal();
    };
  }, [whepUrl, clearTimers, teardownLocal]);

  return { videoRef, status };
}
