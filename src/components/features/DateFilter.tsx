"use client";

import { Input } from '@/components/ui/input';
import moment from 'moment';
import { useState } from 'react';

export default function DateFilter({ label, onChange }: { label: string, onChange?: any }) {
    const [value, setValue] = useState(moment().format('YYYY-MM-DD'));

    return (
        <div className="flex flex-row items-center gap-2">
            <h4>{label} :</h4>
            <Input
                type="date"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setValue(moment(e.target.value).format('YYYY-MM-DD'));
                    onChange(e);
                }}
                className="w-1/2"
            />
        </div>
    )
}