function getParams() {
    const numeroLettereDefault = 5;
    const urlParameters = new URLSearchParams(window.location.search);
    let nLettereParam = (urlParameters.has("nLettere")) ? parseInt(urlParameters.get("nLettere")) : NaN;
    let nLettere = (isNaN(nLettereParam)) ? numeroLettereDefault : nLettereParam;
    
    let result = {
        "nLettere": nLettere,
        "nRighe": -1,
        "wordGoal": getWord(nLettere),
        "cursoreRiga": 0,
        "cursoreColonna": 0
    };
    result['nRighe'] = result['nLettere'] + 1;
    return result;
};

function getWord(a) {
    return "crema";
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

function sendKey(key) {
    if(!KEYBOARD_KEYS.replaceAll('/','').includes(key)) return;
    
    switch(key) {
        case '⌫':
            if(PARAMS['cursoreColonna'] === 0) {
                throwError(tiles[PARAMS['cursoreRiga']], "parola vuota")
                return;
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
                return;
            }
            break;
        default:
            if(PARAMS['cursoreColonna'] > (PARAMS['nLettere'] - 1)) {
                throwError(tiles[PARAMS['cursoreRiga']])
                return;
            }

            let tileSelectedKey = tiles[PARAMS['cursoreRiga']][PARAMS['cursoreColonna']];
            tileSelectedKey.classList.remove('tile-without-text');
            tileSelectedKey.classList.add('tile-with-text');
            tileSelectedKey.innerText = key;

            PARAMS['cursoreColonna']++;
            break;
    }
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
    console.log(key);
    sendKey(key);
}

window.onResize();

