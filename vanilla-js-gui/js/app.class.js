/**
 * main application
 * @module App
 */
var App = function () {
    this.controls = new Control();
    this._size = this.controls.size();

    this.init();

    var self = this;

    this.controls.onSizeChanged = this.controls.onReset = function () {
        self._size = self.controls.size();
        self.pause();

        self._iteration = 0;
        self
            .clear()
            .init()
            .showIteration();
    };

    this.controls.onPause = function () {
        self.pause();
    }

    this.controls.onGo = function () {
        self.start();
    }

    this.controls.onStep = function () {
        self
            .start()
            .pause();
    }

    this.showIteration();
}

App.prototype = Util.prototype.extend(
    new Util(), {

        /**
         * 2-dimantioanal array of cells
         * @property {Array}
         * @private
         */
        _field: undefined,

        /**
         * class name of field container element
         * @property {String}
         * @private
         * @const
         */
        _containerClass: 'container',

        /**
         * iterations count
         * @property {Number}
         * @private
         */
        _iteration: 0,

        /**
         * field size
         * @property {Number}
         * @private
         */
        _size: undefined,

        /**
         * temp array for next iteration values
         * @property {Array}
         * @private
         */
        _matrix: undefined,

        /**
         * create empty field
         * @returns {this}
         */
        init: function () {
            var container = this.find(this._containerClass);

            container.style.width = container.style.height = (Cell.prototype.size() + 1) * this._size + 'px';

            this._field = [];

            for (var y = 0; y < this._size; y++) {
                this._field.push(new Array(this._size));
                for (var x = 0; x < this._size; x++) {
                    this._field[y][x] = new Cell(container, y, x);
                }
            }

            return this;
        },

        /**
         * clear field
         * @returns {this}
         */
        clear: function () {
            var container = this.find(this._containerClass);
            container.innerHTML = '';

            return this;
        },

        /**
         * begin iterations with given dalay
         * @returns {this}
         */
        start: function () {
            if (!this.interval) {
                var self = this;

                self.calculate();
                this.interval = setInterval(function () {
                    self.calculate();
                }, this.controls._delay);
            }

            return this;
        },

        /**
         * pause iteration
         * @returns {this}
         */
        pause: function () {
            if (this.interval) {
                clearInterval(this.interval);
                delete this.interval;
            }

            return this;
        },

        /**
         * display current iteration number in control panel
         * @returns {this}
         */
        showIteration: function () {
            this.controls.setVal('controls__iteration', this._iteration);
            return this;
        },


        /* *************** algorithm section *************** */


        /**
         * calculate new iteration
         * @returns {this}
         */
        calculate: function () {
            this._iteration++;
            this.showIteration();

            this._matrix = [];

            for (var y = 0; y < this._field.length; y++) {
                this._matrix.push(new Array(this._size));
                for (var x = 0; x < this._field.length; x++) {
                    this.checkCell(y, x);
                }
            }

            for (var y = 0; y < this._field.length; y++) {
                for (var x = 0; x < this._field.length; x++) {
                    this._field[y][x].live(this._matrix[y][x]);
                }
            }

            return this;
        },

        /**
         * check if cell with given coordinates will "die" or "live"
         * @param {Number} y
         * @param {Number} x
         * @returns {this}
         */
        checkCell: function (y, x) {
            var neighboursAlive = this.walkArround(y, x);

            if (neighboursAlive < 2) {
                this._matrix[y][x] = false;
            }
            else {
                if (neighboursAlive == 2) {
                    this._field[y][x].live() && (this._matrix[y][x] = true);
                }
                else {
                    if (neighboursAlive == 3) {
                        this._matrix[y][x] = true;
                    }
                    else {
                        this._matrix[y][x] = false;
                    }
                }
            }

            return this;
        },

        /**
         * @param {Number} y0
         * @param {Number} x0
         * @returns {Number}
         */
        walkArround: function (y0, x0) {
            var neighboursAlive = 0;

            for (var y = y0 - 1; y < y0 + 2; y++) {
                for (var x = x0 - 1; x < x0 + 2; x++) {
                    if (!(y == y0 && x == x0) && this._field[this.correctCoordinate(y)][this.correctCoordinate(x)].live()) {
                        neighboursAlive++;
                    }
                }
            }

            return neighboursAlive;
        },

        /**
         * returns given coordinate if positive or it's reflection
         * @param {Number} x
         * @returns {Number}
         */
        correctCoordinate: function (x) {
            return x < 0 ? this._size + x : (x >= this._size ? x - this._size : x);
        }
    }
);