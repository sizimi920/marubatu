let count = 0;
let gameOver = false;

function updateTurn() {
    const turnElem = document.getElementById("turn");
    if (gameOver) return; // 終局後は更新しない
    if (count % 2 === 0) {
        turnElem.textContent = "○の番";
        turnElem.style.color = "red";
    } else {
        turnElem.textContent = "×の番";
        turnElem.style.color = "blue";
    }
}

function init() {
    const board = document.getElementById("board");
    board.innerHTML = "";
    for (let i = 0; i < 3; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < 3; j++) {
            const td = document.createElement("td");
            td.className = "cell";
            td.id = "cell" + (i * 3 + j); // 0〜8の番号にした方が扱いやすい
            td.onclick = clicked;
            tr.appendChild(td);
        }
        board.appendChild(tr);
    }
    document.getElementById("resetButton").onclick = resetGame;
    resetGame();
}

function clicked(event) {
    if (gameOver) return;
    if (event.target.textContent !== "") return;

    if (count % 2 === 0) {
        event.target.textContent = "○";
        event.target.style.color = "red";
    } else {
        event.target.textContent = "×";
        event.target.style.color = "blue";
    }
    count++;

    const winner = checkWinner();
    if (winner) {
        const turnElem = document.getElementById("turn");
        if (winner === "draw") {
            turnElem.textContent = "引き分け！";
            turnElem.style.color = "black";
        } else {
            turnElem.textContent = `${winner} の勝ち！`;
            turnElem.style.color = winner === "○" ? "red" : "blue";
        }
        gameOver = true;
    } else {
        updateTurn();
    }
}

function resetGame() {
    count = 0;
    gameOver = false;
    const cells = document.getElementsByClassName("cell");
    for (const cell of cells) {
        cell.textContent = "";
        cell.style.color = "";
    }
    updateTurn();
}

function checkWinner() {
    // 1. 盤面の状態を配列にまとめる
    const cells = [...document.getElementsByClassName("cell")].map(cell => cell.textContent);
    // 2. 勝ちパターン（8通り）を定義
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
        [0, 4, 8], [2, 4, 6]             // 斜め
    ];
    // 3. 各パターンをチェック
    for (const [a, b, c] of lines) {
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return cells[a]; // "○" or "×"
        }
    }
    // 4. 全マス埋まっていたら引き分け
    if (cells.every(cell => cell !== "")) return "draw";
    // 5. まだ勝敗が決まっていない
    return null;
}
