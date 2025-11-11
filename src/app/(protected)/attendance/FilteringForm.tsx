"use client";

import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import DateFilter from "@/components/features/DateFilter";

export default function FilteringForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (newDate) {
            params.set('date', moment(newDate).format('YYYY-MM-DD'));
        } else {
            params.delete('date');
        }

        router.replace(`?${params.toString()}`)
    }
    return (
        <form>
            <DateFilter
                label="ประจำวันที่"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilter(e)}
            />
        </form>
    )
}