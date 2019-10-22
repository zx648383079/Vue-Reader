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
    private _kind: FlipKind = FlipKind.Flip;
    private _fontSize: number = 18;
    private _lineSpace: number = 2;
    private _letterSpace: number = 2;
    private _margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    };
    private _color: string = '#000';
    private _fontFamily: string = '微软雅黑';
    private _pager!: Pager;
    private _canvas: Canvas;
    private _background: string | HTMLImageElement = '#f00';
    private _total: number = 0;
    private _page: number = 0;
    private _caches: {[page: number]: Canvas} = {};
    private _canRefresh = true;
    constructor(
        box: HTMLCanvasElement,
        width: number,
        height: number,
        public pageChangedEvent: (direct: FlipDirect, next: NextHandle) => void,
        public progressChangedEvent: (val: number) => void,
        public tapCenterEvent: () => void,
    ) {
        this._canvas = new Canvas(box, width, height);
        this.bindTouch();
        this.refresh();
    }

    public get width(): number {
        return this._canvas.width;
    }

    public get height(): number {
        return this._canvas.height;
    }

    public get innerWidth(): number {
        return this._canvas.width - this._margin.left  - this._margin.right;
    }

    public get innerHeight(): number {
        return this._canvas.height - this._margin.top  - this._margin.bottom;
    }

    public set background(val: string| HTMLImageElement) {
        if (this._background === val) {
            return;
        }
        this._background = val;
        if (!this._pager || this._total < 1) {
            return;
        }
        if (!this._canRefresh) {
            return;
        }
        if (this._kind === FlipKind.Scroll) {
            this._canvas.reset();
            this._canvas.clear();
            this._canvas.fill(this._background);
            this._canvas.copyTop(this.getCanvas(), 0);
            return;
        }
        this.restoreIfRefresh();
    }

    public set kind(val: FlipKind) {
        if (val === this._kind) {
            return;
        }
        const refresh = val === FlipKind.Scroll || this._kind === FlipKind.Scroll;
        this._kind = val;
        if (!refresh) {
            return;
        }
        this.restoreIfRefresh();
    }

    public set fontSize(val: number) {
        if (this._fontSize === val) {
            return;
        }
        this._fontSize = val;
        this.restoreIfRefresh();
    }

    public set color(val: string) {
        if (this._color === val) {
            return;
        }
        this._color = val;
        this.restoreIfRefresh();
    }

    public set fontFamily(val: string) {
        if (this._color === val) {
            return;
        }
        this._fontFamily = val;
        this.restoreIfRefresh();
    }

    public set lineSpace(val: number) {
        if (this._lineSpace === val) {
            return;
        }
        this._lineSpace = val;
        this.restoreIfRefresh();
    }

    public set letterSpace(val: number) {
        if (this._letterSpace === val) {
            return;
        }
        this._letterSpace = val;
        this.restoreIfRefresh();
    }

    public set margin(val: any) {
        if (typeof val !== 'object') {
            val = (val + '').split(' ').map((item) => {
                return typeof item === 'number' ? item : parseInt(item, 10);
            });
        }
        if (!Array.isArray(val)) {
            this._margin = Object.assign(this._margin, val);
            this.restoreIfRefresh();
            return;
        }
        if (val.length === 1) {
            this._margin = {
                top: val[0],
                right: val[0],
                bottom: val[0],
                left: val[0],
            };
        }
        if (val.length === 2) {
            this._margin = {
                top: val[0],
                right: val[1],
                bottom: val[0],
                left: val[1],
            };
        }
        if (val.length === 3) {
            this._margin = {
                top: val[0],
                right: val[1],
                bottom: val[2],
                left: val[1],
            };
        }
        if (val.length > 3) {
            this._margin = {
                top: val[0],
                right: val[1],
                bottom: val[2],
                left: val[3],
            };
        }
        this.restoreIfRefresh();
    }
    /**
     * 一次性设置多个属性最后刷新
     * @param cb 
     */
    public batchRefresh(cb: (viwer: this) => void) {
        this._canRefresh = false;
        cb(this);
        this._canRefresh = true;
        this.restoreIfRefresh();
    }

    /**
     * reset
     */
    public reset(width: number, height: number) {
        this._canvas.reset(width, height);
        this.restoreIfRefresh();
    }

    public setBackgroundImage(url: string) {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            this.background = img;
        }
    }

    /**
     * setContent
     */
    public setContent(text: string) {
        if (!text) {
            return;
        }
        this._pager = new Pager(text);
        this._page = 1;
        this.restoreIfRefresh();
    }

    /**
     * name
     */
    public setTotal(total: number) {
        if (this._total < 1) {
            this._total = total;
            return;
        }
        const old =  this._page / this._total;
        this._total = total;
        this._page = Math.floor(this._page * old);
        return;
    }

    /**
     * refresh
     */
    public refresh() {
        if (!this._pager) {
            this.pageChangedEvent(FlipDirect.Current, text => {
                this.setContent(text);
            });
            return;
        }
        this._canvas.reset();
        this._canvas.clear();
        if (this._kind === FlipKind.Scroll) {
            this._canvas.fill(this._background);
        }
        const innerWidth = this.innerWidth;
        const innerHeight = this.innerHeight;
        this.setTotal(
            this._pager.getPageCountWithSize(this._fontSize,
                this._lineSpace, this._letterSpace, innerWidth, innerHeight));
        this._canvas.copyTop(this.getCanvas(), 0);
    }

    /**
     * drawPage
     */
    public drawPage() {
        let top = 0;
        this._canvas.clear();
        if (this._kind === FlipKind.Scroll) {
            top = this._page;
            this._canvas.fill(this._background);
        }
        this._canvas.copyTop(this.getCanvas(), top);
    }

    public moveToNext() {
        if (this._page >= this._total) {
            this.pageChangedEvent(FlipDirect.Next, text => {
                this.setContent(text);
            });
            return;
        }
        this._page += this._kind === FlipKind.Scroll ? 20 - this.height : 1;
        this.drawPage();
    }

    /**
     * moveToPrevious
     */
    public moveToPrevious() {
        if (this._page <= 1) {
            this.pageChangedEvent(FlipDirect.Prevous, text => {
                this.setContent(text);
            });
            return;
        }
        this._page -= this._kind === FlipKind.Scroll ? 20 - this.height : 1;
        this.drawPage();
    }

    private bindTouch() {
        let hasMove = false;
        let startX = 0;
        let startY = 0;
        let isNext: boolean | undefined;
        this._canvas.canvas.addEventListener('touchstart', e => {
            hasMove = false;
            startX = e.targetTouches[0].clientX;
            startY = e.targetTouches[0].clientY;
            isNext = undefined;
        });
        this._canvas.canvas.addEventListener('touchmove', e => {
            hasMove = true;
            const diffY = e.targetTouches[0].clientY - startY;
            if (this._kind === FlipKind.Scroll) {
                this._canvas.clear();
                this._canvas.fill(this._background);
                this._canvas.copyTop(this.getCanvas(), this._page += diffY);  startY += diffY;
                return;
            }
            const diffX = e.targetTouches[0].clientX - startX;
            if (typeof isNext !== 'boolean') {
                isNext = diffX < 0;
            }
            if (this._kind === FlipKind.Flip) {
                this._canvas.clear();
                this._canvas.copyTop(this.getCanvas(this._page + 1), 0);
                this._canvas.drawShandow(20, 0, '#666', 20);
                this._canvas.copyLeft(this.getCanvas(), diffX);
            }
            
        });
        this._canvas.canvas.addEventListener('touchend', e => {
            if (!hasMove) {
                this.tapIfClick(startX, startY);
                return;
            }
            if (this._kind === FlipKind.Scroll) {
                return;
            }
            // e.changedTouches[0].clientX
        });
        this.onMouseScroll(e => {
            if (this._kind === FlipKind.Scroll) {
                this._canvas.clear();
                this._canvas.fill(this._background);
                this._canvas.copyTop(this.getCanvas(), this._page -= e.deltaY);
            }
        });
    }

    private onMouseScroll(cb: (e: any) => void) {
        if (document.addEventListener) {// firefox
            document.addEventListener('DOMMouseScroll', cb, false);
        }
        // Safari与Chrome属于同一类型
        window.onmousewheel = cb;
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
        const blockX = this._canvas.width / 3;
        const blockY = this._canvas.height / 3;
        if (x > blockX && x < blockX * 2 && y > blockY && y < blockY * 2) {
            return 0;
        }
        if (this._kind === FlipKind.Scroll) {
            const centerY = this._canvas.height / 2;
            return y < centerY ? -1 : 1;
        }
        const centerX = this._canvas.width / 2;
        return x < centerX ? -1 : 1;
    }

    private getCanvas(
        page: number = this._page,
        width: number = this.width, height: number = this.height): Canvas {
        if (page < 1 || this._kind === FlipKind.Scroll) {
            page = 1;
        }
        if (this._caches.hasOwnProperty(page)) {
            return this._caches[page];
        }
        const innerWidth = width - this._margin.left - this._margin.right;
        if (this._kind === FlipKind.Scroll) {
            this._total = height =
            this._pager.getHeightWithWidth(this._fontSize, this._lineSpace, this._letterSpace, innerWidth)
            + 50 +  this._margin.top + this._margin.bottom;
        }
        const box = Canvas.create(width, height);
        if (this._kind !== FlipKind.Scroll) {
            box.fill(this._background);
        }
        this._pager.drawCanvas(box, page, this._fontSize, this._lineSpace,
            this._letterSpace,
            innerWidth,
            height - this._margin.top - this._margin.bottom,
            this._margin.left, this._margin.top, this._color, this._fontFamily);
        return this._caches[page] = box;
    }

    private restoreCache() {
        this._caches = {};
        return this;
    }

    private restoreIfRefresh() {
        if (!this._canRefresh) {
            return;
        }
        this.restoreCache();
        this.refresh();
    }



}
