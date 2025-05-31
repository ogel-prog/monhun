const board = document.getElementById("puzzle");
const gridCols = 4;
const gridRows = 5;

let blocks = [
  { id: "M", x: 1, y: 0, w: 2, h: 2, cl: "large-barrel-bomb" },
  { id: "F0", x: 0, y: 0, w: 1, h: 2, cl: "whetstone" },
  { id: "F1", x: 3, y: 0, w: 1, h: 2, cl: "whetstone" },
  { id: "F2", x: 0, y: 2, w: 1, h: 2, cl: "flash-bomb" },
  { id: "F3", x: 3, y: 2, w: 1, h: 2, cl: "flash-bomb" },
  { id: "B", x: 1, y: 2, w: 2, h: 1, cl: "pitfall-trap" },
  { id: "K0", x: 1, y: 3, w: 1, h: 1, cl: "potion" },
  { id: "K1", x: 2, y: 3, w: 1, h: 1, cl: "potion" },
  { id: "K2", x: 0, y: 4, w: 1, h: 1, cl: "potion" },
  { id: "K3", x: 3, y: 4, w: 1, h: 1, cl: "potion" },
];

const initialBlocks = JSON.parse(JSON.stringify(blocks));

let dragging = null;
let dragStart = { x: 0, y: 0 };
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("mouseup", (e) => {
  if (!dragging) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  const threshold = 20;

  // 一番大きい方向にスナップする
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > threshold) tryMove(dragging.id, "right");
    else if (dx < -threshold) tryMove(dragging.id, "left");
  } else {
    if (dy > threshold) tryMove(dragging.id, "down");
    else if (dy < -threshold) tryMove(dragging.id, "up");
  }

  dragging = null;
});

function render() {
  board.innerHTML = "";
  for (const block of blocks) {
    const div = document.createElement("div");
    div.className = "block";
    div.textContent = ""; //block.id;
    div.classList.add(block.cl);
    div.style.gridColumn = `${block.x + 1} / span ${block.w}`;
    div.style.gridRow = `${block.y + 1} / span ${block.h}`;
    div.addEventListener("mousedown", (e) => {
      dragging = block;
      dragStart = { x: e.clientX, y: e.clientY };
    });
    div.addEventListener("touchstart", e => onTouchStart(e, block.id));
    div.addEventListener("touchend", e => onTouchEnd(e, block.id));
    board.appendChild(div);
  }
}

function onTouchStart(e, id) {
  const touch = e.touches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  e.preventDefault();
}

function onTouchEnd(e, id) {
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  let direction = null;
  if (Math.max(absDx, absDy) < 20) return; // 小さすぎるスワイプは無視

  if (absDx > absDy) {
    direction = dx > 0 ? "right" : "left";
  } else {
    direction = dy > 0 ? "down" : "up";
  }

  tryMove(id, direction);
}

function tryMove(id, direction) {
  const b = blocks.find(b => b.id === id);
  if (!b) return;

  const dx = { left: -1, right: 1, up: 0, down: 0 }[direction];
  const dy = { left: 0, right: 0, up: -1, down: 1 }[direction];

  const newX = b.x + dx;
  const newY = b.y + dy;

  if (isFreeSpace(newX, newY, b.w, b.h, b.id)) {
    b.x = newX;
    b.y = newY;
    render();
    checkGoal();
  }
}

function isFreeSpace(x, y, w, h, selfId = null) {
  if (x < 0 || y < 0 || x + w > gridCols || y + h > gridRows) return false;

  for (const b of blocks) {
    if (b.id === selfId) continue;
    if (
      x < b.x + b.w &&
      x + w > b.x &&
      y < b.y + b.h &&
      y + h > b.y
    ) {
      return false;
    }
  }
  return true;
}

function checkGoal() {
  const a = blocks.find(b => b.id === "M");
  if (
    a.x === 1 &&
    a.y === 3 &&
    a.w === 2 &&
    a.h === 2
  ) {
    showMessage("クリア");
    return true;
  }
  return false;
}

function showMessage(text) {
  const box = document.getElementById("message-box");
  box.textContent = text;
  box.classList.remove("hidden");
}

function hideMessage() {
  const box = document.getElementById("message-box");
  box.classList.add("hidden");
}

document.getElementById("reset-btn").addEventListener("click", () => {
  blocks = JSON.parse(JSON.stringify(initialBlocks));
  hideMessage();
  render();
});

render();
