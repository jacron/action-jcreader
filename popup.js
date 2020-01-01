function getJcReaderHost(url) {
    url = url.replace(/http[s]?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function loadUserscript(tabId) {
    const url = `${config.JcUserscript}`;
    chrome.tabs.update(tabId, {url})
}

function doActionReload(url, tabId) {
    fetch(url)
        .then(res => res.json())
        .then(() => loadUserscript(tabId))
        .catch(err => console.error(err));
}

function doAction(url) {
    fetch(url)
        .then(res => res.json())
        .then(result => console.log(result))
        .catch(err => console.error(err));
}

function postNew(host) {
    console.log('host', host);
    const url = `${config.JCApi}/newsite/${host}`;
    fetch(url)
        .then(res => res.json())
        .then(result => console.log(result))
        .catch(err => console.error(err));
}

function setNewReaderActions(host) {
    document.getElementById('new-answer-no').addEventListener('click',
        () => window.close());
    document.getElementById('new-answer-yes').addEventListener('click',
        () => postNew(host));
}

function deleteReader(host) {
    if (confirm(`'${host}' verwijderen?`)) {
        doAction(`${config.JCApi}/delete/${host}`);
    }
}
function setReaderActions(host, tabId) {
    const actionBindings = [
        ['reader-css', '/edit/css?name=' + host],
        ['reader-selector', '/edit/selector?name=' + host],
        ['default-css', '/edit/default'],
        ['dark-css', '/edit/dark'],
    ];
    for (const [binding, endpoint] of actionBindings) {
        document.getElementById(binding).addEventListener('click',
            () => {doAction(`${config.JCApi}${endpoint}`);
            });
    }
    document.getElementById('reader-rebuild').addEventListener('click',
        () => {doActionReload(`${config.JCApi}/build/noview`, tabId);
    });
    document.getElementById('reader-delete').addEventListener('click',
        () => deleteReader(host));
}

function show(s, host, tabId) {
    const existing = document.getElementById('existing-reader-dialog');
    const newview = document.getElementById('new-reader-dialog');
    if (s) {
        existing.style.display = 'block';
        setReaderActions(host, tabId);
        const readerDialog = document.getElementById('reader-dialog');
        readerDialog.style.display = 'block';
    } else {
        newview.style.display = 'block';
        setNewReaderActions(host);
    }
}

function processJcReader(host, tabId) {
    fetch(`${config.JCApi}/exists/${host}`)
        .then(res => res.json())
        .then(result => show(result, host, tabId))
        .catch(err => console.error(err));
}

function initJcReader() {
    const reader = document.getElementById('reader');
    const hostName = document.getElementById('host-name');
    reader.innerText = 'JCReader';
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        const url = tabs[0].url;
        const tabId = tabs[0].id;
        const host = getJcReaderHost(url);
        hostName.innerText = host;
        processJcReader(host, tabId);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initJcReader();
});
