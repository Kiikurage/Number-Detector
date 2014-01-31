var Vector2d = (function() {

	function Vector2d() {
		var instance = this;
		if (!(this instanceof Vector2d)) instance = new Vector2d();

		var args = [];

		Array.prototype.push.apply(args, arguments);

		//2次のサイズを算出
		var maxSize2 = 1;
		for (var i = 0, max = arguments.length; i < max; i++) {
			if (args[i] instanceof Array) {
				if (args[i].length > maxSize2) maxSize2 = args[i].length;
			} else {
				args[i] = [args[i]];
			}
		}

		instance.size1 = args.length;
		instance.size2 = maxSize2;

		//要素をセット
		for (var i = 0, size1 = instance.size1; i < size1; i++) {
			instance[i] = [];
			for (var j = 0, size2 = instance.size2; j < size2; j++) {
				instance[i][j] = args[i][j] || 0;
			}
		}

		return instance
	};

	Vector2d.prototype.print = function() {
		for (var j = 0, size2 = this.size2; j < size2; j++) {
			var row = [];
			for (var i = 0, size1 = this.size1; i < size1; i++) {
				row.push(this[i][j]);
			}
			console.log("{" + row.join(", ") + "}");
		}

		return this;
	};

	Vector2d.prototype.resize = function(size1, size2) {
		if (!size2) size2 = 1;

		var arr = [];
		for (var i = 0; i < size1; i++) {
			var col = [];
			this[i] = this[i] || [];
			for (var j = 0; j < size2; j++) {
				col.push(this[i][j] || 0);
			}
			arr.push(col);
		}

		return V.apply(window, arr);
	}

	Vector2d.prototype.add = function(v) {
		if (this.size1 != v.size1 || this.size2 != v.size2) {
			console.error("vector size is NOT matched");
			return;
		}

		var arr = [];
		for (var i = 0, size1 = this.size1; i < size1; i++) {
			var col = [];
			for (var j = 0, size2 = this.size2; j < size2; j++) {
				col.push(this[i][j] + v[i][j]);
			}
			arr.push(col);
		}

		return V.apply(window, arr);
	};

	Vector2d.prototype.sub = function(v) {
		if (this.size1 != v.size1 || this.size2 != v.size2) {
			console.error("vector size is NOT matched");
			return;
		}

		var arr = [];
		for (var i = 0, size1 = this.size1; i < size1; i++) {
			var col = [];
			for (var j = 0, size2 = this.size2; j < size2; j++) {
				col.push(this[i][j] - v[i][j]);
			}
			arr.push(col);
		}

		return V.apply(window, arr);
	};

	Vector2d.prototype.multi = function(v) {
		if (this.size1 != v.size2) {
			console.error("vector size is NOT matched");
			return;
		}

		var arr = [];
		for (var j = 0, size1 = v.size1; j < size1; j++) {
			var col = [];
			for (var i = 0, size2 = this.size2; i < size2; i++) {
				var tmp = 0
				for (var k = 0, max = this.size1; k < max; k++) {
					tmp += this[k][i] * v[j][k];
				}
				col.push(tmp);
			}
			arr.push(col);
		}
		return V.apply(window, arr);
	};

	Vector2d.prototype.transpose = function(p) {
		var arr = [];
		for (var j = 0, size2 = this.size2; j < size2; j++) {
			var row = [];
			for (var i = 0, size1 = this.size1; i < size1; i++) {
				row.push(this[i][j]);
			}
			arr.push(row);
		}

		return V.apply(window, arr);
	};

	return Vector2d;
}());

//ショートカット
var V = Vector2d;
