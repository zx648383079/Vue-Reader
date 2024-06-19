export class CookieService {

    private readonly documentIsAccessible = true;
    private document = window.document;

    /**
    * @param name Cookie name
    * @returns boolean - whether cookie with specified name exists
    */
    public check(name: string): boolean {
        if (!this.documentIsAccessible) {
            return false;
        }

        name = encodeURIComponent(name);

        const regExp: RegExp = this.getCookieRegExp(name);
        const exists: boolean = regExp.test(this.document.cookie);

        return exists;
    }

    /**
    * @param name Cookie name
    * @returns property value
    */
    public get(name: string): string {
        if (this.documentIsAccessible && this.check(name)) {
            name = encodeURIComponent(name);

            const regExp: RegExp = this.getCookieRegExp(name);
            const result: RegExpExecArray = regExp.exec(this.document.cookie)!;

            return this.safeDecodeURIComponent(result[1]);
        } else {
            return '';
        }
    }

    /**
    * @returns all the cookies in json
    */
    public getAll(): { [key: string]: string } {
        if (!this.documentIsAccessible) {
            return {};
        }

        const cookies: { [key: string]: string } = {};
        const document: any = this.document;

        if (document.cookie && document.cookie !== '') {
            document.cookie.split(';').forEach((currentCookie: string) => {
                const [cookieName, cookieValue] = currentCookie.split('=');
                cookies[this.safeDecodeURIComponent(cookieName.replace(/^ /, ''))] = this.safeDecodeURIComponent(cookieValue);
            });
        }

        return cookies;
    }

    /**
    * @param name     Cookie name
    * @param value    Cookie value
    * @param expires  Number of days until the cookies expires or an actual `Date`
    * @param path     Cookie path
    * @param domain   Cookie domain
    * @param secure   Secure flag
    * @param sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
    */
    public set(name: string, value: string, expires?: number | Date, path?: string, domain?: string, secure?: boolean, sameSite?: 'Lax' | 'None' | 'Strict'): void;

    /**
    * Cookie's parameters:
    * <pre>
    * expires  Number of days until the cookies expires or an actual `Date`
    * path     Cookie path
    * domain   Cookie domain
    * secure   Secure flag
    * sameSite OWASP samesite token `Lax`, `None`, or `Strict`. Defaults to `Lax`
    * </pre>
    * @param name     Cookie name
    * @param value    Cookie value
    * @param options  Body with cookie's params
    */
    public set(
        name: string,
        value: string,
        options?: {
        expires?: number | Date;
        path?: string;
        domain?: string;
        secure?: boolean;
        sameSite?: 'Lax' | 'None' | 'Strict';
        }
    ): void;

    public set(
        name: string,
        value: string,
        expiresOrOptions?: number | Date | any,
        path?: string,
        domain?: string,
        secure?: boolean,
        sameSite?: 'Lax' | 'None' | 'Strict'
    ): void {
        if (!this.documentIsAccessible) {
            return;
        }

        if (typeof expiresOrOptions === 'number' || expiresOrOptions instanceof Date || path || domain || secure || sameSite) {
            const optionsBody = {
                expires: expiresOrOptions,
                path,
                domain,
                secure,
                sameSite: sameSite ? sameSite : 'Lax',
            };

            this.set(name, value, optionsBody);
            return;
        }

        let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

        const options = expiresOrOptions ? expiresOrOptions : {};

        if (options.expires) {
            if (typeof options.expires === 'number') {
                const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);

                cookieString += 'expires=' + dateExpires.toUTCString() + ';';
            } else {
                cookieString += 'expires=' + options.expires.toUTCString() + ';';
            }
        }

        if (options.path) {
            cookieString += 'path=' + options.path + ';';
        }

        if (options.domain) {
            cookieString += 'domain=' + options.domain + ';';
        }

        if (options.secure === false && options.sameSite === 'None') {
            options.secure = true;
            console.warn(
                `[cookie-service] Cookie ${name} was forced with secure flag because sameSite=None.` +
                `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
            );
        }
        if (options.secure) {
            cookieString += 'secure;';
        }

        if (!options.sameSite) {
            options.sameSite = 'Lax';
        }

        cookieString += 'sameSite=' + options.sameSite + ';';

        this.document.cookie = cookieString;
    }

    /**
    * @param name   Cookie name
    * @param path   Cookie path
    * @param domain Cookie domain
    */
    public delete(name: string, path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
        if (!this.documentIsAccessible) {
            return;
        }
        const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
        this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
    }

    /**
    * @param path   Cookie path
    * @param domain Cookie domain
    */
    public deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
        if (!this.documentIsAccessible) {
        return;
        }

        const cookies: any = this.getAll();

        for (const cookieName in cookies) {
            if (Object.prototype.hasOwnProperty.call(cookies, cookieName)) {
                this.delete(cookieName, path, domain, secure, sameSite);
            }
        }
    }

    /**
    * @param name Cookie name
    * @returns property RegExp
    */
    private getCookieRegExp(name: string): RegExp {
        // eslint-disable-next-line no-useless-escape
        const escapedName: string = name.replace(/([\[\]\{\}\(\)\|\=\;\+\?\,\.\*\^\$])/gi, '\\$1');

        return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
    }

    private safeDecodeURIComponent(encodedURIComponent: string): string {
        try {
            return decodeURIComponent(encodedURIComponent);
        } catch {
            // probably it is not uri encoded. return as is
            return encodedURIComponent;
        }
    }
}
