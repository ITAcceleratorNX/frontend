import React, { memo, useCallback, useRef } from 'react';
import { Loader2, Maximize2 } from 'lucide-react';
import { useMediamtxWhep } from '@/shared/lib/hooks/useMediamtxWhep.js';

const DEFAULT_WHEP_BASE = 'http://extraspace-rtsp.duckdns.org';
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
const CAMERA_IDS =
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

function CameraStatusBadge({ status }) {
  const isLive = status === 'live';
  const isConnecting = status === 'connecting';
  const label = isLive ? 'Онлайн' : isConnecting ? 'Подключение' : 'Нет сигнала';

  return (
    <div
      className="pointer-events-none flex items-center gap-1.5 rounded border border-white/10 bg-black/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-200 backdrop-blur-sm sm:text-[11px]"
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isLive
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]'
            : isConnecting
              ? 'animate-pulse bg-amber-400'
              : 'bg-red-500'
        }`}
        aria-hidden
      />
      {label}
    </div>
  );
}

function CctvCameraTile({ cameraId }) {
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

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={wrapRef}
        role="button"
        tabIndex={0}
        aria-label={`Камера ${cameraId}. Нажмите для полноэкранного режима.`}
        onClick={onTileClick}
        onKeyDown={onKeyDown}
        className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-lg border border-zinc-700/80 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] outline-none ring-cyan-500/0 transition-[box-shadow,ring] focus-visible:ring-2 focus-visible:ring-cyan-400/80"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-contain bg-[#060708]"
          playsInline
          muted
          autoPlay
          aria-label={`Видеопоток ${cameraId}`}
        />

        {status === 'connecting' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/65">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" aria-hidden />
            <span className="text-xs font-medium text-zinc-300">Подключение…</span>
          </div>
        )}

        {status === 'offline' && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/75">
            <span className="px-4 text-center text-sm text-zinc-400">
              Поток недоступен. Повтор…
            </span>
          </div>
        )}

        <div className="pointer-events-none absolute left-2 top-2 sm:left-2.5 sm:top-2.5">
          <CameraStatusBadge status={status} />
        </div>

        <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/65 px-1.5 py-1 text-zinc-400 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 sm:bottom-2.5 sm:right-2.5">
          <Maximize2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
          <span className="hidden text-[10px] uppercase tracking-wide sm:inline">На весь экран</span>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2 py-2 pt-8">
          <p className="font-mono text-[11px] font-medium tracking-wide text-zinc-200 sm:text-xs">
            {cameraId}
          </p>
        </div>
      </div>
    </div>
  );
}

function WarehouseCctvDashboard() {
  if (!CAMERA_IDS.length) {
    return null;
  }

  return (
    <section className="w-full bg-[#0a0c10] py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[90rem]">
          <div className="mb-8 border-b border-white/10 pb-6 text-center sm:mb-10 md:mb-12">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 sm:text-[11px]">
              Live / WebRTC
            </p>
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-zinc-100 sm:text-3xl md:text-4xl lg:text-5xl">
              Видеонаблюдение
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              Прямые трансляции с низкой задержкой (WebRTC). Нажмите на плитку для полноэкранного
              режима.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {CAMERA_IDS.map((id) => (
              <CctvCameraTile key={id} cameraId={id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(WarehouseCctvDashboard);
