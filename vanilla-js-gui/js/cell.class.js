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