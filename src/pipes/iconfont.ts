export function iconfontFilter(value?: string) {
    if (!value) {
        return '';
    }
    if (value.indexOf(' ') >= 0) {
        value = value.split(' ')[1];
    }
    const map: any = {
        'fa-mail-bulk': 'icon-mail',
        'fa-rss': 'icon-share-alt',
    };
    return Object.prototype.hasOwnProperty.call(map, value) ? map[value] : value.replace('fa-', 'icon-');
}