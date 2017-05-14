import R                   from 'ramda';
import { Wall, Gate, Orb } from './model';

export default class View {
  static get fillStyles() {
    return [
      'rgb(255, 127, 127)',
      'rgb(127, 255, 127)',
      'rgb(165, 165, 255)',
      'rgb( 63,  63,  63)',
    ];
  }

  static get strokeStyles() {
    return [
      'rgb( 63,  31,  31)',
      'rgb( 31,  63,  31)',
      'rgb( 31,  63,  63)',
      'rgb( 31,  31,  31)',
    ];
  }

  constructor(canvas) {
    this._canvas  = canvas;
    this._context = canvas.getContext('2d');
  }

  setModel(model) {
    this._model = model;
  }

  _drawWall(y, x, _wall) {
    this._context.beginPath();
    this._context.rect(x + 0.2, y + 0.2, 0.6, 0.6);
    this._context.closePath();

    this._context.fillStyle = 'rgb(0, 0, 0)';
    this._context.fill();

    this._context.strokeStyle = 'rgb(0, 0, 0)';
    this._context.stroke();
  }

  _drawOrb(y, x, orb) {
    this._context.beginPath();
    this._context.arc(x + 0.5, y + 0.5, 0.4, 0, Math.PI * 2, false);
    this._context.closePath();

    this._context.fillStyle = View.fillStyles[orb.color];
    this._context.fill();

    this._context.strokeStyle = View.strokeStyles[orb.color];
    this._context.stroke();
  }

  _drawGate(y, x, gate) {
    const isHorizontal = y === -1 || y === this._model.size;
    const isVertical   = x === -1 || x === this._model.size;

    this._context.beginPath();
    this._context.rect(
      x + (isHorizontal ? 0.1 : 0.3),
      y + (isVertical   ? 0.1 : 0.3),
      isHorizontal ? 0.8 : 0.4,
      isVertical   ? 0.8 : 0.4);
    this._context.closePath();

    this._context.fillStyle = View.fillStyles[gate.color];
    this._context.fill();

    this._context.strokeStyle = View.strokeStyles[gate.color];
    this._context.stroke();
  }

  _drawItem(y, x, item) {
    if (item instanceof Wall) {
      this._drawWall(y, x, item);
    }

    if (item instanceof Gate) {
      this._drawGate(y, x, item);
    }

    if (item instanceof Orb) {
      this._drawOrb(y, x, item);
    }
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
            this._drawItem(y, x, item);
          },
          row);
      },
      this._model.items);

    // draw frames.

    const drawVFrame = (x, frame) => {
      R.addIndex(R.forEach)((item, y) => { this._drawItem(y, x, item); }, frame);
    };

    const drawHFrame = (y, frame) => {
      R.addIndex(R.forEach)((item, x) => { this._drawItem(y, x, item); }, frame);
    };

    drawVFrame(-1,               this._model.frames[0]);
    drawHFrame(-1,               this._model.frames[1]);
    drawVFrame(this._model.size, this._model.frames[2]);
    drawHFrame(this._model.size, this._model.frames[3]);

    this._context.restore();
  }

  _drawStatus() {
    this._context.save();

    const orbSize = this._canvas.height / (this._model.size + 2);
    const blackOrbPositions = R.sort((position1, position2) => position1[0] - position2[0], this._model.getBlackOrbPositions());

    R.addIndex(R.forEach)(
      ([y, x], i) => {
        this._context.beginPath();
        this._context.moveTo((x + 1) * orbSize + orbSize / 2, (y + 1) * orbSize + orbSize / 2);
        this._context.lineTo(this._canvas.height + 8, i * 30 + 15);
        this._context.closePath();

        this._context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        this._context.stroke();

        this._context.font = "9px 'Georgia'";
        this._context.textBaseline = 'top';

        this._context.fillStyle = 'red';
        this._context.fillText(`${this._model.items[y][x].scores[0]} reds`,   this._canvas.height + 10, i * 30 +  1);

        this._context.fillStyle = 'green';
        this._context.fillText(`${this._model.items[y][x].scores[1]} greens`, this._canvas.height + 10, i * 30 + 10);

        this._context.fillStyle = 'blue';
        this._context.fillText(`${this._model.items[y][x].scores[2]} blues`,  this._canvas.height + 10, i * 30 + 19);
      },
      blackOrbPositions);

    this._context.font = "16px 'Georgia'";
    this._context.textBaseline = 'top';
    this._context.fillStyle = 'black';
    this._context.fillText(`Score: ${this._model.score}`, this._canvas.height + 10 + (this._canvas.width - this._canvas.height) / 2, this._canvas.height / 2 - 8);

    this._context.restore();
  }

  update() {
    this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

    this._drawCase();
    this._drawStatus();
  }
}
