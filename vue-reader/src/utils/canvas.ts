export class Canvas {
    public static create(width: number, height: number) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return new Canvas(canvas, width, height);
    }
    public context: CanvasRenderingContext2D;
    constructor(
        public canvas: HTMLCanvasElement,
        public width: number,
        public height: number,
    ) {
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.reset();
    }

    /**
     * reset
     */
    public reset(width: number = this.width, height: number = this.height) {
        this.height = height;
        this.width = width;
        this.canvas.width = width;
        this.canvas.height = height;
        return this;
    }

    public fill(color: string | HTMLImageElement) {
        if (typeof color === 'string') {
            this.context.fillStyle = color;
            this.context.fillRect(0, 0, this.width, this.height);
        } else {
            this.context.drawImage(color, 0, 0);
        }
        return this;
    }

    /**
     * rect
     */
    public rect(x: number, y: number, width: number, height: number, color?: string) {
        if (color) {
            this.context.fillStyle = color;
        }
        this.context.fillRect(x, y, width, height);
    }

    public dot(x: number, y: number, size: number = 2, color?: string) {
        this.context.beginPath();
        this.context.arc(x, y, 2, 0, 2 * Math.PI);
        if (color) {
            this.context.fillStyle = color;
        }
        this.context.fill();
        return this;
    }

    /**
     * text
     */
    public text(text: string, x: number, y: number, color?: string, size?: number, font?: string) {
        if (font || size) {
            if (size) {
                font = size + 'px ' + font;
            }
            this.context.font = font as string;
        }
        // 设置颜色
        if (color) {
            this.context.fillStyle = color;
        }
        // 设置水平对齐方式
        // context.textAlign = 'center';
        // 设置垂直对齐方式
        // context.textBaseline = 'top';
        this.context.fillText(text, x, y);
    }

    /**
     * 加阴影
     * @param x
     * @param y
     * @param color
     * @param blur 模糊i系数
     */
    public drawShandow(x: number, y: number, color: string, blur: number) {
        this.context.shadowOffsetX = x;
        this.context.shadowOffsetY = y;
        this.context.shadowColor = color;
        this.context.shadowBlur = blur;
    }

    /**
     * save
     */
    public save(cb?: (ctx: CanvasRenderingContext2D) => void) {
        this.context.save();
        if (cb) {
            cb(this.context);
            this.context.restore();
        }
        return this;
    }

    public drawLine(
        cb: (ctx: CanvasRenderingContext2D) => void,
        width: number = 1, color: string = '#000', close: boolean = false) {
        this.context.beginPath();
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        cb(this.context);
        if (close) {
            this.context.closePath();
        }
        this.context.stroke();
        return this;
    }

    /**
     * drawPath
     */
    public drawPath(
        cb: (ctx: CanvasRenderingContext2D) => void, close: boolean = false) {
        this.context.beginPath();
        cb(this.context);
        if (close) {
            this.context.closePath();
        }
        return this;
    }

    /**
     * copy
     */
    public copy(box: Canvas, left: number = 0, top: number = 0) {
        this.context.drawImage(box.canvas, left, top);
        return this;
    }

    /**
     * copyTop
     */
    public copyTop(box: Canvas, top: number) {
        return this.copy(box, 0, top);
    }

    public copyLeft(box: Canvas, left: number) {
        return this.copy(box, left, 0);
    }

    public clear() {
        this.context.clearRect(0, 0, this.width, this.height);
        return this;
    }
}
