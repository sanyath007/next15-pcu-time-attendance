"use client";

import StarRating from "@/components/features/StarRating";
import { useState } from "react";

export default function Score({ value }) {
    const [score, setScore] = useState(0);

    return <StarRating initialRating={value} onRatingChange={(score: number) => setScore(score)}/>
}