import R from 'ramda';

const orbColor = { black: 0, red: 1, green: 2, blue: 3 };

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

R.forEach(
  (x) => {
    context.beginPath();
    context.arc(x * 10, 10, 10, 0, Math.PI * 2, false);
    context.stroke();
  },
  R.range(0, 10));

