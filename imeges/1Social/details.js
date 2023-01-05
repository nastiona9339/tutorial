const table = document.querySelector('.table')

chrome.storage.local.get(["historyData", "wId"], v => {

    let i = 0;
    
    for(key in v.historyData){
        i++;
        const tableRow = document.createElement('div')
        tableRow.classList.add("tableRow")
        const ladyId = document.createElement('div');
        ladyId.innerText = v.wId;
        const manId = document.createElement('div');
        manId.innerText = key;
        const time = document.createElement('div');
        time.innerText = v.historyData[key].dateOfSend;

        tableRow.appendChild(ladyId);
        tableRow.appendChild(manId);
        tableRow.appendChild(time);

        table.appendChild(tableRow);
    }

    document.querySelector(".countSended").innerText = i;
})

document.querySelector(".closeButton").addEventListener('click', e => {window.close()})