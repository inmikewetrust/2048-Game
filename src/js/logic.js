let matrix =[[null, null, null, null],[null, null, null, null],[null, null, null, null],[null, null, null, null]];
let isGameOver = false;
let score = 0;

function MatOutput() {
  const cells = document.querySelectorAll('.matrix .cell');
  const flatMatrix = matrix.flat();
  cells.forEach((cell, index) => {
    cell.textContent = flatMatrix[index];
    cell.dataset.value = flatMatrix[index] || "";
  });
  document.querySelector('.Score').textContent = score;
}
function checkEmpty(matrix){
    for(var j = 0;j <4; j++){
        for(var k = 0; k<4; k++){
            if(matrix[j][k] == null || matrix[j][k]==0)
            {
                return [j, k];
            }
    }
    }
    return [null, null];
}

function add_2(matrix)
{
    const isFull = matrix.every(row => row.every(cell => (cell !== 0 && cell !== null)));
    if (isFull){return;}
    let tries = 0;
    while (tries < 30) {
        const r = Math.floor(Math.random() * 4);
        const c = Math.floor(Math.random() * 4);
        
        if ( matrix[r][c] === null || matrix[r][c] === 0) {
            matrix[r][c] = 2;
            return;
        }
        tries++;
    }
    const [r, c] = checkEmpty(matrix);
    if (r !== null && c !== null) {
        matrix[r][c] = 2;
    }
}
function get_cur_state(matrix)
{
    for(var j=0; j<4; j++){
        for(var k=0; k<4; k++){
         if(matrix[j][k] == 2048)
                return "WON";   
        }
    }
    
    for(var j=0; j<4; j++){
        for(var k=0; k<4; k++){
            if(matrix[j][k] == null || matrix[j][k] == 0)
                return "GAME NOT OVER";
        }
    }
    
    for(var j=0; j<3; j++){
        for(var k=0; k<3; k++){
            if(matrix[j][k] == matrix[j+1][k] || matrix[j][k] == matrix[j][k+1])
                return "GAME NOT OVER";
        }
    }
    
    for(var j=0; j<3; j++){
        if(matrix[3][j]==matrix[3][j+1])
                return "GAME NOT OVER";
    }
    for(var i=0; i<3; i++){
        if(matrix[i][3]==matrix[i+1][3])
                return "GAME NOT OVER";
    }
    return "LOST";
}
function compress(matrix){
    let changed = false;
    let new_matrix =[];
    for(var j = 0; j<4;j++)
    {
        new_matrix.push([null, null, null, null]);
    }
    for(var j=0; j<4;j++){
        let pos = 0;
        for(var k=0; k<4;k++)
        {
            if(matrix[j][k]!==0&&matrix[j][k]!==null)
            {
                new_matrix[j][pos]=matrix[j][k];
                if(k!==pos){
                    changed=true;
                }
                pos++;
            }
        }
    }
    return [new_matrix, changed];
}
function merge(matrix){
    let changed = false;
    for(var j = 0; j<4;j++)
    {
        for(var k = 0; k<3;k++){
            if(matrix[j][k]===matrix[j][k+1] && ( matrix[j][k] !== null && matrix[j][k] !== 0)){
                matrix[j][k] = matrix[j][k]*2;
                score += matrix[j][k];
                matrix[j][k+1] = 0;
                changed = true;
            }

        }
    }
    return [matrix, changed];
}
function reverse(matrix){
    let new_matrix =[];
    for(var j = 0; j<4; j++)
    {
        new_matrix.push([]);
        for(var k =0; k<4; k++)
        {
            new_matrix[j].push(matrix[j][3-k]);
        }
    }
    return new_matrix;
}
function transpose(matrix){
    let new_matrix =[];
    for(var j = 0; j<4; j++)
    {
        new_matrix.push([]);
        for(var k =0; k<4; k++)
        {
            new_matrix[j].push(matrix[k][j]);
        }
    }
    return new_matrix;
}
function move_left(grid){
    let[new_grid, changed1] = compress(grid);
    let changed2;
    [new_grid, changed2] = merge(new_grid);
    const changed = changed1 || changed2;
    [new_grid] = compress(new_grid);
    return [new_grid, changed];
}
function move_right(grid){
    let new_grid = reverse(grid);
    let changed;
    [new_grid, changed] = move_left(new_grid);
    new_grid = reverse(new_grid);
    return [new_grid, changed];
}
function move_up(grid){
    let new_grid = transpose(grid);
    let changed;
    [new_grid, changed] = move_left(new_grid);
    new_grid = transpose(new_grid);
    return [new_grid, changed];
}
function move_down(grid){
    let new_grid = transpose(grid);
    let changed;
    [new_grid, changed] = move_right(new_grid);
    new_grid = transpose(new_grid);
    return [new_grid, changed];
}


function start_game() {
    matrix = [[null, null, null, null],[null, null, null, null],[null, null, null, null],[null, null, null, null]];
    score = 0;
    add_2(matrix);
    isGameOver = false;
    document.querySelector('.Status').textContent = "GAME NOT OVER";
    MatOutput();
}
start_game();
document.addEventListener("keydown", (event) => {
    if (isGameOver || matrix.length === 0) return;

const key = event.key.toLowerCase();
let flag = false;
if (key === "w" || event.key === "ArrowUp") {
    [matrix, flag] = move_up(matrix);
} else if (key === "s" || event.key === "ArrowDown") {
    [matrix, flag] = move_down(matrix);
} else if (key === "a" || event.key === "ArrowLeft") {
    [matrix, flag] = move_left(matrix);
} else if (key === "d" || event.key === "ArrowRight") {
    [matrix, flag] = move_right(matrix);
} else {
    console.log("Invalid Key Pressed");
    return;
}
if (flag) {
        add_2(matrix);
    }

const status = get_cur_state(matrix);
const status_text = document.querySelector('.Status');
status_text.textContent = status;

MatOutput();
if (status !== "GAME NOT OVER") {
    isGameOver = true;
    setTimeout(() => {
        const playerName = prompt(`Game Over (${status})! Score: ${score}. Enter your name:`) || "Anonymous";
        saveLocalScore(playerName, score);
    }, 50);
}
});
document.getElementById('LeStartButton').addEventListener('click', function () {start_game();});
const SCORES_KEY = '2048_local_scores';

function saveLocalScore(playerName, finalScore) {
    const scores = JSON.parse(localStorage.getItem(SCORES_KEY)) || [];

    scores.push({ name: playerName, score: finalScore });
    scores.sort((a, b) => b.score - a.score);
    const top5 = scores.slice(0, 5);

    localStorage.setItem(SCORES_KEY, JSON.stringify(top5));
    renderLocalTable();
}

function renderLocalTable() {
    const scores = JSON.parse(localStorage.getItem(SCORES_KEY)) || [];
    const tbody = document.querySelector('#localTable tbody');
    tbody.innerHTML = '';

    scores.forEach((entry, index) => {
        const row = document.createElement('tr');
        [index + 1, entry.name, entry.score].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;   // textContent so a name can't inject HTML
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}
renderLocalTable();
