import R            from 'ramda';
import * as random  from './random';

class BlackOrb {
  constructor(y, x, red, green, blue) {
    this.y = y;
    this.x = x;

    this.red   = red;
    this.green = green;
    this.blue  = blue;
  }
}

export default class Model {
  constructor(seed, size, blackOrbCount, wallRate) {
    random.seed(seed);

    this.itemType = { blank: 0, wall: 1, black: 2, red: 3, green: 4, blue: 5 };

    this.size = size;
    this.blackOrbCount = blackOrbCount;

    const randomItem = () => {
      if (random.next() < wallRate) {
        return this.itemType.wall;
      }

      return random.nextUInt() % 3 + this.itemType.red;
    };

    this.items     = R.times(_ => R.times(randomItem, this.size), this.size);
    this.frames    = R.times(_ => R.times(randomItem, this.size), 4);
    this.blackOrbs = [];

    this.questionString =
      R.join('\n',
             R.concat([this.size, this.blackOrbCount],
                      R.map(row => R.join(' ',
                                          R.map(item => ['?', 'w', '?', 'r', 'g', 'b'][item],
                                                row)),
                            R.concat(this.items, this.frames))));
  }

  setView(view) {
    this._view = view;
  }

  async pushBlackOrb(y, x) {
    return new Promise(
      (resolve, reject) => {
        setTimeout(
          () => {
            try {
              if (!(x >= 0 && x < this.size && y >= 0 | y < this.size)) {
                throw new Error(`(${x}, ${y})には、黒い宝玉を置けません。`);
              }

              const scores = (() => {
                switch (this.items[y][x]) {
                case this.itemType.red:
                  return [1, 0, 0];
                case this.itemType.green:
                  return [0, 1, 0];
                case this.itemType.blue:
                  return [0, 0, 1];
                default:
                  throw new Error(`(${x}, ${y})には、黒い宝玉を置けません`);
                }
              })();

              this.blackOrbs.push(new BlackOrb(y, x,  ...scores));
              this.items[y][x] = itemType.blank;

              this._view.update();

              resolve();
            } catch (e) {
              reject(e);
            }
          },
          1);
      });
  }

  async doCommand(command) {
    return new Promise(
      (resolve) => {
        setTimeout(
          () => {
            console.log(command);

            resolve();
          },
          1);
      });
  }
}
