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