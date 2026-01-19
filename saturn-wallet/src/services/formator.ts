
export const getReadableAmount = (rawAmount: string | undefined, decimals: number): number => {
    if (!rawAmount) return 0;
    const raw = parseFloat(rawAmount);
    
    if (isNaN(raw)) return 0;
    
    return raw / Math.pow(10, decimals);
};

export const formatBalance = (amount: number, decimals? : number ): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals ? decimals : 6, 
    }).format(amount);
}