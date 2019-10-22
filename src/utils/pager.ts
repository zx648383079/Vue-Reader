import { Canvas } from './canvas';

export interface ILine {
    start: number,
    length: number
}

export interface IPageLine extends ILine {
    isNew: boolean
}

export interface IFont {
    x: number,
    y: number,
    code: string
}

export class Pager {

    /**
     * 提取行数据
     * @param text
     */
    public static getLines(text: string): ILine[] {
        if (!text || text.length < 1) {
            return [];
        }
        const lineChar = 10; // \n
        const lineChar2 = 14; // \r
        const whiteChar = 32; // 空格
        const whiteChar2 = 12288; // 中文空格
        const tabChar = 9;
        const lines: ILine[] = [];
        let start = -1;
        let isWhiteEnd = -1;
        let i = 0;
        let code: number;
        for (; i < text.length; i ++) {
            code = text.charCodeAt(i);
            if (start < 0 && (
                code === lineChar || code === lineChar2 || code === whiteChar || code === whiteChar2 || code === tabChar
                )) {
                // 判断新一行前几个字符是否为空白或换行字符，是则去掉
                continue;
            }
            if (start < 0) {
                start = i;
                continue;
            }
            if (code === lineChar || code === lineChar2) {
                // 根据换行符判断是否进入新的一行，结束则保存
                lines.push({
                    start,
                    length: (isWhiteEnd > 0 ? isWhiteEnd : i) - start,
                });
                isWhiteEnd = start = -1;
                continue;
            }
            if (code === whiteChar || code === whiteChar2 || code === tabChar) {
                // 判断行尾是否有空白字符，有则去掉
                if (isWhiteEnd < 0) {
                    isWhiteEnd = i;
                }
                continue;
            } else {
                isWhiteEnd = -1;
            }
        }
        // 最后做收尾
        if (start > 0) {
            lines.push({
                start,
                length: (isWhiteEnd > 0 ? isWhiteEnd : (i + 1)) - start,
            });
        }
        return lines;
    }

    public static drawCanvasWithFonts(
        context: CanvasRenderingContext2D, fonts: IFont[], font: string, color: string = '#000') {
        context.font = font;
        // 设置颜色
        context.fillStyle = color;
        // 设置水平对齐方式
        // context.textAlign = 'center';
        // 设置垂直对齐方式
        context.textBaseline = 'top';
        for (const item of fonts) {
            context.fillText(item.code, item.x, item.y);
        }
    }

    public static toHtmlWithFonts(fonts: IFont[], font: string, color: string = '#000'): string {
        let html = '';
        for (const item of fonts) {
            // html += '<span style="position: absolute;top: '
            //     + item.y + 'px;left: ' + item.x + 'px;font: '
            //     + font + ';color: ' + color + ';">' + item.code + '</span>';
            html += '<span style="position: absolute;top: '
                + item.y + 'px;left: ' + item.x + 'px;">' + item.code + '</span>';
        }
        return '<div style="position: relative;">' + html + '</div>';
    }

    /**
     * 一行可以转化成几段
     * @param line
     * @param count
     */
    public static toLineCount(line: ILine, count: number): number {
        return Math.ceil((line.length + 2) / count);
    }

    constructor(
        private text: string,
        public lines: ILine[] = Pager.getLines(text),
    ) {
    }

    /**
     * 画第几页的内容（必须先清空内容并绘制背景）
     * @param context
     * @param page 第几页
     * @param fontSize 字体大小
     * @param lineSpace 行间距
     * @param letterSpace 字间距
     * @param width 可写内容区域宽度
     * @param height 可写内容区域高度
     * @param left 可写内容区域起始左边距
     * @param top 可写内容区域起始顶边距
     * @param color 字体颜色
     * @param fontFamily 字体
     */
    public drawCanvas(
        context: CanvasRenderingContext2D | Canvas, page: number,
        fontSize: number, lineSpace: number, letterSpace: number,
        width: number, height: number, left: number = 0,
        top: number = 0, color: string = '#000', fontFamily: string = '微软雅黑'): void {
        Pager.drawCanvasWithFonts(context instanceof Canvas ? context.context : context,
            this.getOnePage(
                page, fontSize, lineSpace, letterSpace,
                width === 0 && context instanceof Canvas ? context.width - left * 2 : width,
                height === 0  && context instanceof Canvas ? context.height - top * 2 : height,
                left, top), fontSize + 'px ' + fontFamily, color);
    }

    public toHtml(
        page: number, fontSize: number,
        lineSpace: number, letterSpace: number, width: number,
        height: number, left: number = 0, top: number = 0,
        color: string = '#000', fontFamily: string = '微软雅黑'): string {
        return Pager.toHtmlWithFonts(
            this.getOnePage(
                page, fontSize, lineSpace, letterSpace,
                width, height, left, top),
                fontSize + 'px ' + fontFamily, color);
    }

    /**
     * 获取一页数据（包括每一个字及坐标位置）
     * @param page 第几页
     * @param fontSize 字体大小
     * @param lineSpace 行间距
     * @param letterSpace 字间距
     * @param width 可写内容区域宽度
     * @param height 可写内容区域高度
     * @param left 可写内容区域起始左边距
     * @param top 可写内容区域起始顶边距
     */
    public getOnePage(
        page: number, fontSize: number, lineSpace: number,
        letterSpace: number, width: number, height: number,
        left: number = 0, top: number = 0): IFont[] {
        const fontWidth = fontSize + letterSpace;
        const fontHeight = fontSize + lineSpace;
        const lineLength = Math.floor(width / fontWidth);
        const lineCount = Math.floor(height / fontHeight);
        const lines = this.getPageLines(page, lineLength, lineCount);
        const fonts: IFont[] = [];
        if (lines.length < 1) {
            return fonts;
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let index = 0; index < line.length; index++) {
                fonts.push({
                    code: this.text.charAt(line.start + index),
                    x: left + (index + (line.isNew ? 2 : 0)) * fontWidth,
                    y: top + i * fontHeight,
                });
            }
        }
        return fonts;
    }

    /**
     * 获取总页数
     * @param lineLength
     * @param lineCount
     */
    public getPageCount(lineLength: number, lineCount: number): number {
        return Math.ceil(this.getLineCount(lineLength) / lineCount);
    }

    /**
     * 根据尺寸获取页数
     * @param fontSize
     * @param lineSpace
     * @param letterSpace
     * @param width
     * @param height
     */
    public getPageCountWithSize(
        fontSize: number, lineSpace: number,
        letterSpace: number, width: number, height: number): number {
        const fontWidth = fontSize + letterSpace;
        const fontHeight = fontSize + lineSpace;
        const lineLength = Math.floor(width / fontWidth);
        const lineCount = Math.floor(height / fontHeight);
        return this.getPageCount(lineLength, lineCount);
    }

    public getLineCount(lineLength: number): number {
        let count = 0;
        for (const item of this.lines) {
            count += Pager.toLineCount(item, lineLength);
        }
        return count;
    }

    public getLineCountCountWithWidth(
        fontSize: number,
        letterSpace: number, width: number): number {
        const fontWidth = fontSize + letterSpace;
        const lineLength = Math.floor(width / fontWidth);
        return this.getLineCount(lineLength);
    }

    public getHeightWithWidth(
        fontSize: number, lineSpace: number,
        letterSpace: number, width: number): number {
        const fontHeight = fontSize + lineSpace;
        return this.getLineCountCountWithWidth(fontSize, letterSpace, width) * fontHeight;
    }

    /**
     * 获取一页的段数据
     */
    public getPageLines(page: number, lineLength: number, lineCount: number): IPageLine[] {
        const start = page > 1 ? (page - 1) * lineCount : 0;
        const end = start + lineCount;
        const lines: IPageLine[] = [];
        let index = 0;
        for (const item of this.lines) {
            const count = Pager.toLineCount(item, lineLength);
            if (index < end && index + count > start) {
                let i = Math.max(start - index, 0);
                const length = Math.min(count, end - index);
                for (; i < length; i++) {
                    const lineStart = i * lineLength - (i < 1 ? 0 : 2);
                    lines.push({
                        start: item.start + lineStart,
                        length: Math.min(lineLength - (i < 1 ? 2 : 0), item.length - i * lineLength + 2),
                        isNew: i < 1,
                    });

                }
            }
            index += count;
            if (index > end) {
                continue;
            }
        }
        return lines;
    }
}

