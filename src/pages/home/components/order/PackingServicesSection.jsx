import React from 'react';
import { Package } from 'lucide-react';
import { Switch } from '../../../../components/ui';


export default function PackingServicesSection({
                                                   includePacking,
                                                   setIncludePacking,
                                               }) {
    return (
        <>
            {/* Услуги упаковки */}
            <div className="flex items-center justify-between mb-2 gap-3">
                <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-3xl px-4 py-3 bg-transparent h-12">
                    <span className="text-base font-medium text-[#373737]">Услуги упаковки</span>
                    <Package className="w-5 h-5 text-[#373737]" />
                </div>
                <Switch
                    checked={includePacking}
                    onCheckedChange={setIncludePacking}
                    className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                />
            </div>
        </>
    );
}