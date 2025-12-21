export const calculateChange = (current: number, previous: number): string => {
    const diff = current - previous;

    if (diff > 0) return `+${diff.toFixed(2)} from last period`;
    if (diff < 0) return `${diff.toFixed(2)} from last period`;
    return "0 from last period";
};

export const calculateChangeWholeNumber = (current: number, previous: number): string => {
    const diff = Math.round(current - previous);

    if (diff > 0) return `+${diff} from last period`;
    if (diff < 0) return `${diff} from last period`;
    return "0 from last period";
};

export const calculateChangePercentage = (current: number, previous: number): string => {
    if (previous === 0) {
        if (current === 0) return "0% from last period";
        return `+ ${current * 100}% from last period`;
    }

    const percentChange = ((current - previous) / previous) * 100;
    const rounded = Math.round(Math.abs(percentChange))
    const sign = percentChange > 0 ? "+" : percentChange < 0 ? "-" : "";

    return `${sign}${rounded}% from last period`;
};