"use client"

import { useEffect } from "react";

export default function Error({ error }: { error: Error }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="p-4">
            <h2 className="text-red-600">Something went wrong!</h2>
            <p>{error.message}</p>
        </div>
    );
}
