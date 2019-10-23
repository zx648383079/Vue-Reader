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
     * copyTop
     */
    public copyTop(box: Canvas, top: number) {
        this.context.drawImage(box.canvas, 0, top);
        return this;
    }

    public copyLeft(box: Canvas, left: number) {
        this.context.drawImage(box.canvas, left, 0);
        return this;
    }

    public clear() {
        this.context.clearRect(0, 0, this.width, this.height);
        return this;
    }
}
