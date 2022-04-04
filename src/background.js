chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type){
        case "download":
            chrome.windows.create({'url': chrome.extension.getURL('download.html'), 'type': 'popup', 'height': 600, 'width': 350}, function(window) {

            });
            break;
        case "showPageAction":
            chrome.pageAction.show(sender.tab.id);
            break;
        case "setProgress":
            chrome.runtime.sendMessage({type: "setProgressText", progress: message.progress})
            return;
            break;
    }
    console.log(message, sender)

    sendResponse();
})
