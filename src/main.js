import './main.less';
import 'regenerator/runtime';
import Preloader from 'preload.io';
import ImageLoader from 'preload.io-image';
import {EVENTS} from 'preload.io';
import {promise} from './lib';
import {
    wrap, find, findAll, 
    center, appendTo, replace,
    each, requestAnimationFrame, cancelAnimationFrame
} from './util';

const win = window;
const doc = win.document;
const {defer} = promise.features;
const {domReady, delay} = promise.utilities;

const IMAGE_PATH = 'assets/images';
const preloader = new Preloader();
const preloaderDeferred = defer();
const images = {
    [`${IMAGE_PATH}/title.png`]: 0,
    [`${IMAGE_PATH}/cover.png`]: 0,
    [`${IMAGE_PATH}/heart.png`]: 0,
    [`${IMAGE_PATH}/heart-out.png`]: 0,
    [`${IMAGE_PATH}/wedding.png`]: 0,
    [`${IMAGE_PATH}/slides/1.jpg`]: 0,
    [`${IMAGE_PATH}/slides/2.jpg`]: 0,
    [`${IMAGE_PATH}/slides/3.jpg`]: 0,
    [`${IMAGE_PATH}/slides/4.jpg`]: 0,
    [`${IMAGE_PATH}/slides/5.jpg`]: 0
};
preloader.register(new ImageLoader({
    blob: true
}));
for (let path in images) {
    images[path] = preloader.load(path);
}
preloader.on(EVENTS.LOAD, event => {
    console.log('image load');

    var path;
    for (let p in images) {
        if (event.id === images[p]) {
            path = p;
            break;
        }
    }

    var image = new Image();
    let urlCreator = window.URL || window.webkitURL;
    let imageURL = urlCreator.createObjectURL(event.res)
    image.src = imageURL;
    images[path] = image;
})
preloader.on(EVENTS.COMPLETE, event => {
    console.log('image complete');
    preloaderDeferred.resolve(images);
});

const MUSIC_PATH = 'assets/musics';
const music = new Audio(`${MUSIC_PATH}/bg.mp3`);
const musicDeferred = defer();
music.addEventListener('loadstart', (...args) => console.log('music loadstart'))
music.addEventListener('loadeddata', (...args) => console.log('music loadeddata'))
music.addEventListener('loadedmetadata', (...args) => console.log('music loadedmetadata'));
var progressCount = 0;
music.addEventListener('progress', (...args) => {
    console.log('music progress');
    progressCount++;
    if (progressCount > 20) {
        music.play();
        musicDeferred.resolve();
    }
});
music.addEventListener('loadend', (...args) => console.log('music loadend'))
music.addEventListener('load', (...args) => console.log('music load'))
music.loop = true;
music.autobuffer = true;
music.preload = 'auto';

const LOGO_HTML = `
    <div id="logo-wrap">
        <div class="bg"></div>
        <img src="${IMAGE_PATH}/logo.png" />
    </div>
`;
var $logo;

const COVER_HTML = `
    <div id="cover-wrap">
        <div class="paper">
            <div class="title">
                <img src="//:0" data-src="${IMAGE_PATH}/title.png" />
            </div>
        </div>
        <div class="imgs">
            <img class="heart" src="//:0" data-src="${IMAGE_PATH}/heart.png" />
            <img class="cover" src="//:0" data-src="${IMAGE_PATH}/cover.png" />
            <img class="heart-out" src="//:0" data-src="${IMAGE_PATH}/heart-out.png" />
        </div>
        <img class="wedding" src="//:0" data-src="${IMAGE_PATH}/wedding.png" />
        <div class="invitation">
            <div class="time">2016年1月27日</div>
            <div class="name">金擘 先生、黄玉梅 女士</div>
            <div class="text">诚邀亲爱的您参加我们的婚礼</div>
            <div class="form"><label>地点：</label><span>浙江省绍兴市越城区偏门直街179号<span></div>
            <div class="form"><label>酒店：</label><span>香港品珍楼精品食府<span></div>
            <div class="form"><label>时间：</label><span>下午六点整（五点开始签到）<span></div>
        </div>
    </div>
`;
var $cover;

const INDICATOR_HTML = `
    <div id="indicator-wrap">
        <a class="text">请君亲启</a>
    </div>
`;
var $indicator;

const SLIDES_HTML = `
    <div id="slide-wrap">
        <section>
            <header>
                <h2>2011年12月18日</h2>
                <h3>我们在车展上不期而遇</h3>
            </header>
            <img src="//:0" data-src="${IMAGE_PATH}/slides/1.jpg" />
        </section>
        <section>
            <header>
                <h2>2012年3月31日</h2>
                <h3>我们在我回乡前的最后一天相恋</h3>
            </header>
            <img src="//:0" data-src="${IMAGE_PATH}/slides/2.jpg" />
        </section>
        <section>
            <header>
                <h2>2013年10月26日</h2>
                <h3>我们第一次踏上异国的旅行</h3>
            </header>
            <img src="//:0" data-src="${IMAGE_PATH}/slides/3.jpg" />
        </section>
        <section>
            <header>
                <h2>2014年4月12日</h2>
                <h3>我们一起收获永世不变的爱情</h3>
            </header>
            <img src="//:0" data-src="${IMAGE_PATH}/slides/4.jpg" />
        </section>
        <section>
            <header>
                <h2>2015年9月9日</h2>
                <h3>让世界见证</h3>
            </header>
            <img src="//:0" data-src="${IMAGE_PATH}/slides/5.jpg" />
        </section>
    </div>
`;
var $slides;

function lazyload(el) {
    el::findAll('img[data-src]')::
        each(function(img) {
            var dataSrc = img.getAttribute('data-src');
            if (images[dataSrc]) {
                let _img = images[dataSrc];
                _img.className = img.className;
                _img::replace(img);
            }
        });
}

function loading() {
    var percent = 0;
    var deferred = defer();
    var $bg = $logo::find('.bg');

    requestAnimationFrame(function h() {
        requestAnimationFrame(h);
        percent++;
        $bg.style.webkitTransform = 
            $bg.style.transform = `translateY(${100 - percent}%)`;
        if (percent >= 100) {
            percent = 0;
        }
    });

    preloaderDeferred.promise.then(deferred.resolve);

    return deferred.promise;
}

function hideLogo() {
    var deferred = defer();

    $logo.style.webkitTransition = 
            $logo.style.transition = 'opacity 0.4s ease-out 0s';
    $logo.style.opacity = '0';

    delay(450).then(function() {
        $logo.parentNode.removeChild($logo);
        deferred.resolve();
    });

    return deferred.promise;
}

function showCover() {
    var deferred = defer();

    $cover.style.webkitTransition = 
            $cover.style.transition = 'opacity 0.6s ease-in 0s';
    $cover.style.opacity = '1';

    delay(450).then(deferred.resolve);

    return deferred.promise;
}

function showPaper() {
    var deferred = defer();

    var $paper = $cover::find('.paper');
    $paper.style.webkitTransition = 
            $paper.style.transition = 'all 1s ease 0s';
    $paper.style.opacity = '1';
    $paper.style.webkitTransform =
        $paper.style.transform = 'translateY(0)';

    delay(450).then(deferred.resolve);

    return deferred.promise;
}

function showHeart() {
    var deferred = defer();

    var $heart = $cover::find('.heart');
    $heart.style.webkitTransition = 
            $heart.style.transition = 'opacity 0.6s ease-in 0s';
    $heart.style.opacity = '1';

    var $heartOut = $cover::find('.heart-out');
    $heartOut.style.webkitTransition = 
            $heartOut.style.transition = 'opacity 0.6s ease-in 0s';
    $heartOut.style.opacity = '1';

    delay(450).then(deferred.resolve);

    return deferred.promise;
}

function showIndicator() {
    $indicator.style.display = 'block';
}

function hideIndicator() {
    $indicator.style.display = 'none';
}

function flickUp() {
    var deferred = defer();
    document.body.addEventListener('flick', function handler(e) {
        if (!!e.isVertical && e.displacementY < 0) {
            document.body.removeEventListener('flick', handler);
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function open() {
    var deferred = defer();

    var $imgs = $cover::find('.imgs');
    var $title = $cover::find('.title');

    $imgs.style.webkitTransition = 
        $imgs.style.transition = 'all 0.8s ease-out 0s';
    $imgs.style.webkitTransform =
        $imgs.style.transform = 'translateY(100%)';

    $title.style.webkitTransition = 
        $title.style.transition = 'all 0.8s ease-out 0s';
    $title.style.webkitTransform =
        $title.style.transform = 'translateY(-200%)';

    delay(450).then(deferred.resolve);

    return deferred.promise;
}

async function sliding() {
    function splitText(el) {
        var texts = el.innerText.split('');
        el.innerHTML = '<span>' + texts.join('</span><span>') + '</span>';
    }

    async function showText(el) {
        var $spans = Array.from(el::findAll('span'));

        var delayTime = 0.1;
        var len = $spans.length;
        while (!!$spans.length) {
            let $span = $spans.shift();

            $span.style.webkitTransition = 
                $span.style.transition = `all 0.4s ease-in ${delayTime}s`;
            $span.style.opacity = 1;
            $span.style.webkitTransform = 
                $span.style.transform = 'scale(1)';

            delayTime += 0.1;

            await delay(100);
        }

        await delay(len * 100 + 300);
    }

    async function hideText(el) {
        var $spans = Array.from(el::findAll('span'));

        var delayTime = 0.1;
        var len = $spans.length;
        while (!!$spans.length) {
            let $span = $spans.shift();

            $span.style.webkitTransform = 
                $span.style.transform = 'translateX(0)';

            await delay(50);

            $span.style.webkitTransition = 
                $span.style.transition = `all 0.4s ease-in ${delayTime}s`;
            $span.style.opacity = 0;
            $span.style.webkitTransform = 
                $span.style.transform = 'translateX(-50%)';

            delayTime += 0.1;

            await delay(50);
        }

        await delay(len * 100 + 300);
    }

    const DIRS = [
        ['translateY', '10%'], 
        ['translateY', '-10%'], 
        ['translateX', '10%'], 
        ['translateX', '-10%']
    ];
    async function showImage(el) {
        var $img = el;
        var dir = DIRS[Math.floor(Math.random() * 4)];

        $img.style.webkitTransform = 
            $img.style.transform = `${dir[0]}(${dir[1]})`;


        await delay(100);

        $img.style.webkitTransition = 
            $img.style.transition = `all 0.8s ease-in 0s`;
        $img.style.opacity = 1;
        $img.style.webkitTransform = 
            $img.style.transform = `${dir[0]}(0)`;
    }

    async function hideImage(el) {
        var $img = el;
        var dir = DIRS[Math.floor(Math.random() * 4)];

        $img.style.webkitTransition = 
            $img.style.transition = `all 0.8s ease-in 0s`;
        $img.style.opacity = 0;
        $img.style.webkitTransform = 
            $img.style.transform = `${dir[0]}(${dir[1]})`;
    }

    var $sections = Array.from($slides::findAll('section'));

    while (!!$sections.length) {
        let $section = $sections.shift();

        $section::findAll('h2, h3')
            ::each(splitText);

        $section.style.display = 'block';

        await delay(100);

        await Promise.all([
            showText($section::find('h2')),
            showText($section::find('h3')),
            showImage($section::find('img'))
        ]);

        await delay(1000);

        await Promise.all([
            hideText($section::find('h2')),
            hideText($section::find('h3')),
            hideImage($section::find('img'))
        ]);

        $section.style.display = 'none';
         
        await delay(500);
    }
}

function showSlides() {
    $slides.style.display = 'block';
}

function hideSlides() {
    $slides.style.display = 'none';
}

async function showWedding() {
    var $wedding = $cover::find('.wedding');

    $wedding.style.display = 'block';
    $wedding::center();

    await delay(100);

    $wedding.style.webkitTransition = 
        $wedding.style.transition = `all 0.6s ease-in 0s`;
    $wedding.style.opacity = 1;
    $wedding.style.webkitTransform = 
        $wedding.style.transform = 'translateY(0)';

    await delay(1600);

    var offsetY = parseFloat($wedding.style.top) - 15 * window.dpr;

    $wedding.style.webkitTransition = 
        $wedding.style.transition = `all 1s ease 0s`;
    $wedding.style.webkitTransform = 
        $wedding.style.transform = `translateY(-${offsetY}px)`;

    await delay(1000);
}

async function showInvitation() {
    var $invitation = $cover::find('.invitation');
    var $wedding = $cover::find('.wedding');
    var weddingRect = $wedding.getBoundingClientRect();

    $invitation.style.display = 'block';
    $invitation.style.top = (weddingRect.top + weddingRect.height) + 10 * window.dpr + 'px';
    
    await delay(100);

    $invitation.style.webkitTransition = 
        $invitation.style.transition = `opacity 0.6s ease-in 0s`;
    $invitation.style.opacity = 1;

    await delay(600);
}

async () => {
    await domReady();

    $logo = LOGO_HTML::wrap()
        ::find('#logo-wrap')
        ::appendTo(doc.body)
        ::center();

    await loading();

    await hideLogo();

    $cover = COVER_HTML::wrap()
        ::find('#cover-wrap')
        ::appendTo(doc.body);

    await lazyload($cover);
    await delay(100);
    await showCover();
    await delay(300);
    await showPaper();
    await delay(300);
    await showHeart();

    $indicator = INDICATOR_HTML::wrap()
            ::find('#indicator-wrap')
            ::appendTo(doc.body);

    await showIndicator();
    await flickUp();
    await hideIndicator();
    await open();

    $slides = SLIDES_HTML::wrap()
            ::find('#slide-wrap')
            ::appendTo(doc.body);

    await lazyload($slides);
    await showSlides();
    await sliding();
    await hideSlides();

    await showWedding();
    await delay(500);
    await showInvitation();
}();


