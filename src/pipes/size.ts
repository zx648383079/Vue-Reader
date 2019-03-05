export function sizeFilter(value: number): string {
    return value < 10000 ? value + '' : (Math.floor(value / 10000) + '万');
}
