import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { getTodayLocalDateString } from "@/shared/lib/utils/date";
import {
  showErrorToast,
  showInfoToast,
  toastOrderRequestSent,
} from "@/shared/lib/toast";
import { useAuth } from "@/shared/context/AuthContext";
import { validateUserProfile } from "@/shared/lib/validation/profileValidation";
import {
  calculateCameraBulkPrice,
  createCameraStorageOrder,
} from "@/shared/api/cameraStorageApi";
import LeftCapacityGuide from "./LeftCapacityGuide";
import RightLockerForm from "./RightLockerForm";
import {
  computeLockerEndDateISO,
  isStartDateInPast,
} from "./useLockerPricing";

/**
 * @param {{
 *   isActive?: boolean;
 *   warehouses?: Array<{ id: number; name: string }>;
 *   onCallbackClick?: () => void;
 *   selectedClientUser?: { id: number; name?: string; email?: string; phone?: string } | null;
 *   isAdminOrManager?: boolean;
 *   isUserRole?: boolean;
 *   onOpenClientSelector?: () => void;
 * }} props
 */
export default function StorageLockersSection({
  isActive = true,
  warehouses = [],
  onCallbackClick,
  selectedClientUser = null,
  isAdminOrManager = false,
  isUserRole = true,
  onOpenClientSelector,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  const [warehouseId, setWarehouseId] = useState(null);
  const [volumeM3, setVolumeM3] = useState(1);
  const [startDate, setStartDate] = useState(() => getTodayLocalDateString());
  const [days, setDays] = useState(1);

  const [serverTotalPrice, setServerTotalPrice] = useState(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceAbortRef = useRef(null);

  const todayISO = useMemo(() => getTodayLocalDateString(), []);

  useEffect(() => {
    if (!Array.isArray(warehouses) || warehouses.length === 0) {
      setWarehouseId(null);
      return;
    }
    setWarehouseId((prev) => {
      if (prev != null && warehouses.some((w) => w.id === prev)) {
        return prev;
      }
      return warehouses[0].id;
    });
  }, [warehouses]);

  const endDateISO = useMemo(
    () => computeLockerEndDateISO(startDate, days),
    [startDate, days]
  );

  const startDateError = useMemo(() => {
    if (isStartDateInPast(startDate, todayISO)) {
      return "Дата начала не может быть в прошлом";
    }
    return "";
  }, [startDate, todayISO]);

  const daysError = useMemo(() => {
    if (days < 1) return "Минимум 1 день";
    if (days > 14) return "Максимум 14 дней";
    return "";
  }, [days]);

  /** Только цена с POST /prices/calculate-bulk (CAMERA); без клиентского «тарифа» */
  const totalPriceForSummary = useMemo(() => {
    if (isPriceLoading) return null;
    if (serverTotalPrice != null && Number.isFinite(Number(serverTotalPrice))) {
      return serverTotalPrice;
    }
    return null;
  }, [isPriceLoading, serverTotalPrice]);

  const priceLine = useMemo(() => {
    return `${volumeM3} м³ × ${days} сут. × тариф ₸/м³/сут`;
  }, [volumeM3, days]);

  const canSubmitBase =
    !startDateError &&
    !daysError &&
    days >= 1 &&
    days <= 14 &&
    warehouseId != null &&
    !isPriceLoading;

  const canSubmit =
    canSubmitBase &&
    serverTotalPrice != null &&
    Number(serverTotalPrice) > 0 &&
    !priceError;

  useEffect(() => {
    if (!isActive || typeof window === "undefined") return;
    localStorage.setItem("prep_duration", String(days));
    localStorage.setItem("prep_area", String(volumeM3));
    if (!isPriceLoading && serverTotalPrice != null) {
      localStorage.setItem("calculated_price", String(serverTotalPrice));
    }
  }, [isActive, days, volumeM3, isPriceLoading, serverTotalPrice]);

  useEffect(() => {
    if (!isActive || !warehouseId) {
      setServerTotalPrice(null);
      setPriceError("");
      return;
    }
    if (startDateError || daysError || days < 1 || days > 14) {
      setServerTotalPrice(null);
      setPriceError("");
      setIsPriceLoading(false);
      return;
    }

    if (priceAbortRef.current) {
      priceAbortRef.current.abort();
    }
    const controller = new AbortController();
    priceAbortRef.current = controller;

    setServerTotalPrice(null);
    setIsPriceLoading(true);
    setPriceError("");

    const t = setTimeout(async () => {
      try {
        const data = await calculateCameraBulkPrice({
          warehouseId,
          volumeM3,
          days,
          services: [],
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        const raw = data?.totalPrice ?? data?.storage?.price;
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0) {
          setServerTotalPrice(null);
          setPriceError("Не удалось получить цену. Попробуйте позже.");
          return;
        }
        setServerTotalPrice(n);
      } catch (e) {
        if (controller.signal.aborted) return;
        const err = e;
        if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") return;
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "";
        setServerTotalPrice(null);
        setPriceError(
          msg || "Не удалось рассчитать стоимость. Проверьте настройки камер в админке."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsPriceLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [
    isActive,
    warehouseId,
    volumeM3,
    days,
    startDateError,
    daysError,
    startDate,
  ]);

  const translateCameraError = useCallback((error, errorData) => {
    const message =
      errorData?.message || errorData?.error || error?.message || "";
    const status = error?.response?.status;
    const code = errorData?.code;

    if (
      status === 400 &&
      (message.includes("Phone number must be verified") ||
        code === "PHONE_NOT_VERIFIED")
    ) {
      return {
        userMessage:
          "Телефон не верифицирован. Пожалуйста, верифицируйте номер телефона в профиле.",
        shouldRedirect: true,
        redirectPath: "/personal-account",
        redirectState: { activeSection: "personal" },
      };
    }
    if (status === 401) {
      return {
        userMessage: "Сессия истекла. Пожалуйста, войдите снова.",
        shouldRedirect: true,
        redirectPath: "/login",
        redirectState: { from: "/" },
      };
    }
    if (status === 403 && code === "MAX_ORDERS_LIMIT_REACHED") {
      return {
        userMessage:
          "Достигнут лимит активных заказов. Свяжитесь с нами для увеличения лимита.",
        shouldRedirect: false,
      };
    }
    return {
      userMessage:
        message ||
        "Не удалось создать заказ. Пожалуйста, проверьте данные и попробуйте снова.",
      shouldRedirect: false,
    };
  }, []);

  const handleBook = useCallback(async () => {
    if (!canSubmit || isSubmitting) return;

    if (!isAuthenticated) {
      showInfoToast("Авторизуйтесь, чтобы оформить заказ.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isUserRole && !(isAdminOrManager && selectedClientUser)) {
      showErrorToast(
        "Создание заказа доступно только клиентам с ролью USER или менеджерам с выбранным клиентом."
      );
      return;
    }

    if (isUserRole && user) {
      const profileValidation = validateUserProfile(user);
      if (!profileValidation.isValid) {
        let errorMessage = profileValidation.message;
        if (
          profileValidation.phoneNotVerified &&
          profileValidation.missingFields.length === 0 &&
          profileValidation.invalidFields.length === 0
        ) {
          errorMessage =
            "Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.";
        }
        showErrorToast(errorMessage);
        setTimeout(() => {
          navigate("/personal-account", { state: { activeSection: "personal" } });
        }, 2000);
        return;
      }
    }

    if (!warehouseId) return;

    const startIso = startDate
      ? new Date(`${startDate}T12:00:00`).toISOString()
      : new Date().toISOString();

    try {
      setIsSubmitting(true);
      const payload = {
        warehouse_id: warehouseId,
        volume_m3: volumeM3,
        start_date: startIso,
        storage_days: days,
      };
      if (isAdminOrManager && selectedClientUser) {
        payload.user_id = selectedClientUser.id;
      }

      await createCameraStorageOrder(payload);

      toastOrderRequestSent();

      const redirectSection = isAdminOrManager ? "request" : "orders";
      const redirectState = { activeSection: redirectSection };
      if (redirectSection === "orders") redirectState.ordersFilter = "contract";

      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ["orders", "user"] });
        navigate("/personal-account", { state: redirectState });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании заказа камеры хранения:", error);
      const errorData = error.response?.data;
      const translated = translateCameraError(error, errorData);
      showErrorToast(translated.userMessage);
      if (translated.shouldRedirect && translated.redirectPath) {
        setTimeout(() => {
          navigate(translated.redirectPath, {
            state: translated.redirectState || {},
          });
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canSubmit,
    isSubmitting,
    isAuthenticated,
    isUserRole,
    isAdminOrManager,
    selectedClientUser,
    user,
    warehouseId,
    startDate,
    volumeM3,
    days,
    navigate,
    queryClient,
    translateCameraError,
  ]);

  const handleCallback = useCallback(() => {
    onCallbackClick?.();
  }, [onCallbackClick]);

  return (
    <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
      <LeftCapacityGuide volumeM3={volumeM3} />
      <RightLockerForm
        locations={warehouses.map((w) => ({
          id: w.id,
          label: w.name || `Склад #${w.id}`,
        }))}
        warehouseId={warehouseId}
        onWarehouseChange={setWarehouseId}
        volumeM3={volumeM3}
        onVolumeChange={setVolumeM3}
        startDate={startDate}
        onStartDateChange={setStartDate}
        startDateError={startDateError}
        minDateISO={todayISO}
        days={days}
        onDaysChange={setDays}
        daysError={daysError}
        endDateISO={endDateISO}
        totalPrice={totalPriceForSummary}
        priceLine={priceLine}
        onBook={handleBook}
        onCallback={handleCallback}
        canSubmit={
          canSubmit && !(isAdminOrManager && !selectedClientUser)
        }
        isSubmitting={isSubmitting}
        isPriceLoading={isPriceLoading}
        priceError={priceError}
        isAdminOrManager={isAdminOrManager}
        selectedClientUser={selectedClientUser}
        onOpenClientSelector={onOpenClientSelector}
      />
    </div>
  );
}
