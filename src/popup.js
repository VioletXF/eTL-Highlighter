chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch(message.type){
        case "setProgressText":
            document.getElementById("progress").innerText = message.progress;
    }
})
