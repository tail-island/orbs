import R            from 'ramda';
import * as random  from './random';

export class Wall {
  constructor() {
    this.name = 'w';
  }
}

export class Colored {
  static get colors() {
    return { red: 0, green: 1, blue: 2, black: 3 };
  }

  constructor(color) {
    this.name = ['r', 'g', 'b', 'x'][color];
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

    this.score = 0;
    this.items = R.times(
      (_y) => {
        return R.times(
          (_x) => {
            if (random.next() < wallRate) {
              return new Wall();
            }

            return new Orb(random.nextUInt() % 3);
          },
          this.size);
      },
      this.size);
    this.frames = R.times(
      (_) => {
        return R.times(
          (_i) => {
            return new Gate(random.nextUInt() % 3);
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
            try {
              if (!(x >= 0 && x < this.size && y >= 0 && y < this.size)) {
                throw new Error(`(${x}, ${y})には、黒い宝玉を置けません。`);
              }

              const scores = (() => {
                const result = [0, 0, 0];

                const item = this.items[y][x];

                if (!(item instanceof Orb) || item instanceof BlackOrb) {
                  throw new Error(`(${x}, ${y})には、黒い宝玉を置けません。`);
                }

                result[item.color] = 1;

                return result;
              })();

              this.items[y][x] = new BlackOrb(scores);
              this._view.update();

              resolve();
            } catch (e) {
              reject(e);
            }
          },
          this.wait);
      });
  }

  async doCommandStep(command) {
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          () => {
            try {
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
                    throw new Error(`${command}は、不正なコマンドです。`);
                  }
                },
                this.getBlackOrbPositions());

              const movedCount = R.sum(
                R.map(
                  ([cy, cx]) => {
                    const ny = cy + dy;
                    const nx = cx + dx;

                    if (ny === -1 || ny === this.size || nx === -1 || nx === this.size) {
                      if (nx === -1) {
                        this.score += this.items[cy][cx].scores[this.frames[0][ny].color];
                      }
                      if (ny === -1) {
                        this.score += this.items[cy][cx].scores[this.frames[1][nx].color];
                      }
                      if (nx === this.size) {
                        this.score += this.items[cy][cx].scores[this.frames[2][ny].color];
                      }
                      if (ny === this.size) {
                        this.score += this.items[cy][cx].scores[this.frames[3][nx].color];
                      }

                      this.items[cy][cx] = null;

                      return 1;
                    }

                    const nextItem = this.items[ny][nx];

                    if (nextItem instanceof Wall || nextItem instanceof BlackOrb) {
                      return 0;
                    }

                    if (nextItem instanceof Orb) {
                      this.items[cy][cx].scores[nextItem.color] += 1;
                    }

                    this.items[ny][nx] = this.items[cy][cx];
                    this.items[cy][cx] = null;

                    return 1;
                  },
                  blackOrbPositions));

              this._view.update();

              resolve(movedCount);
            } catch (e) {
              reject(e);
            }
          },
          this.wait);
      });
  }

  async doCommand(command) {
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          async () => {
            try {
              while (await this.doCommandStep(command) > 0);

              resolve();
            } catch (e) {
              reject(e);
            }
          },
          this.wait);
      });
  }
}
