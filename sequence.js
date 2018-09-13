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

	var startPoint = {};
	var nowPoint;
	var ldelay;

	var sel = this.elementSeq;
	var fps = this.fps;
	var format = this.format;
	var path = this.path;
	var start = this.start;
	var startSeq = this.startSeq;
	var endSeq = this.endSeq;
	var pointStr = new String(this.point);
	var point = pointStr.split(' ');
	var centerPoint = this.centerPoint;
	var direction = '';
	var increment = 0;


	function swipeRight(sel, format, path, startSeq, endSeq) {
		console.log(start);
		start++;
		if (start >= endSeq) {
			start = endSeq;
		}
		for (var i = 0; i < sel.length; i++) {
			sel[i].setAttribute('src', path + start + format);
		}
	}

	function swipeLeft(sel, format, path, startSeq, endSeq) {
		console.log(start);
		start--;
		if (start <= startSeq) {
			start = startSeq;
		}
		for (var i = 0; i < sel.length; i++) {
			sel[i].setAttribute('src', path + start + format);
		}
	}

	for (var i = 0; i < this.selector.length; i++) {
		this.selector[i].addEventListener('touchstart', function (event) {
			event.preventDefault();
			event.stopPropagation();
			startPoint.x = event.changedTouches[0].pageX;
			startPoint.y = event.changedTouches[0].pageY;
			ldelay = new Date();
		}, false);
	};

	for (var i = 0; i < this.selector.length; i++) {
		this.selector[i].addEventListener('touchmove', function (event) {
			event.preventDefault();
			event.stopPropagation();
			var otk = {};
			nowPoint = event.changedTouches[0];
			otk.x = nowPoint.pageX - startPoint.x;
			if (Math.abs(otk.x) > fps) {
				if (otk.x < 0) {
					direction = 'left';
					swipeLeft(sel, format, path, startSeq, endSeq)
				}
				if (otk.x > 0) {
					direction = 'right';
					swipeRight(sel, format, path, startSeq, endSeq)
				}
				startPoint = { x: nowPoint.pageX, y: nowPoint.pageY };
			}
		}, false);
	};
	for (var i = 0; i < this.selector.length; i++) {
		this.selector[i].addEventListener('touchend', function (event) {
			for (increment; increment < point.length; increment++) {//проверяем каждую точку привязки

				if ((start >= point[increment]) && (start <= (+point[increment] + centerPoint)) && (direction === 'right')) {//если фото
					for (var i = 0; i < sel.length; i++) {
						sel[i].setAttribute('src', path + point[increment] + format);
					}
					start = point[increment];
					break;
				} else
					if ((start >= point[increment]) && (start >= (+point[increment] + centerPoint)) && (direction === 'right')) {
						increment++;
						for (var i = 0; i < sel.length; i++) {
							sel[i].setAttribute('src', path + point[increment] + format);
						}
						start = point[increment];
						break;
					} else
						if ((start <= point[increment]) && (start >= point[increment] - centerPoint) && (direction === 'left')) {
							for (var i = 0; i < sel.length; i++) {
								sel[i].setAttribute('src', path + point[increment] + format);
							}
							start = point[increment];
							break;
						} else
							if ((start <= point[increment]) && (start <= point[increment] - centerPoint) && (direction === 'left')) {
								increment--;
								for (var i = 0; i < sel.length; i++) {
									sel[i].setAttribute('src', path + point[increment] + format);
								}
								start = point[increment];
								break;
							}
			}
		}, false);
	};

}