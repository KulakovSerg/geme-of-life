(function () {

    /**
     * some useful functions
     * @module Util
     */
    var Util = function () {
    }

    Util.prototype = {
        find: function (className) {
            return document.getElementsByClassName(className)[0];
        },

        /**
         * inheritance method. Merge any objects to the first of them
         * @returns {Object}
         */
        extend: function () {
            var result = arguments[0],
                obj,
                prop;
            for (var objIdx = 1; objIdx < arguments.length; objIdx++) {
                obj = arguments[objIdx];
                for (var propIdx in obj) {
                    if (obj.hasOwnProperty(propIdx)) {
                        prop = obj[propIdx];
                        if (typeof prop == 'object') {
                            result[propIdx] = this.extend(prop);
                        }
                        else {
                            result[propIdx] = obj[propIdx];
                        }
                    }
                }
            }

            return result;
        },

        /**
         * toggle class name of dom element
         * @param {String} target
         * @param {String} className
         * @param {Boolean} [flag]
         * @returns {Object}
         */
        toggleClass: function (target, className, flag) {
            var curClass = target.getAttribute('class'),
                classFound = curClass.indexOf(className) != -1;

            if (classFound ^ flag) {
                if (flag) {
                    curClass += ' ' + className;
                }
                else {
                    curClass = curClass.replace(' ' + className, '');
                }

                target.setAttribute('class', curClass);
            }
            return target;
        },

        /**
         * trigger definition
         * @deprecated
         */
        /*isArray: function (target) {
         try {
         return target.constructor.toString().indexOf("Array") != -1;
         }
         catch (e) {
         return false;
         }
         },

         _event: {},

         on: function (eventName, callback) {
         if (!this._event[eventName]) {
         this._event[eventName] = [];
         }

         this._event[eventName].push(callback);

         return this;
         },

         off: function (eventName, callback) {
         var event = this._event[eventName],
         index;

         if (event) {
         index = event.indexOf(callback);
         if (index > 0) {
         event.splice(index);
         }
         }

         return this;
         },

         trigger: function (eventName) {
         var event = this._event[eventName];

         if (event) {
         var args = [];

         for (var i = 1; i < arguments.length; i++) {
         args.push(arguments[i]);
         }

         for (var j = 0; j < event.length; j++) {
         event[j].apply(this, args);
         }
         }

         return this;
         }*/
    }

    /**
     * control panel
     * @module Controls
     */

    var Controls = function () {
        this
            .listen('controls__size', 'input', 'checkSize')
            .listen('controls__delay', 'input', 'checkDelay')
            .listen('controls__reset', 'click', 'onReset')
            .listen('controls__pause', 'click', 'onPause')
            .listen('controls__step', 'click', 'onStep')
            .listen('controls__go', 'click', 'onGo');

        /**
         * field size changed callback
         * @property {Function}
         */
        this.onSizeChanged = undefined;

        /**
         * reset button callback
         * @property {Function}
         */
        this.onReset = undefined;

        /**
         * pause button callback
         * @property {Function}
         */
        this.onPause = undefined;

        /**
         * go button callback
         * @property {Function}
         */
        this.onGo = undefined;

        /**
         * step button callback
         * @property {Function}
         */
        this.onStep = undefined;

        this.setVal('controls__size', this._size);
        this.setVal('controls__delay', this._delay);
    }

    Controls.prototype = Util.prototype.extend(
        Util.prototype, {

            /**
             * field size
             * @property {Number} [_size=10]
             * @private
             * @const
             */
            _size: 10,

            /**
             * animation delay
             * @property {Number} [_delay=500]
             * @private
             * @const
             */
            _delay: 500,

            /**
             * get/set size of field, call
             * @param {(Number|Undefined)} [size]
             */
            size: function (size) {
                if (size) {
                    this._size = size;
                    this.onSizeChanged && this.onSizeChanged(size);
                    return this;
                }
                else {
                    return this._size;
                }
            },

            /**
             * check if size written in DOM element is integer
             * @param {Event} event
             * @returns {this}
             */
            checkSize: function (event) {
                return this._check(event, 'size');
            },

            /**
             * check if delay written in DOM element is integer
             * @param {Event} event
             * @returns {this}
             */
            checkDelay: function (event) {
                return this._check(event, '_delay');
            },

            /**
             * check if property written in DOM element is integer, rollback if no
             * @param {Event} event
             * @param {(String|Function)} prop
             * @private
             * @returns {this}
             */
            _check: function (event, prop) {
                var elem = event.target,
                    val = +elem.innerHTML;
                if (prop in this) {
                    var propIsFunc = typeof this[prop] == 'function';
                    if (val && !isNaN(val) && val > 0) {
                        propIsFunc ? this[prop](val) : (this[prop] = val);
                    }
                    else {
                        elem.innerHTML = propIsFunc ? this[prop]() : this[prop];
                    }
                }

                return this;
            },

            /**
             * add listener
             * @param {String} elementClass elem apply to
             * @param {String} eventName name of event to listen
             * @param {String} listenerName name of callback method of this
             * @returns {this}
             */
            listen: function (elementClass, eventName, listenerName) {
                var elem = this.find(elementClass),
                    self = this;
                if (elem) {
                    elem.addEventListener(eventName, function (event) {
                        self[listenerName] && self[listenerName](event);
                    });
                }

                return this;
            },

            /**
             * set value of DOM element
             * @param {String} className class of element
             * @param {*} value value
             * @returns {this}
             */
            setVal: function (className, value) {
                var elem = this.find(className);
                if (elem) {
                    elem.innerHTML = value;
                }

                return this;
            }
        }
    );

    /**
     * main application
     * @module GameOfLife
     */
    var GameOfLife = function () {
        this.controls = new Controls();
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

    GameOfLife.prototype = Util.prototype.extend(
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

    /**
     * cell of "life"
     * @module cell
     */

    var Cell = function (parent) {
        this._parentNode = parent;
        this.init();
    }

    Cell.prototype = Util.prototype.extend(
        new Util(),
        {
            _className: 'cell',

            _activeClassName: 'cell_alive_true',

            size: function () {
                return 20;
            },

            /**
             * get jr set "live" state of cell and toggle it's class
             * @param {boolean} [live]
             * @returns {(Boolean|this)}
             */
            live: function (live) {
                if (live === undefined) {
                    return this._live;
                }
                else {
                    var newLive = !!live;
                    if (newLive != this._live) {
                        this.toggleClass(this._elem, this._activeClassName, newLive);
                    }
                    this._live = newLive;
                    return this;
                }
            },

            /**
             * draw new cell
             * @returns {this}
             */
            init: function () {
                this._live = false;
                var elem = this._elem = document.createElement('div'),
                    self = this;

                elem.setAttribute('class', this._className);

                elem.style.width = elem.style.height = this.size() + 'px';

                elem.addEventListener('click', function () {
                    self.toggle();
                });

                elem.innerHTML = '&nbsp;';//this.y.toString()+this.x;

                this._parentNode.appendChild(elem);

                return this;
            },

            /**
             * toggle "live" state
             * @returns {this}
             */
            toggle: function () {
                return this.live(!this.live());
            },

            /**
             * @deprecated
             */
            destruct: function () {
                if (this._elem) {
                    this._parentNode.removeChild(this._elem);
                }
            }
        }
    );

    /* *************** init section *************** */

    new GameOfLife();
})();