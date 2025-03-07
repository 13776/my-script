// ==UserScript==
// @name         快手直播双元素隐藏
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  隐藏礼物栏和特定状态栏，智能识别全屏模式
// @author       IOException
// @match        https://live.kuaishou.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // 配置对象
    const CONFIG = {
        elements: [
            {
                xpath: '//*[@id="app"]/div[3]/div[2]/div[1]/div/div[1]/div/div[1]/div/div/div[4]', // 礼物栏
                alwaysHide: true // 始终隐藏
            },
            {
                xpath: '//*[@id="app"]/div[3]/div[2]/div[1]/div/div[1]/div/div[1]/div/div/div[2]', // 主播信息
                alwaysHide: false // 仅在非全屏时隐藏
            }
        ],
        observerConfig: {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        },
        checkInterval: 500,
        maxAttempts: 15
    };

    // 全屏状态检测
    function isFullscreen() {
        return document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.mozFullScreenElement;
    }

    // 智能隐藏函数
    function smartHide() {
        CONFIG.elements.forEach(target => {
            const result = document.evaluate(
                target.xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );

            const element = result.singleNodeValue;
            if (element) {
                const shouldHide = target.alwaysHide || !isFullscreen();
                element.style.display = shouldHide ? 'none' : '';
                element.style.visibility = shouldHide ? 'hidden' : '';
            }
        });
    }

    // 防抖执行器
    function debounce(fn, delay=300) {
        let timer;
        return () => {
            clearTimeout(timer);
            timer = setTimeout(fn, delay);
        }
    }

    // 初始化监听
    const observer = new MutationObserver(debounce(smartHide));
    const delayedHide = debounce(smartHide, 200);

    window.addEventListener('load', () => {
        // 初始执行
        let attempts = 0;
        const initCheck = setInterval(() => {
            smartHide();
            if(attempts++ > CONFIG.maxAttempts) clearInterval(initCheck);
        }, CONFIG.checkInterval);

        // 注册观察者
        observer.observe(document.body, CONFIG.observerConfig);

        // 全屏事件监听
        document.addEventListener('fullscreenchange', delayedHide);
        document.addEventListener('webkitfullscreenchange', delayedHide);
        document.addEventListener('mozfullscreenchange', delayedHide);

        // 响应式处理
        window.addEventListener('resize', delayedHide);
    });
})();
