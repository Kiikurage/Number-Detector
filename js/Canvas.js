var Canvas = (function() {
	function Canvas(dom) {

		this
			.dom(dom)
			.size(0, 0, this.dom().width, this.dom().height);

		return this
	}

	/*--------------------------------------------------------------------
	 * プロパティ群
	 */

	Canvas.prototype.dom = function(dom) {
		if (dom === undefined) return this._dom;

		if (typeof dom == "string") {
			this._dom = document.querySelector(dom);
		} else if (dom instanceof HTMLCanvasElement) {
			this._dom = dom;
		}

		return this
	}

	Canvas.prototype.size = function(x0, y0, x1, y1) {
		this
			.x0(x0)
			.y0(y0)
			.x1(x1)
			.y1(y1);
		return this
	}

	Canvas.prototype.x0 = function(x) {
		if (x === undefined) return this._x0
		this._x0 = x;
		return this
	}

	Canvas.prototype.y0 = function(y) {
		if (y === undefined) return this._y0
		this._y0 = y;
		return this
	}

	Canvas.prototype.x1 = function(x) {
		if (x === undefined) return this._x1
		this._x1 = x;
		return this
	}

	Canvas.prototype.y1 = function(y) {
		if (y === undefined) return this._y1
		this._y1 = y;
		return this
	}

	Canvas.prototype.width = function(w) {
		if (w === undefined) return this.x1() - this.x0()
		this.x1(this.x0() + w);
		return this
	}

	Canvas.prototype.height = function(h) {
		if (h === undefined) return this.y1() - this.y0()
		this.y1(this.y0() + h);
		return this
	}

	/*--------------------------------------------------------------------
	 * 座標変換
	 */

	Canvas.prototype.translateX = function(x) {
		var scaleX = this.width() / this.dom().width;
		return (x - this.x0()) / scaleX
	}

	Canvas.prototype.translateY = function(y) {
		var scaleY = this.height() / this.dom().height;
		return (y - this.y0()) / scaleY
	}

	Canvas.prototype.translate = function(p) {
		return V(this.tlanslateX(x), this.tlanslateY(y));
	};

	Canvas.prototype.translateX2 = function(x) {
		var scaleX = this.width() / this.dom().width;
		return x * scaleX + this.x0()
	}

	Canvas.prototype.translateY2 = function(y) {
		var scaleY = this.height() / this.dom().height;
		return y * scaleY + this.y0()
	}

	Canvas.prototype.translate2 = function(p) {
		return V(this.tlanslateX2(x), this.tlanslateY2(y));
	};

	/*--------------------------------------------------------------------
	 * 原始的な描画メソッド群
	 */

	Canvas.prototype.strokeColor = function(r, g, b) {
		var ctx = this.dom().getContext("2d");
		ctx.strokeStyle = "rgb(" + r + "," + g + "," + b + ")";
		return this
	};

	Canvas.prototype.fillColor = function(r, g, b) {
		var ctx = this.dom().getContext("2d");
		ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
		return this
	};

	Canvas.prototype.lineWidth = function(w) {
		var ctx = this.dom().getContext("2d");
		ctx.lineWidth = w;
		return this
	};

	Canvas.prototype.rect = function(x0, y0, x1, y1) {
		if (x0 instanceof V && y0 instanceof V) {
			return this.rect(x0.val[0], x0.val[1], y0.val[0], y0.val[1]);
		}

		var ctx = this.dom().getContext("2d");
		x0 = this.translateX(x0);
		y0 = this.translateY(y0);
		x1 = this.translateX(x1);
		y1 = this.translateY(y1);

		ctx.fillRect(x0, y0, x1 - x0 + 1, y1 - y0 + 1);

		return this
	};

	Canvas.prototype.line = function(x0, y0, x1, y1) {
		if (x0 instanceof V && y0 instanceof V) {
			return this.line(x0.val[0], x0.val[1], y0.val[0], y0.val[1]);
		}

		var ctx = this.dom().getContext("2d");
		x0 = this.translateX(x0);
		y0 = this.translateY(y0);
		x1 = this.translateX(x1);
		y1 = this.translateY(y1);

		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);

		return this
	};

	Canvas.prototype.plot = function(x, y, r) {
		if (x instanceof V) {
			return this.plot(x.val[0], x.val[1], y);
		}

		var ctx = this.dom().getContext("2d");

		x = this.translateX(x);
		y = this.translateY(y);
		r = r || 5;

		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.closePath();

		return this
	};

	Canvas.prototype.clear = function() {
		var ctx = this.dom().getContext("2d");

		ctx.clearRect(0, 0, this.dom().width, this.dom().height);

		return this;
	};

	Canvas.prototype.start = function() {
		var ctx = this.dom().getContext("2d");
		ctx.beginPath();
		return this;
	};

	Canvas.prototype.stroke = function() {
		var ctx = this.dom().getContext("2d");
		ctx.stroke();
		return this;
	};

	Canvas.prototype.fill = function() {
		var ctx = this.dom().getContext("2d");
		ctx.fill();
		return this;
	};

	/*--------------------------------------------------------------------
	 * 数学系
	 */

	Canvas.prototype.grid = function(dx, dy) {
		x0 = this.x0(),
		x1 = this.x1(),
		y0 = this.y0(),
		y1 = this.y1();

		for (var x = x0; x <= x1; x += dx) {
			this.line(x, y0, x, y1);
		}
		for (var y = y0; y <= y1; y += dy) {
			this.line(x0, y, x1, y);
		}

		return this
	}

	return Canvas;
}());
