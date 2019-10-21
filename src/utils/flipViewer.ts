import { Pager } from './pager';
import { Canvas } from './canvas';

export enum FlipKind {
    None,
    Flip,
    Real,
    Scroll,
}

export enum FlipDirect {
    Prevous,
    Current,
    Next,
}

type NextHandle = (content: string) => void

export class FlipViewer {
    public kind: FlipKind = FlipKind.None;
    public fontSize: number = 18;
    public lineSpace: number = 2;
    public letterSpace: number = 2;
    public left: number = 0;
    public top: number = 0;
    public color: string = '#000';
    public fontFamily: string = '微软雅黑';
    public pager!: Pager;
    public canvas: Canvas;
    public background: string | HTMLImageElement = '#f00';
    private current!: Canvas;
    constructor(
        box: HTMLCanvasElement,
        width: number,
        height: number,
        public pageChangedEvent: (direct: FlipDirect, next: NextHandle) => void,
        public progressChangedEvent: (val: number) => void,
        public tapCenterEvent: () => void,
    ) {
        this.canvas = new Canvas(box, width, height);
        this.bindTouch();
        this.refresh();
    }

    public setBackgroundImage(url: string) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            this.background = img;
            this.refresh();
        }
    }

    /**
     * setContent
     */
    public setContent(text: string) {
        if (!text) {
            return;
        }
        this.pager = new Pager(text);
        this.refresh();
    }

    /**
     * refresh
     */
    public refresh() {
        if (!this.pager) {
            this.pageChangedEvent(FlipDirect.Current, text => {
                this.setContent(text);
            });
            return;
        }
        this.canvas.reset();
        this.canvas.clear();
        this.canvas.fill(this.background);
        this.current = Canvas.create(this.canvas.width, this.canvas.height);
        this.pager.drawCanvas(this.current, 0, this.fontSize, this.lineSpace,
             this.letterSpace, 0, 0,
             this.left, this.top, this.color, this.fontFamily);
        this.canvas.copyTop(this.current, 0);
    }

    private bindTouch() {
        let hasMove = false;
        let startX = 0;
        let startY = 0;
        this.canvas.canvas.addEventListener('touchstart', e => {
            hasMove = false;
            startX = e.targetTouches[0].clientX;
            startY = e.targetTouches[0].clientY;
        });
        this.canvas.canvas.addEventListener('touchmove', e => {
            hasMove = true;
            // e.targetTouches[0].clientX;
        });
        this.canvas.canvas.addEventListener('touchend', e => {
            if (!hasMove) {
                this.tapIfClick(startX, startY);
                return;
            }
            // e.changedTouches[0].clientX
        });
    }

    private tapIfClick(x: number, y: number) {
        const centerX = this.canvas.width / 2;
        if (Math.abs(centerX  - x) < 50 && Math.abs(this.canvas.height / 2 - y) < 50) {
            // 点击中间，触发设置
            this.tapCenterEvent();
            return;
        }
        if (centerX > x) {
            // 上一页
            return;
        }
    }




}
