/**
 * Pages Functions API 代理
 *
 * 背景：workers.dev 子域在中国大陆被 DNS 污染无法直连，pages.dev 可直连。
 * 这里将 pages.dev 下的 /api/* 请求透明转发到后端 Worker，
 * 使前端 API 请求走同源 pages.dev，国内无需代理即可使用。
 *
 * 绑自定义域名（api.xxx.com 路由到 Worker）后此代理可退役。
 */

const WORKER_ORIGIN = 'https://children-behavior-api.497457669.workers.dev';

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const target = `${WORKER_ORIGIN}${url.pathname}${url.search}`;

  // 透明转发：原样携带方法/头部/请求体
  const proxied = new Request(target, context.request);
  return fetch(proxied);
};
