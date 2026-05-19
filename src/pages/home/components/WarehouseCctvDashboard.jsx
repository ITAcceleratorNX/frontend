import React, { memo, useCallback, useRef } from 'react';
import { Loader2, Maximize2 } from 'lucide-react';
import { useMediamtxWhep } from '@/shared/lib/hooks/useMediamtxWhep.js';

const DEFAULT_WHEP_BASE = 'https://camera.extraspace.kz';
const DEFAULT_CAMERA_IDS = ['cam1', 'cam2', 'cam3', 'cam4'];

function parseCameraList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length ? list : null;
}

function parseBaseUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return DEFAULT_WHEP_BASE;
  return raw.trim().replace(/\/$/, '');
}

const WHEP_BASE = parseBaseUrl(import.meta.env.VITE_CCTV_WHEP_BASE_URL);

export const LIVE_CAMERA_IDS =
  parseCameraList(import.meta.env.VITE_CCTV_CAMERA_IDS) ?? DEFAULT_CAMERA_IDS;

function whepUrlForCamera(cameraId) {
  const id = typeof cameraId === 'string' && cameraId.trim() ? cameraId.trim() : 'cam1';
  return `${WHEP_BASE}/${id}/whep`;
}

function requestFullscreenEl(el) {
  if (!el) return;
  const fn =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.mozRequestFullScreen ||
    el.msRequestFullscreen;
  fn?.call(el);
}

function exitFullscreenDoc() {
  const doc = document;
  const fn =
    doc.exitFullscreen ||
    doc.webkitExitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.msExitFullscreen;
  fn?.call(doc);
}

function toggleFullscreen(el) {
  if (!el) return;
  const fsEl =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;
  if (fsEl === el) {
    exitFullscreenDoc();
  } else {
    requestFullscreenEl(el);
  }
}

/** Плитка камеры в том же визуальном ряду, что и фото галереи складов. */
function LiveCameraGalleryTileInner({ cameraId }) {
  const wrapRef = useRef(null);
  const url = whepUrlForCamera(cameraId);
  const { videoRef, status } = useMediamtxWhep(url);

  const onTileClick = useCallback(() => {
    toggleFullscreen(wrapRef.current);
  }, []);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFullscreen(wrapRef.current);
    }
  }, []);

  const isLive = status === 'live';

  return (
    <div
      ref={wrapRef}
      role="button"
      tabIndex={0}
      aria-label="Прямая трансляция. Нажмите для полноэкранного режима."
      onClick={onTileClick}
      onKeyDown={onKeyDown}
      className="group relative aspect-[3/4] min-h-[140px] w-full cursor-pointer overflow-hidden rounded-xl bg-gray-100 text-left ring-offset-2 ring-offset-white transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2 sm:min-h-[200px] md:min-h-[260px] lg:min-h-[320px]"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        playsInline
        muted
        autoPlay
        aria-hidden
      />

      {status === 'connecting' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/25">
          <Loader2 className="h-8 w-8 animate-spin text-white/90 drop-shadow-md" aria-hidden />
        </div>
      )}

      {status === 'offline' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gray-200/95">
          <span className="text-xs font-medium text-gray-500">Нет сигнала</span>
        </div>
      )}

      <div className="pointer-events-none absolute left-2 top-2 sm:left-2.5 sm:top-2.5">
        <span
          className={`inline-flex h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-white ${
            isLive ? 'bg-emerald-500' : status === 'connecting' ? 'animate-pulse bg-amber-400' : 'bg-red-400'
          }`}
          title={isLive ? 'Эфир' : status === 'connecting' ? 'Подключение' : 'Нет сигнала'}
          aria-hidden
        />
      </div>

      <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/45 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
      </div>
    </div>
  );
}

export const LiveCameraGalleryTile = memo(LiveCameraGalleryTileInner);
