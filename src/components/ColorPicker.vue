<template>
    <div class="color-picker">
        <div @click="showPicker" class="color-input-container">
            <slot></slot>
        </div>
        <div class="color-picker-calendar" v-show="visibility">
            <div class="color-picker-sv" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd" :style="{'background-color': background}">
                <i :style="{left: x - 5 + 'px', top: y - 5 + 'px'}"></i>
            </div>
            <div class="color-picker-h" @touchstart="touchHStart" @touchmove="touchHMove">
                <i :style="{top: hY - 3 + 'px'}"></i>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator';

@Component
export default class ColorPicker extends Vue {
    @Prop(String) public readonly value?: string;

    public visibility: boolean = false;

    public hY: number = 0;

    public x: number = 0;

    public y: number = 0;

    public background = '#fff';

    private hsv = [0, 0, 0];

    @Watch('value')
    public onValueChanged(val: string, oldVal: string) {
        this.hsv = this.parse(val);
        this.hY = 160 - this.hsv[0] * 160;
        this.setBackground(this.hsv[0]);
        this.x = 160 - this.hsv[1] * 160;
        this.y = 160 - this.hsv[2] * 160;
    }

    /**
     * showPicker
     */
    public showPicker() {
        this.visibility = true;
    }

    public touchStart(e: TouchEvent) {
        this.doColor(e);
    }

    public touchMove(e: TouchEvent) {
        this.doColor(e);
    }

    public touchEnd(e: TouchEvent) {
        this.output();
    }

    public touchHStart(e: TouchEvent) {
        this.doH(e);
    }

    public touchHMove(e: TouchEvent) {
        this.doH(e);
    }

    private setBackground(off: number) {
        this.hsv[0] = off;
        const b = this.HSV2RGB([off, 1, 1]);
        this.background = 'rgb(' + b.join(',') + ')';
        this.change();
    }

    private change() {
        this.$emit('change', '#' + this.HSV2HEX(this.hsv));
    }

    private output() {
        this.visibility = false;
        this.$emit('input', '#' + this.HSV2HEX(this.hsv));
    }

    private doColor(e: TouchEvent) {
        const offset = (e.target as HTMLDivElement).getBoundingClientRect();
        this.y = this.clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
        this.x = this.clamp(e.targetTouches[0].clientX - offset.left, 0, offset.width);
        this.hsv[1] = (offset.width - this.x) / offset.width;
        this.hsv[2] = (offset.height - this.y) / offset.height;
        this.change();
    }

    private doH(e: TouchEvent) {
        const offset = (e.target as HTMLDivElement).getBoundingClientRect();
        this.hY = this.clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
        this.setBackground(offset.height - this.hY / offset.height);
    }
    /**
     * 限制最大最小值
     */
    private clamp(val: number, min: number, max: number): number {
        return val > max ? max : val < min ? min : val;
    }

    private parse(x: any): number[] {
        if (typeof x === 'object') {
            return x;
        }
        const rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x);
        const hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x);
        const hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
        if (hex) {
            return this.HEX2HSV(x.slice(1));
        } else if (hsv) {
            return this._2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
        } else if (rgb) {
            return this.RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
        }
        return [0, 1, 1]; // default is red
    }

    // [h, s, v] ... 0 <= h, s, v <= 1
    private HSV2RGB(a: number[]): number[] {
        const h = + a[0];
        const s = + a[1];
        const v = + a[2];
        let r: number = 0;
        let g: number = 0;
        let b: number = 0;
        let i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
        i = i || 0;
        q = q || 0;
        t = t || 0;
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [this.round(r * 255), this.round(g * 255), this.round(b * 255)];
    }

    private HSV2HEX(a: number[]): string {
        return this.RGB2HEX(this.HSV2RGB(a));
    }

    // [r, g, b] ... 0 <= r, g, b <= 255
    private RGB2HSV(a: number[]): number[] {
        const r = + a[0];
        const g = + a[1];
        const b = + a[2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        let h: number = 0;
        const s = (max === 0 ? 0 : d / max);
        const v = max / 255;
        switch (max) {
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }
        return [h, s, v];
    }

    private RGB2HEX(a: number[]): string {
        let s: string| number = + a[2] | ( + a[1] << 8) | ( + a[0] << 16);
        s = '000000' + s.toString(16);
        return s.slice(-6);
    }

    // rrggbb or rgb
    private HEX2HSV(s: string): number[] {
        return this.RGB2HSV(this.HEX2RGB(s));
    }

    private HEX2RGB(s: string): number[] {
        if (s.length === 3) {
            s = s.replace(/./g, '$&$&');
        }
        return [this.num(s[0] + s[1], 16), this.num(s[2] + s[3], 16), this.num(s[4] + s[5], 16)];
    }

    // convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
    private _2HSV_pri(a: number[]): number[] {
        return [+ a[0] / 360, + a[1] / 100, + a[2] / 100];
    }

    // convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
    private _2HSV_pub(a: number[]): number[] {
        return [this.round( + a[0] * 360), this.round( + a[1] * 100), this.round( + a[2] * 100)];
    }

    // convert range from `0` to `255` in color into range from `0` to `1`
    private _2RGB_pri(a: number[]): number[] {
        return [+ a[0] / 255, + a[1] / 255, + a[2] / 255];
    }

    private num(i: any, j = 10) {
        return parseInt(i, j || 10);
    }

    private round(i: number) {
        return Math.round(i);
    }

}
</script>

<style lang="scss" scoped>
.color-picker {
    position: relative;
    display: inline-block;
    *,
    *::before,
    *::after {
        box-sizing: border-box;
    }
}

.color-picker-calendar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 9999;
    box-shadow: 1px 5px 10px rgba(0, 0, 0, .5);
    height: 160px;
    border: 1px solid #000;
    color: #000;
    display: grid;
    grid-template-columns: 160px 30px;
    background-color: #fff;
    i {
        font: inherit;
        font-size: 12px;
    }
    .color-picker-h,
    .color-picker-sv {
        background-size: 100% 100%;
        position: relative;
    }
    .color-picker-h {
        border-left: 1px solid;
        background: transparent url('../assets/color-picker-h.png') no-repeat 50% 50%;
        background-image: linear-gradient(to top, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
        cursor: ns-resize;
        overflow: hidden;
        i {
            display: block;
            height: 6px;
            position: absolute;
            top: -3px;
            right: 0;
            left: 0;
            z-index: 3;
            &::before {
                display: block;
                content: "";
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                border:3px solid;
                border-top-color: transparent;
                border-bottom-color: transparent;
            }
        }
    }
    .color-picker-sv {
        background: transparent url('../assets/color-picker-sv.png') no-repeat 50% 50%;
        background-image: linear-gradient(to top, #000, rgba(0, 0, 0, 0)), linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
        cursor: crosshair;
        i {
            display: block;
            width: 10px;
            height: 10px;
            position: absolute;
            top: -5px;
            right: -5px;
            z-index: 3;
            &::before,
            &::after {
                display: block;
                content: "";
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                border: 1px solid;
                border-color: inherit;
                border-radius: 100%;
            }
            &::before {
                top: -1px;
                right: -1px;
                bottom: -1px;
                left: -1px;
                border-color: #fff;
            }
        }
    }
    .color-picker-h,
    .color-picker-sv {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        -webkit-tap-highlight-color: transparent;
    }
}

</style>
