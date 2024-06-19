export function statusFilter(value?: number) {
    return value && value > 0 ? '完本' : '连载';
}
