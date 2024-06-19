
import type { Router } from 'vue-router';
import { ORDER_STATUS } from '../api/model';

export const DEEPLINK_SCHEMA = 'zodream';

export const openLink = (router: Router, link: string) => {
    if (!link || link.length < 1 || link.charAt(0) === '#' || link.indexOf('javascript:') === 0) {
        return;
    }
    // {Scheme}://{Action}/{Target}/{Method}/{Param}?{Key}={Value}
    // deeplink://goto/index
    const items = link.split('://');
    const schema = items[0];
    if (schema === 'http' || schema === 'https') {
        router.push({name: 'browser', query: {url: link}});
        return;
    }
    if (schema !== DEEPLINK_SCHEMA) {
        return;
    }
    let params: any = null;
    let showAuth = false;
    const prefix = schema + '://'
    const suffix = link.replace(prefix, '')
    const parts = suffix.split('?')
    const route = parts[0]
    let query: any = null
    if (parts.length > 1) {
        query = parts[1]
    }
    const routeParams = route.split('/')
    const path = routeParams[0]
    const where = routeParams.length > 1 ? routeParams[1] : null
    const action = routeParams.length > 2 ? routeParams[2] : null
    const queryParams: any = new Object()
    if (query && query.length) {
        const queryParts = query.split('&')
        for (const element of queryParts) {
            const valueParts = element.split('=')
            const key = valueParts[0]
            const value = decodeURIComponent(valueParts[1])
            queryParams[key] = value
        }
    }
    if (path === 'goto') {
        if (where === 'index') {
            // 商城首页
            params = { name: 'home' }
        } else if (where === 'cart') {
            // 我的购物车
            params = { name: 'cart', params: { type: 0 } }
        } else if (where === 'search') {
            // 搜索界面
            params = { name: 'search', params: { isFromHome: true } }
        } else if (where === 'category') {
            if (action === 'all') {
                // 分类列表
                params = { name: 'category', params: { isFromHome: true } }
            } else {
                // 分类详情(商品列表)
                params = { name: 'products', query: { category: action } }
            }
        } else if (where === 'notice') {
            if (action === 'all') {
                // 公告列表
                // params = { name: 'messageCenter' }
            }
        } else if (where === 'promotions') {
            // 组合促销列表
            params = { name: 'promotions', query: { id: action } }
        } else if (where === 'product') {
            if (action === 'all') {
                // 商品列表
                params = { name: 'products', params: { isFromHome: true } }
            } else {
                // 商品详情
                params = { name: 'product', params: { id: action } }
            }
        } else if (where === 'notice/scanner') {
            // 二维码界面 // TODO:
        } else if (where === 'home') {
            // 个人中心
            params = { name: 'profile' }
        } else if (where === 'setting') {
            // 系统设置
            params = { name: 'setting' }
        } else if (where === 'cardpage') {
            // 卡片页详情
            params = { name: 'cardpage', params: { name: action } }
        } else if (where === 'profile') {
            // 个人资料（需要登录）
            showAuth = true
            params = { name: 'profileInfo' }
        } else if (where === 'address') {
            if (action === 'all') {
                // 收货地址列表	（需要登录）
                showAuth = true
                params = { name: 'addressManage' }
            } else if (action === 'new') {
                // 新建收货地址（需要登录）
                showAuth = true
                params = { name: 'addressEdit', query: { mode: 'add', item: null } }
            } else {
                // 编辑收货地址（需要登录）// TODO: address item
                showAuth = true
                params = { name: 'addressEdit', query: { mode: 'edit', item: action } }
            }
        } else if (where === 'order') {
            showAuth = true
            if (action === 'all') {
                // 全部订单（需要登录）
                params = { name: 'order'}
            } else if (action === 'created') {
                // 待付款订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.UN_PAY } }
            } else if (action === 'paid') {
                // 待发货订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.PAID_UN_SHIP } }
            } else if (action === 'delivering') {
                // 发货中订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.SHIPPED } }
            } else if (action === 'delivered') {
                // 待评价订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.RECEIVED } }
            } else if (action === 'finished') {
                // 已完成订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.FINISH } }
            } else if (action === 'cancelled') {
                // 已取消订单（需要登录）
                params = { name: 'order', params: { order: ORDER_STATUS.CANCEL } }
            } else {
                // 订单详情（需要登录）
                params = { name: 'orderDetail', query: { id: action } }
            }
        } else if (where === 'favorite') {
            if (action === 'product') {
                // 我的商品收藏（需要登录）
                showAuth = true
                params = { name: 'collection' }
            }
        } else if (where === 'message') {
            // 消息列表（需要登录）
            if (action === 'all') {
                showAuth = true
                params = { name: 'systemMessageList' }
            } else {
                // 无法打开页面
            }
        } else if (where === 'orderMessage') {
            if (action === 'all') {
                // 订单消息列表（需要登录）
                showAuth = true
                params = { name: 'orderMessageList' }
            } else {
                // 无法打开页面
            }
        } else if (where === 'coupon') {
            showAuth = true
            if (action === 'available') {
                // 未使用优惠券列表（需要登录）
                params = { name: 'couponList', params: { index: 0 } }
            } else if (action === 'expired') {
                // 已过期优惠券列表（需要登录）
                params = { name: 'couponList', params: { index: 1 } }
            } else if (action === 'used') {
                // 已使用优惠券列表（需要登录）
                params = { name: 'couponList', params: { index: 2 } }
            }
        } else if (where === 'shipping') {
            // 物流详情页面（需要登录）
            showAuth = true
            params = { name: 'orderTrack', params: { orderTrack: queryParams.id } }
        } else if (where === 'article') {
            // 文章列表页面（需要登录）
            showAuth = true
            params = { name: 'Help' }
        } else if (where === 'invoice') {
            // 发票页面（需要登录）
            showAuth = true
            params = { name: 'invoice', params: { title: '' } }
        }
    } else if (path === 'search') {
        if (where === 'product') {
            const k = queryParams.k
            params = { name: 'search', query: { keywords: k } }
        }
    }

    if (showAuth) {
        router.push({ name: 'signin' })
    } else {
        router.push(params)
    }
}
