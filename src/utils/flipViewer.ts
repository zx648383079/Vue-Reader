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

interface IPoint {
    x: number,
    y: number,
}

type NextHandle = (content: string) => void

export class FlipViewer {
    private _kind: FlipKind = FlipKind.Real;
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
    private _isLast = false; // 当前翻页到上一张时需要翻到最后一页
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
            this.draw(cas => {
                cas.fill(this._background);
                cas.copyTop(this.getCanvas(), 0);
            });
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

    public set progress(val: number) {
        this._page = Math.max(val * this._total / 100, 1);
        if (!this._canRefresh) {
            return;
        }
        this.drawPage();
    }

    public get progress(): number {
        return Math.max(Math.min(this._page * 100 / this._total, 100), 0);
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
     * 请设置空的清除到最后一页的设置
     * setContent
     */
    public setContent(text?: string) {
        if (!text) {
            this._isLast = false;
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
        const old =  this.progress;
        this._total = total;
        this._page = Math.ceil(this._page * old / 100);
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
        this.draw(cas => {
            if (this._kind === FlipKind.Scroll) {
                cas.fill(this._background);
            }
            const innerWidth = this.innerWidth;
            const innerHeight = this.innerHeight;
            this.setTotal(
                this._pager.getPageCountWithSize(this._fontSize,
                    this._lineSpace, this._letterSpace, innerWidth, innerHeight));
            if (this._isLast && this._kind !== FlipKind.Scroll) {
                this._page = this._total;
            }
            this._isLast = false;
            cas.copyTop(this.getCanvas(), 0);
        });
    }

    /**
     * drawPage
     */
    public drawPage() {
        let top = 0;
        this.draw(cas => {
            if (this._kind === FlipKind.Scroll) {
                top = -this._page;
                cas.fill(this._background);
            }
            cas.copyTop(this.getCanvas(), top);
        });
        this.notifyProgress();
    }
    /**
     * 移动到下一页
     * @param hasTween 是否需要补间动画
     */
    public moveToNext(hasTween = true, startX?: number) {
        if (this._page >= this._total) {
            this.pageChangedEvent(FlipDirect.Next, text => {
                this.setContent(text);
            });
            return;
        }
        if (this._kind === FlipKind.Scroll) {
            this._page -= 20 - this.height;
            this.drawPage();
            return;
        }
        this._page += 1;
        if (this._kind === FlipKind.None || !hasTween) {
            this.drawPage();
            return;
        }
        this.animation(startX || 0, -this.width - 20, i => {
            if (this._kind === FlipKind.Flip) {
                this.drawFlipView(this.getCanvas(this._page - 1), this.getCanvas(), i);
                return;
            }
            this.drawRealView(
                this.getCanvas(this._page - 1), this.getCanvas(),
                this.point(this.width + i, 0), 0);
        }, () => {
            this.drawPage();
        });
    }

    /**
     * 移动到上一页
     * @param hasTween 是否需要补间动画
     */
    public moveToPrevious(hasTween = true, startX?: number) {
        if (this._page <= 1) {
            this.drawPage();
            this._isLast = true;
            this.pageChangedEvent(FlipDirect.Prevous, text => {
                this.setContent(text);
            });
            return;
        }
        if (this._kind === FlipKind.Scroll) {
            this._page += 20 - this.height;
            this.drawPage();
            return;
        }
        this._page -= 1;
        if (this._kind === FlipKind.None || !hasTween) {
            this.drawPage();
            return;
        }
        this.animation(startX || (-this.width - 20), 0, i => {
            if (this._kind === FlipKind.Flip) {
                this.drawFlipView(this.getCanvas(), this.getCanvas(this._page + 1), i);
                return;
            }
            this.drawRealView(
                this.getCanvas(), this.getCanvas(this._page + 1),
                this.point(this.width + i, 0), 0);
        }, () => {
            this.drawPage();
        });
    }

    private bindTouch() {
        let hasMove = false;
        let startX = 0;
        let startY = 0;
        let isNext: boolean | undefined;
        let prev: IPoint | undefined;
        let prevDeg = 0;
        let canScollPage = false; // 滚动模式下当前页面到顶或到底，继续则换页
        this._canvas.canvas.addEventListener('touchstart', e => {
            hasMove = false;
            startX = e.targetTouches[0].clientX;
            startY = e.targetTouches[0].clientY;
            isNext = undefined;
            prev = undefined;
            canScollPage = this._kind === FlipKind.Scroll && (this._page < 0 || this._page > this._total - this.height);
        });
        this._canvas.canvas.addEventListener('touchmove', e => {
            hasMove = true;
            if (this._kind === FlipKind.None) {
                return;
            }
            const diffY = e.targetTouches[0].clientY - startY;
            if (this._kind === FlipKind.Scroll) {
                if (canScollPage) {
                    if (diffY > 0 && this._page < 0) {
                        this.moveToPrevious();
                    } else if (this._page > this._total - this.height && diffY < 0) {
                        this.moveToNext();
                    }
                }
                this.drawScollView(diffY);
                startY += diffY;
                return;
            }
            if (!prev) {
                prev = this.point(startX, startY);
            }
            const curr = this.point(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
            const diffX = e.targetTouches[0].clientX - startX;
            if (typeof isNext !== 'boolean') {
                isNext = diffX < 0;
            } else if (
                (isNext && diffX > 0)
                || (!isNext && diffX < 0)
            ) {
                return;
            }
            if (Math.abs(diffX) > this.width) {
                // isNext ? this.moveToNext(false) : this.moveToPrevious(false);
                return;
            }
            let deg = this.getAngle(prev, curr);
            if (Math.abs(deg - prevDeg) > 20) {
                deg = deg > prevDeg ? prevDeg + 20 : (prevDeg - 20);
            }
            prevDeg = deg;
            if (isNext) {
                if (this._kind === FlipKind.Flip) {
                    this.drawFlipView(this.getCanvas(), this.getCanvas(this._page + 1), diffX);
                    return;
                }
                this.drawRealView(this.getCanvas(), this.getCanvas(this._page + 1), curr, deg);
                prev = curr;
                return;
            }
            if (this._kind === FlipKind.Flip) {
                this.drawFlipView(this.getCanvas(this._page - 1), this.getCanvas(), diffX - this.width);
                return;
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
            if (typeof isNext !== 'boolean') {
                return;
            }
            const diffX = e.changedTouches[0].clientX - startX;
            if (
                (isNext && diffX > 0)
                || (!isNext && diffX < 0)
            ) {
                return;
            }
            if (isNext) {
                this.moveToNext(true, diffX);
                return;
            }
            this.moveToPrevious(true, diffX - this.width);
        });
        this.onMouseScroll(e => {
            if (this._kind === FlipKind.Scroll) {
                if (this._page < 0) {
                    return;
                }
                this.drawScollView(- e.deltaY);
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

    private notifyProgress() {
        this.progressChangedEvent(this.progress);
    }

    private drawScollView(diffY: number) {
        if (this._page < 0) {
            return;
        } else if (this._page + this.height > this._total) {
            return;
        }
        this.draw(cas => {
            cas.fill(this._background);
            cas.copyTop(this.getCanvas(), -(this._page -= diffY));
        });
        this.notifyProgress();
    }

    /**
     * 画flip 模式下的一幕
     * @param over 上面的页
     * @param down 背景页
     * @param left 上面页位置
     */
    private drawFlipView(over: Canvas, down: Canvas, left: number) {
        this.draw(cas => {
            cas.clear();
            cas.copyTop(down, 0);
            cas.drawShandow(20, 0, '#666', 20);
            cas.copyLeft(over, left);
        });
    }

    /**
     * 画仿真翻页
     * @param over 上面的页
     * @param down 背景页
     * @param current 当前点
     * @param previous 上一点
     */
    private drawRealView(over: Canvas, down: Canvas, current: IPoint, deg: number) {
        /**             a         j
         *                  k
         *             b      i  h
         *                  g
         *       d
         *     c       e          f
         * a-b~d~c-e-f-h-j~i~k-a
         */
        const a = this.point(current.x, current.y);
        const f = this.point(this.width, this.height);
        if (deg === 0) {
            a.y = this.height - 1;
        } else if (deg < 0) {
            f.y = 0;
        }
        let g: IPoint = this.point(0, 0);
        let e: IPoint = this.point(0, 0);
        let h: IPoint = this.point(0, 0);
        let c: IPoint = this.point(0, 0);
        const compute = () => {
            g = this.point((a.x + f.x) / 2, (a.y + f.y) / 2);
            e = this.point(g.x - (f.y - g.y) * (f.y - g.y) / (f.x - g.x), f.y);
            h = this.point(f.x, g.y - (f.x - g.x) * (f.x - g.x) / (f.y - g.y));
            c = this.point(e.x - (f.x - e.x) / 2, f.y);
        }
        compute();
        if (c.x < 0) {
            const w0 = this.width - c.x;
            const w1 = Math.abs(f.x - a.x);
            const w2 = this.width * w1 / w0;
            a.x = Math.abs(f.x - this.width * w1 / w0);

            const h1 = Math.abs(f.y - a.y);
            const h2 = w2 * h1 / w1;
            a.y = Math.abs(f.y - h2);
            compute();
        }
        const j = this.point(f.x, h.y - (f.y - h.y) / 2);
        const b = this.getIntersectionPoint(a, e, c, j);
        const k = this.getIntersectionPoint(a, h, c, j);
        const d = this.point((c.x + 2 * e.x + b.x) / 4, (2 * e.y + c.y + b.y) / 4);
        const i = this.point((j.x + 2 * h.x + k.x) / 4, (2 * h.y + j.y + k.y) / 4);
        // 计算d点到ae的距离
        const lA = a.y - e.y;
        const lB = e.x - a.x;
        const lC = a.x * e.y - e.x * a.y;
        const lPathAShadowDis = Math.abs((lA * d.x + lB * d.y + lC) / Math.hypot(lA, lB));

        // 计算i点到ah的距离
        const rA = a.y - h.y;
        const rB = h.x - a.x;
        const rC = a.x * h.y - h.x * a.y;
        const rPathAShadowDis = Math.abs((rA * i.x + rB * i.y + rC) /  Math.hypot(rA, rB));
        const drawCallback = (canvas: Canvas) => {
            canvas.drawPath(ctx => {
                ctx.moveTo(0, 0);
                if (deg >= 0) {
                    ctx.lineTo(0, this.height);
                }
                ctx.lineTo(c.x, c.y); // 移动到c点
                ctx.quadraticCurveTo(e.x, e.y, b.x, b.y); // 从c到b画贝塞尔曲线，控制点为e
                ctx.lineTo(a.x, a.y); // 移动到a点
                ctx.lineTo(k.x, k.y); // 移动到k点
                ctx.quadraticCurveTo(h.x, h.y, j.x, j.y); // 从k到j画贝塞尔曲线，控制点为h
                if (deg < 0) {
                    ctx.lineTo(this.width, this.height);
                    ctx.lineTo(0, this.height);
                } else {
                    ctx.lineTo(this.width, 0); // 移动到左上角
                }
            }, true);
        };
        // 绘制A区域内容
        const ABox = this.createCanvas();
        ABox.save(ctx => {
            drawCallback(ABox);
            ctx.clip();
            ABox.copyTop(over, 0);
        });
        // 绘制c的区域
        const CBox = this.createCanvas();
        CBox.save(ctx => {
            ctx.fillStyle = '#000';
            drawCallback(CBox);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-out';
            ctx.fillStyle = '#f00';
            CBox.drawPath(() => {
                ctx.moveTo(i.x, i.y); // 移动到i点
                ctx.lineTo(d.x, d.y); // 移动到d点
                ctx.quadraticCurveTo(d.x, d.y, b.x, b.y); // 移动到b点
                ctx.lineTo(a.x, a.y); // 移动到a点
                ctx.quadraticCurveTo(k.x, k.y, i.x, i.y); // 移动到k点
            })
            ctx.fill();
        });
        // this.draw((cas, ctx) => {
        //     ctx.scale(-1, 1);
        //     ctx.rotate(90 - deg);
        //     cas.copyLeft(ABox, - this.width);
        // });
        this.draw(cas => {
            cas.copyTop(down, 0);
            cas.copyTop(ABox, 0);
            cas.drawShandow(0, 0, '#666', 20);
            cas.copyTop(CBox, 0);
        });
    }

    private getAngle(a: IPoint, b: IPoint) {
        if (a.y === b.y) {
            return 0;
        }
        const x = b.x - a.x;
        const y = b.y - a.y;
        if (x === 0) {
            return y > 0 ? -90 : 90;
        }
        return Math.atan(y / x)  / (Math.PI / 180);
    }

    private getIntersectionPoint(lineA1: IPoint, lineA2: IPoint, lineB1: IPoint, lineB2: IPoint): IPoint {
        return this.point(
            ((lineA1.x - lineA2.x) * (lineB1.x * lineB2.y - lineB2.x * lineB1.y)
            - (lineB1.x - lineB2.x) * (lineA1.x * lineA2.y - lineA2.x * lineA1.y))
                / ((lineB1.x - lineB2.x) * (lineA1.y - lineA2.y) - (lineA1.x - lineA2.x) * (lineB1.y - lineB2.y)),
            ((lineA1.y - lineA2.y) * (lineB1.x * lineB2.y - lineB2.x * lineB1.y)
            - (lineA1.x * lineA2.y - lineA2.x * lineA1.y) * (lineB1.y - lineB2.y))
                / ((lineA1.y - lineA2.y) * (lineB1.x - lineB2.x) - (lineA1.x - lineA2.x) * (lineB1.y - lineB2.y)),
        );
    }

    private point(x: number, y: number): IPoint {
        return {
            x,
            y,
        };
    }

    private animation(
        start: number, end: number,
        callHandle: (i: number) => void, endHandle: () => void) {
        const diff = start > end ? -1 : 1;
        let step = 1;
        const handle = setInterval(() => {
            start += (step ++) * diff;
            if ((diff > 0 && start >= end) || (diff < 0 && start <= end)) {
                clearInterval(handle);
                callHandle(end);
                endHandle();
                return;
            }
            callHandle(start);
        }, 16);
    }

    /**
     * 获取滑动的方向
     * @param x x
     * @param y y
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
        if (this._kind !== FlipKind.Scroll && (page < 1 || page > this._total)) {
            const tmp = this.createCanvas(width, height);
            tmp.fill(this._background);
            return tmp;
        }
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
        const box = this.createCanvas(width, height);
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

    private createCanvas(width: number = this.width, height: number = this.height) {
        return Canvas.create(width, height);
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

    private draw(cb: (cas: Canvas, ctx: CanvasRenderingContext2D) => void) {
        this._canvas.reset();
        this._canvas.clear();
        this._canvas.save(ctx => {
            cb(this._canvas, ctx);
        })
        this._canvas.rect(this._margin.left, this.height - 5, this.innerWidth, 2, '#ccc');
        this._canvas.rect(this._margin.left, this.height - 5, this.innerWidth * this.progress / 100, 2, '#333');
    }


}
