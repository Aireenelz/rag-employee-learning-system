export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
    });
};