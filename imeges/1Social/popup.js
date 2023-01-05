const showPass = document.querySelector(".password-control");
const emailInput = document.querySelector(".email-input");
const passInput = document.querySelector("#password-input");
const authButton = document.querySelector(".authButton");
const captchaBlock = document.querySelector(".captcha");
const captchaCheck = document.querySelector(".captchaCheck");
const captchaInput = document.querySelector(".captcha-input");

const emailError = document.querySelector(".error")

const manAgeMin = document.querySelector('#manAgeMin');
const manAgeMax = document.querySelector('#manAgeMax');
const manAgeMin2 = document.querySelector('#manAgeMin2');
const manAgeMax2 = document.querySelector('#manAgeMax2');
const blackList = document.querySelector("#blackList");

const siteEmail = document.querySelector("#site_login");
const sitePass = document.querySelector("#site_pass");
const siteAuth = document.querySelector(".site_auth");
const port = chrome.runtime.connect({name: "sendMessage"});

const checkButton = document.querySelector("#checkButton");
const startButton = document.querySelector('.startWork');

const count = document.querySelector(".symbolsCount1");
const regExp = /[а-яё]/i;
const textArea = document.querySelector(".messageAreas");
const messageError = document.querySelector(".messageError");

const photoData = document.querySelector(".uploadedPhotoData");

let input = document.querySelector('.file_input');


chrome.storage.local.get(null, v => {
    emailInput.value = v.email || "";
    passInput.value = v.pass || "";
    if(!v.email && !v.pass){authButton.disabled=true;}

    v.auth && (document.querySelector(".authPopUp").style.display="none")

    siteEmail.value = v.site_login || "";
    sitePass.value = v.site_pass || "";
    v.siteAuth && (document.querySelector(".siteAuthPopUp").style.display = "none");

    manAgeMin.value = v.manAgeMin || 18;
    manAgeMax.value = v.manAgeMax || 75;

    manAgeMin2.value = v.manAgeMin2 || -1;
    manAgeMax2.value = v.manAgeMax2 || -1;

    document.querySelector("#limitInput").value = +v.limit || 200;
    !!v.limit? false : chrome.storage.local.set({limit:200});

    for (let key in v) {
        if(v[key]){
            key.indexOf("Switch")>-1 &&  document.querySelector(`#${key}`).classList.add("switch-on");
        }
        if(key == "isOn" && v[key] !=undefined && v[key]){
            document.querySelector(".blureScreen").style.display = "none";
            document.querySelector(`#logOutSwitch`).classList.add("switch-on");
        } else {
            document.querySelector(".blureScreen").style.display = "flex";
        }
    }

    if(v.lastPage == 0){
        document.querySelector(".message").style.display = "block";
        document.querySelector(".photoUploader").style.display = "flex"
        checkButton.style.display="flex";
        document.querySelector('.chosenBlock').style.display="none";
        startButton.style.display="none";
    } else if(v.lastPage == 1){
        document.querySelector(".message").style.display = "none";
        document.querySelector(".photoUploader").style.display = "none"
        checkButton.style.display="none";
        document.querySelector('.chosenBlock').style.display="flex";
        startButton.style.display="flex";
    }

    textArea.innerHTML = v.textHTML || "";
    count.innerHTML = textArea.innerText.length;


    function dataURLtoFile(dataurl, filename) {
        
        let arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/),
            bstr = atob(arr[1]),
            n = arr[1].length,
            u8arr = new Uint8Array(n);
    
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
    
        return new File([u8arr], filename, { type: mime });
    }

    if(!!v.photo){   
        const photo = dataURLtoFile(v.photo, "photo");
        const container = new DataTransfer();
        container.items.add(photo);
    
        input.files = container.files;

        document.querySelector(".photo_block").src=v.photo || "";

        photoData.children[0].innerText=input.files[0].name;
        photoData.children[1].innerText= Math.round(input.files[0].size/1024) + " KB"; 


        document.querySelector(".uploadFieldWrapper").style.display="none";
        document.querySelector(".deletePhoto").style.opacity="1";
        document.querySelector(".uploadField").style.width = "85%";
        document.querySelector(".photoError").style.display = "none";
        document.querySelector(".uploadedPhoto").style.display="flex";
    }

    const selectInputs = document.querySelectorAll(".__select__input");

    for(let i = 0; i < selectInputs.length; i++){
        if(v.region != undefined && v.region[i+1]){
            selectInputs[i].checked = true;
        }
    }

    document.querySelector(".count1").innerText = v.sended || 0;
    document.querySelector(".count2").innerText = v.limit || 0;
    document.querySelector('.progressBar').style.width = `${((+v.sended)/v.limit)*275}px`

})

showPass.addEventListener("click", () => {
    if(passInput.type == "password"){
        showPass.classList.toggle("active");
        passInput.type = "text";
    } else {
        showPass.classList.toggle("active");
        passInput.type = "password";
    }
})

function validate () {
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    var address = emailInput.value;
    if(reg.test(address) == false) {
        emailInput.classList.add("inputError");
        emailError.style.display = "block";
        authButton.disabled = true;
    } else {
        emailInput.classList.remove("inputError");
        emailError.style.display = "none";
        authButton.disabled = false;

    }
}

emailInput.addEventListener("input", e => {
    chrome.storage.local.set({email: e.target.value});
})

emailInput.addEventListener("blur", () => {
    if(emailInput.value === ""){
        emailInput.classList.add("inputError");
        emailInput.placeholder = "Введите email"  
        authButton.disabled = true;
    } else{
        emailInput.placeholder = "Email"
        validate();
    }
});

passInput.addEventListener("blur", () => {
    if(passInput.value === ""){
        passInput.classList.add("inputError");
        passInput.placeholder = "Введите пароль"  
        authButton.disabled = true;
    } else{
        passInput.classList.remove("inputError");
        passInput.placeholder = "Пароль"
        authButton.disabled = false;
    }
})

passInput.addEventListener("input", e => {
    chrome.storage.local.set({pass: e.target.value});
})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

let captcha = true;
let loginTry = 0;

let captchaA = getRandomInt(1,51);
let captchaB = getRandomInt(1,51);
let captchaValue = captchaA + captchaB;

captchaCheck.innerHTML = `${captchaA} + ${captchaB}`;

authButton.addEventListener("click", () => {

    document.querySelector(".loader-icon").style.display="block";
    authButton.disabled = true;

    if(+captchaInput.value === captchaValue){captcha = true;}
    if(captcha == true){
        const requestUrl = "https://europe-west3-plucky-respect-298315.cloudfunctions.net/employee-auth-verify";
        const xhr = new XMLHttpRequest();
    
        xhr.open("POST", requestUrl, true);
        xhr.setRequestHeader("Content-Type", "application/json");
    
        xhr.responseType = "json";
    
        xhr.onload = () => {
            if (xhr.status === 200) {
                chrome.storage.local.set({auth: true});
                document.querySelector(".loginError").style.display="none";
                captchaBlock.style.display = "none";
                document.querySelector(".loader-icon").style.display="none";
                authButton.disabled = false;
                document.querySelector(".authPopUp").style.display="none";
                document.querySelector(".siteAuthPopUp").style.display="flex";

            } else {
                document.querySelector(".loginError").style.display="block";
                document.querySelector(".lockImage").style.display = "none";
                document.querySelector(".authPopUp_wrapper").children[1].style.marginTop = "20px";
                

                chrome.storage.local.set({auth: false});
                captcha = false;
    
                captchaA = getRandomInt(1,51);
                captchaB = getRandomInt(1,51);
                document.querySelector(".captcha").style.display="block";
                document.querySelector(".captchaCheck").innerHTML=`${captchaA} + ${captchaB}`;
                captchaValue = captchaA+captchaB;
                captchaInput.value = "";
                
                captchaBlock.style.display = "block";
                document.querySelector(".captchaError").style.display="none";

                document.querySelector(".loader-icon").style.display="none";
                authButton.disabled = false;
            }
        }
        const body = {
            email: emailInput.value,
            password: passInput.value
        }
    
        xhr.send(JSON.stringify(body));
    } else {
        document.querySelector(".captcha").style.display = "block";
        document.querySelector(".loginError").style.display="none";
        document.querySelector(".captchaError").style.display="block";
        document.querySelector(".loader-icon").style.display="none";
        captchaInput.value = "";
        authButton.disabled = false;
    }


})

// ========================================================================================================================== //



siteEmail.addEventListener("input", e => {
    chrome.storage.local.set({site_login: e.target.value});
})
sitePass.addEventListener("input", e => {
    chrome.storage.local.set({site_pass: e.target.value});
})

siteAuth.addEventListener("click", () => {

    document.querySelector(".loader-icon2").style.display = "block";

    port.postMessage({
        type: "auth",
        email: siteEmail.value,
        pass: sitePass.value
    });
    chrome.storage.local.set({isOn:true})
})

const showPassSite = document.querySelector(".password-control-site");

showPassSite.addEventListener("click", () => {
    if(sitePass.type == "password"){
        showPassSite.classList.toggle("active");
        sitePass.type = "text";
    } else {
        showPassSite.classList.toggle("active");
        sitePass.type = "password";
    }
})

const siteAuthPopup = document.querySelector('.siteAuthPopUp');
const logOutBlock =  document.querySelector('.logOutBlock');
const addMessage = document.querySelector('.addMessage');
const progressPopUp = document.querySelector('.progressPopUp');

const checkAuth = setInterval(() => {
    chrome.storage.local.get(["siteAuth", "isOn", "auth", "inProgress", "sended", "limit", "siteAuthError"], v => {
        if(v.siteAuth && (v.isOn || document.querySelector("#logOutSwitch").classList.length == 1)){
            siteAuthPopup.style.display = "none";
            logOutBlock.style.display = "flex";
            document.querySelector(".count2").innerText = v.limit || 0;
            v.isOn && (document.querySelector(".blureScreen").style.display = "none");
            v.isOn && document.querySelector("#logOutSwitch").classList.add('switch-on');
            addMessage.style.display = "flex";

            if(v.inProgress) {
                progressPopUp.style.display = "flex";
                document.querySelector(".count1").innerText = v.sended || 0;
                document.querySelector('.progressBar').style.width = `${((+v.sended)/v.limit)*275}px`
            } else {
                progressPopUp.style.display = "none";
            }
        }else if(!v.auth){
            document.querySelector('.authPopUp').style.display = "flex";
            siteAuthPopup.style.display = "flex";
            logOutBlock.style.display = "none";
            addMessage.style.display = "none";
            chrome.storage.local.set({lastPage: 0});
        }       
        
        if(v.siteAuthError){
            document.querySelector(".siteAuthError").style.display="block"
            document.querySelector(".loader-icon2").style.display="none";
        } else {
            document.querySelector(".siteAuthError").style.display="none"
        }
    })
}, 500)

// ========================================================================================================================== //



textArea.addEventListener('input', e => {
    count.innerHTML = e.target.innerText.length;
    if(e.target.innerText.length > 100 && e.target.innerText.length < 1200){
        document.querySelector('.symbols').style.color="#000"
    } else {
        document.querySelector('.symbols').style.color="#FF325A"
    }
    if(regExp.test(e.target.innerText)){
        messageError.innerText = "Пожалуйста, добавьте текст на английском языке без спецсимволов '{ } |'";
        messageError.style.display = "block";
    } else {
        messageError.style.display = "none";
    }
})

textArea.addEventListener('blur', e => {
    chrome.storage.local.set({text: `${textArea.innerText}`});
    chrome.storage.local.set({textHTML: textArea.innerHTML});
    !!document.querySelector(".nameVariable") && chrome.storage.local.set({nameVariable: document.querySelector(".nameVariable").innerText});
    !!document.querySelector(".cityVariable") && chrome.storage.local.set({cityVariable: document.querySelector(".cityVariable").innerText});
    count.innerHTML = e.target.innerText.length;
})

textArea.addEventListener("keydown", (e) => {
    if(e.code === "Enter"){
        e.stopPropagation();
        e.preventDefault();
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        range.deleteContents();
        const newLine = document.createElement("br");
        range.insertNode(newLine);
    }
})

textArea.addEventListener("paste", (e) => {
    let clipboardData, pastedData;
   
    e.stopPropagation();
    e.preventDefault();

    clipboardData = e.clipboardData || window.сlipboardData;
    pastedData = clipboardData.getData("text");
    document.execCommand("insertHTML", false, pastedData);

    let textHtml = textArea.innerHTML;
    textHtml = textHtml.replaceAll("\n\n\n", "<br/>");
    textHtml = textHtml.replaceAll("\n\n", "<br/>");
    textHtml = textHtml.replaceAll("\n", "<br/>");
    textArea.innerHTML = textHtml;

})

const checkIncludeTextArea  = (sel) => {
    if ((!!sel?.anchorNode?.classList && sel?.anchorNode?.classList[0] == "messageAreas") 
        || 
        (!!sel?.anchorNode?.parentElement?.classList  && sel?.anchorNode?.parentElement?.classList[0] == "messageAreas") 
        || 
        (!!sel?.anchorNode?.parentElement?.parentElement.classList  && sel?.anchorNode?.parentElement?.parentElement?.classList[0] == "messageAreas")
        ||
        (!!sel?.anchorNode?.parentElement?.parentElement?.parentElement.classList  && sel?.anchorNode?.parentElement?.parentElement?.parentElement?.classList[0] == "messageAreas")
    ){
        return true
    } else {
        return false
    }
} 

document.querySelector(".name").addEventListener("click", (e) => {
    const nameBlock = document.createElement("div");
    nameBlock.classList.add("notEditable");
    nameBlock.classList.add("nameVariable");
    nameBlock.contentEditable=false;
    nameBlock.innerHTML = "{name | ";

    const name = document.createElement('p');
    name.classList.add("editableName");
    chrome.storage.local.get("inputName", v => {
        if(!!v.inputName){
            name.innerHTML = v.inputName
        } else {
            name.innerHTML = "Dear";
            chrome.storage.local.set({inputName: "Dear"})
        }
    })
    
    nameBlock.appendChild(name);

    const imgEdit = document.createElement("img");
    imgEdit.classList.add("editButton");
    imgEdit.src="/img/edit-icon.svg";
    nameBlock.appendChild(imgEdit);
    name.insertAdjacentHTML("afterEnd", "}");

    const imgDelete = document.createElement("img");
    imgDelete.classList.add("deleteButton");
    imgDelete.src="/img/delete-icon.svg";
    nameBlock.appendChild(imgDelete);

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    if(checkIncludeTextArea(sel)){
        range.deleteContents();
        range.insertNode(nameBlock); 
        messageError.style.display = "none";
    } else {
        messageError.style.display = "block";
        messageError.innerText = "Установить курсор в поле ввода текста";
    }
    imgEdit.addEventListener("click", () => {
        name.contentEditable=true;
        name.focus();
    })

    name.addEventListener('input', () => {
        chrome.storage.local.set({inputName: name.innerText});
    })

    name.addEventListener("blur", () => {name.contentEditable=false;})

    imgDelete.addEventListener("click", () => {
        nameBlock.remove();
    })
})

document.querySelector(".country").addEventListener("click", () => {

    const block = document.createElement("p");
    block.classList.add("notEditableSimple");
    block.contentEditable=false;
    block.innerHTML = "{Country}";

    const imgDelete = document.createElement("img");
    imgDelete.classList.add("deleteButton");
    imgDelete.src="/img/delete-icon.svg";
    block.appendChild(imgDelete);

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    if(checkIncludeTextArea(sel)){
        range.deleteContents();
        range.insertNode(block); 
        messageError.style.display = "none";
    } else {
        messageError.style.display = "block";
        messageError.innerText = "Установить курсор в поле ввода текста";
    }

    imgDelete.addEventListener("click", () => {
        block.remove();
    })
})

document.querySelector(".city").addEventListener("click", () => {

    const block = document.createElement("div");
    block.classList.add("notEditable");
    block.classList.add("cityVariable");
    block.contentEditable=false;
    block.innerHTML = "{City | ";

    const city = document.createElement('p');
    city.classList.add("editableName");
    chrome.storage.local.get("inputCity", v => {
        if( !!v.inputCity){
            city.innerHTML = v.inputCity
        } else {
            city.innerHTML = "New York";
            chrome.storage.local.set({inputCity: "New York"})
        }
    })
    
    block.appendChild(city);

    const imgEdit = document.createElement("img");
    imgEdit.classList.add("editButton");
    imgEdit.src="/img/edit-icon.svg";
    block.appendChild(imgEdit);
    city.insertAdjacentHTML("afterEnd", "}");

    const imgDelete = document.createElement("img");
    imgDelete.classList.add("deleteButton");
    imgDelete.src="/img/delete-icon.svg";
    block.appendChild(imgDelete);

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    if(checkIncludeTextArea(sel)){
        range.deleteContents();
        range.insertNode(block); 
        messageError.style.display = "none";
    } else {
        messageError.style.display = "block";
        messageError.innerText = "Установить курсор в поле ввода текста";
    }

    imgEdit.addEventListener("click", () => {
        city.contentEditable=true;
        city.focus();
    })

    city.addEventListener('input', () => {
        chrome.storage.local.set({inputCity: city.innerText});
    })

    city.addEventListener("blur", () => {
        city.contentEditable=false;
    })

    imgDelete.addEventListener("click", () => {
        block.remove();
    })
})
document.querySelector(".age").addEventListener("click", () => {

    const block = document.createElement("p");
    block.classList.add("notEditableSimple");
    block.contentEditable=false;
    block.innerHTML = "{Age}";

    const imgDelete = document.createElement("img");
    imgDelete.classList.add("deleteButton");
    imgDelete.src="/img/delete-icon.svg";
    block.appendChild(imgDelete);

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    if(checkIncludeTextArea(sel)){
        range.deleteContents();
        range.insertNode(block); 
        messageError.style.display = "none";
    } else {
        messageError.style.display = "block";
        messageError.innerText = "Установить курсор в поле ввода текста";
    }

    imgDelete.addEventListener("click", () => {
        block.remove();
    })
})
document.querySelector(".zodiac").addEventListener("click", () => {

    const block = document.createElement("p");
    block.classList.add("notEditableSimple");
    block.contentEditable=false;
    block.innerHTML = "{Zodiac}";

    const imgDelete = document.createElement("img");
    imgDelete.classList.add("deleteButton");
    imgDelete.src="/img/delete-icon.svg";
    block.appendChild(imgDelete);

    const sel = window.getSelection();
    const range = sel.getRangeAt(0);
    if(checkIncludeTextArea(sel)){
        range.deleteContents();
        range.insertNode(block); 
        messageError.style.display = "none";
    } else {
        messageError.style.display = "block";
        messageError.innerText = "Установить курсор в поле ввода текста";
    }
    imgDelete.addEventListener("click", () => {
        block.remove();
    })
})


input.addEventListener('change', function (evt) {

    if(input.files && input.files[0].size > 3393039){
        document.querySelector(".uploadedPhoto").style.display="none";
        document.querySelector(".photoError").style.display = "block";
        document.querySelector(".photoError").innerText = "Файл слишком большой";
    } else if(!!input.files) {
        document.querySelector(".uploadFieldWrapper").style.display="none";
        document.querySelector(".deletePhoto").style.opacity="1";
        document.querySelector(".uploadField").style.width = "85%";
        document.querySelector(".photoError").style.display = "none";
        document.querySelector(".uploadedPhoto").style.display="flex";

        photoData.children[0].innerText=input.files[0].name;
        photoData.children[1].innerText= Math.round(input.files[0].size/1024) + " KB"; 



        const file = evt.target.files[0]; // FileList object
        const reader = new FileReader();
        reader.readAsDataURL(file);

        // Closure to capture the file information.
        reader.onload = () => {
            document.querySelector(".photo_block").src=reader.result;
            chrome.storage.local.set({photo: reader.result});
        }
    }
    
});

const photoDeleter = document.querySelector('.deletePhoto');
photoDeleter.addEventListener('click', () => {
    input.value = "";
    document.querySelector(".photo_block").src = "img/icon_upload_image.svg";
    document.querySelector(".uploadFieldWrapper").style.display="flex";
    document.querySelector(".uploadedPhoto").style.display="none";
    document.querySelector(".uploadField").style.width = "90%";
    document.querySelector(".deletePhoto").style.transition = "all .5s ease-in-out";
    document.querySelector(".deletePhoto").style.opacity="0";
    setTimeout(() => {document.querySelector(".deletePhoto").style.transition = "all 1s ease-in-out .7s"},2000)   

    chrome.storage.local.set({photo: ""});
})


const checkMessage = () => {
    let check = {
        quantity: false,
        error:false,
    }

    textArea.innerText.length > 100 && textArea.innerText.length <= 1200 && (check.quantity = true);
    (messageError.style.display == "none" ||  messageError.style.display == "") && (check.error = true);

    if(check.quantity && check.error) {
        document.querySelector(".message").style.display = "none";
        document.querySelector(".photoUploader").style.display = "none"
        checkButton.style.display="none";
        document.querySelector('.chosenBlock').style.display="flex";
        startButton.style.display="flex";
        chrome.storage.local.set({lastPage: 1});
    } else if(!check.quantity){
        document.querySelector(".symbols").style.color="#FF325A";
        messageError.style.display = "block"
        messageError.innerHTML="Текст должен содержать от 100 до 1200 английских символов."
        textArea.focus();
    } else if(!check.error){
        messageError.style.display = "block";
        messageError.style.display = "Пожалуйста, добавьте текст на английском языке";
        textArea.focus();
    }
}
    
checkButton.addEventListener("click", () => {
    checkMessage();
});


const switchers = document.querySelectorAll(".switch-btn");
switchers.forEach((item) => {
    item.addEventListener('click', () => {
        item.classList.toggle('switch-on');
        if(item.classList.length>1){
            chrome.storage.local.set({[item.id]:true});
        } else {
            chrome.storage.local.set({[item.id]:false});
        };
    })
})

blackList.addEventListener('input', () => {
    chrome.storage.local.set({blackList:blackList.value});    
})

blackList.addEventListener('blur', (v) => {
    let data = blackList.value.replace(/,/g, ";");
    data = data.replace(/\./g, ";");
    data = data.replace(/\s/g, ";");
    blackList.value = data
    chrome.storage.local.set({blackList:blackList.value});   
})

for(let i = 18; i<=75;i++){
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    manAgeMin.appendChild(option);
    manAgeMax.appendChild(option.cloneNode(true));

    manAgeMin2.appendChild(option.cloneNode(true));
    manAgeMax2.appendChild(option.cloneNode(true));
}

manAgeMin2.addEventListener('change', () => {
    chrome.storage.local.set({manAgeMin2:+manAgeMin2.value});
})

manAgeMax2.addEventListener('change', () => {
    chrome.storage.local.set({manAgeMax2:+manAgeMax2.value});
})

manAgeMin.addEventListener('change', () => {
    chrome.storage.local.set({manAgeMin: +manAgeMin.value});
})

manAgeMax.addEventListener('change', () => {
    chrome.storage.local.set({manAgeMax: +manAgeMax.value});
})

document.querySelector('.back').addEventListener('click', () => {
    document.querySelector(".message").style.display = "block";
    document.querySelector(".photoUploader").style.display = "flex"
    checkButton.style.display = "flex";

    document.querySelector('.chosenBlock').style.display="none";
    startButton.style.display="none";
    chrome.storage.local.set({lastPage: 0});
})

document.querySelector("#limitInput").addEventListener('change', (e) => {
    chrome.storage.local.set({limit: +e.target.value});
})

const newSelect = document.querySelector(".__select__content")
const selectWrapper = document.querySelector('.__select');
const singleLine = document.querySelector('.singleLine');
const downArrow = document.querySelector("#downArrow");
const downArrowBlock = document.querySelector(".downArrowBlock");

let isOpen = false;



downArrowBlock.addEventListener("click", () => {
    if(!isOpen){
        singleLine.style.visibility= "hidden";
        singleLine.style.opacity = "0";
        selectWrapper.style.height="150px";
        selectWrapper.style.display="flex";
        downArrow.style.transform = "rotate(180deg)";
        isOpen = true;
    } else {
        singleLine.style.visibility= "inherit";
        singleLine.style.opacity = "1";
        selectWrapper.style.height="48px";
        selectWrapper.style.display="block";
        downArrow.style.transform = "rotate(0deg)";

        isOpen = false;
    }

})

let regionData
chrome.storage.local.get("region", v => {
    regionData = v.region || {};

    document.querySelector(".__select__content").addEventListener('input', (e) => {

        let id = +e.target.id.split('singleSelect')[1];
        regionData[id] = e.target.checked
        chrome.storage.local.set({region: regionData});
    })
})

chrome.storage.local.get(console.log);

document.querySelector(".stopButton").addEventListener('click', e => {
    chrome.storage.local.set({inProgress: false});
    chrome.storage.local.set({lastProgress: false});
    
})

startButton.addEventListener('click', () => {
    
    chrome.storage.local.get(["isOn","lastProgress","sended", "limit"], v => {
        if(v.isOn){
            const data = {
                text: textArea.innerText,
                photo: input.files[0],
        
                manAgeMin: +manAgeMin.value,
                manAgeMax: +manAgeMax.value,
        
                manAgeMin2: +manAgeMin2.value,
                manAgeMax2: +manAgeMax2.value,
        
                limit: +document.querySelector('#limitInput').value,      
            }
            chrome.storage.local.set({lastPage: 0});
            chrome.storage.local.set({allSended: false});
            chrome.storage.local.set({sended: 0});

            chrome.storage.local.set({inProgress: true});
            chrome.storage.local.set({lastProgress: true});
            chrome.storage.local.set({historyData: {}});

            chrome.storage.local.set({currentSending:false});
            chrome.storage.local.set({switchNextPage:false});

            document.querySelector(".count1").innerText = v.sended || 0;
            document.querySelector(".count2").innerText = v.limit || 0;
            document.querySelector('.progressBar').style.width = `${((+v.sended)/v.limit)*275}px`

        
            if(+manAgeMin2.value>0){
                data.manAgeMin2 = manAgeMin2.value
            }
            if(+manAgeMax2.value>0){
                data.manAgeMax2 = manAgeMax2.value
            }
        
            port.postMessage({type: "dataFromPopup", data});
            port.postMessage({type: "openTab", url: "https://www.1st-social.com/cc.php"});

        } else {
            alert("Вы не включили расширение");
        }
    })
    
})

document.querySelector('.logOut').addEventListener('click', () => {
    port.postMessage({type:"logOut"});
    window.close();
})

document.querySelector('.history').addEventListener('click', () => {
    const detailsURL = chrome.runtime.getURL("/details.html");
    port.postMessage({type:"openTab", url:detailsURL});
    window.close();
})

document.querySelector("#logOutSwitch").addEventListener('click', () => {
    if(document.querySelector("#logOutSwitch").classList.length > 1){
        chrome.storage.local.get("lastProgress", v => {
            if(v.lastProgress){
                chrome.storage.local.set({inProgress:true});
                document.querySelector(".progressPopUp").style.display = "flex";
            }
        })
        chrome.storage.local.set({isOn:true});
        document.querySelector(".blureScreen").style.display = "none";
    } else {
        chrome.storage.local.set({isOn:false});
        document.querySelector(".blureScreen").style.display = "flex";

        chrome.storage.local.get("lastProgress", v => {
            if(v.lastProgress){
                chrome.storage.local.set({inProgress:false});
                document.querySelector(".progressPopUp").style.display = "none";
            }
        })
    } 
})

setTimeout(() => {
    if(textArea.innerText.length>0){
        const deleteButtons = document.querySelectorAll(".deleteButton");
        for(let i = 0; i < deleteButtons.length; i++){
            deleteButtons[i].addEventListener("click", () => {
                deleteButtons[i].parentElement.remove();
            } )
        }

        const editButton = document.querySelectorAll(".editButton");
        for(let i = 0; i < editButton.length; i++){
            editButton[i].addEventListener('click', () => {
                editButton[i].parentElement.children[0].contentEditable = true;
                editButton[i].parentElement.children[0].focus();
            })

            if(editButton[i].parentElement.classList[1] == "cityVariable"){
                editButton[i].parentElement.children[0].addEventListener("input", () => {
                    chrome.storage.local.set({inputCity: editButton[i].parentElement.children[0].innerText})
                });
            } else if(editButton[i].parentElement.classList[1] == "nameVariable") {
                editButton[i].parentElement.children[0].addEventListener("input", () => {
                    chrome.storage.local.set({inputName: editButton[i].parentElement.children[0].innerText})
                });
            }

            editButton[i].addEventListener('blur', () => {
                editButton[i].parentElement.children[0].contentEditable = false;
            })
        }
    } 
},1500)


