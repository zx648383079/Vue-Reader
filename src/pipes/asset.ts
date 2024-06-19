import { useAuth } from "../services";

export function assetsFilter(value?: string): string {
    if (!value) {
        return '';
    }
    return useAuth().assetUri(value) ?? '';
}
