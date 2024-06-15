export function sizeFilter(value: number): string {
    if (!value) {
        return '0';
    }
    return value < 10000 ? value + '' : (Math.floor(value / 10000) + '万');
}
