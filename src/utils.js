/*
 * @Author: DK
 * @Date: 2018-05-17 09:07:23
 * @Description: 工具类
 * @Last Modified by: DK
 * @Last Modified time: 2018-05-17 09:08:46
 */

/**
* 检测浏览器内核
*/
export function checkBrowerKernel() {
  // 浏览器
  const browser = {
    ie: 0,
    firefox: 0,
    safari: 0,
    konq: 0,
    opera: 0,
    chrome: 0,

    // 版本号
    ver: null,
  };
  // 检测呈现引擎和版本
  const ua = navigator.userAgent;

  if (window.opera) {
    browser.ver = window.opera.version();
    browser.opera = parseFloat(browser.ver);
  } else if (/AppleWebKit\/(\S+)/.test(ua)) {
    // 确定是chrome还是safari
    if (/Chrome\/(\S+)/.test(ua)) {
      browser.ver = RegExp.$1;
      browser.chrome = parseFloat(browser.ver);
    } else if (/Version\/(\S+)/.test(ua)) {
      browser.ver = RegExp.$1;
      browser.safari = parseFloat(browser.ver);
    } else {
      const ver = RegExp.$1;
      const webkit = parseFloat(ver);
      let safariVersion = 1;
      if (webkit < 100) {
        safariVersion = 1;
      } else if (webkit < 312) {
        safariVersion = 1.2;
      } else if (webkit < 412) {
        safariVersion = 1.3;
      } else {
        safariVersion = 2;
      }
      browser.safari = safariVersion;
      browser.ver = safariVersion;
    }
  } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
    browser.ver = RegExp.$1;
    browser.konq = parseFloat(browser.ver);
  } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
    // 确定是否firefox
    if (/Firefox\/(\S+)/.test(ua)) {
      browser.ver = RegExp.$1;
      browser.firefox = parseFloat(browser.ver);
    }
  } else if (/MSIE ([^;]+)/.test(ua) || /Mozilla\/(\S+)/.test(ua)) {
    browser.ver = RegExp.$1;
    browser.ie = parseFloat(browser.ver);
  }

  return browser;
}
