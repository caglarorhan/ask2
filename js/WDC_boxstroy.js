const WDC_box = {
    messageCatalog: {},
    jsonDataCatalog:{},
    expDateTime(lifeHour) {
        return new Date().getTime() + (lifeHour * 3600000)
    },
    vw() {
        return Math.min(document.documentElement.clientWidth, window.innerWidth)
    },
    vh() {
        return Math.min(document.documentElement.clientHeight, window.innerHeight)
    },
    createBox(boxData) {
console.log('created')
        const backDrop = document.createElement('div');
        const boxCloseButton = document.createElement('span');
        const box = document.createElement('div');
        if (boxData.backdrop === true || boxData.backdrop === "true") {
            backDrop.style.cssText = `width:100%; height:100%; overflow:hidden; position: fixed; visibility: ${boxData.visibility}; z-index:${boxData.z_index}; left:0;top:0; background-color: ${boxData.backdrop_specs.rgba};`;
            backDrop.id = 'backdrop_' + boxData.content_id;
            backDrop.addEventListener('click', (event) => {
                this.removeBox(event, boxData);
            })
            document.body.append(backDrop);
        }
        if (boxData.close_button === true || boxData.close_button === "true") {
            boxCloseButton.style.cssText = `position: absolute; z-index:101; cursor:pointer; top:${boxData.close_button_specs.top}; right:${boxData.close_button_specs.right}; cursor:pointer; background-color:${boxData.close_button_specs.bgColor}; border:${boxData.close_button_specs.border}; height:${boxData.close_button_specs.height}; width:${boxData.close_button_specs.width}; padding:${boxData.close_button_specs.padding}; margin:${boxData.close_button_specs.margin}`;
            boxCloseButton.title = boxData.close_button_specs.title;
            boxCloseButton.id = 'box_close_button_' + boxData.content_id;
            boxCloseButton.innerHTML = boxData.close_button_content;
            boxCloseButton.addEventListener('click', (event) => {
                this.removeBox(event, boxData);
            })
        }
        let boxRecalculated = this.positionReCalculator(boxData);
console.log(boxData.z_index);

        box.style.cssText = `width:${boxRecalculated.widthOfBox}; height: ${boxData.height}; left:${boxRecalculated.leftOfBox}; top:${boxRecalculated.topOfBox}; position:${boxData.position}; visibility: ${boxData.visibility}; margin:${boxData.margin}; background-color:${boxData.bgColor}; z-index: ${boxData.z_index}; border-radius:${boxData.border_radius}; border: ${boxData.border}; box-shadow:${boxData.box_shadow} ; box-sizing: border-box;`;
        box.id = 'box_' + boxData.content_id;
        box.innerHTML = boxData.content;
        box.append(boxCloseButton);

        if (document.querySelector('#backdrop_' + boxData.content_id)) {
            document.querySelector('#backdrop_' + boxData.content_id).append(box);
            document.querySelector('#backdrop_' + boxData.content_id).style.display = 'none';
        }else if((boxData.target_host.length>0)){
            try{
                let target_host =
                    document.querySelectorAll('#'+boxData.target_host)[0] ??
                    document.querySelectorAll('.'+boxData.target_host)[0] ??
                    document.querySelectorAll('*[name='+boxData.target_host+']')[0];

                target_host.insertAdjacentElement(boxData.target_part, box);
            }
            catch{
                console.log(boxData.target_host, ' verisinin geldigine emin olunuz!')
            }

        }else {
            document.body.insertAdjacentElement('afterbegin', box);
            document.querySelector('#box_' + boxData.content_id).style.display = 'none';
        }
        document.querySelector('#box_' + boxData.content_id).addEventListener('click', (event) => {
            event.stopPropagation();
        })
        this.resizeTracker(boxData);
    },
    positionReCalculator(boxData) {
        let widthOfBox = boxData.width.includes('%') ? this.vw() * (parseInt(boxData.width) / 100) : boxData.width;
        let leftOfBox = boxData.left.includes('auto') ? ((this.vw() - parseInt(widthOfBox)) / 2) : boxData.left;
        let topOfBox = parseInt(boxData.top);
        let isThereAnySwitch = 0;

        // is there any switch type animations (switching 2 animations) in all scenarios?
        Object.values(boxData.scenarios).forEach(scenarioData => {
            Object.values(scenarioData.animations).forEach(animationData => {
                if (animationData.switch_id) {
                    isThereAnySwitch = 1;
                }
            })
        })

        boxData.side.split(',').forEach(side=> {

            switch (side) {
                case "right":
                    leftOfBox = this.vw() - parseInt(widthOfBox);
                    if (Boolean(isThereAnySwitch)) {
                        leftOfBox = this.vw();
                    }
                    break;
                case "left":
                    leftOfBox = 0;
                    if (Boolean(isThereAnySwitch)) {
                        leftOfBox = 0 - parseInt(widthOfBox);
                    }
                    break;
                case "bottom":
                    topOfBox = this.vh() - parseInt(boxData.height);
                    if (Boolean(isThereAnySwitch)) {
                        topOfBox = this.vh();
                    }
                    break;
                case "top":
                    topOfBox = 0;
                    if (Boolean(isThereAnySwitch)) {
                        topOfBox = 0 - parseInt(boxData.height);
                    }
                    break;
            }
        })
            return {
                "widthOfBox": widthOfBox,
                "leftOfBox": leftOfBox + 'px',
                "topOfBox": topOfBox + 'px',
                "isThereAnySwitch": isThereAnySwitch
            }
    },
resizeTracker(boxData) {
    window.addEventListener('resize', () => {

        let boxRecalculated = this.positionReCalculator(boxData);
        document.querySelector('#box_' + boxData.content_id).style.left = boxRecalculated.leftOfBox;
        document.querySelector('#box_' + boxData.content_id).style.top = boxRecalculated.topOfBox;
        document.querySelector('#box_' + boxData.content_id).style.width = boxRecalculated.widthOfBox;

    })
},
createAnimation(boxData, animationData) {
    if (!document.querySelector('#box_' + boxData.content_id)) {
        this.createBox(boxData);
    }


    animationData.animation_name.forEach(animationName => {
        let targetCSS = document.createElement('style');
        let animationSpecsText = "";
        Object.entries(boxData.animations[animationName].animation_specs).forEach(([k, v]) => {
            if (v) {
                animationSpecsText += `${k.replaceAll('_','-')}:${v}; `;
            }
        })

        targetCSS.innerHTML = `
        .${animationName}_${boxData.content_id}{
            animation-name: ${animationName};
            ${animationSpecsText}
            }
            @keyframes ${animationName} {
                               ${boxData.animations[animationName].keyframes}
                                }
                               
            `;
        // CSS rule control
        if (!Object.values(document.styleSheets).map(rlz =>{try{return rlz.rules[0].selectorText}catch(err){}}).includes("." + animationName + "_" + boxData.content_id)) {
            document.head.append(targetCSS);
        }
    })


},
init(json_src) {
        console.log('initiated')
this.messageListener();
        let result = fetch(json_src).then(response => response.json()).then(data => {
            data.forEach(jsonData => {
                this.jsonDataCatalog[jsonData.content_id]=jsonData;
                //console.log(`JsonDataCatalog son hali:${JSON.stringify(this.jsonDataCatalog)}`)
                //console.log('CONTENT ID: '+jsonData.content_id);
                if(jsonData.content.includes('<iframe')) {
                    // content icerisinde iframe varsa
                    const domparser = new DOMParser();
                    const doc = domparser.parseFromString(jsonData.content, 'text/html');
                    const iFrameSrc = doc.body.querySelector('iframe').src;

                    let ghostIFrame = document.createElement('iframe');
                    ghostIFrame.id = 'ghostIFrame';
                    ghostIFrame.style.cssText=`width:0; height:0; display:none`;
                    ghostIFrame.src=iFrameSrc;
                    document.body.append(ghostIFrame);
                    //console.log('ghostIFrame olusturuldu ve yerlestirildi');

                }else{
                    //content icerisinde iframe yoksa
                    this.forgeTheBox(jsonData);
                }
            })
        })

},
messageListener(){
        console.log('Listener yerlestirildi ve dinleme basladi.')
    window.addEventListener('message', (e)=>{
        if(e.origin!=='https://s69.wdc.center'){return false;}
        let message = JSON.parse(e.data);
        if(!this.messageCatalog[message.contentId]){this.messageCatalog[message.contentId]=[]}
        this.messageCatalog[message.contentId].unshift(message);
        //console.log('Message came! Cataloged');
       // console.log(`Last status of messageCatalog: ${JSON.stringify(this.messageCatalog)}`);
        let targetBoxJson = this.jsonDataCatalog[message.contentId];
        let passThisFrame = this.messageCatalog[message.contentId][0].value;
        //console.log(`mesajdan gelen content id: ${message.contentId}`);
        //console.log(`passThisFrame verisi: ${passThisFrame}`);
        // console.log(`Katalogtan cekilen json verisi:
        // ${JSON.stringify(targetBoxJson)}
        // `);
        if(!document.querySelector('#box_'+message.contentId) && passThisFrame!==1){

            this.forgeTheBox(targetBoxJson)
        }
    });
},
forgeTheBox(jsonData){
        console.log('Box forged:'+jsonData.content_id);
        let registeredDateTime = window.localStorage.getItem("box_" + jsonData.content_id);
        let expired = true;
        window.localStorage.removeItem("box_" + jsonData.content_id);

        if (registeredDateTime) {
            expired = new Date().getTime() - parseInt(registeredDateTime) > 0
        }

        if (jsonData.show && expired){
            this.createBox(jsonData);
            this.action(jsonData)
        } else {
            return false;
        }
    }
,
animApplicator(boxData, scenarioName, animationData) {
    document.querySelector("#box_" + boxData.content_id).classList.remove(animationData.animation_name[this.switchPositionConvertor(boxData.scenarios[scenarioName].event_source + '' + boxData.content_id)] + "" + boxData.content_id);
    if (animationData.repetitive === "true" || animationData.repetitive === true) {
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                if (boxData.backdrop === true || boxData.backdrop === 'true') {
                    document.querySelector('#backdrop_' + boxData.content_id).style.display = '';
                }
                document.querySelector('#box_' + boxData.content_id).style.display = '';

                document.querySelector("#box_" + boxData.content_id).classList.add(animationData.animation_name[this.switchPositionConvertor(boxData.scenarios[scenarioName].event_source + '' + boxData.content_id)] + "" + boxData.content_id);
            });

        });
    } else {
        document.querySelector('#box_' + boxData.content_id).style.display = 'block';
        let indexOfAnimationInSwitch = (this.switchPositionConvertor(boxData.scenarios[scenarioName].event_source + '_' + boxData.content_id) + 1) % 2;
        document.querySelector("#box_" + boxData.content_id).classList.add(animationData.animation_name[indexOfAnimationInSwitch] + "_" + boxData.content_id);
        if(scenario.also_apply_to && scenario.also_apply_to.length>0){
            scenario.also_apply_to.forEach(targetTag=>{

                if(targetTag!=="yok"){
                    document.querySelector(targetTag).classList.add(animationData.animation_name + "_" + boxData.content_id);
                }
            })
        }


    }
},
switchPositionConvertor(switchID) {
    return (document.querySelector(switchID) && document.querySelector(switchID).checked) ? 1 : 0;
},
scenarioRunner(boxData, scenarioName) {
    let scenario = boxData.scenarios[scenarioName];
    const triggerElement = (scenario.event_source !== "window") ? document.querySelector(scenario.event_source + '_' + boxData.content_id) : document;

    scenario.animations.forEach(async (animationData, animIndex) => {
        let indexOfAnimationInSwitch = this.switchPositionConvertor(boxData.scenarios[scenarioName].event_source + '_' + boxData.content_id);

        this.createAnimation(boxData, animationData);

        if (scenario.event_source === "window" && scenario.event === 'load') {
            if (document.querySelector("#backdrop_" + boxData.content_id)) {
                document.querySelector("#backdrop_" + boxData.content_id).style.display = '';
            }

            document.querySelector("#box_" + boxData.content_id).style.display = '';
            document.querySelector("#box_" + boxData.content_id).classList.add(animationData.animation_name + "_" + boxData.content_id);
            if(scenario.also_apply_to && scenario.also_apply_to.length>0){
                scenario.also_apply_to.forEach(targetTag=>{
                    if(targetTag!=="yok") {
                        document.querySelector(targetTag).classList.add(animationData.animation_name + "_" + boxData.content_id);
                    }
                })
            }
        }

        triggerElement.addEventListener(scenario.event, () => {
            this.animApplicator(boxData, scenarioName, animationData);
        });

        document.querySelector("#box_" + boxData.content_id).addEventListener('animationend', (event) => {
                if (boxData.animations[animationData.animation_name[0]].remove_after === "true" || boxData.animations[animationData.animation_name[this.switchPositionConvertor(boxData.scenarios[scenarioName].event_source + '_' + boxData.content_id)]].remove_after === true) {
                    this.removeBox(event, boxData)
                }
                if (animIndex === scenario.animations.length - 1) {
                    let isRepetitive = scenario.animations[animIndex].repetitive
                    if (isRepetitive === "false" || isRepetitive === false) {
                        triggerElement.removeEventListener(scenario.event, this.animApplicator, {passive: false});
                    }
                }
            }
        );
    })
    scenario.except.forEach(itemIdPrefix => {
        document.querySelector(itemIdPrefix + '_' + boxData.content_id).addEventListener(scenario.event, (event) => {
            event.stopPropagation();
        })
    })
},
action(boxData) {
    Object.keys(boxData.scenarios).forEach(scenarioName => {
        this.scenarioRunner(boxData, scenarioName);
    });
},
removeBox(event, boxData) {
    if (boxData.backdrop === true || boxData.backdrop === "true") {
        document.querySelector('#backdrop_' + boxData.content_id).remove();
    } else {
        document.querySelector('#box_' + boxData.content_id).remove();
    }
    window.localStorage.setItem('box_' + boxData.content_id, this.expDateTime(boxData.life_hour));
}
}
