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
     * copyTop
     */
    public copyTop(box: Canvas, top: number) {
        this.context.drawImage(box.canvas, 0, top);
        return this;
    }

    public clear() {
        this.context.clearRect(0, 0, this.width, this.height);
        return this;
    }
}
