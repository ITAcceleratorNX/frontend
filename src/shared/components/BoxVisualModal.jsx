import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import { Button } from "@/components/ui";
import { ImageOff } from "lucide-react";
import { cn } from "@/shared/lib/utils/cn.js";
import { getBoxRangeTemplate } from "@/shared/lib/boxRange/getBoxRangeTemplate.js";
import { getStorageM2ForBoxVisual } from "@/shared/lib/boxRange/getStorageM2ForBoxVisual.js";
import {
  BOX_RANGE_TEMPLATES,
  getBoxRangeImageUrl,
  isMegaTowersWarehouse,
} from "@/shared/lib/boxRange/boxRangeTemplates.js";

function formatM2(v) {
  const n = Math.round(Number(v) * 100) / 100;
  if (Number.isNaN(n)) return "";
  if (Number.isInteger(n)) return String(n);
  return String(n).replace(".", ",");
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {(open: boolean) => void} props.onOpenChange
 * @param {object | null} [props.storage] — выбранный бокс (схема)
 * @param {object} [props.selectedWarehouse]
 * @param {(s: object | null) => void} props.onTakeBox — подтверждение, как у прямого выбора
 */
function BoxVisualModal({ open, onOpenChange, storage, selectedWarehouse, onTakeBox }) {
  const sizeM2 = useMemo(
    () => getStorageM2ForBoxVisual(storage),
    [storage]
  );

  const displaySize = useMemo(() => (sizeM2 != null ? formatM2(sizeM2) : "—"), [sizeM2]);
  const templateKey = useMemo(
    () => (sizeM2 != null ? getBoxRangeTemplate(sizeM2) : "range_2"),
    [sizeM2]
  );
  const itemsText = BOX_RANGE_TEMPLATES[templateKey]?.items ?? "";

  const isMega = isMegaTowersWarehouse(selectedWarehouse);
  const imageSrc = useMemo(
    () => getBoxRangeImageUrl(templateKey, isMega),
    [templateKey, isMega]
  );

  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setImageFailed(false);
    setImageLoaded(false);
  }, [open, imageSrc, storage?.id]);

  const handleTakeBox = useCallback(() => {
    onTakeBox?.(storage ?? null);
    onOpenChange?.(false);
  }, [onOpenChange, onTakeBox, storage]);

  const titleId = "box-visual-modal-title";
  const descId = "box-visual-modal-desc";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(100vw-1.5rem,26rem)] max-w-[min(100vw-1.5rem,26rem)] max-h-[min(100dvh-2rem,90vh)] overflow-y-auto",
          "rounded-2xl sm:rounded-3xl border-0 p-0 gap-0 shadow-lg",
          "bg-white"
        )}
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="p-4 sm:p-6 pb-2">
          <DialogHeader className="text-left space-y-2 pr-6">
            <DialogTitle
              id={titleId}
              className="font-soyuz-grotesk text-xl sm:text-2xl font-bold text-[#202422] leading-tight"
            >
              Размер бокса — {displaySize} м²
            </DialogTitle>
            <DialogDescription id={descId} className="sr-only">
              Просмотр примера наполнения бокса выбранного размера и списка вещей.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6">
          <div
            className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-[#EEF1EF]"
            style={{ minHeight: "11rem" }}
          >
            {!imageFailed && imageSrc && (
              <>
                {!imageLoaded && (
                  <div
                    className="absolute inset-0 animate-pulse bg-gradient-to-b from-[#E8ECE9] to-[#dde3dd]"
                    aria-hidden
                  />
                )}
                <img
                  key={imageSrc}
                  src={imageSrc}
                  alt={`Пример заполнения бокса ${displaySize} м²`}
                  className={cn(
                    "relative z-[1] h-full w-full object-cover transition-opacity duration-200",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageFailed(true)}
                  loading="eager"
                  decoding="async"
                />
              </>
            )}

            {imageFailed && (
              <div
                className="flex h-full min-h-[11rem] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-[#6B6B6B]"
                role="img"
                aria-label={`Иллюстрация недоступна, бокс ${displaySize} м²`}
              >
                <ImageOff className="h-10 w-10 opacity-50" strokeWidth={1.5} />
                <span>Изображение скоро появится</span>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pt-4 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#273655] mb-2">
            Что помещается
          </h3>
          <p className="text-sm text-[#202422] leading-relaxed font-medium">
            {itemsText}
          </p>
        </div>

        <div className="p-4 sm:p-6 pt-2">
          <Button
            type="button"
            className="h-12 w-full rounded-xl bg-[#31876D] text-base font-bold text-white shadow-md hover:bg-[#276b57] sm:rounded-2xl"
            onClick={handleTakeBox}
          >
            Взять бокс
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(BoxVisualModal);
