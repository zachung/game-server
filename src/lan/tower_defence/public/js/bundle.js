(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
exports = module.exports = Victor;

/**
 * # Victor - A JavaScript 2D vector class with methods for common vector operations
 */

/**
 * Constructor. Will also work without the `new` keyword
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = Victor(42, 1337);
 *
 * @param {Number} x Value of the x axis
 * @param {Number} y Value of the y axis
 * @return {Victor}
 * @api public
 */
function Victor (x, y) {
	if (!(this instanceof Victor)) {
		return new Victor(x, y);
	}

	/**
	 * The X axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.x;
	 *     // => 42
	 *
	 * @api public
	 */
	this.x = x || 0;

	/**
	 * The Y axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.y;
	 *     // => 21
	 *
	 * @api public
	 */
	this.y = y || 0;
};

/**
 * # Static
 */

/**
 * Creates a new instance from an array
 *
 * ### Examples:
 *     var vec = Victor.fromArray([42, 21]);
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromArray
 * @param {Array} array Array with the x and y values at index 0 and 1 respectively
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromArray = function (arr) {
	return new Victor(arr[0] || 0, arr[1] || 0);
};

/**
 * Creates a new instance from an object
 *
 * ### Examples:
 *     var vec = Victor.fromObject({ x: 42, y: 21 });
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromObject
 * @param {Object} obj Object with the values for x and y
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromObject = function (obj) {
	return new Victor(obj.x || 0, obj.y || 0);
};

/**
 * # Manipulation
 *
 * These functions are chainable.
 */

/**
 * Adds another vector's X axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addX(vec2);
 *     vec1.toString();
 *     // => x:30, y:10
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addX = function (vec) {
	this.x += vec.x;
	return this;
};

/**
 * Adds another vector's Y axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addY(vec2);
 *     vec1.toString();
 *     // => x:10, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addY = function (vec) {
	this.y += vec.y;
	return this;
};

/**
 * Adds another vector to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.add(vec2);
 *     vec1.toString();
 *     // => x:30, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

/**
 * Adds the given scalar to both vector axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalar(2);
 *     vec.toString();
 *     // => x: 3, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalar = function (scalar) {
	this.x += scalar;
	this.y += scalar;
	return this;
};

/**
 * Adds the given scalar to the X axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarX(2);
 *     vec.toString();
 *     // => x: 3, y: 2
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarX = function (scalar) {
	this.x += scalar;
	return this;
};

/**
 * Adds the given scalar to the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(1, 2);
 *
 *     vec.addScalarY(2);
 *     vec.toString();
 *     // => x: 1, y: 4
 *
 * @param {Number} scalar The scalar to add
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addScalarY = function (scalar) {
	this.y += scalar;
	return this;
};

/**
 * Subtracts the X axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractX(vec2);
 *     vec1.toString();
 *     // => x:80, y:50
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractX = function (vec) {
	this.x -= vec.x;
	return this;
};

/**
 * Subtracts the Y axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractY(vec2);
 *     vec1.toString();
 *     // => x:100, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractY = function (vec) {
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtract(vec2);
 *     vec1.toString();
 *     // => x:80, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts the given scalar from both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalar(20);
 *     vec.toString();
 *     // => x: 80, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalar = function (scalar) {
	this.x -= scalar;
	this.y -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarX(20);
 *     vec.toString();
 *     // => x: 80, y: 200
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarX = function (scalar) {
	this.x -= scalar;
	return this;
};

/**
 * Subtracts the given scalar from the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 200);
 *
 *     vec.subtractScalarY(20);
 *     vec.toString();
 *     // => x: 100, y: 180
 *
 * @param {Number} scalar The scalar to subtract
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractScalarY = function (scalar) {
	this.y -= scalar;
	return this;
};

/**
 * Divides the X axis by the x component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.divideX(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideX = function (vector) {
	this.x /= vector.x;
	return this;
};

/**
 * Divides the Y axis by the y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.divideY(vec2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideY = function (vector) {
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by a axis values of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.divide(vec2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Victor} vector The vector to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divide = function (vector) {
	this.x /= vector.x;
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalar(2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalar = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
		this.y /= scalar;
	} else {
		this.x = 0;
		this.y = 0;
	}

	return this;
};

/**
 * Divides the X axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarX(2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarX = function (scalar) {
	if (scalar !== 0) {
		this.x /= scalar;
	} else {
		this.x = 0;
	}
	return this;
};

/**
 * Divides the Y axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.divideScalarY(2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Number} The scalar to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideScalarY = function (scalar) {
	if (scalar !== 0) {
		this.y /= scalar;
	} else {
		this.y = 0;
	}
	return this;
};

/**
 * Inverts the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertX();
 *     vec.toString();
 *     // => x:-100, y:50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertX = function () {
	this.x *= -1;
	return this;
};

/**
 * Inverts the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertY();
 *     vec.toString();
 *     // => x:100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertY = function () {
	this.y *= -1;
	return this;
};

/**
 * Inverts both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invert();
 *     vec.toString();
 *     // => x:-100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invert = function () {
	this.invertX();
	this.invertY();
	return this;
};

/**
 * Multiplies the X axis by X component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyX = function (vector) {
	this.x *= vector.x;
	return this;
};

/**
 * Multiplies the Y axis by Y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyY = function (vector) {
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by values from a given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.multiply(vec2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Victor} vector The vector to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiply = function (vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by the given scalar value
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalar(2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Number} The scalar to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalar = function (scalar) {
	this.x *= scalar;
	this.y *= scalar;
	return this;
};

/**
 * Multiplies the X axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarX(2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarX = function (scalar) {
	this.x *= scalar;
	return this;
};

/**
 * Multiplies the Y axis by the given scalar
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.multiplyScalarY(2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Number} The scalar to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyScalarY = function (scalar) {
	this.y *= scalar;
	return this;
};

/**
 * Normalize
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.normalize = function () {
	var length = this.length();

	if (length === 0) {
		this.x = 1;
		this.y = 0;
	} else {
		this.divide(Victor(length, length));
	}
	return this;
};

Victor.prototype.norm = Victor.prototype.normalize;

/**
 * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.limit(80, 0.9);
 *     vec.toString();
 *     // => x:90, y:50
 *
 * @param {Number} max The maximum value for both x and y axis
 * @param {Number} factor Factor by which the axis are to be multiplied with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.limit = function (max, factor) {
	if (Math.abs(this.x) > max){ this.x *= factor; }
	if (Math.abs(this.y) > max){ this.y *= factor; }
	return this;
};

/**
 * Randomizes both vector axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:67, y:73
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomize = function (topLeft, bottomRight) {
	this.randomizeX(topLeft, bottomRight);
	this.randomizeY(topLeft, bottomRight);

	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:55, y:50
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeX = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.x, bottomRight.x);
	var max = Math.max(topLeft.x, bottomRight.x);
	this.x = random(min, max);
	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:100, y:66
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeY = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.y, bottomRight.y);
	var max = Math.max(topLeft.y, bottomRight.y);
	this.y = random(min, max);
	return this;
};

/**
 * Randomly randomizes either axis between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
 *     vec.toString();
 *     // => x:100, y:77
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
	if (!! Math.round(Math.random())) {
		this.randomizeX(topLeft, bottomRight);
	} else {
		this.randomizeY(topLeft, bottomRight);
	}
	return this;
};

/**
 * Rounds both axis to an integer value
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.unfloat = function () {
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};

/**
 * Rounds both axis to a certain precision
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @param {Number} Precision (default: 8)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.toFixed = function (precision) {
	if (typeof precision === 'undefined') { precision = 8; }
	this.x = this.x.toFixed(precision);
	this.y = this.y.toFixed(precision);
	return this;
};

/**
 * Performs a linear blend / interpolation of the X axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixX(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:100
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixX = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.x = (1 - amount) * this.x + amount * vec.x;
	return this;
};

/**
 * Performs a linear blend / interpolation of the Y axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixY(vec2, 0.5);
 *     vec.toString();
 *     // => x:100, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixY = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.y = (1 - amount) * this.y + amount * vec.y;
	return this;
};

/**
 * Performs a linear blend / interpolation towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mix(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mix = function (vec, amount) {
	this.mixX(vec, amount);
	this.mixY(vec, amount);
	return this;
};

/**
 * # Products
 */

/**
 * Creates a clone of this vector
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = vec1.clone();
 *
 *     vec2.toString();
 *     // => x:10, y:10
 *
 * @return {Victor} A clone of the vector
 * @api public
 */
Victor.prototype.clone = function () {
	return new Victor(this.x, this.y);
};

/**
 * Copies another vector's X component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyX(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:10
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyX = function (vec) {
	this.x = vec.x;
	return this;
};

/**
 * Copies another vector's Y component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyY(vec1);
 *
 *     vec2.toString();
 *     // => x:10, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyY = function (vec) {
	this.y = vec.y;
	return this;
};

/**
 * Copies another vector's X and Y components in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copy(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copy = function (vec) {
	this.copyX(vec);
	this.copyY(vec);
	return this;
};

/**
 * Sets the vector to zero (0,0)
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *		 var1.zero();
 *     vec1.toString();
 *     // => x:0, y:0
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.zero = function () {
	this.x = this.y = 0;
	return this;
};

/**
 * Calculates the dot product of this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.dot(vec2);
 *     // => 23000
 *
 * @param {Victor} vector The second vector
 * @return {Number} Dot product
 * @api public
 */
Victor.prototype.dot = function (vec2) {
	return this.x * vec2.x + this.y * vec2.y;
};

Victor.prototype.cross = function (vec2) {
	return (this.x * vec2.y ) - (this.y * vec2.x );
};

/**
 * Projects a vector onto another vector, setting itself to the result.
 *
 * ### Examples:
 *     var vec = new Victor(100, 0);
 *     var vec2 = new Victor(100, 100);
 *
 *     vec.projectOnto(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want to project this vector onto
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.projectOnto = function (vec2) {
    var coeff = ( (this.x * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
    this.x = coeff * vec2.x;
    this.y = coeff * vec2.y;
    return this;
};


Victor.prototype.horizontalAngle = function () {
	return Math.atan2(this.y, this.x);
};

Victor.prototype.horizontalAngleDeg = function () {
	return radian2degrees(this.horizontalAngle());
};

Victor.prototype.verticalAngle = function () {
	return Math.atan2(this.x, this.y);
};

Victor.prototype.verticalAngleDeg = function () {
	return radian2degrees(this.verticalAngle());
};

Victor.prototype.angle = Victor.prototype.horizontalAngle;
Victor.prototype.angleDeg = Victor.prototype.horizontalAngleDeg;
Victor.prototype.direction = Victor.prototype.horizontalAngle;

Victor.prototype.rotate = function (angle) {
	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

	this.x = nx;
	this.y = ny;

	return this;
};

Victor.prototype.rotateDeg = function (angle) {
	angle = degrees2radian(angle);
	return this.rotate(angle);
};

Victor.prototype.rotateTo = function(rotation) {
	return this.rotate(rotation-this.angle());
};

Victor.prototype.rotateToDeg = function(rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateTo(rotation);
};

Victor.prototype.rotateBy = function (rotation) {
	var angle = this.angle() + rotation;

	return this.rotate(angle);
};

Victor.prototype.rotateByDeg = function (rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateBy(rotation);
};

/**
 * Calculates the distance of the X axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceX(vec2);
 *     // => -100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceX = function (vec) {
	return this.x - vec.x;
};

/**
 * Same as `distanceX()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.absDistanceX(vec2);
 *     // => 100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceX = function (vec) {
	return Math.abs(this.distanceX(vec));
};

/**
 * Calculates the distance of the Y axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => -10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceY = function (vec) {
	return this.y - vec.y;
};

/**
 * Same as `distanceY()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => 10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceY = function (vec) {
	return Math.abs(this.distanceY(vec));
};

/**
 * Calculates the euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distance(vec2);
 *     // => 100.4987562112089
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distance = function (vec) {
	return Math.sqrt(this.distanceSq(vec));
};

/**
 * Calculates the squared euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceSq(vec2);
 *     // => 10100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceSq = function (vec) {
	var dx = this.distanceX(vec),
		dy = this.distanceY(vec);

	return dx * dx + dy * dy;
};

/**
 * Calculates the length or magnitude of the vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.length();
 *     // => 111.80339887498948
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.length = function () {
	return Math.sqrt(this.lengthSq());
};

/**
 * Squared length / magnitude
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.lengthSq();
 *     // => 12500
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.lengthSq = function () {
	return this.x * this.x + this.y * this.y;
};

Victor.prototype.magnitude = Victor.prototype.length;

/**
 * Returns a true if vector is (0, 0)
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.zero();
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
};

/**
 * Returns a true if this vector is the same as another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(100, 50);
 *     vec1.isEqualTo(vec2);
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isEqualTo = function(vec2) {
	return this.x === vec2.x && this.y === vec2.y;
};

/**
 * # Utility Methods
 */

/**
 * Returns an string representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toString();
 *     // => x:10, y:20
 *
 * @return {String}
 * @api public
 */
Victor.prototype.toString = function () {
	return 'x:' + this.x + ', y:' + this.y;
};

/**
 * Returns an array representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toArray();
 *     // => [10, 20]
 *
 * @return {Array}
 * @api public
 */
Victor.prototype.toArray = function () {
	return [ this.x, this.y ];
};

/**
 * Returns an object representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toObject();
 *     // => { x: 10, y: 20 }
 *
 * @return {Object}
 * @api public
 */
Victor.prototype.toObject = function () {
	return { x: this.x, y: this.y };
};


var degrees = 180 / Math.PI;

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function radian2degrees (rad) {
	return rad * degrees;
}

function degrees2radian (deg) {
	return deg / degrees;
}

},{}],2:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Buff = function Buff(options) {
  var defaults = {
    name: "Ice",
    width: 64,
    height: 64,
    duration: 1,
    lifetime: 0,
    image: "effect/bolt03"
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Buff).call(this, populated);
  this.class = this.constructor.name;
};
var $Buff = Buff;
($traceurRuntime.createClass)(Buff, {
  effect: function(other) {
    other.mass *= 2;
    this.other = other;
  },
  step: function(dt) {
    this.lifetime += dt;
    var center = this.other.center;
    this.setCenter(center.x, center.y);
    if (this.lifetime > this.duration) {
      this.other.mass /= 2;
      this.other.removeBuff(this);
    }
  },
  render: function() {
    $traceurRuntime.superGet(this, $Buff.prototype, "renderImage").apply(this, arguments);
  }
}, {}, Ball);
module.exports = Buff;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/Buff.js
},{"./ball":5}],3:[function(require,module,exports){
"use strict";
var Graphic = require('./Graphic');
var Floor = function Floor(options) {
  var defaults = {
    width: 32,
    height: 32
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Floor).call(this, populated);
};
var $Floor = Floor;
($traceurRuntime.createClass)(Floor, {
  render: function() {
    switch (this.mapCode) {
      case 0:
        this.image = "dc-dngn/gateways/dngn_portal";
        break;
      case 1:
        this.image = "dc-dngn/floor/grass/grass1";
        break;
      case 2:
        this.image = "dc-dngn/floor/grass/grass_full";
        break;
      case 8:
        this.image = "dc-dngn/water/dngn_shoals_shallow_water1";
        break;
      case 9:
        this.image = "dc-dngn/dngn_trap_teleport";
        break;
    }
    $traceurRuntime.superGet(this, $Floor.prototype, "renderImage").apply(this, arguments);
  },
  canBuildOn: function() {
    switch (this.mapCode) {
      case 1:
        return true;
      default:
        return false;
    }
  }
}, {}, Graphic);
module.exports = Floor;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/Floor.js
},{"./Graphic":4}],4:[function(require,module,exports){
"use strict";
var CollisionDetection = require('../../../../library/CollisionDetection');
var EasingFunctions = require('../../../../library/EasingFunctions');
var Vector = require('../../../../library/Vector');
var listeners = new WeakMap();
var Graphic = function Graphic(options) {
  var defaults = {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    color: "#00f"
  };
  var populated = Object.assign(defaults, options);
  for (var key in populated) {
    if (populated.hasOwnProperty(key)) {
      this[key] = populated[key];
    }
  }
  listeners.set(this, []);
};
($traceurRuntime.createClass)(Graphic, {
  trigger: function(eventName) {
    for (var args = [],
        $__2 = 1; $__2 < arguments.length; $__2++)
      args[$__2 - 1] = arguments[$__2];
    var $__0 = this;
    var selfEvent = this["on" + eventName.charAt(0).toUpperCase() + eventName.slice(1)];
    var selfEventProp = true;
    if (typeof selfEvent === "function") {
      selfEventProp = selfEvent.apply(this, args) !== false;
    }
    var events = listeners.get(this);
    if (!events[eventName]) {
      return selfEventProp;
    }
    return selfEventProp && !events[eventName].some((function(event) {
      return false === event.apply($__0, args);
    }));
  },
  on: function(eventName, callback) {
    if (typeof callback !== "function") {
      throw "callback must be a function";
    }
    var events = listeners.get(this);
    if (!events[eventName]) {
      events[eventName] = [];
    }
    events[eventName].push(callback);
    listeners.set(this, events);
    return this;
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    app.layer.fillStyle(this.color).fillRect(this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  },
  renderImage: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    app.layer.drawImage(app.images[this.image], this.x + deltaPoint.x, this.y + deltaPoint.y, this.width, this.height);
  },
  renderAtlas: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var atlas = app.atlases[this.atlases];
    var current = (app.lifetime % 2 / 2) * atlas.frames.length | 0;
    app.layer.save().setTransform(1, 0, 0, 1, this.x + deltaPoint.x, this.y + deltaPoint.y).drawAtlasFrame(atlas, current, 0, 0).restore();
  },
  get center() {
    return {
      x: this.x + (this.width || 0) / 2,
      y: this.y + (this.height || 0) / 2
    };
  },
  setCenter: function(x, y) {
    this.x = x - (this.width || 0) / 2;
    this.y = y - (this.height || 0) / 2;
  },
  step: function(dt) {
    this.trigger('step', dt);
  }
}, {isInRect: function(point, rect) {
    return rect.x <= point.x && rect.y <= point.y && rect.x + rect.width >= point.x && rect.y + rect.height >= point.y;
  }});
module.exports = Graphic;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/Graphic.js
},{"../../../../library/CollisionDetection":21,"../../../../library/EasingFunctions":22,"../../../../library/Vector":25}],5:[function(require,module,exports){
"use strict";
var Graphic = require('./Graphic');
var CollisionDetection = require('../../../../library/CollisionDetection');
var EasingFunctions = require('../../../../library/EasingFunctions');
var Vector = require('../../../../library/Vector');
var Ball = function Ball(options) {
  var defaults = {
    directRadians: 0,
    hp: 1,
    hpMax: 1,
    damage: 0,
    defence: 0,
    attackDistance: 0,
    mass: 1,
    punchForce: 0,
    friction: 0,
    buffs: []
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Ball).call(this, populated);
  this.class = this.constructor.name;
  if (this.accelerate) {
    this.accelerate = new Vector(this.accelerate.x, this.accelerate.y);
  } else {
    this.accelerate = new Vector();
  }
};
var $Ball = Ball;
($traceurRuntime.createClass)(Ball, {
  addBuff: function(buff) {
    if (this.buffs[buff.name]) {
      return;
    }
    buff.effect(this);
    this.buffs[buff.name] = buff;
  },
  removeBuff: function(buff) {
    delete this.buffs[buff.name];
  },
  onStep: function(dt) {
    Object.values(this.buffs).forEach((function(buff) {
      return buff.step(dt);
    }));
    if (this.friction !== 0) {
      var friction = this.accelerate.clone().rotate(Math.PI).multiply(new Vector(this.friction, this.friction));
      this.accelerate.add(friction);
    }
    this.x += this.accelerate.x;
    this.y += this.accelerate.y;
  },
  renderBuff: function() {
    var $__0 = arguments;
    Object.values(this.buffs).forEach((function(buff) {
      return buff.render.apply(buff, $__0);
    }));
  },
  render: function() {
    this.renderBuff.apply(this, arguments);
    $traceurRuntime.superGet(this, $Ball.prototype, "render").apply(this, arguments);
  },
  renderImage: function() {
    this.renderBuff.apply(this, arguments);
    $traceurRuntime.superGet(this, $Ball.prototype, "renderImage").apply(this, arguments);
  },
  renderAtlas: function() {
    this.renderBuff.apply(this, arguments);
    $traceurRuntime.superGet(this, $Ball.prototype, "renderAtlas").apply(this, arguments);
  },
  getDamage: function(damage, dt) {
    this.hp -= Math.max(damage * dt - this.defence, 0);
    var isAlive = this.isAlive();
    if (!isAlive) {
      this.die();
    }
    return isAlive;
  },
  isAlive: function() {
    return this.hp > 0;
  },
  attack: function(other) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    var isHitted = this.canAttack(other);
    if (isHitted) {
      other.getAttack(this, dt);
      this.getDamage(other.defence, dt);
    }
    return isHitted;
  },
  getAttack: function(other, dt) {
    var isAlive = this.getDamage(other.damage, dt);
    if (isAlive) {
      other.punch(this);
    }
  },
  punch: function(other) {
    var angle = CollisionDetection.RectRectAngle(other, this);
    other.accelerate.add(Vector.fromRadians(angle, -this.punchForce));
  },
  canAttack: function(other) {
    if (this === other) {
      return false;
    }
    return CollisionDetection.RectRectDistance(this, other) <= this.attackDistance;
  },
  die: function() {
    this.trigger('die');
  }
}, {}, Graphic);
module.exports = Ball;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/ball.js
},{"../../../../library/CollisionDetection":21,"../../../../library/EasingFunctions":22,"../../../../library/Vector":25,"./Graphic":4}],6:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Cursor = function Cursor(options) {
  var defaults = {
    width: 40,
    height: 40,
    image: "cursor",
    canBuildHere: true
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Cursor).call(this, populated);
};
var $Cursor = Cursor;
($traceurRuntime.createClass)(Cursor, {
  getSelectedBuild: function() {
    return this.build;
  },
  clearSelected: function() {
    delete this.build;
    this.canBuildHere = true;
  },
  setSelectedBuild: function(build) {
    this.build = build;
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    if (this.build) {
      this.build.setCenter(this.x, this.y);
      this.build.render(app, deltaPoint);
      if (!this.canBuildHere) {
        var lineRadius = 40;
        app.layer.save().lineWidth(5).strokeStyle("#F00").strokeLine(this.x - lineRadius, this.y - lineRadius, this.x + lineRadius, this.y + lineRadius).strokeLine(this.x + lineRadius, this.y - lineRadius, this.x - lineRadius, this.y + lineRadius).restore();
      }
    } else {
      $traceurRuntime.superGet(this, $Cursor.prototype, "renderImage").call(this, app, deltaPoint);
    }
  }
}, {}, Ball);
module.exports = Cursor;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/cursor.js
},{"./ball":5}],7:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var EasingFunctions = require('../../../../library/EasingFunctions');
var Vector = require('../../../../library/Vector');
var Enemy = function Enemy(options) {
  var defaults = {
    hp: 10,
    hpMax: 10,
    width: 72,
    height: 72,
    atlases: "sorlosheet",
    defence: 0,
    fireRadius: 100,
    bombCount: 0,
    bombCountMax: 10,
    defence: 1,
    mass: 0.5,
    friction: 0,
    nextPathIndex: 1,
    reward: 10,
    score: 1,
    escapeFine: 1
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Enemy).call(this, populated);
};
var $Enemy = Enemy;
($traceurRuntime.createClass)(Enemy, {
  onStep: function(dt) {
    var from = Vector.fromObject(this.path[this.nextPathIndex - 1]),
        to = Vector.fromObject(this.path[this.nextPathIndex]);
    if (Vector.fromObject(this).subtract(from).length() > to.clone().subtract(from).length()) {
      this.nextPathIndex++;
      if (!this.path[this.nextPathIndex]) {
        this.trigger('atEndPoint', dt);
        return;
      }
    }
    this.accelerate = to.clone().subtract(from);
    var length = this.accelerate.length();
    this.accelerate.multiply(new Vector(1 / this.mass / length, 1 / this.mass / length));
    $traceurRuntime.superGet(this, $Enemy.prototype, "onStep").apply(this, arguments);
  },
  spawnBomb: function(map) {
    if (this.bombCount >= this.bombCountMax) {
      return;
    }
    var user = this;
    var bomb = map.spawnBomb(this);
    bomb.on("die", function() {
      user.bombCount--;
    });
    this.bombCount++;
    return bomb;
  },
  render: function() {
    this.renderAtlas.apply(this, arguments);
  },
  renderAtlas: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var isFaceToLeft = Math.abs(this.directRadians) < Math.PI / 2;
    var x = this.x + deltaPoint.x + (isFaceToLeft ? 0 : this.width);
    var y = this.y + deltaPoint.y;
    $traceurRuntime.superGet(this, $Enemy.prototype, "renderBuff").apply(this, arguments);
    var length = this.accelerate.length();
    if (length < 1) {
      this.renderStand(app, x, y, isFaceToLeft);
    } else {
      this.renderRun(app, x, y, isFaceToLeft);
    }
  },
  renderStand: function(app, x, y, isFaceToLeft) {
    var atlas = app.atlases[this.atlases];
    var current = ((app.lifetime * 4) % 2 / 2) * 3 | 0;
    app.layer.save().setTransform(1, 0, 0, 1, x, y).scale(isFaceToLeft ? 1 : -1, 1).drawAtlasFrame(atlas, current, 0, 0).restore();
  },
  renderRun: function(app, x, y, isFaceToLeft) {
    var atlas = app.atlases[this.atlases];
    var current = ((app.lifetime * 4) % 2 / 2) * 4 | 0;
    current += 3;
    app.layer.save().setTransform(1, 0, 0, 1, x, y).scale(isFaceToLeft ? 1 : -1, 1).drawAtlasFrame(atlas, current, 0, 0).restore();
  },
  setPath: function(path) {
    this.path = path;
  }
}, {}, Ball);
module.exports = Enemy;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/enemy.js
},{"../../../../library/EasingFunctions":22,"../../../../library/Vector":25,"./ball":5}],8:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Floor = require('./Floor');
var TowerFire = require('./tower/TowerFire');
var TowerIce = require('./tower/TowerIce');
var Enemy = require('./enemy');
var TowerUI = require('../gui/TowerUI');
var Guid = require('../../../../library/Guid');
var Vector = require('../../../../library/Vector');
var CollisionDetection = require('../../../../library/CollisionDetection');
var Clazzes = {
  "TowerFire": TowerFire,
  "TowerIce": TowerIce,
  "Enemy": Enemy,
  "Floor": Floor
};
var towerUI = new TowerUI();
var GameMap = function GameMap(options) {
  var defaults = {
    x: 0,
    y: 0,
    map: [],
    tower: {},
    projectile: {},
    objects: {"Enemy": {}}
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($GameMap).call(this, populated);
  for (var i in this.map) {
    for (var j in this.map[i]) {
      this.setMap(this.map[i][j], i, j);
    }
  }
  for (var $__4 = Object.entries(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var $__15 = $__5.value,
        clazz = $__15[0],
        objects = $__15[1];
    {
      for (var $__2 = Object.entries(objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        var $__16 = $__3.value,
            id = $__16[0],
            object = $__16[1];
        {
          this.objects[clazz][id] = new Clazzes[object.class](object);
          this.addObject(this.objects[clazz][id]);
        }
      }
    }
  }
};
var $GameMap = GameMap;
($traceurRuntime.createClass)(GameMap, {
  get pointOfStart() {
    return this.levelData.enemy_path[0];
  },
  get pointOfEnd() {
    return this.levelData.enemy_path[this.levelData.enemy_path.length - 1];
  },
  init: function(data) {
    var $__0 = this;
    this.levelData = data;
    data.map.forEach((function(e, i) {
      e.forEach((function(mapCode, j) {
        $__0.setMap(mapCode, i, j);
      }));
    }));
  },
  setMap: function(mapCode, i, j) {
    if (!this.map[i]) {
      this.map[i] = [];
    }
    this.map[i][j] = new Floor({
      mapCode: mapCode,
      width: 64,
      height: 64,
      x: i * 64,
      y: j * 64
    });
  },
  step: function(dt) {
    if (!this.isRunning) {
      return;
    }
    $traceurRuntime.superGet(this, $GameMap.prototype, "step").call(this, dt);
    Object.values(this.tower).forEach((function(tower) {
      tower.step(dt);
    }));
    Object.values(this.projectile).forEach((function(projectile) {
      projectile.step(dt);
    }));
    Object.values(this.objects).forEach((function(clazzes) {
      Object.values(clazzes).forEach((function(object) {
        return object.step(dt);
      }));
    }));
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var hpX = app.width - 250;
    var hpDy = 20;
    var hpH = 30;
    var hpHInit = 20;
    var hpHCurrent = hpHInit + hpH + hpDy;
    for (var i in this.map) {
      for (var j in this.map[i]) {
        this.map[i][j].render(app, deltaPoint);
      }
    }
    for (var $__2 = Object.values(this.tower)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var tower = $__3.value;
      {
        tower.render(app, deltaPoint);
      }
    }
    for (var $__4 = Object.values(this.projectile)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var projectile = $__5.value;
      {
        projectile.render(app, deltaPoint);
      }
    }
    for (var $__8 = Object.values(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__9; !($__9 = $__8.next()).done; ) {
      var clazzes = $__9.value;
      {
        for (var $__6 = Object.values(clazzes)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__7; !($__7 = $__6.next()).done; ) {
          var object = $__7.value;
          {
            object.render(app, deltaPoint);
          }
        }
      }
    }
    for (var $__12 = Object.values(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__13; !($__13 = $__12.next()).done; ) {
      var clazzes$__17 = $__13.value;
      {
        for (var $__10 = Object.values(clazzes$__17)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__11; !($__11 = $__10.next()).done; ) {
          var object$__18 = $__11.value;
          {
            if (object$__18 instanceof Enemy) {
              var hpX$__19 = object$__18.x + deltaPoint.x,
                  hpY = object$__18.y - 20 + deltaPoint.y,
                  hpW = 50,
                  hpH$__20 = 10;
              app.layer.fillStyle("#000").fillRect(hpX$__19, hpY, hpW, hpH$__20).fillStyle("#F00").fillRect(hpX$__19, hpY, hpW * (object$__18.hp / object$__18.hpMax), hpH$__20);
            }
          }
        }
      }
    }
    towerUI.render(app, deltaPoint);
  },
  tryBuildTower: function(tower) {
    towerUI.inactive();
    for (var $__2 = Object.values(this.tower)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__3; !($__3 = $__2.next()).done; ) {
      var other = $__3.value;
      {
        var distance = CollisionDetection.RectRectDistance(tower, other);
        if (distance <= 0) {
          return false;
        }
      }
    }
    var canBuildOn = true;
    for (var i in this.map) {
      for (var j in this.map[i]) {
        var other$__21 = this.map[i][j];
        var distance$__22 = CollisionDetection.RectRectDistance(tower, other$__21);
        if (distance$__22 <= 0) {
          canBuildOn &= other$__21.canBuildOn(this.tower);
        }
      }
    }
    return canBuildOn;
  },
  addTower: function(tower) {
    var $__0 = this;
    if (!this.tryBuildTower(tower)) {
      return false;
    }
    tower.on('step', (function(dt) {
      $__0.attackInRange(tower, dt);
    })).on('attack', (function(other, dt) {
      var projectile = tower.throwObject;
      projectile.goto(other);
      projectile.on('atEndPoint', (function() {
        $__0.attackOnTouch(tower, projectile);
        delete $__0.projectile[projectile.id];
      }));
      $__0.addProjectile(projectile);
    }));
    this.tower[tower.id] = tower;
    return true;
  },
  removeTower: function(tower) {
    delete this.tower[tower.id];
  },
  addProjectile: function(projectile) {
    this.projectile[projectile.id] = projectile;
  },
  addObject: function(object) {
    var $__0 = this;
    var instance = this.getObject(object);
    if (instance) {
      this.remove(object);
    }
    this.objects[object.class][object.id] = object;
    object.on('die', (function() {
      $__0.remove(object);
    }));
  },
  getObject: function(object) {
    return this.objects[object.class][object.id];
  },
  remove: function(object) {
    delete this.objects[object.class][object.id];
  },
  magicAttack: function(object) {
    var $__0 = this;
    var center = object.center;
    var fire = new Fire({
      id: Guid.gen('fire'),
      x: object.x,
      y: center.y,
      accelerate: Vector.fromRadians(object.directRadians, 10)
    });
    this.addObject(fire);
    fire.on('step', (function() {
      $__0.attackOnTouch(object, fire);
    }));
    return fire;
  },
  attackInRange: function(tower, dt) {
    for (var $__4 = Object.values(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var clazzes = $__5.value;
      {
        for (var $__2 = Object.values(clazzes)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          var object = $__3.value;
          {
            if (object instanceof Enemy) {
              tower.attack(object, dt);
            }
          }
        }
      }
    }
  },
  attackOnTouch: function(attacker, weapon) {
    for (var $__4 = Object.values(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var clazzes = $__5.value;
      {
        for (var $__2 = Object.values(clazzes)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          var object = $__3.value;
          {
            if (object === attacker) {
              continue;
            }
            weapon.attack(object);
            if (!weapon.isAlive()) {
              return;
            }
          }
        }
      }
    }
  },
  attackRange: function(attacker) {
    for (var $__4 = Object.values(this.objects)[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__5; !($__5 = $__4.next()).done; ) {
      var clazzes = $__5.value;
      {
        for (var $__2 = Object.values(clazzes)[$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          var object = $__3.value;
          {
            attacker.attack(object);
          }
        }
      }
    }
  },
  setDifficulty: function(difficulty) {
    this.difficulty = difficulty;
  },
  roundStart: function() {
    var $__0 = this;
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    var gamemap = this;
    var enemy_count = 10;
    this.timer = setInterval((function() {
      if (enemy_count > 0) {
        var hp = 11 - enemy_count + ($__0.difficulty - 1) * 100,
            enemy = new Enemy({
              id: Guid.gen('enemy'),
              x: $__0.pointOfStart.x,
              y: $__0.pointOfStart.y,
              hp: hp,
              hpMax: hp
            });
        enemy.on('die', (function() {
          gamemap.trigger('enemyDie', enemy);
        })).on('atEndPoint', (function() {
          gamemap.trigger('enemyEscape', enemy);
        })).setPath($__0.levelData.enemy_path);
        $__0.addObject(enemy);
        enemy_count--;
      } else {
        if (Object.keys($__0.objects["Enemy"]).length === 0) {
          clearInterval($__0.timer);
          $__0.isRunning = false;
          gamemap.trigger('roundEnd');
        } else {
          console.log("monster running count: ", Object.keys($__0.objects["Enemy"]).length);
        }
      }
    }), 1000);
  },
  gameOver: function() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.trigger('gameOver');
  },
  showTowerArea: function(isShow) {
    Object.values(this.tower).forEach((function(tower) {
      tower.isShowArea = isShow;
    }));
  },
  onMousedown: function() {
    for (var args = [],
        $__14 = 0; $__14 < arguments.length; $__14++)
      args[$__14] = arguments[$__14];
    args.unshift('mousedown');
    var propagation;
    propagation = towerUI.trigger.apply(towerUI, args);
    if (false === propagation) {
      return false;
    }
    towerUI.inactive();
    var towers = Object.values(this.tower);
    propagation = towers.forEach((function(object) {
      var propagation = object.trigger.apply(object, args);
      if (object.isShowArea) {
        towerUI.active(object);
      }
      return !propagation;
    }));
    return !propagation;
  }
}, {}, Ball);
module.exports = GameMap;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/gamemap.js
},{"../../../../library/CollisionDetection":21,"../../../../library/Guid":23,"../../../../library/Vector":25,"../gui/TowerUI":17,"./Floor":3,"./ball":5,"./enemy":7,"./tower/TowerFire":13,"./tower/TowerIce":14}],9:[function(require,module,exports){
"use strict";
var Ball = require('./ball');
var Icon = function Icon(options) {
  var defaults = {color: "#60a030"};
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Icon).call(this, populated);
};
var $Icon = Icon;
($traceurRuntime.createClass)(Icon, {}, {}, Ball);
module.exports = Icon;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/icon.js
},{"./ball":5}],10:[function(require,module,exports){
"use strict";
var Ball = require('../ball');
var Vector = require('../../../../../library/Vector');
var FireBolt = function FireBolt(options) {
  var defaults = {
    image: "fire_bolt",
    width: 50 * 1,
    height: 13 * 1,
    attackDistance: 0,
    mass: 0.1
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($FireBolt).call(this, populated);
  this.class = this.constructor.name;
};
var $FireBolt = FireBolt;
($traceurRuntime.createClass)(FireBolt, {
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    this.renderImage(app, deltaPoint);
  },
  renderImage: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    app.layer.save().setTransform(1, 0, 0, 1, this.x + deltaPoint.x, this.y + deltaPoint.y).rotate(this.accelerate.angle()).drawImage(app.images[this.image], -this.width / 2, -this.height / 2, this.width, this.height).restore();
  },
  goto: function(other) {
    this.from = Vector.fromObject(this);
    this.to = Vector.fromObject(other.center);
    this.accelerate = this.to.clone().subtract(this.from);
    var length = this.accelerate.length();
    this.accelerate.multiply(new Vector(1 / this.mass / length, 1 / this.mass / length));
  },
  onStep: function() {
    if (Vector.fromObject(this).subtract(this.from).length() > this.to.clone().subtract(this.from).length()) {
      this.x = this.to.x;
      this.y = this.to.y;
      this.trigger('atEndPoint');
    }
    $traceurRuntime.superGet(this, $FireBolt.prototype, "onStep").apply(this, arguments);
  }
}, {}, Ball);
module.exports = FireBolt;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/tower/FireBolt.js
},{"../../../../../library/Vector":25,"../ball":5}],11:[function(require,module,exports){
"use strict";
var FireBolt = require('./FireBolt');
var Buff = require('../Buff');
var IceBolt = function IceBolt(options) {
  var defaults = {
    width: 64,
    height: 64,
    attackDistance: 0,
    mass: 0.1
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($IceBolt).call(this, populated);
  this.class = this.constructor.name;
};
var $IceBolt = IceBolt;
($traceurRuntime.createClass)(IceBolt, {
  goto: function(other) {
    $traceurRuntime.superGet(this, $IceBolt.prototype, "goto").apply(this, arguments);
    this.setCenter(other.center);
  },
  attack: function(other) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    var isHitted = $traceurRuntime.superGet(this, $IceBolt.prototype, "attack").apply(this, arguments);
    if (isHitted) {
      other.addBuff(new Buff());
    }
  }
}, {}, FireBolt);
module.exports = IceBolt;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/tower/IceBolt.js
},{"../Buff":2,"./FireBolt":10}],12:[function(require,module,exports){
"use strict";
var Ball = require('../ball');
var Guid = require('../../../../../library/Guid');
var Window = require('../../gui/Window');
var Tower = function Tower(options) {
  var defaults = {
    width: 60,
    height: 60,
    damage: 10,
    attackDistance: 300,
    colddown: 1,
    lifetime: 0,
    preAttackTime: 0,
    isShowArea: true,
    level: 0
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Tower).call(this, populated);
};
var $Tower = Tower;
($traceurRuntime.createClass)(Tower, {
  get cost() {
    return 10;
  },
  get sellIncome() {
    return 10;
  },
  onStep: function(dt) {
    this.lifetime += dt;
    $traceurRuntime.superGet(this, $Tower.prototype, "onStep").apply(this, arguments);
  },
  onAttack: function(other) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    this.preAttackTime = this.lifetime;
  },
  attack: function(other) {
    var dt = arguments[1] !== (void 0) ? arguments[1] : 1;
    if (!this.isColddown(dt)) {
      return;
    }
    var isHitted = this.canAttack(other);
    if (isHitted) {
      this.trigger('attack', other, dt);
      this.nextshot = 0;
    }
    return isHitted;
  },
  isColddown: function(dt) {
    return this.nextshot < this.colddown;
  },
  get throwObject() {
    var center = this.center;
    return new this.projectileClass({
      x: center.x,
      y: center.y,
      damage: this.damage,
      id: Guid.gen(this.projectileClass)
    });
  },
  onMousedown: function(point) {
    if (point.button === "left") {
      if ($Tower.isInRect(point, this)) {
        this.isShowArea = true;
        return false;
      }
    }
    this.isShowArea = false;
  },
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    $traceurRuntime.superGet(this, $Tower.prototype, "renderImage").apply(this, arguments);
    if (this.isShowArea) {
      this.renderAttackDistance(app, deltaPoint);
    }
  },
  renderAttackDistance: function(app, deltaPoint) {
    var center = this.center;
    var x = center.x + deltaPoint.x;
    var y = center.y + deltaPoint.y;
    app.layer.fillStyle("rgba(255, 255, 255, 0.3)").fillCircle(x, y, this.attackDistance);
  },
  hasUpgradeOption: function() {
    return this.upgradeOptions.length > 0;
  },
  get upgradeOptions() {
    return [];
  },
  upgrade: function() {
    var $__0 = this;
    if (!this.hasUpgradeOption()) {
      return;
    }
    var option = this.upgradeOptions[0];
    this.trigger('upgrade', option, (function() {
      option.attrs.forEach((function(attr) {
        return $__0.upgradeWithSpecificOption(attr.type, attr.value);
      }));
      $__0.level++;
    }));
  },
  upgradeWithSpecificOption: function(type, value) {
    switch (type) {
      case $Tower.DAMAGE:
        this.damage += value;
        break;
      case $Tower.RADIUS:
        this.attackDistance += value;
        break;
      case $Tower.COLDDOWN:
        this.colddown += value;
        break;
    }
  }
}, {
  get DAMAGE() {
    return "damage";
  },
  get RADIUS() {
    return "radius";
  },
  get COLDDOWN() {
    return "cd";
  }
}, Ball);
module.exports = Tower;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/tower/Tower.js
},{"../../../../../library/Guid":23,"../../gui/Window":18,"../ball":5}],13:[function(require,module,exports){
"use strict";
var Tower = require('./Tower');
var FireBolt = require('./FireBolt');
var upgradeOptions = [{
  name: "level 1",
  cost: 10,
  attrs: [{
    type: Tower.DAMAGE,
    value: 10
  }, {
    type: Tower.COLDDOWN,
    value: -0.1
  }]
}, {
  name: "level 2",
  cost: 30,
  attrs: [{
    type: Tower.DAMAGE,
    value: 30
  }, {
    type: Tower.COLDDOWN,
    value: -0.1
  }]
}, {
  name: "level 3",
  cost: 200,
  attrs: [{
    type: Tower.DAMAGE,
    value: 100
  }, {
    type: Tower.COLDDOWN,
    value: -0.2
  }]
}];
var TowerFire = function TowerFire(options) {
  var defaults = {
    image: "dc-dngn/altars/dngn_altar_makhleb_flame1",
    damage: 10,
    attackDistance: 300,
    colddown: 1
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($TowerFire).call(this, populated);
};
var $TowerFire = TowerFire;
($traceurRuntime.createClass)(TowerFire, {
  isColddown: function(dt) {
    return this.lifetime - this.preAttackTime >= this.colddown;
  },
  get cost() {
    return 10;
  },
  get sellIncome() {
    return 10;
  },
  get projectileClass() {
    return FireBolt;
  },
  get upgradeOptions() {
    return upgradeOptions.slice(this.level);
  }
}, {}, Tower);
module.exports = TowerFire;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/tower/TowerFire.js
},{"./FireBolt":10,"./Tower":12}],14:[function(require,module,exports){
"use strict";
var Tower = require('./Tower');
var IceBolt = require('./IceBolt');
var upgradeOptions = [{
  name: "level 1",
  cost: 30,
  attrs: [{
    type: Tower.RADIUS,
    value: 50
  }, {
    type: Tower.DAMAGE,
    value: 5
  }]
}, {
  name: "level 2",
  cost: 30,
  attrs: [{
    type: Tower.RADIUS,
    value: 50
  }, {
    type: Tower.DAMAGE,
    value: 5
  }]
}, {
  name: "level 2",
  cost: 30,
  attrs: [{
    type: Tower.COLDDOWN,
    value: -0.2
  }]
}];
var TowerIce = function TowerIce(options) {
  var defaults = {
    image: "dc-dngn/altars/dngn_altar_sif_muna",
    damage: 5,
    attackDistance: 100,
    colddown: 0.3
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($TowerIce).call(this, populated);
};
var $TowerIce = TowerIce;
($traceurRuntime.createClass)(TowerIce, {
  isColddown: function(dt) {
    return this.lifetime % this.colddown <= dt;
  },
  get cost() {
    return 50;
  },
  get sellIncome() {
    return 50;
  },
  get projectileClass() {
    return IceBolt;
  },
  get upgradeOptions() {
    return upgradeOptions.slice(this.level);
  }
}, {}, Tower);
module.exports = TowerIce;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/class/tower/TowerIce.js
},{"./IceBolt":11,"./Tower":12}],15:[function(require,module,exports){
"use strict";
var GameMap = require('./class/gamemap');
var TowerFire = require('./class/tower/TowerFire');
var TowerIce = require('./class/tower/TowerIce');
var Cursor = require('./class/cursor');
var Icon = require('./class/icon');
var SocketCommand = require('../../../library/SocketCommand');
var Guid = require('../../../library/Guid');
var TechTree = require('./gui/TechTree');
var GAME_NAME = "/tower-defence";
var ENGINE = {
  Resource: {},
  command: undefined,
  isInit: false
};
ENGINE.Game = {
  wallet: {
    balance: 100,
    balanceReal: 100,
    hold: 0
  },
  score: 0,
  round: 1,
  messageTip: "press 1 or 2 select tower, then upgrade by click on it.",
  create: function() {
    var game = this;
    this.command = new SocketCommand(GAME_NAME);
    this.command.add('set_map', function(map) {
      if (!game.isInit) {}
    });
    this.cursor = new Cursor();
    this.towerList = [TowerFire, TowerIce];
    this.techTree = new TechTree({width: 1000});
  },
  enter: function() {
    var $__0 = this;
    var game = this;
    var app = this.app;
    app.scrollingBackground = new ScrollingBackground(app.images.background);
    ENGINE.Resource = app.music.play("music", true);
    ENGINE.enemies = [];
    ENGINE.bombs = [];
    ENGINE.items = [];
    ENGINE.users = [];
    var level1 = require('./levels/level1');
    this.gameMap = new GameMap();
    this.gameMap.init(level1);
    this.gameMap.on('enemyDie', (function(enemy) {
      $__0.wallet.balanceReal += enemy.reward;
      $__0.wallet.balance += enemy.reward;
      $__0.score += $__0.round * enemy.score;
    }));
    this.gameMap.on('enemyEscape', (function(enemy) {
      $__0.score -= $__0.round * enemy.escapeFine;
      $__0.gameMap.remove(enemy);
      $__0.gameMap.gameOver();
    }));
    this.gameMap.on('roundEnd', (function() {
      var timer,
          second = 5;
      timer = setInterval((function() {
        second--;
        $__0.messageTip = "Next Round will begin at " + second + " second later";
        if (second <= 0) {
          $__0.round++;
          $__0.gameMap.setDifficulty($__0.round);
          clearInterval(timer);
          $__0.messageTip = "";
          $__0.gameMap.roundStart();
        }
      }), 1000);
    }));
    this.gameMap.on('gameOver', (function() {
      $__0.messageTip = 'game over, your score: ' + $__0.score;
    }));
    this.gameMap.roundStart();
  },
  step: function(dt) {
    var center = this.app.center;
    this.command.executeAll();
    if (this.gameMap) {
      this.gameMap.step(dt);
    }
  },
  render: function(dt) {
    var $__0 = this;
    var app = this.app;
    var hpX = app.width - 250;
    var hpDy = 20;
    var hpH = 30;
    var hpHCurrent = 200;
    app.layer.clear("#000");
    if (!this.gameMap) {
      return;
    }
    this.oPoint = app.scrollingBackground.render(app, {
      x: 0,
      y: 200
    });
    this.gameMap.render(app, this.oPoint);
    app.layer.fillStyle("#000").fillRect(0, 0, 1500, 200).font("30px Verdana").fillStyle("#FFD700").fillText("$" + this.wallet.balanceReal.toFixed(2), 50, 50).fillStyle("#00D700").fillText("score: " + this.score, 50, 100).fillStyle("#FFD700").fillText("Round " + this.round, 350, 50).fillStyle("#FFD700").fillText(this.messageTip, 350, 100);
    ;
    var tower_sample = {
      attackDistance: 0,
      x: 50,
      y: 100
    };
    this.towerList.forEach((function(towerClass, i) {
      var tower = new $__0.towerList[i](tower_sample);
      var center = tower.center;
      tower.render(app);
      app.layer.fillStyle("#FFD700").fillText("$" + tower.cost, center.x - 30, tower_sample.y + tower.height + 30);
      tower_sample.x += tower.width + 20;
    }));
    var queue = this.command.getList();
    for (var i = queue.length - 1,
        max = Math.max(queue.length - 10, 0); i >= max; --i) {
      app.layer.font("40px Georgia").fillStyle(hpH + "px #abc").fillText(queue[i].eventName, hpX, hpHCurrent);
      hpHCurrent += hpH + hpDy;
    }
    this.cursor.render(app);
  },
  keydown: function(data) {
    var direct = 0;
    switch (data.key) {
      case "a":
      case "left":
        direct |= 8;
        break;
      case "d":
      case "right":
        direct |= 4;
        break;
      case "w":
      case "up":
        direct |= 2;
        break;
      case "s":
      case "down":
        direct |= 1;
        break;
      case "1":
      case "2":
        this.selectBuild(data.key);
        this.traceBuildLocation(this.cursor);
        break;
    }
  },
  keyup: function(data) {
    var direct = 15;
    switch (data.key) {
      case "a":
      case "left":
        direct &= 7;
        break;
      case "d":
      case "right":
        direct &= 11;
        break;
      case "w":
      case "up":
        direct &= 13;
        break;
      case "s":
      case "down":
        direct &= 14;
        break;
    }
  },
  mousemove: function(data) {
    this.techTree.trigger('mousemove', data);
    this.traceBuildLocation(data);
    this.cursor.x = data.x;
    this.cursor.y = data.y;
  },
  mousedown: function(data) {
    var $__0 = this;
    this.techTree.trigger('mousedown', data);
    var gameMapOrigin = {
      x: data.x - this.oPoint.x,
      y: data.y - this.oPoint.y,
      button: data.button
    };
    this.gameMap.trigger('mousedown', gameMapOrigin);
    var button = data.button,
        build = this.cursor.getSelectedBuild();
    if (!build) {
      return;
    }
    if (button === "left") {
      build.setCenter(this.cursor.x - this.oPoint.x, this.cursor.y - this.oPoint.y);
      build.id = Guid.gen('tower');
      var isSuccess = this.gameMap.addTower(build);
      if (isSuccess) {
        build.on('sell', (function() {
          console.log('selled', build);
          $__0.wallet.balanceReal += build.sellIncome;
          $__0.wallet.balance += build.sellIncome;
          $__0.gameMap.removeTower(build);
        })).on('upgrade', (function(option, upgradeFunc) {
          if ($__0.wallet.balanceReal <= option.cost) {
            $__0.messageTip = "money not enough";
            return;
          }
          $__0.wallet.balanceReal -= option.cost;
          $__0.wallet.balance -= option.cost;
          upgradeFunc();
        }));
        this.cursor.clearSelected();
        this.wallet.balanceReal -= build.cost;
        this.gameMap.showTowerArea(false);
      }
    } else if (button === "right") {
      this.cursor.clearSelected();
      this.wallet.balance += build.cost;
      this.gameMap.showTowerArea(false);
    }
  },
  mouseup: function(data) {
    this.techTree.trigger('mouseup', data);
  },
  traceBuildLocation: function(data) {
    var build = this.cursor.getSelectedBuild();
    if (build) {
      data.x = Math.floor(data.x / 64) * 64 + 31;
      data.y = Math.floor(data.y / 64) * 64 + 38;
      build.setCenter(data.x - this.oPoint.x, data.y - this.oPoint.y);
      this.cursor.canBuildHere = this.gameMap.tryBuildTower(build);
    }
  },
  selectBuild: function(index) {
    index -= 1;
    var build = new this.towerList[index]();
    if (this.wallet.balanceReal < build.cost) {
      return;
    }
    this.wallet.balance -= build.cost;
    this.cursor.setSelectedBuild(build);
    this.gameMap.showTowerArea(true);
  }
};
var ScrollingBackground = function(image) {
  var bw = image.width;
  var bh = image.height;
  var layer = {};
  this.directRadians = Math.asin(-1);
  this.faceDirectBits = 0;
  this.dontMove = true;
  this.render = function(app) {
    var start = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var w = app.width,
        h = app.height,
        x = 0 + start.x,
        y = 0 + start.y,
        dx = x % bw,
        dy = y % bh,
        nx = Math.ceil(w / bw) + 1,
        ny = Math.ceil(h / bh) + 1,
        backgrounds = [];
    for (var i = -1; i <= nx; i++) {
      for (var j = -1; j <= ny; j++) {
        backgrounds.push([i * bw + dx, j * bh + dy]);
      }
    }
    backgrounds.forEach(function(e) {
      app.layer.drawImage(image, e[0], e[1]);
    });
    return {
      x: x,
      y: y
    };
  };
};
var Queue = function Queue() {
  this.queue = [];
};
($traceurRuntime.createClass)(Queue, {
  push: function(msg) {
    this.queue.push(msg);
  },
  shift: function() {
    return this.queue.shift();
  }
}, {});
module.exports = ENGINE;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/engine.js
},{"../../../library/Guid":23,"../../../library/SocketCommand":24,"./class/cursor":6,"./class/gamemap":8,"./class/icon":9,"./class/tower/TowerFire":13,"./class/tower/TowerIce":14,"./gui/TechTree":16,"./levels/level1":19}],16:[function(require,module,exports){
"use strict";
var Window = require('./Window');
var Tech = function Tech() {
  this.data = {
    level: 0,
    isEnabled: false
  };
  this.parent = null;
  this.children = [];
};
($traceurRuntime.createClass)(Tech, {
  upgrade: function() {
    this.data.level++;
  },
  upgradeCost: function() {
    return this.data.level * 30;
  }
}, {});
var Tree = function Tree(tech) {
  this._root = tech;
};
($traceurRuntime.createClass)(Tree, {}, {});
var TechTree = function TechTree(options) {
  var defaults = {
    width: 500,
    height: 1000,
    backgroundColor: "#066"
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($TechTree).call(this, populated);
  this.init();
};
var $TechTree = TechTree;
($traceurRuntime.createClass)(TechTree, {
  init: function() {},
  renderExpend: function(app) {
    $traceurRuntime.superGet(this, $TechTree.prototype, "renderExpend").apply(this, arguments);
    var renderArea = this.renderArea;
    var iconSize = 50;
    app.layer.fillStyle("#777").fillRect(renderArea.x, renderArea.y, iconSize, iconSize).lineWidth(5).strokeStyle("#FFF").strokeRect(renderArea.x, renderArea.y, iconSize, iconSize);
  }
}, {}, Window);
module.exports = TechTree;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/gui/TechTree.js
},{"./Window":18}],17:[function(require,module,exports){
"use strict";
var Window = require('./Window');
var btnH = 30;
var getNumber = (function(theNumber) {
  if (theNumber > 0) {
    return "+" + theNumber;
  } else {
    return theNumber.toString();
  }
});
var TowerUI = function TowerUI(options) {
  var defaults = {
    width: 300,
    height: 400,
    noExpendBtn: true,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    strokeColor: "rgba(255, 255, 255, 0)"
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($TowerUI).call(this, populated);
};
var $TowerUI = TowerUI;
($traceurRuntime.createClass)(TowerUI, {
  active: function(tower) {
    var center = tower.center;
    this.setCenter(center.x, center.y);
    this.tower = tower;
  },
  onMousedown: function(point) {
    if (point.button !== "left") {
      return true;
    }
    if (this.tower) {
      return $traceurRuntime.superGet(this, $TowerUI.prototype, "onMousedown").call(this, point);
    }
  },
  inactive: function() {
    delete this.tower;
  },
  render: function(app, deltaPoint) {
    if (!this.tower) {
      return;
    }
    this.deltaPoint = deltaPoint;
    $traceurRuntime.superGet(this, $TowerUI.prototype, "render").apply(this, arguments);
  },
  renderWindow: function(app, deltaPoint) {
    var tower = this.tower;
    this.renderTowerInfo(app, deltaPoint);
    if (tower.hasUpgradeOption()) {
      this.renderUpgrade(app, deltaPoint);
    }
    this.renderSellBtn(app, deltaPoint);
  },
  mousedownInWindow: function(point) {
    if ($TowerUI.isInRect(point, this.areaOfSellBtn)) {
      this.tower.trigger('sell');
      this.inactive();
      return false;
    } else if ($TowerUI.isInRect(point, this.areaOfUpgradeBtn)) {
      this.tower.upgrade();
    }
  },
  renderTowerInfo: function(app, deltaPoint) {
    var areaOfTowerInfo = this.areaOfTowerInfo;
    areaOfTowerInfo.x += deltaPoint.x;
    areaOfTowerInfo.y += deltaPoint.y;
    var tower = this.tower;
    var x = areaOfTowerInfo.x;
    var currentY = areaOfTowerInfo.y;
    var textArray = ["damage: " + tower.damage.toFixed(2), "radius: " + tower.attackDistance.toFixed(2), "cd: " + tower.colddown.toFixed(2)];
    textArray.forEach((function(text) {
      app.layer.fillStyle("rgba(0, 0, 0, 0.5)").fillRect(x, currentY, areaOfTowerInfo.width, btnH).font("30px Verdana").fillStyle("#FFD700").fillText(text, x, currentY += 30);
    }));
  },
  get areaOfTowerInfo() {
    var renderArea = this.renderArea;
    return {
      x: renderArea.x,
      y: renderArea.y,
      width: renderArea.width,
      height: btnH * 3
    };
  },
  renderUpgrade: function(app, deltaPoint) {
    var areaOfUpgradeBtn = this.areaOfUpgradeBtn;
    areaOfUpgradeBtn.x += deltaPoint.x;
    areaOfUpgradeBtn.y += deltaPoint.y;
    var upgradeOptions = this.tower.upgradeOptions;
    var currentY = areaOfUpgradeBtn.y;
    upgradeOptions.slice(0, 3).forEach((function(option, index) {
      app.layer.fillStyle("rgba(0, 0, 0, 0.5)").fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height).font("30px Verdana").fillStyle("#FFD700").fillText("↑ " + option.name + "($" + option.cost + ")", areaOfUpgradeBtn.x, currentY + 30);
      if (index === 0) {
        option.attrs.forEach((function(attr) {
          currentY += btnH;
          app.layer.fillStyle("rgba(0, 0, 0, 0.5)").fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height).font("30px Verdana").fillStyle("#DDA700").fillText("  " + getNumber(attr.value) + " " + attr.type, areaOfUpgradeBtn.x, currentY + 30);
        }));
      } else {
        app.layer.fillStyle("rgba(0, 0, 0, 0.5)").fillRect(areaOfUpgradeBtn.x, currentY, areaOfUpgradeBtn.width, areaOfUpgradeBtn.height);
      }
      currentY += btnH;
    }));
  },
  get areaOfUpgradeBtn() {
    var areaOfTowerInfo = this.areaOfTowerInfo;
    return {
      x: areaOfTowerInfo.x,
      y: areaOfTowerInfo.y + areaOfTowerInfo.height + btnH / 2,
      width: areaOfTowerInfo.width,
      height: btnH
    };
  },
  renderSellBtn: function(app, deltaPoint) {
    var areaOfSellBtn = this.areaOfSellBtn;
    areaOfSellBtn.x += deltaPoint.x;
    areaOfSellBtn.y += deltaPoint.y;
    app.layer.fillStyle("rgba(0, 0, 0, 0.5)").fillRect(areaOfSellBtn.x, areaOfSellBtn.y, areaOfSellBtn.width, areaOfSellBtn.height).font("30px Verdana").fillStyle("#FFD700").fillText("sell($" + this.tower.sellIncome.toFixed(0) + ")", areaOfSellBtn.x, areaOfSellBtn.y + 30);
  },
  get areaOfSellBtn() {
    var renderArea = this.renderArea;
    return {
      x: renderArea.x,
      y: renderArea.y + renderArea.height - btnH,
      width: renderArea.width,
      height: btnH
    };
  }
}, {}, Window);
module.exports = TowerUI;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/gui/TowerUI.js
},{"./Window":18}],18:[function(require,module,exports){
"use strict";
var Graphic = require('../class/Graphic');
var defaults = {
  btnSize: 20,
  strokeWidth: 5
};
var Window = function Window(options) {
  var defaults = {
    backgroundColor: "#000",
    barColor: "#005",
    expendBtnColor: "#084",
    strokeColor: "#FFF",
    isExpend: true,
    noExpendBtn: false
  };
  var populated = Object.assign(defaults, options);
  $traceurRuntime.superConstructor($Window).call(this, populated);
};
var $Window = Window;
($traceurRuntime.createClass)(Window, {
  get renderArea() {
    var strokeWidth = defaults.strokeWidth;
    var btnSize = defaults.btnSize;
    return {
      x: this.x + strokeWidth / 2,
      y: this.y + btnSize + strokeWidth / 2,
      width: this.width - strokeWidth,
      height: this.height - btnSize - strokeWidth
    };
  },
  onMousedown: function(point) {
    var btnSize = defaults.btnSize;
    var isExpendBtn = $Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: btnSize,
      height: btnSize
    });
    var isDragBar = $Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: this.width,
      height: btnSize
    });
    var isInWindow = $Window.isInRect(point, {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    });
    if (isExpendBtn) {
      this.isExpend = !this.isExpend;
      return false;
    } else if (isDragBar) {
      this.isDrag = true;
      this.dragPoint = {
        x: point.x - this.x,
        y: point.y - this.y
      };
      return false;
    } else if (isInWindow) {
      this.mousedownInWindow(point);
      return false;
    }
    return true;
  },
  onMouseup: function(point) {
    this.isDrag = false;
  },
  onMousemove: function(point) {
    if (this.isDrag) {
      this.x = point.x - this.dragPoint.x;
      this.y = point.y - this.dragPoint.y;
    }
  },
  renderWindow: function(app, renderArea) {},
  mousedownInWindow: function(point) {},
  render: function(app) {
    var deltaPoint = arguments[1] !== (void 0) ? arguments[1] : {
      x: 0,
      y: 0
    };
    var renderArea = this.renderArea;
    if (this.noExpendBtn) {
      this.renderNoExpend(app, deltaPoint);
      this.renderWindow(app, deltaPoint);
    } else if (this.isExpend) {
      this.renderExpend(app, deltaPoint);
      this.renderWindow(app, deltaPoint);
    } else {
      this.renderClose(app, deltaPoint);
    }
  },
  renderNoExpend: function(app, deltaPoint) {
    var x = this.x + deltaPoint.x;
    var y = this.y + deltaPoint.y;
    var btnSize = defaults.btnSize;
    app.layer.fillStyle(this.backgroundColor).fillRect(x, y, this.width, this.height).lineWidth(defaults.strokeWidth).strokeStyle(this.strokeColor).strokeRect(x, y, this.width, this.height);
  },
  renderExpend: function(app, deltaPoint) {
    var x = this.x + deltaPoint.x;
    var y = this.y + deltaPoint.y;
    var btnSize = defaults.btnSize;
    app.layer.fillStyle(this.backgroundColor).fillRect(x, y, this.width, this.height).fillStyle(this.barColor).fillRect(x, y, this.width, btnSize).fillStyle(this.expendBtnColor).fillRect(x, y, btnSize, btnSize).lineWidth(defaults.strokeWidth).strokeStyle(this.strokeColor).strokeRect(x, y, this.width, this.height).strokeRect(x, y, this.width, btnSize).strokeLine(x, y + btnSize / 2, x + btnSize, y + btnSize / 2).strokeRect(x, y, btnSize, btnSize);
  },
  renderClose: function(app, deltaPoint) {
    var x = this.x + deltaPoint.x;
    var y = this.y + deltaPoint.y;
    var btnSize = defaults.btnSize;
    app.layer.fillStyle(this.expendBtnColor).fillRect(x, y, btnSize, btnSize).lineWidth(defaults.strokeWidth).strokeStyle(this.strokeColor).strokeLine(x + btnSize / 2, y, x + btnSize / 2, y + btnSize).strokeLine(x, y + btnSize / 2, x + btnSize, y + btnSize / 2).strokeRect(x, y, btnSize, btnSize);
  }
}, {}, Graphic);
module.exports = Window;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/gui/Window.js
},{"../class/Graphic":4}],19:[function(require,module,exports){
module.exports={
  "level": 1,
  "map": [
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [0,2,2,2,2,2,2,2,2,1,1],
    [1,1,1,1,1,1,1,1,2,1,1],
    [1,1,1,1,1,1,1,1,2,1,1],
    [1,1,1,1,1,1,1,1,2,1,1],
    [1,1,1,1,8,8,8,1,2,1,1],
    [1,1,1,1,8,8,8,8,2,1,1],
    [1,1,1,1,1,8,8,1,2,1,1],
    [1,2,2,2,2,2,2,2,2,1,1],
    [1,2,1,1,1,1,1,1,1,1,1],
    [1,2,1,1,1,1,1,1,1,1,1],
    [1,2,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,9],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1]
  ],
  "enemy_path": [
    {
        "x": 192,
        "y": 0
    },
    {
        "x": 192,
        "y": 512
    },
    {
        "x": 640,
        "y": 512
    },
    {
        "x": 640,
        "y": 64
    },
    {
        "x": 896,
        "y": 64
    },
    {
        "x": 896,
        "y": 640
    }
  ]
}
},{}],20:[function(require,module,exports){
"use strict";
var ENGINE = require('./engine');
var app = new PLAYGROUND.Application({
  paths: {
    images: "tower-defence/images/",
    atlases: "tower-defence/atlases/",
    rewriteURL: {background: "/images/background.png"}
  },
  create: function() {
    this.loadSounds("music");
    this.loadImage(["<background>", "fire_bolt", "effect/bolt03", "dc-dngn/floor/grass/grass1", "dc-dngn/floor/grass/grass_full", "dc-dngn/gateways/dngn_portal", "dc-dngn/dngn_trap_teleport", "dc-dngn/water/dngn_shoals_shallow_water1", "dc-dngn/altars/dngn_altar_makhleb_flame1", "dc-dngn/altars/dngn_altar_sif_muna", "fire_bolt", "cursor"]);
    this.loadAtlases("sorlosheet");
  },
  ready: function() {
    this.setState(ENGINE.Game);
  },
  mousedown: function(data) {},
  scale: 0.5
});

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/lan/tower_defence/src/main.js
},{"./engine":15}],21:[function(require,module,exports){
"use strict";
var CollisionDetection = function CollisionDetection() {};
($traceurRuntime.createClass)(CollisionDetection, {}, {
  CircleRectColliding: function(circle, rect) {
    var distX = Math.abs(circle.x - rect.x - rect.width / 2);
    var distY = Math.abs(circle.y - rect.y - rect.height / 2);
    if (distX > (rect.width / 2 + circle.radius)) {
      return false;
    }
    if (distY > (rect.height / 2 + circle.radius)) {
      return false;
    }
    if (distX <= (rect.width / 2)) {
      return true;
    }
    if (distY <= (rect.height / 2)) {
      return true;
    }
    var dx = distX - rect.width / 2;
    var dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  },
  RectRectColliding: function(rect1, rect2) {
    if (rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x && rect1.y < rect2.y + rect2.height && rect1.height + rect1.y > rect2.y) {
      return true;
    }
    return false;
  },
  RectPointColliding: function(rect, point) {
    if (rect.x <= point.x && rect.x + rect.width >= point.x && rect.y <= point.y && rect.height + rect.y >= point.y) {
      return true;
    }
    return false;
  },
  RectRectAngle: function(rect1, rect2) {
    var r1 = {
      hw: (rect1.width || 0) / 2,
      hh: (rect1.height || 0) / 2
    };
    var r2 = {
      hw: (rect2.width || 0) / 2,
      hh: (rect2.height || 0) / 2
    };
    var rect1_center = {
      x: rect1.x + r1.hw,
      y: rect1.y + r1.hh
    };
    var rect2_center = {
      x: rect2.x + r2.hw,
      y: rect2.y + r2.hh
    };
    return this.getAngle(rect1_center, rect2_center);
  },
  RectRectDistance: function(rect1, rect2) {
    var r1 = {
      hw: (rect1.width || 0) / 2,
      hh: (rect1.height || 0) / 2
    };
    var r2 = {
      hw: (rect2.width || 0) / 2,
      hh: (rect2.height || 0) / 2
    };
    var rect1_center = {
      x: rect1.x + r1.hw,
      y: rect1.y + r1.hh
    };
    var rect2_center = {
      x: rect2.x + r2.hw,
      y: rect2.y + r2.hh
    };
    var distance = Math.sqrt(Math.pow(rect2.x - rect1.x, 2) + Math.pow(rect2.y - rect1.y, 2));
    var hpi = Math.PI / 2;
    var rect1_angle = this.getAngle(rect1, rect1_center) % hpi;
    var rect2_angle = this.getAngle(rect2, rect2_center) % hpi;
    var go_through_angle = this.getAngle(rect2_center, rect1_center);
    if (go_through_angle % Math.PI === 0) {
      distance -= r1.hw + r2.hw;
    } else if (go_through_angle % hpi === 0) {
      distance -= r1.hh + r2.hh;
    } else {
      go_through_angle %= hpi;
      var dx = Math.cos(go_through_angle),
          dy = Math.sin(go_through_angle);
      if (rect1_angle !== 0) {
        if (go_through_angle < rect1_angle) {
          distance -= r1.hw / dx;
        } else {
          distance -= r1.hh / dy;
        }
      }
      if (rect2_angle !== 0) {
        if (go_through_angle < rect2_angle) {
          distance -= r2.hw / dx;
        } else {
          distance -= r2.hh / dy;
        }
      }
    }
    if (distance <= 0) {
      return -Math.sqrt(Math.pow(rect2_center.x - rect1_center.x, 2) + Math.pow(rect2_center.y - rect1_center.y, 2));
    }
    return distance;
  },
  getAngle: function(p1, p2) {
    var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    if (angle < 0)
      angle += Math.PI * 2;
    return angle;
  },
  CircleRectDistance: function(circle, rect) {
    var circle_center = {
      x: circle.x + Math.cos(Math.PI / 2) * circle.radius,
      y: circle.y + Math.cos(Math.PI / 2) * circle.radius
    };
    var rect_center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
    var distance = Math.pow(Math.sqrt(rect.x - circle.x) + Math.sqrt(rect.y - circle.y), 2);
    var rect_angle = this.getAngle(rect_center, rect);
    var go_through_angle = this.getAngle(circle_center, rect_center);
    if (go_through_angle < rect_angle) {
      distance -= rect.width / 2 / Math.cos(go_through_angle);
    } else {
      distance -= rect.height / 2 / Math.sin(go_through_angle);
    }
    distance -= circle.radius;
    return distance;
  }
});
module.exports = CollisionDetection;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/library/CollisionDetection.js
},{}],22:[function(require,module,exports){
"use strict";
var EasingFunctions = function EasingFunctions() {};
($traceurRuntime.createClass)(EasingFunctions, {}, {easeOutQuad: function(t, b, c, d) {
    t /= d;
    return -c * t * (t - 2) + b;
  }});
module.exports = EasingFunctions;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/library/EasingFunctions.js
},{}],23:[function(require,module,exports){
"use strict";
var Guid = function Guid() {};
($traceurRuntime.createClass)(Guid, {}, {gen: function() {
    var namespace = arguments[0] !== (void 0) ? arguments[0] : "";
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return namespace + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }});
module.exports = Guid;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/library/Guid.js
},{}],24:[function(require,module,exports){
"use strict";
var SocketCommand = function SocketCommand(namespace) {
  this.socket = io(namespace);
  this.queue = [];
};
($traceurRuntime.createClass)(SocketCommand, {
  add: function(eventName, callback) {
    var command = this;
    command.socket.on(eventName, function() {
      var $__0 = arguments;
      command.queue.push({
        eventName: "on " + eventName,
        f: (function() {
          callback.apply(command.socket, $__0);
        })
      });
    });
  },
  emit: function(eventName, data) {
    var command = this;
    command.queue.push({
      eventName: "emit " + eventName,
      f: (function() {
        command.socket.emit(eventName, data);
      })
    });
  },
  executeAll: function() {
    for (var i = this.queue.length - 1; i >= 0; --i) {
      var task = this.queue[i];
      if (!task.executeTime) {
        task.f();
        task.executeTime = new Date();
      } else {
        if (task.executeTime.getTime() + 1000 * 10 < (new Date()).getTime()) {
          this.queue.splice(i, 1);
        }
      }
    }
  },
  getList: function() {
    return this.queue;
  }
}, {});
module.exports = SocketCommand;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/library/SocketCommand.js
},{}],25:[function(require,module,exports){
"use strict";
var Victor = require('victor');
if (!Victor.fromRadians) {
  Victor.fromRadians = (function(radians, radius) {
    return new Victor(radius * Math.cos(radians), radius * Math.sin(radians));
  });
}
module.exports = Victor;

//# sourceURL=/home/zach/www/MultiPlay/lan_game/src/library/Vector.js
},{"victor":1}],26:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))

},{"_process":27}],27:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],28:[function(require,module,exports){
(function (process,global){
(function(global) {
  'use strict';
  if (global.$traceurRuntime) {
    return;
  }
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $Object.defineProperties;
  var $defineProperty = $Object.defineProperty;
  var $freeze = $Object.freeze;
  var $getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $Object.getOwnPropertyNames;
  var $keys = $Object.keys;
  var $hasOwnProperty = $Object.prototype.hasOwnProperty;
  var $toString = $Object.prototype.toString;
  var $preventExtensions = Object.preventExtensions;
  var $seal = Object.seal;
  var $isExtensible = Object.isExtensible;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var method = nonEnum;
  var counter = 0;
  function newUniqueString() {
    return '__$' + Math.floor(Math.random() * 1e9) + '$' + ++counter + '$__';
  }
  var symbolInternalProperty = newUniqueString();
  var symbolDescriptionProperty = newUniqueString();
  var symbolDataProperty = newUniqueString();
  var symbolValues = $create(null);
  var privateNames = $create(null);
  function isPrivateName(s) {
    return privateNames[s];
  }
  function createPrivateName() {
    var s = newUniqueString();
    privateNames[s] = true;
    return s;
  }
  function isShimSymbol(symbol) {
    return typeof symbol === 'object' && symbol instanceof SymbolValue;
  }
  function typeOf(v) {
    if (isShimSymbol(v))
      return 'symbol';
    return typeof v;
  }
  function Symbol(description) {
    var value = new SymbolValue(description);
    if (!(this instanceof Symbol))
      return value;
    throw new TypeError('Symbol cannot be new\'ed');
  }
  $defineProperty(Symbol.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(Symbol.prototype, 'toString', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    var desc = symbolValue[symbolDescriptionProperty];
    if (desc === undefined)
      desc = '';
    return 'Symbol(' + desc + ')';
  }));
  $defineProperty(Symbol.prototype, 'valueOf', method(function() {
    var symbolValue = this[symbolDataProperty];
    if (!symbolValue)
      throw TypeError('Conversion from symbol to string');
    if (!getOption('symbols'))
      return symbolValue[symbolInternalProperty];
    return symbolValue;
  }));
  function SymbolValue(description) {
    var key = newUniqueString();
    $defineProperty(this, symbolDataProperty, {value: this});
    $defineProperty(this, symbolInternalProperty, {value: key});
    $defineProperty(this, symbolDescriptionProperty, {value: description});
    freeze(this);
    symbolValues[key] = this;
  }
  $defineProperty(SymbolValue.prototype, 'constructor', nonEnum(Symbol));
  $defineProperty(SymbolValue.prototype, 'toString', {
    value: Symbol.prototype.toString,
    enumerable: false
  });
  $defineProperty(SymbolValue.prototype, 'valueOf', {
    value: Symbol.prototype.valueOf,
    enumerable: false
  });
  var hashProperty = createPrivateName();
  var hashPropertyDescriptor = {value: undefined};
  var hashObjectProperties = {
    hash: {value: undefined},
    self: {value: undefined}
  };
  var hashCounter = 0;
  function getOwnHashObject(object) {
    var hashObject = object[hashProperty];
    if (hashObject && hashObject.self === object)
      return hashObject;
    if ($isExtensible(object)) {
      hashObjectProperties.hash.value = hashCounter++;
      hashObjectProperties.self.value = object;
      hashPropertyDescriptor.value = $create(null, hashObjectProperties);
      $defineProperty(object, hashProperty, hashPropertyDescriptor);
      return hashPropertyDescriptor.value;
    }
    return undefined;
  }
  function freeze(object) {
    getOwnHashObject(object);
    return $freeze.apply(this, arguments);
  }
  function preventExtensions(object) {
    getOwnHashObject(object);
    return $preventExtensions.apply(this, arguments);
  }
  function seal(object) {
    getOwnHashObject(object);
    return $seal.apply(this, arguments);
  }
  freeze(SymbolValue.prototype);
  function isSymbolString(s) {
    return symbolValues[s] || privateNames[s];
  }
  function toProperty(name) {
    if (isShimSymbol(name))
      return name[symbolInternalProperty];
    return name;
  }
  function removeSymbolKeys(array) {
    var rv = [];
    for (var i = 0; i < array.length; i++) {
      if (!isSymbolString(array[i])) {
        rv.push(array[i]);
      }
    }
    return rv;
  }
  function getOwnPropertyNames(object) {
    return removeSymbolKeys($getOwnPropertyNames(object));
  }
  function keys(object) {
    return removeSymbolKeys($keys(object));
  }
  function getOwnPropertySymbols(object) {
    var rv = [];
    var names = $getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var symbol = symbolValues[names[i]];
      if (symbol) {
        rv.push(symbol);
      }
    }
    return rv;
  }
  function getOwnPropertyDescriptor(object, name) {
    return $getOwnPropertyDescriptor(object, toProperty(name));
  }
  function hasOwnProperty(name) {
    return $hasOwnProperty.call(this, toProperty(name));
  }
  function getOption(name) {
    return global.traceur && global.traceur.options[name];
  }
  function defineProperty(object, name, descriptor) {
    if (isShimSymbol(name)) {
      name = name[symbolInternalProperty];
    }
    $defineProperty(object, name, descriptor);
    return object;
  }
  function polyfillObject(Object) {
    $defineProperty(Object, 'defineProperty', {value: defineProperty});
    $defineProperty(Object, 'getOwnPropertyNames', {value: getOwnPropertyNames});
    $defineProperty(Object, 'getOwnPropertyDescriptor', {value: getOwnPropertyDescriptor});
    $defineProperty(Object.prototype, 'hasOwnProperty', {value: hasOwnProperty});
    $defineProperty(Object, 'freeze', {value: freeze});
    $defineProperty(Object, 'preventExtensions', {value: preventExtensions});
    $defineProperty(Object, 'seal', {value: seal});
    $defineProperty(Object, 'keys', {value: keys});
  }
  function exportStar(object) {
    for (var i = 1; i < arguments.length; i++) {
      var names = $getOwnPropertyNames(arguments[i]);
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (isSymbolString(name))
          continue;
        (function(mod, name) {
          $defineProperty(object, name, {
            get: function() {
              return mod[name];
            },
            enumerable: true
          });
        })(arguments[i], names[j]);
      }
    }
    return object;
  }
  function isObject(x) {
    return x != null && (typeof x === 'object' || typeof x === 'function');
  }
  function toObject(x) {
    if (x == null)
      throw $TypeError();
    return $Object(x);
  }
  function checkObjectCoercible(argument) {
    if (argument == null) {
      throw new TypeError('Value cannot be converted to an Object');
    }
    return argument;
  }
  function polyfillSymbol(global, Symbol) {
    if (!global.Symbol) {
      global.Symbol = Symbol;
      Object.getOwnPropertySymbols = getOwnPropertySymbols;
    }
    if (!global.Symbol.iterator) {
      global.Symbol.iterator = Symbol('Symbol.iterator');
    }
  }
  function setupGlobals(global) {
    polyfillSymbol(global, Symbol);
    global.Reflect = global.Reflect || {};
    global.Reflect.global = global.Reflect.global || global;
    polyfillObject(global.Object);
  }
  setupGlobals(global);
  global.$traceurRuntime = {
    checkObjectCoercible: checkObjectCoercible,
    createPrivateName: createPrivateName,
    defineProperties: $defineProperties,
    defineProperty: $defineProperty,
    exportStar: exportStar,
    getOwnHashObject: getOwnHashObject,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    isObject: isObject,
    isPrivateName: isPrivateName,
    isSymbolString: isSymbolString,
    keys: $keys,
    setupGlobals: setupGlobals,
    toObject: toObject,
    toProperty: toProperty,
    typeof: typeOf
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
(function() {
  'use strict';
  var path;
  function relativeRequire(callerPath, requiredPath) {
    path = path || typeof require !== 'undefined' && require('path');
    function isDirectory(path) {
      return path.slice(-1) === '/';
    }
    function isAbsolute(path) {
      return path[0] === '/';
    }
    function isRelative(path) {
      return path[0] === '.';
    }
    if (isDirectory(requiredPath) || isAbsolute(requiredPath))
      return;
    return isRelative(requiredPath) ? require(path.resolve(path.dirname(callerPath), requiredPath)) : require(requiredPath);
  }
  $traceurRuntime.require = relativeRequire;
})();
(function() {
  'use strict';
  function spread() {
    var rv = [],
        j = 0,
        iterResult;
    for (var i = 0; i < arguments.length; i++) {
      var valueToSpread = $traceurRuntime.checkObjectCoercible(arguments[i]);
      if (typeof valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)] !== 'function') {
        throw new TypeError('Cannot spread non-iterable object.');
      }
      var iter = valueToSpread[$traceurRuntime.toProperty(Symbol.iterator)]();
      while (!(iterResult = iter.next()).done) {
        rv[j++] = iterResult.value;
      }
    }
    return rv;
  }
  $traceurRuntime.spread = spread;
})();
(function() {
  'use strict';
  var $Object = Object;
  var $TypeError = TypeError;
  var $create = $Object.create;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $getOwnPropertyDescriptor = $traceurRuntime.getOwnPropertyDescriptor;
  var $getOwnPropertyNames = $traceurRuntime.getOwnPropertyNames;
  var $getPrototypeOf = Object.getPrototypeOf;
  var $__0 = Object,
      getOwnPropertyNames = $__0.getOwnPropertyNames,
      getOwnPropertySymbols = $__0.getOwnPropertySymbols;
  function superDescriptor(homeObject, name) {
    var proto = $getPrototypeOf(homeObject);
    do {
      var result = $getOwnPropertyDescriptor(proto, name);
      if (result)
        return result;
      proto = $getPrototypeOf(proto);
    } while (proto);
    return undefined;
  }
  function superConstructor(ctor) {
    return ctor.__proto__;
  }
  function superCall(self, homeObject, name, args) {
    return superGet(self, homeObject, name).apply(self, args);
  }
  function superGet(self, homeObject, name) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor) {
      if (!descriptor.get)
        return descriptor.value;
      return descriptor.get.call(self);
    }
    return undefined;
  }
  function superSet(self, homeObject, name, value) {
    var descriptor = superDescriptor(homeObject, name);
    if (descriptor && descriptor.set) {
      descriptor.set.call(self, value);
      return value;
    }
    throw $TypeError(("super has no setter '" + name + "'."));
  }
  function getDescriptors(object) {
    var descriptors = {};
    var names = getOwnPropertyNames(object);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      descriptors[name] = $getOwnPropertyDescriptor(object, name);
    }
    var symbols = getOwnPropertySymbols(object);
    for (var i = 0; i < symbols.length; i++) {
      var symbol = symbols[i];
      descriptors[$traceurRuntime.toProperty(symbol)] = $getOwnPropertyDescriptor(object, $traceurRuntime.toProperty(symbol));
    }
    return descriptors;
  }
  function createClass(ctor, object, staticObject, superClass) {
    $defineProperty(object, 'constructor', {
      value: ctor,
      configurable: true,
      enumerable: false,
      writable: true
    });
    if (arguments.length > 3) {
      if (typeof superClass === 'function')
        ctor.__proto__ = superClass;
      ctor.prototype = $create(getProtoParent(superClass), getDescriptors(object));
    } else {
      ctor.prototype = object;
    }
    $defineProperty(ctor, 'prototype', {
      configurable: false,
      writable: false
    });
    return $defineProperties(ctor, getDescriptors(staticObject));
  }
  function getProtoParent(superClass) {
    if (typeof superClass === 'function') {
      var prototype = superClass.prototype;
      if ($Object(prototype) === prototype || prototype === null)
        return superClass.prototype;
      throw new $TypeError('super prototype must be an Object or null');
    }
    if (superClass === null)
      return null;
    throw new $TypeError(("Super expression must either be null or a function, not " + typeof superClass + "."));
  }
  function defaultSuperCall(self, homeObject, args) {
    if ($getPrototypeOf(homeObject) !== null)
      superCall(self, homeObject, 'constructor', args);
  }
  $traceurRuntime.createClass = createClass;
  $traceurRuntime.defaultSuperCall = defaultSuperCall;
  $traceurRuntime.superCall = superCall;
  $traceurRuntime.superConstructor = superConstructor;
  $traceurRuntime.superGet = superGet;
  $traceurRuntime.superSet = superSet;
})();
(function() {
  'use strict';
  if (typeof $traceurRuntime !== 'object') {
    throw new Error('traceur runtime not found.');
  }
  var createPrivateName = $traceurRuntime.createPrivateName;
  var $defineProperties = $traceurRuntime.defineProperties;
  var $defineProperty = $traceurRuntime.defineProperty;
  var $create = Object.create;
  var $TypeError = TypeError;
  function nonEnum(value) {
    return {
      configurable: true,
      enumerable: false,
      value: value,
      writable: true
    };
  }
  var ST_NEWBORN = 0;
  var ST_EXECUTING = 1;
  var ST_SUSPENDED = 2;
  var ST_CLOSED = 3;
  var END_STATE = -2;
  var RETHROW_STATE = -3;
  function getInternalError(state) {
    return new Error('Traceur compiler bug: invalid state in state machine: ' + state);
  }
  function GeneratorContext() {
    this.state = 0;
    this.GState = ST_NEWBORN;
    this.storedException = undefined;
    this.finallyFallThrough = undefined;
    this.sent_ = undefined;
    this.returnValue = undefined;
    this.tryStack_ = [];
  }
  GeneratorContext.prototype = {
    pushTry: function(catchState, finallyState) {
      if (finallyState !== null) {
        var finallyFallThrough = null;
        for (var i = this.tryStack_.length - 1; i >= 0; i--) {
          if (this.tryStack_[i].catch !== undefined) {
            finallyFallThrough = this.tryStack_[i].catch;
            break;
          }
        }
        if (finallyFallThrough === null)
          finallyFallThrough = RETHROW_STATE;
        this.tryStack_.push({
          finally: finallyState,
          finallyFallThrough: finallyFallThrough
        });
      }
      if (catchState !== null) {
        this.tryStack_.push({catch: catchState});
      }
    },
    popTry: function() {
      this.tryStack_.pop();
    },
    get sent() {
      this.maybeThrow();
      return this.sent_;
    },
    set sent(v) {
      this.sent_ = v;
    },
    get sentIgnoreThrow() {
      return this.sent_;
    },
    maybeThrow: function() {
      if (this.action === 'throw') {
        this.action = 'next';
        throw this.sent_;
      }
    },
    end: function() {
      switch (this.state) {
        case END_STATE:
          return this;
        case RETHROW_STATE:
          throw this.storedException;
        default:
          throw getInternalError(this.state);
      }
    },
    handleException: function(ex) {
      this.GState = ST_CLOSED;
      this.state = END_STATE;
      throw ex;
    }
  };
  function nextOrThrow(ctx, moveNext, action, x) {
    switch (ctx.GState) {
      case ST_EXECUTING:
        throw new Error(("\"" + action + "\" on executing generator"));
      case ST_CLOSED:
        if (action == 'next') {
          return {
            value: undefined,
            done: true
          };
        }
        throw x;
      case ST_NEWBORN:
        if (action === 'throw') {
          ctx.GState = ST_CLOSED;
          throw x;
        }
        if (x !== undefined)
          throw $TypeError('Sent value to newborn generator');
      case ST_SUSPENDED:
        ctx.GState = ST_EXECUTING;
        ctx.action = action;
        ctx.sent = x;
        var value = moveNext(ctx);
        var done = value === ctx;
        if (done)
          value = ctx.returnValue;
        ctx.GState = done ? ST_CLOSED : ST_SUSPENDED;
        return {
          value: value,
          done: done
        };
    }
  }
  var ctxName = createPrivateName();
  var moveNextName = createPrivateName();
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  $defineProperty(GeneratorFunctionPrototype, 'constructor', nonEnum(GeneratorFunction));
  GeneratorFunctionPrototype.prototype = {
    constructor: GeneratorFunctionPrototype,
    next: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'next', v);
    },
    throw: function(v) {
      return nextOrThrow(this[ctxName], this[moveNextName], 'throw', v);
    }
  };
  $defineProperties(GeneratorFunctionPrototype.prototype, {
    constructor: {enumerable: false},
    next: {enumerable: false},
    throw: {enumerable: false}
  });
  Object.defineProperty(GeneratorFunctionPrototype.prototype, Symbol.iterator, nonEnum(function() {
    return this;
  }));
  function createGeneratorInstance(innerFunction, functionObject, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new GeneratorContext();
    var object = $create(functionObject.prototype);
    object[ctxName] = ctx;
    object[moveNextName] = moveNext;
    return object;
  }
  function initGeneratorFunction(functionObject) {
    functionObject.prototype = $create(GeneratorFunctionPrototype.prototype);
    functionObject.__proto__ = GeneratorFunctionPrototype;
    return functionObject;
  }
  function AsyncFunctionContext() {
    GeneratorContext.call(this);
    this.err = undefined;
    var ctx = this;
    ctx.result = new Promise(function(resolve, reject) {
      ctx.resolve = resolve;
      ctx.reject = reject;
    });
  }
  AsyncFunctionContext.prototype = $create(GeneratorContext.prototype);
  AsyncFunctionContext.prototype.end = function() {
    switch (this.state) {
      case END_STATE:
        this.resolve(this.returnValue);
        break;
      case RETHROW_STATE:
        this.reject(this.storedException);
        break;
      default:
        this.reject(getInternalError(this.state));
    }
  };
  AsyncFunctionContext.prototype.handleException = function() {
    this.state = RETHROW_STATE;
  };
  function asyncWrap(innerFunction, self) {
    var moveNext = getMoveNext(innerFunction, self);
    var ctx = new AsyncFunctionContext();
    ctx.createCallback = function(newState) {
      return function(value) {
        ctx.state = newState;
        ctx.value = value;
        moveNext(ctx);
      };
    };
    ctx.errback = function(err) {
      handleCatch(ctx, err);
      moveNext(ctx);
    };
    moveNext(ctx);
    return ctx.result;
  }
  function getMoveNext(innerFunction, self) {
    return function(ctx) {
      while (true) {
        try {
          return innerFunction.call(self, ctx);
        } catch (ex) {
          handleCatch(ctx, ex);
        }
      }
    };
  }
  function handleCatch(ctx, ex) {
    ctx.storedException = ex;
    var last = ctx.tryStack_[ctx.tryStack_.length - 1];
    if (!last) {
      ctx.handleException(ex);
      return;
    }
    ctx.state = last.catch !== undefined ? last.catch : last.finally;
    if (last.finallyFallThrough !== undefined)
      ctx.finallyFallThrough = last.finallyFallThrough;
  }
  $traceurRuntime.asyncWrap = asyncWrap;
  $traceurRuntime.initGeneratorFunction = initGeneratorFunction;
  $traceurRuntime.createGeneratorInstance = createGeneratorInstance;
})();
(function() {
  function buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (opt_scheme) {
      out.push(opt_scheme, ':');
    }
    if (opt_domain) {
      out.push('//');
      if (opt_userInfo) {
        out.push(opt_userInfo, '@');
      }
      out.push(opt_domain);
      if (opt_port) {
        out.push(':', opt_port);
      }
    }
    if (opt_path) {
      out.push(opt_path);
    }
    if (opt_queryData) {
      out.push('?', opt_queryData);
    }
    if (opt_fragment) {
      out.push('#', opt_fragment);
    }
    return out.join('');
  }
  ;
  var splitRe = new RegExp('^' + '(?:' + '([^:/?#.]+)' + ':)?' + '(?://' + '(?:([^/?#]*)@)?' + '([\\w\\d\\-\\u0100-\\uffff.%]*)' + '(?::([0-9]+))?' + ')?' + '([^?#]+)?' + '(?:\\?([^#]*))?' + '(?:#(.*))?' + '$');
  var ComponentIndex = {
    SCHEME: 1,
    USER_INFO: 2,
    DOMAIN: 3,
    PORT: 4,
    PATH: 5,
    QUERY_DATA: 6,
    FRAGMENT: 7
  };
  function split(uri) {
    return (uri.match(splitRe));
  }
  function removeDotSegments(path) {
    if (path === '/')
      return '/';
    var leadingSlash = path[0] === '/' ? '/' : '';
    var trailingSlash = path.slice(-1) === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
      var segment = segments[pos];
      switch (segment) {
        case '':
        case '.':
          break;
        case '..':
          if (out.length)
            out.pop();
          else
            up++;
          break;
        default:
          out.push(segment);
      }
    }
    if (!leadingSlash) {
      while (up-- > 0) {
        out.unshift('..');
      }
      if (out.length === 0)
        out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
  }
  function joinAndCanonicalizePath(parts) {
    var path = parts[ComponentIndex.PATH] || '';
    path = removeDotSegments(path);
    parts[ComponentIndex.PATH] = path;
    return buildFromEncodedParts(parts[ComponentIndex.SCHEME], parts[ComponentIndex.USER_INFO], parts[ComponentIndex.DOMAIN], parts[ComponentIndex.PORT], parts[ComponentIndex.PATH], parts[ComponentIndex.QUERY_DATA], parts[ComponentIndex.FRAGMENT]);
  }
  function canonicalizeUrl(url) {
    var parts = split(url);
    return joinAndCanonicalizePath(parts);
  }
  function resolveUrl(base, url) {
    var parts = split(url);
    var baseParts = split(base);
    if (parts[ComponentIndex.SCHEME]) {
      return joinAndCanonicalizePath(parts);
    } else {
      parts[ComponentIndex.SCHEME] = baseParts[ComponentIndex.SCHEME];
    }
    for (var i = ComponentIndex.SCHEME; i <= ComponentIndex.PORT; i++) {
      if (!parts[i]) {
        parts[i] = baseParts[i];
      }
    }
    if (parts[ComponentIndex.PATH][0] == '/') {
      return joinAndCanonicalizePath(parts);
    }
    var path = baseParts[ComponentIndex.PATH];
    var index = path.lastIndexOf('/');
    path = path.slice(0, index + 1) + parts[ComponentIndex.PATH];
    parts[ComponentIndex.PATH] = path;
    return joinAndCanonicalizePath(parts);
  }
  function isAbsolute(name) {
    if (!name)
      return false;
    if (name[0] === '/')
      return true;
    var parts = split(name);
    if (parts[ComponentIndex.SCHEME])
      return true;
    return false;
  }
  $traceurRuntime.canonicalizeUrl = canonicalizeUrl;
  $traceurRuntime.isAbsolute = isAbsolute;
  $traceurRuntime.removeDotSegments = removeDotSegments;
  $traceurRuntime.resolveUrl = resolveUrl;
})();
(function() {
  'use strict';
  var types = {
    any: {name: 'any'},
    boolean: {name: 'boolean'},
    number: {name: 'number'},
    string: {name: 'string'},
    symbol: {name: 'symbol'},
    void: {name: 'void'}
  };
  var GenericType = function GenericType(type, argumentTypes) {
    this.type = type;
    this.argumentTypes = argumentTypes;
  };
  ($traceurRuntime.createClass)(GenericType, {}, {});
  var typeRegister = Object.create(null);
  function genericType(type) {
    for (var argumentTypes = [],
        $__1 = 1; $__1 < arguments.length; $__1++)
      argumentTypes[$__1 - 1] = arguments[$__1];
    var typeMap = typeRegister;
    var key = $traceurRuntime.getOwnHashObject(type).hash;
    if (!typeMap[key]) {
      typeMap[key] = Object.create(null);
    }
    typeMap = typeMap[key];
    for (var i = 0; i < argumentTypes.length - 1; i++) {
      key = $traceurRuntime.getOwnHashObject(argumentTypes[i]).hash;
      if (!typeMap[key]) {
        typeMap[key] = Object.create(null);
      }
      typeMap = typeMap[key];
    }
    var tail = argumentTypes[argumentTypes.length - 1];
    key = $traceurRuntime.getOwnHashObject(tail).hash;
    if (!typeMap[key]) {
      typeMap[key] = new GenericType(type, argumentTypes);
    }
    return typeMap[key];
  }
  $traceurRuntime.GenericType = GenericType;
  $traceurRuntime.genericType = genericType;
  $traceurRuntime.type = types;
})();
(function(global) {
  'use strict';
  var $__2 = $traceurRuntime,
      canonicalizeUrl = $__2.canonicalizeUrl,
      resolveUrl = $__2.resolveUrl,
      isAbsolute = $__2.isAbsolute;
  var moduleInstantiators = Object.create(null);
  var baseURL;
  if (global.location && global.location.href)
    baseURL = resolveUrl(global.location.href, './');
  else
    baseURL = '';
  var UncoatedModuleEntry = function UncoatedModuleEntry(url, uncoatedModule) {
    this.url = url;
    this.value_ = uncoatedModule;
  };
  ($traceurRuntime.createClass)(UncoatedModuleEntry, {}, {});
  var ModuleEvaluationError = function ModuleEvaluationError(erroneousModuleName, cause) {
    this.message = this.constructor.name + ': ' + this.stripCause(cause) + ' in ' + erroneousModuleName;
    if (!(cause instanceof $ModuleEvaluationError) && cause.stack)
      this.stack = this.stripStack(cause.stack);
    else
      this.stack = '';
  };
  var $ModuleEvaluationError = ModuleEvaluationError;
  ($traceurRuntime.createClass)(ModuleEvaluationError, {
    stripError: function(message) {
      return message.replace(/.*Error:/, this.constructor.name + ':');
    },
    stripCause: function(cause) {
      if (!cause)
        return '';
      if (!cause.message)
        return cause + '';
      return this.stripError(cause.message);
    },
    loadedBy: function(moduleName) {
      this.stack += '\n loaded by ' + moduleName;
    },
    stripStack: function(causeStack) {
      var stack = [];
      causeStack.split('\n').some((function(frame) {
        if (/UncoatedModuleInstantiator/.test(frame))
          return true;
        stack.push(frame);
      }));
      stack[0] = this.stripError(stack[0]);
      return stack.join('\n');
    }
  }, {}, Error);
  function beforeLines(lines, number) {
    var result = [];
    var first = number - 3;
    if (first < 0)
      first = 0;
    for (var i = first; i < number; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function afterLines(lines, number) {
    var last = number + 1;
    if (last > lines.length - 1)
      last = lines.length - 1;
    var result = [];
    for (var i = number; i <= last; i++) {
      result.push(lines[i]);
    }
    return result;
  }
  function columnSpacing(columns) {
    var result = '';
    for (var i = 0; i < columns - 1; i++) {
      result += '-';
    }
    return result;
  }
  var UncoatedModuleInstantiator = function UncoatedModuleInstantiator(url, func) {
    $traceurRuntime.superConstructor($UncoatedModuleInstantiator).call(this, url, null);
    this.func = func;
  };
  var $UncoatedModuleInstantiator = UncoatedModuleInstantiator;
  ($traceurRuntime.createClass)(UncoatedModuleInstantiator, {getUncoatedModule: function() {
      if (this.value_)
        return this.value_;
      try {
        var relativeRequire;
        if (typeof $traceurRuntime !== undefined) {
          relativeRequire = $traceurRuntime.require.bind(null, this.url);
        }
        return this.value_ = this.func.call(global, relativeRequire);
      } catch (ex) {
        if (ex instanceof ModuleEvaluationError) {
          ex.loadedBy(this.url);
          throw ex;
        }
        if (ex.stack) {
          var lines = this.func.toString().split('\n');
          var evaled = [];
          ex.stack.split('\n').some(function(frame) {
            if (frame.indexOf('UncoatedModuleInstantiator.getUncoatedModule') > 0)
              return true;
            var m = /(at\s[^\s]*\s).*>:(\d*):(\d*)\)/.exec(frame);
            if (m) {
              var line = parseInt(m[2], 10);
              evaled = evaled.concat(beforeLines(lines, line));
              evaled.push(columnSpacing(m[3]) + '^');
              evaled = evaled.concat(afterLines(lines, line));
              evaled.push('= = = = = = = = =');
            } else {
              evaled.push(frame);
            }
          });
          ex.stack = evaled.join('\n');
        }
        throw new ModuleEvaluationError(this.url, ex);
      }
    }}, {}, UncoatedModuleEntry);
  function getUncoatedModuleInstantiator(name) {
    if (!name)
      return;
    var url = ModuleStore.normalize(name);
    return moduleInstantiators[url];
  }
  ;
  var moduleInstances = Object.create(null);
  var liveModuleSentinel = {};
  function Module(uncoatedModule) {
    var isLive = arguments[1];
    var coatedModule = Object.create(null);
    Object.getOwnPropertyNames(uncoatedModule).forEach((function(name) {
      var getter,
          value;
      if (isLive === liveModuleSentinel) {
        var descr = Object.getOwnPropertyDescriptor(uncoatedModule, name);
        if (descr.get)
          getter = descr.get;
      }
      if (!getter) {
        value = uncoatedModule[name];
        getter = function() {
          return value;
        };
      }
      Object.defineProperty(coatedModule, name, {
        get: getter,
        enumerable: true
      });
    }));
    Object.preventExtensions(coatedModule);
    return coatedModule;
  }
  var ModuleStore = {
    normalize: function(name, refererName, refererAddress) {
      if (typeof name !== 'string')
        throw new TypeError('module name must be a string, not ' + typeof name);
      if (isAbsolute(name))
        return canonicalizeUrl(name);
      if (/[^\.]\/\.\.\//.test(name)) {
        throw new Error('module name embeds /../: ' + name);
      }
      if (name[0] === '.' && refererName)
        return resolveUrl(refererName, name);
      return canonicalizeUrl(name);
    },
    get: function(normalizedName) {
      var m = getUncoatedModuleInstantiator(normalizedName);
      if (!m)
        return undefined;
      var moduleInstance = moduleInstances[m.url];
      if (moduleInstance)
        return moduleInstance;
      moduleInstance = Module(m.getUncoatedModule(), liveModuleSentinel);
      return moduleInstances[m.url] = moduleInstance;
    },
    set: function(normalizedName, module) {
      normalizedName = String(normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, (function() {
        return module;
      }));
      moduleInstances[normalizedName] = module;
    },
    get baseURL() {
      return baseURL;
    },
    set baseURL(v) {
      baseURL = String(v);
    },
    registerModule: function(name, deps, func) {
      var normalizedName = ModuleStore.normalize(name);
      if (moduleInstantiators[normalizedName])
        throw new Error('duplicate module named ' + normalizedName);
      moduleInstantiators[normalizedName] = new UncoatedModuleInstantiator(normalizedName, func);
    },
    bundleStore: Object.create(null),
    register: function(name, deps, func) {
      if (!deps || !deps.length && !func.length) {
        this.registerModule(name, deps, func);
      } else {
        this.bundleStore[name] = {
          deps: deps,
          execute: function() {
            var $__0 = arguments;
            var depMap = {};
            deps.forEach((function(dep, index) {
              return depMap[dep] = $__0[index];
            }));
            var registryEntry = func.call(this, depMap);
            registryEntry.execute.call(this);
            return registryEntry.exports;
          }
        };
      }
    },
    getAnonymousModule: function(func) {
      return new Module(func.call(global), liveModuleSentinel);
    },
    getForTesting: function(name) {
      var $__0 = this;
      if (!this.testingPrefix_) {
        Object.keys(moduleInstances).some((function(key) {
          var m = /(traceur@[^\/]*\/)/.exec(key);
          if (m) {
            $__0.testingPrefix_ = m[1];
            return true;
          }
        }));
      }
      return this.get(this.testingPrefix_ + name);
    }
  };
  var moduleStoreModule = new Module({ModuleStore: ModuleStore});
  ModuleStore.set('@traceur/src/runtime/ModuleStore', moduleStoreModule);
  ModuleStore.set('@traceur/src/runtime/ModuleStore.js', moduleStoreModule);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
  };
  $traceurRuntime.ModuleStore = ModuleStore;
  global.System = {
    register: ModuleStore.register.bind(ModuleStore),
    registerModule: ModuleStore.registerModule.bind(ModuleStore),
    get: ModuleStore.get,
    set: ModuleStore.set,
    normalize: ModuleStore.normalize
  };
  $traceurRuntime.getModuleImpl = function(name) {
    var instantiator = getUncoatedModuleInstantiator(name);
    return instantiator && instantiator.getUncoatedModule();
  };
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/utils.js";
  var $ceil = Math.ceil;
  var $floor = Math.floor;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var $pow = Math.pow;
  var $min = Math.min;
  var toObject = $traceurRuntime.toObject;
  function toUint32(x) {
    return x >>> 0;
  }
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function isCallable(x) {
    return typeof x === 'function';
  }
  function isNumber(x) {
    return typeof x === 'number';
  }
  function toInteger(x) {
    x = +x;
    if ($isNaN(x))
      return 0;
    if (x === 0 || !$isFinite(x))
      return x;
    return x > 0 ? $floor(x) : $ceil(x);
  }
  var MAX_SAFE_LENGTH = $pow(2, 53) - 1;
  function toLength(x) {
    var len = toInteger(x);
    return len < 0 ? 0 : $min(len, MAX_SAFE_LENGTH);
  }
  function checkIterable(x) {
    return !isObject(x) ? undefined : x[Symbol.iterator];
  }
  function isConstructor(x) {
    return isCallable(x);
  }
  function createIteratorResultObject(value, done) {
    return {
      value: value,
      done: done
    };
  }
  function maybeDefine(object, name, descr) {
    if (!(name in object)) {
      Object.defineProperty(object, name, descr);
    }
  }
  function maybeDefineMethod(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  function maybeDefineConst(object, name, value) {
    maybeDefine(object, name, {
      value: value,
      configurable: false,
      enumerable: false,
      writable: false
    });
  }
  function maybeAddFunctions(object, functions) {
    for (var i = 0; i < functions.length; i += 2) {
      var name = functions[i];
      var value = functions[i + 1];
      maybeDefineMethod(object, name, value);
    }
  }
  function maybeAddConsts(object, consts) {
    for (var i = 0; i < consts.length; i += 2) {
      var name = consts[i];
      var value = consts[i + 1];
      maybeDefineConst(object, name, value);
    }
  }
  function maybeAddIterator(object, func, Symbol) {
    if (!Symbol || !Symbol.iterator || object[Symbol.iterator])
      return;
    if (object['@@iterator'])
      func = object['@@iterator'];
    Object.defineProperty(object, Symbol.iterator, {
      value: func,
      configurable: true,
      enumerable: false,
      writable: true
    });
  }
  var polyfills = [];
  function registerPolyfill(func) {
    polyfills.push(func);
  }
  function polyfillAll(global) {
    polyfills.forEach((function(f) {
      return f(global);
    }));
  }
  return {
    get toObject() {
      return toObject;
    },
    get toUint32() {
      return toUint32;
    },
    get isObject() {
      return isObject;
    },
    get isCallable() {
      return isCallable;
    },
    get isNumber() {
      return isNumber;
    },
    get toInteger() {
      return toInteger;
    },
    get toLength() {
      return toLength;
    },
    get checkIterable() {
      return checkIterable;
    },
    get isConstructor() {
      return isConstructor;
    },
    get createIteratorResultObject() {
      return createIteratorResultObject;
    },
    get maybeDefine() {
      return maybeDefine;
    },
    get maybeDefineMethod() {
      return maybeDefineMethod;
    },
    get maybeDefineConst() {
      return maybeDefineConst;
    },
    get maybeAddFunctions() {
      return maybeAddFunctions;
    },
    get maybeAddConsts() {
      return maybeAddConsts;
    },
    get maybeAddIterator() {
      return maybeAddIterator;
    },
    get registerPolyfill() {
      return registerPolyfill;
    },
    get polyfillAll() {
      return polyfillAll;
    }
  };
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Map.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  var deletedSentinel = {};
  function lookupIndex(map, key) {
    if (isObject(key)) {
      var hashObject = getOwnHashObject(key);
      return hashObject && map.objectIndex_[hashObject.hash];
    }
    if (typeof key === 'string')
      return map.stringIndex_[key];
    return map.primitiveIndex_[key];
  }
  function initMap(map) {
    map.entries_ = [];
    map.objectIndex_ = Object.create(null);
    map.stringIndex_ = Object.create(null);
    map.primitiveIndex_ = Object.create(null);
    map.deletedCount_ = 0;
  }
  var Map = function Map() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Map called on incompatible type');
    if ($hasOwnProperty.call(this, 'entries_')) {
      throw new TypeError('Map can not be reentrantly initialised');
    }
    initMap(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__2 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        var $__4 = $__3.value,
            key = $__4[0],
            value = $__4[1];
        {
          this.set(key, value);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Map, {
    get size() {
      return this.entries_.length / 2 - this.deletedCount_;
    },
    get: function(key) {
      var index = lookupIndex(this, key);
      if (index !== undefined)
        return this.entries_[index + 1];
    },
    set: function(key, value) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index = lookupIndex(this, key);
      if (index !== undefined) {
        this.entries_[index + 1] = value;
      } else {
        index = this.entries_.length;
        this.entries_[index] = key;
        this.entries_[index + 1] = value;
        if (objectMode) {
          var hashObject = getOwnHashObject(key);
          var hash = hashObject.hash;
          this.objectIndex_[hash] = index;
        } else if (stringMode) {
          this.stringIndex_[key] = index;
        } else {
          this.primitiveIndex_[key] = index;
        }
      }
      return this;
    },
    has: function(key) {
      return lookupIndex(this, key) !== undefined;
    },
    delete: function(key) {
      var objectMode = isObject(key);
      var stringMode = typeof key === 'string';
      var index;
      var hash;
      if (objectMode) {
        var hashObject = getOwnHashObject(key);
        if (hashObject) {
          index = this.objectIndex_[hash = hashObject.hash];
          delete this.objectIndex_[hash];
        }
      } else if (stringMode) {
        index = this.stringIndex_[key];
        delete this.stringIndex_[key];
      } else {
        index = this.primitiveIndex_[key];
        delete this.primitiveIndex_[key];
      }
      if (index !== undefined) {
        this.entries_[index] = deletedSentinel;
        this.entries_[index + 1] = undefined;
        this.deletedCount_++;
        return true;
      }
      return false;
    },
    clear: function() {
      initMap(this);
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      for (var i = 0; i < this.entries_.length; i += 2) {
        var key = this.entries_[i];
        var value = this.entries_[i + 1];
        if (key === deletedSentinel)
          continue;
        callbackFn.call(thisArg, value, key, this);
      }
    },
    entries: $traceurRuntime.initGeneratorFunction(function $__5() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return [key, value];
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__5, this);
    }),
    keys: $traceurRuntime.initGeneratorFunction(function $__6() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return key;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__6, this);
    }),
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var i,
          key,
          value;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              i = 0;
              $ctx.state = 12;
              break;
            case 12:
              $ctx.state = (i < this.entries_.length) ? 8 : -2;
              break;
            case 4:
              i += 2;
              $ctx.state = 12;
              break;
            case 8:
              key = this.entries_[i];
              value = this.entries_[i + 1];
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = (key === deletedSentinel) ? 4 : 6;
              break;
            case 6:
              $ctx.state = 2;
              return value;
            case 2:
              $ctx.maybeThrow();
              $ctx.state = 4;
              break;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    })
  }, {});
  Object.defineProperty(Map.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Map.prototype.entries
  });
  function polyfillMap(global) {
    var $__4 = global,
        Object = $__4.Object,
        Symbol = $__4.Symbol;
    if (!global.Map)
      global.Map = Map;
    var mapPrototype = global.Map.prototype;
    if (mapPrototype.entries === undefined)
      global.Map = Map;
    if (mapPrototype.entries) {
      maybeAddIterator(mapPrototype, mapPrototype.entries, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Map().entries()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillMap);
  return {
    get Map() {
      return Map;
    },
    get polyfillMap() {
      return polyfillMap;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Set.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Set.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isObject = $__0.isObject,
      maybeAddIterator = $__0.maybeAddIterator,
      registerPolyfill = $__0.registerPolyfill;
  var Map = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Map.js").Map;
  var getOwnHashObject = $traceurRuntime.getOwnHashObject;
  var $hasOwnProperty = Object.prototype.hasOwnProperty;
  function initSet(set) {
    set.map_ = new Map();
  }
  var Set = function Set() {
    var iterable = arguments[0];
    if (!isObject(this))
      throw new TypeError('Set called on incompatible type');
    if ($hasOwnProperty.call(this, 'map_')) {
      throw new TypeError('Set can not be reentrantly initialised');
    }
    initSet(this);
    if (iterable !== null && iterable !== undefined) {
      for (var $__4 = iterable[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__5; !($__5 = $__4.next()).done; ) {
        var item = $__5.value;
        {
          this.add(item);
        }
      }
    }
  };
  ($traceurRuntime.createClass)(Set, {
    get size() {
      return this.map_.size;
    },
    has: function(key) {
      return this.map_.has(key);
    },
    add: function(key) {
      this.map_.set(key, key);
      return this;
    },
    delete: function(key) {
      return this.map_.delete(key);
    },
    clear: function() {
      return this.map_.clear();
    },
    forEach: function(callbackFn) {
      var thisArg = arguments[1];
      var $__2 = this;
      return this.map_.forEach((function(value, key) {
        callbackFn.call(thisArg, key, key, $__2);
      }));
    },
    values: $traceurRuntime.initGeneratorFunction(function $__7() {
      var $__8,
          $__9;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__8 = this.map_.keys()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__9 = $__8[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__9.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__9.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__9.value;
            default:
              return $ctx.end();
          }
      }, $__7, this);
    }),
    entries: $traceurRuntime.initGeneratorFunction(function $__10() {
      var $__11,
          $__12;
      return $traceurRuntime.createGeneratorInstance(function($ctx) {
        while (true)
          switch ($ctx.state) {
            case 0:
              $__11 = this.map_.entries()[Symbol.iterator]();
              $ctx.sent = void 0;
              $ctx.action = 'next';
              $ctx.state = 12;
              break;
            case 12:
              $__12 = $__11[$ctx.action]($ctx.sentIgnoreThrow);
              $ctx.state = 9;
              break;
            case 9:
              $ctx.state = ($__12.done) ? 3 : 2;
              break;
            case 3:
              $ctx.sent = $__12.value;
              $ctx.state = -2;
              break;
            case 2:
              $ctx.state = 12;
              return $__12.value;
            default:
              return $ctx.end();
          }
      }, $__10, this);
    })
  }, {});
  Object.defineProperty(Set.prototype, Symbol.iterator, {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  Object.defineProperty(Set.prototype, 'keys', {
    configurable: true,
    writable: true,
    value: Set.prototype.values
  });
  function polyfillSet(global) {
    var $__6 = global,
        Object = $__6.Object,
        Symbol = $__6.Symbol;
    if (!global.Set)
      global.Set = Set;
    var setPrototype = global.Set.prototype;
    if (setPrototype.values) {
      maybeAddIterator(setPrototype, setPrototype.values, Symbol);
      maybeAddIterator(Object.getPrototypeOf(new global.Set().values()), function() {
        return this;
      }, Symbol);
    }
  }
  registerPolyfill(polyfillSet);
  return {
    get Set() {
      return Set;
    },
    get polyfillSet() {
      return polyfillSet;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Set.js" + '');
System.registerModule("traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js";
  var len = 0;
  function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
      scheduleFlush();
    }
  }
  var $__default = asap;
  var browserGlobal = (typeof window !== 'undefined') ? window : {};
  var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
  var isWorker = typeof Uint8ClampedArray !== 'undefined' && typeof importScripts !== 'undefined' && typeof MessageChannel !== 'undefined';
  function useNextTick() {
    return function() {
      process.nextTick(flush);
    };
  }
  function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, {characterData: true});
    return function() {
      node.data = (iterations = ++iterations % 2);
    };
  }
  function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function() {
      channel.port2.postMessage(0);
    };
  }
  function useSetTimeout() {
    return function() {
      setTimeout(flush, 1);
    };
  }
  var queue = new Array(1000);
  function flush() {
    for (var i = 0; i < len; i += 2) {
      var callback = queue[i];
      var arg = queue[i + 1];
      callback(arg);
      queue[i] = undefined;
      queue[i + 1] = undefined;
    }
    len = 0;
  }
  var scheduleFlush;
  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    scheduleFlush = useNextTick();
  } else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
  } else if (isWorker) {
    scheduleFlush = useMessageChannel();
  } else {
    scheduleFlush = useSetTimeout();
  }
  return {get default() {
      return $__default;
    }};
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js";
  var async = System.get("traceur-runtime@0.0.79/node_modules/rsvp/lib/rsvp/asap.js").default;
  var registerPolyfill = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js").registerPolyfill;
  var promiseRaw = {};
  function isPromise(x) {
    return x && typeof x === 'object' && x.status_ !== undefined;
  }
  function idResolveHandler(x) {
    return x;
  }
  function idRejectHandler(x) {
    throw x;
  }
  function chain(promise) {
    var onResolve = arguments[1] !== (void 0) ? arguments[1] : idResolveHandler;
    var onReject = arguments[2] !== (void 0) ? arguments[2] : idRejectHandler;
    var deferred = getDeferred(promise.constructor);
    switch (promise.status_) {
      case undefined:
        throw TypeError;
      case 0:
        promise.onResolve_.push(onResolve, deferred);
        promise.onReject_.push(onReject, deferred);
        break;
      case +1:
        promiseEnqueue(promise.value_, [onResolve, deferred]);
        break;
      case -1:
        promiseEnqueue(promise.value_, [onReject, deferred]);
        break;
    }
    return deferred.promise;
  }
  function getDeferred(C) {
    if (this === $Promise) {
      var promise = promiseInit(new $Promise(promiseRaw));
      return {
        promise: promise,
        resolve: (function(x) {
          promiseResolve(promise, x);
        }),
        reject: (function(r) {
          promiseReject(promise, r);
        })
      };
    } else {
      var result = {};
      result.promise = new C((function(resolve, reject) {
        result.resolve = resolve;
        result.reject = reject;
      }));
      return result;
    }
  }
  function promiseSet(promise, status, value, onResolve, onReject) {
    promise.status_ = status;
    promise.value_ = value;
    promise.onResolve_ = onResolve;
    promise.onReject_ = onReject;
    return promise;
  }
  function promiseInit(promise) {
    return promiseSet(promise, 0, undefined, [], []);
  }
  var Promise = function Promise(resolver) {
    if (resolver === promiseRaw)
      return;
    if (typeof resolver !== 'function')
      throw new TypeError;
    var promise = promiseInit(this);
    try {
      resolver((function(x) {
        promiseResolve(promise, x);
      }), (function(r) {
        promiseReject(promise, r);
      }));
    } catch (e) {
      promiseReject(promise, e);
    }
  };
  ($traceurRuntime.createClass)(Promise, {
    catch: function(onReject) {
      return this.then(undefined, onReject);
    },
    then: function(onResolve, onReject) {
      if (typeof onResolve !== 'function')
        onResolve = idResolveHandler;
      if (typeof onReject !== 'function')
        onReject = idRejectHandler;
      var that = this;
      var constructor = this.constructor;
      return chain(this, function(x) {
        x = promiseCoerce(constructor, x);
        return x === that ? onReject(new TypeError) : isPromise(x) ? x.then(onResolve, onReject) : onResolve(x);
      }, onReject);
    }
  }, {
    resolve: function(x) {
      if (this === $Promise) {
        if (isPromise(x)) {
          return x;
        }
        return promiseSet(new $Promise(promiseRaw), +1, x);
      } else {
        return new this(function(resolve, reject) {
          resolve(x);
        });
      }
    },
    reject: function(r) {
      if (this === $Promise) {
        return promiseSet(new $Promise(promiseRaw), -1, r);
      } else {
        return new this((function(resolve, reject) {
          reject(r);
        }));
      }
    },
    all: function(values) {
      var deferred = getDeferred(this);
      var resolutions = [];
      try {
        var count = values.length;
        if (count === 0) {
          deferred.resolve(resolutions);
        } else {
          for (var i = 0; i < values.length; i++) {
            this.resolve(values[i]).then(function(i, x) {
              resolutions[i] = x;
              if (--count === 0)
                deferred.resolve(resolutions);
            }.bind(undefined, i), (function(r) {
              deferred.reject(r);
            }));
          }
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    },
    race: function(values) {
      var deferred = getDeferred(this);
      try {
        for (var i = 0; i < values.length; i++) {
          this.resolve(values[i]).then((function(x) {
            deferred.resolve(x);
          }), (function(r) {
            deferred.reject(r);
          }));
        }
      } catch (e) {
        deferred.reject(e);
      }
      return deferred.promise;
    }
  });
  var $Promise = Promise;
  var $PromiseReject = $Promise.reject;
  function promiseResolve(promise, x) {
    promiseDone(promise, +1, x, promise.onResolve_);
  }
  function promiseReject(promise, r) {
    promiseDone(promise, -1, r, promise.onReject_);
  }
  function promiseDone(promise, status, value, reactions) {
    if (promise.status_ !== 0)
      return;
    promiseEnqueue(value, reactions);
    promiseSet(promise, status, value);
  }
  function promiseEnqueue(value, tasks) {
    async((function() {
      for (var i = 0; i < tasks.length; i += 2) {
        promiseHandle(value, tasks[i], tasks[i + 1]);
      }
    }));
  }
  function promiseHandle(value, handler, deferred) {
    try {
      var result = handler(value);
      if (result === deferred.promise)
        throw new TypeError;
      else if (isPromise(result))
        chain(result, deferred.resolve, deferred.reject);
      else
        deferred.resolve(result);
    } catch (e) {
      try {
        deferred.reject(e);
      } catch (e) {}
    }
  }
  var thenableSymbol = '@@thenable';
  function isObject(x) {
    return x && (typeof x === 'object' || typeof x === 'function');
  }
  function promiseCoerce(constructor, x) {
    if (!isPromise(x) && isObject(x)) {
      var then;
      try {
        then = x.then;
      } catch (r) {
        var promise = $PromiseReject.call(constructor, r);
        x[thenableSymbol] = promise;
        return promise;
      }
      if (typeof then === 'function') {
        var p = x[thenableSymbol];
        if (p) {
          return p;
        } else {
          var deferred = getDeferred(constructor);
          x[thenableSymbol] = deferred.promise;
          try {
            then.call(x, deferred.resolve, deferred.reject);
          } catch (r) {
            deferred.reject(r);
          }
          return deferred.promise;
        }
      }
    }
    return x;
  }
  function polyfillPromise(global) {
    if (!global.Promise)
      global.Promise = Promise;
  }
  registerPolyfill(polyfillPromise);
  return {
    get Promise() {
      return Promise;
    },
    get polyfillPromise() {
      return polyfillPromise;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Promise.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      createIteratorResultObject = $__0.createIteratorResultObject,
      isObject = $__0.isObject;
  var toProperty = $traceurRuntime.toProperty;
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var iteratedString = Symbol('iteratedString');
  var stringIteratorNextIndex = Symbol('stringIteratorNextIndex');
  var StringIterator = function StringIterator() {};
  ($traceurRuntime.createClass)(StringIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var o = this;
      if (!isObject(o) || !hasOwnProperty.call(o, iteratedString)) {
        throw new TypeError('this must be a StringIterator object');
      }
      var s = o[toProperty(iteratedString)];
      if (s === undefined) {
        return createIteratorResultObject(undefined, true);
      }
      var position = o[toProperty(stringIteratorNextIndex)];
      var len = s.length;
      if (position >= len) {
        o[toProperty(iteratedString)] = undefined;
        return createIteratorResultObject(undefined, true);
      }
      var first = s.charCodeAt(position);
      var resultString;
      if (first < 0xD800 || first > 0xDBFF || position + 1 === len) {
        resultString = String.fromCharCode(first);
      } else {
        var second = s.charCodeAt(position + 1);
        if (second < 0xDC00 || second > 0xDFFF) {
          resultString = String.fromCharCode(first);
        } else {
          resultString = String.fromCharCode(first) + String.fromCharCode(second);
        }
      }
      o[toProperty(stringIteratorNextIndex)] = position + resultString.length;
      return createIteratorResultObject(resultString, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createStringIterator(string) {
    var s = String(string);
    var iterator = Object.create(StringIterator.prototype);
    iterator[toProperty(iteratedString)] = s;
    iterator[toProperty(stringIteratorNextIndex)] = 0;
    return iterator;
  }
  return {get createStringIterator() {
      return createStringIterator;
    }};
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/String.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/String.js";
  var createStringIterator = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/StringIterator.js").createStringIterator;
  var $__1 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill;
  var $toString = Object.prototype.toString;
  var $indexOf = String.prototype.indexOf;
  var $lastIndexOf = String.prototype.lastIndexOf;
  function startsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (isNaN(pos)) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    return $indexOf.call(string, searchString, pos) == start;
  }
  function endsWith(search) {
    var string = String(this);
    if (this == null || $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var pos = stringLength;
    if (arguments.length > 1) {
      var position = arguments[1];
      if (position !== undefined) {
        pos = position ? Number(position) : 0;
        if (isNaN(pos)) {
          pos = 0;
        }
      }
    }
    var end = Math.min(Math.max(pos, 0), stringLength);
    var start = end - searchLength;
    if (start < 0) {
      return false;
    }
    return $lastIndexOf.call(string, searchString, start) == start;
  }
  function includes(search) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    if (search && $toString.call(search) == '[object RegExp]') {
      throw TypeError();
    }
    var stringLength = string.length;
    var searchString = String(search);
    var searchLength = searchString.length;
    var position = arguments.length > 1 ? arguments[1] : undefined;
    var pos = position ? Number(position) : 0;
    if (pos != pos) {
      pos = 0;
    }
    var start = Math.min(Math.max(pos, 0), stringLength);
    if (searchLength + start > stringLength) {
      return false;
    }
    return $indexOf.call(string, searchString, pos) != -1;
  }
  function repeat(count) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var n = count ? Number(count) : 0;
    if (isNaN(n)) {
      n = 0;
    }
    if (n < 0 || n == Infinity) {
      throw RangeError();
    }
    if (n == 0) {
      return '';
    }
    var result = '';
    while (n--) {
      result += string;
    }
    return result;
  }
  function codePointAt(position) {
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var size = string.length;
    var index = position ? Number(position) : 0;
    if (isNaN(index)) {
      index = 0;
    }
    if (index < 0 || index >= size) {
      return undefined;
    }
    var first = string.charCodeAt(index);
    var second;
    if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
      second = string.charCodeAt(index + 1);
      if (second >= 0xDC00 && second <= 0xDFFF) {
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }
    return first;
  }
  function raw(callsite) {
    var raw = callsite.raw;
    var len = raw.length >>> 0;
    if (len === 0)
      return '';
    var s = '';
    var i = 0;
    while (true) {
      s += raw[i];
      if (i + 1 === len)
        return s;
      s += arguments[++i];
    }
  }
  function fromCodePoint() {
    var codeUnits = [];
    var floor = Math.floor;
    var highSurrogate;
    var lowSurrogate;
    var index = -1;
    var length = arguments.length;
    if (!length) {
      return '';
    }
    while (++index < length) {
      var codePoint = Number(arguments[index]);
      if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) != codePoint) {
        throw RangeError('Invalid code point: ' + codePoint);
      }
      if (codePoint <= 0xFFFF) {
        codeUnits.push(codePoint);
      } else {
        codePoint -= 0x10000;
        highSurrogate = (codePoint >> 10) + 0xD800;
        lowSurrogate = (codePoint % 0x400) + 0xDC00;
        codeUnits.push(highSurrogate, lowSurrogate);
      }
    }
    return String.fromCharCode.apply(null, codeUnits);
  }
  function stringPrototypeIterator() {
    var o = $traceurRuntime.checkObjectCoercible(this);
    var s = String(o);
    return createStringIterator(s);
  }
  function polyfillString(global) {
    var String = global.String;
    maybeAddFunctions(String.prototype, ['codePointAt', codePointAt, 'endsWith', endsWith, 'includes', includes, 'repeat', repeat, 'startsWith', startsWith]);
    maybeAddFunctions(String, ['fromCodePoint', fromCodePoint, 'raw', raw]);
    maybeAddIterator(String.prototype, stringPrototypeIterator, Symbol);
  }
  registerPolyfill(polyfillString);
  return {
    get startsWith() {
      return startsWith;
    },
    get endsWith() {
      return endsWith;
    },
    get includes() {
      return includes;
    },
    get repeat() {
      return repeat;
    },
    get codePointAt() {
      return codePointAt;
    },
    get raw() {
      return raw;
    },
    get fromCodePoint() {
      return fromCodePoint;
    },
    get stringPrototypeIterator() {
      return stringPrototypeIterator;
    },
    get polyfillString() {
      return polyfillString;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/String.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js", [], function() {
  "use strict";
  var $__2;
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      toObject = $__0.toObject,
      toUint32 = $__0.toUint32,
      createIteratorResultObject = $__0.createIteratorResultObject;
  var ARRAY_ITERATOR_KIND_KEYS = 1;
  var ARRAY_ITERATOR_KIND_VALUES = 2;
  var ARRAY_ITERATOR_KIND_ENTRIES = 3;
  var ArrayIterator = function ArrayIterator() {};
  ($traceurRuntime.createClass)(ArrayIterator, ($__2 = {}, Object.defineProperty($__2, "next", {
    value: function() {
      var iterator = toObject(this);
      var array = iterator.iteratorObject_;
      if (!array) {
        throw new TypeError('Object is not an ArrayIterator');
      }
      var index = iterator.arrayIteratorNextIndex_;
      var itemKind = iterator.arrayIterationKind_;
      var length = toUint32(array.length);
      if (index >= length) {
        iterator.arrayIteratorNextIndex_ = Infinity;
        return createIteratorResultObject(undefined, true);
      }
      iterator.arrayIteratorNextIndex_ = index + 1;
      if (itemKind == ARRAY_ITERATOR_KIND_VALUES)
        return createIteratorResultObject(array[index], false);
      if (itemKind == ARRAY_ITERATOR_KIND_ENTRIES)
        return createIteratorResultObject([index, array[index]], false);
      return createIteratorResultObject(index, false);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__2, Symbol.iterator, {
    value: function() {
      return this;
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), $__2), {});
  function createArrayIterator(array, kind) {
    var object = toObject(array);
    var iterator = new ArrayIterator;
    iterator.iteratorObject_ = object;
    iterator.arrayIteratorNextIndex_ = 0;
    iterator.arrayIterationKind_ = kind;
    return iterator;
  }
  function entries() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_ENTRIES);
  }
  function keys() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_KEYS);
  }
  function values() {
    return createArrayIterator(this, ARRAY_ITERATOR_KIND_VALUES);
  }
  return {
    get entries() {
      return entries;
    },
    get keys() {
      return keys;
    },
    get values() {
      return values;
    }
  };
});
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Array.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Array.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/ArrayIterator.js"),
      entries = $__0.entries,
      keys = $__0.keys,
      values = $__0.values;
  var $__1 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      checkIterable = $__1.checkIterable,
      isCallable = $__1.isCallable,
      isConstructor = $__1.isConstructor,
      maybeAddFunctions = $__1.maybeAddFunctions,
      maybeAddIterator = $__1.maybeAddIterator,
      registerPolyfill = $__1.registerPolyfill,
      toInteger = $__1.toInteger,
      toLength = $__1.toLength,
      toObject = $__1.toObject;
  function from(arrLike) {
    var mapFn = arguments[1];
    var thisArg = arguments[2];
    var C = this;
    var items = toObject(arrLike);
    var mapping = mapFn !== undefined;
    var k = 0;
    var arr,
        len;
    if (mapping && !isCallable(mapFn)) {
      throw TypeError();
    }
    if (checkIterable(items)) {
      arr = isConstructor(C) ? new C() : [];
      for (var $__2 = items[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__3; !($__3 = $__2.next()).done; ) {
        var item = $__3.value;
        {
          if (mapping) {
            arr[k] = mapFn.call(thisArg, item, k);
          } else {
            arr[k] = item;
          }
          k++;
        }
      }
      arr.length = k;
      return arr;
    }
    len = toLength(items.length);
    arr = isConstructor(C) ? new C(len) : new Array(len);
    for (; k < len; k++) {
      if (mapping) {
        arr[k] = typeof thisArg === 'undefined' ? mapFn(items[k], k) : mapFn.call(thisArg, items[k], k);
      } else {
        arr[k] = items[k];
      }
    }
    arr.length = len;
    return arr;
  }
  function of() {
    for (var items = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      items[$__4] = arguments[$__4];
    var C = this;
    var len = items.length;
    var arr = isConstructor(C) ? new C(len) : new Array(len);
    for (var k = 0; k < len; k++) {
      arr[k] = items[k];
    }
    arr.length = len;
    return arr;
  }
  function fill(value) {
    var start = arguments[1] !== (void 0) ? arguments[1] : 0;
    var end = arguments[2];
    var object = toObject(this);
    var len = toLength(object.length);
    var fillStart = toInteger(start);
    var fillEnd = end !== undefined ? toInteger(end) : len;
    fillStart = fillStart < 0 ? Math.max(len + fillStart, 0) : Math.min(fillStart, len);
    fillEnd = fillEnd < 0 ? Math.max(len + fillEnd, 0) : Math.min(fillEnd, len);
    while (fillStart < fillEnd) {
      object[fillStart] = value;
      fillStart++;
    }
    return object;
  }
  function find(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg);
  }
  function findIndex(predicate) {
    var thisArg = arguments[1];
    return findHelper(this, predicate, thisArg, true);
  }
  function findHelper(self, predicate) {
    var thisArg = arguments[2];
    var returnIndex = arguments[3] !== (void 0) ? arguments[3] : false;
    var object = toObject(self);
    var len = toLength(object.length);
    if (!isCallable(predicate)) {
      throw TypeError();
    }
    for (var i = 0; i < len; i++) {
      var value = object[i];
      if (predicate.call(thisArg, value, i, object)) {
        return returnIndex ? i : value;
      }
    }
    return returnIndex ? -1 : undefined;
  }
  function polyfillArray(global) {
    var $__5 = global,
        Array = $__5.Array,
        Object = $__5.Object,
        Symbol = $__5.Symbol;
    maybeAddFunctions(Array.prototype, ['entries', entries, 'keys', keys, 'values', values, 'fill', fill, 'find', find, 'findIndex', findIndex]);
    maybeAddFunctions(Array, ['from', from, 'of', of]);
    maybeAddIterator(Array.prototype, values, Symbol);
    maybeAddIterator(Object.getPrototypeOf([].values()), function() {
      return this;
    }, Symbol);
  }
  registerPolyfill(polyfillArray);
  return {
    get from() {
      return from;
    },
    get of() {
      return of;
    },
    get fill() {
      return fill;
    },
    get find() {
      return find;
    },
    get findIndex() {
      return findIndex;
    },
    get polyfillArray() {
      return polyfillArray;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Array.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Object.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Object.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill;
  var $__1 = $traceurRuntime,
      defineProperty = $__1.defineProperty,
      getOwnPropertyDescriptor = $__1.getOwnPropertyDescriptor,
      getOwnPropertyNames = $__1.getOwnPropertyNames,
      isPrivateName = $__1.isPrivateName,
      keys = $__1.keys;
  function is(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    return left !== left && right !== right;
  }
  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      var props = source == null ? [] : keys(source);
      var p,
          length = props.length;
      for (p = 0; p < length; p++) {
        var name = props[p];
        if (isPrivateName(name))
          continue;
        target[name] = source[name];
      }
    }
    return target;
  }
  function mixin(target, source) {
    var props = getOwnPropertyNames(source);
    var p,
        descriptor,
        length = props.length;
    for (p = 0; p < length; p++) {
      var name = props[p];
      if (isPrivateName(name))
        continue;
      descriptor = getOwnPropertyDescriptor(source, props[p]);
      defineProperty(target, props[p], descriptor);
    }
    return target;
  }
  function polyfillObject(global) {
    var Object = global.Object;
    maybeAddFunctions(Object, ['assign', assign, 'is', is, 'mixin', mixin]);
  }
  registerPolyfill(polyfillObject);
  return {
    get is() {
      return is;
    },
    get assign() {
      return assign;
    },
    get mixin() {
      return mixin;
    },
    get polyfillObject() {
      return polyfillObject;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Object.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/Number.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/Number.js";
  var $__0 = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js"),
      isNumber = $__0.isNumber,
      maybeAddConsts = $__0.maybeAddConsts,
      maybeAddFunctions = $__0.maybeAddFunctions,
      registerPolyfill = $__0.registerPolyfill,
      toInteger = $__0.toInteger;
  var $abs = Math.abs;
  var $isFinite = isFinite;
  var $isNaN = isNaN;
  var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
  var MIN_SAFE_INTEGER = -Math.pow(2, 53) + 1;
  var EPSILON = Math.pow(2, -52);
  function NumberIsFinite(number) {
    return isNumber(number) && $isFinite(number);
  }
  ;
  function isInteger(number) {
    return NumberIsFinite(number) && toInteger(number) === number;
  }
  function NumberIsNaN(number) {
    return isNumber(number) && $isNaN(number);
  }
  ;
  function isSafeInteger(number) {
    if (NumberIsFinite(number)) {
      var integral = toInteger(number);
      if (integral === number)
        return $abs(integral) <= MAX_SAFE_INTEGER;
    }
    return false;
  }
  function polyfillNumber(global) {
    var Number = global.Number;
    maybeAddConsts(Number, ['MAX_SAFE_INTEGER', MAX_SAFE_INTEGER, 'MIN_SAFE_INTEGER', MIN_SAFE_INTEGER, 'EPSILON', EPSILON]);
    maybeAddFunctions(Number, ['isFinite', NumberIsFinite, 'isInteger', isInteger, 'isNaN', NumberIsNaN, 'isSafeInteger', isSafeInteger]);
  }
  registerPolyfill(polyfillNumber);
  return {
    get MAX_SAFE_INTEGER() {
      return MAX_SAFE_INTEGER;
    },
    get MIN_SAFE_INTEGER() {
      return MIN_SAFE_INTEGER;
    },
    get EPSILON() {
      return EPSILON;
    },
    get isFinite() {
      return NumberIsFinite;
    },
    get isInteger() {
      return isInteger;
    },
    get isNaN() {
      return NumberIsNaN;
    },
    get isSafeInteger() {
      return isSafeInteger;
    },
    get polyfillNumber() {
      return polyfillNumber;
    }
  };
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/Number.js" + '');
System.registerModule("traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js", [], function() {
  "use strict";
  var __moduleName = "traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js";
  var polyfillAll = System.get("traceur-runtime@0.0.79/src/runtime/polyfills/utils.js").polyfillAll;
  polyfillAll(Reflect.global);
  var setupGlobals = $traceurRuntime.setupGlobals;
  $traceurRuntime.setupGlobals = function(global) {
    setupGlobals(global);
    polyfillAll(global);
  };
  return {};
});
System.get("traceur-runtime@0.0.79/src/runtime/polyfills/polyfills.js" + '');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":27,"path":26}]},{},[28,20])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL29wdC9ub2RlanMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdmljdG9yL2luZGV4LmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvQnVmZi5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzQiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9GbG9vci5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL0dyYXBoaWMuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xMCIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL2JhbGwuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9jdXJzb3IuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNSIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL2VuZW15LmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvZ2FtZW1hcC5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci84IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzkiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy9pY29uLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvdG93ZXIvRmlyZUJvbHQuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy90b3dlci9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL3Rvd2VyL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvdG93ZXIvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzciLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9jbGFzcy90b3dlci9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvNiIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL3Rvd2VyL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvdG93ZXIvSWNlQm9sdC5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL2NsYXNzL3Rvd2VyL1Rvd2VyLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvdG93ZXIvVG93ZXJGaXJlLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvY2xhc3MvdG93ZXIvVG93ZXJJY2UuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9lbmdpbmUuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGFuL3Rvd2VyX2RlZmVuY2Uvc3JjL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL1RlY2hUcmVlLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8xIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8zIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci83IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci82IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL0B0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci80IiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9sYW4vdG93ZXJfZGVmZW5jZS9zcmMvZ3VpL1Rvd2VyVUkuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9ndWkvQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzUiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9ndWkvV2luZG93LmpzIiwic3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9sZXZlbHMvbGV2ZWwxLmpzb24iLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xhbi90b3dlcl9kZWZlbmNlL3NyYy9tYWluLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9saWJyYXJ5L0NvbGxpc2lvbkRldGVjdGlvbi5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGlicmFyeS9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMSIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGlicmFyeS9AdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMiIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGlicmFyeS9FYXNpbmdGdW5jdGlvbnMuanMiLCIvaG9tZS96YWNoL3d3dy9NdWx0aVBsYXkvbGFuX2dhbWUvc3JjL2xpYnJhcnkvR3VpZC5qcyIsIi9ob21lL3phY2gvd3d3L011bHRpUGxheS9sYW5fZ2FtZS9zcmMvbGlicmFyeS9Tb2NrZXRDb21tYW5kLmpzIiwiL2hvbWUvemFjaC93d3cvTXVsdGlQbGF5L2xhbl9nYW1lL3NyYy9saWJyYXJ5L1ZlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL29wdC9ub2RlanMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wYXRoLWJyb3dzZXJpZnkvaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9vcHQvbm9kZWpzL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vb3B0L25vZGVqcy9saWIvbm9kZV9tb2R1bGVzL2VzNmlmeS9ub2RlX21vZHVsZXMvdHJhY2V1ci9iaW4vdHJhY2V1ci1ydW50aW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1eUNBO0FBQUEsQUFBTSxFQUFBLENBQUEsSUFBRyxFQUFJLENBQUEsT0FBTSxBQUFDLENBQUMsUUFBTyxDQUFDLENBQUE7QUNBN0IsQUFBSSxFQUFBLE9ERUosU0FBTSxLQUFHLENBQ0ssT0FBTSxDQUFHO0FBQ25CLEFBQU0sSUFBQSxDQUFBLFFBQU8sRUFBSTtBQUNmLE9BQUcsQ0FBRyxNQUFJ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QUF6QixVQUEyQixNQUFLLENBQUcsQ0FBQSxJQUFHLENBQUc7QUFDdkMsQUFBSSxNQUFBLENBQUEsS0FBSSxFQUFJLENBQUEsSUFBRyxJQUFJLEFBQUMsQ0FBQyxNQUFLLEVBQUUsRUFBSSxDQUFBLElBQUcsRUFBRSxDQUFBLENBQUksQ0FBQSxJQUFHLE1BQU0sRUFBSSxFQUFBLENBQUMsQ0FBQztBQUN4RCxBQUFJLE1BQUEsQ0FBQSxLQUFJLEVBQUksQ0FBQSxJQUFHLElBQUksQUFBQyxDQUFDLE1BQUssRUFBRSxFQUFJLENBQUEsSUFBRyxFQUFFLENBQUEsQ0FBSSxDQUFBLElBQUcsT0FBTyxFQUFJLEVBQUEsQ0FBQyxDQUFDO0FBRXpELE9BQUksS0FBSSxFQUFJLEVBQUMsSUFBRyxNQUFNLEVBQUksRUFBQSxDQUFBLENBQUksQ0FBQSxNQUFLLE9BQU8sQ0FBQyxDQUFHO0FBQUUsV0FBTyxNQUFJLENBQUM7SUFBRTtBQUFBLEFBQzlELE9BQUksS0FBSSxFQUFJLEVBQUMsSUFBRyxPQUFPLEVBQUksRUFBQSxDQUFBLENBQUksQ0FBQSxNQUFLLE9BQU8sQ0FBQyxDQUFHO0FBQUUsV0FBTyxNQUFJLENBQUM7SUFBRTtBQUFBLEFBRS9ELE9BQUksS0FBSSxHQUFLLEVBQUMsSUFBRyxNQUFNLEVBQUksRUFBQSxDQUFDLENBQUc7QUFBRSxXQUFPLEtBQUcsQ0FBQztJQUFFO0FBQUEsQUFDOUMsT0FBSSxLQUFJLEdBQUssRUFBQyxJQUFHLE9BQU8sRUFBSSxFQUFBLENBQUMsQ0FBRztBQUFFLFdBQU8sS0FBRyxDQUFDO0lBQUU7QUFBQSxBQUUzQyxNQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxFQUFJLENBQUEsSUFBRyxNQUFNLEVBQUksRUFBQSxDQUFDO0FBQy9CLEFBQUksTUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEtBQUksRUFBSSxDQUFBLElBQUcsT0FBTyxFQUFJLEVBQUEsQ0FBQztBQUNoQyxTQUFPLEVBQUMsRUFBQyxFQUFJLEdBQUMsQ0FBQSxDQUFJLENBQUEsRUFBQyxFQUFJLEdBQUMs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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gVmljdG9yO1xuXG4vKipcbiAqICMgVmljdG9yIC0gQSBKYXZhU2NyaXB0IDJEIHZlY3RvciBjbGFzcyB3aXRoIG1ldGhvZHMgZm9yIGNvbW1vbiB2ZWN0b3Igb3BlcmF0aW9uc1xuICovXG5cbi8qKlxuICogQ29uc3RydWN0b3IuIFdpbGwgYWxzbyB3b3JrIHdpdGhvdXQgdGhlIGBuZXdgIGtleXdvcmRcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gVmljdG9yKDQyLCAxMzM3KTtcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBWYWx1ZSBvZiB0aGUgeCBheGlzXG4gKiBAcGFyYW0ge051bWJlcn0geSBWYWx1ZSBvZiB0aGUgeSBheGlzXG4gKiBAcmV0dXJuIHtWaWN0b3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBWaWN0b3IgKHgsIHkpIHtcblx0aWYgKCEodGhpcyBpbnN0YW5jZW9mIFZpY3RvcikpIHtcblx0XHRyZXR1cm4gbmV3IFZpY3Rvcih4LCB5KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgWCBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLng7XG5cdCAqICAgICAvLyA9PiA0MlxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy54ID0geCB8fCAwO1xuXG5cdC8qKlxuXHQgKiBUaGUgWSBheGlzXG5cdCAqXG5cdCAqICMjIyBFeGFtcGxlczpcblx0ICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yLmZyb21BcnJheSg0MiwgMjEpO1xuXHQgKlxuXHQgKiAgICAgdmVjLnk7XG5cdCAqICAgICAvLyA9PiAyMVxuXHQgKlxuXHQgKiBAYXBpIHB1YmxpY1xuXHQgKi9cblx0dGhpcy55ID0geSB8fCAwO1xufTtcblxuLyoqXG4gKiAjIFN0YXRpY1xuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBmcm9tIGFuIGFycmF5XG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBWaWN0b3IuZnJvbUFycmF5KFs0MiwgMjFdKTtcbiAqXG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDo0MiwgeToyMVxuICpcbiAqIEBuYW1lIFZpY3Rvci5mcm9tQXJyYXlcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEFycmF5IHdpdGggdGhlIHggYW5kIHkgdmFsdWVzIGF0IGluZGV4IDAgYW5kIDEgcmVzcGVjdGl2ZWx5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IFRoZSBuZXcgaW5zdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5mcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG5cdHJldHVybiBuZXcgVmljdG9yKGFyclswXSB8fCAwLCBhcnJbMV0gfHwgMCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UgZnJvbSBhbiBvYmplY3RcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IFZpY3Rvci5mcm9tT2JqZWN0KHsgeDogNDIsIHk6IDIxIH0pO1xuICpcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjQyLCB5OjIxXG4gKlxuICogQG5hbWUgVmljdG9yLmZyb21PYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogT2JqZWN0IHdpdGggdGhlIHZhbHVlcyBmb3IgeCBhbmQgeVxuICogQHJldHVybiB7VmljdG9yfSBUaGUgbmV3IGluc3RhbmNlXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IuZnJvbU9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcblx0cmV0dXJuIG5ldyBWaWN0b3Iob2JqLnggfHwgMCwgb2JqLnkgfHwgMCk7XG59O1xuXG4vKipcbiAqICMgTWFuaXB1bGF0aW9uXG4gKlxuICogVGhlc2UgZnVuY3Rpb25zIGFyZSBjaGFpbmFibGUuXG4gKi9cblxuLyoqXG4gKiBBZGRzIGFub3RoZXIgdmVjdG9yJ3MgWCBheGlzIHRvIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMzApO1xuICpcbiAqICAgICB2ZWMxLmFkZFgodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6MTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZFggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueCArPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW5vdGhlciB2ZWN0b3IncyBZIGF4aXMgdG8gdGhpcyBvbmVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuYWRkWSh2ZWMyKTtcbiAqICAgICB2ZWMxLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeTo0MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvciB5b3Ugd2FudCB0byBhZGQgdG8gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkWSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy55ICs9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbm90aGVyIHZlY3RvciB0byB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5hZGQodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MzAsIHk6NDBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gYWRkIHRvIHRoaXMgb25lXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54ICs9IHZlYy54O1xuXHR0aGlzLnkgKz0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gYm90aCB2ZWN0b3IgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAzLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCArPSBzY2FsYXI7XG5cdHRoaXMueSArPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBnaXZlbiBzY2FsYXIgdG8gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxLCAyKTtcbiAqXG4gKiAgICAgdmVjLmFkZFNjYWxhclgoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMywgeTogMlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBhZGRcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuYWRkU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54ICs9IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgdGhlIGdpdmVuIHNjYWxhciB0byB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEsIDIpO1xuICpcbiAqICAgICB2ZWMuYWRkU2NhbGFyWSgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OiAxLCB5OiA0XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxhciBUaGUgc2NhbGFyIHRvIGFkZFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hZGRTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgKz0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBYIGF4aXMgb2YgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3RYKHZlYzIpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjgwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggLT0gdmVjLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIFkgYXhpcyBvZiBhbm90aGVyIHZlY3RvciBmcm9tIHRoaXMgb25lXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAsIDMwKTtcbiAqXG4gKiAgICAgdmVjMS5zdWJ0cmFjdFkodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjIwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IHN1YnRyYWN0IGZyb20gdGhpcyBvbmVcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RZID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgYW5vdGhlciB2ZWN0b3IgZnJvbSB0aGlzIG9uZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAzMCk7XG4gKlxuICogICAgIHZlYzEuc3VidHJhY3QodmVjMik7XG4gKiAgICAgdmVjMS50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6ODAsIHk6MjBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgc3VidHJhY3QgZnJvbSB0aGlzIG9uZVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dGhpcy54IC09IHZlYy54O1xuXHR0aGlzLnkgLT0gdmVjLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdGhlIGdpdmVuIHNjYWxhciBmcm9tIGJvdGggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhcigyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogODAsIHk6IDE4MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsYXIgVGhlIHNjYWxhciB0byBzdWJ0cmFjdFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5zdWJ0cmFjdFNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0dGhpcy54IC09IHNjYWxhcjtcblx0dGhpcy55IC09IHNjYWxhcjtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFN1YnRyYWN0cyB0aGUgZ2l2ZW4gc2NhbGFyIGZyb20gdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYy5zdWJ0cmFjdFNjYWxhclgoMjApO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6IDgwLCB5OiAyMDBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU3VidHJhY3RzIHRoZSBnaXZlbiBzY2FsYXIgZnJvbSB0aGUgWSBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMjAwKTtcbiAqXG4gKiAgICAgdmVjLnN1YnRyYWN0U2NhbGFyWSgyMCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDogMTAwLCB5OiAxODBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGFyIFRoZSBzY2FsYXIgdG8gc3VidHJhY3RcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuc3VidHJhY3RTY2FsYXJZID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnkgLT0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSB4IGNvbXBvbmVudCBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDApO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlWCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVYID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggLz0gdmVjdG9yLng7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIHRoZSBZIGF4aXMgYnkgdGhlIHkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5kaXZpZGVZKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgb3RoZXIgdmVjdG9yIHlvdSB3YW50IGRpdmlkZSBieVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXZpZGVZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgYSBheGlzIHZhbHVlcyBvZiBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMuZGl2aWRlKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6MjVcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSB2ZWN0b3IgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54IC89IHZlY3Rvci54O1xuXHR0aGlzLnkgLz0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBEaXZpZGVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhciB2YWx1ZVxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmRpdmlkZVNjYWxhcigyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjUwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhciA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdFx0dGhpcy55IC89IHNjYWxhcjtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnggPSAwO1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWCBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJYKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gVGhlIHNjYWxhciB0byBkaXZpZGUgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGl2aWRlU2NhbGFyWCA9IGZ1bmN0aW9uIChzY2FsYXIpIHtcblx0aWYgKHNjYWxhciAhPT0gMCkge1xuXHRcdHRoaXMueCAvPSBzY2FsYXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhpcy54ID0gMDtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRGl2aWRlcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5kaXZpZGVTY2FsYXJZKDIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjI1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gZGl2aWRlIGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmRpdmlkZVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdGlmIChzY2FsYXIgIT09IDApIHtcblx0XHR0aGlzLnkgLz0gc2NhbGFyO1xuXHR9IGVsc2Uge1xuXHRcdHRoaXMueSA9IDA7XG5cdH1cblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFggYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFgoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4Oi0xMDAsIHk6NTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFggPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueCAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgdGhlIFkgYXhpc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLmludmVydFkoKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTotNTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmludmVydFkgPSBmdW5jdGlvbiAoKSB7XG5cdHRoaXMueSAqPSAtMTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEludmVydHMgYm90aCBheGlzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMuaW52ZXJ0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDotMTAwLCB5Oi01MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaW52ZXJ0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLmludmVydFgoKTtcblx0dGhpcy5pbnZlcnRZKCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgWCBjb21wb25lbnQgb2YgZ2l2ZW4gdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyLCAwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5WCh2ZWMyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHZlY3RvciB0byBtdWx0aXBseSB0aGUgYXhpcyB3aXRoXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5WCA9IGZ1bmN0aW9uICh2ZWN0b3IpIHtcblx0dGhpcy54ICo9IHZlY3Rvci54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IFkgY29tcG9uZW50IG9mIGdpdmVuIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMCwgMik7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVgodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlZID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnkgKj0gdmVjdG9yLnk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIGJvdGggdmVjdG9yIGF4aXMgYnkgdmFsdWVzIGZyb20gYSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIsIDIpO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHkodmVjMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgdmVjdG9yIHRvIG11bHRpcGx5IGJ5XG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gKHZlY3Rvcikge1xuXHR0aGlzLnggKj0gdmVjdG9yLng7XG5cdHRoaXMueSAqPSB2ZWN0b3IueTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIE11bHRpcGxpZXMgYm90aCB2ZWN0b3IgYXhpcyBieSB0aGUgZ2l2ZW4gc2NhbGFyIHZhbHVlXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMubXVsdGlwbHlTY2FsYXIoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoyMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgYnlcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXIgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueCAqPSBzY2FsYXI7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBNdWx0aXBsaWVzIHRoZSBYIGF4aXMgYnkgdGhlIGdpdmVuIHNjYWxhclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLm11bHRpcGx5U2NhbGFyWCgyKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwMCwgeTo1MFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBUaGUgc2NhbGFyIHRvIG11bHRpcGx5IHRoZSBheGlzIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubXVsdGlwbHlTY2FsYXJYID0gZnVuY3Rpb24gKHNjYWxhcikge1xuXHR0aGlzLnggKj0gc2NhbGFyO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogTXVsdGlwbGllcyB0aGUgWSBheGlzIGJ5IHRoZSBnaXZlbiBzY2FsYXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5tdWx0aXBseVNjYWxhclkoMik7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6MTAwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IFRoZSBzY2FsYXIgdG8gbXVsdGlwbHkgdGhlIGF4aXMgd2l0aFxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5tdWx0aXBseVNjYWxhclkgPSBmdW5jdGlvbiAoc2NhbGFyKSB7XG5cdHRoaXMueSAqPSBzY2FsYXI7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBOb3JtYWxpemVcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0aWYgKGxlbmd0aCA9PT0gMCkge1xuXHRcdHRoaXMueCA9IDE7XG5cdFx0dGhpcy55ID0gMDtcblx0fSBlbHNlIHtcblx0XHR0aGlzLmRpdmlkZShWaWN0b3IobGVuZ3RoLCBsZW5ndGgpKTtcblx0fVxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUubm9ybSA9IFZpY3Rvci5wcm90b3R5cGUubm9ybWFsaXplO1xuXG4vKipcbiAqIElmIHRoZSBhYnNvbHV0ZSB2ZWN0b3IgYXhpcyBpcyBncmVhdGVyIHRoYW4gYG1heGAsIG11bHRpcGxpZXMgdGhlIGF4aXMgYnkgYGZhY3RvcmBcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5saW1pdCg4MCwgMC45KTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjkwLCB5OjUwXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1heCBUaGUgbWF4aW11bSB2YWx1ZSBmb3IgYm90aCB4IGFuZCB5IGF4aXNcbiAqIEBwYXJhbSB7TnVtYmVyfSBmYWN0b3IgRmFjdG9yIGJ5IHdoaWNoIHRoZSBheGlzIGFyZSB0byBiZSBtdWx0aXBsaWVkIHdpdGhcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGltaXQgPSBmdW5jdGlvbiAobWF4LCBmYWN0b3IpIHtcblx0aWYgKE1hdGguYWJzKHRoaXMueCkgPiBtYXgpeyB0aGlzLnggKj0gZmFjdG9yOyB9XG5cdGlmIChNYXRoLmFicyh0aGlzLnkpID4gbWF4KXsgdGhpcy55ICo9IGZhY3RvcjsgfVxuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyBib3RoIHZlY3RvciBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZShuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NjcsIHk6NzNcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR0aGlzLnJhbmRvbWl6ZVgodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21pemVzIHRoZSB5IGF4aXMgd2l0aCBhIHZhbHVlIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplWChuZXcgVmljdG9yKDUwLCA2MCksIG5ldyBWaWN0b3IoNzAsIDgwYCkpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTUsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdG9wTGVmdCBmaXJzdCB2ZWN0b3JcbiAqIEBwYXJhbSB7VmljdG9yfSBib3R0b21SaWdodCBzZWNvbmQgdmVjdG9yXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnJhbmRvbWl6ZVggPSBmdW5jdGlvbiAodG9wTGVmdCwgYm90dG9tUmlnaHQpIHtcblx0dmFyIG1pbiA9IE1hdGgubWluKHRvcExlZnQueCwgYm90dG9tUmlnaHQueCk7XG5cdHZhciBtYXggPSBNYXRoLm1heCh0b3BMZWZ0LngsIGJvdHRvbVJpZ2h0LngpO1xuXHR0aGlzLnggPSByYW5kb20obWluLCBtYXgpO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmFuZG9taXplcyB0aGUgeSBheGlzIHdpdGggYSB2YWx1ZSBiZXR3ZWVuIDIgdmVjdG9yc1xuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqXG4gKiAgICAgdmVjLnJhbmRvbWl6ZVkobmV3IFZpY3Rvcig1MCwgNjApLCBuZXcgVmljdG9yKDcwLCA4MGApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo2NlxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplWSA9IGZ1bmN0aW9uICh0b3BMZWZ0LCBib3R0b21SaWdodCkge1xuXHR2YXIgbWluID0gTWF0aC5taW4odG9wTGVmdC55LCBib3R0b21SaWdodC55KTtcblx0dmFyIG1heCA9IE1hdGgubWF4KHRvcExlZnQueSwgYm90dG9tUmlnaHQueSk7XG5cdHRoaXMueSA9IHJhbmRvbShtaW4sIG1heCk7XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSYW5kb21seSByYW5kb21pemVzIGVpdGhlciBheGlzIGJldHdlZW4gMiB2ZWN0b3JzXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICpcbiAqICAgICB2ZWMucmFuZG9taXplQW55KG5ldyBWaWN0b3IoNTAsIDYwKSwgbmV3IFZpY3Rvcig3MCwgODApKTtcbiAqICAgICB2ZWMudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjEwMCwgeTo3N1xuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB0b3BMZWZ0IGZpcnN0IHZlY3RvclxuICogQHBhcmFtIHtWaWN0b3J9IGJvdHRvbVJpZ2h0IHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUucmFuZG9taXplQW55ID0gZnVuY3Rpb24gKHRvcExlZnQsIGJvdHRvbVJpZ2h0KSB7XG5cdGlmICghISBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkpKSB7XG5cdFx0dGhpcy5yYW5kb21pemVYKHRvcExlZnQsIGJvdHRvbVJpZ2h0KTtcblx0fSBlbHNlIHtcblx0XHR0aGlzLnJhbmRvbWl6ZVkodG9wTGVmdCwgYm90dG9tUmlnaHQpO1xuXHR9XG5cdHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSb3VuZHMgYm90aCBheGlzIHRvIGFuIGludGVnZXIgdmFsdWVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLjIsIDUwLjkpO1xuICpcbiAqICAgICB2ZWMudW5mbG9hdCgpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjUxXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS51bmZsb2F0ID0gZnVuY3Rpb24gKCkge1xuXHR0aGlzLnggPSBNYXRoLnJvdW5kKHRoaXMueCk7XG5cdHRoaXMueSA9IE1hdGgucm91bmQodGhpcy55KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJvdW5kcyBib3RoIGF4aXMgdG8gYSBjZXJ0YWluIHByZWNpc2lvblxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMDAuMiwgNTAuOSk7XG4gKlxuICogICAgIHZlYy51bmZsb2F0KCk7XG4gKiAgICAgdmVjLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMDAsIHk6NTFcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gUHJlY2lzaW9uIChkZWZhdWx0OiA4KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b0ZpeGVkID0gZnVuY3Rpb24gKHByZWNpc2lvbikge1xuXHRpZiAodHlwZW9mIHByZWNpc2lvbiA9PT0gJ3VuZGVmaW5lZCcpIHsgcHJlY2lzaW9uID0gODsgfVxuXHR0aGlzLnggPSB0aGlzLngudG9GaXhlZChwcmVjaXNpb24pO1xuXHR0aGlzLnkgPSB0aGlzLnkudG9GaXhlZChwcmVjaXNpb24pO1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBYIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhYID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueCA9ICgxIC0gYW1vdW50KSAqIHRoaXMueCArIGFtb3VudCAqIHZlYy54O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIG9mIHRoZSBZIGF4aXMgdG93YXJkcyBhbm90aGVyIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCAxMDApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDIwMCk7XG4gKlxuICogICAgIHZlYzEubWl4WSh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXhZID0gZnVuY3Rpb24gKHZlYywgYW1vdW50KSB7XG5cdGlmICh0eXBlb2YgYW1vdW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdGFtb3VudCA9IDAuNTtcblx0fVxuXG5cdHRoaXMueSA9ICgxIC0gYW1vdW50KSAqIHRoaXMueSArIGFtb3VudCAqIHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgYmxlbmQgLyBpbnRlcnBvbGF0aW9uIHRvd2FyZHMgYW5vdGhlciB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCAyMDApO1xuICpcbiAqICAgICB2ZWMxLm1peCh2ZWMyLCAwLjUpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTUwLCB5OjE1MFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIG90aGVyIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IGFtb3VudCBUaGUgYmxlbmQgYW1vdW50IChvcHRpb25hbCwgZGVmYXVsdDogMC41KVxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5taXggPSBmdW5jdGlvbiAodmVjLCBhbW91bnQpIHtcblx0dGhpcy5taXhYKHZlYywgYW1vdW50KTtcblx0dGhpcy5taXhZKHZlYywgYW1vdW50KTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqICMgUHJvZHVjdHNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGlzIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAsIDEwKTtcbiAqICAgICB2YXIgdmVjMiA9IHZlYzEuY2xvbmUoKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IEEgY2xvbmUgb2YgdGhlIHZlY3RvclxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIG5ldyBWaWN0b3IodGhpcy54LCB0aGlzLnkpO1xufTtcblxuLyoqXG4gKiBDb3BpZXMgYW5vdGhlciB2ZWN0b3IncyBYIGNvbXBvbmVudCBpbiB0byBpdHMgb3duXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMCwgMjApO1xuICogICAgIHZhciB2ZWMyID0gdmVjMS5jb3B5WCh2ZWMxKTtcbiAqXG4gKiAgICAgdmVjMi50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MjAsIHk6MTBcbiAqXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmNvcHlYID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLnggPSB2ZWMueDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENvcGllcyBhbm90aGVyIHZlY3RvcidzIFkgY29tcG9uZW50IGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHlZKHZlYzEpO1xuICpcbiAqICAgICB2ZWMyLnRvU3RyaW5nKCk7XG4gKiAgICAgLy8gPT4geDoxMCwgeToyMFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuY29weVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHRoaXMueSA9IHZlYy55O1xuXHRyZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ29waWVzIGFub3RoZXIgdmVjdG9yJ3MgWCBhbmQgWSBjb21wb25lbnRzIGluIHRvIGl0cyBvd25cbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwLCAxMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwLCAyMCk7XG4gKiAgICAgdmFyIHZlYzIgPSB2ZWMxLmNvcHkodmVjMSk7XG4gKlxuICogICAgIHZlYzIudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjIwLCB5OjIwXG4gKlxuICogQHJldHVybiB7VmljdG9yfSBgdGhpc2AgZm9yIGNoYWluaW5nIGNhcGFiaWxpdGllc1xuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHZlYykge1xuXHR0aGlzLmNvcHlYKHZlYyk7XG5cdHRoaXMuY29weVkodmVjKTtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIHZlY3RvciB0byB6ZXJvICgwLDApXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMCwgMTApO1xuICpcdFx0IHZhcjEuemVybygpO1xuICogICAgIHZlYzEudG9TdHJpbmcoKTtcbiAqICAgICAvLyA9PiB4OjAsIHk6MFxuICpcbiAqIEByZXR1cm4ge1ZpY3Rvcn0gYHRoaXNgIGZvciBjaGFpbmluZyBjYXBhYmlsaXRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuemVybyA9IGZ1bmN0aW9uICgpIHtcblx0dGhpcy54ID0gdGhpcy55ID0gMDtcblx0cmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZG90KHZlYzIpO1xuICogICAgIC8vID0+IDIzMDAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEb3QgcHJvZHVjdFxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kb3QgPSBmdW5jdGlvbiAodmVjMikge1xuXHRyZXR1cm4gdGhpcy54ICogdmVjMi54ICsgdGhpcy55ICogdmVjMi55O1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5jcm9zcyA9IGZ1bmN0aW9uICh2ZWMyKSB7XG5cdHJldHVybiAodGhpcy54ICogdmVjMi55ICkgLSAodGhpcy55ICogdmVjMi54ICk7XG59O1xuXG4vKipcbiAqIFByb2plY3RzIGEgdmVjdG9yIG9udG8gYW5vdGhlciB2ZWN0b3IsIHNldHRpbmcgaXRzZWxmIHRvIHRoZSByZXN1bHQuXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwMCwgMCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgMTAwKTtcbiAqXG4gKiAgICAgdmVjLnByb2plY3RPbnRvKHZlYzIpO1xuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6NTAsIHk6NTBcbiAqXG4gKiBAcGFyYW0ge1ZpY3Rvcn0gdmVjdG9yIFRoZSBvdGhlciB2ZWN0b3IgeW91IHdhbnQgdG8gcHJvamVjdCB0aGlzIHZlY3RvciBvbnRvXG4gKiBAcmV0dXJuIHtWaWN0b3J9IGB0aGlzYCBmb3IgY2hhaW5pbmcgY2FwYWJpbGl0aWVzXG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnByb2plY3RPbnRvID0gZnVuY3Rpb24gKHZlYzIpIHtcbiAgICB2YXIgY29lZmYgPSAoICh0aGlzLnggKiB2ZWMyLngpKyh0aGlzLnkgKiB2ZWMyLnkpICkgLyAoKHZlYzIueCp2ZWMyLngpKyh2ZWMyLnkqdmVjMi55KSk7XG4gICAgdGhpcy54ID0gY29lZmYgKiB2ZWMyLng7XG4gICAgdGhpcy55ID0gY29lZmYgKiB2ZWMyLnk7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5cblZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLnksIHRoaXMueCk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmhvcml6b250YWxBbmdsZURlZyA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHJhZGlhbjJkZWdyZWVzKHRoaXMuaG9yaXpvbnRhbEFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS52ZXJ0aWNhbEFuZ2xlID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLngsIHRoaXMueSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnZlcnRpY2FsQW5nbGVEZWcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiByYWRpYW4yZGVncmVlcyh0aGlzLnZlcnRpY2FsQW5nbGUoKSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGU7XG5WaWN0b3IucHJvdG90eXBlLmFuZ2xlRGVnID0gVmljdG9yLnByb3RvdHlwZS5ob3Jpem9udGFsQW5nbGVEZWc7XG5WaWN0b3IucHJvdG90eXBlLmRpcmVjdGlvbiA9IFZpY3Rvci5wcm90b3R5cGUuaG9yaXpvbnRhbEFuZ2xlO1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuXHR2YXIgbnggPSAodGhpcy54ICogTWF0aC5jb3MoYW5nbGUpKSAtICh0aGlzLnkgKiBNYXRoLnNpbihhbmdsZSkpO1xuXHR2YXIgbnkgPSAodGhpcy54ICogTWF0aC5zaW4oYW5nbGUpKSArICh0aGlzLnkgKiBNYXRoLmNvcyhhbmdsZSkpO1xuXG5cdHRoaXMueCA9IG54O1xuXHR0aGlzLnkgPSBueTtcblxuXHRyZXR1cm4gdGhpcztcbn07XG5cblZpY3Rvci5wcm90b3R5cGUucm90YXRlRGVnID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cdGFuZ2xlID0gZGVncmVlczJyYWRpYW4oYW5nbGUpO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGUoYW5nbGUpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUbyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJldHVybiB0aGlzLnJvdGF0ZShyb3RhdGlvbi10aGlzLmFuZ2xlKCkpO1xufTtcblxuVmljdG9yLnByb3RvdHlwZS5yb3RhdGVUb0RlZyA9IGZ1bmN0aW9uKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVUbyhyb3RhdGlvbik7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5ID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHZhciBhbmdsZSA9IHRoaXMuYW5nbGUoKSArIHJvdGF0aW9uO1xuXG5cdHJldHVybiB0aGlzLnJvdGF0ZShhbmdsZSk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLnJvdGF0ZUJ5RGVnID0gZnVuY3Rpb24gKHJvdGF0aW9uKSB7XG5cdHJvdGF0aW9uID0gZGVncmVlczJyYWRpYW4ocm90YXRpb24pO1xuXHRyZXR1cm4gdGhpcy5yb3RhdGVCeShyb3RhdGlvbik7XG59O1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRpc3RhbmNlIG9mIHRoZSBYIGF4aXMgYmV0d2VlbiB0aGlzIHZlY3RvciBhbmQgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDIwMCwgNjApO1xuICpcbiAqICAgICB2ZWMxLmRpc3RhbmNlWCh2ZWMyKTtcbiAqICAgICAvLyA9PiAtMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBEaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5kaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiB0aGlzLnggLSB2ZWMueDtcbn07XG5cbi8qKlxuICogU2FtZSBhcyBgZGlzdGFuY2VYKClgIGJ1dCBhbHdheXMgcmV0dXJucyBhbiBhYnNvbHV0ZSBudW1iZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5hYnNEaXN0YW5jZVgodmVjMik7XG4gKiAgICAgLy8gPT4gMTAwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVggPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWCh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2Ugb2YgdGhlIFkgYXhpcyBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IC0xMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VZID0gZnVuY3Rpb24gKHZlYykge1xuXHRyZXR1cm4gdGhpcy55IC0gdmVjLnk7XG59O1xuXG4vKipcbiAqIFNhbWUgYXMgYGRpc3RhbmNlWSgpYCBidXQgYWx3YXlzIHJldHVybnMgYW4gYWJzb2x1dGUgbnVtYmVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VZKHZlYzIpO1xuICogICAgIC8vID0+IDEwXG4gKlxuICogQHBhcmFtIHtWaWN0b3J9IHZlY3RvciBUaGUgc2Vjb25kIHZlY3RvclxuICogQHJldHVybiB7TnVtYmVyfSBBYnNvbHV0ZSBkaXN0YW5jZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5hYnNEaXN0YW5jZVkgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLmFicyh0aGlzLmRpc3RhbmNlWSh2ZWMpKTtcbn07XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkZWFuIGRpc3RhbmNlIGJldHdlZW4gdGhpcyB2ZWN0b3IgYW5kIGFub3RoZXJcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYzEgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZhciB2ZWMyID0gbmV3IFZpY3RvcigyMDAsIDYwKTtcbiAqXG4gKiAgICAgdmVjMS5kaXN0YW5jZSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDAuNDk4NzU2MjExMjA4OVxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbiAodmVjKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5kaXN0YW5jZVNxKHZlYykpO1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGVhbiBkaXN0YW5jZSBiZXR3ZWVuIHRoaXMgdmVjdG9yIGFuZCBhbm90aGVyXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMxID0gbmV3IFZpY3RvcigxMDAsIDUwKTtcbiAqICAgICB2YXIgdmVjMiA9IG5ldyBWaWN0b3IoMjAwLCA2MCk7XG4gKlxuICogICAgIHZlYzEuZGlzdGFuY2VTcSh2ZWMyKTtcbiAqICAgICAvLyA9PiAxMDEwMFxuICpcbiAqIEBwYXJhbSB7VmljdG9yfSB2ZWN0b3IgVGhlIHNlY29uZCB2ZWN0b3JcbiAqIEByZXR1cm4ge051bWJlcn0gRGlzdGFuY2VcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuZGlzdGFuY2VTcSA9IGZ1bmN0aW9uICh2ZWMpIHtcblx0dmFyIGR4ID0gdGhpcy5kaXN0YW5jZVgodmVjKSxcblx0XHRkeSA9IHRoaXMuZGlzdGFuY2VZKHZlYyk7XG5cblx0cmV0dXJuIGR4ICogZHggKyBkeSAqIGR5O1xufTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb3IgbWFnbml0dWRlIG9mIHRoZSB2ZWN0b3JcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGgoKTtcbiAqICAgICAvLyA9PiAxMTEuODAzMzk4ODc0OTg5NDhcbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IExlbmd0aCAvIE1hZ25pdHVkZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS5sZW5ndGggPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiBNYXRoLnNxcnQodGhpcy5sZW5ndGhTcSgpKTtcbn07XG5cbi8qKlxuICogU3F1YXJlZCBsZW5ndGggLyBtYWduaXR1ZGVcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKlxuICogICAgIHZlYy5sZW5ndGhTcSgpO1xuICogICAgIC8vID0+IDEyNTAwXG4gKlxuICogQHJldHVybiB7TnVtYmVyfSBMZW5ndGggLyBNYWduaXR1ZGVcbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUubGVuZ3RoU3EgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnk7XG59O1xuXG5WaWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IFZpY3Rvci5wcm90b3R5cGUubGVuZ3RoO1xuXG4vKipcbiAqIFJldHVybnMgYSB0cnVlIGlmIHZlY3RvciBpcyAoMCwgMClcbiAqXG4gKiAjIyMgRXhhbXBsZXM6XG4gKiAgICAgdmFyIHZlYyA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmVjLnplcm8oKTtcbiAqXG4gKiAgICAgLy8gPT4gdHJ1ZVxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gdGhpcy54ID09PSAwICYmIHRoaXMueSA9PT0gMDtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIHRydWUgaWYgdGhpcyB2ZWN0b3IgaXMgdGhlIHNhbWUgYXMgYW5vdGhlclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjMSA9IG5ldyBWaWN0b3IoMTAwLCA1MCk7XG4gKiAgICAgdmFyIHZlYzIgPSBuZXcgVmljdG9yKDEwMCwgNTApO1xuICogICAgIHZlYzEuaXNFcXVhbFRvKHZlYzIpO1xuICpcbiAqICAgICAvLyA9PiB0cnVlXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUuaXNFcXVhbFRvID0gZnVuY3Rpb24odmVjMikge1xuXHRyZXR1cm4gdGhpcy54ID09PSB2ZWMyLnggJiYgdGhpcy55ID09PSB2ZWMyLnk7XG59O1xuXG4vKipcbiAqICMgVXRpbGl0eSBNZXRob2RzXG4gKi9cblxuLyoqXG4gKiBSZXR1cm5zIGFuIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b1N0cmluZygpO1xuICogICAgIC8vID0+IHg6MTAsIHk6MjBcbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5WaWN0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gJ3g6JyArIHRoaXMueCArICcsIHk6JyArIHRoaXMueTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKlxuICogIyMjIEV4YW1wbGVzOlxuICogICAgIHZhciB2ZWMgPSBuZXcgVmljdG9yKDEwLCAyMCk7XG4gKlxuICogICAgIHZlYy50b0FycmF5KCk7XG4gKiAgICAgLy8gPT4gWzEwLCAyMF1cbiAqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblZpY3Rvci5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIFsgdGhpcy54LCB0aGlzLnkgXTtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICpcbiAqICMjIyBFeGFtcGxlczpcbiAqICAgICB2YXIgdmVjID0gbmV3IFZpY3RvcigxMCwgMjApO1xuICpcbiAqICAgICB2ZWMudG9PYmplY3QoKTtcbiAqICAgICAvLyA9PiB7IHg6IDEwLCB5OiAyMCB9XG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuVmljdG9yLnByb3RvdHlwZS50b09iamVjdCA9IGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHsgeDogdGhpcy54LCB5OiB0aGlzLnkgfTtcbn07XG5cblxudmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5mdW5jdGlvbiByYW5kb20gKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSArIG1pbik7XG59XG5cbmZ1bmN0aW9uIHJhZGlhbjJkZWdyZWVzIChyYWQpIHtcblx0cmV0dXJuIHJhZCAqIGRlZ3JlZXM7XG59XG5cbmZ1bmN0aW9uIGRlZ3JlZXMycmFkaWFuIChkZWcpIHtcblx0cmV0dXJuIGRlZyAvIGRlZ3JlZXM7XG59XG4iLG51bGwsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ29uc3RydWN0b3IoJF9fcGxhY2Vob2xkZXJfXzApLmNhbGwoJF9fcGxhY2Vob2xkZXJfXzEpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyR2V0KCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIixudWxsLG51bGwsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIiwiXG4gICAgICAgICAgICBmb3IgKHZhciAkX19wbGFjZWhvbGRlcl9fMCA9IFtdLCAkX19wbGFjZWhvbGRlcl9fMSA9ICRfX3BsYWNlaG9sZGVyX18yO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMyA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX180KyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX181WyRfX3BsYWNlaG9sZGVyX182IC0gJF9fcGxhY2Vob2xkZXJfXzddID0gYXJndW1lbnRzWyRfX3BsYWNlaG9sZGVyX184XTsiLG51bGwsbnVsbCwiJF9fcGxhY2Vob2xkZXJfXzAuY2FsbCgkX19wbGFjZWhvbGRlcl9fMSkiLG51bGwsbnVsbCwiXG4gICAgICAgIGZvciAodmFyICRfX3BsYWNlaG9sZGVyX18wID1cbiAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzFbXG4gICAgICAgICAgICAgICAgICAgICAkdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSgpLFxuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMjtcbiAgICAgICAgICAgICAhKCRfX3BsYWNlaG9sZGVyX18zID0gJF9fcGxhY2Vob2xkZXJfXzQubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNTtcbiAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fNjtcbiAgICAgICAgfSIsIlxuICAgICAgICAgICAgZm9yICh2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSBbXSwgJF9fcGxhY2Vob2xkZXJfXzEgPSAwO1xuICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA8IGFyZ3VtZW50cy5sZW5ndGg7ICRfX3BsYWNlaG9sZGVyX18zKyspXG4gICAgICAgICAgICAgICRfX3BsYWNlaG9sZGVyX180WyRfX3BsYWNlaG9sZGVyX181XSA9IGFyZ3VtZW50c1skX19wbGFjZWhvbGRlcl9fNl07IixudWxsLG51bGwsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyQ29uc3RydWN0b3IoJF9fcGxhY2Vob2xkZXJfXzApLmNhbGwoJF9fcGxhY2Vob2xkZXJfXzEpIiwidmFyICRfX3BsYWNlaG9sZGVyX18wID0gJF9fcGxhY2Vob2xkZXJfXzEiLCIoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEsICRfX3BsYWNlaG9sZGVyX18yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzMpIiwiJHRyYWNldXJSdW50aW1lLnN1cGVyR2V0KCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIixudWxsLG51bGwsbnVsbCxudWxsLG51bGwsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLG51bGwsInZhciAkX19wbGFjZWhvbGRlcl9fMCA9ICRfX3BsYWNlaG9sZGVyX18xIiwiKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJDb25zdHJ1Y3RvcigkX19wbGFjZWhvbGRlcl9fMCkuY2FsbCgkX19wbGFjZWhvbGRlcl9fMSkiLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMykiLCIkdHJhY2V1clJ1bnRpbWUuc3VwZXJHZXQoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xLCAkX19wbGFjZWhvbGRlcl9fMikiLG51bGwsIiRfX3BsYWNlaG9sZGVyX18wLmNhbGwoJF9fcGxhY2Vob2xkZXJfXzEpIixudWxsLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJsZXZlbFwiOiAxLFxyXG4gIFwibWFwXCI6IFtcclxuICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDFdLFxyXG4gICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMV0sXHJcbiAgICBbMSwxLDEsMSwxLDEsMSwxLDEsMSwxXSxcclxuICAgIFswLDIsMiwyLDIsMiwyLDIsMiwxLDFdLFxyXG4gICAgWzEsMSwxLDEsMSwxLDEsMSwyLDEsMV0sXHJcbiAgICBbMSwxLDEsMSwxLDEsMSwxLDIsMSwxXSxcclxuICAgIFsxLDEsMSwxLDEsMSwxLDEsMiwxLDFdLFxyXG4gICAgWzEsMSwxLDEsOCw4LDgsMSwyLDEsMV0sXHJcbiAgICBbMSwxLDEsMSw4LDgsOCw4LDIsMSwxXSxcclxuICAgIFsxLDEsMSwxLDEsOCw4LDEsMiwxLDFdLFxyXG4gICAgWzEsMiwyLDIsMiwyLDIsMiwyLDEsMV0sXHJcbiAgICBbMSwyLDEsMSwxLDEsMSwxLDEsMSwxXSxcclxuICAgIFsxLDIsMSwxLDEsMSwxLDEsMSwxLDFdLFxyXG4gICAgWzEsMiwxLDEsMSwxLDEsMSwxLDEsMV0sXHJcbiAgICBbMSwyLDIsMiwyLDIsMiwyLDIsMiw5XSxcclxuICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDFdLFxyXG4gICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMV0sXHJcbiAgICBbMSwxLDEsMSwxLDEsMSwxLDEsMSwxXSxcclxuICAgIFsxLDEsMSwxLDEsMSwxLDEsMSwxLDFdLFxyXG4gICAgWzEsMSwxLDEsMSwxLDEsMSwxLDEsMV1cclxuICBdLFxyXG4gIFwiZW5lbXlfcGF0aFwiOiBbXHJcbiAgICB7XHJcbiAgICAgICAgXCJ4XCI6IDE5MixcclxuICAgICAgICBcInlcIjogMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgICBcInhcIjogMTkyLFxyXG4gICAgICAgIFwieVwiOiA1MTJcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgICAgXCJ4XCI6IDY0MCxcclxuICAgICAgICBcInlcIjogNTEyXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwieFwiOiA2NDAsXHJcbiAgICAgICAgXCJ5XCI6IDY0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwieFwiOiA4OTYsXHJcbiAgICAgICAgXCJ5XCI6IDY0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICAgIFwieFwiOiA4OTYsXHJcbiAgICAgICAgXCJ5XCI6IDY0MFxyXG4gICAgfVxyXG4gIF1cclxufSIsbnVsbCxudWxsLCJ2YXIgJF9fcGxhY2Vob2xkZXJfXzAgPSAkX19wbGFjZWhvbGRlcl9fMSIsIigkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKCRfX3BsYWNlaG9sZGVyX18wLCAkX19wbGFjZWhvbGRlcl9fMSwgJF9fcGxhY2Vob2xkZXJfXzIpIixudWxsLG51bGwsbnVsbCxudWxsLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuLy8gcmVzb2x2ZXMgLiBhbmQgLi4gZWxlbWVudHMgaW4gYSBwYXRoIGFycmF5IHdpdGggZGlyZWN0b3J5IG5hbWVzIHRoZXJlXG4vLyBtdXN0IGJlIG5vIHNsYXNoZXMsIGVtcHR5IGVsZW1lbnRzLCBvciBkZXZpY2UgbmFtZXMgKGM6XFwpIGluIHRoZSBhcnJheVxuLy8gKHNvIGFsc28gbm8gbGVhZGluZyBhbmQgdHJhaWxpbmcgc2xhc2hlcyAtIGl0IGRvZXMgbm90IGRpc3Rpbmd1aXNoXG4vLyByZWxhdGl2ZSBhbmQgYWJzb2x1dGUgcGF0aHMpXG5mdW5jdGlvbiBub3JtYWxpemVBcnJheShwYXJ0cywgYWxsb3dBYm92ZVJvb3QpIHtcbiAgLy8gaWYgdGhlIHBhdGggdHJpZXMgdG8gZ28gYWJvdmUgdGhlIHJvb3QsIGB1cGAgZW5kcyB1cCA+IDBcbiAgdmFyIHVwID0gMDtcbiAgZm9yICh2YXIgaSA9IHBhcnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgdmFyIGxhc3QgPSBwYXJ0c1tpXTtcbiAgICBpZiAobGFzdCA9PT0gJy4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgfSBlbHNlIGlmIChsYXN0ID09PSAnLi4nKSB7XG4gICAgICBwYXJ0cy5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwLS07XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlIHBhdGggaXMgYWxsb3dlZCB0byBnbyBhYm92ZSB0aGUgcm9vdCwgcmVzdG9yZSBsZWFkaW5nIC4uc1xuICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICBmb3IgKDsgdXAtLTsgdXApIHtcbiAgICAgIHBhcnRzLnVuc2hpZnQoJy4uJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG4vLyBTcGxpdCBhIGZpbGVuYW1lIGludG8gW3Jvb3QsIGRpciwgYmFzZW5hbWUsIGV4dF0sIHVuaXggdmVyc2lvblxuLy8gJ3Jvb3QnIGlzIGp1c3QgYSBzbGFzaCwgb3Igbm90aGluZy5cbnZhciBzcGxpdFBhdGhSZSA9XG4gICAgL14oXFwvP3wpKFtcXHNcXFNdKj8pKCg/OlxcLnsxLDJ9fFteXFwvXSs/fCkoXFwuW14uXFwvXSp8KSkoPzpbXFwvXSopJC87XG52YXIgc3BsaXRQYXRoID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aFJlLmV4ZWMoZmlsZW5hbWUpLnNsaWNlKDEpO1xufTtcblxuLy8gcGF0aC5yZXNvbHZlKFtmcm9tIC4uLl0sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gIHZhciByZXNvbHZlZFBhdGggPSAnJyxcbiAgICAgIHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcblxuICBmb3IgKHZhciBpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGkgPj0gLTEgJiYgIXJlc29sdmVkQWJzb2x1dGU7IGktLSkge1xuICAgIHZhciBwYXRoID0gKGkgPj0gMCkgPyBhcmd1bWVudHNbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuXG4gICAgLy8gU2tpcCBlbXB0eSBhbmQgaW52YWxpZCBlbnRyaWVzXG4gICAgaWYgKHR5cGVvZiBwYXRoICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIHRvIHBhdGgucmVzb2x2ZSBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9IGVsc2UgaWYgKCFwYXRoKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICByZXNvbHZlZFBhdGggPSBwYXRoICsgJy8nICsgcmVzb2x2ZWRQYXRoO1xuICAgIHJlc29sdmVkQWJzb2x1dGUgPSBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nO1xuICB9XG5cbiAgLy8gQXQgdGhpcyBwb2ludCB0aGUgcGF0aCBzaG91bGQgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGFic29sdXRlIHBhdGgsIGJ1dFxuICAvLyBoYW5kbGUgcmVsYXRpdmUgcGF0aHMgdG8gYmUgc2FmZSAobWlnaHQgaGFwcGVuIHdoZW4gcHJvY2Vzcy5jd2QoKSBmYWlscylcblxuICAvLyBOb3JtYWxpemUgdGhlIHBhdGhcbiAgcmVzb2x2ZWRQYXRoID0gbm9ybWFsaXplQXJyYXkoZmlsdGVyKHJlc29sdmVkUGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFyZXNvbHZlZEFic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgcmV0dXJuICgocmVzb2x2ZWRBYnNvbHV0ZSA/ICcvJyA6ICcnKSArIHJlc29sdmVkUGF0aCkgfHwgJy4nO1xufTtcblxuLy8gcGF0aC5ub3JtYWxpemUocGF0aClcbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMubm9ybWFsaXplID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKSxcbiAgICAgIHRyYWlsaW5nU2xhc2ggPSBzdWJzdHIocGF0aCwgLTEpID09PSAnLyc7XG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHBhdGggPSBub3JtYWxpemVBcnJheShmaWx0ZXIocGF0aC5zcGxpdCgnLycpLCBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuICEhcDtcbiAgfSksICFpc0Fic29sdXRlKS5qb2luKCcvJyk7XG5cbiAgaWYgKCFwYXRoICYmICFpc0Fic29sdXRlKSB7XG4gICAgcGF0aCA9ICcuJztcbiAgfVxuICBpZiAocGF0aCAmJiB0cmFpbGluZ1NsYXNoKSB7XG4gICAgcGF0aCArPSAnLyc7XG4gIH1cblxuICByZXR1cm4gKGlzQWJzb2x1dGUgPyAnLycgOiAnJykgKyBwYXRoO1xufTtcblxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24ocGF0aCkge1xuICByZXR1cm4gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuam9pbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGF0aHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICByZXR1cm4gZXhwb3J0cy5ub3JtYWxpemUoZmlsdGVyKHBhdGhzLCBmdW5jdGlvbihwLCBpbmRleCkge1xuICAgIGlmICh0eXBlb2YgcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG5cbmZ1bmN0aW9uIGZpbHRlciAoeHMsIGYpIHtcbiAgICBpZiAoeHMuZmlsdGVyKSByZXR1cm4geHMuZmlsdGVyKGYpO1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChmKHhzW2ldLCBpLCB4cykpIHJlcy5wdXNoKHhzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbn1cblxuLy8gU3RyaW5nLnByb3RvdHlwZS5zdWJzdHIgLSBuZWdhdGl2ZSBpbmRleCBkb24ndCB3b3JrIGluIElFOFxudmFyIHN1YnN0ciA9ICdhYicuc3Vic3RyKC0xKSA9PT0gJ2InXG4gICAgPyBmdW5jdGlvbiAoc3RyLCBzdGFydCwgbGVuKSB7IHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pIH1cbiAgICA6IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW4pIHtcbiAgICAgICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSBzdHIubGVuZ3RoICsgc3RhcnQ7XG4gICAgICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW4pO1xuICAgIH1cbjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIoZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgaWYgKGdsb2JhbC4kdHJhY2V1clJ1bnRpbWUpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyICRPYmplY3QgPSBPYmplY3Q7XG4gIHZhciAkVHlwZUVycm9yID0gVHlwZUVycm9yO1xuICB2YXIgJGNyZWF0ZSA9ICRPYmplY3QuY3JlYXRlO1xuICB2YXIgJGRlZmluZVByb3BlcnRpZXMgPSAkT2JqZWN0LmRlZmluZVByb3BlcnRpZXM7XG4gIHZhciAkZGVmaW5lUHJvcGVydHkgPSAkT2JqZWN0LmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGZyZWV6ZSA9ICRPYmplY3QuZnJlZXplO1xuICB2YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICB2YXIgJGdldE93blByb3BlcnR5TmFtZXMgPSAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXM7XG4gIHZhciAka2V5cyA9ICRPYmplY3Qua2V5cztcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9ICRPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgJHRvU3RyaW5nID0gJE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciAkcHJldmVudEV4dGVuc2lvbnMgPSBPYmplY3QucHJldmVudEV4dGVuc2lvbnM7XG4gIHZhciAkc2VhbCA9IE9iamVjdC5zZWFsO1xuICB2YXIgJGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGU7XG4gIGZ1bmN0aW9uIG5vbkVudW0odmFsdWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH07XG4gIH1cbiAgdmFyIG1ldGhvZCA9IG5vbkVudW07XG4gIHZhciBjb3VudGVyID0gMDtcbiAgZnVuY3Rpb24gbmV3VW5pcXVlU3RyaW5nKCkge1xuICAgIHJldHVybiAnX18kJyArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDFlOSkgKyAnJCcgKyArK2NvdW50ZXIgKyAnJF9fJztcbiAgfVxuICB2YXIgc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICB2YXIgc3ltYm9sRGVzY3JpcHRpb25Qcm9wZXJ0eSA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICB2YXIgc3ltYm9sRGF0YVByb3BlcnR5ID0gbmV3VW5pcXVlU3RyaW5nKCk7XG4gIHZhciBzeW1ib2xWYWx1ZXMgPSAkY3JlYXRlKG51bGwpO1xuICB2YXIgcHJpdmF0ZU5hbWVzID0gJGNyZWF0ZShudWxsKTtcbiAgZnVuY3Rpb24gaXNQcml2YXRlTmFtZShzKSB7XG4gICAgcmV0dXJuIHByaXZhdGVOYW1lc1tzXTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVQcml2YXRlTmFtZSgpIHtcbiAgICB2YXIgcyA9IG5ld1VuaXF1ZVN0cmluZygpO1xuICAgIHByaXZhdGVOYW1lc1tzXSA9IHRydWU7XG4gICAgcmV0dXJuIHM7XG4gIH1cbiAgZnVuY3Rpb24gaXNTaGltU3ltYm9sKHN5bWJvbCkge1xuICAgIHJldHVybiB0eXBlb2Ygc3ltYm9sID09PSAnb2JqZWN0JyAmJiBzeW1ib2wgaW5zdGFuY2VvZiBTeW1ib2xWYWx1ZTtcbiAgfVxuICBmdW5jdGlvbiB0eXBlT2Yodikge1xuICAgIGlmIChpc1NoaW1TeW1ib2wodikpXG4gICAgICByZXR1cm4gJ3N5bWJvbCc7XG4gICAgcmV0dXJuIHR5cGVvZiB2O1xuICB9XG4gIGZ1bmN0aW9uIFN5bWJvbChkZXNjcmlwdGlvbikge1xuICAgIHZhciB2YWx1ZSA9IG5ldyBTeW1ib2xWYWx1ZShkZXNjcmlwdGlvbik7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFN5bWJvbCkpXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU3ltYm9sIGNhbm5vdCBiZSBuZXdcXCdlZCcpO1xuICB9XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAnY29uc3RydWN0b3InLCBub25FbnVtKFN5bWJvbCkpO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgbWV0aG9kKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzeW1ib2xWYWx1ZSA9IHRoaXNbc3ltYm9sRGF0YVByb3BlcnR5XTtcbiAgICBpZiAoIWdldE9wdGlvbignc3ltYm9scycpKVxuICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIGlmICghc3ltYm9sVmFsdWUpXG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ0NvbnZlcnNpb24gZnJvbSBzeW1ib2wgdG8gc3RyaW5nJyk7XG4gICAgdmFyIGRlc2MgPSBzeW1ib2xWYWx1ZVtzeW1ib2xEZXNjcmlwdGlvblByb3BlcnR5XTtcbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKVxuICAgICAgZGVzYyA9ICcnO1xuICAgIHJldHVybiAnU3ltYm9sKCcgKyBkZXNjICsgJyknO1xuICB9KSk7XG4gICRkZWZpbmVQcm9wZXJ0eShTeW1ib2wucHJvdG90eXBlLCAndmFsdWVPZicsIG1ldGhvZChmdW5jdGlvbigpIHtcbiAgICB2YXIgc3ltYm9sVmFsdWUgPSB0aGlzW3N5bWJvbERhdGFQcm9wZXJ0eV07XG4gICAgaWYgKCFzeW1ib2xWYWx1ZSlcbiAgICAgIHRocm93IFR5cGVFcnJvcignQ29udmVyc2lvbiBmcm9tIHN5bWJvbCB0byBzdHJpbmcnKTtcbiAgICBpZiAoIWdldE9wdGlvbignc3ltYm9scycpKVxuICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlW3N5bWJvbEludGVybmFsUHJvcGVydHldO1xuICAgIHJldHVybiBzeW1ib2xWYWx1ZTtcbiAgfSkpO1xuICBmdW5jdGlvbiBTeW1ib2xWYWx1ZShkZXNjcmlwdGlvbikge1xuICAgIHZhciBrZXkgPSBuZXdVbmlxdWVTdHJpbmcoKTtcbiAgICAkZGVmaW5lUHJvcGVydHkodGhpcywgc3ltYm9sRGF0YVByb3BlcnR5LCB7dmFsdWU6IHRoaXN9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkodGhpcywgc3ltYm9sSW50ZXJuYWxQcm9wZXJ0eSwge3ZhbHVlOiBrZXl9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkodGhpcywgc3ltYm9sRGVzY3JpcHRpb25Qcm9wZXJ0eSwge3ZhbHVlOiBkZXNjcmlwdGlvbn0pO1xuICAgIGZyZWV6ZSh0aGlzKTtcbiAgICBzeW1ib2xWYWx1ZXNba2V5XSA9IHRoaXM7XG4gIH1cbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywgbm9uRW51bShTeW1ib2wpKTtcbiAgJGRlZmluZVByb3BlcnR5KFN5bWJvbFZhbHVlLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywge1xuICAgIHZhbHVlOiBTeW1ib2wucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG4gIH0pO1xuICAkZGVmaW5lUHJvcGVydHkoU3ltYm9sVmFsdWUucHJvdG90eXBlLCAndmFsdWVPZicsIHtcbiAgICB2YWx1ZTogU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mLFxuICAgIGVudW1lcmFibGU6IGZhbHNlXG4gIH0pO1xuICB2YXIgaGFzaFByb3BlcnR5ID0gY3JlYXRlUHJpdmF0ZU5hbWUoKTtcbiAgdmFyIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IgPSB7dmFsdWU6IHVuZGVmaW5lZH07XG4gIHZhciBoYXNoT2JqZWN0UHJvcGVydGllcyA9IHtcbiAgICBoYXNoOiB7dmFsdWU6IHVuZGVmaW5lZH0sXG4gICAgc2VsZjoge3ZhbHVlOiB1bmRlZmluZWR9XG4gIH07XG4gIHZhciBoYXNoQ291bnRlciA9IDA7XG4gIGZ1bmN0aW9uIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KSB7XG4gICAgdmFyIGhhc2hPYmplY3QgPSBvYmplY3RbaGFzaFByb3BlcnR5XTtcbiAgICBpZiAoaGFzaE9iamVjdCAmJiBoYXNoT2JqZWN0LnNlbGYgPT09IG9iamVjdClcbiAgICAgIHJldHVybiBoYXNoT2JqZWN0O1xuICAgIGlmICgkaXNFeHRlbnNpYmxlKG9iamVjdCkpIHtcbiAgICAgIGhhc2hPYmplY3RQcm9wZXJ0aWVzLmhhc2gudmFsdWUgPSBoYXNoQ291bnRlcisrO1xuICAgICAgaGFzaE9iamVjdFByb3BlcnRpZXMuc2VsZi52YWx1ZSA9IG9iamVjdDtcbiAgICAgIGhhc2hQcm9wZXJ0eURlc2NyaXB0b3IudmFsdWUgPSAkY3JlYXRlKG51bGwsIGhhc2hPYmplY3RQcm9wZXJ0aWVzKTtcbiAgICAgICRkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGhhc2hQcm9wZXJ0eSwgaGFzaFByb3BlcnR5RGVzY3JpcHRvcik7XG4gICAgICByZXR1cm4gaGFzaFByb3BlcnR5RGVzY3JpcHRvci52YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBmcmVlemUob2JqZWN0KSB7XG4gICAgZ2V0T3duSGFzaE9iamVjdChvYmplY3QpO1xuICAgIHJldHVybiAkZnJlZXplLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJldmVudEV4dGVuc2lvbnMob2JqZWN0KSB7XG4gICAgZ2V0T3duSGFzaE9iamVjdChvYmplY3QpO1xuICAgIHJldHVybiAkcHJldmVudEV4dGVuc2lvbnMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBmdW5jdGlvbiBzZWFsKG9iamVjdCkge1xuICAgIGdldE93bkhhc2hPYmplY3Qob2JqZWN0KTtcbiAgICByZXR1cm4gJHNlYWwuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuICBmcmVlemUoU3ltYm9sVmFsdWUucHJvdG90eXBlKTtcbiAgZnVuY3Rpb24gaXNTeW1ib2xTdHJpbmcocykge1xuICAgIHJldHVybiBzeW1ib2xWYWx1ZXNbc10gfHwgcHJpdmF0ZU5hbWVzW3NdO1xuICB9XG4gIGZ1bmN0aW9uIHRvUHJvcGVydHkobmFtZSkge1xuICAgIGlmIChpc1NoaW1TeW1ib2wobmFtZSkpXG4gICAgICByZXR1cm4gbmFtZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICByZXR1cm4gbmFtZTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVTeW1ib2xLZXlzKGFycmF5KSB7XG4gICAgdmFyIHJ2ID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFpc1N5bWJvbFN0cmluZyhhcnJheVtpXSkpIHtcbiAgICAgICAgcnYucHVzaChhcnJheVtpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuICBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCkge1xuICAgIHJldHVybiByZW1vdmVTeW1ib2xLZXlzKCRnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCkpO1xuICB9XG4gIGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gICAgcmV0dXJuIHJlbW92ZVN5bWJvbEtleXMoJGtleXMob2JqZWN0KSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCkge1xuICAgIHZhciBydiA9IFtdO1xuICAgIHZhciBuYW1lcyA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHN5bWJvbCA9IHN5bWJvbFZhbHVlc1tuYW1lc1tpXV07XG4gICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgIHJ2LnB1c2goc3ltYm9sKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJ2O1xuICB9XG4gIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIG5hbWUpIHtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHRvUHJvcGVydHkobmFtZSkpO1xuICB9XG4gIGZ1bmN0aW9uIGhhc093blByb3BlcnR5KG5hbWUpIHtcbiAgICByZXR1cm4gJGhhc093blByb3BlcnR5LmNhbGwodGhpcywgdG9Qcm9wZXJ0eShuYW1lKSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0T3B0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gZ2xvYmFsLnRyYWNldXIgJiYgZ2xvYmFsLnRyYWNldXIub3B0aW9uc1tuYW1lXTtcbiAgfVxuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGRlc2NyaXB0b3IpIHtcbiAgICBpZiAoaXNTaGltU3ltYm9sKG5hbWUpKSB7XG4gICAgICBuYW1lID0gbmFtZVtzeW1ib2xJbnRlcm5hbFByb3BlcnR5XTtcbiAgICB9XG4gICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwgZGVzY3JpcHRvcik7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbE9iamVjdChPYmplY3QpIHtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknLCB7dmFsdWU6IGRlZmluZVByb3BlcnR5fSk7XG4gICAgJGRlZmluZVByb3BlcnR5KE9iamVjdCwgJ2dldE93blByb3BlcnR5TmFtZXMnLCB7dmFsdWU6IGdldE93blByb3BlcnR5TmFtZXN9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywge3ZhbHVlOiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3J9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ2hhc093blByb3BlcnR5Jywge3ZhbHVlOiBoYXNPd25Qcm9wZXJ0eX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdmcmVlemUnLCB7dmFsdWU6IGZyZWV6ZX0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdwcmV2ZW50RXh0ZW5zaW9ucycsIHt2YWx1ZTogcHJldmVudEV4dGVuc2lvbnN9KTtcbiAgICAkZGVmaW5lUHJvcGVydHkoT2JqZWN0LCAnc2VhbCcsIHt2YWx1ZTogc2VhbH0pO1xuICAgICRkZWZpbmVQcm9wZXJ0eShPYmplY3QsICdrZXlzJywge3ZhbHVlOiBrZXlzfSk7XG4gIH1cbiAgZnVuY3Rpb24gZXhwb3J0U3RhcihvYmplY3QpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIG5hbWVzID0gJGdldE93blByb3BlcnR5TmFtZXMoYXJndW1lbnRzW2ldKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgbmFtZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIG5hbWUgPSBuYW1lc1tqXTtcbiAgICAgICAgaWYgKGlzU3ltYm9sU3RyaW5nKG5hbWUpKVxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAoZnVuY3Rpb24obW9kLCBuYW1lKSB7XG4gICAgICAgICAgJGRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG1vZFtuYW1lXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKGFyZ3VtZW50c1tpXSwgbmFtZXNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAhPSBudWxsICYmICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHggPT09ICdmdW5jdGlvbicpO1xuICB9XG4gIGZ1bmN0aW9uIHRvT2JqZWN0KHgpIHtcbiAgICBpZiAoeCA9PSBudWxsKVxuICAgICAgdGhyb3cgJFR5cGVFcnJvcigpO1xuICAgIHJldHVybiAkT2JqZWN0KHgpO1xuICB9XG4gIGZ1bmN0aW9uIGNoZWNrT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSB7XG4gICAgaWYgKGFyZ3VtZW50ID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1ZhbHVlIGNhbm5vdCBiZSBjb252ZXJ0ZWQgdG8gYW4gT2JqZWN0Jyk7XG4gICAgfVxuICAgIHJldHVybiBhcmd1bWVudDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbFN5bWJvbChnbG9iYWwsIFN5bWJvbCkge1xuICAgIGlmICghZ2xvYmFsLlN5bWJvbCkge1xuICAgICAgZ2xvYmFsLlN5bWJvbCA9IFN5bWJvbDtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4gICAgfVxuICAgIGlmICghZ2xvYmFsLlN5bWJvbC5pdGVyYXRvcikge1xuICAgICAgZ2xvYmFsLlN5bWJvbC5pdGVyYXRvciA9IFN5bWJvbCgnU3ltYm9sLml0ZXJhdG9yJyk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldHVwR2xvYmFscyhnbG9iYWwpIHtcbiAgICBwb2x5ZmlsbFN5bWJvbChnbG9iYWwsIFN5bWJvbCk7XG4gICAgZ2xvYmFsLlJlZmxlY3QgPSBnbG9iYWwuUmVmbGVjdCB8fCB7fTtcbiAgICBnbG9iYWwuUmVmbGVjdC5nbG9iYWwgPSBnbG9iYWwuUmVmbGVjdC5nbG9iYWwgfHwgZ2xvYmFsO1xuICAgIHBvbHlmaWxsT2JqZWN0KGdsb2JhbC5PYmplY3QpO1xuICB9XG4gIHNldHVwR2xvYmFscyhnbG9iYWwpO1xuICBnbG9iYWwuJHRyYWNldXJSdW50aW1lID0ge1xuICAgIGNoZWNrT2JqZWN0Q29lcmNpYmxlOiBjaGVja09iamVjdENvZXJjaWJsZSxcbiAgICBjcmVhdGVQcml2YXRlTmFtZTogY3JlYXRlUHJpdmF0ZU5hbWUsXG4gICAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gICAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgICBleHBvcnRTdGFyOiBleHBvcnRTdGFyLFxuICAgIGdldE93bkhhc2hPYmplY3Q6IGdldE93bkhhc2hPYmplY3QsXG4gICAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAgIGlzT2JqZWN0OiBpc09iamVjdCxcbiAgICBpc1ByaXZhdGVOYW1lOiBpc1ByaXZhdGVOYW1lLFxuICAgIGlzU3ltYm9sU3RyaW5nOiBpc1N5bWJvbFN0cmluZyxcbiAgICBrZXlzOiAka2V5cyxcbiAgICBzZXR1cEdsb2JhbHM6IHNldHVwR2xvYmFscyxcbiAgICB0b09iamVjdDogdG9PYmplY3QsXG4gICAgdG9Qcm9wZXJ0eTogdG9Qcm9wZXJ0eSxcbiAgICB0eXBlb2Y6IHR5cGVPZlxuICB9O1xufSkodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgcGF0aDtcbiAgZnVuY3Rpb24gcmVsYXRpdmVSZXF1aXJlKGNhbGxlclBhdGgsIHJlcXVpcmVkUGF0aCkge1xuICAgIHBhdGggPSBwYXRoIHx8IHR5cGVvZiByZXF1aXJlICE9PSAndW5kZWZpbmVkJyAmJiByZXF1aXJlKCdwYXRoJyk7XG4gICAgZnVuY3Rpb24gaXNEaXJlY3RvcnkocGF0aCkge1xuICAgICAgcmV0dXJuIHBhdGguc2xpY2UoLTEpID09PSAnLyc7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzQWJzb2x1dGUocGF0aCkge1xuICAgICAgcmV0dXJuIHBhdGhbMF0gPT09ICcvJztcbiAgICB9XG4gICAgZnVuY3Rpb24gaXNSZWxhdGl2ZShwYXRoKSB7XG4gICAgICByZXR1cm4gcGF0aFswXSA9PT0gJy4nO1xuICAgIH1cbiAgICBpZiAoaXNEaXJlY3RvcnkocmVxdWlyZWRQYXRoKSB8fCBpc0Fic29sdXRlKHJlcXVpcmVkUGF0aCkpXG4gICAgICByZXR1cm47XG4gICAgcmV0dXJuIGlzUmVsYXRpdmUocmVxdWlyZWRQYXRoKSA/IHJlcXVpcmUocGF0aC5yZXNvbHZlKHBhdGguZGlybmFtZShjYWxsZXJQYXRoKSwgcmVxdWlyZWRQYXRoKSkgOiByZXF1aXJlKHJlcXVpcmVkUGF0aCk7XG4gIH1cbiAgJHRyYWNldXJSdW50aW1lLnJlcXVpcmUgPSByZWxhdGl2ZVJlcXVpcmU7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIGZ1bmN0aW9uIHNwcmVhZCgpIHtcbiAgICB2YXIgcnYgPSBbXSxcbiAgICAgICAgaiA9IDAsXG4gICAgICAgIGl0ZXJSZXN1bHQ7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZVRvU3ByZWFkID0gJHRyYWNldXJSdW50aW1lLmNoZWNrT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50c1tpXSk7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlVG9TcHJlYWRbJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHkoU3ltYm9sLml0ZXJhdG9yKV0gIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IHNwcmVhZCBub24taXRlcmFibGUgb2JqZWN0LicpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ZXIgPSB2YWx1ZVRvU3ByZWFkWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KFN5bWJvbC5pdGVyYXRvcildKCk7XG4gICAgICB3aGlsZSAoIShpdGVyUmVzdWx0ID0gaXRlci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgcnZbaisrXSA9IGl0ZXJSZXN1bHQudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBydjtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuc3ByZWFkID0gc3ByZWFkO1xufSkoKTtcbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgJE9iamVjdCA9IE9iamVjdDtcbiAgdmFyICRUeXBlRXJyb3IgPSBUeXBlRXJyb3I7XG4gIHZhciAkY3JlYXRlID0gJE9iamVjdC5jcmVhdGU7XG4gIHZhciAkZGVmaW5lUHJvcGVydGllcyA9ICR0cmFjZXVyUnVudGltZS5kZWZpbmVQcm9wZXJ0aWVzO1xuICB2YXIgJGRlZmluZVByb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gIHZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICB2YXIgJGdldFByb3RvdHlwZU9mID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuICB2YXIgJF9fMCA9IE9iamVjdCxcbiAgICAgIGdldE93blByb3BlcnR5TmFtZXMgPSAkX18wLmdldE93blByb3BlcnR5TmFtZXMsXG4gICAgICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSAkX18wLmdldE93blByb3BlcnR5U3ltYm9scztcbiAgZnVuY3Rpb24gc3VwZXJEZXNjcmlwdG9yKGhvbWVPYmplY3QsIG5hbWUpIHtcbiAgICB2YXIgcHJvdG8gPSAkZ2V0UHJvdG90eXBlT2YoaG9tZU9iamVjdCk7XG4gICAgZG8ge1xuICAgICAgdmFyIHJlc3VsdCA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIG5hbWUpO1xuICAgICAgaWYgKHJlc3VsdClcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIHByb3RvID0gJGdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICB9IHdoaWxlIChwcm90byk7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBzdXBlckNvbnN0cnVjdG9yKGN0b3IpIHtcbiAgICByZXR1cm4gY3Rvci5fX3Byb3RvX187XG4gIH1cbiAgZnVuY3Rpb24gc3VwZXJDYWxsKHNlbGYsIGhvbWVPYmplY3QsIG5hbWUsIGFyZ3MpIHtcbiAgICByZXR1cm4gc3VwZXJHZXQoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSkuYXBwbHkoc2VsZiwgYXJncyk7XG4gIH1cbiAgZnVuY3Rpb24gc3VwZXJHZXQoc2VsZiwgaG9tZU9iamVjdCwgbmFtZSkge1xuICAgIHZhciBkZXNjcmlwdG9yID0gc3VwZXJEZXNjcmlwdG9yKGhvbWVPYmplY3QsIG5hbWUpO1xuICAgIGlmIChkZXNjcmlwdG9yKSB7XG4gICAgICBpZiAoIWRlc2NyaXB0b3IuZ2V0KVxuICAgICAgICByZXR1cm4gZGVzY3JpcHRvci52YWx1ZTtcbiAgICAgIHJldHVybiBkZXNjcmlwdG9yLmdldC5jYWxsKHNlbGYpO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHN1cGVyU2V0KHNlbGYsIGhvbWVPYmplY3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBzdXBlckRlc2NyaXB0b3IoaG9tZU9iamVjdCwgbmFtZSk7XG4gICAgaWYgKGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5zZXQpIHtcbiAgICAgIGRlc2NyaXB0b3Iuc2V0LmNhbGwoc2VsZiwgdmFsdWUpO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB0aHJvdyAkVHlwZUVycm9yKChcInN1cGVyIGhhcyBubyBzZXR0ZXIgJ1wiICsgbmFtZSArIFwiJy5cIikpO1xuICB9XG4gIGZ1bmN0aW9uIGdldERlc2NyaXB0b3JzKG9iamVjdCkge1xuICAgIHZhciBkZXNjcmlwdG9ycyA9IHt9O1xuICAgIHZhciBuYW1lcyA9IGdldE93blByb3BlcnR5TmFtZXMob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbmFtZSA9IG5hbWVzW2ldO1xuICAgICAgZGVzY3JpcHRvcnNbbmFtZV0gPSAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgbmFtZSk7XG4gICAgfVxuICAgIHZhciBzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc3ltYm9sID0gc3ltYm9sc1tpXTtcbiAgICAgIGRlc2NyaXB0b3JzWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KHN5bWJvbCldID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsICR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KHN5bWJvbCkpO1xuICAgIH1cbiAgICByZXR1cm4gZGVzY3JpcHRvcnM7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlQ2xhc3MoY3Rvciwgb2JqZWN0LCBzdGF0aWNPYmplY3QsIHN1cGVyQ2xhc3MpIHtcbiAgICAkZGVmaW5lUHJvcGVydHkob2JqZWN0LCAnY29uc3RydWN0b3InLCB7XG4gICAgICB2YWx1ZTogY3RvcixcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9KTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyA9PT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgY3Rvci5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSAkY3JlYXRlKGdldFByb3RvUGFyZW50KHN1cGVyQ2xhc3MpLCBnZXREZXNjcmlwdG9ycyhvYmplY3QpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBvYmplY3Q7XG4gICAgfVxuICAgICRkZWZpbmVQcm9wZXJ0eShjdG9yLCAncHJvdG90eXBlJywge1xuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZVxuICAgIH0pO1xuICAgIHJldHVybiAkZGVmaW5lUHJvcGVydGllcyhjdG9yLCBnZXREZXNjcmlwdG9ycyhzdGF0aWNPYmplY3QpKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRQcm90b1BhcmVudChzdXBlckNsYXNzKSB7XG4gICAgaWYgKHR5cGVvZiBzdXBlckNsYXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICB2YXIgcHJvdG90eXBlID0gc3VwZXJDbGFzcy5wcm90b3R5cGU7XG4gICAgICBpZiAoJE9iamVjdChwcm90b3R5cGUpID09PSBwcm90b3R5cGUgfHwgcHJvdG90eXBlID09PSBudWxsKVxuICAgICAgICByZXR1cm4gc3VwZXJDbGFzcy5wcm90b3R5cGU7XG4gICAgICB0aHJvdyBuZXcgJFR5cGVFcnJvcignc3VwZXIgcHJvdG90eXBlIG11c3QgYmUgYW4gT2JqZWN0IG9yIG51bGwnKTtcbiAgICB9XG4gICAgaWYgKHN1cGVyQ2xhc3MgPT09IG51bGwpXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB0aHJvdyBuZXcgJFR5cGVFcnJvcigoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MgKyBcIi5cIikpO1xuICB9XG4gIGZ1bmN0aW9uIGRlZmF1bHRTdXBlckNhbGwoc2VsZiwgaG9tZU9iamVjdCwgYXJncykge1xuICAgIGlmICgkZ2V0UHJvdG90eXBlT2YoaG9tZU9iamVjdCkgIT09IG51bGwpXG4gICAgICBzdXBlckNhbGwoc2VsZiwgaG9tZU9iamVjdCwgJ2NvbnN0cnVjdG9yJywgYXJncyk7XG4gIH1cbiAgJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzID0gY3JlYXRlQ2xhc3M7XG4gICR0cmFjZXVyUnVudGltZS5kZWZhdWx0U3VwZXJDYWxsID0gZGVmYXVsdFN1cGVyQ2FsbDtcbiAgJHRyYWNldXJSdW50aW1lLnN1cGVyQ2FsbCA9IHN1cGVyQ2FsbDtcbiAgJHRyYWNldXJSdW50aW1lLnN1cGVyQ29uc3RydWN0b3IgPSBzdXBlckNvbnN0cnVjdG9yO1xuICAkdHJhY2V1clJ1bnRpbWUuc3VwZXJHZXQgPSBzdXBlckdldDtcbiAgJHRyYWNldXJSdW50aW1lLnN1cGVyU2V0ID0gc3VwZXJTZXQ7XG59KSgpO1xuKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG4gIGlmICh0eXBlb2YgJHRyYWNldXJSdW50aW1lICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93IG5ldyBFcnJvcigndHJhY2V1ciBydW50aW1lIG5vdCBmb3VuZC4nKTtcbiAgfVxuICB2YXIgY3JlYXRlUHJpdmF0ZU5hbWUgPSAkdHJhY2V1clJ1bnRpbWUuY3JlYXRlUHJpdmF0ZU5hbWU7XG4gIHZhciAkZGVmaW5lUHJvcGVydGllcyA9ICR0cmFjZXVyUnVudGltZS5kZWZpbmVQcm9wZXJ0aWVzO1xuICB2YXIgJGRlZmluZVByb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLmRlZmluZVByb3BlcnR5O1xuICB2YXIgJGNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG4gIHZhciAkVHlwZUVycm9yID0gVHlwZUVycm9yO1xuICBmdW5jdGlvbiBub25FbnVtKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9O1xuICB9XG4gIHZhciBTVF9ORVdCT1JOID0gMDtcbiAgdmFyIFNUX0VYRUNVVElORyA9IDE7XG4gIHZhciBTVF9TVVNQRU5ERUQgPSAyO1xuICB2YXIgU1RfQ0xPU0VEID0gMztcbiAgdmFyIEVORF9TVEFURSA9IC0yO1xuICB2YXIgUkVUSFJPV19TVEFURSA9IC0zO1xuICBmdW5jdGlvbiBnZXRJbnRlcm5hbEVycm9yKHN0YXRlKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcignVHJhY2V1ciBjb21waWxlciBidWc6IGludmFsaWQgc3RhdGUgaW4gc3RhdGUgbWFjaGluZTogJyArIHN0YXRlKTtcbiAgfVxuICBmdW5jdGlvbiBHZW5lcmF0b3JDb250ZXh0KCkge1xuICAgIHRoaXMuc3RhdGUgPSAwO1xuICAgIHRoaXMuR1N0YXRlID0gU1RfTkVXQk9STjtcbiAgICB0aGlzLnN0b3JlZEV4Y2VwdGlvbiA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmZpbmFsbHlGYWxsVGhyb3VnaCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNlbnRfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmV0dXJuVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50cnlTdGFja18gPSBbXTtcbiAgfVxuICBHZW5lcmF0b3JDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBwdXNoVHJ5OiBmdW5jdGlvbihjYXRjaFN0YXRlLCBmaW5hbGx5U3RhdGUpIHtcbiAgICAgIGlmIChmaW5hbGx5U3RhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGZpbmFsbHlGYWxsVGhyb3VnaCA9IG51bGw7XG4gICAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeVN0YWNrXy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmICh0aGlzLnRyeVN0YWNrX1tpXS5jYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBmaW5hbGx5RmFsbFRocm91Z2ggPSB0aGlzLnRyeVN0YWNrX1tpXS5jYXRjaDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZmluYWxseUZhbGxUaHJvdWdoID09PSBudWxsKVxuICAgICAgICAgIGZpbmFsbHlGYWxsVGhyb3VnaCA9IFJFVEhST1dfU1RBVEU7XG4gICAgICAgIHRoaXMudHJ5U3RhY2tfLnB1c2goe1xuICAgICAgICAgIGZpbmFsbHk6IGZpbmFsbHlTdGF0ZSxcbiAgICAgICAgICBmaW5hbGx5RmFsbFRocm91Z2g6IGZpbmFsbHlGYWxsVGhyb3VnaFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChjYXRjaFN0YXRlICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudHJ5U3RhY2tfLnB1c2goe2NhdGNoOiBjYXRjaFN0YXRlfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBwb3BUcnk6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50cnlTdGFja18ucG9wKCk7XG4gICAgfSxcbiAgICBnZXQgc2VudCgpIHtcbiAgICAgIHRoaXMubWF5YmVUaHJvdygpO1xuICAgICAgcmV0dXJuIHRoaXMuc2VudF87XG4gICAgfSxcbiAgICBzZXQgc2VudCh2KSB7XG4gICAgICB0aGlzLnNlbnRfID0gdjtcbiAgICB9LFxuICAgIGdldCBzZW50SWdub3JlVGhyb3coKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZW50XztcbiAgICB9LFxuICAgIG1heWJlVGhyb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuYWN0aW9uID09PSAndGhyb3cnKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uID0gJ25leHQnO1xuICAgICAgICB0aHJvdyB0aGlzLnNlbnRfO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgICBjYXNlIEVORF9TVEFURTpcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgY2FzZSBSRVRIUk9XX1NUQVRFOlxuICAgICAgICAgIHRocm93IHRoaXMuc3RvcmVkRXhjZXB0aW9uO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IGdldEludGVybmFsRXJyb3IodGhpcy5zdGF0ZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBoYW5kbGVFeGNlcHRpb246IGZ1bmN0aW9uKGV4KSB7XG4gICAgICB0aGlzLkdTdGF0ZSA9IFNUX0NMT1NFRDtcbiAgICAgIHRoaXMuc3RhdGUgPSBFTkRfU1RBVEU7XG4gICAgICB0aHJvdyBleDtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIG5leHRPclRocm93KGN0eCwgbW92ZU5leHQsIGFjdGlvbiwgeCkge1xuICAgIHN3aXRjaCAoY3R4LkdTdGF0ZSkge1xuICAgICAgY2FzZSBTVF9FWEVDVVRJTkc6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigoXCJcXFwiXCIgKyBhY3Rpb24gKyBcIlxcXCIgb24gZXhlY3V0aW5nIGdlbmVyYXRvclwiKSk7XG4gICAgICBjYXNlIFNUX0NMT1NFRDpcbiAgICAgICAgaWYgKGFjdGlvbiA9PSAnbmV4dCcpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGRvbmU6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRocm93IHg7XG4gICAgICBjYXNlIFNUX05FV0JPUk46XG4gICAgICAgIGlmIChhY3Rpb24gPT09ICd0aHJvdycpIHtcbiAgICAgICAgICBjdHguR1N0YXRlID0gU1RfQ0xPU0VEO1xuICAgICAgICAgIHRocm93IHg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHggIT09IHVuZGVmaW5lZClcbiAgICAgICAgICB0aHJvdyAkVHlwZUVycm9yKCdTZW50IHZhbHVlIHRvIG5ld2Jvcm4gZ2VuZXJhdG9yJyk7XG4gICAgICBjYXNlIFNUX1NVU1BFTkRFRDpcbiAgICAgICAgY3R4LkdTdGF0ZSA9IFNUX0VYRUNVVElORztcbiAgICAgICAgY3R4LmFjdGlvbiA9IGFjdGlvbjtcbiAgICAgICAgY3R4LnNlbnQgPSB4O1xuICAgICAgICB2YXIgdmFsdWUgPSBtb3ZlTmV4dChjdHgpO1xuICAgICAgICB2YXIgZG9uZSA9IHZhbHVlID09PSBjdHg7XG4gICAgICAgIGlmIChkb25lKVxuICAgICAgICAgIHZhbHVlID0gY3R4LnJldHVyblZhbHVlO1xuICAgICAgICBjdHguR1N0YXRlID0gZG9uZSA/IFNUX0NMT1NFRCA6IFNUX1NVU1BFTkRFRDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgZG9uZTogZG9uZVxuICAgICAgICB9O1xuICAgIH1cbiAgfVxuICB2YXIgY3R4TmFtZSA9IGNyZWF0ZVByaXZhdGVOYW1lKCk7XG4gIHZhciBtb3ZlTmV4dE5hbWUgPSBjcmVhdGVQcml2YXRlTmFtZSgpO1xuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvbigpIHt9XG4gIGZ1bmN0aW9uIEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlKCkge31cbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGU7XG4gICRkZWZpbmVQcm9wZXJ0eShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSwgJ2NvbnN0cnVjdG9yJywgbm9uRW51bShHZW5lcmF0b3JGdW5jdGlvbikpO1xuICBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlLFxuICAgIG5leHQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiBuZXh0T3JUaHJvdyh0aGlzW2N0eE5hbWVdLCB0aGlzW21vdmVOZXh0TmFtZV0sICduZXh0Jywgdik7XG4gICAgfSxcbiAgICB0aHJvdzogZnVuY3Rpb24odikge1xuICAgICAgcmV0dXJuIG5leHRPclRocm93KHRoaXNbY3R4TmFtZV0sIHRoaXNbbW92ZU5leHROYW1lXSwgJ3Rocm93Jywgdik7XG4gICAgfVxuICB9O1xuICAkZGVmaW5lUHJvcGVydGllcyhHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge2VudW1lcmFibGU6IGZhbHNlfSxcbiAgICBuZXh0OiB7ZW51bWVyYWJsZTogZmFsc2V9LFxuICAgIHRocm93OiB7ZW51bWVyYWJsZTogZmFsc2V9XG4gIH0pO1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlLCBTeW1ib2wuaXRlcmF0b3IsIG5vbkVudW0oZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0pKTtcbiAgZnVuY3Rpb24gY3JlYXRlR2VuZXJhdG9ySW5zdGFuY2UoaW5uZXJGdW5jdGlvbiwgZnVuY3Rpb25PYmplY3QsIHNlbGYpIHtcbiAgICB2YXIgbW92ZU5leHQgPSBnZXRNb3ZlTmV4dChpbm5lckZ1bmN0aW9uLCBzZWxmKTtcbiAgICB2YXIgY3R4ID0gbmV3IEdlbmVyYXRvckNvbnRleHQoKTtcbiAgICB2YXIgb2JqZWN0ID0gJGNyZWF0ZShmdW5jdGlvbk9iamVjdC5wcm90b3R5cGUpO1xuICAgIG9iamVjdFtjdHhOYW1lXSA9IGN0eDtcbiAgICBvYmplY3RbbW92ZU5leHROYW1lXSA9IG1vdmVOZXh0O1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uT2JqZWN0KSB7XG4gICAgZnVuY3Rpb25PYmplY3QucHJvdG90eXBlID0gJGNyZWF0ZShHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZS5wcm90b3R5cGUpO1xuICAgIGZ1bmN0aW9uT2JqZWN0Ll9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIHJldHVybiBmdW5jdGlvbk9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBBc3luY0Z1bmN0aW9uQ29udGV4dCgpIHtcbiAgICBHZW5lcmF0b3JDb250ZXh0LmNhbGwodGhpcyk7XG4gICAgdGhpcy5lcnIgPSB1bmRlZmluZWQ7XG4gICAgdmFyIGN0eCA9IHRoaXM7XG4gICAgY3R4LnJlc3VsdCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgY3R4LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgY3R4LnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgfVxuICBBc3luY0Z1bmN0aW9uQ29udGV4dC5wcm90b3R5cGUgPSAkY3JlYXRlKEdlbmVyYXRvckNvbnRleHQucHJvdG90eXBlKTtcbiAgQXN5bmNGdW5jdGlvbkNvbnRleHQucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHN3aXRjaCAodGhpcy5zdGF0ZSkge1xuICAgICAgY2FzZSBFTkRfU1RBVEU6XG4gICAgICAgIHRoaXMucmVzb2x2ZSh0aGlzLnJldHVyblZhbHVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJFVEhST1dfU1RBVEU6XG4gICAgICAgIHRoaXMucmVqZWN0KHRoaXMuc3RvcmVkRXhjZXB0aW9uKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnJlamVjdChnZXRJbnRlcm5hbEVycm9yKHRoaXMuc3RhdGUpKTtcbiAgICB9XG4gIH07XG4gIEFzeW5jRnVuY3Rpb25Db250ZXh0LnByb3RvdHlwZS5oYW5kbGVFeGNlcHRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0YXRlID0gUkVUSFJPV19TVEFURTtcbiAgfTtcbiAgZnVuY3Rpb24gYXN5bmNXcmFwKGlubmVyRnVuY3Rpb24sIHNlbGYpIHtcbiAgICB2YXIgbW92ZU5leHQgPSBnZXRNb3ZlTmV4dChpbm5lckZ1bmN0aW9uLCBzZWxmKTtcbiAgICB2YXIgY3R4ID0gbmV3IEFzeW5jRnVuY3Rpb25Db250ZXh0KCk7XG4gICAgY3R4LmNyZWF0ZUNhbGxiYWNrID0gZnVuY3Rpb24obmV3U3RhdGUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjdHguc3RhdGUgPSBuZXdTdGF0ZTtcbiAgICAgICAgY3R4LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIG1vdmVOZXh0KGN0eCk7XG4gICAgICB9O1xuICAgIH07XG4gICAgY3R4LmVycmJhY2sgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGhhbmRsZUNhdGNoKGN0eCwgZXJyKTtcbiAgICAgIG1vdmVOZXh0KGN0eCk7XG4gICAgfTtcbiAgICBtb3ZlTmV4dChjdHgpO1xuICAgIHJldHVybiBjdHgucmVzdWx0O1xuICB9XG4gIGZ1bmN0aW9uIGdldE1vdmVOZXh0KGlubmVyRnVuY3Rpb24sIHNlbGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oY3R4KSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBpbm5lckZ1bmN0aW9uLmNhbGwoc2VsZiwgY3R4KTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICBoYW5kbGVDYXRjaChjdHgsIGV4KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gaGFuZGxlQ2F0Y2goY3R4LCBleCkge1xuICAgIGN0eC5zdG9yZWRFeGNlcHRpb24gPSBleDtcbiAgICB2YXIgbGFzdCA9IGN0eC50cnlTdGFja19bY3R4LnRyeVN0YWNrXy5sZW5ndGggLSAxXTtcbiAgICBpZiAoIWxhc3QpIHtcbiAgICAgIGN0eC5oYW5kbGVFeGNlcHRpb24oZXgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdHguc3RhdGUgPSBsYXN0LmNhdGNoICE9PSB1bmRlZmluZWQgPyBsYXN0LmNhdGNoIDogbGFzdC5maW5hbGx5O1xuICAgIGlmIChsYXN0LmZpbmFsbHlGYWxsVGhyb3VnaCAhPT0gdW5kZWZpbmVkKVxuICAgICAgY3R4LmZpbmFsbHlGYWxsVGhyb3VnaCA9IGxhc3QuZmluYWxseUZhbGxUaHJvdWdoO1xuICB9XG4gICR0cmFjZXVyUnVudGltZS5hc3luY1dyYXAgPSBhc3luY1dyYXA7XG4gICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24gPSBpbml0R2VuZXJhdG9yRnVuY3Rpb247XG4gICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZSA9IGNyZWF0ZUdlbmVyYXRvckluc3RhbmNlO1xufSkoKTtcbihmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gYnVpbGRGcm9tRW5jb2RlZFBhcnRzKG9wdF9zY2hlbWUsIG9wdF91c2VySW5mbywgb3B0X2RvbWFpbiwgb3B0X3BvcnQsIG9wdF9wYXRoLCBvcHRfcXVlcnlEYXRhLCBvcHRfZnJhZ21lbnQpIHtcbiAgICB2YXIgb3V0ID0gW107XG4gICAgaWYgKG9wdF9zY2hlbWUpIHtcbiAgICAgIG91dC5wdXNoKG9wdF9zY2hlbWUsICc6Jyk7XG4gICAgfVxuICAgIGlmIChvcHRfZG9tYWluKSB7XG4gICAgICBvdXQucHVzaCgnLy8nKTtcbiAgICAgIGlmIChvcHRfdXNlckluZm8pIHtcbiAgICAgICAgb3V0LnB1c2gob3B0X3VzZXJJbmZvLCAnQCcpO1xuICAgICAgfVxuICAgICAgb3V0LnB1c2gob3B0X2RvbWFpbik7XG4gICAgICBpZiAob3B0X3BvcnQpIHtcbiAgICAgICAgb3V0LnB1c2goJzonLCBvcHRfcG9ydCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvcHRfcGF0aCkge1xuICAgICAgb3V0LnB1c2gob3B0X3BhdGgpO1xuICAgIH1cbiAgICBpZiAob3B0X3F1ZXJ5RGF0YSkge1xuICAgICAgb3V0LnB1c2goJz8nLCBvcHRfcXVlcnlEYXRhKTtcbiAgICB9XG4gICAgaWYgKG9wdF9mcmFnbWVudCkge1xuICAgICAgb3V0LnB1c2goJyMnLCBvcHRfZnJhZ21lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0LmpvaW4oJycpO1xuICB9XG4gIDtcbiAgdmFyIHNwbGl0UmUgPSBuZXcgUmVnRXhwKCdeJyArICcoPzonICsgJyhbXjovPyMuXSspJyArICc6KT8nICsgJyg/Oi8vJyArICcoPzooW14vPyNdKilAKT8nICsgJyhbXFxcXHdcXFxcZFxcXFwtXFxcXHUwMTAwLVxcXFx1ZmZmZi4lXSopJyArICcoPzo6KFswLTldKykpPycgKyAnKT8nICsgJyhbXj8jXSspPycgKyAnKD86XFxcXD8oW14jXSopKT8nICsgJyg/OiMoLiopKT8nICsgJyQnKTtcbiAgdmFyIENvbXBvbmVudEluZGV4ID0ge1xuICAgIFNDSEVNRTogMSxcbiAgICBVU0VSX0lORk86IDIsXG4gICAgRE9NQUlOOiAzLFxuICAgIFBPUlQ6IDQsXG4gICAgUEFUSDogNSxcbiAgICBRVUVSWV9EQVRBOiA2LFxuICAgIEZSQUdNRU5UOiA3XG4gIH07XG4gIGZ1bmN0aW9uIHNwbGl0KHVyaSkge1xuICAgIHJldHVybiAodXJpLm1hdGNoKHNwbGl0UmUpKTtcbiAgfVxuICBmdW5jdGlvbiByZW1vdmVEb3RTZWdtZW50cyhwYXRoKSB7XG4gICAgaWYgKHBhdGggPT09ICcvJylcbiAgICAgIHJldHVybiAnLyc7XG4gICAgdmFyIGxlYWRpbmdTbGFzaCA9IHBhdGhbMF0gPT09ICcvJyA/ICcvJyA6ICcnO1xuICAgIHZhciB0cmFpbGluZ1NsYXNoID0gcGF0aC5zbGljZSgtMSkgPT09ICcvJyA/ICcvJyA6ICcnO1xuICAgIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcbiAgICB2YXIgb3V0ID0gW107XG4gICAgdmFyIHVwID0gMDtcbiAgICBmb3IgKHZhciBwb3MgPSAwOyBwb3MgPCBzZWdtZW50cy5sZW5ndGg7IHBvcysrKSB7XG4gICAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRzW3Bvc107XG4gICAgICBzd2l0Y2ggKHNlZ21lbnQpIHtcbiAgICAgICAgY2FzZSAnJzpcbiAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJy4uJzpcbiAgICAgICAgICBpZiAob3V0Lmxlbmd0aClcbiAgICAgICAgICAgIG91dC5wb3AoKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB1cCsrO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIG91dC5wdXNoKHNlZ21lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIWxlYWRpbmdTbGFzaCkge1xuICAgICAgd2hpbGUgKHVwLS0gPiAwKSB7XG4gICAgICAgIG91dC51bnNoaWZ0KCcuLicpO1xuICAgICAgfVxuICAgICAgaWYgKG91dC5sZW5ndGggPT09IDApXG4gICAgICAgIG91dC5wdXNoKCcuJyk7XG4gICAgfVxuICAgIHJldHVybiBsZWFkaW5nU2xhc2ggKyBvdXQuam9pbignLycpICsgdHJhaWxpbmdTbGFzaDtcbiAgfVxuICBmdW5jdGlvbiBqb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cykge1xuICAgIHZhciBwYXRoID0gcGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF0gfHwgJyc7XG4gICAgcGF0aCA9IHJlbW92ZURvdFNlZ21lbnRzKHBhdGgpO1xuICAgIHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdID0gcGF0aDtcbiAgICByZXR1cm4gYnVpbGRGcm9tRW5jb2RlZFBhcnRzKHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlVTRVJfSU5GT10sIHBhcnRzW0NvbXBvbmVudEluZGV4LkRPTUFJTl0sIHBhcnRzW0NvbXBvbmVudEluZGV4LlBPUlRdLCBwYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXSwgcGFydHNbQ29tcG9uZW50SW5kZXguUVVFUllfREFUQV0sIHBhcnRzW0NvbXBvbmVudEluZGV4LkZSQUdNRU5UXSk7XG4gIH1cbiAgZnVuY3Rpb24gY2Fub25pY2FsaXplVXJsKHVybCkge1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0KHVybCk7XG4gICAgcmV0dXJuIGpvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfVxuICBmdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIHVybCkge1xuICAgIHZhciBwYXJ0cyA9IHNwbGl0KHVybCk7XG4gICAgdmFyIGJhc2VQYXJ0cyA9IHNwbGl0KGJhc2UpO1xuICAgIGlmIChwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdKSB7XG4gICAgICByZXR1cm4gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0c1tDb21wb25lbnRJbmRleC5TQ0hFTUVdID0gYmFzZVBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV07XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBDb21wb25lbnRJbmRleC5TQ0hFTUU7IGkgPD0gQ29tcG9uZW50SW5kZXguUE9SVDsgaSsrKSB7XG4gICAgICBpZiAoIXBhcnRzW2ldKSB7XG4gICAgICAgIHBhcnRzW2ldID0gYmFzZVBhcnRzW2ldO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocGFydHNbQ29tcG9uZW50SW5kZXguUEFUSF1bMF0gPT0gJy8nKSB7XG4gICAgICByZXR1cm4gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICAgIH1cbiAgICB2YXIgcGF0aCA9IGJhc2VQYXJ0c1tDb21wb25lbnRJbmRleC5QQVRIXTtcbiAgICB2YXIgaW5kZXggPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgcGF0aCA9IHBhdGguc2xpY2UoMCwgaW5kZXggKyAxKSArIHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdO1xuICAgIHBhcnRzW0NvbXBvbmVudEluZGV4LlBBVEhdID0gcGF0aDtcbiAgICByZXR1cm4gam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICB9XG4gIGZ1bmN0aW9uIGlzQWJzb2x1dGUobmFtZSkge1xuICAgIGlmICghbmFtZSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICBpZiAobmFtZVswXSA9PT0gJy8nKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgdmFyIHBhcnRzID0gc3BsaXQobmFtZSk7XG4gICAgaWYgKHBhcnRzW0NvbXBvbmVudEluZGV4LlNDSEVNRV0pXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgJHRyYWNldXJSdW50aW1lLmNhbm9uaWNhbGl6ZVVybCA9IGNhbm9uaWNhbGl6ZVVybDtcbiAgJHRyYWNldXJSdW50aW1lLmlzQWJzb2x1dGUgPSBpc0Fic29sdXRlO1xuICAkdHJhY2V1clJ1bnRpbWUucmVtb3ZlRG90U2VnbWVudHMgPSByZW1vdmVEb3RTZWdtZW50cztcbiAgJHRyYWNldXJSdW50aW1lLnJlc29sdmVVcmwgPSByZXNvbHZlVXJsO1xufSkoKTtcbihmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgdHlwZXMgPSB7XG4gICAgYW55OiB7bmFtZTogJ2FueSd9LFxuICAgIGJvb2xlYW46IHtuYW1lOiAnYm9vbGVhbid9LFxuICAgIG51bWJlcjoge25hbWU6ICdudW1iZXInfSxcbiAgICBzdHJpbmc6IHtuYW1lOiAnc3RyaW5nJ30sXG4gICAgc3ltYm9sOiB7bmFtZTogJ3N5bWJvbCd9LFxuICAgIHZvaWQ6IHtuYW1lOiAndm9pZCd9XG4gIH07XG4gIHZhciBHZW5lcmljVHlwZSA9IGZ1bmN0aW9uIEdlbmVyaWNUeXBlKHR5cGUsIGFyZ3VtZW50VHlwZXMpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuYXJndW1lbnRUeXBlcyA9IGFyZ3VtZW50VHlwZXM7XG4gIH07XG4gICgkdHJhY2V1clJ1bnRpbWUuY3JlYXRlQ2xhc3MpKEdlbmVyaWNUeXBlLCB7fSwge30pO1xuICB2YXIgdHlwZVJlZ2lzdGVyID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgZnVuY3Rpb24gZ2VuZXJpY1R5cGUodHlwZSkge1xuICAgIGZvciAodmFyIGFyZ3VtZW50VHlwZXMgPSBbXSxcbiAgICAgICAgJF9fMSA9IDE7ICRfXzEgPCBhcmd1bWVudHMubGVuZ3RoOyAkX18xKyspXG4gICAgICBhcmd1bWVudFR5cGVzWyRfXzEgLSAxXSA9IGFyZ3VtZW50c1skX18xXTtcbiAgICB2YXIgdHlwZU1hcCA9IHR5cGVSZWdpc3RlcjtcbiAgICB2YXIga2V5ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3QodHlwZSkuaGFzaDtcbiAgICBpZiAoIXR5cGVNYXBba2V5XSkge1xuICAgICAgdHlwZU1hcFtrZXldID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG4gICAgdHlwZU1hcCA9IHR5cGVNYXBba2V5XTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50VHlwZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICBrZXkgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdChhcmd1bWVudFR5cGVzW2ldKS5oYXNoO1xuICAgICAgaWYgKCF0eXBlTWFwW2tleV0pIHtcbiAgICAgICAgdHlwZU1hcFtrZXldID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIH1cbiAgICAgIHR5cGVNYXAgPSB0eXBlTWFwW2tleV07XG4gICAgfVxuICAgIHZhciB0YWlsID0gYXJndW1lbnRUeXBlc1thcmd1bWVudFR5cGVzLmxlbmd0aCAtIDFdO1xuICAgIGtleSA9ICR0cmFjZXVyUnVudGltZS5nZXRPd25IYXNoT2JqZWN0KHRhaWwpLmhhc2g7XG4gICAgaWYgKCF0eXBlTWFwW2tleV0pIHtcbiAgICAgIHR5cGVNYXBba2V5XSA9IG5ldyBHZW5lcmljVHlwZSh0eXBlLCBhcmd1bWVudFR5cGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVNYXBba2V5XTtcbiAgfVxuICAkdHJhY2V1clJ1bnRpbWUuR2VuZXJpY1R5cGUgPSBHZW5lcmljVHlwZTtcbiAgJHRyYWNldXJSdW50aW1lLmdlbmVyaWNUeXBlID0gZ2VuZXJpY1R5cGU7XG4gICR0cmFjZXVyUnVudGltZS50eXBlID0gdHlwZXM7XG59KSgpO1xuKGZ1bmN0aW9uKGdsb2JhbCkge1xuICAndXNlIHN0cmljdCc7XG4gIHZhciAkX18yID0gJHRyYWNldXJSdW50aW1lLFxuICAgICAgY2Fub25pY2FsaXplVXJsID0gJF9fMi5jYW5vbmljYWxpemVVcmwsXG4gICAgICByZXNvbHZlVXJsID0gJF9fMi5yZXNvbHZlVXJsLFxuICAgICAgaXNBYnNvbHV0ZSA9ICRfXzIuaXNBYnNvbHV0ZTtcbiAgdmFyIG1vZHVsZUluc3RhbnRpYXRvcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgYmFzZVVSTDtcbiAgaWYgKGdsb2JhbC5sb2NhdGlvbiAmJiBnbG9iYWwubG9jYXRpb24uaHJlZilcbiAgICBiYXNlVVJMID0gcmVzb2x2ZVVybChnbG9iYWwubG9jYXRpb24uaHJlZiwgJy4vJyk7XG4gIGVsc2VcbiAgICBiYXNlVVJMID0gJyc7XG4gIHZhciBVbmNvYXRlZE1vZHVsZUVudHJ5ID0gZnVuY3Rpb24gVW5jb2F0ZWRNb2R1bGVFbnRyeSh1cmwsIHVuY29hdGVkTW9kdWxlKSB7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gICAgdGhpcy52YWx1ZV8gPSB1bmNvYXRlZE1vZHVsZTtcbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoVW5jb2F0ZWRNb2R1bGVFbnRyeSwge30sIHt9KTtcbiAgdmFyIE1vZHVsZUV2YWx1YXRpb25FcnJvciA9IGZ1bmN0aW9uIE1vZHVsZUV2YWx1YXRpb25FcnJvcihlcnJvbmVvdXNNb2R1bGVOYW1lLCBjYXVzZSkge1xuICAgIHRoaXMubWVzc2FnZSA9IHRoaXMuY29uc3RydWN0b3IubmFtZSArICc6ICcgKyB0aGlzLnN0cmlwQ2F1c2UoY2F1c2UpICsgJyBpbiAnICsgZXJyb25lb3VzTW9kdWxlTmFtZTtcbiAgICBpZiAoIShjYXVzZSBpbnN0YW5jZW9mICRNb2R1bGVFdmFsdWF0aW9uRXJyb3IpICYmIGNhdXNlLnN0YWNrKVxuICAgICAgdGhpcy5zdGFjayA9IHRoaXMuc3RyaXBTdGFjayhjYXVzZS5zdGFjayk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zdGFjayA9ICcnO1xuICB9O1xuICB2YXIgJE1vZHVsZUV2YWx1YXRpb25FcnJvciA9IE1vZHVsZUV2YWx1YXRpb25FcnJvcjtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoTW9kdWxlRXZhbHVhdGlvbkVycm9yLCB7XG4gICAgc3RyaXBFcnJvcjogZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZSgvLipFcnJvcjovLCB0aGlzLmNvbnN0cnVjdG9yLm5hbWUgKyAnOicpO1xuICAgIH0sXG4gICAgc3RyaXBDYXVzZTogZnVuY3Rpb24oY2F1c2UpIHtcbiAgICAgIGlmICghY2F1c2UpXG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIGlmICghY2F1c2UubWVzc2FnZSlcbiAgICAgICAgcmV0dXJuIGNhdXNlICsgJyc7XG4gICAgICByZXR1cm4gdGhpcy5zdHJpcEVycm9yKGNhdXNlLm1lc3NhZ2UpO1xuICAgIH0sXG4gICAgbG9hZGVkQnk6IGZ1bmN0aW9uKG1vZHVsZU5hbWUpIHtcbiAgICAgIHRoaXMuc3RhY2sgKz0gJ1xcbiBsb2FkZWQgYnkgJyArIG1vZHVsZU5hbWU7XG4gICAgfSxcbiAgICBzdHJpcFN0YWNrOiBmdW5jdGlvbihjYXVzZVN0YWNrKSB7XG4gICAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICAgIGNhdXNlU3RhY2suc3BsaXQoJ1xcbicpLnNvbWUoKGZ1bmN0aW9uKGZyYW1lKSB7XG4gICAgICAgIGlmICgvVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IvLnRlc3QoZnJhbWUpKVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBzdGFjay5wdXNoKGZyYW1lKTtcbiAgICAgIH0pKTtcbiAgICAgIHN0YWNrWzBdID0gdGhpcy5zdHJpcEVycm9yKHN0YWNrWzBdKTtcbiAgICAgIHJldHVybiBzdGFjay5qb2luKCdcXG4nKTtcbiAgICB9XG4gIH0sIHt9LCBFcnJvcik7XG4gIGZ1bmN0aW9uIGJlZm9yZUxpbmVzKGxpbmVzLCBudW1iZXIpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGZpcnN0ID0gbnVtYmVyIC0gMztcbiAgICBpZiAoZmlyc3QgPCAwKVxuICAgICAgZmlyc3QgPSAwO1xuICAgIGZvciAodmFyIGkgPSBmaXJzdDsgaSA8IG51bWJlcjsgaSsrKSB7XG4gICAgICByZXN1bHQucHVzaChsaW5lc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gYWZ0ZXJMaW5lcyhsaW5lcywgbnVtYmVyKSB7XG4gICAgdmFyIGxhc3QgPSBudW1iZXIgKyAxO1xuICAgIGlmIChsYXN0ID4gbGluZXMubGVuZ3RoIC0gMSlcbiAgICAgIGxhc3QgPSBsaW5lcy5sZW5ndGggLSAxO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gbnVtYmVyOyBpIDw9IGxhc3Q7IGkrKykge1xuICAgICAgcmVzdWx0LnB1c2gobGluZXNbaV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGZ1bmN0aW9uIGNvbHVtblNwYWNpbmcoY29sdW1ucykge1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvbHVtbnMgLSAxOyBpKyspIHtcbiAgICAgIHJlc3VsdCArPSAnLSc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgdmFyIFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yID0gZnVuY3Rpb24gVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IodXJsLCBmdW5jKSB7XG4gICAgJHRyYWNldXJSdW50aW1lLnN1cGVyQ29uc3RydWN0b3IoJFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKS5jYWxsKHRoaXMsIHVybCwgbnVsbCk7XG4gICAgdGhpcy5mdW5jID0gZnVuYztcbiAgfTtcbiAgdmFyICRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvciA9IFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yO1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvciwge2dldFVuY29hdGVkTW9kdWxlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlXylcbiAgICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmFyIHJlbGF0aXZlUmVxdWlyZTtcbiAgICAgICAgaWYgKHR5cGVvZiAkdHJhY2V1clJ1bnRpbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHJlbGF0aXZlUmVxdWlyZSA9ICR0cmFjZXVyUnVudGltZS5yZXF1aXJlLmJpbmQobnVsbCwgdGhpcy51cmwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnZhbHVlXyA9IHRoaXMuZnVuYy5jYWxsKGdsb2JhbCwgcmVsYXRpdmVSZXF1aXJlKTtcbiAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgIGlmIChleCBpbnN0YW5jZW9mIE1vZHVsZUV2YWx1YXRpb25FcnJvcikge1xuICAgICAgICAgIGV4LmxvYWRlZEJ5KHRoaXMudXJsKTtcbiAgICAgICAgICB0aHJvdyBleDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXguc3RhY2spIHtcbiAgICAgICAgICB2YXIgbGluZXMgPSB0aGlzLmZ1bmMudG9TdHJpbmcoKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgdmFyIGV2YWxlZCA9IFtdO1xuICAgICAgICAgIGV4LnN0YWNrLnNwbGl0KCdcXG4nKS5zb21lKGZ1bmN0aW9uKGZyYW1lKSB7XG4gICAgICAgICAgICBpZiAoZnJhbWUuaW5kZXhPZignVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3IuZ2V0VW5jb2F0ZWRNb2R1bGUnKSA+IDApXG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgdmFyIG0gPSAvKGF0XFxzW15cXHNdKlxccykuKj46KFxcZCopOihcXGQqKVxcKS8uZXhlYyhmcmFtZSk7XG4gICAgICAgICAgICBpZiAobSkge1xuICAgICAgICAgICAgICB2YXIgbGluZSA9IHBhcnNlSW50KG1bMl0sIDEwKTtcbiAgICAgICAgICAgICAgZXZhbGVkID0gZXZhbGVkLmNvbmNhdChiZWZvcmVMaW5lcyhsaW5lcywgbGluZSkpO1xuICAgICAgICAgICAgICBldmFsZWQucHVzaChjb2x1bW5TcGFjaW5nKG1bM10pICsgJ14nKTtcbiAgICAgICAgICAgICAgZXZhbGVkID0gZXZhbGVkLmNvbmNhdChhZnRlckxpbmVzKGxpbmVzLCBsaW5lKSk7XG4gICAgICAgICAgICAgIGV2YWxlZC5wdXNoKCc9ID0gPSA9ID0gPSA9ID0gPScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZXZhbGVkLnB1c2goZnJhbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGV4LnN0YWNrID0gZXZhbGVkLmpvaW4oJ1xcbicpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBNb2R1bGVFdmFsdWF0aW9uRXJyb3IodGhpcy51cmwsIGV4KTtcbiAgICAgIH1cbiAgICB9fSwge30sIFVuY29hdGVkTW9kdWxlRW50cnkpO1xuICBmdW5jdGlvbiBnZXRVbmNvYXRlZE1vZHVsZUluc3RhbnRpYXRvcihuYW1lKSB7XG4gICAgaWYgKCFuYW1lKVxuICAgICAgcmV0dXJuO1xuICAgIHZhciB1cmwgPSBNb2R1bGVTdG9yZS5ub3JtYWxpemUobmFtZSk7XG4gICAgcmV0dXJuIG1vZHVsZUluc3RhbnRpYXRvcnNbdXJsXTtcbiAgfVxuICA7XG4gIHZhciBtb2R1bGVJbnN0YW5jZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgbGl2ZU1vZHVsZVNlbnRpbmVsID0ge307XG4gIGZ1bmN0aW9uIE1vZHVsZSh1bmNvYXRlZE1vZHVsZSkge1xuICAgIHZhciBpc0xpdmUgPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIGNvYXRlZE1vZHVsZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModW5jb2F0ZWRNb2R1bGUpLmZvckVhY2goKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBnZXR0ZXIsXG4gICAgICAgICAgdmFsdWU7XG4gICAgICBpZiAoaXNMaXZlID09PSBsaXZlTW9kdWxlU2VudGluZWwpIHtcbiAgICAgICAgdmFyIGRlc2NyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih1bmNvYXRlZE1vZHVsZSwgbmFtZSk7XG4gICAgICAgIGlmIChkZXNjci5nZXQpXG4gICAgICAgICAgZ2V0dGVyID0gZGVzY3IuZ2V0O1xuICAgICAgfVxuICAgICAgaWYgKCFnZXR0ZXIpIHtcbiAgICAgICAgdmFsdWUgPSB1bmNvYXRlZE1vZHVsZVtuYW1lXTtcbiAgICAgICAgZ2V0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvYXRlZE1vZHVsZSwgbmFtZSwge1xuICAgICAgICBnZXQ6IGdldHRlcixcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSkpO1xuICAgIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhjb2F0ZWRNb2R1bGUpO1xuICAgIHJldHVybiBjb2F0ZWRNb2R1bGU7XG4gIH1cbiAgdmFyIE1vZHVsZVN0b3JlID0ge1xuICAgIG5vcm1hbGl6ZTogZnVuY3Rpb24obmFtZSwgcmVmZXJlck5hbWUsIHJlZmVyZXJBZGRyZXNzKSB7XG4gICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtb2R1bGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nLCBub3QgJyArIHR5cGVvZiBuYW1lKTtcbiAgICAgIGlmIChpc0Fic29sdXRlKG5hbWUpKVxuICAgICAgICByZXR1cm4gY2Fub25pY2FsaXplVXJsKG5hbWUpO1xuICAgICAgaWYgKC9bXlxcLl1cXC9cXC5cXC5cXC8vLnRlc3QobmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdtb2R1bGUgbmFtZSBlbWJlZHMgLy4uLzogJyArIG5hbWUpO1xuICAgICAgfVxuICAgICAgaWYgKG5hbWVbMF0gPT09ICcuJyAmJiByZWZlcmVyTmFtZSlcbiAgICAgICAgcmV0dXJuIHJlc29sdmVVcmwocmVmZXJlck5hbWUsIG5hbWUpO1xuICAgICAgcmV0dXJuIGNhbm9uaWNhbGl6ZVVybChuYW1lKTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24obm9ybWFsaXplZE5hbWUpIHtcbiAgICAgIHZhciBtID0gZ2V0VW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3Iobm9ybWFsaXplZE5hbWUpO1xuICAgICAgaWYgKCFtKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgdmFyIG1vZHVsZUluc3RhbmNlID0gbW9kdWxlSW5zdGFuY2VzW20udXJsXTtcbiAgICAgIGlmIChtb2R1bGVJbnN0YW5jZSlcbiAgICAgICAgcmV0dXJuIG1vZHVsZUluc3RhbmNlO1xuICAgICAgbW9kdWxlSW5zdGFuY2UgPSBNb2R1bGUobS5nZXRVbmNvYXRlZE1vZHVsZSgpLCBsaXZlTW9kdWxlU2VudGluZWwpO1xuICAgICAgcmV0dXJuIG1vZHVsZUluc3RhbmNlc1ttLnVybF0gPSBtb2R1bGVJbnN0YW5jZTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24obm9ybWFsaXplZE5hbWUsIG1vZHVsZSkge1xuICAgICAgbm9ybWFsaXplZE5hbWUgPSBTdHJpbmcobm9ybWFsaXplZE5hbWUpO1xuICAgICAgbW9kdWxlSW5zdGFudGlhdG9yc1tub3JtYWxpemVkTmFtZV0gPSBuZXcgVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3Iobm9ybWFsaXplZE5hbWUsIChmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIG1vZHVsZTtcbiAgICAgIH0pKTtcbiAgICAgIG1vZHVsZUluc3RhbmNlc1tub3JtYWxpemVkTmFtZV0gPSBtb2R1bGU7XG4gICAgfSxcbiAgICBnZXQgYmFzZVVSTCgpIHtcbiAgICAgIHJldHVybiBiYXNlVVJMO1xuICAgIH0sXG4gICAgc2V0IGJhc2VVUkwodikge1xuICAgICAgYmFzZVVSTCA9IFN0cmluZyh2KTtcbiAgICB9LFxuICAgIHJlZ2lzdGVyTW9kdWxlOiBmdW5jdGlvbihuYW1lLCBkZXBzLCBmdW5jKSB7XG4gICAgICB2YXIgbm9ybWFsaXplZE5hbWUgPSBNb2R1bGVTdG9yZS5ub3JtYWxpemUobmFtZSk7XG4gICAgICBpZiAobW9kdWxlSW5zdGFudGlhdG9yc1tub3JtYWxpemVkTmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZHVwbGljYXRlIG1vZHVsZSBuYW1lZCAnICsgbm9ybWFsaXplZE5hbWUpO1xuICAgICAgbW9kdWxlSW5zdGFudGlhdG9yc1tub3JtYWxpemVkTmFtZV0gPSBuZXcgVW5jb2F0ZWRNb2R1bGVJbnN0YW50aWF0b3Iobm9ybWFsaXplZE5hbWUsIGZ1bmMpO1xuICAgIH0sXG4gICAgYnVuZGxlU3RvcmU6IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uKG5hbWUsIGRlcHMsIGZ1bmMpIHtcbiAgICAgIGlmICghZGVwcyB8fCAhZGVwcy5sZW5ndGggJiYgIWZ1bmMubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJNb2R1bGUobmFtZSwgZGVwcywgZnVuYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmJ1bmRsZVN0b3JlW25hbWVdID0ge1xuICAgICAgICAgIGRlcHM6IGRlcHMsXG4gICAgICAgICAgZXhlY3V0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgJF9fMCA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHZhciBkZXBNYXAgPSB7fTtcbiAgICAgICAgICAgIGRlcHMuZm9yRWFjaCgoZnVuY3Rpb24oZGVwLCBpbmRleCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVwTWFwW2RlcF0gPSAkX18wW2luZGV4XTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHZhciByZWdpc3RyeUVudHJ5ID0gZnVuYy5jYWxsKHRoaXMsIGRlcE1hcCk7XG4gICAgICAgICAgICByZWdpc3RyeUVudHJ5LmV4ZWN1dGUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiByZWdpc3RyeUVudHJ5LmV4cG9ydHM7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0QW5vbnltb3VzTW9kdWxlOiBmdW5jdGlvbihmdW5jKSB7XG4gICAgICByZXR1cm4gbmV3IE1vZHVsZShmdW5jLmNhbGwoZ2xvYmFsKSwgbGl2ZU1vZHVsZVNlbnRpbmVsKTtcbiAgICB9LFxuICAgIGdldEZvclRlc3Rpbmc6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciAkX18wID0gdGhpcztcbiAgICAgIGlmICghdGhpcy50ZXN0aW5nUHJlZml4Xykge1xuICAgICAgICBPYmplY3Qua2V5cyhtb2R1bGVJbnN0YW5jZXMpLnNvbWUoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgIHZhciBtID0gLyh0cmFjZXVyQFteXFwvXSpcXC8pLy5leGVjKGtleSk7XG4gICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICRfXzAudGVzdGluZ1ByZWZpeF8gPSBtWzFdO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5nZXQodGhpcy50ZXN0aW5nUHJlZml4XyArIG5hbWUpO1xuICAgIH1cbiAgfTtcbiAgdmFyIG1vZHVsZVN0b3JlTW9kdWxlID0gbmV3IE1vZHVsZSh7TW9kdWxlU3RvcmU6IE1vZHVsZVN0b3JlfSk7XG4gIE1vZHVsZVN0b3JlLnNldCgnQHRyYWNldXIvc3JjL3J1bnRpbWUvTW9kdWxlU3RvcmUnLCBtb2R1bGVTdG9yZU1vZHVsZSk7XG4gIE1vZHVsZVN0b3JlLnNldCgnQHRyYWNldXIvc3JjL3J1bnRpbWUvTW9kdWxlU3RvcmUuanMnLCBtb2R1bGVTdG9yZU1vZHVsZSk7XG4gIHZhciBzZXR1cEdsb2JhbHMgPSAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzO1xuICAkdHJhY2V1clJ1bnRpbWUuc2V0dXBHbG9iYWxzID0gZnVuY3Rpb24oZ2xvYmFsKSB7XG4gICAgc2V0dXBHbG9iYWxzKGdsb2JhbCk7XG4gIH07XG4gICR0cmFjZXVyUnVudGltZS5Nb2R1bGVTdG9yZSA9IE1vZHVsZVN0b3JlO1xuICBnbG9iYWwuU3lzdGVtID0ge1xuICAgIHJlZ2lzdGVyOiBNb2R1bGVTdG9yZS5yZWdpc3Rlci5iaW5kKE1vZHVsZVN0b3JlKSxcbiAgICByZWdpc3Rlck1vZHVsZTogTW9kdWxlU3RvcmUucmVnaXN0ZXJNb2R1bGUuYmluZChNb2R1bGVTdG9yZSksXG4gICAgZ2V0OiBNb2R1bGVTdG9yZS5nZXQsXG4gICAgc2V0OiBNb2R1bGVTdG9yZS5zZXQsXG4gICAgbm9ybWFsaXplOiBNb2R1bGVTdG9yZS5ub3JtYWxpemVcbiAgfTtcbiAgJHRyYWNldXJSdW50aW1lLmdldE1vZHVsZUltcGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGluc3RhbnRpYXRvciA9IGdldFVuY29hdGVkTW9kdWxlSW5zdGFudGlhdG9yKG5hbWUpO1xuICAgIHJldHVybiBpbnN0YW50aWF0b3IgJiYgaW5zdGFudGlhdG9yLmdldFVuY29hdGVkTW9kdWxlKCk7XG4gIH07XG59KSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIjtcbiAgdmFyICRjZWlsID0gTWF0aC5jZWlsO1xuICB2YXIgJGZsb29yID0gTWF0aC5mbG9vcjtcbiAgdmFyICRpc0Zpbml0ZSA9IGlzRmluaXRlO1xuICB2YXIgJGlzTmFOID0gaXNOYU47XG4gIHZhciAkcG93ID0gTWF0aC5wb3c7XG4gIHZhciAkbWluID0gTWF0aC5taW47XG4gIHZhciB0b09iamVjdCA9ICR0cmFjZXVyUnVudGltZS50b09iamVjdDtcbiAgZnVuY3Rpb24gdG9VaW50MzIoeCkge1xuICAgIHJldHVybiB4ID4+PiAwO1xuICB9XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiBpc0NhbGxhYmxlKHgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbic7XG4gIH1cbiAgZnVuY3Rpb24gaXNOdW1iZXIoeCkge1xuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ251bWJlcic7XG4gIH1cbiAgZnVuY3Rpb24gdG9JbnRlZ2VyKHgpIHtcbiAgICB4ID0gK3g7XG4gICAgaWYgKCRpc05hTih4KSlcbiAgICAgIHJldHVybiAwO1xuICAgIGlmICh4ID09PSAwIHx8ICEkaXNGaW5pdGUoeCkpXG4gICAgICByZXR1cm4geDtcbiAgICByZXR1cm4geCA+IDAgPyAkZmxvb3IoeCkgOiAkY2VpbCh4KTtcbiAgfVxuICB2YXIgTUFYX1NBRkVfTEVOR1RIID0gJHBvdygyLCA1MykgLSAxO1xuICBmdW5jdGlvbiB0b0xlbmd0aCh4KSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcih4KTtcbiAgICByZXR1cm4gbGVuIDwgMCA/IDAgOiAkbWluKGxlbiwgTUFYX1NBRkVfTEVOR1RIKTtcbiAgfVxuICBmdW5jdGlvbiBjaGVja0l0ZXJhYmxlKHgpIHtcbiAgICByZXR1cm4gIWlzT2JqZWN0KHgpID8gdW5kZWZpbmVkIDogeFtTeW1ib2wuaXRlcmF0b3JdO1xuICB9XG4gIGZ1bmN0aW9uIGlzQ29uc3RydWN0b3IoeCkge1xuICAgIHJldHVybiBpc0NhbGxhYmxlKHgpO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHZhbHVlLCBkb25lKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGRvbmU6IGRvbmVcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwgZGVzY3IpIHtcbiAgICBpZiAoIShuYW1lIGluIG9iamVjdCkpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmplY3QsIG5hbWUsIGRlc2NyKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVEZWZpbmVNZXRob2Qob2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIG1heWJlRGVmaW5lQ29uc3Qob2JqZWN0LCBuYW1lLCB2YWx1ZSkge1xuICAgIG1heWJlRGVmaW5lKG9iamVjdCwgbmFtZSwge1xuICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IGZhbHNlXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF5YmVBZGRGdW5jdGlvbnMob2JqZWN0LCBmdW5jdGlvbnMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZ1bmN0aW9ucy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgdmFyIG5hbWUgPSBmdW5jdGlvbnNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBmdW5jdGlvbnNbaSArIDFdO1xuICAgICAgbWF5YmVEZWZpbmVNZXRob2Qob2JqZWN0LCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1heWJlQWRkQ29uc3RzKG9iamVjdCwgY29uc3RzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25zdHMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgIHZhciBuYW1lID0gY29uc3RzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gY29uc3RzW2kgKyAxXTtcbiAgICAgIG1heWJlRGVmaW5lQ29uc3Qob2JqZWN0LCBuYW1lLCB2YWx1ZSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1heWJlQWRkSXRlcmF0b3Iob2JqZWN0LCBmdW5jLCBTeW1ib2wpIHtcbiAgICBpZiAoIVN5bWJvbCB8fCAhU3ltYm9sLml0ZXJhdG9yIHx8IG9iamVjdFtTeW1ib2wuaXRlcmF0b3JdKVxuICAgICAgcmV0dXJuO1xuICAgIGlmIChvYmplY3RbJ0BAaXRlcmF0b3InXSlcbiAgICAgIGZ1bmMgPSBvYmplY3RbJ0BAaXRlcmF0b3InXTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqZWN0LCBTeW1ib2wuaXRlcmF0b3IsIHtcbiAgICAgIHZhbHVlOiBmdW5jLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG4gIHZhciBwb2x5ZmlsbHMgPSBbXTtcbiAgZnVuY3Rpb24gcmVnaXN0ZXJQb2x5ZmlsbChmdW5jKSB7XG4gICAgcG9seWZpbGxzLnB1c2goZnVuYyk7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxBbGwoZ2xvYmFsKSB7XG4gICAgcG9seWZpbGxzLmZvckVhY2goKGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmKGdsb2JhbCk7XG4gICAgfSkpO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0IHRvT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIHRvT2JqZWN0O1xuICAgIH0sXG4gICAgZ2V0IHRvVWludDMyKCkge1xuICAgICAgcmV0dXJuIHRvVWludDMyO1xuICAgIH0sXG4gICAgZ2V0IGlzT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIGlzT2JqZWN0O1xuICAgIH0sXG4gICAgZ2V0IGlzQ2FsbGFibGUoKSB7XG4gICAgICByZXR1cm4gaXNDYWxsYWJsZTtcbiAgICB9LFxuICAgIGdldCBpc051bWJlcigpIHtcbiAgICAgIHJldHVybiBpc051bWJlcjtcbiAgICB9LFxuICAgIGdldCB0b0ludGVnZXIoKSB7XG4gICAgICByZXR1cm4gdG9JbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IHRvTGVuZ3RoKCkge1xuICAgICAgcmV0dXJuIHRvTGVuZ3RoO1xuICAgIH0sXG4gICAgZ2V0IGNoZWNrSXRlcmFibGUoKSB7XG4gICAgICByZXR1cm4gY2hlY2tJdGVyYWJsZTtcbiAgICB9LFxuICAgIGdldCBpc0NvbnN0cnVjdG9yKCkge1xuICAgICAgcmV0dXJuIGlzQ29uc3RydWN0b3I7XG4gICAgfSxcbiAgICBnZXQgY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmUoKSB7XG4gICAgICByZXR1cm4gbWF5YmVEZWZpbmU7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmVNZXRob2QoKSB7XG4gICAgICByZXR1cm4gbWF5YmVEZWZpbmVNZXRob2Q7XG4gICAgfSxcbiAgICBnZXQgbWF5YmVEZWZpbmVDb25zdCgpIHtcbiAgICAgIHJldHVybiBtYXliZURlZmluZUNvbnN0O1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkRnVuY3Rpb25zKCkge1xuICAgICAgcmV0dXJuIG1heWJlQWRkRnVuY3Rpb25zO1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkQ29uc3RzKCkge1xuICAgICAgcmV0dXJuIG1heWJlQWRkQ29uc3RzO1xuICAgIH0sXG4gICAgZ2V0IG1heWJlQWRkSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gbWF5YmVBZGRJdGVyYXRvcjtcbiAgICB9LFxuICAgIGdldCByZWdpc3RlclBvbHlmaWxsKCkge1xuICAgICAgcmV0dXJuIHJlZ2lzdGVyUG9seWZpbGw7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxBbGwoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxBbGw7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9NYXAuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTWFwLmpzXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzLmpzXCIpLFxuICAgICAgaXNPYmplY3QgPSAkX18wLmlzT2JqZWN0LFxuICAgICAgbWF5YmVBZGRJdGVyYXRvciA9ICRfXzAubWF5YmVBZGRJdGVyYXRvcixcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciBnZXRPd25IYXNoT2JqZWN0ID0gJHRyYWNldXJSdW50aW1lLmdldE93bkhhc2hPYmplY3Q7XG4gIHZhciAkaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICB2YXIgZGVsZXRlZFNlbnRpbmVsID0ge307XG4gIGZ1bmN0aW9uIGxvb2t1cEluZGV4KG1hcCwga2V5KSB7XG4gICAgaWYgKGlzT2JqZWN0KGtleSkpIHtcbiAgICAgIHZhciBoYXNoT2JqZWN0ID0gZ2V0T3duSGFzaE9iamVjdChrZXkpO1xuICAgICAgcmV0dXJuIGhhc2hPYmplY3QgJiYgbWFwLm9iamVjdEluZGV4X1toYXNoT2JqZWN0Lmhhc2hdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGtleSA9PT0gJ3N0cmluZycpXG4gICAgICByZXR1cm4gbWFwLnN0cmluZ0luZGV4X1trZXldO1xuICAgIHJldHVybiBtYXAucHJpbWl0aXZlSW5kZXhfW2tleV07XG4gIH1cbiAgZnVuY3Rpb24gaW5pdE1hcChtYXApIHtcbiAgICBtYXAuZW50cmllc18gPSBbXTtcbiAgICBtYXAub2JqZWN0SW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAuc3RyaW5nSW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAucHJpbWl0aXZlSW5kZXhfID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBtYXAuZGVsZXRlZENvdW50XyA9IDA7XG4gIH1cbiAgdmFyIE1hcCA9IGZ1bmN0aW9uIE1hcCgpIHtcbiAgICB2YXIgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgaWYgKCFpc09iamVjdCh0aGlzKSlcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01hcCBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHR5cGUnKTtcbiAgICBpZiAoJGhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ2VudHJpZXNfJykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01hcCBjYW4gbm90IGJlIHJlZW50cmFudGx5IGluaXRpYWxpc2VkJyk7XG4gICAgfVxuICAgIGluaXRNYXAodGhpcyk7XG4gICAgaWYgKGl0ZXJhYmxlICE9PSBudWxsICYmIGl0ZXJhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGZvciAodmFyICRfXzIgPSBpdGVyYWJsZVskdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSgpLFxuICAgICAgICAgICRfXzM7ICEoJF9fMyA9ICRfXzIubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgdmFyICRfXzQgPSAkX18zLnZhbHVlLFxuICAgICAgICAgICAga2V5ID0gJF9fNFswXSxcbiAgICAgICAgICAgIHZhbHVlID0gJF9fNFsxXTtcbiAgICAgICAge1xuICAgICAgICAgIHRoaXMuc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShNYXAsIHtcbiAgICBnZXQgc2l6ZSgpIHtcbiAgICAgIHJldHVybiB0aGlzLmVudHJpZXNfLmxlbmd0aCAvIDIgLSB0aGlzLmRlbGV0ZWRDb3VudF87XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGluZGV4ID0gbG9va3VwSW5kZXgodGhpcywga2V5KTtcbiAgICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcy5lbnRyaWVzX1tpbmRleCArIDFdO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgb2JqZWN0TW9kZSA9IGlzT2JqZWN0KGtleSk7XG4gICAgICB2YXIgc3RyaW5nTW9kZSA9IHR5cGVvZiBrZXkgPT09ICdzdHJpbmcnO1xuICAgICAgdmFyIGluZGV4ID0gbG9va3VwSW5kZXgodGhpcywga2V5KTtcbiAgICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXggKyAxXSA9IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLmVudHJpZXNfLmxlbmd0aDtcbiAgICAgICAgdGhpcy5lbnRyaWVzX1tpbmRleF0gPSBrZXk7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXggKyAxXSA9IHZhbHVlO1xuICAgICAgICBpZiAob2JqZWN0TW9kZSkge1xuICAgICAgICAgIHZhciBoYXNoT2JqZWN0ID0gZ2V0T3duSGFzaE9iamVjdChrZXkpO1xuICAgICAgICAgIHZhciBoYXNoID0gaGFzaE9iamVjdC5oYXNoO1xuICAgICAgICAgIHRoaXMub2JqZWN0SW5kZXhfW2hhc2hdID0gaW5kZXg7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaW5nTW9kZSkge1xuICAgICAgICAgIHRoaXMuc3RyaW5nSW5kZXhfW2tleV0gPSBpbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnByaW1pdGl2ZUluZGV4X1trZXldID0gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBsb29rdXBJbmRleCh0aGlzLCBrZXkpICE9PSB1bmRlZmluZWQ7XG4gICAgfSxcbiAgICBkZWxldGU6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIG9iamVjdE1vZGUgPSBpc09iamVjdChrZXkpO1xuICAgICAgdmFyIHN0cmluZ01vZGUgPSB0eXBlb2Yga2V5ID09PSAnc3RyaW5nJztcbiAgICAgIHZhciBpbmRleDtcbiAgICAgIHZhciBoYXNoO1xuICAgICAgaWYgKG9iamVjdE1vZGUpIHtcbiAgICAgICAgdmFyIGhhc2hPYmplY3QgPSBnZXRPd25IYXNoT2JqZWN0KGtleSk7XG4gICAgICAgIGlmIChoYXNoT2JqZWN0KSB7XG4gICAgICAgICAgaW5kZXggPSB0aGlzLm9iamVjdEluZGV4X1toYXNoID0gaGFzaE9iamVjdC5oYXNoXTtcbiAgICAgICAgICBkZWxldGUgdGhpcy5vYmplY3RJbmRleF9baGFzaF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc3RyaW5nTW9kZSkge1xuICAgICAgICBpbmRleCA9IHRoaXMuc3RyaW5nSW5kZXhfW2tleV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLnN0cmluZ0luZGV4X1trZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5kZXggPSB0aGlzLnByaW1pdGl2ZUluZGV4X1trZXldO1xuICAgICAgICBkZWxldGUgdGhpcy5wcmltaXRpdmVJbmRleF9ba2V5XTtcbiAgICAgIH1cbiAgICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuZW50cmllc19baW5kZXhdID0gZGVsZXRlZFNlbnRpbmVsO1xuICAgICAgICB0aGlzLmVudHJpZXNfW2luZGV4ICsgMV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZGVsZXRlZENvdW50XysrO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICAgIGluaXRNYXAodGhpcyk7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja0ZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIga2V5ID0gdGhpcy5lbnRyaWVzX1tpXTtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5lbnRyaWVzX1tpICsgMV07XG4gICAgICAgIGlmIChrZXkgPT09IGRlbGV0ZWRTZW50aW5lbClcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgY2FsbGJhY2tGbi5jYWxsKHRoaXNBcmcsIHZhbHVlLCBrZXksIHRoaXMpO1xuICAgICAgfVxuICAgIH0sXG4gICAgZW50cmllczogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX181KCkge1xuICAgICAgdmFyIGksXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHZhbHVlO1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoKSA/IDggOiAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAga2V5ID0gdGhpcy5lbnRyaWVzX1tpXTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKSA/IDQgOiA2O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiBba2V5LCB2YWx1ZV07XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHgubWF5YmVUaHJvdygpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gNDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICByZXR1cm4gJGN0eC5lbmQoKTtcbiAgICAgICAgICB9XG4gICAgICB9LCAkX181LCB0aGlzKTtcbiAgICB9KSxcbiAgICBrZXlzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzYoKSB7XG4gICAgICB2YXIgaSxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgdmFsdWU7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IChpIDwgdGhpcy5lbnRyaWVzXy5sZW5ndGgpID8gOCA6IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgaSArPSAyO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMTI7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICBrZXkgPSB0aGlzLmVudHJpZXNfW2ldO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMuZW50cmllc19baSArIDFdO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoa2V5ID09PSBkZWxldGVkU2VudGluZWwpID8gNCA6IDY7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gMjtcbiAgICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5tYXliZVRocm93KCk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzYsIHRoaXMpO1xuICAgIH0pLFxuICAgIHZhbHVlczogJHRyYWNldXJSdW50aW1lLmluaXRHZW5lcmF0b3JGdW5jdGlvbihmdW5jdGlvbiAkX183KCkge1xuICAgICAgdmFyIGksXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHZhbHVlO1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoaSA8IHRoaXMuZW50cmllc18ubGVuZ3RoKSA/IDggOiAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgIGkgKz0gMjtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICAgICAga2V5ID0gdGhpcy5lbnRyaWVzX1tpXTtcbiAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmVudHJpZXNfW2kgKyAxXTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gKGtleSA9PT0gZGVsZXRlZFNlbnRpbmVsKSA/IDQgOiA2O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDI7XG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5tYXliZVRocm93KCk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA0O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzcsIHRoaXMpO1xuICAgIH0pXG4gIH0sIHt9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE1hcC5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogTWFwLnByb3RvdHlwZS5lbnRyaWVzXG4gIH0pO1xuICBmdW5jdGlvbiBwb2x5ZmlsbE1hcChnbG9iYWwpIHtcbiAgICB2YXIgJF9fNCA9IGdsb2JhbCxcbiAgICAgICAgT2JqZWN0ID0gJF9fNC5PYmplY3QsXG4gICAgICAgIFN5bWJvbCA9ICRfXzQuU3ltYm9sO1xuICAgIGlmICghZ2xvYmFsLk1hcClcbiAgICAgIGdsb2JhbC5NYXAgPSBNYXA7XG4gICAgdmFyIG1hcFByb3RvdHlwZSA9IGdsb2JhbC5NYXAucHJvdG90eXBlO1xuICAgIGlmIChtYXBQcm90b3R5cGUuZW50cmllcyA9PT0gdW5kZWZpbmVkKVxuICAgICAgZ2xvYmFsLk1hcCA9IE1hcDtcbiAgICBpZiAobWFwUHJvdG90eXBlLmVudHJpZXMpIHtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IobWFwUHJvdG90eXBlLCBtYXBQcm90b3R5cGUuZW50cmllcywgU3ltYm9sKTtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5ldyBnbG9iYWwuTWFwKCkuZW50cmllcygpKSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfSwgU3ltYm9sKTtcbiAgICB9XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbE1hcCk7XG4gIHJldHVybiB7XG4gICAgZ2V0IE1hcCgpIHtcbiAgICAgIHJldHVybiBNYXA7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxNYXAoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxNYXA7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTWFwLmpzXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXQuanNcIiwgW10sIGZ1bmN0aW9uKCkge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU2V0LmpzXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzLmpzXCIpLFxuICAgICAgaXNPYmplY3QgPSAkX18wLmlzT2JqZWN0LFxuICAgICAgbWF5YmVBZGRJdGVyYXRvciA9ICRfXzAubWF5YmVBZGRJdGVyYXRvcixcbiAgICAgIHJlZ2lzdGVyUG9seWZpbGwgPSAkX18wLnJlZ2lzdGVyUG9seWZpbGw7XG4gIHZhciBNYXAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvTWFwLmpzXCIpLk1hcDtcbiAgdmFyIGdldE93bkhhc2hPYmplY3QgPSAkdHJhY2V1clJ1bnRpbWUuZ2V0T3duSGFzaE9iamVjdDtcbiAgdmFyICRoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIGZ1bmN0aW9uIGluaXRTZXQoc2V0KSB7XG4gICAgc2V0Lm1hcF8gPSBuZXcgTWFwKCk7XG4gIH1cbiAgdmFyIFNldCA9IGZ1bmN0aW9uIFNldCgpIHtcbiAgICB2YXIgaXRlcmFibGUgPSBhcmd1bWVudHNbMF07XG4gICAgaWYgKCFpc09iamVjdCh0aGlzKSlcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1NldCBjYWxsZWQgb24gaW5jb21wYXRpYmxlIHR5cGUnKTtcbiAgICBpZiAoJGhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ21hcF8nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignU2V0IGNhbiBub3QgYmUgcmVlbnRyYW50bHkgaW5pdGlhbGlzZWQnKTtcbiAgICB9XG4gICAgaW5pdFNldCh0aGlzKTtcbiAgICBpZiAoaXRlcmFibGUgIT09IG51bGwgJiYgaXRlcmFibGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZm9yICh2YXIgJF9fNCA9IGl0ZXJhYmxlWyR0cmFjZXVyUnVudGltZS50b1Byb3BlcnR5KFN5bWJvbC5pdGVyYXRvcildKCksXG4gICAgICAgICAgJF9fNTsgISgkX181ID0gJF9fNC5uZXh0KCkpLmRvbmU7ICkge1xuICAgICAgICB2YXIgaXRlbSA9ICRfXzUudmFsdWU7XG4gICAgICAgIHtcbiAgICAgICAgICB0aGlzLmFkZChpdGVtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoU2V0LCB7XG4gICAgZ2V0IHNpemUoKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLnNpemU7XG4gICAgfSxcbiAgICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMubWFwXy5oYXMoa2V5KTtcbiAgICB9LFxuICAgIGFkZDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICB0aGlzLm1hcF8uc2V0KGtleSwga2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgZGVsZXRlOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZGVsZXRlKGtleSk7XG4gICAgfSxcbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5tYXBfLmNsZWFyKCk7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja0ZuKSB7XG4gICAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciAkX18yID0gdGhpcztcbiAgICAgIHJldHVybiB0aGlzLm1hcF8uZm9yRWFjaCgoZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBjYWxsYmFja0ZuLmNhbGwodGhpc0FyZywga2V5LCBrZXksICRfXzIpO1xuICAgICAgfSkpO1xuICAgIH0sXG4gICAgdmFsdWVzOiAkdHJhY2V1clJ1bnRpbWUuaW5pdEdlbmVyYXRvckZ1bmN0aW9uKGZ1bmN0aW9uICRfXzcoKSB7XG4gICAgICB2YXIgJF9fOCxcbiAgICAgICAgICAkX185O1xuICAgICAgcmV0dXJuICR0cmFjZXVyUnVudGltZS5jcmVhdGVHZW5lcmF0b3JJbnN0YW5jZShmdW5jdGlvbigkY3R4KSB7XG4gICAgICAgIHdoaWxlICh0cnVlKVxuICAgICAgICAgIHN3aXRjaCAoJGN0eC5zdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAkX184ID0gdGhpcy5tYXBfLmtleXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX185ID0gJF9fOFskY3R4LmFjdGlvbl0oJGN0eC5zZW50SWdub3JlVGhyb3cpO1xuICAgICAgICAgICAgICAkY3R4LnN0YXRlID0gOTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAoJF9fOS5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IC0yO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9IDEyO1xuICAgICAgICAgICAgICByZXR1cm4gJF9fOS52YWx1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIHJldHVybiAkY3R4LmVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgIH0sICRfXzcsIHRoaXMpO1xuICAgIH0pLFxuICAgIGVudHJpZXM6ICR0cmFjZXVyUnVudGltZS5pbml0R2VuZXJhdG9yRnVuY3Rpb24oZnVuY3Rpb24gJF9fMTAoKSB7XG4gICAgICB2YXIgJF9fMTEsXG4gICAgICAgICAgJF9fMTI7XG4gICAgICByZXR1cm4gJHRyYWNldXJSdW50aW1lLmNyZWF0ZUdlbmVyYXRvckluc3RhbmNlKGZ1bmN0aW9uKCRjdHgpIHtcbiAgICAgICAgd2hpbGUgKHRydWUpXG4gICAgICAgICAgc3dpdGNoICgkY3R4LnN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICRfXzExID0gdGhpcy5tYXBfLmVudHJpZXMoKVtTeW1ib2wuaXRlcmF0b3JdKCk7XG4gICAgICAgICAgICAgICRjdHguc2VudCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgJGN0eC5hY3Rpb24gPSAnbmV4dCc7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgICAkX18xMiA9ICRfXzExWyRjdHguYWN0aW9uXSgkY3R4LnNlbnRJZ25vcmVUaHJvdyk7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSA5O1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgJGN0eC5zdGF0ZSA9ICgkX18xMi5kb25lKSA/IDMgOiAyO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgJGN0eC5zZW50ID0gJF9fMTIudmFsdWU7XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAtMjtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICRjdHguc3RhdGUgPSAxMjtcbiAgICAgICAgICAgICAgcmV0dXJuICRfXzEyLnZhbHVlO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgcmV0dXJuICRjdHguZW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgfSwgJF9fMTAsIHRoaXMpO1xuICAgIH0pXG4gIH0sIHt9KTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFNldC5wcm90b3R5cGUsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogU2V0LnByb3RvdHlwZS52YWx1ZXNcbiAgfSk7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShTZXQucHJvdG90eXBlLCAna2V5cycsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IFNldC5wcm90b3R5cGUudmFsdWVzXG4gIH0pO1xuICBmdW5jdGlvbiBwb2x5ZmlsbFNldChnbG9iYWwpIHtcbiAgICB2YXIgJF9fNiA9IGdsb2JhbCxcbiAgICAgICAgT2JqZWN0ID0gJF9fNi5PYmplY3QsXG4gICAgICAgIFN5bWJvbCA9ICRfXzYuU3ltYm9sO1xuICAgIGlmICghZ2xvYmFsLlNldClcbiAgICAgIGdsb2JhbC5TZXQgPSBTZXQ7XG4gICAgdmFyIHNldFByb3RvdHlwZSA9IGdsb2JhbC5TZXQucHJvdG90eXBlO1xuICAgIGlmIChzZXRQcm90b3R5cGUudmFsdWVzKSB7XG4gICAgICBtYXliZUFkZEl0ZXJhdG9yKHNldFByb3RvdHlwZSwgc2V0UHJvdG90eXBlLnZhbHVlcywgU3ltYm9sKTtcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IoT2JqZWN0LmdldFByb3RvdHlwZU9mKG5ldyBnbG9iYWwuU2V0KCkudmFsdWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9LCBTeW1ib2wpO1xuICAgIH1cbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsU2V0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgU2V0KCkge1xuICAgICAgcmV0dXJuIFNldDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbFNldCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbFNldDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TZXQuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcC5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L25vZGVfbW9kdWxlcy9yc3ZwL2xpYi9yc3ZwL2FzYXAuanNcIjtcbiAgdmFyIGxlbiA9IDA7XG4gIGZ1bmN0aW9uIGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgIHF1ZXVlW2xlbl0gPSBjYWxsYmFjaztcbiAgICBxdWV1ZVtsZW4gKyAxXSA9IGFyZztcbiAgICBsZW4gKz0gMjtcbiAgICBpZiAobGVuID09PSAyKSB7XG4gICAgICBzY2hlZHVsZUZsdXNoKCk7XG4gICAgfVxuICB9XG4gIHZhciAkX19kZWZhdWx0ID0gYXNhcDtcbiAgdmFyIGJyb3dzZXJHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDoge307XG4gIHZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gIHZhciBpc1dvcmtlciA9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG4gIGZ1bmN0aW9uIHVzZU5leHRUaWNrKCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgdmFyIG9ic2VydmVyID0gbmV3IEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKGZsdXNoKTtcbiAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHtjaGFyYWN0ZXJEYXRhOiB0cnVlfSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjaGFubmVsLnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gdXNlU2V0VGltZW91dCgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBzZXRUaW1lb3V0KGZsdXNoLCAxKTtcbiAgICB9O1xuICB9XG4gIHZhciBxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgICAgdmFyIGNhbGxiYWNrID0gcXVldWVbaV07XG4gICAgICB2YXIgYXJnID0gcXVldWVbaSArIDFdO1xuICAgICAgY2FsbGJhY2soYXJnKTtcbiAgICAgIHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgcXVldWVbaSArIDFdID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBsZW4gPSAwO1xuICB9XG4gIHZhciBzY2hlZHVsZUZsdXNoO1xuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJykge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VOZXh0VGljaygpO1xuICB9IGVsc2UgaWYgKEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgc2NoZWR1bGVGbHVzaCA9IHVzZU11dGF0aW9uT2JzZXJ2ZXIoKTtcbiAgfSBlbHNlIGlmIChpc1dvcmtlcikge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICB9IGVsc2Uge1xuICAgIHNjaGVkdWxlRmx1c2ggPSB1c2VTZXRUaW1lb3V0KCk7XG4gIH1cbiAgcmV0dXJuIHtnZXQgZGVmYXVsdCgpIHtcbiAgICAgIHJldHVybiAkX19kZWZhdWx0O1xuICAgIH19O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1Byb21pc2UuanNcIjtcbiAgdmFyIGFzeW5jID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvbm9kZV9tb2R1bGVzL3JzdnAvbGliL3JzdnAvYXNhcC5qc1wiKS5kZWZhdWx0O1xuICB2YXIgcmVnaXN0ZXJQb2x5ZmlsbCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgcHJvbWlzZVJhdyA9IHt9O1xuICBmdW5jdGlvbiBpc1Byb21pc2UoeCkge1xuICAgIHJldHVybiB4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4LnN0YXR1c18gIT09IHVuZGVmaW5lZDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlc29sdmVIYW5kbGVyKHgpIHtcbiAgICByZXR1cm4geDtcbiAgfVxuICBmdW5jdGlvbiBpZFJlamVjdEhhbmRsZXIoeCkge1xuICAgIHRocm93IHg7XG4gIH1cbiAgZnVuY3Rpb24gY2hhaW4ocHJvbWlzZSkge1xuICAgIHZhciBvblJlc29sdmUgPSBhcmd1bWVudHNbMV0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzFdIDogaWRSZXNvbHZlSGFuZGxlcjtcbiAgICB2YXIgb25SZWplY3QgPSBhcmd1bWVudHNbMl0gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzJdIDogaWRSZWplY3RIYW5kbGVyO1xuICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKHByb21pc2UuY29uc3RydWN0b3IpO1xuICAgIHN3aXRjaCAocHJvbWlzZS5zdGF0dXNfKSB7XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgdGhyb3cgVHlwZUVycm9yO1xuICAgICAgY2FzZSAwOlxuICAgICAgICBwcm9taXNlLm9uUmVzb2x2ZV8ucHVzaChvblJlc29sdmUsIGRlZmVycmVkKTtcbiAgICAgICAgcHJvbWlzZS5vblJlamVjdF8ucHVzaChvblJlamVjdCwgZGVmZXJyZWQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgKzE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZXNvbHZlLCBkZWZlcnJlZF0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgLTE6XG4gICAgICAgIHByb21pc2VFbnF1ZXVlKHByb21pc2UudmFsdWVfLCBbb25SZWplY3QsIGRlZmVycmVkXSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXREZWZlcnJlZChDKSB7XG4gICAgaWYgKHRoaXMgPT09ICRQcm9taXNlKSB7XG4gICAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VJbml0KG5ldyAkUHJvbWlzZShwcm9taXNlUmF3KSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBwcm9taXNlLFxuICAgICAgICByZXNvbHZlOiAoZnVuY3Rpb24oeCkge1xuICAgICAgICAgIHByb21pc2VSZXNvbHZlKHByb21pc2UsIHgpO1xuICAgICAgICB9KSxcbiAgICAgICAgcmVqZWN0OiAoZnVuY3Rpb24ocikge1xuICAgICAgICAgIHByb21pc2VSZWplY3QocHJvbWlzZSwgcik7XG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICByZXN1bHQucHJvbWlzZSA9IG5ldyBDKChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVzdWx0LnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICByZXN1bHQucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgfSkpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVNldChwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCBvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgcHJvbWlzZS5zdGF0dXNfID0gc3RhdHVzO1xuICAgIHByb21pc2UudmFsdWVfID0gdmFsdWU7XG4gICAgcHJvbWlzZS5vblJlc29sdmVfID0gb25SZXNvbHZlO1xuICAgIHByb21pc2Uub25SZWplY3RfID0gb25SZWplY3Q7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUluaXQocHJvbWlzZSkge1xuICAgIHJldHVybiBwcm9taXNlU2V0KHByb21pc2UsIDAsIHVuZGVmaW5lZCwgW10sIFtdKTtcbiAgfVxuICB2YXIgUHJvbWlzZSA9IGZ1bmN0aW9uIFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICBpZiAocmVzb2x2ZXIgPT09IHByb21pc2VSYXcpXG4gICAgICByZXR1cm47XG4gICAgaWYgKHR5cGVvZiByZXNvbHZlciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgdmFyIHByb21pc2UgPSBwcm9taXNlSW5pdCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgcmVzb2x2ZXIoKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcHJvbWlzZVJlc29sdmUocHJvbWlzZSwgeCk7XG4gICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgcHJvbWlzZVJlamVjdChwcm9taXNlLCByKTtcbiAgICAgIH0pKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBwcm9taXNlUmVqZWN0KHByb21pc2UsIGUpO1xuICAgIH1cbiAgfTtcbiAgKCR0cmFjZXVyUnVudGltZS5jcmVhdGVDbGFzcykoUHJvbWlzZSwge1xuICAgIGNhdGNoOiBmdW5jdGlvbihvblJlamVjdCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0KTtcbiAgICB9LFxuICAgIHRoZW46IGZ1bmN0aW9uKG9uUmVzb2x2ZSwgb25SZWplY3QpIHtcbiAgICAgIGlmICh0eXBlb2Ygb25SZXNvbHZlICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICBvblJlc29sdmUgPSBpZFJlc29sdmVIYW5kbGVyO1xuICAgICAgaWYgKHR5cGVvZiBvblJlamVjdCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgb25SZWplY3QgPSBpZFJlamVjdEhhbmRsZXI7XG4gICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICB2YXIgY29uc3RydWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yO1xuICAgICAgcmV0dXJuIGNoYWluKHRoaXMsIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgeCA9IHByb21pc2VDb2VyY2UoY29uc3RydWN0b3IsIHgpO1xuICAgICAgICByZXR1cm4geCA9PT0gdGhhdCA/IG9uUmVqZWN0KG5ldyBUeXBlRXJyb3IpIDogaXNQcm9taXNlKHgpID8geC50aGVuKG9uUmVzb2x2ZSwgb25SZWplY3QpIDogb25SZXNvbHZlKHgpO1xuICAgICAgfSwgb25SZWplY3QpO1xuICAgIH1cbiAgfSwge1xuICAgIHJlc29sdmU6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICBpZiAoaXNQcm9taXNlKHgpKSB7XG4gICAgICAgICAgcmV0dXJuIHg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2VTZXQobmV3ICRQcm9taXNlKHByb21pc2VSYXcpLCArMSwgeCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVzb2x2ZSh4KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICByZWplY3Q6IGZ1bmN0aW9uKHIpIHtcbiAgICAgIGlmICh0aGlzID09PSAkUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZVNldChuZXcgJFByb21pc2UocHJvbWlzZVJhdyksIC0xLCByKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcygoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgcmVqZWN0KHIpO1xuICAgICAgICB9KSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBhbGw6IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIGRlZmVycmVkID0gZ2V0RGVmZXJyZWQodGhpcyk7XG4gICAgICB2YXIgcmVzb2x1dGlvbnMgPSBbXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciBjb3VudCA9IHZhbHVlcy5sZW5ndGg7XG4gICAgICAgIGlmIChjb3VudCA9PT0gMCkge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzb2x1dGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUodmFsdWVzW2ldKS50aGVuKGZ1bmN0aW9uKGksIHgpIHtcbiAgICAgICAgICAgICAgcmVzb2x1dGlvbnNbaV0gPSB4O1xuICAgICAgICAgICAgICBpZiAoLS1jb3VudCA9PT0gMClcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc29sdXRpb25zKTtcbiAgICAgICAgICAgIH0uYmluZCh1bmRlZmluZWQsIGkpLCAoZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qocik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH0sXG4gICAgcmFjZTogZnVuY3Rpb24odmFsdWVzKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSBnZXREZWZlcnJlZCh0aGlzKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdGhpcy5yZXNvbHZlKHZhbHVlc1tpXSkudGhlbigoZnVuY3Rpb24oeCkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh4KTtcbiAgICAgICAgICB9KSwgKGZ1bmN0aW9uKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfVxuICB9KTtcbiAgdmFyICRQcm9taXNlID0gUHJvbWlzZTtcbiAgdmFyICRQcm9taXNlUmVqZWN0ID0gJFByb21pc2UucmVqZWN0O1xuICBmdW5jdGlvbiBwcm9taXNlUmVzb2x2ZShwcm9taXNlLCB4KSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgKzEsIHgsIHByb21pc2Uub25SZXNvbHZlXyk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZVJlamVjdChwcm9taXNlLCByKSB7XG4gICAgcHJvbWlzZURvbmUocHJvbWlzZSwgLTEsIHIsIHByb21pc2Uub25SZWplY3RfKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlRG9uZShwcm9taXNlLCBzdGF0dXMsIHZhbHVlLCByZWFjdGlvbnMpIHtcbiAgICBpZiAocHJvbWlzZS5zdGF0dXNfICE9PSAwKVxuICAgICAgcmV0dXJuO1xuICAgIHByb21pc2VFbnF1ZXVlKHZhbHVlLCByZWFjdGlvbnMpO1xuICAgIHByb21pc2VTZXQocHJvbWlzZSwgc3RhdHVzLCB2YWx1ZSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUVucXVldWUodmFsdWUsIHRhc2tzKSB7XG4gICAgYXN5bmMoKGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrcy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBwcm9taXNlSGFuZGxlKHZhbHVlLCB0YXNrc1tpXSwgdGFza3NbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH1cbiAgZnVuY3Rpb24gcHJvbWlzZUhhbmRsZSh2YWx1ZSwgaGFuZGxlciwgZGVmZXJyZWQpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCA9PT0gZGVmZXJyZWQucHJvbWlzZSlcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICAgIGVsc2UgaWYgKGlzUHJvbWlzZShyZXN1bHQpKVxuICAgICAgICBjaGFpbihyZXN1bHQsIGRlZmVycmVkLnJlc29sdmUsIGRlZmVycmVkLnJlamVjdCk7XG4gICAgICBlbHNlXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmVzdWx0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cbiAgfVxuICB2YXIgdGhlbmFibGVTeW1ib2wgPSAnQEB0aGVuYWJsZSc7XG4gIGZ1bmN0aW9uIGlzT2JqZWN0KHgpIHtcbiAgICByZXR1cm4geCAmJiAodHlwZW9mIHggPT09ICdvYmplY3QnIHx8IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKTtcbiAgfVxuICBmdW5jdGlvbiBwcm9taXNlQ29lcmNlKGNvbnN0cnVjdG9yLCB4KSB7XG4gICAgaWYgKCFpc1Byb21pc2UoeCkgJiYgaXNPYmplY3QoeCkpIHtcbiAgICAgIHZhciB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbiA9IHgudGhlbjtcbiAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSAkUHJvbWlzZVJlamVjdC5jYWxsKGNvbnN0cnVjdG9yLCByKTtcbiAgICAgICAgeFt0aGVuYWJsZVN5bWJvbF0gPSBwcm9taXNlO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgcCA9IHhbdGhlbmFibGVTeW1ib2xdO1xuICAgICAgICBpZiAocCkge1xuICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9IGdldERlZmVycmVkKGNvbnN0cnVjdG9yKTtcbiAgICAgICAgICB4W3RoZW5hYmxlU3ltYm9sXSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoZW4uY2FsbCh4LCBkZWZlcnJlZC5yZXNvbHZlLCBkZWZlcnJlZC5yZWplY3QpO1xuICAgICAgICAgIH0gY2F0Y2ggKHIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHg7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxQcm9taXNlKGdsb2JhbCkge1xuICAgIGlmICghZ2xvYmFsLlByb21pc2UpXG4gICAgICBnbG9iYWwuUHJvbWlzZSA9IFByb21pc2U7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbFByb21pc2UpO1xuICByZXR1cm4ge1xuICAgIGdldCBQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIFByb21pc2U7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxQcm9taXNlKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsUHJvbWlzZTtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9Qcm9taXNlLmpzXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmdJdGVyYXRvci5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgJF9fMjtcbiAgdmFyIF9fbW9kdWxlTmFtZSA9IFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nSXRlcmF0b3IuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBjcmVhdGVJdGVyYXRvclJlc3VsdE9iamVjdCA9ICRfXzAuY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QsXG4gICAgICBpc09iamVjdCA9ICRfXzAuaXNPYmplY3Q7XG4gIHZhciB0b1Byb3BlcnR5ID0gJHRyYWNldXJSdW50aW1lLnRvUHJvcGVydHk7XG4gIHZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciBpdGVyYXRlZFN0cmluZyA9IFN5bWJvbCgnaXRlcmF0ZWRTdHJpbmcnKTtcbiAgdmFyIHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4ID0gU3ltYm9sKCdzdHJpbmdJdGVyYXRvck5leHRJbmRleCcpO1xuICB2YXIgU3RyaW5nSXRlcmF0b3IgPSBmdW5jdGlvbiBTdHJpbmdJdGVyYXRvcigpIHt9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShTdHJpbmdJdGVyYXRvciwgKCRfXzIgPSB7fSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFwibmV4dFwiLCB7XG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG8gPSB0aGlzO1xuICAgICAgaWYgKCFpc09iamVjdChvKSB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvLCBpdGVyYXRlZFN0cmluZykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGhpcyBtdXN0IGJlIGEgU3RyaW5nSXRlcmF0b3Igb2JqZWN0Jyk7XG4gICAgICB9XG4gICAgICB2YXIgcyA9IG9bdG9Qcm9wZXJ0eShpdGVyYXRlZFN0cmluZyldO1xuICAgICAgaWYgKHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QodW5kZWZpbmVkLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwb3NpdGlvbiA9IG9bdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldO1xuICAgICAgdmFyIGxlbiA9IHMubGVuZ3RoO1xuICAgICAgaWYgKHBvc2l0aW9uID49IGxlbikge1xuICAgICAgICBvW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICB2YXIgZmlyc3QgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24pO1xuICAgICAgdmFyIHJlc3VsdFN0cmluZztcbiAgICAgIGlmIChmaXJzdCA8IDB4RDgwMCB8fCBmaXJzdCA+IDB4REJGRiB8fCBwb3NpdGlvbiArIDEgPT09IGxlbikge1xuICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBzZWNvbmQgPSBzLmNoYXJDb2RlQXQocG9zaXRpb24gKyAxKTtcbiAgICAgICAgaWYgKHNlY29uZCA8IDB4REMwMCB8fCBzZWNvbmQgPiAweERGRkYpIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGZpcnN0KSArIFN0cmluZy5mcm9tQ2hhckNvZGUoc2Vjb25kKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb1t0b1Byb3BlcnR5KHN0cmluZ0l0ZXJhdG9yTmV4dEluZGV4KV0gPSBwb3NpdGlvbiArIHJlc3VsdFN0cmluZy5sZW5ndGg7XG4gICAgICByZXR1cm4gY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QocmVzdWx0U3RyaW5nLCBmYWxzZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksICRfXzIpLCB7fSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yKHN0cmluZykge1xuICAgIHZhciBzID0gU3RyaW5nKHN0cmluZyk7XG4gICAgdmFyIGl0ZXJhdG9yID0gT2JqZWN0LmNyZWF0ZShTdHJpbmdJdGVyYXRvci5wcm90b3R5cGUpO1xuICAgIGl0ZXJhdG9yW3RvUHJvcGVydHkoaXRlcmF0ZWRTdHJpbmcpXSA9IHM7XG4gICAgaXRlcmF0b3JbdG9Qcm9wZXJ0eShzdHJpbmdJdGVyYXRvck5leHRJbmRleCldID0gMDtcbiAgICByZXR1cm4gaXRlcmF0b3I7XG4gIH1cbiAgcmV0dXJuIHtnZXQgY3JlYXRlU3RyaW5nSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gY3JlYXRlU3RyaW5nSXRlcmF0b3I7XG4gICAgfX07XG59KTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZy5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9TdHJpbmcuanNcIjtcbiAgdmFyIGNyZWF0ZVN0cmluZ0l0ZXJhdG9yID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL1N0cmluZ0l0ZXJhdG9yLmpzXCIpLmNyZWF0ZVN0cmluZ0l0ZXJhdG9yO1xuICB2YXIgJF9fMSA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy91dGlscy5qc1wiKSxcbiAgICAgIG1heWJlQWRkRnVuY3Rpb25zID0gJF9fMS5tYXliZUFkZEZ1bmN0aW9ucyxcbiAgICAgIG1heWJlQWRkSXRlcmF0b3IgPSAkX18xLm1heWJlQWRkSXRlcmF0b3IsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMS5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgJHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyICRpbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mO1xuICB2YXIgJGxhc3RJbmRleE9mID0gU3RyaW5nLnByb3RvdHlwZS5sYXN0SW5kZXhPZjtcbiAgZnVuY3Rpb24gc3RhcnRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4ocG9zKSkge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICByZXR1cm4gJGluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgcG9zKSA9PSBzdGFydDtcbiAgfVxuICBmdW5jdGlvbiBlbmRzV2l0aChzZWFyY2gpIHtcbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmICh0aGlzID09IG51bGwgfHwgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zID0gc3RyaW5nTGVuZ3RoO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKHBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICAgICAgaWYgKGlzTmFOKHBvcykpIHtcbiAgICAgICAgICBwb3MgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbmQgPSBNYXRoLm1pbihNYXRoLm1heChwb3MsIDApLCBzdHJpbmdMZW5ndGgpO1xuICAgIHZhciBzdGFydCA9IGVuZCAtIHNlYXJjaExlbmd0aDtcbiAgICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiAkbGFzdEluZGV4T2YuY2FsbChzdHJpbmcsIHNlYXJjaFN0cmluZywgc3RhcnQpID09IHN0YXJ0O1xuICB9XG4gIGZ1bmN0aW9uIGluY2x1ZGVzKHNlYXJjaCkge1xuICAgIGlmICh0aGlzID09IG51bGwpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcigpO1xuICAgIH1cbiAgICB2YXIgc3RyaW5nID0gU3RyaW5nKHRoaXMpO1xuICAgIGlmIChzZWFyY2ggJiYgJHRvU3RyaW5nLmNhbGwoc2VhcmNoKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmdMZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICAgIHZhciBzZWFyY2hTdHJpbmcgPSBTdHJpbmcoc2VhcmNoKTtcbiAgICB2YXIgc2VhcmNoTGVuZ3RoID0gc2VhcmNoU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgcG9zaXRpb24gPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgcG9zID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAocG9zICE9IHBvcykge1xuICAgICAgcG9zID0gMDtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oTWF0aC5tYXgocG9zLCAwKSwgc3RyaW5nTGVuZ3RoKTtcbiAgICBpZiAoc2VhcmNoTGVuZ3RoICsgc3RhcnQgPiBzdHJpbmdMZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuICRpbmRleE9mLmNhbGwoc3RyaW5nLCBzZWFyY2hTdHJpbmcsIHBvcykgIT0gLTE7XG4gIH1cbiAgZnVuY3Rpb24gcmVwZWF0KGNvdW50KSB7XG4gICAgaWYgKHRoaXMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcodGhpcyk7XG4gICAgdmFyIG4gPSBjb3VudCA/IE51bWJlcihjb3VudCkgOiAwO1xuICAgIGlmIChpc05hTihuKSkge1xuICAgICAgbiA9IDA7XG4gICAgfVxuICAgIGlmIChuIDwgMCB8fCBuID09IEluZmluaXR5KSB7XG4gICAgICB0aHJvdyBSYW5nZUVycm9yKCk7XG4gICAgfVxuICAgIGlmIChuID09IDApIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHdoaWxlIChuLS0pIHtcbiAgICAgIHJlc3VsdCArPSBzdHJpbmc7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgZnVuY3Rpb24gY29kZVBvaW50QXQocG9zaXRpb24pIHtcbiAgICBpZiAodGhpcyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoKTtcbiAgICB9XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyh0aGlzKTtcbiAgICB2YXIgc2l6ZSA9IHN0cmluZy5sZW5ndGg7XG4gICAgdmFyIGluZGV4ID0gcG9zaXRpb24gPyBOdW1iZXIocG9zaXRpb24pIDogMDtcbiAgICBpZiAoaXNOYU4oaW5kZXgpKSB7XG4gICAgICBpbmRleCA9IDA7XG4gICAgfVxuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gc2l6ZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdmFyIGZpcnN0ID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXgpO1xuICAgIHZhciBzZWNvbmQ7XG4gICAgaWYgKGZpcnN0ID49IDB4RDgwMCAmJiBmaXJzdCA8PSAweERCRkYgJiYgc2l6ZSA+IGluZGV4ICsgMSkge1xuICAgICAgc2Vjb25kID0gc3RyaW5nLmNoYXJDb2RlQXQoaW5kZXggKyAxKTtcbiAgICAgIGlmIChzZWNvbmQgPj0gMHhEQzAwICYmIHNlY29uZCA8PSAweERGRkYpIHtcbiAgICAgICAgcmV0dXJuIChmaXJzdCAtIDB4RDgwMCkgKiAweDQwMCArIHNlY29uZCAtIDB4REMwMCArIDB4MTAwMDA7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaXJzdDtcbiAgfVxuICBmdW5jdGlvbiByYXcoY2FsbHNpdGUpIHtcbiAgICB2YXIgcmF3ID0gY2FsbHNpdGUucmF3O1xuICAgIHZhciBsZW4gPSByYXcubGVuZ3RoID4+PiAwO1xuICAgIGlmIChsZW4gPT09IDApXG4gICAgICByZXR1cm4gJyc7XG4gICAgdmFyIHMgPSAnJztcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHMgKz0gcmF3W2ldO1xuICAgICAgaWYgKGkgKyAxID09PSBsZW4pXG4gICAgICAgIHJldHVybiBzO1xuICAgICAgcyArPSBhcmd1bWVudHNbKytpXTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZnJvbUNvZGVQb2ludCgpIHtcbiAgICB2YXIgY29kZVVuaXRzID0gW107XG4gICAgdmFyIGZsb29yID0gTWF0aC5mbG9vcjtcbiAgICB2YXIgaGlnaFN1cnJvZ2F0ZTtcbiAgICB2YXIgbG93U3Vycm9nYXRlO1xuICAgIHZhciBpbmRleCA9IC0xO1xuICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmICghbGVuZ3RoKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICB2YXIgY29kZVBvaW50ID0gTnVtYmVyKGFyZ3VtZW50c1tpbmRleF0pO1xuICAgICAgaWYgKCFpc0Zpbml0ZShjb2RlUG9pbnQpIHx8IGNvZGVQb2ludCA8IDAgfHwgY29kZVBvaW50ID4gMHgxMEZGRkYgfHwgZmxvb3IoY29kZVBvaW50KSAhPSBjb2RlUG9pbnQpIHtcbiAgICAgICAgdGhyb3cgUmFuZ2VFcnJvcignSW52YWxpZCBjb2RlIHBvaW50OiAnICsgY29kZVBvaW50KTtcbiAgICAgIH1cbiAgICAgIGlmIChjb2RlUG9pbnQgPD0gMHhGRkZGKSB7XG4gICAgICAgIGNvZGVVbml0cy5wdXNoKGNvZGVQb2ludCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMDtcbiAgICAgICAgaGlnaFN1cnJvZ2F0ZSA9IChjb2RlUG9pbnQgPj4gMTApICsgMHhEODAwO1xuICAgICAgICBsb3dTdXJyb2dhdGUgPSAoY29kZVBvaW50ICUgMHg0MDApICsgMHhEQzAwO1xuICAgICAgICBjb2RlVW5pdHMucHVzaChoaWdoU3Vycm9nYXRlLCBsb3dTdXJyb2dhdGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBjb2RlVW5pdHMpO1xuICB9XG4gIGZ1bmN0aW9uIHN0cmluZ1Byb3RvdHlwZUl0ZXJhdG9yKCkge1xuICAgIHZhciBvID0gJHRyYWNldXJSdW50aW1lLmNoZWNrT2JqZWN0Q29lcmNpYmxlKHRoaXMpO1xuICAgIHZhciBzID0gU3RyaW5nKG8pO1xuICAgIHJldHVybiBjcmVhdGVTdHJpbmdJdGVyYXRvcihzKTtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbFN0cmluZyhnbG9iYWwpIHtcbiAgICB2YXIgU3RyaW5nID0gZ2xvYmFsLlN0cmluZztcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhTdHJpbmcucHJvdG90eXBlLCBbJ2NvZGVQb2ludEF0JywgY29kZVBvaW50QXQsICdlbmRzV2l0aCcsIGVuZHNXaXRoLCAnaW5jbHVkZXMnLCBpbmNsdWRlcywgJ3JlcGVhdCcsIHJlcGVhdCwgJ3N0YXJ0c1dpdGgnLCBzdGFydHNXaXRoXSk7XG4gICAgbWF5YmVBZGRGdW5jdGlvbnMoU3RyaW5nLCBbJ2Zyb21Db2RlUG9pbnQnLCBmcm9tQ29kZVBvaW50LCAncmF3JywgcmF3XSk7XG4gICAgbWF5YmVBZGRJdGVyYXRvcihTdHJpbmcucHJvdG90eXBlLCBzdHJpbmdQcm90b3R5cGVJdGVyYXRvciwgU3ltYm9sKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsU3RyaW5nKTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgc3RhcnRzV2l0aCgpIHtcbiAgICAgIHJldHVybiBzdGFydHNXaXRoO1xuICAgIH0sXG4gICAgZ2V0IGVuZHNXaXRoKCkge1xuICAgICAgcmV0dXJuIGVuZHNXaXRoO1xuICAgIH0sXG4gICAgZ2V0IGluY2x1ZGVzKCkge1xuICAgICAgcmV0dXJuIGluY2x1ZGVzO1xuICAgIH0sXG4gICAgZ2V0IHJlcGVhdCgpIHtcbiAgICAgIHJldHVybiByZXBlYXQ7XG4gICAgfSxcbiAgICBnZXQgY29kZVBvaW50QXQoKSB7XG4gICAgICByZXR1cm4gY29kZVBvaW50QXQ7XG4gICAgfSxcbiAgICBnZXQgcmF3KCkge1xuICAgICAgcmV0dXJuIHJhdztcbiAgICB9LFxuICAgIGdldCBmcm9tQ29kZVBvaW50KCkge1xuICAgICAgcmV0dXJuIGZyb21Db2RlUG9pbnQ7XG4gICAgfSxcbiAgICBnZXQgc3RyaW5nUHJvdG90eXBlSXRlcmF0b3IoKSB7XG4gICAgICByZXR1cm4gc3RyaW5nUHJvdG90eXBlSXRlcmF0b3I7XG4gICAgfSxcbiAgICBnZXQgcG9seWZpbGxTdHJpbmcoKSB7XG4gICAgICByZXR1cm4gcG9seWZpbGxTdHJpbmc7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvU3RyaW5nLmpzXCIgKyAnJyk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciAkX18yO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yLmpzXCI7XG4gIHZhciAkX18wID0gU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3V0aWxzLmpzXCIpLFxuICAgICAgdG9PYmplY3QgPSAkX18wLnRvT2JqZWN0LFxuICAgICAgdG9VaW50MzIgPSAkX18wLnRvVWludDMyLFxuICAgICAgY3JlYXRlSXRlcmF0b3JSZXN1bHRPYmplY3QgPSAkX18wLmNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0O1xuICB2YXIgQVJSQVlfSVRFUkFUT1JfS0lORF9LRVlTID0gMTtcbiAgdmFyIEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTID0gMjtcbiAgdmFyIEFSUkFZX0lURVJBVE9SX0tJTkRfRU5UUklFUyA9IDM7XG4gIHZhciBBcnJheUl0ZXJhdG9yID0gZnVuY3Rpb24gQXJyYXlJdGVyYXRvcigpIHt9O1xuICAoJHRyYWNldXJSdW50aW1lLmNyZWF0ZUNsYXNzKShBcnJheUl0ZXJhdG9yLCAoJF9fMiA9IHt9LCBPYmplY3QuZGVmaW5lUHJvcGVydHkoJF9fMiwgXCJuZXh0XCIsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaXRlcmF0b3IgPSB0b09iamVjdCh0aGlzKTtcbiAgICAgIHZhciBhcnJheSA9IGl0ZXJhdG9yLml0ZXJhdG9yT2JqZWN0XztcbiAgICAgIGlmICghYXJyYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignT2JqZWN0IGlzIG5vdCBhbiBBcnJheUl0ZXJhdG9yJyk7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZXggPSBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XztcbiAgICAgIHZhciBpdGVtS2luZCA9IGl0ZXJhdG9yLmFycmF5SXRlcmF0aW9uS2luZF87XG4gICAgICB2YXIgbGVuZ3RoID0gdG9VaW50MzIoYXJyYXkubGVuZ3RoKTtcbiAgICAgIGlmIChpbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgaXRlcmF0b3IuYXJyYXlJdGVyYXRvck5leHRJbmRleF8gPSBJbmZpbml0eTtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IGluZGV4ICsgMTtcbiAgICAgIGlmIChpdGVtS2luZCA9PSBBUlJBWV9JVEVSQVRPUl9LSU5EX1ZBTFVFUylcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KGFycmF5W2luZGV4XSwgZmFsc2UpO1xuICAgICAgaWYgKGl0ZW1LaW5kID09IEFSUkFZX0lURVJBVE9SX0tJTkRfRU5UUklFUylcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KFtpbmRleCwgYXJyYXlbaW5kZXhdXSwgZmFsc2UpO1xuICAgICAgcmV0dXJuIGNyZWF0ZUl0ZXJhdG9yUmVzdWx0T2JqZWN0KGluZGV4LCBmYWxzZSk7XG4gICAgfSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZVxuICB9KSwgT2JqZWN0LmRlZmluZVByb3BlcnR5KCRfXzIsIFN5bWJvbC5pdGVyYXRvciwge1xuICAgIHZhbHVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWVcbiAgfSksICRfXzIpLCB7fSk7XG4gIGZ1bmN0aW9uIGNyZWF0ZUFycmF5SXRlcmF0b3IoYXJyYXksIGtpbmQpIHtcbiAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3QoYXJyYXkpO1xuICAgIHZhciBpdGVyYXRvciA9IG5ldyBBcnJheUl0ZXJhdG9yO1xuICAgIGl0ZXJhdG9yLml0ZXJhdG9yT2JqZWN0XyA9IG9iamVjdDtcbiAgICBpdGVyYXRvci5hcnJheUl0ZXJhdG9yTmV4dEluZGV4XyA9IDA7XG4gICAgaXRlcmF0b3IuYXJyYXlJdGVyYXRpb25LaW5kXyA9IGtpbmQ7XG4gICAgcmV0dXJuIGl0ZXJhdG9yO1xuICB9XG4gIGZ1bmN0aW9uIGVudHJpZXMoKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUFycmF5SXRlcmF0b3IodGhpcywgQVJSQVlfSVRFUkFUT1JfS0lORF9FTlRSSUVTKTtcbiAgfVxuICBmdW5jdGlvbiBrZXlzKCkge1xuICAgIHJldHVybiBjcmVhdGVBcnJheUl0ZXJhdG9yKHRoaXMsIEFSUkFZX0lURVJBVE9SX0tJTkRfS0VZUyk7XG4gIH1cbiAgZnVuY3Rpb24gdmFsdWVzKCkge1xuICAgIHJldHVybiBjcmVhdGVBcnJheUl0ZXJhdG9yKHRoaXMsIEFSUkFZX0lURVJBVE9SX0tJTkRfVkFMVUVTKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldCBlbnRyaWVzKCkge1xuICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgfSxcbiAgICBnZXQga2V5cygpIHtcbiAgICAgIHJldHVybiBrZXlzO1xuICAgIH0sXG4gICAgZ2V0IHZhbHVlcygpIHtcbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0ucmVnaXN0ZXJNb2R1bGUoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheS5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheS5qc1wiO1xuICB2YXIgJF9fMCA9IFN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9BcnJheUl0ZXJhdG9yLmpzXCIpLFxuICAgICAgZW50cmllcyA9ICRfXzAuZW50cmllcyxcbiAgICAgIGtleXMgPSAkX18wLmtleXMsXG4gICAgICB2YWx1ZXMgPSAkX18wLnZhbHVlcztcbiAgdmFyICRfXzEgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBjaGVja0l0ZXJhYmxlID0gJF9fMS5jaGVja0l0ZXJhYmxlLFxuICAgICAgaXNDYWxsYWJsZSA9ICRfXzEuaXNDYWxsYWJsZSxcbiAgICAgIGlzQ29uc3RydWN0b3IgPSAkX18xLmlzQ29uc3RydWN0b3IsXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzEubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICBtYXliZUFkZEl0ZXJhdG9yID0gJF9fMS5tYXliZUFkZEl0ZXJhdG9yLFxuICAgICAgcmVnaXN0ZXJQb2x5ZmlsbCA9ICRfXzEucmVnaXN0ZXJQb2x5ZmlsbCxcbiAgICAgIHRvSW50ZWdlciA9ICRfXzEudG9JbnRlZ2VyLFxuICAgICAgdG9MZW5ndGggPSAkX18xLnRvTGVuZ3RoLFxuICAgICAgdG9PYmplY3QgPSAkX18xLnRvT2JqZWN0O1xuICBmdW5jdGlvbiBmcm9tKGFyckxpa2UpIHtcbiAgICB2YXIgbWFwRm4gPSBhcmd1bWVudHNbMV07XG4gICAgdmFyIHRoaXNBcmcgPSBhcmd1bWVudHNbMl07XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBpdGVtcyA9IHRvT2JqZWN0KGFyckxpa2UpO1xuICAgIHZhciBtYXBwaW5nID0gbWFwRm4gIT09IHVuZGVmaW5lZDtcbiAgICB2YXIgayA9IDA7XG4gICAgdmFyIGFycixcbiAgICAgICAgbGVuO1xuICAgIGlmIChtYXBwaW5nICYmICFpc0NhbGxhYmxlKG1hcEZuKSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIGlmIChjaGVja0l0ZXJhYmxlKGl0ZW1zKSkge1xuICAgICAgYXJyID0gaXNDb25zdHJ1Y3RvcihDKSA/IG5ldyBDKCkgOiBbXTtcbiAgICAgIGZvciAodmFyICRfXzIgPSBpdGVtc1skdHJhY2V1clJ1bnRpbWUudG9Qcm9wZXJ0eShTeW1ib2wuaXRlcmF0b3IpXSgpLFxuICAgICAgICAgICRfXzM7ICEoJF9fMyA9ICRfXzIubmV4dCgpKS5kb25lOyApIHtcbiAgICAgICAgdmFyIGl0ZW0gPSAkX18zLnZhbHVlO1xuICAgICAgICB7XG4gICAgICAgICAgaWYgKG1hcHBpbmcpIHtcbiAgICAgICAgICAgIGFycltrXSA9IG1hcEZuLmNhbGwodGhpc0FyZywgaXRlbSwgayk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFycltrXSA9IGl0ZW07XG4gICAgICAgICAgfVxuICAgICAgICAgIGsrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYXJyLmxlbmd0aCA9IGs7XG4gICAgICByZXR1cm4gYXJyO1xuICAgIH1cbiAgICBsZW4gPSB0b0xlbmd0aChpdGVtcy5sZW5ndGgpO1xuICAgIGFyciA9IGlzQ29uc3RydWN0b3IoQykgPyBuZXcgQyhsZW4pIDogbmV3IEFycmF5KGxlbik7XG4gICAgZm9yICg7IGsgPCBsZW47IGsrKykge1xuICAgICAgaWYgKG1hcHBpbmcpIHtcbiAgICAgICAgYXJyW2tdID0gdHlwZW9mIHRoaXNBcmcgPT09ICd1bmRlZmluZWQnID8gbWFwRm4oaXRlbXNba10sIGspIDogbWFwRm4uY2FsbCh0aGlzQXJnLCBpdGVtc1trXSwgayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhcnJba10gPSBpdGVtc1trXTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJyLmxlbmd0aCA9IGxlbjtcbiAgICByZXR1cm4gYXJyO1xuICB9XG4gIGZ1bmN0aW9uIG9mKCkge1xuICAgIGZvciAodmFyIGl0ZW1zID0gW10sXG4gICAgICAgICRfXzQgPSAwOyAkX180IDwgYXJndW1lbnRzLmxlbmd0aDsgJF9fNCsrKVxuICAgICAgaXRlbXNbJF9fNF0gPSBhcmd1bWVudHNbJF9fNF07XG4gICAgdmFyIEMgPSB0aGlzO1xuICAgIHZhciBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gICAgdmFyIGFyciA9IGlzQ29uc3RydWN0b3IoQykgPyBuZXcgQyhsZW4pIDogbmV3IEFycmF5KGxlbik7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBsZW47IGsrKykge1xuICAgICAgYXJyW2tdID0gaXRlbXNba107XG4gICAgfVxuICAgIGFyci5sZW5ndGggPSBsZW47XG4gICAgcmV0dXJuIGFycjtcbiAgfVxuICBmdW5jdGlvbiBmaWxsKHZhbHVlKSB7XG4gICAgdmFyIHN0YXJ0ID0gYXJndW1lbnRzWzFdICE9PSAodm9pZCAwKSA/IGFyZ3VtZW50c1sxXSA6IDA7XG4gICAgdmFyIGVuZCA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgb2JqZWN0ID0gdG9PYmplY3QodGhpcyk7XG4gICAgdmFyIGxlbiA9IHRvTGVuZ3RoKG9iamVjdC5sZW5ndGgpO1xuICAgIHZhciBmaWxsU3RhcnQgPSB0b0ludGVnZXIoc3RhcnQpO1xuICAgIHZhciBmaWxsRW5kID0gZW5kICE9PSB1bmRlZmluZWQgPyB0b0ludGVnZXIoZW5kKSA6IGxlbjtcbiAgICBmaWxsU3RhcnQgPSBmaWxsU3RhcnQgPCAwID8gTWF0aC5tYXgobGVuICsgZmlsbFN0YXJ0LCAwKSA6IE1hdGgubWluKGZpbGxTdGFydCwgbGVuKTtcbiAgICBmaWxsRW5kID0gZmlsbEVuZCA8IDAgPyBNYXRoLm1heChsZW4gKyBmaWxsRW5kLCAwKSA6IE1hdGgubWluKGZpbGxFbmQsIGxlbik7XG4gICAgd2hpbGUgKGZpbGxTdGFydCA8IGZpbGxFbmQpIHtcbiAgICAgIG9iamVjdFtmaWxsU3RhcnRdID0gdmFsdWU7XG4gICAgICBmaWxsU3RhcnQrKztcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBmdW5jdGlvbiBmaW5kKHByZWRpY2F0ZSkge1xuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIHJldHVybiBmaW5kSGVscGVyKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZyk7XG4gIH1cbiAgZnVuY3Rpb24gZmluZEluZGV4KHByZWRpY2F0ZSkge1xuICAgIHZhciB0aGlzQXJnID0gYXJndW1lbnRzWzFdO1xuICAgIHJldHVybiBmaW5kSGVscGVyKHRoaXMsIHByZWRpY2F0ZSwgdGhpc0FyZywgdHJ1ZSk7XG4gIH1cbiAgZnVuY3Rpb24gZmluZEhlbHBlcihzZWxmLCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgdGhpc0FyZyA9IGFyZ3VtZW50c1syXTtcbiAgICB2YXIgcmV0dXJuSW5kZXggPSBhcmd1bWVudHNbM10gIT09ICh2b2lkIDApID8gYXJndW1lbnRzWzNdIDogZmFsc2U7XG4gICAgdmFyIG9iamVjdCA9IHRvT2JqZWN0KHNlbGYpO1xuICAgIHZhciBsZW4gPSB0b0xlbmd0aChvYmplY3QubGVuZ3RoKTtcbiAgICBpZiAoIWlzQ2FsbGFibGUocHJlZGljYXRlKSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCk7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IG9iamVjdFtpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbCh0aGlzQXJnLCB2YWx1ZSwgaSwgb2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gcmV0dXJuSW5kZXggPyBpIDogdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5JbmRleCA/IC0xIDogdW5kZWZpbmVkO1xuICB9XG4gIGZ1bmN0aW9uIHBvbHlmaWxsQXJyYXkoZ2xvYmFsKSB7XG4gICAgdmFyICRfXzUgPSBnbG9iYWwsXG4gICAgICAgIEFycmF5ID0gJF9fNS5BcnJheSxcbiAgICAgICAgT2JqZWN0ID0gJF9fNS5PYmplY3QsXG4gICAgICAgIFN5bWJvbCA9ICRfXzUuU3ltYm9sO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKEFycmF5LnByb3RvdHlwZSwgWydlbnRyaWVzJywgZW50cmllcywgJ2tleXMnLCBrZXlzLCAndmFsdWVzJywgdmFsdWVzLCAnZmlsbCcsIGZpbGwsICdmaW5kJywgZmluZCwgJ2ZpbmRJbmRleCcsIGZpbmRJbmRleF0pO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKEFycmF5LCBbJ2Zyb20nLCBmcm9tLCAnb2YnLCBvZl0pO1xuICAgIG1heWJlQWRkSXRlcmF0b3IoQXJyYXkucHJvdG90eXBlLCB2YWx1ZXMsIFN5bWJvbCk7XG4gICAgbWF5YmVBZGRJdGVyYXRvcihPYmplY3QuZ2V0UHJvdG90eXBlT2YoW10udmFsdWVzKCkpLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sIFN5bWJvbCk7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbEFycmF5KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgZnJvbSgpIHtcbiAgICAgIHJldHVybiBmcm9tO1xuICAgIH0sXG4gICAgZ2V0IG9mKCkge1xuICAgICAgcmV0dXJuIG9mO1xuICAgIH0sXG4gICAgZ2V0IGZpbGwoKSB7XG4gICAgICByZXR1cm4gZmlsbDtcbiAgICB9LFxuICAgIGdldCBmaW5kKCkge1xuICAgICAgcmV0dXJuIGZpbmQ7XG4gICAgfSxcbiAgICBnZXQgZmluZEluZGV4KCkge1xuICAgICAgcmV0dXJuIGZpbmRJbmRleDtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbEFycmF5KCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsQXJyYXk7XG4gICAgfVxuICB9O1xufSk7XG5TeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvQXJyYXkuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL09iamVjdC5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3QuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzAubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsO1xuICB2YXIgJF9fMSA9ICR0cmFjZXVyUnVudGltZSxcbiAgICAgIGRlZmluZVByb3BlcnR5ID0gJF9fMS5kZWZpbmVQcm9wZXJ0eSxcbiAgICAgIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9ICRfXzEuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAgICAgZ2V0T3duUHJvcGVydHlOYW1lcyA9ICRfXzEuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgICAgIGlzUHJpdmF0ZU5hbWUgPSAkX18xLmlzUHJpdmF0ZU5hbWUsXG4gICAgICBrZXlzID0gJF9fMS5rZXlzO1xuICBmdW5jdGlvbiBpcyhsZWZ0LCByaWdodCkge1xuICAgIGlmIChsZWZ0ID09PSByaWdodClcbiAgICAgIHJldHVybiBsZWZ0ICE9PSAwIHx8IDEgLyBsZWZ0ID09PSAxIC8gcmlnaHQ7XG4gICAgcmV0dXJuIGxlZnQgIT09IGxlZnQgJiYgcmlnaHQgIT09IHJpZ2h0O1xuICB9XG4gIGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQpIHtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIHZhciBwcm9wcyA9IHNvdXJjZSA9PSBudWxsID8gW10gOiBrZXlzKHNvdXJjZSk7XG4gICAgICB2YXIgcCxcbiAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG4gICAgICBmb3IgKHAgPSAwOyBwIDwgbGVuZ3RoOyBwKyspIHtcbiAgICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgICAgaWYgKGlzUHJpdmF0ZU5hbWUobmFtZSkpXG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIHRhcmdldFtuYW1lXSA9IHNvdXJjZVtuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBtaXhpbih0YXJnZXQsIHNvdXJjZSkge1xuICAgIHZhciBwcm9wcyA9IGdldE93blByb3BlcnR5TmFtZXMoc291cmNlKTtcbiAgICB2YXIgcCxcbiAgICAgICAgZGVzY3JpcHRvcixcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgIGZvciAocCA9IDA7IHAgPCBsZW5ndGg7IHArKykge1xuICAgICAgdmFyIG5hbWUgPSBwcm9wc1twXTtcbiAgICAgIGlmIChpc1ByaXZhdGVOYW1lKG5hbWUpKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBwcm9wc1twXSk7XG4gICAgICBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHByb3BzW3BdLCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuICBmdW5jdGlvbiBwb2x5ZmlsbE9iamVjdChnbG9iYWwpIHtcbiAgICB2YXIgT2JqZWN0ID0gZ2xvYmFsLk9iamVjdDtcbiAgICBtYXliZUFkZEZ1bmN0aW9ucyhPYmplY3QsIFsnYXNzaWduJywgYXNzaWduLCAnaXMnLCBpcywgJ21peGluJywgbWl4aW5dKTtcbiAgfVxuICByZWdpc3RlclBvbHlmaWxsKHBvbHlmaWxsT2JqZWN0KTtcbiAgcmV0dXJuIHtcbiAgICBnZXQgaXMoKSB7XG4gICAgICByZXR1cm4gaXM7XG4gICAgfSxcbiAgICBnZXQgYXNzaWduKCkge1xuICAgICAgcmV0dXJuIGFzc2lnbjtcbiAgICB9LFxuICAgIGdldCBtaXhpbigpIHtcbiAgICAgIHJldHVybiBtaXhpbjtcbiAgICB9LFxuICAgIGdldCBwb2x5ZmlsbE9iamVjdCgpIHtcbiAgICAgIHJldHVybiBwb2x5ZmlsbE9iamVjdDtcbiAgICB9XG4gIH07XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9PYmplY3QuanNcIiArICcnKTtcblN5c3RlbS5yZWdpc3Rlck1vZHVsZShcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlci5qc1wiLCBbXSwgZnVuY3Rpb24oKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICB2YXIgX19tb2R1bGVOYW1lID0gXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9OdW1iZXIuanNcIjtcbiAgdmFyICRfXzAgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIiksXG4gICAgICBpc051bWJlciA9ICRfXzAuaXNOdW1iZXIsXG4gICAgICBtYXliZUFkZENvbnN0cyA9ICRfXzAubWF5YmVBZGRDb25zdHMsXG4gICAgICBtYXliZUFkZEZ1bmN0aW9ucyA9ICRfXzAubWF5YmVBZGRGdW5jdGlvbnMsXG4gICAgICByZWdpc3RlclBvbHlmaWxsID0gJF9fMC5yZWdpc3RlclBvbHlmaWxsLFxuICAgICAgdG9JbnRlZ2VyID0gJF9fMC50b0ludGVnZXI7XG4gIHZhciAkYWJzID0gTWF0aC5hYnM7XG4gIHZhciAkaXNGaW5pdGUgPSBpc0Zpbml0ZTtcbiAgdmFyICRpc05hTiA9IGlzTmFOO1xuICB2YXIgTUFYX1NBRkVfSU5URUdFUiA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBNSU5fU0FGRV9JTlRFR0VSID0gLU1hdGgucG93KDIsIDUzKSArIDE7XG4gIHZhciBFUFNJTE9OID0gTWF0aC5wb3coMiwgLTUyKTtcbiAgZnVuY3Rpb24gTnVtYmVySXNGaW5pdGUobnVtYmVyKSB7XG4gICAgcmV0dXJuIGlzTnVtYmVyKG51bWJlcikgJiYgJGlzRmluaXRlKG51bWJlcik7XG4gIH1cbiAgO1xuICBmdW5jdGlvbiBpc0ludGVnZXIobnVtYmVyKSB7XG4gICAgcmV0dXJuIE51bWJlcklzRmluaXRlKG51bWJlcikgJiYgdG9JbnRlZ2VyKG51bWJlcikgPT09IG51bWJlcjtcbiAgfVxuICBmdW5jdGlvbiBOdW1iZXJJc05hTihudW1iZXIpIHtcbiAgICByZXR1cm4gaXNOdW1iZXIobnVtYmVyKSAmJiAkaXNOYU4obnVtYmVyKTtcbiAgfVxuICA7XG4gIGZ1bmN0aW9uIGlzU2FmZUludGVnZXIobnVtYmVyKSB7XG4gICAgaWYgKE51bWJlcklzRmluaXRlKG51bWJlcikpIHtcbiAgICAgIHZhciBpbnRlZ3JhbCA9IHRvSW50ZWdlcihudW1iZXIpO1xuICAgICAgaWYgKGludGVncmFsID09PSBudW1iZXIpXG4gICAgICAgIHJldHVybiAkYWJzKGludGVncmFsKSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZnVuY3Rpb24gcG9seWZpbGxOdW1iZXIoZ2xvYmFsKSB7XG4gICAgdmFyIE51bWJlciA9IGdsb2JhbC5OdW1iZXI7XG4gICAgbWF5YmVBZGRDb25zdHMoTnVtYmVyLCBbJ01BWF9TQUZFX0lOVEVHRVInLCBNQVhfU0FGRV9JTlRFR0VSLCAnTUlOX1NBRkVfSU5URUdFUicsIE1JTl9TQUZFX0lOVEVHRVIsICdFUFNJTE9OJywgRVBTSUxPTl0pO1xuICAgIG1heWJlQWRkRnVuY3Rpb25zKE51bWJlciwgWydpc0Zpbml0ZScsIE51bWJlcklzRmluaXRlLCAnaXNJbnRlZ2VyJywgaXNJbnRlZ2VyLCAnaXNOYU4nLCBOdW1iZXJJc05hTiwgJ2lzU2FmZUludGVnZXInLCBpc1NhZmVJbnRlZ2VyXSk7XG4gIH1cbiAgcmVnaXN0ZXJQb2x5ZmlsbChwb2x5ZmlsbE51bWJlcik7XG4gIHJldHVybiB7XG4gICAgZ2V0IE1BWF9TQUZFX0lOVEVHRVIoKSB7XG4gICAgICByZXR1cm4gTUFYX1NBRkVfSU5URUdFUjtcbiAgICB9LFxuICAgIGdldCBNSU5fU0FGRV9JTlRFR0VSKCkge1xuICAgICAgcmV0dXJuIE1JTl9TQUZFX0lOVEVHRVI7XG4gICAgfSxcbiAgICBnZXQgRVBTSUxPTigpIHtcbiAgICAgIHJldHVybiBFUFNJTE9OO1xuICAgIH0sXG4gICAgZ2V0IGlzRmluaXRlKCkge1xuICAgICAgcmV0dXJuIE51bWJlcklzRmluaXRlO1xuICAgIH0sXG4gICAgZ2V0IGlzSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc0ludGVnZXI7XG4gICAgfSxcbiAgICBnZXQgaXNOYU4oKSB7XG4gICAgICByZXR1cm4gTnVtYmVySXNOYU47XG4gICAgfSxcbiAgICBnZXQgaXNTYWZlSW50ZWdlcigpIHtcbiAgICAgIHJldHVybiBpc1NhZmVJbnRlZ2VyO1xuICAgIH0sXG4gICAgZ2V0IHBvbHlmaWxsTnVtYmVyKCkge1xuICAgICAgcmV0dXJuIHBvbHlmaWxsTnVtYmVyO1xuICAgIH1cbiAgfTtcbn0pO1xuU3lzdGVtLmdldChcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL051bWJlci5qc1wiICsgJycpO1xuU3lzdGVtLnJlZ2lzdGVyTW9kdWxlKFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvcG9seWZpbGxzLmpzXCIsIFtdLCBmdW5jdGlvbigpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHZhciBfX21vZHVsZU5hbWUgPSBcInRyYWNldXItcnVudGltZUAwLjAuNzkvc3JjL3J1bnRpbWUvcG9seWZpbGxzL3BvbHlmaWxscy5qc1wiO1xuICB2YXIgcG9seWZpbGxBbGwgPSBTeXN0ZW0uZ2V0KFwidHJhY2V1ci1ydW50aW1lQDAuMC43OS9zcmMvcnVudGltZS9wb2x5ZmlsbHMvdXRpbHMuanNcIikucG9seWZpbGxBbGw7XG4gIHBvbHlmaWxsQWxsKFJlZmxlY3QuZ2xvYmFsKTtcbiAgdmFyIHNldHVwR2xvYmFscyA9ICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHM7XG4gICR0cmFjZXVyUnVudGltZS5zZXR1cEdsb2JhbHMgPSBmdW5jdGlvbihnbG9iYWwpIHtcbiAgICBzZXR1cEdsb2JhbHMoZ2xvYmFsKTtcbiAgICBwb2x5ZmlsbEFsbChnbG9iYWwpO1xuICB9O1xuICByZXR1cm4ge307XG59KTtcblN5c3RlbS5nZXQoXCJ0cmFjZXVyLXJ1bnRpbWVAMC4wLjc5L3NyYy9ydW50aW1lL3BvbHlmaWxscy9wb2x5ZmlsbHMuanNcIiArICcnKTtcbiJdfQ==
