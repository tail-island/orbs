import R            from 'ramda';
import * as random  from './random';

export class Wall {
  constructor() {
    this.name = 'w';
  }
}

export class Colored {
  static get colors() {
    return { black: 0, red: 1, green: 2, blue: 3 };
  }

  constructor(color) {
    this.name = ['b', 'r', 'g', 'b'][color];
    this.color = color;
  }
}

export class Gate extends Colored {
}

export class Orb extends Colored {
}

export class BlackOrb extends Orb {
  constructor(scores) {
    super(Colored.colors.black);

    this.scores = scores;
  }
}

export default class Model {
  constructor(seed, size, blackOrbCount, wallRate) {
    random.seed(seed);

    this.size = size;
    this.blackOrbCount = blackOrbCount;

    this.items = R.times(
      (_y) => {
        return R.times(
          (_x) => {
            if (random.next() < wallRate) {
              return new Wall();
            }

            return new Orb(random.nextUInt() % 3 + Colored.colors.red);
          },
          this.size);
      },
      this.size);

    this.frames = R.times(
      (_) => {
        return R.times(
          (_i) => {
            return new Gate(random.nextUInt() % 3 + Colored.colors.red);
          },
          this.size);
      },
      4);

    this.wait = 100;
    this.questionString = R.join('\n', R.concat([this.size, this.blackOrbCount], R.map(row => R.join(' ', R.map(item => item.name, row)), R.concat(this.items, this.frames))));
  }

  setView(view) {
    this._view = view;
  }

  getBlackOrbPositions() {
    // 効率のために、関数型じゃない書き方をしました。
    // 遅延評価欲しい……。

    const result = [];

    R.addIndex(R.forEach)(
      (row, y) => {
        R.addIndex(R.forEach)(
          (item, x) => {
            if (item instanceof BlackOrb) {
              result.push([y, x]);
            }
          },
          row);
      },
      this.items);

    return result;
  }

  async pushBlackOrb(y, x) {
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          () => {
            if (!(x >= 0 && x < this.size && y >= 0 | y < this.size)) {
              reject(new Error(`(${x}, ${y})には、黒い宝玉を置けません。`));
            }

            const scores = (() => {
              switch (this.items[y][x].color) {
              case Colored.colors.red:
                return [1, 0, 0];
              case Colored.colors.green:
                return [0, 1, 0];
              case Colored.colors.blue:
                return [0, 0, 1];
              default:
                reject(new Error(`(${x}, ${y})には、黒い宝玉を置けません`));
                return null;
              }
            })();

            this.items[y][x] = new BlackOrb(scores);
            this._view.update();

            resolve();
          },
          this.wait);
      });
  }

  async doCommandStep(command) {
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          () => {
            const [dy, dx] = [[0, -1], [-1, 0], [0, 1], [1, 0]][command];

            const blackOrbPositions = R.sort(
              (position1, position2) => {
                switch (command) {
                case 0:
                  return position1[1] - position2[1];
                case 1:
                  return position1[0] - position2[0];
                case 2:
                  return position2[1] - position1[1];
                case 3:
                  return position2[0] - position1[0];
                default:
                  reject(new Error(`${command}は、不正なコマンドです。`));
                  return null;
                }
              },
              this.getBlackOrbPositions());

            const movedCount = R.sum(
              R.map(
                ([cy, cx]) => {
                  const ny = cy + dy;
                  const nx = cx + dx;

                  if (ny === -1 || ny === this.size || nx === -1 || nx === this.size) {
                    this.items[cy][cx] = null;
                    return 1;
                  }

                  const nextItem = this.items[ny][nx];

                  if (nextItem instanceof Wall || nextItem instanceof BlackOrb) {
                    return 0;
                  }

                  if (nextItem instanceof Orb) {
                    this.items[cy][cx].scores[nextItem.color - Colored.colors.red] += 1;
                  }

                  this.items[ny][nx] = this.items[cy][cx];
                  this.items[cy][cx] = null;

                  return 1;
                },
                blackOrbPositions));

            this._view.update();

            resolve(movedCount);
          },
          this.wait);
      });
  }

  async doCommand(command) {
    return new Promise(
      (resolve) => {
        setTimeout(
          async () => {
            while (await this.doCommandStep(command) > 0);

            resolve();
          },
          this.wait);
      });
  }
}
