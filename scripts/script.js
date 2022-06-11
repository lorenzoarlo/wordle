function setTheme(dark = false) {
    if(dark) document.documentElement.classList.add("dark-mode");
    else document.documentElement.classList.remove("dark-mode");
    let bg_clr = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-clr');
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  bg_clr);
}

function setLanguage(language) {
    const language_list = ["english", "italian"];

    if(!language_list.includes(language)) return;

    const images = document.querySelector("#language-option").querySelectorAll(".icon-selectable");
    for(let i of images) {
        i.dataset['state'] = (i['alt'] === language) ? "active" : "inactive"; 
    }    
}

function getParams() {
    const numeroLettereDefault = 5;
    const urlParameters = new URLSearchParams(window.location.search);
    let nLettereParam = (urlParameters.has("nLettere")) ? parseInt(urlParameters.get("nLettere")) : NaN;
    let nLettere = (isNaN(nLettereParam)) ? numeroLettereDefault : nLettereParam;
    
    let result = {
        "nLettere": nLettere,
        "nRighe": -1,
        "wordGoal": null,
        "cursoreRiga": 0,
        "cursoreColonna": 0,
        "onanimation": false,
        "wordsList": []
    };
    result['nRighe'] = result['nLettere'] + 1;
    return result;
};

async function getWord(nLettere) {
    WORDS_LIST_PATH = `resources/words.json`;
    PARAMS['wordsList'] = await fetch(WORDS_LIST_PATH).then(r => r.json());
    PARAMS['wordGoal'] = PARAMS['wordsList'][Math.round(Math.random() * PARAMS['wordsList'].length)];
}

function getTile(content) {
    let tile = document.createElement("div");
    tile.innerHTML = `<span>${content}</span>`;
    tile.classList.add("tile");
    tile.classList.add("tile-without-text"); 
    return tile;
}

function onResize() {
    let tileDim = Math.round(board_container.clientHeight / PARAMS['nRighe']);
    board_container.style.width = (tileDim * PARAMS['nLettere']) + "px";

    document.documentElement.style.setProperty('--tile-width', tileDim + "px");
}

function summonAlert(message) {
    const ALERT_POP_OUT_KEYFRAME = [ { opacity: 1 }, { opacity: 0 } ];
    const ALERT_POP_OUT_KEYFRAME_PROPERTIES = { duration: 100, iterations: 1 };

    const ALERT_TTL = 1.2 * 1000;

    const alert_div = document.createElement("div");
    alert_div.classList.add("alert");
    alert_div.innerText = message;

    const alerts_container = document.querySelector(".alerts-container");
    alerts_container.insertBefore(alert_div, alerts_container.firstChild);

    setTimeout(function() {
        let animation = alert_div.animate(ALERT_POP_OUT_KEYFRAME, ALERT_POP_OUT_KEYFRAME_PROPERTIES);
        animation.onfinish = () => alerts_container.removeChild(alert_div);
    }, ALERT_TTL);    
}

async function flipTile(tile, className) {
    const TILE_FLIP_KEYFRAME_PHASE1 = [ { transform: 'rotateX(0deg)' }, { transform: 'rotateX(90deg)' } ];
    const TILE_FLIP_KEYFRAME_PROPERTIES_PHASE1 = { duration: 200, iterations: 1 };

    const TILE_FLIP_KEYFRAME_PHASE2 = [ { transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' } ];
    const TILE_FLIP_KEYFRAME_PROPERTIES_PHASE2 = { duration: 200, iterations: 1 };

    return new Promise((resolve) => {
        let animation_phase1 = tile.animate(TILE_FLIP_KEYFRAME_PHASE1, TILE_FLIP_KEYFRAME_PROPERTIES_PHASE1);
        animation_phase1.onfinish = () => {
            tile.classList.add(className);
            let animation_phase2 = tile.animate(TILE_FLIP_KEYFRAME_PHASE2, TILE_FLIP_KEYFRAME_PROPERTIES_PHASE2);
            animation_phase2.onfinish = () => resolve();  
        };
    });
}

function changeView(viewName) {
    let containersList = [
        "body-container",
        "settings-container", 
        // "info-container"
    ];

    if(!containersList.includes(viewName)) return;
    for(let c of containersList) {
        if(c === viewName) document.querySelector(`.${c}`).style.display = "flex";
        else document.querySelector(`.${c}`).style.display = "none";
    }
}


async function sendKey(key) {
    if(PARAMS['onanimation'] || !KEYBOARD_KEYS.replaceAll('/','').includes(key)) return;
    PARAMS['onanimation'] = true;
    switch(key) {
        case '⌫':
            if(PARAMS['cursoreColonna'] === 0) {
                throwError(tiles[PARAMS['cursoreRiga']], "parola vuota")
                break;
            }

            PARAMS['cursoreColonna']--;
            let tileSelectedBackspace = tiles[PARAMS['cursoreRiga']][PARAMS['cursoreColonna']];
            tileSelectedBackspace.classList.remove('tile-with-text');
            tileSelectedBackspace.classList.add('tile-without-text');
            tileSelectedBackspace.innerText = EMPTY_TILE_CHAR;
            
            break;
        case '↩':
            if(PARAMS['cursoreColonna'] !== (PARAMS['nLettere'])) {
                throwError(tiles[PARAMS['cursoreRiga']])
                break;
            }
            
            
            let wordInserted = '';
            for(let i = 0; i < PARAMS['nLettere']; i++) {
                wordInserted += tiles[PARAMS['cursoreRiga']][i].innerText;
            }
            
            if(!PARAMS['wordsList'].includes(wordInserted)) {
                throwError(tiles[PARAMS['cursoreRiga']], "non nella lista di parole");
                break;
            }

            for(let i = 0; i < PARAMS['nLettere']; i++) {
                let className = (PARAMS['wordGoal'][i] === wordInserted[i]) ? "tile-correct" : ((PARAMS['wordGoal'].includes(wordInserted[i]))) ? "tile-wrongPlace" : "tile-wrong";
                await flipTile(tiles[PARAMS['cursoreRiga']][i], className);
            }
            
            
            const MESSAGES = {
                "0-guess": "impossibile!",
                "1-guess": "strabiliante!",
                "2-guess": "ottimo!",
                "3-guess": "bene!",
                "other-guess": "non male!",
                "last-guess": "appena in tempo!",
                "fail-guess": "peccato!"
            };
            if(PARAMS['wordGoal'] === wordInserted) {
                
                if(MESSAGES.hasOwnProperty(`${PARAMS['cursoreRiga']}-guess`)) {
                    summonAlert(MESSAGES[`${PARAMS['cursoreRiga']}-guess`]);
                } else if (PARAMS['cursoreRiga'] < PARAMS['nLettere'] - 1) {
                    summonAlert(MESSAGES['other-guess']);
                } else if (PARAMS['cursoreRiga'] < PARAMS['nLettere']) {
                    summonAlert(MESSAGES['last-guess']);
                }
            } else if (PARAMS['cursoreRiga'] >= PARAMS['nRighe'] - 1 ) {
                summonAlert(MESSAGES['fail-guess']);
            }
            
            PARAMS['cursoreRiga']++;
            PARAMS['cursoreColonna'] = 0;

            break;
        default:
            if(PARAMS['cursoreColonna'] > (PARAMS['nLettere'] - 1)) {
                throwError(tiles[PARAMS['cursoreRiga']])
                break;
            }

            let tileSelectedKey = tiles[PARAMS['cursoreRiga']][PARAMS['cursoreColonna']];
            tileSelectedKey.classList.remove('tile-without-text');
            tileSelectedKey.classList.add('tile-with-text');
            tileSelectedKey.innerText = key;

            PARAMS['cursoreColonna']++;
            break;
    }
    PARAMS['onanimation'] = false;
}

function throwError(tiles, alertMessage = null) {
    const SHAKE_PIXELS = 20; 

    const SHAKE_TILE_KEYFRAME = [ { transform: `translateX(-${SHAKE_PIXELS}px)` }, { transform: `translateX(${SHAKE_PIXELS}px)` }, { transform: `translateX(0px)` }, ];
    const SHAKE_TILE_KEYFRAME_PROPERTIES = { duration: 150, iterations: 1 };

    for(let t of tiles) {
        t.animate(SHAKE_TILE_KEYFRAME, SHAKE_TILE_KEYFRAME_PROPERTIES);
    }

    if(alertMessage !== null) summonAlert(alertMessage)
     
}

const PARAMS = getParams();


getWord(null);

const board_container = document.querySelector(".board-container");
board_container.gridRowsTemplate = `repeat(${PARAMS['nRighe']}, 1fr)`;
board_container.gridColumnsTemplate = `repeat(${PARAMS['nLettere']}, 1fr)`;

window.onresize = onResize;

// -> tiles

const EMPTY_TILE_CHAR = '#';
let tiles = [];
for(let row = 0; row < PARAMS['nRighe']; row++) {
    tiles[row] = [];
    for(let column = 0; column < PARAMS['nLettere']; column++) {
        tiles[row][column] = getTile(EMPTY_TILE_CHAR);
        tiles[row][column].style.gridRow = `${row + 1} / span 1`;
        tiles[row][column].style.gridColumn = `${column + 1} / span 1`;
        board_container.appendChild(tiles[row][column]);
    }
}

// -> keyboard
const KEYBOARD_KEYS = "QWERTYUIOP/ASDFGHJKL/↩ZXCVBNM⌫";    

const keyboard_container = document.querySelector(".keyboard-container");
for(let row of KEYBOARD_KEYS.split('/')) {
    let keyboard_row_div = document.createElement("div");
    keyboard_row_div.classList.add("keyboard-row");
    for(let char of row) {
        
        const key_div = document.createElement("div");
        key_div.classList.add("keyboard-key");
        
        if(char === '⌫' || char === '↩') {
            key_div.classList.add("keyboard-key-more-span")
            key_div.innerHTML = (char === '⌫') ? "<span class='material-symbols-outlined'>backspace</span>" : "ENTER";
        } else {
            key_div.innerText = char;
        }

        key_div.onclick = () => sendKey(char); 

        keyboard_row_div.appendChild(key_div);
    }
    keyboard_container.appendChild(keyboard_row_div);
}

window.onkeydown = (e) => {
    if(e['ctrlKey'] || e['altKey'] || e['repeat']) return;

    let key = e.key.toUpperCase();
    key = (key === "BACKSPACE") ? '⌫' : (key === 'ENTER') ? '↩' : key;

    if(!KEYBOARD_KEYS.replaceAll('/', '').includes(key)) return;

    sendKey(key);
}



window.onResize();

