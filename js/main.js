var maxX = 100,
	maxY = 100,
	Xcount = 17,
	Zcount = 20,
	Ycount = 10,
	$canvas, canvas, state, tlist;

function init() {
	tlist = [];

	// for (var i = 0, max = tlist_arr.length; i < max; i++) {
	// 	var tdata_arr = tlist_arr[i];
	// 	tlist.push({
	// 		fv: V.apply(window, tdata_arr.fv),
	// 		label: V.apply(window, tdata_arr.label)
	// 	});
	// }
	// console.log("読み込み完了：教師データを" + tlist_arr.length + "個読み込みました");

	$canvas = $("#canvas");
	$canvas
		.mousedown(function(ev) {
			$canvas.on("mousemove", draw.draw);
			draw.begin(ev);
		})
		.mouseup(function(ev) {
			$canvas.off("mousemove", draw.draw);
		});

	canvas = new Canvas($canvas[0])
		.lineWidth(1)
		.size(0, 0, maxX, maxY);

	draw.init();
	$("#btnClear").click(clear);
	$("#btnAdd").click(addTeacherData);
	$("#btnTrain").click(train);

	load();
	clear();
}

function clear() {
	state = new V().resize(maxX * maxY, 1);
	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y < maxY; y++) {
			state[x * maxY + y][0] = 0;
		}
	}

	update();
	setGageValue([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}


var draw = (function() {

	var lastX = 0,
		lastY = 0,
		cellW, cellY;

	function drawInit() {
		cellW = $canvas.width() / maxX;
		cellY = $canvas.height() / maxY;
	}

	function drawBegin(ev) {
		lastX = parseInt(ev.offsetX / cellW, 10),
		lastY = parseInt(ev.offsetY / cellY, 10);
	}

	function draw(ev) {
		var x = parseInt(ev.offsetX / cellW, 10),
			y = parseInt(ev.offsetY / cellY, 10),
			diffX = x - lastX,
			diffY = y - lastY,
			absDiffX = diffX < 0 ? -diffX : diffX,
			absDiffY = diffY < 0 ? -diffY : diffY,
			dx, dy, px, py;

		if (absDiffX > absDiffY) {
			dx = diffX > 0 ? 1 : -1;
			dy = diffY * dx / diffX;
			for (px = lastX, py = lastY; px != x; px += dx, py += dy) {
				state[px * maxY + parseInt(py)][0] = 1;
			}
		} else {
			dy = diffY > 0 ? 1 : -1;
			dx = diffX * dy / diffY;
			for (px = lastX, py = lastY; py != y; px += dx, py += dy) {
				state[parseInt(px) * maxY + py][0] = 1;
			}
		}

		lastX = x;
		lastY = y;

		analyze();
		update();
	}

	return {
		init: drawInit,
		begin: drawBegin,
		draw: draw
	};
}());

function analyze() {
	var fVector = getFVector(state).transpose(),
		Y = perceptron.calcY(fVector);

	var sum = 0;
	for (var i = 0, max = Y.size2; i < max; i++) {
		if (Y[0][i] < 0) Y[0][i] = 0;
		sum += Y[0][i];
	}

	var gageValue = [];
	if (sum == 0) {
		gageValue = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	} else {
		for (var i = 0; i < 10; i++) {
			gageValue.push(Y[0][i] / sum);
		}
	}

	setGageValue(gageValue);
	// Y.print();
}

function addTeacherData(ev) {
	var teacher = parseInt($("#tdata").val());
	if (teacher === undefined) return;
	if (teacher >= 10) return;

	T = new V().resize(1, 10);
	T[0][teacher] = 1.0;

	var fVector = getFVector(state).transpose();

	tlist.push({
		fv: fVector,
		label: T
	});
	console.log("教師データを追加しました");
	train();
}

function train(ev) {
	for (var i = 0; i < 100; i++) {
		for (var j = 0; j < tlist.length; j++) {
			perceptron.train(tlist[j].fv, tlist[j].label);
		}
	}
	perceptron.save();
	console.log("学習完了");
	analyze();
}

function update() {
	canvas
		.clear();
	// .start()
	// .fillColor(255, 255, 255)
	// .rect(0, 0, maxX, maxY)
	// .fill();

	canvas
		.fillColor(0, 0, 0)
		.start();
	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y < maxY; y++) {
			if (state[x * maxY + y][0]) {
				canvas.rect(x, y, x + 1, y + 1);
			}
		}
	}
	canvas
		.fill();

	var sp = getSpecialPoint(state);
	canvas
		.strokeColor(255, 0, 0)
		.start()
		.line(0, sp.gy, maxX, sp.gy)
		.line(sp.gx, 0, sp.gx, maxY)
		.stroke()
		.strokeColor(0, 255, 0)
		.start()
		.line(0, sp.cy, maxX, sp.cy)
		.line(sp.cx, 0, sp.cx, maxY)
		.stroke();
}

function getSpecialPoint(v) {

	var weightX = 0,
		weightY = 0,
		right = 0,
		bottom = 0,
		left = maxX,
		top = maxY,
		gx = 0,
		gy = 0,
		cx = 0,
		cy = 0,
		count = 0;

	for (var x = 0; x < maxX; x++) {
		for (var y = 0; y < maxY; y++) {
			if (v[x * maxY + y] != 0) {

				left = x < left ? x : left;
				top = y < top ? y : top;
				right = x > right ? x : right;
				bottom = y > bottom ? y : bottom;

				weightX += x;
				weightY += y;
				count++;
			}
		}
	}

	return {
		gx: parseInt(weightX / count),
		gy: parseInt(weightY / count),
		cx: parseInt((left + right) / 2),
		cy: parseInt((top + bottom) / 2)
	}
}

function getFVector(v) {
	result = V().resize(Xcount);
	result[0][0] = 1; //result[0] はバイアスで常に1

	var sp = getSpecialPoint(v),
		gx = sp.gx,
		gy = sp.gy,
		cx = sp.cx,
		cy = sp.cy;

	//中心から縦横2つずつ、4区画に分けてデータを数える
	for (var x = 0; x < cx; x++) {
		for (var y = 0; y < cy; y++) {
			var i = 0;
			i |= v[x * maxY + y][0];
			i |= v[(x + 1) * maxY + y][0] << 1;
			i |= v[x * maxY + y + 1][0] << 2;
			i |= v[(x + 1) * maxY + y + 1][0] << 3;

			// ■■
			// □□
			if (i == 3) {
				result[1][0]++;
			}

			// ■□
			// ■□
			if (i == 5) {
				result[2][0]++;
			}

			// ■□
			// □■
			if (i == 9) {
				result[3][0]++;
			}

			// □■
			// ■□
			if (i == 6) {
				result[4][0]++;
			}
		}
		for (var y = cy; y < maxY - 1; y++) {
			var i = 0;
			i |= v[x * maxY + y][0];
			i |= v[(x + 1) * maxY + y][0] << 1;
			i |= v[x * maxY + y + 1][0] << 2;
			i |= v[(x + 1) * maxY + y + 1][0] << 3;

			// ■■
			// □□
			if (i == 3) {
				result[5][0]++;
			}

			// ■□
			// ■□
			if (i == 5) {
				result[6][0]++;
			}

			// ■□
			// □■
			if (i == 9) {
				result[7][0]++;
			}

			// □■
			// ■□
			if (i == 6) {
				result[8][0]++;
			}
		}
	}
	for (var x = cx; x < maxX - 1; x++) {
		for (var y = 0; y < gy; y++) {
			var i = 0;
			i |= v[x * maxY + y][0];
			i |= v[(x + 1) * maxY + y][0] << 1;
			i |= v[x * maxY + y + 1][0] << 2;
			i |= v[(x + 1) * maxY + y + 1][0] << 3;

			// ■■
			// □□
			if (i == 3) {
				result[9][0]++;
			}

			// ■□
			// ■□
			if (i == 5) {
				result[10][0]++;
			}

			// ■□
			// □■
			if (i == 9) {
				result[11][0]++;
			}

			// □■
			// ■□
			if (i == 6) {
				result[12][0]++;
			}

		}
		for (var y = cy; y < maxY - 1; y++) {
			var i = 0;
			i |= v[x * maxY + y][0];
			i |= v[(x + 1) * maxY + y][0] << 1;
			i |= v[x * maxY + y + 1][0] << 2;
			i |= v[(x + 1) * maxY + y + 1][0] << 3;

			// ■■
			// □□
			if (i == 3) {
				result[13][0]++;
			}

			// ■□
			// ■□
			if (i == 5) {
				result[14][0]++;
			}

			// ■□
			// □■
			if (i == 9) {
				result[15][0]++;
			}

			// □■
			// ■□
			if (i == 6) {
				result[16][0]++;
			}

		}
	}

	return result;
}

function setGageValue(value) {
	maxI = 0;
	maxValue = 0;

	$(".gage-max").removeClass("gage-max");
	for (var i = 0; i < 10; i++) {

		if (value[i] > maxValue) {
			maxValue = value[i];
			maxI = i;
		}

		p = value[i] * 100
		p = ("" + p).substring(0, 4) + "%";
		$("#label" + i).text(p);
		$("#gage" + i).css("width", p);
	}

	if (maxValue > 0) {
		$(".gage").eq(maxI).addClass("gage-max");
	}
}

function tanh(arg) {
	return (Math.exp(arg) - Math.exp(-arg)) / (Math.exp(arg) + Math.exp(-arg));
}

function save() {
	perceptron.save();

	var tlist_arr = [];
	for (var k = 0, max = tlist.length; k < max; k++) {
		var tdata = tlist[k];

		var fv_arr = [];
		for (var i = 0, size1 = tdata.fv.size1; i < size1; i++) {
			fv_arr.push([]);
			for (var j = 0, size2 = tdata.fv.size2; j < size2; j++) {
				fv_arr[i][j] = tdata.fv[i][j];
			}
		}

		var label_arr = [];
		for (var i = 0, size1 = tdata.label.size1; i < size1; i++) {
			label_arr.push([]);
			for (var j = 0, size2 = tdata.label.size2; j < size2; j++) {
				label_arr[i][j] = tdata.label[i][j];
			}
		}

		tlist_arr.push({
			fv: fv_arr,
			label: label_arr
		});
	}

	localStorage.setItem("tlist", JSON.stringify(tlist_arr));

	console.log("保存完了");
}

function load() {
	perceptron.load();

	var tlist_arr = JSON.parse(localStorage.getItem("tlist"));
	if (!tlist_arr) return;
	for (var i = 0, max = tlist_arr.length; i < max; i++) {
		var tdata_arr = tlist_arr[i];
		tlist.push({
			fv: V.apply(window, tdata_arr.fv),
			label: V.apply(window, tdata_arr.label)
		});
	}

	console.log("読み込み完了");
	console.log("教師データを" + tlist_arr.length + "個読み込みました");
}

$(init);

var perceptron = (function() {
	var _ = {},
		W1 = V().resize(Xcount, Zcount),
		W2 = V().resize(Zcount, Ycount);

	for (var x = 0; x < Xcount; x++) {
		for (var z = 0; z < Zcount; z++) {
			W1[x][z] = 0.01;
		}
	}

	for (var z = 0; z < Zcount; z++) {
		for (var y = 0; y < Xcount; y++) {
			W2[z][y] = 0.01;
		}
	}

	_.W1 = function() {
		return W1;
	};

	_.W2 = function() {
		return W2;
	};

	_.show = function() {
		// console.log("----------");
		// W1.print();

		// console.log("----------");
		// W2.print();
	}

	_.calcY = function(X) {
		var Z, Y;

		Z = W1.multi(X);
		// console.log("----------");
		// Z.print();

		for (var i = 0; i < Zcount; i++) {
			Z[0][i] = tanh(Z[0][i]);
		}
		Z[0][0] = 1.0;

		// console.log("----------");
		// Z.print();

		Y = W2.multi(Z);
		// console.log("----------");
		// Y.print();

		return Y;
	};

	_.train = function(X, T) {

		var Z, Y, DELTA_Y, DELTA_Z;

		Z = W1.multi(X);
		for (var i = 0; i < Zcount; i++) {
			Z[0][i] = tanh(Z[0][i]);
		}
		Z[0][0] = 1.0;

		Y = W2.multi(Z);
		DELTA_Y = Y.sub(T);
		DELTA_Z = W2.transpose().multi(DELTA_Y);

		for (var i = 0; i < Zcount; i++) {
			DELTA_Z[0][i] = (1 - Z[0][i] * Z[0][i]) * DELTA_Z[0][i];
		}

		ETA_DELTA_Z = DELTA_Z.multi(X.transpose());
		ETA_DELTA_Y = DELTA_Y.multi(Z.transpose());
		ETA = 0.01;
		for (var i = 0, size1 = ETA_DELTA_Z.size1; i < size1; i++) {
			for (var j = 0, size2 = ETA_DELTA_Z.size2; j < size2; j++) {
				ETA_DELTA_Z[i][j] *= ETA;
			}
		}

		for (var i = 0, size1 = ETA_DELTA_Y.size1; i < size1; i++) {
			for (var j = 0, size2 = ETA_DELTA_Y.size2; j < size2; j++) {
				ETA_DELTA_Y[i][j] *= ETA;
			}
		}

		W1 = W1.sub(ETA_DELTA_Z);
		W2 = W2.sub(ETA_DELTA_Y);

		//--------------------------------------------------------------------
		//Y二乗和誤差の計算
		// Z = W1.multi(X);
		// for (var i = 0; i < Zcount; i++) {
		// 	Z[0][i] = tanh(Z[0][i]);
		// }
		// Z[0][0] = 1.0;

		// Y = W2.multi(Z);
		// DELTA_Y = Y.sub(T);
		// console.log("-------------------");
		// console.log("教師データ");
		// T.transpose().print();
		// console.log("結果Y");
		// Y.transpose().print();
		// console.log("誤差");
		// DELTA_Y.transpose().multi(DELTA_Y).print();

	}

	_.save = function() {
		w1_arr = [];
		for (var i = 0, size1 = W1.size1; i < size1; i++) {
			w1_arr.push([]);
			for (var j = 0, size2 = W1.size2; j < size2; j++) {
				w1_arr[i][j] = W1[i][j];
			}
		}

		w2_arr = [];
		for (var i = 0, size1 = W2.size1; i < size1; i++) {
			w2_arr.push([]);
			for (var j = 0, size2 = W2.size2; j < size2; j++) {
				w2_arr[i][j] = W2[i][j];
			}
		}

		localStorage.setItem("w1_arr", JSON.stringify(w1_arr));
		localStorage.setItem("w2_arr", JSON.stringify(w2_arr));

	}

	_.load = function() {
		w1_arr = JSON.parse(localStorage.getItem("w1_arr"));
		w2_arr = JSON.parse(localStorage.getItem("w2_arr"));

		if (w1_arr) W1 = V.apply(window, w1_arr);
		if (w2_arr) W2 = V.apply(window, w2_arr);
	}

	return _
}());

// var console = {
// 	$log: null,
// 	log: function(txt) {
// 		this.$log = $("#log");
// 		this.log = function(txt) {
// 			this.$log
// 				.clearQueue()
// 				.hide()
// 				.text(txt)
// 				.fadeIn(600)
// 				.delay(4000)
// 				.fadeOut(600);
// 		}
// 		this.log(txt);
// 	}
// }
