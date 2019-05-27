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
		this.inertiaMoveTimer = 1;
		this.inertiaMoveTimeOut = 0;



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
		clearTimeout(this.inertiaMoveTimeOut);
		let impulse = 0.5 * this.mouseSpeed.speedX;
		this.inertiaMoveTimer = impulse;

		let maxTime = 50;

		let inertia = () => {
			if (this.direction === 'L') {
				this.changeImgToLeft();
			} else {
				this.changeImgToRight();
			}
			if (this.inertiaMoveTimer < maxTime) {
				this.inertiaMoveTimer += 3;
				this.inertiaMoveTimeOut = setTimeout(inertia, this.inertiaMoveTimer);
				if (this.inertiaMoveTimer >= maxTime) {
					this.inertiaMoveTimer = 0;
					this.mouseSpeed.speedX = 0;
					clearTimeout(this.inertiaMoveTimeOut);
				}
			}
		};

		this.inertiaMoveTimeOut = setTimeout(inertia, this.inertiaMoveTimer);

		/* 		if (this.direction === 'L') {
					this.changeImgToLeft();
				} else {
					this.changeImgToRight();
				}
				console.log('ee');
				console.log(this.inertiaMoveTimer);
				if (this.inertiaMoveTimer < 60) {
					this.inertiaMoveTimer += 1;
					setTimeout(this.inertiaMove(), this.inertiaMoveTimer);
				} */

		/* 	let increment = 10;
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
			}, increment); */
	}


	binding() { //привязка к точкам останова
		let closestRight = Math.min(...this.points.filter(v => v >= this.counter));
		if (!isFinite(closestRight)) {
			closestRight = Math.max(...this.points);
		}
		let closestLeft = Math.max(...this.points.filter(v => v <= this.counter));
		if (!isFinite(closestLeft)) {
			closestLeft = Math.min(...this.points);
		}
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
				//console.log('L');
				if (this.reverse) {
					this.changeImgToRight();
				} else {
					this.changeImgToLeft();
				}
				this.direction = 'L';
				/*СВАЙП ВЛЕВО*/
			}
			if (this.startPointX < this.nowPoint) {
				//console.log('R');
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
			//setTimeout(this.inertiaMove(), this.inertiaMoveTimer);
		}
		if (this.points) {
			this.binding();
		}
	}
}