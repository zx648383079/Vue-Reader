import { formatTime, parseNumber } from '@/utils';

export function timeFilter(value: number|string|Date|undefined) {
    if (!value) {
        return;
    }
    if (value instanceof Date) {
        return formatTime(value);
    }
    if (typeof value === 'string' && !/^\d+$/.test(value)) {
        return value;
    }
    return formatTime(new Date((value.toString().length > 10 ? 1000 : 1) * parseNumber(value)));
}
