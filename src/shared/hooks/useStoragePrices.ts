import { useEffect, useState, useCallback } from "react";
import { warehouseApi } from "../../../src/shared/api/warehouseApi.js";

export const useStoragePrices = (warehouseId?: number) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPrices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await warehouseApi.getStoragePrices(warehouseId);
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [warehouseId]);

    useEffect(() => {
        fetchPrices();
    }, [fetchPrices]);

    return {
        prices: data,
        loading,
        refetch: fetchPrices,
    };
};