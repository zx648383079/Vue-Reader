export function sizeFilter(value?: number): string {
    if (!value) {
        return '-';
    }
    return value < 10000 ? value + '' : (Math.floor(value / 10000) + '万');
}
