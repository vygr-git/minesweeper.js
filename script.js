const clickSE = new Audio('./se/click.mp3');
const RclickSE = new Audio('./se/Rclick.mp3');
const bombSE = new Audio('./se/bomb.mp3');

const emoji = ['👻', '🎃', '🦂', '💥', '🤷🏻‍♀️'];
let bombEmoji = emoji[(Math.floor(Math.random() * emoji.length))];

class Cells extends HTMLTableCellElement {
  constructor() {
    super();
    this.addEventListener('click', this.clickFunction);
    this.addEventListener('contextmenu', this.RightClickFunction);
  }

  init(x, y, mineFlag) {
    this.isOpen = false;
    this.x = x;
    this.y = y;
    this.mineFlag = mineFlag;
    this.classList.add('closed');
    this.classList.add(`${x}:${y}`);
  }

  setArounds(arounds) {
    this.arounds = arounds;
    this.aroundBombCount = this.arounds.filter(around => around.mineFlag).length;
  }

  // 表示処理
  show() {
    if (this.mineFlag) {
      this.textContent = bombEmoji;
      this.classList.remove('closed');
      this.classList.add('bombed');
      bombSE.play();

    } else {
      if (this.aroundBombCount > 0) this.textContent = this.aroundBombCount;
      this.classList.remove('closed');
      this.classList.add('opened');
      clickSE.currentTime=0;
      clickSE.play();
    }
  }

  // 開封処理
  clickFunction() {

    // すでに開封済みのセル、マークされているセルは処理しない
    if (this.isOpen) return;
    if (this.textContent === '🚩' || this.textContent === '❔') return;

    // 表示処理
    this.isOpen = true;
    this.show();

    // 地雷セルだったとき ゲームオーバー処理
    if (this.mineFlag) {
      GameCells.forEach(cell => cell.show());
      document.getElementById('message').textContent = 'Game Over';

    // 地雷に隣接していないセルの場合、その隣接しているセルにも開封処理を行う
    } else if (this.aroundBombCount === 0) {
      this.arounds.forEach(around => around.clickFunction());
    }
  }

  // マーク処理
  RightClickFunction(e) {
    e.preventDefault();

    if (this.isOpen) return;

    switch (this.textContent) {
      case '':
        this.textContent = '🚩';
        break;
      case '🚩':
        this.textContent = '❔';
        break;
      case '❔':
        this.textContent = '';
        break;
      default:
        this.textContent = '';
    }

    RclickSE.currentTime=0;
    RclickSE.play();
  }
}

customElements.define('ms-td', Cells, {extends: 'td'});

// 地雷セルの座標の配列を作成
const createMap = (xSize, ySize, mines) => {
  let map = [];

  let i = 0;
  while (i < mines) {
    // ランダムにxy座標を作成
    let coordinate = Math.floor(Math.random() * xSize) +':'+Math.floor(Math.random() * ySize);

    // すでに登録されている座標でないときのみ座標を登録
    if (!map.filter(mine => mine == coordinate).length) {
      map.push(coordinate);
      i ++;
    }
  }

  return map;
}

let GameCells = [];

// ゲームの初期化
const initGame = (xSize, ySize, mines) => {

  let minesMap = createMap(xSize, ySize, mines);

  for (let y = 0; y < ySize; y++) {
    let tr = document.createElement('tr');

    for (let x = 0; x < xSize; x++) {
      let coordinate = `${x}:${y}`;
      let GameCell = document.createElement('td', {is:'ms-td'});

      // minesMapに座標があれば地雷セルとして作成
      let isMine = minesMap.filter(mine => mine == coordinate).length ? true : false;

      GameCell.init(x, y, isMine);
      tr.appendChild(GameCell);
      GameCells.push(GameCell);
    }

    document.getElementById('game').appendChild(tr);
  }

  // 隣接セルの情報を取得
  GameCells.forEach(GameCell => {
    let arounds = GameCells.filter(otherCell => {
      if (GameCell === otherCell) {
        return false;
      }

      let xArea = [GameCell.x - 1, GameCell.x, GameCell.x + 1];
      let yArea = [GameCell.y - 1, GameCell.y, GameCell.y + 1];

      if (xArea.indexOf(otherCell.x) >= 0) {
        if (yArea.indexOf(otherCell.y) >= 0) {
          return true;
        }
      }
      return false;
    })

    GameCell.setArounds(arounds);
  })
}

let message = document.getElementById('message');
message.textContent = 'Click start';

let button = document.getElementById('start');
button.addEventListener('click', () => {
  if (button.value === 'reset') {
    location.reload();
  } else {
    let x = document.getElementById('x').value;
    let y = document.getElementById('y').value;
    let mines = document.getElementById('mines').value;
    message.textContent = 'Playing'
    initGame(x, y, mines);
    button.value = 'reset';
  }
});