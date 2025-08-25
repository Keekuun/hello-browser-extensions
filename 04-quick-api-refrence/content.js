// Popover API https://chromestatus.com/feature/5463833265045504

(async () => {
    const nav = document.querySelector('.upper-tabs > nav');

    const {tip} = await chrome.runtime.sendMessage({greeting: 'tip'});

    const tipWidget = createDomElement(`
    <button type="button" popovertarget="tip-popover" popovertargetaction="show" style="padding: 0 12px; height: 36px;">
      <span style="display: block; font: var(--devsite-link-font,500 14px/20px var(--devsite-primary-font-family));">插件提示按钮</span>
    </button>
  `);

    // 新 popover https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/popover
    const popover = createDomElement(
        `<div id='tip-popover' popover 
                  style="margin: auto; 
                    background: wheat;
                    padding: 10px;
                    border: none;
                    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.3)">${tip}</div>`
    );

    document.body.append(popover);
    nav.append(tipWidget);
})();

function createDomElement(html) {
    const dom = new DOMParser().parseFromString(html, 'text/html');
    return dom.body.firstElementChild;
}