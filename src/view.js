import R from 'ramda';

export default class View {
  constructor(canvas) {
    this._fillStyles = [
      'rgb( 63,  63,  63)',
      'rgb(255, 127, 127)',
      'rgb(127, 255, 127)',
      'rgb(165, 165, 255)',
    ];

    this._strokeStyles = [
      'rgb( 31,  31,  31)',
      'rgb( 63,  31,  31)',
      'rgb( 31,  63,  31)',
      'rgb( 31,  63,  63)',
    ];

    this._canvas  = canvas;
    this._context = canvas.getContext('2d');
  }

  setModel(model) {
    this._model = model;
  }

  _fillStyle(item) {
    return this._fillStyles[
      item - this._model.itemType.black
    ];
  }

  _strokeStyle(item) {
    return this._strokeStyles[
      item - this._model.itemType.black
    ];
  }

  _drawBlank(y, x) {
    this._context.clearRect(x, y, 1.0, 1.0);
  }

  _drawWall(y, x) {
    this._context.beginPath();
    this._context.rect(x + 0.2, y + 0.2, 0.6, 0.6);
    this._context.closePath();

    this._context.fillStyle   = 'rgb(0, 0, 0)';
    this._context.strokeStyle = 'rgb(0, 0, 0)';
    this._context.fill();
    this._context.stroke();
  }

  _drawOrb(y, x, item) {
    this._context.beginPath();
    this._context.arc(x + 0.5, y + 0.5, 0.4, 0, Math.PI * 2, false);
    this._context.closePath();

    this._context.fillStyle   = this._fillStyle(item);
    this._context.strokeStyle = this._strokeStyle(item);

    this._context.fill();
    this._context.stroke();
  }

  _drawGate(y, x, item) {
    const isHorizontal = y === -1 || y === this._model.size;
    const isVertical   = x === -1 || x === this._model.size;

    this._context.beginPath();
    this._context.rect(
      x + (isHorizontal ? 0.1 : 0.3),
      y + (isVertical   ? 0.1 : 0.3),
      isHorizontal ? 0.8 : 0.4,
      isVertical   ? 0.8 : 0.4);
    this._context.closePath();

    this._context.fillStyle   = this._fillStyle(item);
    this._context.strokeStyle = this._strokeStyle(item);

    this._context.fill();
    this._context.stroke();
  }

  _drawCase() {
    this._context.save();

    const orbSize = this._canvas.height / (this._model.size + 2);

    this._context.scale(orbSize, orbSize);
    this._context.translate(1.0, 1.0);  // ケースのフレームの分を、移動しておきます。
    this._context.lineWidth = 0.1;

    // draw items.

    R.addIndex(R.forEach)(
      (row, y) => {
        R.addIndex(R.forEach)(
          (item, x) => {
            switch (item) {
            case this._model.itemType.blank:
              this._drawBlank(y, x);
              break;
            case this._model.itemType.wall:
              this._drawWall(y, x);
              break;
            default:
              this._drawOrb(y, x, item);
              break;
            }
          },
          row);
      },
      this._model.items);

    // draw blackOrbs.

    R.forEach(
      (blackOrb) => {
        if (blackOrb.y < -1 || blackOrb.y > this._model.size ||
            blackOrb.x < -1 || blackOrb.x > this._model.size) {
          return;
        }

        this._drawOrb(blackOrb.y, blackOrb.x, this._model.itemType.black);
      },
      this._model.blackOrbs);

    // draw frames.

    const drawFrameItem = (y, x, item) => {
      switch (item) {
      case this._model.itemType.wall:
        this._drawWall(y, x);
        break;
      default:
        this._drawGate(y, x, item);
        break;
      }
    };

    const drawVFrame = (x, frame) => {
      R.addIndex(R.forEach)((item, y) => { drawFrameItem(y, x, item); }, frame);
    };

    const drawHFrame = (y, frame) => {
      R.addIndex(R.forEach)((item, x) => { drawFrameItem(y, x, item); }, frame);
    };

    drawVFrame(-1,               this._model.frames[0]);
    drawHFrame(-1,               this._model.frames[1]);
    drawVFrame(this._model.size, this._model.frames[2]);
    drawHFrame(this._model.size, this._model.frames[3]);

    this._context.restore();
  }

  update() {
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

    this._drawCase();
  }
}
