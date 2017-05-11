import R     from 'ramda';
import Model from './model';
import View  from './view';

let model = null;
let view  = null;

function getModelParams() {
  const params = R.map(id => parseFloat(document.getElementById(id).value), ['seed', 'size', 'black-orb-count', 'wall-rate']);

  const [seed, size, blackOrbCount, wallRate] = params;
  const isIntNumber = x => typeof x === 'number' && isFinite(x) && Math.floor(x) === x;

  if (seed < 0 || seed > 4294967296 || !isIntNumber(seed)) {
    throw new Error('ランダム・シードが不正です。');
  }
  if (size < 10 || size > 100 || !isIntNumber(size)) {
    throw new Error('ゲーム版のサイズが不正です。');
  }
  if (blackOrbCount < 1 || blackOrbCount > 20 || !isIntNumber(blackOrbCount)) {
    throw new Error('黒い宝玉の数が不正です。');
  }
  if (wallRate < 0.1 || wallRate > 0.5) {
    throw new Error('壁の比率が不正です。');
  }

  return params;
}

function getAnswer() {
  const lines = R.split(/\n|\r\n|\r/, document.getElementById('answer').value);

  return [
    R.map(positionString => R.map(parseInt, R.reverse(R.split(' ', R.trim(positionString)))), R.take(model.blackOrbCount, lines)),
    R.map(parseInt, R.map(R.trim, R.drop(model.blackOrbCount, lines)))];
}

document.getElementById('create-question').addEventListener('click', async () => {
  try {
    model = new Model(...getModelParams());
    view  = new View(document.getElementById('canvas'));

    model.setView(view);
    view.setModel(model);

    view.update();

    document.getElementById('question').value = model.questionString;
  } catch (e) {
    alert(e);

    throw e;
  }
});

document.getElementById('check-answer').addEventListener('click', async () => {
  try {
    document.getElementById('create-question').click();

    const [positions, commands] = getAnswer();
    const wait = parseFloat(document.getElementById('wait').value);

    model.wait = wait;

    for (const position of positions) {
      await model.pushBlackOrb(...position);
    }

    for (const command of commands) {
      await model.doCommand(command);
    }
  } catch (e) {
    alert(e);

    throw e;
  }
});
