import React from "react";

type Props = {
    warehouseId?: number;
};

const getAllVolumes = (tiers: any) => {
    const volumes = new Set<number>();
    Object.values(tiers ?? {}).forEach((tier: any) => {
        Object.keys(tier).forEach(v => volumes.add(Number(v)));
    });
    return Array.from(volumes).sort((a, b) => a - b);
};

export const StoragePricesMatrix: React.FC<Props> = ({prices}) => {

    return (
        <div className="space-y-6">
            {Object.entries(prices ?? {}).map(([whId, warehouse]) => {
                const volumesSet = Object.values(warehouse.services ?? {}).reduce((acc, tierObj) => {
                    Object.values(tierObj).forEach((vMap: any) => {
                        Object.keys(vMap).forEach(v => acc.add(Number(v)));
                    });
                    return acc;
                }, new Set<number>());
                const volumes = Array.from(volumesSet).sort((a,b) => a-b);

                return (
                    <div key={whId} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">{warehouse.name} (#{whId})</h2>

                        {Object.entries(warehouse.services ?? {}).map(([serviceType, tiers]) => (
                            <div key={serviceType} className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">{serviceType}</h3>
                                <div className="overflow-auto rounded-lg border border-gray-100">
                                    <table className="min-w-full text-sm text-gray-700">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 border-b border-gray-200 text-left">Ярус</th>
                                            {volumes.map(v => (
                                                <th key={v} className="p-3 border-b border-gray-200 text-right">{v} м²</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {Object.entries(tiers ?? {}).map(([tier, volumeMap]) => (
                                            <tr key={tier} className="hover:bg-gray-50">
                                                <td className="p-3 border-b border-gray-100 font-medium">{tier === 'no_tier' ? 'Без яруса' : `Tier ${tier}`}</td>
                                                {volumes.map(v => (
                                                    <td key={v} className="p-3 border-b border-gray-100 text-right">{volumeMap[String(v)] ?? '-'}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};