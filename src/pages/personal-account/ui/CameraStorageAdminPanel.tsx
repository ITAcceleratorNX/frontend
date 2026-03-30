import React, { useEffect, useState, useCallback } from 'react';
import { cameraStorageApi } from '../../../../src/shared/api/cameraStorageApi';
import { showErrorToast, showSuccessToast } from '../../../../src/shared/lib/toast';

type Props = {
  warehouseId: string | number | null | undefined;
};

const DAYS = Array.from({ length: 14 }, (_, i) => i + 1);

export function CameraStorageAdminPanel({ warehouseId }: Props) {
  const [capacity, setCapacity] = useState('');
  const [rates, setRates] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!warehouseId) return;
    setLoading(true);
    try {
      const data = await cameraStorageApi.getConfig(String(warehouseId));
      setCapacity(
        data.capacityTotalVolumeM3 > 0 ? String(data.capacityTotalVolumeM3) : ''
      );
      const next: Record<number, string> = {};
      DAYS.forEach((d) => {
        const v = data.ratesByDays?.[d];
        next[d] = v != null && v !== '' ? String(v) : '';
      });
      setRates(next);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      showErrorToast(err?.response?.data?.error || err?.message || 'Не удалось загрузить настройки камер');
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!warehouseId) return;
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap <= 0) {
      showErrorToast('Укажите положительный общий объём (м³)');
      return;
    }
    const ratesByDays: Record<string, number> = {};
    for (const d of DAYS) {
      const raw = rates[d]?.trim();
      if (raw === '' || raw === undefined) continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        showErrorToast(`Некорректная цена для ${d} суток`);
        return;
      }
      ratesByDays[String(d)] = n;
    }
    setSaving(true);
    try {
      await cameraStorageApi.updateConfig(String(warehouseId), {
        capacityTotalVolumeM3: cap,
        ratesByDays: Object.keys(ratesByDays).length ? ratesByDays : undefined,
      });
      showSuccessToast('Настройки камер хранения сохранены');
      await load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; details?: unknown } }; message?: string };
      showErrorToast(err?.response?.data?.error || err?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (!warehouseId) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Камеры хранения</h2>
        <p className="text-sm text-gray-600 mt-1">
          Общий объём склада (м³) и тариф за 1 м³ за 1 сутки для брони на 1–14 суток. Итог: объём × число суток × тариф (₸).
        </p>
      </div>
      <div className="p-6 space-y-6">
        {loading ? (
          <p className="text-sm text-gray-500">Загрузка…</p>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Общий объём (м³)</label>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full max-w-xs px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Тарифы: ₸ за 1 м³ за 1 сутки (при брони на указанное число суток)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {DAYS.map((d) => (
                  <div key={d}>
                    <label className="block text-xs text-gray-500 mb-1">{d} сут.</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={rates[d] ?? ''}
                      onChange={(e) => setRates((prev) => ({ ...prev, [d]: e.target.value }))}
                      placeholder="—"
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991]"
                    />
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 bg-[#00A991] hover:bg-[#009882] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
