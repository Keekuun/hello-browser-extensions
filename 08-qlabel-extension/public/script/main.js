// 初始化变量
let currentImage = 1;
let transitionSpeed = 300;
let isDragging = false;
let comparisonMode = false;
let imagesLoaded = {image1: false, image2: false};

// DOM元素
const image1Input = document.getElementById('image1');
const image2Input = document.getElementById('image2');
const selectImage1Btn = document.getElementById('select-image1');
const selectImage2Btn = document.getElementById('select-image2');
const image1Preview = document.getElementById('image1-preview');
const image2Preview = document.getElementById('image2-preview');
const displayImage1 = document.getElementById('display-image1');
const displayImage2 = document.getElementById('display-image2');
const sliderImage = document.getElementById('slider-image');
const imageContainer = document.getElementById('image-container');
const image1Container = document.getElementById('image1-container');
const image2Container = document.getElementById('image2-container');
const comparisonSlider = document.getElementById('comparison-slider');
const prevImageBtn = document.getElementById('prev-image');
const nextImageBtn = document.getElementById('next-image');
const modeToggleBtn = document.getElementById('mode-toggle');
const resetViewBtn = document.getElementById('reset-view');
const transitionSpeedInput = document.getElementById('transition-speed');
const speedValueSpan = document.getElementById('speed-value');
const loadingOverlay = document.getElementById('loading-overlay');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');
const closeHelpBtn = document.getElementById('close-help-btn');
const themeToggle = document.getElementById('theme-toggle');
const keyboardHint = document.querySelector('.keyboard-hint');

const action = document.getElementById('action-btns')
const nav = document.querySelector('nav');
const local = document.querySelector('.local-img');

const zenShow = document.getElementById('zen-show');
const zenHide = document.getElementById('zen-hide');

// 初始化页面
init();

function init() {
    // 设置事件监听器
    setupEventListeners();

    // 更新滑块图像
    updateSliderImage();

    console.log('--- 从 URL 获取 ---');
    const urlImages = getImagesFromUrl();
    console.log('[r_img]:', urlImages.r_img);
    console.log('[g_img]:', urlImages.g_img);
    displayImage1.src = urlImages.r_img
    displayImage2.src = urlImages.g_img

    if(urlImages.text) {
        const textElement = document.createElement('div');
        textElement.className = 'text-sm text-left text-green-600 mt-4 border border-blue-200 p-2 rounded-lg shadow-md max-w-md mx-auto absolute top-4 left-4';
        textElement.textContent = urlImages.text;
        // 增加一个隐藏和显示的按钮
        textElement.appendChild(document.createElement('br'));
        const toggleTextBtn = document.createElement('button');
        toggleTextBtn.innerHTML = '<i class="fa fa-eye-slash"></i>';
        toggleTextBtn.className = 'p-2 text-white rounded-lg hover:bg-primary/90 text-md absolute bottom-0 right-0';

        const showTextBtn = document.getElementById('text-hide');
        toggleTextBtn.addEventListener('click', () => {
            textElement.classList.toggle('hidden');
            showTextBtn.classList.toggle('hidden');
        });
        showTextBtn.addEventListener('click', () => {
            textElement.classList.toggle('hidden');
            showTextBtn.classList.toggle('hidden');
        });
        textElement.appendChild(toggleTextBtn);
        document.querySelector('.image-container').appendChild(textElement);
    }
}

function showZen() {
    local.classList.remove('hidden');
    nav.classList.remove('hidden');
    zenShow.classList.add('hidden');
    zenHide.classList.remove('hidden');
    action.classList.remove('hidden');


    const container = document.querySelector('.image-container');
    container.classList.remove('image-container-full');
    const zens = document.querySelectorAll('.zen-show');
    zens.forEach(el => {
        el.style.padding = ''
        el.style.margin = ''
    });
}

function hideZen() {
    local.classList.add('hidden');
    nav.classList.add('hidden');
    zenShow.classList.remove('hidden');
    zenHide.classList.add('hidden');
    action.classList.add('hidden');
    const container = document.querySelector('.image-container');
    container.classList.add('image-container-full');
    const zens = document.querySelectorAll('.zen-show');
    zens.forEach(el => {
        el.style.padding = 0
        el.style.margin = 0
    });
    // 添加事件监听
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            console.log('ESC 键被按下');
            // 执行你的逻辑，比如关闭模态框等
            showZen()
        }
    });
}

// utils/image-source.ts (推荐将这些工具函数放在一个单独的文件中)

// =================================================================
// 1. 从 URL 中获取
// =================================================================
function getImagesFromUrl() {
    if (typeof window === 'undefined') {
        return {r_img: null, g_img: null};
    }
    const searchParams = new URLSearchParams(window.location.search);
    let show = false
    if (searchParams.has('show')) {
        show = true
    }
    if (show) {
        showZen()
    } else {
        hideZen()
    }
    return {
        r_img: searchParams.get('r_img'),
        g_img: searchParams.get('g_img'),
        text: searchParams.get('text'),
    };
}

// =================================================================
// 2. 从 Cookie 中获取
// =================================================================
function getCookieValue(name) {
    if (typeof document === 'undefined') {
        return null;
    }
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function getImagesFromCookie() {
    return {
        r_img: getCookieValue('r_img'),
        g_img: getCookieValue('g_img'),
    };
}

function setupEventListeners() {
    // 图片选择按钮
    selectImage1Btn.addEventListener('click', () => image1Input.click());
    selectImage2Btn.addEventListener('click', () => image2Input.click());

    // 文件选择事件
    image1Input.addEventListener('change', handleImageSelection(image1Input, image1Preview, 'image1'));
    image2Input.addEventListener('change', handleImageSelection(image2Input, image2Preview, 'image2'));

    // 图片切换按钮
    prevImageBtn.addEventListener('click', showPreviousImage);
    nextImageBtn.addEventListener('click', showNextImage);

    // 模式切换按钮
    modeToggleBtn.addEventListener('click', toggleComparisonMode);

    // 重置视图按钮
    resetViewBtn.addEventListener('click', resetView);

    // 过渡速度调整
    transitionSpeedInput.addEventListener('input', adjustTransitionSpeed);

    // 滑块拖动事件
    const sliderHandle = comparisonSlider.querySelector('.slider-handle');
    sliderHandle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);

    // 鼠标滚轮事件
    document.querySelector('.image-container').addEventListener('wheel', handleMouseWheel);

    // 键盘事件
    window.addEventListener('keydown', handleKeyPress);

    // 帮助模态框
    helpButton.addEventListener('click', () => helpModal.classList.remove('hidden'));
    closeHelp.addEventListener('click', () => helpModal.classList.add('hidden'));
    closeHelpBtn.addEventListener('click', () => helpModal.classList.add('hidden'));

    // 主题切换
    themeToggle.addEventListener('click', toggleTheme);

    // 显示/隐藏本地图片选择
    zenShow.addEventListener('click', showZen);
    zenHide.addEventListener('click', hideZen);

    imageContainer.addEventListener('click', toggleZoom);
}

// 图片放单缩小
function toggleZoom(e) {
    const image = e.currentTarget
    // 判断当前是否已经是放大状态
    const isZoomed = image.classList.contains('zoomed');

    if (isZoomed) {
        // 如果已放大，则恢复
        image.classList.remove('zoomed');
        // 可选：重置 transform-origin，虽然下次点击会覆盖
        image.style.transformOrigin = 'center center';
    } else {
        // 如果未放大，则计算并放大

        // 1. 获取图片的位置和尺寸信息
        const rect = image.getBoundingClientRect();

        // 2. 计算鼠标点击位置相对于图片左上角的坐标
        // event.clientX 是鼠标相对于浏览器视口的 X 坐标
        // rect.left 是图片相对于浏览器视口的 X 坐标
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 3. 将坐标转换为百分比，因为 transform-origin 使用百分比更方便
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // 4. 设置 transform-origin，让图片从这个点开始放大
        image.style.transformOrigin = `${xPercent}% ${yPercent}%`;

        // 5. 添加 'zoomed' 类来触发放大动画
        image.classList.add('zoomed');
    }
}

// 处理图片选择
function handleImageSelection(input, preview, imageId) {
    return function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // 显示加载状态
        showLoading();

        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = function () {
                // 创建预览图
                preview.innerHTML = '';
                const previewImg = document.createElement('img');
                previewImg.src = event.target.result;
                previewImg.alt = `${imageId}预览图`;
                previewImg.className = 'w-full h-full object-contain';
                preview.appendChild(previewImg);

                // 更新显示图
                if (imageId === 'image1') {
                    displayImage1.src = event.target.result;
                    displayImage1.alt = '原图';
                    imagesLoaded.image1 = true;
                } else {
                    displayImage2.src = event.target.result;
                    sliderImage.src = event.target.result;
                    imagesLoaded.image2 = true;
                }

                // 隐藏加载状态
                hideLoading();

                // 如果是第一次加载两张图片，显示第一张
                if (imagesLoaded.image1 && imagesLoaded.image2 && currentImage === 1) {
                    showImage(1);
                }
            };
            img.onerror = function () {
                alert('无法加载图片，请选择有效的图片文件。');
                hideLoading();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
}

// 显示加载状态
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

// 隐藏加载状态
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// 显示前一张图片
function showPreviousImage() {
    if (currentImage === 1) return;
    showImage(1);
}

// 显示效果图图片
function showNextImage() {
    if (currentImage === 2) return;
    showImage(2);
}

// 显示指定图片
function showImage(imageNumber) {
    if (comparisonMode) {
        toggleComparisonMode(); // 退出对比模式
    }

    currentImage = imageNumber;

    // 设置过渡速度
    // image1Container.style.transitionDuration = `${transitionSpeed}ms`;
    // image2Container.style.transitionDuration = `${transitionSpeed}ms`;

    // 切换图片
    if (imageNumber === 1) {
        image1Container.style.opacity = '100%';
        image2Container.style.opacity = '0%';
    } else {
        image1Container.style.opacity = '0%';
        image2Container.style.opacity = '100%';
    }

    // 更新按钮状态
    updateButtonStates();
}

// 更新按钮状态
function updateButtonStates() {
    prevImageBtn.disabled = currentImage === 1;
    nextImageBtn.disabled = currentImage === 2;

    prevImageBtn.classList.toggle('opacity-50', currentImage === 1);
    nextImageBtn.classList.toggle('opacity-50', currentImage === 2);
}

// 切换对比模式
function toggleComparisonMode() {
    comparisonMode = !comparisonMode;

    if (comparisonMode) {
        // 进入对比模式
        comparisonSlider.classList.remove('hidden');
        comparisonSlider.style.width = '50%';
        modeToggleBtn.innerHTML = '<i class="fa fa-exchange mr-2"></i>普通切换模式';

        // 隐藏当前显示的单张图片
        image1Container.style.opacity = '0%';
        image2Container.style.opacity = '0%';
    } else {
        // 退出对比模式
        comparisonSlider.classList.add('hidden');
        modeToggleBtn.innerHTML = '<i class="fa fa-sliders mr-2"></i>拖拽对比模式';

        // 重新显示当前选中的图片
        if (currentImage === 1) {
            image1Container.style.opacity = '100%';
        } else {
            image2Container.style.opacity = '100%';
        }
    }
}

// 重置视图
function resetView() {
    if (comparisonMode) {
        comparisonSlider.style.width = '50%';
    } else {
        showImage(1);
    }
}

// 调整过渡速度
function adjustTransitionSpeed() {
    transitionSpeed = parseInt(transitionSpeedInput.value);
    speedValueSpan.textContent = `${transitionSpeed}ms`;
}

// 开始拖动
function startDrag(e) {
    if (!comparisonMode) return;
    isDragging = true;
    document.body.style.cursor = 'ew-resize';
}

// 拖动过程
function drag(e) {
    if (!isDragging || !comparisonMode) return;

    const container = document.querySelector('.image-container');
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;

    // 计算滑块位置（相对于容器的百分比）
    let position = ((e.clientX - containerRect.left) / containerWidth) * 100;

    // 限制在0-100%范围内
    position = Math.max(0, Math.min(100, position));

    // 更新滑块位置
    comparisonSlider.style.width = `${position}%`;
}

// 结束拖动
function endDrag() {
    isDragging = false;
    document.body.style.cursor = '';
}

// 处理鼠标滚轮事件
function handleMouseWheel(e) {
    if (comparisonMode) return;

    e.preventDefault();
    if (e.deltaY < 0) {
        showPreviousImage();
    } else {
        showNextImage();
    }
}

// 处理键盘事件
function handleKeyPress(e) {
    if (comparisonMode) return;

    if (e.key === 'ArrowLeft') {
        showPreviousImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
}

// 更新滑块图像
function updateSliderImage() {
    sliderImage.src = displayImage2.src;
    sliderImage.alt = '效果图';
}

// 切换主题
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('bg-gray-100');
    body.classList.toggle('bg-gray-900');
    body.classList.toggle('text-white');

    const isDarkMode = body.classList.contains('bg-gray-900');
    themeToggle.innerHTML = isDarkMode ?
        '<i class="fa fa-sun-o text-yellow-400"></i>' :
        '<i class="fa fa-moon-o text-secondary"></i>';

    // 更新其他元素的颜色
    const cards = document.querySelectorAll('.bg-white');
    cards.forEach(card => {
        card.classList.toggle('bg-white');
        card.classList.toggle('bg-gray-800');
    });

    const helpModalBg = document.getElementById('help-modal');
    helpModalBg.classList.toggle('bg-white');
    helpModalBg.classList.toggle('bg-gray-800');

    const helpModalFooter = helpModal.querySelector('.help-modal-footer');
    helpModalFooter.classList.toggle('bg-gray-50');
    helpModalFooter.classList.toggle('bg-gray-700');
}