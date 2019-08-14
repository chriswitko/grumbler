!function(root, factory) {
    "object" == typeof exports && "object" == typeof module ? module.exports = factory() : "function" == typeof define && define.amd ? define("Inskin", [], factory) : "object" == typeof exports ? exports.Inskin = factory() : root.Inskin = factory();
}("undefined" != typeof self ? self : this, function() {
    return function(modules) {
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                i: moduleId,
                l: !1,
                exports: {}
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.l = !0;
            return module.exports;
        }
        var installedModules = {};
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.d = function(exports, name, getter) {
            __webpack_require__.o(exports, name) || Object.defineProperty(exports, name, {
                configurable: !1,
                enumerable: !0,
                get: getter
            });
        };
        __webpack_require__.n = function(module) {
            var getter = module && module.__esModule ? function() {
                return module.default;
            } : function() {
                return module;
            };
            __webpack_require__.d(getter, "a", getter);
            return getter;
        };
        __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
        };
        __webpack_require__.p = "";
        return __webpack_require__(__webpack_require__.s = "./src/index.js");
    }({
        "./src/button/create.js": function(module, __webpack_exports__, __webpack_require__) {
            "use strict";
            function Bridge() {
                this.layers = [];
                this.stylesheets = [];
                this.creativeId = "";
                this.device = "Desktop";
                $ || console.log("The jQuery is not available.");
                var defaults = {
                    frameId: ""
                };
                arguments[0] && "object" === _typeof(arguments[0]) && (this.options = extendDefaults(defaults, arguments[0]));
                var _this = this, receiver = inIframe(window.parent.parent) ? window.parent.parent : window.parent;
                receiver.addEventListener("message", function(event) {
                    var supportedStylesheetsProxy = Array.from(document.styleSheets).filter(function(f) {
                        return f && f.href && f.href.includes("/proxy/");
                    }), supportedStylesheetsGateway = Array.from(document.styleSheets).filter(function(f) {
                        return f && f.href && f.href.includes("/gateway/");
                    }), supportedStylesheets = [].concat(supportedStylesheetsProxy || []).concat(supportedStylesheetsGateway || []), data = JSON.parse(event.data);
                    switch (data.method) {
                      case "areYouReady":
                        var fileName = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], messageX = {
                            method: "onAreYouReady",
                            data: {
                                frameId: fileName
                            }
                        };
                        "undefined" != typeof areYouReady && areYouReady && window.top.postMessage(JSON.stringify(messageX), "*");
                        break;

                      case "setupId":
                        _this.creativeId = data.payload.creativeId;
                        _this.device = data.payload.device;
                        break;

                      case "initLayers":
                        _this.initAllLayers();
                        _this.stylesheets = _this.initAllStysheets();
                        $("html > head").append($("<style>div[data-ism-layer] {border:1px dashed;box-sizing:border-box;}</style>"));
                        break;

                      case "getLayers":
                        _this.layers = _this.getAllLayers();
                        _this.stylesheets = _this.initAllStysheets();
                        var message = {
                            method: "onGetLayers",
                            data: _this.layers
                        };
                        window.top.postMessage(JSON.stringify(message), "*");
                        break;

                      case "applyActionToLayer":
                        if ("bgtype" === data.payload.action) {
                            $("#" + data.payload.id).attr("data-bgtype", data.payload.value);
                            var _fileName = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], objHand = {};
                            objHand["#" + data.payload.id] = [ "data-bgtype", data.payload.value ];
                            sendPropsChangesToCore(_this.creativeId, _fileName, [ objHand ]);
                            askForReload();
                        }
                        if ("align" === data.payload.action) {
                            var _layer = $("#" + data.payload.id), layerType = _layer.prop("tagName");
                            supportedStylesheets.map(function(file) {
                                switch (data.payload.value) {
                                  case "left":
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "left", "0px" ] ], [ "right", "margin-left" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-x", "left" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                    break;

                                  case "center":
                                    var layerWidth = parseInt(_layer.css("width"));
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "left", "50%" ], [ "margin-left", "-" + layerWidth / 2 + "px" ] ], [ "right" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-x", "center" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                    break;

                                  case "right":
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "right", "0" ] ], [ "left", "margin-left" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-x", "right" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                    break;

                                  case "top":
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "top", "0" ] ], [ "bottom", "margin-top" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-y", "top" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                    break;

                                  case "middle":
                                    var layerHeight = parseInt(_layer.css("height"));
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "top", "50%" ], [ "margin-top", "-" + layerHeight / 2 + "px" ] ], [ "bottom" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-y", "center" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                    break;

                                  case "bottom":
                                    "video" === data.payload.variant && changeStylesheetRule(file, "#" + data.payload.id, [ [ "bottom", "0" ] ], [ "top", "margin-top" ]) ? sendChangesToCore(_this.creativeId, file) : "DIV" === layerType && changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-position-y", "bottom" ] ], []) && sendChangesToCore(_this.creativeId, file);
                                }
                            });
                        }
                        if ("background-position-x" === data.payload.action || "background-position-y" === data.payload.action || "background-position" === data.payload.action || "z-index" === data.payload.action || "width" === data.payload.action || "height" === data.payload.action || "top" === data.payload.action || "left" === data.payload.action || "right" === data.payload.action || "bottom" === data.payload.action) {
                            supportedStylesheets.filter(function(f) {
                                return f.href.includes(data.payload.group + ".css");
                            }).map(function(file) {
                                changeStylesheetRule(file, "#" + data.payload.id, [ [ data.payload.action, data.payload.value ] ]) && sendChangesToCore(_this.creativeId, file);
                            });
                            var _layer2 = $("#" + data.payload.id), layerLinksRaw = _layer2.attr("data-ism-links") && _layer2.attr("data-ism-links").split(","), layerLinks = (layerLinksRaw || []).map(function(l) {
                                return l.trim();
                            });
                            supportedStylesheets.map(function(file) {
                                changeStylesheetRule(file, "#" + data.payload.id, [ [ data.payload.action, data.payload.value ] ]) && sendChangesToCore(_this.creativeId, file);
                            });
                            layerLinks.length && layerLinks.map(function(l) {
                                var message = {
                                    method: "applyActionToLayer",
                                    payload: {
                                        id: l,
                                        variant: data.payload.variant,
                                        action: data.payload.action,
                                        value: data.payload.value
                                    }
                                };
                                sendInternalMessage(message);
                            });
                        }
                        if ("background-color" === data.payload.action) {
                            var _layer3 = $("#" + data.payload.id), _layerLinksRaw = (_layer3.prop("tagName"), 
                            _layer3.attr("data-ism-links") && _layer3.attr("data-ism-links").split(",")), _layerLinks = (_layerLinksRaw || []).map(function(l) {
                                return l.trim();
                            });
                            supportedStylesheets.map(function(file) {
                                changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-color", data.payload.value ] ]) && sendChangesToCore(_this.creativeId, file);
                                "header-bg" === data.payload.id && changeStylesheetRule(file, "body", [ [ "background-color", data.payload.value ] ]) && sendChangesToCore(_this.creativeId, file);
                            });
                            _layerLinks.length && _layerLinks.map(function(l) {
                                var message = {
                                    method: "applyActionToLayer",
                                    payload: {
                                        id: l,
                                        variant: data.payload.variant,
                                        action: data.payload.action,
                                        value: data.payload.value
                                    }
                                };
                                sendInternalMessage(message);
                            });
                        }
                        if ("image" === data.payload.action) {
                            var _layer4 = $("#" + data.payload.id), _layerType2 = _layer4.prop("tagName"), _layerLinksRaw2 = _layer4.attr("data-ism-links") && _layer4.attr("data-ism-links").split(","), _layerLinks2 = (_layerLinksRaw2 || []).map(function(l) {
                                return l.trim();
                            });
                            if ("DIV" === _layerType2) {
                                _this.creativeId;
                                data.payload.value = data.payload.value.replace("https://creator.inskinmedia.com/gateway/assets/creatives/" + _this.creativeId + "/build/assets", "./assets");
                                data.payload.value = data.payload.value.replace("http://localhost:4000/gateway/assets/creatives/" + _this.creativeId + "/build/assets", "./assets");
                                supportedStylesheets.map(function(file) {
                                    if (data.payload.value) {
                                        var changes = [ [ "background-image", "url(" + data.payload.value + ")" ] ];
                                        "Smartphone" === _this.device && changes.push([ "background-size", parseInt(data.payload.asset.raw_width, 10) / 2 + "px auto" ]);
                                        changeStylesheetRule(file, "#" + data.payload.id, changes) && sendChangesToCore(_this.creativeId, file);
                                    } else changeStylesheetRule(file, "#" + data.payload.id, [ [ "background-image", "" ], [ "background-size", "" ] ]) && sendChangesToCore(_this.creativeId, file);
                                });
                                _layerLinks2.length && _layerLinks2.map(function(l) {
                                    var message = {
                                        method: "applyActionToLayer",
                                        payload: {
                                            id: l,
                                            variant: data.payload.variant,
                                            action: data.payload.action,
                                            value: data.payload.value,
                                            asset: data.payload.asset
                                        }
                                    };
                                    sendInternalMessage(message);
                                });
                            }
                        }
                        if ("video-poster" === data.payload.action) {
                            $("#" + data.payload.id).attr("data-poster", data.payload.value);
                            var _fileName2 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], baseLayerHandler = {};
                            baseLayerHandler["#" + data.payload.id] = [ "data-poster", data.payload.value ];
                            sendPropsChangesToCore(_this.creativeId, _fileName2, [ baseLayerHandler ]);
                            var _layer5 = $("#" + data.payload.id + " #poster"), _layerType3 = _layer5.prop("tagName");
                            if (_layer5 && "IMG" === _layerType3) {
                                _layer5.attr("src", data.payload.value);
                                var _fileName3 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0];
                                sendPropsChangesToCore(_this.creativeId, _fileName3, [ {
                                    "#poster": [ "src", data.payload.value ]
                                } ]);
                            }
                        }
                        if ("video" === data.payload.action) {
                            $("#" + data.payload.id).attr("data-ism-video-url", data.payload.value);
                            var _fileName4 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], videoObjHandler = {};
                            videoObjHandler["#" + data.payload.id] = [ "data-ism-video-url", data.payload.value ];
                            sendPropsChangesToCore(_this.creativeId, _fileName4, [ videoObjHandler ]);
                        }
                        if ("video-auto-play" === data.payload.action) {
                            $("#" + data.payload.id).attr("data-ism-auto-play", data.payload.value);
                            var _fileName5 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], _videoObjHandler = {};
                            _videoObjHandler["#" + data.payload.id] = [ "data-ism-auto-play", data.payload.value ];
                            sendPropsChangesToCore(_this.creativeId, _fileName5, [ _videoObjHandler ]);
                            askForReload();
                        }
                        if ("video-allow-fullscreen" === data.payload.action) {
                            $("#" + data.payload.id).attr("data-ism-allow-fullscreen", data.payload.value);
                            var _fileName6 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], _videoObjHandler2 = {};
                            _videoObjHandler2["#" + data.payload.id] = [ "data-ism-allow-fullscreen", data.payload.value ];
                            sendPropsChangesToCore(_this.creativeId, _fileName6, [ _videoObjHandler2 ]);
                            askForReload();
                        }
                        if ("video-show-controls" === data.payload.action) {
                            var _videoObjHandler3 = {}, _layer9 = $("#" + data.payload.id);
                            _layer9.attr("data-ism-show-controls", data.payload.value);
                            if ("false" === data.payload.value.toString()) {
                                _layer9.attr("data-ism-auto-play", "true");
                                _layer9.attr("data-ism-allow-fullscreen", "false");
                                _videoObjHandler3["#" + data.payload.id] = [ [ "data-ism-show-controls", data.payload.value ], [ "data-ism-auto-play", "true" ], [ "data-ism-allow-fullscreen", "false" ] ];
                            } else {
                                _layer9.attr("data-ism-auto-play", "true");
                                _layer9.attr("data-ism-allow-fullscreen", "true");
                                _videoObjHandler3["#" + data.payload.id] = [ [ "data-ism-show-controls", data.payload.value ], [ "data-ism-auto-play", "true" ], [ "data-ism-allow-fullscreen", "true" ] ];
                            }
                            var _fileName7 = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0];
                            sendPropsChangesToCore(_this.creativeId, _fileName7, [ _videoObjHandler3 ]);
                            askForReload();
                        }
                        break;

                      case "selectLayer":
                        _this.layers = _this.getAllLayers();
                        $("[data-ism-layer-active]").each(function(index) {
                            $(this).hide();
                        });
                        if (data.layer.id) {
                            var mainFrame = (inIframe(window.parent.parent), window.parent.document), currentSelection = _this.layers.find(function(l) {
                                return l.id === data.layer.id;
                            });
                            if (currentSelection && currentSelection.hasScroll) {
                                var y = $(window).scrollTop();
                                inIframe(window.parent.parent) ? $(mainFrame).find("body").animate({
                                    scrollTop: y + parseInt(currentSelection.hasScroll)
                                }, 600) : $(mainFrame).find("html").animate({
                                    scrollTop: y + parseInt(currentSelection.hasScroll)
                                }, 600);
                            } else $(mainFrame).scrollTop(0);
                            currentSelection && currentSelection.links;
                            $("#" + data.layer.id).find("[data-ism-layer-active]").show();
                        }
                        break;

                      default:
                        console.log("NOT IDENTIFIED METHOD", data.method);
                    }
                });
            }
            function inIframe(win) {
                try {
                    return win.self !== window.top;
                } catch (e) {
                    return !0;
                }
            }
            function trim(str) {
                return str.replace(/^\s+|\s+$/gm, "");
            }
            function rgbaToHex(rgba) {
                var parts = rgba.substring(rgba.indexOf("(")).split(","), r = parseInt(trim(parts[0].substring(1)), 10), g = parseInt(trim(parts[1]), 10), b = parseInt(trim(parts[2]), 10), a = parts[3] ? parseFloat(trim(parts[3].substring(0, parts[3].length - 1))).toFixed(2) : "";
                return "#" + r.toString(16) + g.toString(16) + b.toString(16) + (parts[3] ? (255 * a).toString(16).substring(0, 2) : "");
            }
            function sendPropsChangesToCore(creativeId, file, props) {
                var message = {
                    method: "onPropsUpdate",
                    data: {
                        creativeId: creativeId,
                        file: file,
                        props: props
                    }
                };
                window.top.postMessage(JSON.stringify(message), "*");
            }
            function sendChangesToCore(creativeId, file) {
                var filename = file.href.replace(/^.*[\\\/]/, ""), message = {
                    method: "onCSSUpdate",
                    data: {
                        creativeId: creativeId,
                        file: filename,
                        source: getCSSChanges(file)
                    }
                };
                window.top.postMessage(JSON.stringify(message), "*");
            }
            function getCSSChanges(stylesheet) {
                var style = null, cssStyles = "";
                void 0 !== stylesheet.cssRules ? style = stylesheet.cssRules : void 0 !== stylesheet.rules && (style = stylesheet.rules);
                for (var item in style) void 0 != style[item].cssText && (cssStyles += style[item].cssText + "\n\n");
                return cssStyles;
            }
            function changeStylesheetRule(stylesheet, selector, updateRules, removeRules, cb) {
                selector = selector;
                removeRules = removeRules || [];
                updateRules = updateRules || [];
                var isModified = !1;
                if (stylesheet && stylesheet.cssRules) for (var i = 0; i < stylesheet.cssRules.length; i++) {
                    var rule = stylesheet.cssRules[i];
                    if (rule.selectorText === selector) {
                        removeRules.map(function(r) {
                            return rule.style.removeProperty(r);
                        });
                        updateRules.map(function(k) {
                            rule.style[k[0]] = k[1];
                        });
                        isModified = !0;
                        return !0;
                    }
                }
                if (isModified) {
                    stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
                    return !0;
                }
                return !1;
            }
            function extendDefaults(source, properties) {
                var property;
                for (property in properties) properties.hasOwnProperty(property) && (source[property] = properties[property]);
                return source;
            }
            __webpack_exports__.a = Bridge;
            var _this2 = this, _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj) {
                return typeof obj;
            } : function(obj) {
                return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
            };
            Bridge.getLayers = function() {
                _this2.getAllLayers();
            };
            Bridge.prototype.Loaded = function() {
                console.log("Inskin.Bridge.Loaded");
                var fileName = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0], message = {
                    method: "onAreYouReady",
                    data: {
                        frameId: fileName
                    }
                };
                window.top.postMessage(JSON.stringify(message), "*");
                message = {
                    method: "onSetup"
                };
                window.top.postMessage(JSON.stringify(message), "*");
            };
            Bridge.prototype.getAllLayers = function() {
                var layers = $("[data-ism-layer]"), all = [], isOk = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/;
                layers.map(function(idx, layer) {
                    var layerObj = $(layer);
                    if (layerObj.attr("data-ism-layer")) {
                        var fileName = document.location.href.replace(/^.*[\\\/]/, "").split("?")[0].replace(".html", ""), temp = {
                            group: fileName,
                            id: layerObj.attr("id"),
                            key: layerObj.attr("data-ism-key"),
                            name: layerObj.attr("data-ism-name") || layerObj.attr("id"),
                            variant: layerObj.attr("data-ism-layer"),
                            assetURL: layerObj.attr("src") || ("none" !== layerObj.css("background-image") ? layerObj.css("background-image").replace(/.*\s?url\([\'\"]?/, "").replace(/[\'\"]?\).*/, "") : "") || layerObj.attr("data-poster") || layerObj.find("#poster").attr("src") || "",
                            assetVideoURL: layerObj.attr("data-ism-video-url") || "",
                            videoAutoPlay: layerObj.attr("data-ism-auto-play") || "",
                            allowFullscreen: layerObj.attr("data-ism-allow-fullscreen") || "",
                            controls: layerObj.attr("data-ism-show-controls") || "",
                            bgtype: layerObj.attr("data-bgtype") || "",
                            isRemovable: "true" === layerObj.attr("data-ism-removable"),
                            isSelectable: !layerObj.attr("data-ism-selectable") || "true" === layerObj.attr("data-ism-selectable"),
                            disabledProps: layerObj.attr("data-ism-disabled-props") || "",
                            order: parseInt(layerObj.attr("data-ism-order")) || 100 + idx,
                            hasScroll: layerObj.attr("data-ism-scroll-to"),
                            links: layerObj.attr("data-ism-links"),
                            style: {
                                backgroundColor: "rgba(0, 0, 0, 0)" !== layerObj.css("background-color") ? layerObj.css("background-color") && !isOk.test(layerObj.css("background-color")) ? rgbaToHex(layerObj.css("background-color")) : layerObj.css("background-color") : "",
                                backgroundPositionX: layerObj.css("background-position-x") ? layerObj.css("background-position-x") : "0px",
                                backgroundPositionY: layerObj.css("background-position-y") ? layerObj.css("background-position-y") : "0px",
                                backgroundPosition: layerObj.css("background-position") ? layerObj.css("background-position") : "",
                                zIndex: layerObj.css("z-index") ? layerObj.css("z-index") : "",
                                top: layerObj.css("top") ? layerObj.css("top") : "0px",
                                left: layerObj.css("left") ? layerObj.css("left") : "0px",
                                width: (layerObj.attr("data-ism-width") ? layerObj.attr("data-ism-width") : "") || (layerObj.css("width") ? layerObj.css("width") : "0px"),
                                height: (layerObj.attr("data-ism-height") ? layerObj.attr("data-ism-height") : "") || (layerObj.css("height") ? layerObj.css("height") : "0px")
                            }
                        };
                        all.push(temp);
                    }
                });
                return all;
            };
            Bridge.prototype.initAllStysheets = function() {
                return document.styleSheets;
            };
            Bridge.prototype.initAllLayers = function() {
                var layers = $("[data-ism-layer]") || [];
                layers.map(function(idx, layer) {
                    var layerObj = $(layer), zIndex = "video" === layerObj.attr("data-ism-layer") ? 19999 + idx + 1 : 999 + idx + 1;
                    if (layerObj.attr("data-ism-layer")) {
                        "auto" === layerObj.css("zIndex") ? "video" === layerObj.attr("data-ism-layer") ? layerObj.css("z-index", 19999 + idx + 10) : layerObj.css("z-index", 999 + idx + 10) : layerObj.css("zIndex") ? zIndex = layerObj.css("zIndex") : layerObj.css("z-index", 999 + idx + 10);
                        layerObj.find("img").css("zIndex", zIndex + 1);
                        var activeLayerObj = $('<div id="clickable-' + layerObj.attr("id") + '" data-ism-layer-active style="position:absolute;z-index:' + zIndex + ";top:0px;left:0px;width:" + layerObj.width() + "px;height:" + layerObj.height() + 'px"></div>');
                        activeLayerObj.on("click", function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });
                        layerObj.append(activeLayerObj);
                    }
                });
                document.addEventListener("dragover", function(e) {
                    e.preventDefault();
                }, !1);
                document.addEventListener("drop", function(e) {
                    e.preventDefault();
                }, !1);
            };
            var bridge = new Bridge({
                frameId: ISM.initData.id
            });
            bridge.Loaded();
            var initLayersTimeout = setTimeout(function() {
                bridge.initAllLayers();
                if ("undefined" != typeof areYouReady && areYouReady) {
                    clearTimeout(initLayersTimeout);
                    bridge.initAllStysheets();
                    $("html > head").append($("<style>div[data-ism-layer] {border:1px dashed;box-sizing:border-box;}</style>"));
                }
            }, 1e3), sendInternalMessage = function(message) {
                (inIframe(window.parent.parent) ? window.parent.parent : window.parent).postMessage(JSON.stringify(message), "*");
            }, askForReload = function() {
                var message = {
                    method: "applyReload"
                };
                window.top.postMessage(JSON.stringify(message), "*");
            };
        },
        "./src/button/index.js": function(module, __webpack_exports__, __webpack_require__) {
            "use strict";
            var __WEBPACK_IMPORTED_MODULE_0__create__ = __webpack_require__("./src/button/create.js");
            __webpack_require__.d(__webpack_exports__, "a", function() {
                return __WEBPACK_IMPORTED_MODULE_0__create__.a;
            });
        },
        "./src/index.js": function(module, __webpack_exports__, __webpack_require__) {
            "use strict";
            Object.defineProperty(__webpack_exports__, "__esModule", {
                value: !0
            });
            var __WEBPACK_IMPORTED_MODULE_0__button__ = __webpack_require__("./src/button/index.js");
            __webpack_require__.d(__webpack_exports__, "Bridge", function() {
                return __WEBPACK_IMPORTED_MODULE_0__button__.a;
            });
        }
    });
});
//# sourceMappingURL=inskin.bridge.js.map
//# sourceMappingURL=inskin.bridge.js.map