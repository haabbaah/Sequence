"use strict";
function Sequence(options) {
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

	var startPoint = {};
	var nowPoint;

	var selCommon = this.selector;//ссылка на контейнер
	var sel = this.elementSeq;//ссылка на изображение
	var fps = this.fps;//скорость смены изображений
	var format = this.format;//формат изображения(jpg или png ...)
	var path = this.path;//путь до изображения
	var start = this.start;//переменная для перебора всех изображений
	var startSeq = this.startSeq;//начальная позиция
	var endSeq = this.endSeq;//конечная позиция
	var pointCheck = this.point;
	var pointStr = new String(this.point);
	var point = pointStr.split(' ');//создаем массив из точек привязки
	var centerPoint = this.centerPoint;//средняя точка между точками привязки
	var direction = '';//определяет направление свайпа
	var increment = 0;//переменная для привязки
	var loop = this.loop;//бесконечная прокрутка

	var timerLeft = 0;
	var timerRight = 0;

	var mouseSpeed = {
		x: 0,
		speedX: 0,
		oldX: 0,
		update: function () {
			this.speedX = Math.abs(this.x - this.oldX);
			this.oldX = this.x;
		}
	}


	function swipeRight(sel, format, path, startSeq, endSeq) {
		start++;
		if (start >= endSeq) {
			if (loop) {
				start = startSeq;
			}else {
				start = endSeq;
			}
		}
		for (var i = 0; i < sel.length; i++) {
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
		for (var i = 0; i < sel.length; i++) {
			sel[i].setAttribute('src', path + start + format);
		}
	}

	function binding() {
		for (increment; increment < point.length; increment++) {//проверяем каждую точку привязки

			if ((start >= point[increment]) && (start <= (+point[increment] + centerPoint)) && (direction === 'right')) {//если фото больше точки привязки, и меньше точки середины и свайп в право, то привязку делаем к данной точке привязки
				for (var i = 0; i < sel.length; i++) {
					sel[i].setAttribute('src', path + point[increment] + format);
				}
				start = point[increment];
				break;
			} else
				if ((start >= point[increment]) && (start >= (+point[increment] + centerPoint)) && (direction === 'right')) {//если фото больше точки привязки, и больше точки середины и свайп в право, то привязку делаем к следующей точке привязки
					increment++;
					for (var i = 0; i < sel.length; i++) {
						sel[i].setAttribute('src', path + point[increment] + format);
					}
					start = point[increment];
					break;
				} else
					if ((start <= point[increment]) && (start >= point[increment] - centerPoint) && (direction === 'left')) {//если фото меньше точки привязки, и больше точки середины и свайп в лево, то привязку делаем к данной точке привязки
						for (var i = 0; i < sel.length; i++) {
							sel[i].setAttribute('src', path + point[increment] + format);
						}
						start = point[increment];
						break;
					} else
						if ((start <= point[increment]) && (start <= point[increment] - centerPoint) && (direction === 'left')) {//если фото меньше точки привязки, и меньше точки середины и свайп в лево, то привязку делаем к следующей точке привязки
							increment--;
							for (var i = 0; i < sel.length; i++) {
								sel[i].setAttribute('src', path + point[increment] + format);
							}
							start = point[increment];
							break;
						}
		}
	}

	function doAttenuation() {
		for (var i = 0; i < selCommon.length; i++) {
			selCommon[i].removeEventListener('touchstart', setTouchstart, false);
		};
		console.log(mouseSpeed.speedX);
		if ((mouseSpeed.speedX > 10) && (direction === 'right')) {
			if (mouseSpeed.speedX > 100) {
				mouseSpeed.speedX = 90;
			}
			var incRight = 0;
			var attenuation = mouseSpeed.speedX;
			loop();
			function loop() {
				timerRight = setInterval(function () {
					swipeRight(sel, format, path, startSeq, endSeq)
					if (incRight > 10) {
						clearInterval(timerRight);
					}
					incRight++;
					attenuation = Math.sqrt(attenuation);
				}, attenuation);

			}
		} else
			if ((mouseSpeed.speedX > 10) && (direction === 'left')) {
				if (mouseSpeed.speedX > 100) {
					mouseSpeed.speedX = 90;
				}
				var incLeft = 0;
				var attenuation = mouseSpeed.speedX;
				loop();
				function loop() {
					timerLeft = setInterval(function () {
						swipeLeft(sel, format, path, startSeq, endSeq)
						if (incLeft > 10) {
							clearInterval(timerLeft);
						}
						incLeft++;
						attenuation = Math.sqrt(attenuation);
					}, attenuation);

				}
			}
	}

	function setTouchstart(event) {
		event.preventDefault();
		event.stopPropagation();
		startPoint.x = event.changedTouches[0].pageX;
		startPoint.y = event.changedTouches[0].pageY;
	}

	for (var i = 0; i < selCommon.length; i++) {
		selCommon[i].addEventListener('touchstart', setTouchstart, false);
	};

	for (var i = 0; i < selCommon.length; i++) {
		selCommon[i].addEventListener('touchmove', function (event) {
			event.preventDefault();
			event.stopPropagation();
			var otk = {};
			nowPoint = event.changedTouches[0];
			otk.x = nowPoint.pageX - startPoint.x;
			mouseSpeed.x = event.changedTouches[0].pageX;
			mouseSpeed.y = event.changedTouches[0].pageY;
			if (Math.abs(otk.x) > fps) {//скорость кадров
				if (otk.x < 0) {
					mouseSpeed.update();
					direction = 'left';
					swipeLeft(sel, format, path, startSeq, endSeq);//если свайп влево, то вызываем эту функцию
				}
				if (otk.x > 0) {
					mouseSpeed.update();
					direction = 'right';
					swipeRight(sel, format, path, startSeq, endSeq);//если свайп вправо, то вызываем эту функцию
				}
				startPoint = { x: nowPoint.pageX, y: nowPoint.pageY };
			}
		}, false);
	};

	for (var i = 0; i < selCommon.length; i++) {
		selCommon[i].addEventListener('touchend', function (event) {
			if (pointCheck) {
				binding();
			} else {
				doAttenuation();
			}

		}, false);
	};

}