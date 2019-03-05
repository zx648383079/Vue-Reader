import { assetUri } from '../utils'
export function assetsFilter(value: string) {
    if (!value) {
        return null;
    }
    if (value.indexOf('//') >= 0) {
        return value;
    }
    if (value.startsWith('/')) {
        return assetUri + value;
    }
    return assetUri + '/' + value;
}
