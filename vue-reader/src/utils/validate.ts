
/**
 * 判断是否为空
 * @param val
 * @param ignoreWhitespace 忽略空白字符
 */
export function isEmpty(val: string, ignoreWhitespace = true) {
    return !val || (ignoreWhitespace ? val.trim().length : val.length) === 0;
}

/**
 * 判断是否是邮箱
 * @param val
 */
export function isEmail(val: string){
    return /^\w+?@\w+?\.\w+$/.test(val);
}

/**
 * 判断是否是手机号
 * @param val
 */
export function isMobile(val: string){
    return /^1[3456789]\d{9}$/.test(val);
}
