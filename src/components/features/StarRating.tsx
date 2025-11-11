'use client';

import React, { useEffect, useState } from 'react';

const StarRating = ({ totalStars = 5, initialRating = 0, onRatingChange }) => {
    const [rating, setRating] = useState<number>(initialRating);
    const [hover, setHover] = useState<number>(0);

    const handleClick = (index: number) => {
        setRating(index + 1);

        if (onRatingChange) {
            onRatingChange(index + 1);
        }
    };

    useEffect(() => {
        setRating(initialRating)
    }, [initialRating]);

    return (
        <div className="p-0">
            {[...Array(totalStars)].map((_, index) => (
                <span
                    key={index}
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => setHover(index + 1)}
                    onMouseLeave={() => setHover(0)}
                    style={{
                        cursor: 'pointer',
                        color: index < (hover || rating) ? 'gold' : 'grey',
                        fontSize: '24px',
                    }}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

export default StarRating;