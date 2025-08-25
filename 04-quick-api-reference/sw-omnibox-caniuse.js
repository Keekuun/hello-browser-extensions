// https://developer.mozilla.org/zh-CN/docs/Mozilla/Add-ons/WebExtensions/API/omnibox
console.log('sw-omnibox-caniuse.js');

// Initialize default API suggestions
chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.storage.local.set({
            apiSuggestions: ['tabs', 'storage', 'scripting']
        });
    }
});

const URL_CANIUSE_SERACH =
    'https://caniuse.com/?search=';
const NUMBER_OF_PREVIOUS_SEARCHES = 4;

// Display the suggestions after user starts typing
chrome.omnibox.onInputChanged.addListener(async (input, suggest) => {
    await chrome.omnibox.setDefaultSuggestion({
        description: 'Enter a web api or choose from past searches'
    });
    const { caniuseApiSuggestions } = await chrome.storage.local.get('caniuseApiSuggestions');
    const suggestions = caniuseApiSuggestions.map((api) => {
        return { content: api, description: `Open caniuse.${api} API` };
    });
    suggest(suggestions);
});

// Open the reference page of the chosen API
chrome.omnibox.onInputEntered.addListener((input) => {
    chrome.tabs.create({ url: URL_CANIUSE_SERACH + input });
    // Save the latest keyword
    updateHistory(input);
});

async function updateHistory(input) {
    const { caniuseApiSuggestions } = await chrome.storage.local.get('caniuseApiSuggestions');
    caniuseApiSuggestions.unshift(input);
    caniuseApiSuggestions.splice(NUMBER_OF_PREVIOUS_SEARCHES);
    return chrome.storage.local.set({ caniuseApiSuggestions });
}