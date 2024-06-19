<template>
    <div class="color-picker">
        <div @click="showPicker" class="color-input-container">
            <slot></slot>
        </div>
        <div class="color-picker-calendar" v-show="input.visibility" @click.stop>
            <div class="color-picker-sv" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd" :style="{'background-color': background}">
                <i :style="{left: input.x - 5 + 'px', top: input.y - 5 + 'px'}"></i>
            </div>
            <div class="color-picker-h" @touchstart="touchHStart" @touchmove="touchHMove">
                <i :style="{top: input.hY - 3 + 'px'}"></i>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { reactive, watch } from 'vue';

const emit = defineEmits(['change']);
const model = defineModel<string>();
const input = reactive({
    visibility: false,
    hY: 0,
    x: 0,
    y: 0,
    background: '#fff',
});
let hsv = [0, 0, 0];




watch(() => model.value, () => applyColor());

function showPicker() {
    input.visibility = true;
    applyColor();
}

function touchStart(e: TouchEvent) {
    doColor(e);
}

function touchMove(e: TouchEvent) {
    doColor(e);
}

function touchEnd(e: TouchEvent) {
    output();
}

function touchHStart(e: TouchEvent) {
    doH(e);
}

function touchHMove(e: TouchEvent) {
    doH(e);
}

function applyColor() {
    hsv = parse(model.value);
    input.hY = clamp(160 - hsv[0] * 160, 0, 160);
    setBackground(hsv[0]);
    input.x = clamp(hsv[1] * 160, 0, 160);
    input.y = clamp(160 - hsv[2] * 160, 0, 160);
}

function setBackground(off: number) {
    hsv[0] = off;
    const b = HSV2RGB([off, 1, 1]);
    input.background = 'rgb(' + b.join(',') + ')';
    change();
}

function change() {
    emit('change', '#' + HSV2HEX(hsv));
}

function output() {
    input.visibility = false;
    model.value = '#' + HSV2HEX(hsv);
}

function doColor(e: TouchEvent) {
    const offset = (e.target as HTMLDivElement).getBoundingClientRect();
    input.y = clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
    input.x = clamp(e.targetTouches[0].clientX - offset.left, 0, offset.width);
    hsv[1] = input.x / offset.width;
    hsv[2] = (offset.height - input.y) / offset.height;
    change();
}

function doH(e: TouchEvent) {
    const offset = (e.target as HTMLDivElement).getBoundingClientRect();
    input.hY = clamp(e.targetTouches[0].clientY - offset.top, 0, offset.height);
    setBackground(offset.height - input.hY / offset.height);
}
/**
 * 限制最大最小值
 */
function clamp(val: number, min: number, max: number): number {
    return val > max ? max : val < min ? min : val;
}

function parse(x: any): number[] {
    if (typeof x === 'object') {
        return x;
    }
    const rgb = /\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(x);
    const hsv = /\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(x);
    const hex = x[0] === '#' && x.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hex) {
        return HEX2HSV(x.slice(1));
    } else if (hsv) {
        return _2HSV_pri([+hsv[1], +hsv[2], +hsv[3]]);
    } else if (rgb) {
        return RGB2HSV([+rgb[1], +rgb[2], +rgb[3]]);
    }
    return [0, 1, 1]; // default is red
}

// [h, s, v] ... 0 <= h, s, v <= 1
function HSV2RGB(a: number[]): number[] {
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
    return [round(r * 255), round(g * 255), round(b * 255)];
}

function HSV2HEX(a: number[]): string {
    return RGB2HEX(HSV2RGB(a));
}

// [r, g, b] ... 0 <= r, g, b <= 255
function RGB2HSV(a: number[]): number[] {
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

function RGB2HEX(a: number[]): string {
    let s: string| number = + a[2] | ( + a[1] << 8) | ( + a[0] << 16);
    s = '000000' + s.toString(16);
    return s.slice(-6);
}

// rrggbb or rgb
function HEX2HSV(s: string): number[] {
    return RGB2HSV(HEX2RGB(s));
}

function HEX2RGB(s: string): number[] {
    if (s.length === 3) {
        s = s.replace(/./g, '$&$&');
    }
    return [num(s[0] + s[1], 16), num(s[2] + s[3], 16), num(s[4] + s[5], 16)];
}

// convert range from `0` to `360` and `0` to `100` in color into range from `0` to `1`
function _2HSV_pri(a: number[]): number[] {
    return [+ a[0] / 360, + a[1] / 100, + a[2] / 100];
}

// convert range from `0` to `1` into `0` to `360` and `0` to `100` in color
function _2HSV_pub(a: number[]): number[] {
    return [round( + a[0] * 360), round( + a[1] * 100), round( + a[2] * 100)];
}

// convert range from `0` to `255` in color into range from `0` to `1`
function _2RGB_pri(a: number[]): number[] {
    return [+ a[0] / 255, + a[1] / 255, + a[2] / 255];
}

function num(i: any, j = 10) {
    return parseInt(i, j || 10);
}

function round(i: number) {
    return Math.round(i);
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
