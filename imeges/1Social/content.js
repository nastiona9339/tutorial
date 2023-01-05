const port = chrome.runtime.connect({name: "sendMessage"});

if(document.location.href == "https://www.1st-social.com/crp.php"){
    let lastAuth = new Date();
    lastAuth = lastAuth.toString();
    chrome.storage.local.set({lastAuth});
    setTimeout(() => {
        port.postMessage({type: "closeTab"});
    },2000)
    chrome.storage.local.get(["inProgress", "site_login", "site_pass"], (v) => {
        if(v.inProgress){
            const fields = document.querySelectorAll(".no");
            fields[0].value = v.site_login;
            fields[1].value = v.site_pass;
            fields[2].click();
        } else if(!!document.querySelectorAll(".no").length >= 3){
            chrome.storage.local.set({siteAuth: false});
            port.postMessage({type: "closeTab"});
        }
    })
}

if(document.location.href == "https://www.1st-social.com/contact.html"){
    let newAuth = new Date();
    newAuth = newAuth.toString();
    chrome.storage.local.set({newAuth});
    setTimeout(() => {
        port.postMessage({type: "closeTab"});
    },2000)
}

chrome.storage.local.get(["inProgress", "site_login", "site_pass"], v => {
    if(!!document.querySelectorAll(".no").length == 3 && v.inProgress){
        const fields = document.querySelectorAll(".no");
        fields[0].value = v.site_login;
        fields[1].value = v.site_pass;
        fields[0].click;

    }
})

if(document.location.href == "https://www.1st-social.com/member.php" && !!document.querySelectorAll(".no").length >= 3){
    chrome.storage.local.get(["inProgress", "site_login", "site_pass"], v => {
        if(v.inProgress){
            const fields = document.querySelectorAll(".no");
            fields[0].value = v.site_login;
            fields[1].value = v.site_pass;
            fields[2].click();
        } else {
            chrome.storage.local.set({siteAuthError: true});
            chrome.storage.local.set({siteAuth: false});
            port.postMessage({type: "closeTab"});
        }
    })
}

if(document.location.href.indexOf("logtrackID")>-1){
    chrome.storage.local.set({siteAuth: true});
    chrome.storage.local.set({siteAuthError: false});
    chrome.storage.local.set({isOn: true});
}

chrome.storage.local.get("isOn", v => {
    if(v.isOn){
        port.postMessage({type: "askAuth"});

        if(document.location.href == "https://www.1st-social.com/cc.php"){
            document.querySelector(".LoggedMenuDiv").children[1].children[1].children[0].click();
        }

        if(document.location.pathname == '/profile_edit.php'){
            const wId = document.location.href.split("https://www.1st-social.com/profile_edit.php?ID=")[1];
            chrome.storage.local.set({wId});
            setTimeout( () => {
                port.postMessage({type: "closeTab"});
            }, 2000)
        }

        port.onMessage.addListener(msg => {
            if(!!document.querySelector('input[name="ID"]') && msg.type == "authContent" && document.location.href == "https://www.1st-social.com/"){
                document.querySelector('input[name="ID"]').value = msg.email;
                document.querySelector('input[name="Password"]').value = msg.password;
                document.querySelector('input[name="imageField"]').click();
            } else if(document.location.href == "https://www.1st-social.com/" && !document.querySelector('input[name="ID"]')){
                chrome.storage.local.set({siteAuth: true});
            }
        })
        
        if(document.location.href.indexOf("logtrackID")>-1){
            chrome.storage.local.set({siteAuth: true});
            chrome.storage.local.set({siteAuthError: false});
            chrome.storage.local.set({isOn: true});
            
            port.postMessage({type: "siteAuth", status: true});
            port.postMessage({type: "closeTab"});
        }
        
        if(document.location.href == "https://www.1st-social.com/logout.php?action=member_logout"){
            chrome.storage.local.set({siteAuth: false});
            chrome.storage.local.set({isOn: false});
            chrome.runtime.sendMessage("siteAuth-true")
            port.postMessage({type: "closeTab"});
            // port.postMessage({type: "siteAuth", status: false});
        }
        
        if(document.location.pathname == '/search_result.php'){
            const allProfiles = document.querySelectorAll('.search_row');
            let i = 0;
        
            const openPages = setInterval(() => {
                chrome.storage.local.get(["isOn","inProgress"], v => {
                    if(v.isOn && v.inProgress){
                        chrome.storage.local.get(["allSended", "currentSending"], v => {
                            if(v.allSended){
                                port.postMessage({type:"pageEnd"});
                                port.postMessage({type: "closeTab"});
                            } else if(v.currentSending == false) {
                                port.postMessage({type: "openManProfile", url: allProfiles[i].href});
                                i++;
                                if(i >= allProfiles.length){
                                    chrome.storage.local.set({switchNextPage:true})
                                    clearInterval(openPages)
                                }
                            }
                        })
                    }
                })
            }, 2000)
        
            const switchPage = setInterval(() => {
                chrome.storage.local.get(["allSended", "isOn", "inProgress", "switchNextPage"], v => {
                    if(!v.allSended && v.isOn && v.inProgress && v.switchNextPage){
                        chrome.storage.local.set({switchNextPage:false})
                        for(let i = 0; i<document.querySelector(".text2").children[0].children[0].children[0].children.length; i++){
                            if(document.querySelector(".text2").children[0].children[0].children[0].children[i].innerText=="Next"){
                                document.querySelector(".text2").children[0].children[0].children[0].children[i].click(); 
                            } else if(i==document.querySelector(".text2").children[0].children[0].children[0].children.length){
                                port.postMessage({type:"pageEnd"});
                                clearInterval(switchPage)
                            }
                        }
                    }
                })
            },5000)
        
        }
        
        if(!!document.querySelector(".tp-right-sidebar")){
        
            const storageData = {};
            chrome.storage.local.get(["manAgeSwitch","manAge2Switch", "excludeManSwitch", "registeredSwitch", "onlineSwitch", "checkPhotoSwitch", "limit", "blackList"], v => {
                for (let key in v) {
                    storageData[key] = v[key];
                }
            })
            const language = document.querySelector(".tp-right-sidebar").children[1].children[3].innerText;
            setTimeout(()=>{
                if(storageData.onlineSwitch && document.querySelector("#UnderPhotoLinkDiv").children[1].children[0].alt == "offline"){
                    port.postMessage({type:"closeTab"});
                    chrome.storage.local.set({"currentSending":false});
                } else if(storageData.blackList != undefined && storageData.blackList.indexOf(document.querySelector(".tp-right-sidebar").children[2].children[0].innerText.slice(4))>-1 ) {
                    port.postMessage({type:"closeTab"});
                    chrome.storage.local.set({"currentSending":false});
                } else if(
                    (language.indexOf("Ukraininan(Intermediate)")>-1 ||
                    language.indexOf("Russian(Intermediate)")>-1 ||
                    language.indexOf("Ukraininan(Basic)")>-1 ||
                    language.indexOf("Russian(Basic)")>-1 ||
                    language.indexOf("Russian(Good)")>-1 ||
                    language.indexOf("Ukraininan(Fluent)")>-1 || 
                    language.indexOf("Russian(Fluent)")>-1) && storageData.excludeManSwitch
                ) {
                    port.postMessage({type:"closeTab"});
                    chrome.storage.local.set({"currentSending":false});
                } else{
                    let menData = {};
                    const manName = document.querySelectorAll('h1')[2];
                    manName.innerText.indexOf(":") > 0 ? (menData.name = manName.innerText.slice(0, manName.innerText.indexOf(":"))) : (menData.name = -1);

                    const string1 = document.querySelector(".tp-right-sidebar").children[1].children[0].innerText;
                    
                    const agePos = string1.indexOf("y/o");
                    menData.age = string1.slice(0, agePos);
                    
                    const position = string1.indexOf("Zodiac:") + 7;
                    menData.zodiac = string1.slice(position, string1.length);
                    
                    const string2 = document.querySelector(".tp-right-sidebar").children[1].children[1].innerText;
                    
                    string2.split(", ")[0] == "" ? menData.city = -1 : menData.city = string2.split(", ")[0];

                    menData.country = string2.split(",")[1];
        
                    menData.id = document.querySelector(".tp-right-sidebar").children[2].children[0].innerText.slice(4);
        
                    chrome.storage.local.set({menData});
        
                    setTimeout(() => {
                        document.location.href = `https://www.1st-social.com/msg.writer.php?ID=${menData.id}`
                    }, 1000)    
                }
            },1000) 
        }
        
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
        let isNoMessages = false;
        if(document.location.pathname == '/msg.writer.php'){
            chrome.storage.local.get(['menData', "text", "inputName", "inputCity", "photo", "allSended", "isOn", 'nameVariable', "cityVariable", "photo"], v => {
                const checkMessage = setInterval(() => {
                    if(!!document.querySelector("correspondence") && document.querySelector("correspondence").children.length > 0){
                        clearInterval(checkMessage);
                        if(document.querySelectorAll("messages")[0].children.length>0){
                            port.postMessage({type: "closeTab"});
                            chrome.storage.local.set({"currentSending":false});

                        } else {
                            isNoMessages = false;
                            if(!v.allSended && v.isOn){
    
                                const chName = v.nameVariable;
                                const chCity = v.cityVariable;
    
                                let text = `${v.text}`;     
                                    
                                while(text.indexOf("}\n")>-1){
                                    text = text.replace("}\n","}");
                                }

                                while(text.indexOf("}&nbsp;")>-1){
                                    text = text.replace("}&nbsp;","}");
                                }

                                while(text.indexOf("\n{")>-1){
                                    text = text.replace("\n{","{");
                                }

                                while(text.indexOf("&nbsp;{")>-1){
                                    text = text.replace("&nbsp;{","{");
                                }
    
                                if(v.menData.city == -1){
                                    while(text.indexOf(chCity) > -1 ||  text.indexOf(`{City | ${v.inputCity}}`) > -1){
                                        text = text.replace(chCity, v.inputCity);
                                        text = text.replace(`{City | ${v.inputCity}}`, v.inputCity);
                                    }
                                } else {
                                    while(text.indexOf(chCity) > -1 ||  text.indexOf(`{City | ${v.inputCity}}`) > -1){
                                        text = text.replace(chCity, v.menData.city);
                                        text = text.replace(`{City | ${v.inputCity}}`, v.menData.city);
                                    }
                                }
    
                                if(v.menData.name == -1){
                                    while(text.indexOf(chName) > -1 ||  text.indexOf(`{name | ${v.inputName}}`) > -1){
                                        text = text.replace(chName, v.inputName);
                                        text = text.replace(`{name | ${v.inputName}}`, v.inputName);
                                    }
                                } else {
                                    while(text.indexOf(chName) > -1 ||  text.indexOf(`{name | ${v.inputName}}`) > -1){
                                        text = text.replace(chName, v.menData.name);
                                        text = text.replace(`{name | ${v.inputName}}`, v.menData.name);
                                    }
                                }

                                while(text.indexOf("{Country}")>-1){
                                    text = text.replace("{Country}", v.menData.country);
                                }

                                while(text.indexOf("{Zodiac}")>-1){
                                    text = text.replace("{Zodiac}", v.menData.zodiac);
                                }

                                while(text.indexOf("{Age}")>-1){
                                    text = text.replace("{Age}", v.menData.age);
                                }

                                while(text.indexOf("\n\n\n\n\n")>-1){
                                    text = text.replace("\n\n\n\n\n"," ");
                                }

                                
                                while(text.indexOf("\n\n\n\n")>-1){
                                    text = text.replace("\n\n\n\n"," ");
                                }

                                while(text.indexOf("\n\n\n")>-1){
                                    text = text.replace("\n\n\n"," ");
                                }

                                while(text.indexOf("\n\n")>-1){
                                    text = text.replace("\n\n","</br>");
                                }
    
                                while(text.indexOf("\n")>-1){
                                    text = text.replace("\n","</br>");
                                }
                                let errorQuantity = 0;
                                const setText = () => {
                                    if(!!document.querySelector(".emojionearea-editor")){
                                        document.querySelector(".emojionearea-editor").innerHTML = text;
                                    } else {
                                        errorQuantity++
                                        if(errorQuantity>=5){
                                            chrome.storage.local.set({"currentSending":false});
                                            port.postMessage({type: "closeTab"});
                                        }
                                        console.log("emojionearea-editor - not found");
                                        setTimeout(() => {
                                            setText()
                                        }, 1000);
                                    } 
                                }
    
                                setText();
                                
                                if(!!v.photo){
                                    setTimeout(() => {
                                        const photo = dataURLtoFile(v.photo, "photo");
                                        const container = new DataTransfer();
                                        container.items.add(photo);
                                        document.querySelector('#UploadInput').files = container.files;
            
                                        setTimeout(() => {
                                            const event = new Event('change');
                                            document.querySelector("#UploadInput").dispatchEvent(event);
                                        },500)
        
                                        const attachments = document.querySelector("attachments");
        
                                        const findAttachment = setInterval(() => {
        
                                            if(attachments.children.length > 0){
                                                clearInterval(findAttachment);
        
                                                const focus = new Event('focus');
                                                const blur = new Event('blur');
        
                                                document.querySelector(".emojionearea-editor").dispatchEvent(focus);
                                                document.querySelector(".emojionearea-editor").dispatchEvent(blur);
    
                                                if(document.querySelectorAll("messages")[0].children.length>0){
                                                    chrome.storage.local.set({"currentSending":false});
                                                    port.postMessage({type: "closeTab"});
                                                } else {
                                                    let dateOfSend = new Date();
                                                    dateOfSend = dateOfSend.toLocaleDateString("UTC", {day:"numeric", month:"long", year:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
                                                
                                                    chrome.storage.local.get(["historyData", "menData"], v => {
                                                        let historyData = v.historyData || {};
                                                        historyData[v.menData.id] = {wId: v.wId, dateOfSend}

                                                        chrome.storage.local.set({"currentSending":false});
                                                        document.querySelector('#send').click();
                                                        const checkSendMessage = setInterval(() => {
                                                            if(document.querySelectorAll("messages")[0].children.length>0){
                                                                isNoMessages=true;
                                                            }
                                                            if(document.querySelector('statusbar').innerText.indexOf("1 first letter")>-1){
                                                                port.postMessage({type: "closeTab"});
                                                                clearInterval(checkSendMessage)
                                                            }
                                                            if(isNoMessages){
                                                                port.postMessage({type: "sended", historyData});
                                                                clearInterval(checkSendMessage)
                                                            }
                                                        }, 500);
                                                    })
                                                }
                                            }
                                        }, 500)
                                    }, 2000)
                                } else {
                                    setTimeout(() => {
                                        const focus = new Event('focus');
                                        const blur = new Event('blur');
        
                                        document.querySelector(".emojionearea-editor").dispatchEvent(focus);
                                        document.querySelector(".emojionearea-editor").dispatchEvent(blur);
                                        if(document.querySelectorAll("messages")[0].children.length>0){
                                            chrome.storage.local.set({"currentSending":false});
                                            port.postMessage({type: "closeTab"});
                                        } else {
                                            let dateOfSend = new Date();
                                            dateOfSend = dateOfSend.toLocaleDateString("UTC", {day:"numeric", month:"long", year:"numeric", hour:"numeric", minute:"numeric", second:"numeric"});
                                        
                                            chrome.storage.local.get(["historyData", "menData"], v => {
                                                let historyData = v.historyData || {};
                                                historyData[v.menData.id] = {wId: v.wId, dateOfSend}
                                                chrome.storage.local.set({historyData})

                                                chrome.storage.local.set({"currentSending":false});
                                                document.querySelector('#send').click();
                                                const checkSendMessage = setInterval(() => {
                                                    if(document.querySelectorAll("messages")[0].children.length>0){
                                                        isNoMessages=true;
                                                    }
                                                    if(document.querySelector('statusbar').innerText.indexOf("1 first letter")>-1){
                                                        port.postMessage({type: "closeTab"});
                                                        clearInterval(checkSendMessage)
                                                    }
                                                    if(isNoMessages){
                                                        port.postMessage({type: "sended", historyData});
                                                        clearInterval(checkSendMessage)
                                                    }
                                                }, 500);
                                            })
                                        }
                                    }, 2000)
                                }                                            
                            }   
                        }
                    }
                },500)            
            })
        }
    }
})