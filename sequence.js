/* "use strict"; */


class Sequence {
	constructor(options) {

		this.selector = document.querySelector(options.selector);
		this.elementSeq = document.querySelector(options.selector + ' img');
		this.start = options.start;
		this.sum = options.sum;
		this.mask = options.mask;
		this.fps = options.fps;
		this.format = options.format;
		this.path = options.path + this.mask;

		this.loop = options.loop; // зациклить секвенцию
		this.reverse = options.reverse; // поменять направление свайпа
		this.swipeField = document.querySelector(options.swipeField); //ссылка на дополнительное поле для свайпа
		this.autoplay = options.autoplay; //Автоплей милисекунды
		this.autoplayTimer = 0;
		if (this.autoplay) {
			this.startAutoplay();
		}

		this.points = options.anchorPoints;

		this.direction = '';
		this.counter = this.start; // слайд на данный момент


		this.startPointX = 0;
		this.lastPoint = 0;
		this.nowPoint = 0;

		this.timer = 0;


		this.selector.addEventListener('touchstart', this.setTouchstart.bind(this), false);
		this.selector.addEventListener('touchmove', this.setTouchmove.bind(this), false);
		this.selector.addEventListener('touchend', this.setTouchend.bind(this), false);

		if (this.swipeField) {
			this.swipeField.addEventListener('touchstart', this.setTouchstart.bind(this), false);
			this.swipeField.addEventListener('touchmove', this.setTouchmove.bind(this), false);
			this.swipeField.addEventListener('touchend', this.setTouchend.bind(this), false);
		}

		this.mouseSpeed = { //скорость свайпа
			x: 0,
			speedX: 0,
			oldX: 0,
			update: function () {
				this.speedX = Math.abs(this.x - this.oldX);
				this.oldX = this.x;
			}
		};

	}

	startAutoplay() {
		this.autoplayTimer = setInterval(() => {
			if (this.autoplay.direction === 'left') {
				this.changeImgToLeft();
			} else {
				this.changeImgToRight();
			}
		}, this.autoplay.ms);
	}


	changeImgToLeft() {
		if (this.counter > 1) {
			this.counter--;
			this.changeSrc();
		} else if (this.loop) {
			this.counter = this.sum;
		}
	}

	changeImgToRight() {
		if (this.counter < this.sum) {
			this.counter++;
			this.changeSrc();
		} else if (this.loop) {
			this.counter = 1;
		}
	}

	changeSrc() {
		this.elementSeq.setAttribute('src', this.path + this.counter + this.format);
	}



	inertiaMove() { //доводка, позволяет крутить после отпускания пальца
		let increment = 10;
		this.timer = setInterval(() => {
			if (this.direction === 'L') {
				this.changeImgToLeft();
			} else {
				this.changeImgToRight();
			}
			increment++;
			if (increment >= 40) {
				clearInterval(this.timer);
				this.mouseSpeed.speedX = 0;
			}
		}, increment);
	}


	binding() { //привязка к точкам останова
		let closestRight = Math.min(...this.points.filter(v => v > this.counter));
		if (!isFinite(closestRight)) {
			closestRight = Math.max(...this.points);
		}
		let closestLeft = Math.max(...this.points.filter(v => v < this.counter));
		let center = closestRight - Math.round((closestRight - closestLeft) / 2);

		if (this.counter < center) {
			this.counter = closestLeft;
			this.changeSrc();
		} else {
			this.counter = closestRight;
			this.changeSrc();
		}
	}



	setTouchstart(event) {
		event.preventDefault();
		event.stopPropagation();
		this.startPointX = event.changedTouches[0].pageX;
		if (this.autoplay) {
			clearInterval(this.autoplayTimer);
		}
	}


	setTouchmove(event) {
		this.nowPoint = event.changedTouches[0].pageX;
		this.mouseSpeed.x = event.changedTouches[0].pageX;
		this.mouseSpeed.update();
		let xAbs = this.nowPoint - this.startPointX;

		if (Math.abs(xAbs) > this.fps) {

			if (this.startPointX > this.nowPoint) {
				console.log('L');
				if (this.reverse) {
					this.changeImgToRight();
				} else {
					this.changeImgToLeft();
				}
				this.direction = 'L';
				/*СВАЙП ВЛЕВО*/
			}
			if (this.startPointX < this.nowPoint) {
				console.log('R');
				if (this.reverse) {
					this.changeImgToLeft();
				} else {
					this.changeImgToRight();
				}
				this.direction = 'R';
				/*СВАЙП ВПРАВО*/
			}

			this.startPointX = this.nowPoint;
		}
	}


	setTouchend(event) {
		if (this.mouseSpeed.speedX > 10) {
			this.inertiaMove();
		}
		if (this.points) {
			this.binding();
		}
	}

}






/* 
function Sequence(options) {
	this.swipeField = document.querySelectorAll(options.swipeField);
	this.selector = document.querySelectorAll(options.selector);
	this.elementSeq = document.querySelectorAll(options.selector + ' img');
	this.startSeq = options.startSeq;
	this.endSeq = options.endSeq;
	this.mask = options.mask;
	this.fps = options.fps;
	this.format = options.format;
	this.path = options.path + this.mask;
	this.start = this.startSeq;
	this.end = this.endSeq;
	this.point = options.point;
	this.centerPoint = options.centerPoint;
	this.loop = options.loop;
	this.reverse = options.reverse;

	let startPoint = {};
	let nowPoint;

	let swipeField = this.swipeField; //ссылка на поле для свайпа
	let selCommon = this.selector; //ссылка на контейнер
	let sel = this.elementSeq; //ссылка на изображение
	let fps = this.fps; //скорость смены изображений
	let format = this.format; //формат изображения(jpg или png ...)
	let path = this.path; //путь до изображения
	let start = this.start; //переменная для перебора всех изображений
	let startSeq = this.startSeq; //начальная позиция
	let endSeq = this.endSeq; //конечная позиция
	let pointCheck = this.point;
	let pointStr = new String(this.point);
	let point = pointStr.split(' '); //создаем массив из точек привязки
	let centerPoint = this.centerPoint; //средняя точка между точками привязки
	let direction = ''; //определяет направление свайпа
	let increment = 0; //переменная для привязки
	let loop = this.loop; //бесконечная прокрутка
	let reverse = this.reverse || false; //прокрутка в обратную сторону

	let timerLeft = 0;
	let timerRight = 0;

	let mouseSpeed = { //скорость свайпа
		x: 0,
		speedX: 0,
		oldX: 0,
		update: function () {
			this.speedX = Math.abs(this.x - this.oldX);
			this.oldX = this.x;
		}
	};



	function swipeRight(sel, format, path, startSeq, endSeq) {
		start++;
		if (start >= endSeq) {
			if (loop) {
				start = startSeq;
			} else {
				start = endSeq;
			}
		}

		for (let i = 0; i < sel.length; i++) {
			sel[i].setAttribute('src', path + start + format);
		}

	}

	function swipeLeft(sel, format, path, startSeq, endSeq) {
		start--;
		if (start <= startSeq) {
			if (loop) {
				start = endSeq;
			} else {
				start = startSeq;
			}
		}
		for (let i = 0; i < sel.length; i++) {
			sel[i].setAttribute('src', path + start + format);
		}
	}

	function binding() { //привязка к точкам останова
		for (increment; increment < point.length; increment++) { //проверяем каждую точку привязки

			if ((start >= point[increment]) && (start <= (+point[increment] + centerPoint)) && (direction === 'right')) { //если фото больше точки привязки, и меньше точки середины и свайп в право, то привязку делаем к данной точке привязки
				for (let i = 0; i < sel.length; i++) {
					sel[i].setAttribute('src', path + point[increment] + format);
				}
				start = point[increment];
				break;
			} else
			if ((start >= point[increment]) && (start >= (+point[increment] + centerPoint)) && (direction === 'right')) { //если фото больше точки привязки, и больше точки середины и свайп в право, то привязку делаем к следующей точке привязки
				increment++;
				for (let i = 0; i < sel.length; i++) {
					sel[i].setAttribute('src', path + point[increment] + format);
				}
				start = point[increment];
				break;
			} else
			if ((start <= point[increment]) && (start >= point[increment] - centerPoint) && (direction === 'left')) { //если фото меньше точки привязки, и больше точки середины и свайп в лево, то привязку делаем к данной точке привязки
				if (startSeq < increment) {
					increment = startSeq;
				}
				for (let i = 0; i < sel.length; i++) {
					sel[i].setAttribute('src', path + point[increment] + format);
				}
				start = point[increment];
				break;
			} else
			if ((start <= point[increment]) && (start <= point[increment] - centerPoint) && (direction === 'left')) { //если фото меньше точки привязки, и меньше точки середины и свайп в лево, то привязку делаем к следующей точке привязки
				increment--;
				if (startSeq < increment) {
					increment = startSeq;
				}
				for (let i = 0; i < sel.length; i++) {
					sel[i].setAttribute('src', path + point[increment] + format);
				}
				start = point[increment];
				break;
			}
		}
	}



	function doAttenuation() { //доводка, позволяет крутить после отпускания пальца
		for (let i = 0; i < selCommon.length; i++) {
			selCommon[i].removeEventListener('touchstart', setTouchstart, false);
		}
		for (let k = 0; k < selCommon.length; k++) {
			selCommon[k].removeEventListener('touchend', setTouchend, false);
		}
		clearInterval(timerLeft);
		clearInterval(timerRight);

		let afterSwipe = ((endSeq - startSeq) * 90) / 100;
		let attenuation;

		if ((mouseSpeed.speedX > 10) && (direction === 'right')) {
			let incRight = 0;
			attenuation = mouseSpeed.speedX;

			timerRight = setInterval(function () {
				swipeRight(sel, format, path, startSeq, endSeq);
				if (incRight > afterSwipe) {
					clearInterval(timerRight);
					for (let n = 0; n < selCommon.length; n++) {
						selCommon[n].addEventListener('touchstart', setTouchstart, false);
					}
					for (let k = 0; k < selCommon.length; k++) {
						selCommon[k].addEventListener('touchend', setTouchend, false);
					}
				}
				incRight++;
				attenuation = Math.atan(-attenuation + 6) + (Math.PI / 2); //функция арккотангенс
			}, attenuation);
		} else
		if ((mouseSpeed.speedX > 10) && (direction === 'left')) {
			let incLeft = 0;
			attenuation = mouseSpeed.speedX;

			timerLeft = setInterval(function () {
				swipeLeft(sel, format, path, startSeq, endSeq)
				if (incLeft > afterSwipe) {
					clearInterval(timerLeft);
					for (let n = 0; n < selCommon.length; n++) {
						selCommon[n].addEventListener('touchstart', setTouchstart, false);
					}
					for (let k = 0; k < selCommon.length; k++) {
						selCommon[k].addEventListener('touchend', setTouchend, false);
					}
				}
				incLeft++;
				attenuation = Math.atan(-attenuation + 6) + (Math.PI / 2); //функция арккотангенс
			}, attenuation);
		} else
		if (mouseSpeed.speedX <= 10) {
			clearInterval(timerLeft);
			clearInterval(timerRight);
			for (let n = 0; n < selCommon.length; n++) {
				selCommon[n].addEventListener('touchstart', setTouchstart, false);
			}
			for (let c = 0; c < selCommon.length; c++) {
				selCommon[c].addEventListener('touchend', setTouchend, false);
			}
		}
	}




	function setTouchstart(event) {
		event.preventDefault();
		event.stopPropagation();
		startPoint.x = event.changedTouches[0].pageX;
		clearInterval(timerLeft);
		clearInterval(timerRight);
	}


	function setTouchmove(event) {
		event.preventDefault();
		event.stopPropagation();
		let otk = {};
		nowPoint = event.changedTouches[0];
		otk.x = nowPoint.pageX - startPoint.x;
		mouseSpeed.x = event.changedTouches[0].pageX;
		mouseSpeed.y = event.changedTouches[0].pageY;
		mouseSpeed.update();
		if (Math.abs(otk.x) > fps) { //скорость кадров
			if (otk.x < 0 && !reverse) {
				direction = 'left';
				swipeLeft(sel, format, path, startSeq, endSeq); //если свайп влево, то вызываем эту функцию
			}
			if (otk.x > 0 && !reverse) {
				direction = 'right';
				swipeRight(sel, format, path, startSeq, endSeq); //если свайп вправо, то вызываем эту функцию
			}
			if (otk.x < 0 && reverse) { //меняем направление секвенции
				direction = 'right';
				swipeRight(sel, format, path, startSeq, endSeq); 
			}
			if (otk.x > 0 && reverse) { //меняем направление секвенции
				direction = 'left';
				swipeLeft(sel, format, path, startSeq, endSeq); 
			}
			startPoint = {
				x: nowPoint.pageX
			};

		}
	}

	function setTouchend(event) {
		if (pointCheck) {
			binding();
		} else {
			doAttenuation();
		}
	}


	for (let n = 0; n < selCommon.length; n++) {
		selCommon[n].addEventListener('touchstart', setTouchstart, false);
	}
	for (let r = 0; r < swipeField.length; r++) {
		swipeField[r].addEventListener('touchstart', setTouchstart, false);
	}

	for (let i = 0; i < selCommon.length; i++) {
		selCommon[i].addEventListener('touchmove', setTouchmove, false);
	}
	for (let d = 0; d < swipeField.length; d++) {
		swipeField[d].addEventListener('touchmove', setTouchmove, false);
	}

	for (let k = 0; k < selCommon.length; k++) {
		selCommon[k].addEventListener('touchend', setTouchend, false);
	}
	for (let a = 0; a < swipeField.length; a++) {
		swipeField[a].addEventListener('touchend', setTouchend, false);
	}

} */