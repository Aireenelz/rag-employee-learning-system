export const calculateChange = (current: number, previous: number): string => {
    const diff = current - previous;

    if (diff > 0) return `+${diff.toFixed(2)}`;
    if (diff < 0) return `${diff.toFixed(2)}`;
    return "0";
};

export const calculateChangeWholeNumber = (current: number, previous: number): string => {
    const diff = Math.round(current - previous);

    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return "0";
};

export const calculateChangePercentage = (current: number, previous: number): string => {
    if (previous === 0) {
        if (current === 0) return "0%";
        return `+${current * 100}%`;
    }

    const percentChange = ((current - previous) / previous) * 100;
    const rounded = Math.round(percentChange);

    if (rounded === 0) {
        return "0%";
    }

    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded}%`;
};