(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.FelaServer = factory());
}(this, function () { 'use strict';

    var babelHelpers = {};
    babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
    };

    babelHelpers.classCallCheck = function (instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    };

    babelHelpers.createClass = function () {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();

    babelHelpers.extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    babelHelpers;


    function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports), module.exports; }

    /**
     * generates a hashcode from a string
     * taken from http://stackoverflow.com/a/7616484
     *
     * @param {string} str - str used to generate the unique hash code
     * @return {string} compressed content hash
     */
    function generateHash(str) {
      var hash = 0;
      var iterator = 0;
      var char = void 0;
      var length = str.length;

      // return a `s` for empty strings
      // to symbolize `static`
      if (length === 0) {
        return '';
      }

      for (; iterator < length; ++iterator) {
        char = str.charCodeAt(iterator);
        hash = (hash << 5) - hash + char;
        hash |= 0;
      }

      return '-' + hash.toString(36);
    }

    /**
     * stringifies an object without any special character
     * uses a sort version of the obj to get same hash codes
     *
     * @param {Object} obj - obj that gets stringified
     * @return {string} stringyfied sorted object
     */
    function sortedStringify(obj) {
      return Object.keys(obj).sort().reduce(function (str, prop) {
        // only concatenate property and value
        // without any special characters
        return str + prop + obj[prop];
      }, '');
    }

    var formats = {
      '.woff': 'woff',
      '.eof': 'eof',
      '.ttf': 'truetype',
      '.svg': 'svg'
    };

    // Returns the font format for a specific font source
    function getFontFormat(src) {
      return Object.keys(formats).reduce(function (format, extension) {
        if (src.indexOf(extension) > -1) {
          format = formats[extension];
        }
        return format; // eslint-disable-line
      }, undefined);
    }

    var isMediaQuery = (function (property) {
      return property.substr(0, 6) === '@media';
    })

    var isPseudoClass = (function (property) {
      return property.charAt(0) === ':';
    })

    /**
     * removes every invalid property except pseudo class objects
     *
     * @param {Object} style - style to be validated
     * @return {Object} validated style
     */
    function validateStyle(style) {
      Object.keys(style).forEach(function (property) {
        var value = style[property];
        if (value instanceof Object && !Array.isArray(value)) {
          style[property] = isPseudoClass(property) || isMediaQuery(property) ? validateStyle(value) : {};
          if (Object.keys(style[property]).length === 0) {
            delete style[property];
          }
        } else if (typeof value !== 'string' && typeof value !== 'number') {
          delete style[property];
          // also remove properties including concatenated props valued with undefined
        } else if (typeof value === 'string' && value.indexOf('undefined') > -1) {
            delete style[property];
          }
      });

      return style;
    }

    /**
     * executes each plugin using a predefined plugin interface
     *
     * @param {Object} pluginInterface - interface containing relevant processing data
     * @return {Object} processed style
     */
    function processStyle(pluginInterface) {
      var plugins = pluginInterface.plugins;
      var style = pluginInterface.style;
      // pipes each plugin by passes the plugin interface
      // NOTE: as the style are passed directly they're editable
      // therefore the plugin order might matter

      plugins.forEach(function (plugin) {
        return style = plugin(pluginInterface);
      });
      return style;
    }

    var index$1 = __commonjs(function (module) {
    'use strict';

    var uppercasePattern = /[A-Z]/g;
    var msPattern = /^ms-/;

    function hyphenateStyleName(string) {
        return string.replace(uppercasePattern, '-$&').toLowerCase().replace(msPattern, '-ms-');
    }

    module.exports = hyphenateStyleName;
    });

    var hypenateStyleName = (index$1 && typeof index$1 === 'object' && 'default' in index$1 ? index$1['default'] : index$1);

    /**
     * generates a valid CSS string containing style
     *
     * @param {Object} style - object containing CSS declarations
     * @returns {string} valid CSS string with dash cased properties
     */
    function cssifyObject(style) {
      return Object.keys(style).reduce(function (css, prop) {
        // prevents the semicolon after
        // the last rule declaration
        if (css.length > 0) {
          css += ';';
        }
        css += hypenateStyleName(prop) + ':' + style[prop];
        return css;
      }, '');
    }

    /**
     * renders keyframes into a CSS string with all prefixes
     *
     * @param {Object} frames - validated frame declarations
     * @param {string} animationName - animation reference naming
     * @param {string[]} prefixes - list of used vendor prefixes
     * @return {string} valid CSS string
     */
    function cssifyKeyframe(frames, animationName) {
      var prefixes = arguments.length <= 2 || arguments[2] === undefined ? [''] : arguments[2];

      var keyframe = Object.keys(frames).reduce(function (css, percentage) {
        return css + percentage + '{' + cssifyObject(validateStyle(frames[percentage])) + '}';
      }, '');

      return prefixes.reduce(function (css, prefix) {
        return css + '@' + prefix + 'keyframes ' + animationName + '{' + keyframe + '}';
      }, '');
    }

    var Renderer = function () {
      function Renderer() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        babelHelpers.classCallCheck(this, Renderer);

        this.listeners = [];
        this.keyframePrefixes = config.keyframePrefixes || ['-webkit-', '-moz-'];
        this.keyframePrefixes.push('');
        this.plugins = config.plugins || [];
        this.clear();
      }

      /**
       * clears the sheet's cache but keeps all listeners
       */


      babelHelpers.createClass(Renderer, [{
        key: 'clear',
        value: function clear() {
          this.fontFaces = '';
          this.keyframes = '';
          this.statics = '';
          this.rules = '';
          this.mediaRules = {};
          this.rendered = {};
          this.base = {};
          this.ids = [];

          // emit changes to notify subscribers
          this._emitChange();
        }

        /**
         * renders a new rule variation and caches the result
         *
         * @param {Function} rule - rule which gets rendered
         * @param {Object?} props - properties used to render
         * @param {Function[]?} plugins - array of plugins to process style
         * @return {string} className to reference the rendered rule
         */

      }, {
        key: 'renderRule',
        value: function renderRule(rule) {
          var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          // rendering a rule for the first time
          // will create an ID reference
          if (this.ids.indexOf(rule) < 0) {
            this.ids.push(rule);

            // directly render the static base style to be able
            // to diff future dynamic style with those
            this.renderRule(rule, {});
          }

          // uses the reference ID and the props to generate an unique className
          var ruleId = this.ids.indexOf(rule);
          var className = 'c' + ruleId + this._generatePropsReference(props);

          // only if the cached rule has not already been rendered
          // with a specific set of properties it actually renders
          if (!this.rendered.hasOwnProperty(className)) {

            var pluginInterface = {
              plugins: this.plugins,
              processStyle: processStyle,
              style: rule(props),
              props: props
            };

            var style = validateStyle(processStyle(pluginInterface));
            this._renderStyle(className, style, this.base[ruleId]);

            this.rendered[className] = this._didChange;

            if (this._didChange) {
              this._didChange = false;
              this._emitChange();
            }

            // keep static style to diff dynamic onces later on
            if (className === 'c' + ruleId) {
              this.base[ruleId] = style;
            }
          }

          var baseClassName = 'c' + ruleId;
          if (!this.rendered[className]) {
            return baseClassName;
          }

          // returns either the base className or both the base and the dynamic part
          return className !== baseClassName ? baseClassName + ' ' + className : className;
        }

        /**
         * renders a new keyframe variation and caches the result
         *
         * @param {Keyframe} keyframe - Keyframe which gets rendered
         * @param {Object?} props - properties used to render
         * @return {string} animationName to reference the rendered keyframe
         */

      }, {
        key: 'renderKeyframe',
        value: function renderKeyframe(keyframe) {
          var props = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

          // rendering a Keyframe for the first time
          // will create cache entries and an ID reference
          if (this.ids.indexOf(keyframe) < 0) {
            this.ids.push(keyframe);
          }

          var propsReference = this._generatePropsReference(props);
          var animationName = 'k' + this.ids.indexOf(keyframe) + propsReference;

          // only if the cached keyframe has not already been rendered
          // with a specific set of properties it actually renders
          if (!this.rendered.hasOwnProperty(animationName)) {
            var pluginInterface = {
              plugins: this.plugins,
              processStyle: processStyle,
              style: keyframe(props),
              props: props
            };

            var processedKeyframe = processStyle(pluginInterface);
            var css = cssifyKeyframe(processedKeyframe, animationName, this.keyframePrefixes);
            this.rendered[animationName] = true;
            this.keyframes += css;
            this._emitChange();
          }

          return animationName;
        }

        /**
         * renders a new font-face and caches it
         *
         * @param {FontFace} fontFace - fontFace which gets rendered
         * @return {string} fontFamily reference
         */

      }, {
        key: 'renderFont',
        value: function renderFont(family, files) {
          var _this = this;

          var properties = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

          if (!this.rendered.hasOwnProperty(family)) {
            (function () {
              var fontFace = {
                fontFamily: '\'' + family + '\'',
                src: files.map(function (src) {
                  return 'url(\'' + src + '\') format(\'' + getFontFormat(src) + '\')';
                }).join(',')
              };

              var fontProperties = ['fontVariant', 'fontWeight', 'fontStretch', 'fontStyle', 'unicodeRange'];
              Object.keys(properties).filter(function (prop) {
                return fontProperties.indexOf(prop) > -1;
              }).forEach(function (fontProp) {
                return fontFace[fontProp] = properties[fontProp];
              });

              var css = '@font-face{' + cssifyObject(fontFace) + '}';
              _this.rendered[family] = true;
              _this.fontFaces += css;
              _this._emitChange();
            })();
          }

          return family;
        }

        /**
         * renders static style and caches them
         *
         * @param {string|Object} style - static style to be rendered
         * @param {string?} selector - selector used to render the styles
         * @return {string} rendered CSS output
         */

      }, {
        key: 'renderStatic',
        value: function renderStatic(style, selector) {
          var reference = typeof style === 'string' ? style : selector;

          if (!this.rendered.hasOwnProperty(reference)) {
            if (typeof style === 'string') {
              // remove new lines from template strings
              this.statics += style.replace(/\s{2,}/g, '');
            } else {
              var pluginInterface = {
                plugins: this.plugins,
                processStyle: processStyle,
                style: style
              };

              this.statics += selector + '{' + cssifyObject(processStyle(pluginInterface)) + '}';
            }

            this.rendered[reference] = true;
            this._emitChange();
          }
        }

        /**
         * renders all cached styles into a single valid CSS string
         * clusters media query styles into groups to reduce output size
          * @return single concatenated CSS string
         */

      }, {
        key: 'renderToString',
        value: function renderToString() {
          var css = this.fontFaces + this.statics + this.rules;

          for (var media in this.mediaRules) {
            css += '@media ' + media + '{' + this.mediaRules[media] + '}';
          }

          return css + this.keyframes;
        }

        /**
         * Adds a new subscription to get notified on every rerender
         *
         * @param {Function} callback - callback function which will be executed
         * @return {Object} equivalent unsubscribe method
         */

      }, {
        key: 'subscribe',
        value: function subscribe(callback) {
          var _this2 = this;

          this.listeners.push(callback);
          return {
            unsubscribe: function unsubscribe() {
              return _this2.listeners.splice(_this2.listeners.indexOf(callback), 1);
            }
          };
        }

        /**
         * calls each listener with the current CSS markup of all caches
         * gets only called if the markup actually changes
         *
         * @param {Function} callback - callback function which will be executed
         * @return {Object} equivalent unsubscribe method
         */

      }, {
        key: '_emitChange',
        value: function _emitChange() {
          var css = this.renderToString();
          this.listeners.forEach(function (listener) {
            return listener(css);
          });
        }

        /**
         * generates an unique reference id by content hashing props
         *
         * @param {Object} props - props that get hashed
         * @return {string} reference - unique props reference
         */

      }, {
        key: '_generatePropsReference',
        value: function _generatePropsReference(props) {
          return generateHash(sortedStringify(props));
        }

        /**
         * iterates a style object and renders each rule to the cache
         *
         * @param {string} className - className reference to be rendered to
         * @param {Object} style - style object which is rendered
         * @param {Object`} base - base style subset for diffing
         */

      }, {
        key: '_renderStyle',
        value: function _renderStyle(className, style) {
          var base = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

          var _this3 = this;

          var pseudo = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
          var media = arguments.length <= 4 || arguments[4] === undefined ? '' : arguments[4];

          var ruleset = Object.keys(style).reduce(function (ruleset, property) {
            var value = style[property];
            // recursive object iteration in order to render
            // pseudo class and media class declarations
            if (value instanceof Object && !Array.isArray(value)) {
              if (isPseudoClass(property)) {
                _this3._renderStyle(className, value, base[property], pseudo + property, media);
              } else if (isMediaQuery(property)) {
                // combine media query rules with an `and`
                var query = property.slice(6).trim();
                var combinedMedia = media.length > 0 ? media + ' and ' + query : query;
                _this3._renderStyle(className, value, base[property], pseudo, combinedMedia);
              }
            } else {
              // diff styles with the base styles to only extract dynamic styles
              if (!base.hasOwnProperty(property) || base[property] !== value) {
                ruleset[property] = value;
              }
            }
            return ruleset;
          }, {});

          // add styles to the cache
          if (Object.keys(ruleset).length > 0) {
            var css = '.' + className + pseudo + '{' + cssifyObject(ruleset) + '}';
            this._didChange = true;

            if (media.length > 0) {
              if (!this.mediaRules.hasOwnProperty(media)) {
                this.mediaRules[media] = '';
              }

              this.mediaRules[media] += css;
            } else {
              this.rules += css;
            }
          }
        }
      }]);
      return Renderer;
    }();

    function createRenderer(config) {
      return new Renderer(config);
    }

    var index = {
      createRenderer: createRenderer
    };

    return index;

}));
//# sourceMappingURL=fela-server.js.map