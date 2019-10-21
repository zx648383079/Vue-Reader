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
    public total: number = 0;
    public page: number = 0;
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
        this.page = 1;
        this.refresh();
    }

    /**
     * name
     */
    public setTotal(total: number) {
        if (this.total < 1) {
            this.total = total;
            return;
        }
        const old =  this.page / this.total;
        this.total = total;
        this.page = Math.floor(this.page * old);
        return;
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
        const innerWidth = this.canvas.width - this.left * 2;
        const innerHeight = this.canvas.height - this.top * 2;
        this.setTotal(
            this.pager.getPageCountWithSize(this.fontSize, this.lineSpace, this.letterSpace, innerWidth, innerHeight));
        this.pager.drawCanvas(this.current, this.page, this.fontSize, this.lineSpace,
            this.letterSpace, innerWidth, innerHeight,
            this.left, this.top, this.color, this.fontFamily);
        this.canvas.copyTop(this.current, 0);
    }

    /**
     * drawPage
     */
    public drawPage() {
        this.canvas.clear();
        this.canvas.fill(this.background);
        this.current.clear();
        this.pager.drawCanvas(this.current, this.page, this.fontSize, this.lineSpace,
            this.letterSpace, 0, 0,
            this.left, this.top, this.color, this.fontFamily);
        this.canvas.copyTop(this.current, 0);
    }

    public moveToNext() {
        if (this.page >= this.total) {
            this.pageChangedEvent(FlipDirect.Next, text => {
                this.setContent(text);
            });
            return;
        }
        this.page ++;
        this.drawPage();
    }

    /**
     * moveToPrevious
     */
    public moveToPrevious() {
        if (this.page <= 1) {
            this.pageChangedEvent(FlipDirect.Prevous, text => {
                this.setContent(text);
            });
            return;
        }
        this.page --;
        this.drawPage();
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
        const direct = this.getTapedDirect(x, y);
        if (direct === 0) {
            this.tapCenterEvent();
            return;
        }
        if (direct === 1) {
            this.moveToNext();
            return;
        }
        this.moveToPrevious();
    }

    /**
     * 
     * @param x 
     * @param y 
     */
    private getTapedDirect(x: number, y: number): -1 | 0 | 1 {
        const blockX = this.canvas.width / 3;
        const blockY = this.canvas.height / 3;
        if (x > blockX && x < blockX * 2 && y > blockY && y < blockY * 2) {
            return 0;
        }
        if (this.kind === FlipKind.Scroll) {
            const centerY = this.canvas.height / 2;
            return y < centerY ? -1 : 1;
        }
        const centerX = this.canvas.width / 2;
        return x < centerX ? -1 : 1;
    }




}
