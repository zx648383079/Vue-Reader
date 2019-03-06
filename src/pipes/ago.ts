export function agoFilter(value: number) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - value) / 1000);
    if (diff < 1) {
      return '刚刚';
    }
    if (diff < 60) {
      return diff + '秒前';
    }
    if (diff < 3600) {
      return Math.floor(diff / 60) + '分钟前';
    }
    if (diff < 86400) {
      return Math.floor(diff / 3600) + '小时前';
    }
    if (diff < 2592000) {
      return Math.floor(diff / 86400) + '天前';
    }
    const timeDate = new Date(value);
    if (timeDate.getFullYear() === now.getFullYear()) {
      return timeDate.getMonth() + 1 + '月' + timeDate.getDate();
    }
    return timeDate.getFullYear() + '年' + (timeDate.getMonth() + 1) + '月';
}
