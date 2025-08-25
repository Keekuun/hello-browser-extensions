const tabs = await chrome.tabs.query({
    url: [
        'https://developer.chrome.com/docs/webstore/*',
        'https://developer.chrome.com/docs/extensions/*'
    ]
});

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const collator = new Intl.Collator();
tabs.sort((a, b) => collator.compare(a.title, b.title));

const template = document.getElementById('li_template');
const elements = new Set();
for (const tab of tabs) {
    const element = template.content.firstElementChild.cloneNode(true);

    const title = tab.title.split('|')[0].trim();
    const pathname = new URL(tab.url).pathname.slice('/docs'.length);

    element.querySelector('.title').textContent = title;
    element.querySelector('.pathname').textContent = pathname;
    element.querySelector('a').addEventListener('click', async () => {
        // need to focus window as well as the active tab
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    });

    elements.add(element);
}

let isGrouped = false; // 跟踪当前分组状态

document.querySelector('ul').append(...elements);

const button = document.querySelector('button');
button.addEventListener('click', async () => {
    if(isGrouped) {
        await showNotification('Tabs have been ungrouped');
        return;
    }
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: 'Google Dev Docs' });
    }
    checkInitialGroupState()
});

const ungroupBtn = document.querySelector('.ungroup-btn');
ungroupBtn.addEventListener('click', async () => {
    if(!isGrouped) {
        await showNotification('Tabs have been ungrouped');
        return;
    }
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length) {
        await chrome.tabs.ungroup(tabIds);
    }
    checkInitialGroupState()
});

const toggleBtn = document.querySelector('.toggle-btn');

toggleBtn.addEventListener('click', async () => {
    const tabIds = tabs.map(({ id }) => id);

    if (tabIds.length) {
        if (isGrouped) {
            // 如果已分组，执行取消分组
            await chrome.tabs.ungroup(tabIds);
            toggleBtn.textContent = 'Toggle(Group Tabs)';
        } else {
            // 如果未分组，执行分组
            const group = await chrome.tabs.group({ tabIds });
            await chrome.tabGroups.update(group, { title: 'Google Dev Docs' });
            toggleBtn.textContent = 'Toggle(Ungroup Tabs)';
        }
        isGrouped = !isGrouped; // 切换状态
    }
});

// 显示通知的函数
async function showNotification(message) {
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: 'images/icon-48.png', // 确保你有这个图标文件
            title: 'Tab Group Manager',
            message: message
        });
    } catch (error) {
        console.error('Failed to show notification:', error);
        window.alert(message)
    }
}


// 初始检查分组状态
async function checkInitialGroupState() {
    const tabIds = tabs.map(({ id }) => id);
    if (tabIds.length === 0) return;

    const firstTab = await chrome.tabs.get(tabIds[0]);
    isGrouped = firstTab.groupId > 0;
    toggleBtn.textContent = isGrouped ? 'Toggle(Ungroup Tabs)' : 'Toggle(Group Tabs)';
}
// 调用初始检查
checkInitialGroupState();
