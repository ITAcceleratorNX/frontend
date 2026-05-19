import React, { memo } from 'react';
import {
  STAFF_LIVE_CAMERA_IDS,
  LiveCameraGrid,
} from '@/pages/home/components/WarehouseCctvDashboard.jsx';

function StaffCctvSectionInner() {
  if (!STAFF_LIVE_CAMERA_IDS.length) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Видеонаблюдение</h1>
        <p className="mt-4 text-sm text-gray-500">Камеры не настроены.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
      <h1 className="mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">Видеонаблюдение</h1>
      <p className="mb-6 text-sm text-gray-500 sm:text-base">
        Прямая трансляция со всех камер склада. Нажмите на плитку для полноэкранного режима.
      </p>
      <LiveCameraGrid cameraIds={STAFF_LIVE_CAMERA_IDS} />
    </div>
  );
}

const StaffCctvSection = memo(StaffCctvSectionInner);
StaffCctvSection.displayName = 'StaffCctvSection';

export default StaffCctvSection;
