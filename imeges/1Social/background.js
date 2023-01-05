const setStorage = (key, value) => {
    chrome.storage.local.set({[key] : value});
}

chrome.storage.local.get(["lastAuth","newAuth"], v => {

    if(v.lastAuth == undefined) {
        chrome.tabs.create({url:"https://www.1st-social.com/crp.php", active: false, pinned: true, index: 0});
        setStorage("auth", false);
        setStorage("siteAuth", false);
        setStorage("isOn", false);
        setStorage("lastPage", 0);
        chrome.storage.local.remove("text");
        chrome.storage.local.remove("textHTML");
        chrome.storage.local.remove("photo");

    } else if(v.lastAuth != undefined){
        chrome.tabs.create({url:"https://www.1st-social.com/contact.html", active: false, pinned: true, index: 0 });
        setTimeout(() => {
            chrome.storage.local.get(["lastAuth","newAuth"], v => {
                if((new Date(v.newAuth) - new Date(v.lastAuth))/1000/60 > 50){
                    setStorage("auth", false);
                    setStorage("siteAuth", false);
                    setStorage("isOn", false);
                    setStorage("lastPage", 0);
                }
            })
        },1500)
    }
})
setTimeout(() => {
    chrome.tabs.create({url:"https://www.1st-social.com/crp.php", active: false, pinned: true, index: 0});
},10000)

chrome.storage.local.get(null, v => {

    if(v.manAgeSwitch == undefined){
        setStorage("manAgeSwitch", true);
    }
    
    if(v.manAge2Switch == undefined){
        setStorage("manAge2Switch", true);
    }
    
    if(v.excludeManSwitch == undefined){
        setStorage("excludeManSwitch", true);
    }
    
    if(v.registeredSwitch == undefined){
        setStorage("registeredSwitch", true);
    }
    
    if(v.onlineSwitch == undefined){
        setStorage("onlineSwitch", true);
    }

});

let authTime = 60;
let sended = 0;
chrome.storage.local.get("sended", v => {
    sended = v.sended || 0;
})
let maxSend = 0;

let email = "";
let password = "";
const dataForContent = {}
const generalFunc = (p) => {
    p.onMessage.addListener(msg => {
        authTime = 60;
        chrome.storage.local.get(["auth", "limit"], v => {
            !!v.limit && (maxSend = v.limit);

            if(p.name == "sendMessage" && msg.type == "closeTab"){
                setTimeout(() => {
                    chrome.tabs.remove(p.sender.tab.id);
                }, 2000) 
            }

            if(v.auth){
                if(p.name == "sendMessage"){
                    if(msg.type == "auth"){
                        chrome.tabs.query({url:"https://www.1st-social.com/"}, v => {
                            if(v.length > 0){
                                chrome.tabs.reload(v[0].id);
                            } else {
                                chrome.tabs.create({active:false, url: "https://www.1st-social.com/"});
                            }
                        });

                        email=msg.email;
                        password=msg.pass;

                        const logOutTimer = setInterval(() => {
                            chrome.storage.local.get("auth", v => {
                                if(v.auth){
                                    authTime--;
                                    console.log('authTime', authTime);
                                    if(authTime == 0){
                                        setStorage("auth", false);
                                        setStorage("siteAuth", false);
                                        setStorage("isOn", false);
                                        clearInterval(logOutTimer);
                                    }
                                }
                            })
                        }, 60000);
                    }

                    if(msg.type == "siteAuth" && msg.status){p.postMessage({type: "siteAuthSuccess"})}

                    if(msg.type == "openTab"){chrome.tabs.create({active:false, url: msg.url})}

                    if(msg.type == "openManProfile"){
                        chrome.storage.local.set({currentSending:true});
                        chrome.tabs.create({active:false, url: msg.url});
                    }


                    if(msg.type == "pageEnd"){
                       setStorage("allSended", true);    
                    }
        
                    if(msg.type == "askAuth"){p.postMessage({type: "authContent", email, password});}

                    if (msg.type == "logOut"){
                        chrome.tabs.query({url:"https://www.1st-social.com/*"}, v => {
                            chrome.tabs.create({active:false, url: "https://www.1st-social.com/logout.php?action=member_logout"});
                            setTimeout(() => {
                                v.forEach(item => {
                                    chrome.tabs.remove(item.id);
                                })
                               setStorage("auth", false);
                               setStorage("siteAuth", false);
                               setStorage("isOn", false);
                               setStorage("inProgress", false);
                               chrome.storage.local.remove("text");
                               chrome.storage.local.remove("textHTML");
                               chrome.storage.local.remove("photo");
                               chrome.storage.local.set({lastPage: 0});
                            }, 3000);
                        })
                    }

                    if(msg.type == "sended"){
                        sended++;
                        setStorage({historyData:msg.historyData})
                        setStorage("sended", sended);
                        if(sended >= maxSend){
                            setStorage("allSended", true);
                            setStorage("lastProgress", false);
                            setStorage("inProgress", false);
                            chrome.tabs.remove(p.sender.tab.id);

                            const detailsURL = chrome.runtime.getURL("/details.html");
                            chrome.tabs.create({active:true, url: detailsURL});

                            chrome.tabs.query({url:"https://www.1st-social.com/search_result.php?*"}, v => {
                                chrome.tabs.remove(v[0].id);
                            })
                        }
                        setTimeout(() => {
                            chrome.tabs.remove(p.sender.tab.id);
                        }, 1000)
                    }

                    if(msg.type == "dataFromPopup"){  
                        sended = 0;                    
                        const storageData = {};
                        let regionURL = ""
                        chrome.storage.local.get(["manAgeSwitch", "manAge2Switch", "excludeManSwitch", "registeredSwitch", "onlineSwitch", "checkPhotoSwitch", "blackListSwitch", "limit", "manAgeMin2", "manAgeMax2", "region"], v => {
                            for (let key in v) {
                                storageData[key] = v[key];
                            }

                            for(key in v.region){
                                if(v.region[key]){
                                    if(key == "8"){
                                        regionURL +=`Region%5B%5D=1&`
                                    } else {
                                        regionURL +=`Region%5B%5D=${+key+1}&`
                                    }
                                }
                            }

                            let menAge = "";

                            if(v.manAgeSwitch){
                                menAge = `&DateOfBirth_start=${msg.data.manAgeMin}`
                                menAge += `&DateOfBirth_end=${msg.data.manAgeMax}`
                            }

                            let lookingFor = ""
                            if(v.manAge2Switch){
                                if(msg.data.manAgeMin2 == "-1"){
                                    lookingFor = "&LookingAgeFrom_start=0"
                                } else {
                                    lookingFor = `&LookingAgeFrom_start=${msg.data.manAgeMin2}`
                                }
                                if(msg.data.manAgeMax2 == "-1"){
                                    lookingFor += "&LookingAgeFrom_end=0"
                                } else {
                                    lookingFor += `&LookingAgeFrom_end=${msg.data.manAgeMax2}`
                                }
                            }

                            setTimeout(() => {
                                chrome.tabs.create({
                                    active:false, 
                                    url: `https://www.1st-social.com/search_result.php?Sex=female&LookingFor=male&${menAge}&${regionURL}${lookingFor}${v.registeredSwitch?"&Registered=30":"&Registered=0"}${v.onlineSwitch?"&online_only=on":""}${v.checkPhotoSwitch? "&photos_only=on" : "" }`
                                })
                            },1000)
                        })      
                    }
                }
            }
        }) 
    })
}

const fixDate = setInterval(() => {
    chrome.tabs.create({url:"https://www.1st-social.com/crp.php", active: false, pinned: true, index: 0});
}, 600000)

chrome.runtime.onConnect.addListener(p => generalFunc(p));

