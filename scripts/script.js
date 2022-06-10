
window.onload = async function() {
    let guessWord = "crema";


    const urlParameters = new URLSearchParams(window.location.search);
    const tmpNLetters = (urlParameters.has("nLetters")) ? parseInt(urlParameters.get("nLetters")) : NaN;
    const DEFAULT_N_LETTERS_VALUE = 5;
    const N_LETTERS = (isNaN(tmpNLetters)) ? DEFAULT_N_LETTERS_VALUE : tmpNLetters;
    const N_ROWS = N_LETTERS + 1;

    const gameBoardDiv = document.querySelector(".board-container");
    gameBoardDiv.gridRowsTemplate = `repeat(${N_ROWS}, 1fr)`;
    gameBoardDiv.gridColumnsTemplate = `repeat(${N_LETTERS}, 1fr)`;
    
    const EMPTY_TILE_CHAR = '#';
    
    let tilesBoard = [];
    for(let row = 0; row < N_ROWS; row++) {
        tilesBoard[row] = [];
        for(let column = 0; column < N_LETTERS; column++) {

            let tile = document.createElement("div");
            tile.innerHTML = "<span>" + EMPTY_TILE_CHAR + "</span>";
            tile.classList.add("tile");
            tile.classList.add("tile-without-text");
            tile.style.gridRow = `${row + 1} / span 1`;
            tile.style.gridColumn = `${column + 1} / span 1`;
            gameBoardDiv.append(tile);

            tilesBoard[row][column] = tile;
        }
    }

    const ALERT_POP_OUT_KEYFRAME = [ 
        { opacity: 1 },
        { opacity: 0 }
    ];

    const ALERT_POP_OUT_KEYFRAME_PROPERTIES = {
        duration: 100,
        iterations: 1,
    }

    let summon_alert = (msg) => {
        const ALERT_TIMEOUT = 1.5 * 1000;
        let alert = document.createElement("div");
        alert.classList.add("alert");
        alert.innerText = msg;
        
        let alertContainer = document.querySelector(".alerts-container");
        alertContainer.insertBefore(alert, alertContainer.firstChild);
        
        setTimeout(async () => {
            let tmp = alert.animate(ALERT_POP_OUT_KEYFRAME, ALERT_POP_OUT_KEYFRAME_PROPERTIES)
            tmp.onfinish = () => {
                alertContainer.removeChild(alert);
            };
        }, ALERT_TIMEOUT)

    };

    // | -> Tasti più ampi
    // / -> Separatore righe 
    const CONST_KEYBOARD_KEYS = "QWERTYUIOP/ASDFGHJKL/|↩|ZXCVBNM|⌫|";
      
    let rowCursor = 0;
    let columnCursor = 0;
     
    let send_key = function(key) {
        key = (key === "BACKSPACE") ? "⌫" : (key === "ENTER") ? "↩" : key;
        if(!CONST_KEYBOARD_KEYS.replaceAll('|','').replaceAll('/','').includes(key)) return;

        switch(key) {
            case "⌫":
                if(columnCursor <= 0) return;
                columnCursor--;
                let tileBackspace = tilesBoard[rowCursor][columnCursor];
                tileBackspace.querySelector("span").innerText = EMPTY_TILE_CHAR;
                
                tileBackspace.classList.remove("tile-with-text");
                tileBackspace.classList.add("tile-without-text");
                break;
                case "↩":
                    summon_alert("messaggio");
                    break;
            default:
                if(columnCursor >= N_LETTERS) return;
                
                let tile = tilesBoard[rowCursor][columnCursor];
                tile.querySelector("span").innerText = key;
                tile.classList.remove("tile-without-text");
                tile.classList.add("tile-with-text");
                columnCursor++;
                break;
        }
    };

    keyboard_container = document.querySelector(".keyboard-container");
    for(let row of CONST_KEYBOARD_KEYS.replaceAll("|", "").split('/')) {
        keyboard_row_div = document.createElement("div");
        keyboard_row_div.classList.add("keyboard-row");
        for(let char of row.split("")) {
            let key_div = document.createElement("div");
            key_div.setAttribute("data-key", char);
            key_div.classList.add("keyboard-key");
            key_div.innerText = char;
            if(char === '⌫') {
                key_div.classList.add("keyboard-key-more-span")
                key_div.innerHTML = "<span class='material-symbols-outlined'>backspace</span>"
            }else if(char === '↩') {
                key_div.innerText = "ENTER"
                key_div.classList.add("keyboard-key-more-span")
            }

            key_div.onclick = () => send_key(char);

            
            keyboard_row_div.append(key_div);
        }
        keyboard_container.appendChild(keyboard_row_div);
    }

    let resizeFunction = () => {
        let tileDim = Math.round(gameBoardDiv.clientHeight / N_ROWS);
        gameBoardDiv.style.width = (tileDim * N_LETTERS) + "px";

        let root = document.documentElement;
        root.style.setProperty('--tile-width', tileDim + "px");
    };

    window.onresize = resizeFunction;
    resizeFunction();

    window.onkeydown = (e) => {
        if(!e.repeat) send_key(e.key.toUpperCase());
    } 

};


