/**
 * control panel
 * @module Control
 */

var Control = function () {
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

Control.prototype = Util.prototype.extend(
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