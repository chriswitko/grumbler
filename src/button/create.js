/* global $ */

export function Bridge () {
  this.layers = []
  this.stylesheets = []
  this.creativeId = ''
  this.device = 'Desktop'

  if (!$) {
    console.log('The jQuery is not available.')
  }

  // Define option defaults
  let defaults = {
    frameId: ''
  }

  // Create options by extending defaults with the passed in arugments
  if (arguments[0] && typeof arguments[0] === 'object') {
    this.options = extendDefaults(defaults, arguments[0])
  }

  const _this = this
  const receiver = inIframe(window.parent.parent) ? window.parent.parent : window.parent
  const cleanFilename = name => name.substring(0, name.indexOf('?'))

  receiver.addEventListener('message', (event) => {
    const supportedStylesheetsProxy = Array.from(document.styleSheets).filter(f => {
      return f && f.href && f.href.includes('/proxy/')
    })
    const supportedStylesheetsGateway = Array.from(document.styleSheets).filter(f => {
      return f && f.href && f.href.includes('/gateway/')
    })
    const supportedStylesheets = [].concat(supportedStylesheetsProxy || []).concat(supportedStylesheetsGateway || [])

    const data = JSON.parse(event.data)
    switch (data.method) {
      case 'areYouReady':
        const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
        const messageX = {
          method: 'onAreYouReady',
          data: {
            frameId: fileName
          }
        }
        if (typeof areYouReady !== 'undefined' && areYouReady) {
          window.top.postMessage(JSON.stringify(messageX), '*')
        }
        break
      case 'setupId':
        _this.creativeId = data.payload.creativeId
        _this.device = data.payload.device
        break
      case 'initLayers':
        // _this.creativeId = data.payload.creativeId
        _this.initAllLayers()
        _this.stylesheets = _this.initAllStysheets()
        $('html > head').append($('<style>div[data-ism-layer] {border:1px dashed;box-sizing:border-box;}</style>'))
        break
      case 'getLayers':
        _this.layers = _this.getAllLayers()
        _this.stylesheets = _this.initAllStysheets()
        const message = {
          method: 'onGetLayers',
          data: _this.layers
        }
        window.top.postMessage(JSON.stringify(message), '*')
        break
      case 'applyActionToLayer':
        if (data.payload.action === 'bgtype') {
          const layer = $(`#${data.payload.id}`)
          layer.attr('data-bgtype', data.payload.value)
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          let objHand = {}
          objHand[`#${data.payload.id}`] = ['data-bgtype', (data.payload.value)]
          sendPropsChangesToCore(_this.creativeId, fileName, [objHand])
          askForReload()
        }
        if (data.payload.action === 'align') {
          const layer = $(`#${data.payload.id}`)
          const layerType = layer.prop("tagName")
          let hasChange = false
          supportedStylesheets.map(file => {
            switch (data.payload.value) {
              case 'left':
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['left', '0px']], ['right', 'margin-left'])) {
                  sendChangesToCore(_this.creativeId, file)
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-x', 'left']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              case 'center':
                const layerWidth = parseInt(layer.css('width'))
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['left', '50%'], ['margin-left', `-${layerWidth / 2}px`]], ['right'])) {
                  sendChangesToCore(_this.creativeId, file)
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-x', 'center']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              case 'right':
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['right', '0']], ['left', 'margin-left'])) {
                  sendChangesToCore(_this.creativeId, file)
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-x', 'right']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              case 'top':
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['top', '0']], ['bottom', 'margin-top'])) {
                  sendChangesToCore(_this.creativeId, file)                  
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-y', 'top']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              case 'middle':
                const layerHeight = parseInt(layer.css('height'))
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['top', '50%'], ['margin-top', `-${layerHeight / 2}px`]], ['bottom'])) {
                  sendChangesToCore(_this.creativeId, file)
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-y', 'center']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              case 'bottom':
                if (data.payload.variant === 'video' && changeStylesheetRule(file, `#${data.payload.id}`, [['bottom', '0']], ['top', 'margin-top'])) {
                  sendChangesToCore(_this.creativeId, file)
                } else if (layerType === 'DIV') {
                  if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-position-y', 'bottom']], [])) {
                    sendChangesToCore(_this.creativeId, file)
                  }
                }
              break
              default:
            }
          })
        }

        if (
          data.payload.action === 'background-position-x' 
          || data.payload.action === 'background-position-y' 
          || data.payload.action === 'background-position' 
          || data.payload.action === 'z-index' 
          || data.payload.action === 'width' 
          || data.payload.action === 'height' 
          || data.payload.action === 'top' 
          || data.payload.action === 'left'
          || data.payload.action === 'right'
          || data.payload.action === 'bottom'
          ) {
          supportedStylesheets.filter(f => f.href.includes(`${data.payload.group}.css`)).map(file => {
            if (changeStylesheetRule(file, `#${data.payload.id}`, [[data.payload.action, data.payload.value]])) {
              sendChangesToCore(_this.creativeId, file)
            }
          })

          // Connected layers
          const layer = $(`#${data.payload.id}`)
          const layerLinksRaw = layer.attr('data-ism-links') && layer.attr('data-ism-links').split(',')
          const layerLinks = (layerLinksRaw || []).map(l => l.trim())
          supportedStylesheets.map(file => {
            if (changeStylesheetRule(file, `#${data.payload.id}`, [[data.payload.action, data.payload.value]])) {
              sendChangesToCore(_this.creativeId, file)
            }
          })
          if (layerLinks.length) {
            layerLinks.map(l => {
              const message = {
                method: 'applyActionToLayer',
                payload: {
                  id: l,
                  variant: data.payload.variant,
                  action: data.payload.action,
                  value: data.payload.value
                }
              }
              sendInternalMessage(message)
            })
          }
          // end:Connected layers
        }

        if (data.payload.action === 'background-color') {
          const layer = $(`#${data.payload.id}`)
          const layerType = layer.prop("tagName")
          const layerLinksRaw = layer.attr('data-ism-links') && layer.attr('data-ism-links').split(',')
          const layerLinks = (layerLinksRaw || []).map(l => l.trim())
          supportedStylesheets.map(file => {
            if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-color', data.payload.value]])) {
              sendChangesToCore(_this.creativeId, file)
            }
            if (data.payload.id === 'header-bg') {
              if (changeStylesheetRule(file, `body`, [['background-color', data.payload.value]])) {
                sendChangesToCore(_this.creativeId, file)
              }
            }
          })
          if (layerLinks.length) {
            layerLinks.map(l => {
              const message = {
                method: 'applyActionToLayer',
                payload: {
                  id: l,
                  variant: data.payload.variant,
                  action: data.payload.action,
                  value: data.payload.value
                }
              }
              sendInternalMessage(message)
            })
          }
        }
        if (data.payload.action === 'image') {
          const layer = $(`#${data.payload.id}`)
          const layerType = layer.prop("tagName")
          const layerLinksRaw = layer.attr('data-ism-links') && layer.attr('data-ism-links').split(',')
          const layerLinks = (layerLinksRaw || []).map(l => l.trim())
          if (layerType === 'DIV') {
            // fix urls
            const fixUrl1 = `https://creator.inskinmedia.com/gateway/assets/creatives/${_this.creativeId}/build/assets`;
            data.payload.value = data.payload.value.replace(`https://creator.inskinmedia.com/gateway/assets/creatives/${_this.creativeId}/build/assets`, './assets')
            data.payload.value = data.payload.value.replace(`http://localhost:4000/gateway/assets/creatives/${_this.creativeId}/build/assets`, './assets')
            supportedStylesheets.map(file => {
              if (data.payload.value) {
                let changes = [['background-image', `url(${(data.payload.value)})`]]
                if (_this.device === 'Smartphone') {
                  changes.push(['background-size', (parseInt(data.payload.asset.raw_width, 10) / 2) + 'px auto'])
                }
                if (changeStylesheetRule(file, `#${data.payload.id}`, changes)) {
                  sendChangesToCore(_this.creativeId, file)
                }
              } else {
                if (changeStylesheetRule(file, `#${data.payload.id}`, [['background-image', ``], ['background-size', '']])) {
                  sendChangesToCore(_this.creativeId, file)
                }
              }
            })
            // layer.css('background-image', `url(${data.payload.value})`)
            // TODO: Process this in exteranal function
            if (layerLinks.length) {
              layerLinks.map(l => {
                const message = {
                  method: 'applyActionToLayer',
                  payload: {
                    id: l,
                    variant: data.payload.variant,
                    action: data.payload.action,
                    value: data.payload.value,
                    asset: data.payload.asset
                  }
                }
                sendInternalMessage(message)
              })
            }
            // layer.css('background-color', `red`)
          }
        }
        // TODO: Encasulate
        if (data.payload.action === 'video-poster') {
          const baseLayer = $(`#${data.payload.id}`)
          baseLayer.attr('data-poster', data.payload.value)
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          let baseLayerHandler = {}
          baseLayerHandler[`#${data.payload.id}`] = ['data-poster', (data.payload.value)]
          sendPropsChangesToCore(_this.creativeId, fileName, [baseLayerHandler])
          const layer = $(`#${data.payload.id} #poster`)
          const layerType = layer.prop("tagName")
          if (layer && layerType === 'IMG') {
            layer.attr('src', data.payload.value)
            const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
            sendPropsChangesToCore(_this.creativeId, fileName, [{'#poster': ['src', (data.payload.value)]}])
          }
        }
        if (data.payload.action === 'video') {
          const layer = $(`#${data.payload.id}`)
          layer.attr('data-ism-video-url', data.payload.value)
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          let videoObjHandler = {}
          videoObjHandler[`#${data.payload.id}`] = ['data-ism-video-url', (data.payload.value)]
          sendPropsChangesToCore(_this.creativeId, fileName, [videoObjHandler])
        }
        if (data.payload.action === 'video-auto-play') {
          const layer = $(`#${data.payload.id}`)
          layer.attr('data-ism-auto-play', data.payload.value)
          // const playButton = layer.find('.bigPlayContainer')
          // if (playButton) {
          //   if (data.payload.value === 'true') {
          //     playButton.css('display', '')
          //   } else {
          //     playButton.css('display', 'none')
          //   }
          // }
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          let videoObjHandler = {}
          videoObjHandler[`#${data.payload.id}`] = ['data-ism-auto-play', (data.payload.value)]
          sendPropsChangesToCore(_this.creativeId, fileName, [videoObjHandler])
          askForReload()
        }
        if (data.payload.action === 'video-allow-fullscreen') {
          const layer = $(`#${data.payload.id}`)
          layer.attr('data-ism-allow-fullscreen', data.payload.value)
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          let videoObjHandler = {}
          videoObjHandler[`#${data.payload.id}`] = ['data-ism-allow-fullscreen', (data.payload.value)]
          sendPropsChangesToCore(_this.creativeId, fileName, [videoObjHandler])
          askForReload()
        }
        if (data.payload.action === 'video-show-controls') {
          let videoObjHandler = {}
          const layer = $(`#${data.payload.id}`)
          layer.attr('data-ism-show-controls', data.payload.value)
          if (data.payload.value.toString() === 'false') {
            layer.attr('data-ism-auto-play', 'true')
            layer.attr('data-ism-allow-fullscreen', 'false')
            videoObjHandler[`#${data.payload.id}`] = [['data-ism-show-controls', (data.payload.value)], ['data-ism-auto-play', 'true'], ['data-ism-allow-fullscreen', 'false']]
          } else {
            layer.attr('data-ism-auto-play', 'true')
            layer.attr('data-ism-allow-fullscreen', 'true')
            videoObjHandler[`#${data.payload.id}`] = [['data-ism-show-controls', (data.payload.value)], ['data-ism-auto-play', 'true'], ['data-ism-allow-fullscreen', 'true']]
          }
          const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
          sendPropsChangesToCore(_this.creativeId, fileName, [videoObjHandler])
          askForReload()
        }
        break
      case 'selectLayer':
        _this.layers = _this.getAllLayers()
        $('[data-ism-layer-active]').each(function( index ) {
          $(this).hide()
        })
        if (data.layer.id) {
          const mainFrame = inIframe(window.parent.parent) ? window.parent.document : window.parent.document // window.parent.document
          const currentSelection = _this.layers.find(l => l.id === data.layer.id)
          if(currentSelection && currentSelection.hasScroll) {
            const y = $(window).scrollTop()
            if (inIframe(window.parent.parent)) {
              $(mainFrame).find('body').animate({scrollTop: y + parseInt(currentSelection.hasScroll)}, 600);
            } else {
              $(mainFrame).find('html').animate({scrollTop: y + parseInt(currentSelection.hasScroll)}, 600);
            }
          } else {
            $(mainFrame).scrollTop(0)
          }
          if(currentSelection && currentSelection.links) {
            // SUPPORT LINKED ELEMENTS (e.g. backgrounds)
          }
          $(`#${data.layer.id}`).find('[data-ism-layer-active]').show()
        }
        break
      default:
        console.log('NOT IDENTIFIED METHOD', data.method)
    }
  })
}

// Public Methods

Bridge.getLayers = () => {
  this.getAllLayers()
}

Bridge.prototype.Loaded = () => {
  console.log('Inskin.Bridge.Loaded')
  const fileName = document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]
  let message = {
    method: 'onAreYouReady',
    data: {
      frameId: fileName
    }
  }
  window.top.postMessage(JSON.stringify(message), '*')
  
  message = {
    method: 'onSetup',
  }
  window.top.postMessage(JSON.stringify(message), '*')
}

Bridge.prototype.getAllLayers = () => {
  const layers = $('[data-ism-layer]')
  const minIndex = 999
  const alwaysOnTopIndex = 19000 + minIndex
  const self = this
  const all = []
  const isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/
  layers.map((idx, layer) => {
    const layerObj = $(layer)
    if (layerObj.attr('data-ism-layer')) {
      const fileName = (document.location.href.replace(/^.*[\\\/]/, '').split('?')[0]).replace('.html', '')
      const temp = {
        group: fileName,
        id: layerObj.attr('id'),
        key: layerObj.attr('data-ism-key'),
        name: layerObj.attr('data-ism-name') || layerObj.attr('id'),
        variant: layerObj.attr('data-ism-layer'),
        assetURL: layerObj.attr('src') || (layerObj.css('background-image') !== 'none' ? layerObj.css('background-image').replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '') : '') || layerObj.attr('data-poster') || layerObj.find('#poster').attr('src') || '',
        assetVideoURL: layerObj.attr('data-ism-video-url') || '',
        videoAutoPlay: layerObj.attr('data-ism-auto-play') || '',
        allowFullscreen: layerObj.attr('data-ism-allow-fullscreen') || '',
        controls: layerObj.attr('data-ism-show-controls') || '',
        bgtype: layerObj.attr('data-bgtype') || '',
        isRemovable: layerObj.attr('data-ism-removable') === 'true',
        isSelectable: !layerObj.attr('data-ism-selectable') || layerObj.attr('data-ism-selectable') === 'true',
        disabledProps: layerObj.attr('data-ism-disabled-props') || '',
        order: parseInt(layerObj.attr('data-ism-order')) || 100 + idx,
        hasScroll: layerObj.attr('data-ism-scroll-to'),
        links: layerObj.attr('data-ism-links'),
        style: {
          backgroundColor: (layerObj.css('background-color') !== 'rgba(0, 0, 0, 0)' ? (layerObj.css('background-color') && !isOk.test(layerObj.css('background-color')) ? rgbaToHex(layerObj.css('background-color')) : layerObj.css('background-color')) : ''),
          backgroundPositionX: (layerObj.css('background-position-x') ? layerObj.css('background-position-x') : '0px'),
          backgroundPositionY: (layerObj.css('background-position-y') ? layerObj.css('background-position-y') : '0px'),
          backgroundPosition: (layerObj.css('background-position') ? layerObj.css('background-position') : ''),
          zIndex: (layerObj.css('z-index') ? layerObj.css('z-index') : ''),
          top: (layerObj.css('top') ? layerObj.css('top') : '0px'),
          left: (layerObj.css('left') ? layerObj.css('left') : '0px'),
          width: (layerObj.attr('data-ism-width') ? layerObj.attr('data-ism-width') : '') || (layerObj.css('width') ? layerObj.css('width') : '0px'),
          height: (layerObj.attr('data-ism-height') ? layerObj.attr('data-ism-height') : '') || (layerObj.css('height') ? layerObj.css('height') : '0px'),
        }
      }
      all.push(temp)
    }
  })
  return all;
}

Bridge.prototype.initAllStysheets = () => {
  const stylesheets = document.styleSheets
  return stylesheets
}

Bridge.prototype.initAllLayers = () => {
  const layers = $('[data-ism-layer]') || []
  const minIndex = 999
  const alwaysOnTopIndex = 19000 + minIndex
  const self = this

  // const all = []
  layers.map((idx, layer) => {
    const layerObj = $(layer)
    // TODO: Move events ourside fn
    // layerObj.mouseout((e) => {
    //   e.preventDefault()
    //   e.stopPropagation()
    //   layerObj.removeAttr('data-ism-layer-active')
    //   $(`clickable-${layerObj.attr('id')}`).remove()
    // })
    // layerObj.on('click', (e) => {
    //   layerObj.css('zIndex', parseInt(layerObj.css('zIndex')) - 10)
    // })
    const currentObj = layerObj
    let zIndex = layerObj.attr('data-ism-layer') === 'video' ? alwaysOnTopIndex + idx + 1 : minIndex + idx + 1
    if (layerObj.attr('data-ism-layer')) {
      if (layerObj.css('zIndex') === 'auto') {
        if (layerObj.attr('data-ism-layer') === 'video') {
          layerObj.css('z-index', alwaysOnTopIndex + idx + 10)
        } else {
          layerObj.css('z-index', minIndex + idx + 10)
        }
      } else if (layerObj.css('zIndex')) {
        // no changes
        zIndex = layerObj.css('zIndex');
      } else {
        layerObj.css('z-index', minIndex + idx + 10)
      }
      layerObj.find('img').css('zIndex', zIndex + 1)
      const activeLayerObj = $(`<div id="clickable-${layerObj.attr('id')}" data-ism-layer-active style="position:absolute;z-index:${zIndex};top:0px;left:0px;width:${layerObj.width()}px;height:${layerObj.height()}px"></div>`) // Layer: ${layerObj.attr('data-ism-label') || layerObj.attr('id') || 'Unknown'} - ${layerObj.width()}x${layerObj.height()}
      activeLayerObj.on('click', (e) => {
        e.preventDefault()
        e.stopPropagation()
        // TODO: Send selected layer message
        // layerObj.css('zIndex', parseInt(layerObj.css('zIndex')) - 10)
      })
      layerObj.append(activeLayerObj)
    } else {
      // currentObj.attr('data-ism-layer-active', 'true')
    }
  })

  // return all;
  document.addEventListener('dragover', function (e) {
    e.preventDefault();
  }, false);

  document.addEventListener('drop', function (e) {
    e.preventDefault();
  }, false);    
}

var bridge = new Bridge({frameId: ISM.initData.id});
bridge.Loaded();

let initLayersTimeout = setTimeout(() => {
  bridge.initAllLayers();
  if (typeof areYouReady !== 'undefined' && areYouReady) {
    clearTimeout(initLayersTimeout);
    bridge.initAllStysheets()
    $('html > head').append($('<style>div[data-ism-layer] {border:1px dashed;box-sizing:border-box;}</style>'))
  }
}, 1000)

function inIframe (win) {
    try {
        return win.self !== window.top;
    } catch (e) {
        return true;
    }
}

function trim (str) {
  return str.replace(/^\s+|\s+$/gm,'');
}

function rgbaToHex (rgba) {
  var parts = rgba.substring(rgba.indexOf("(")).split(","),
      r = parseInt(trim(parts[0].substring(1)), 10),
      g = parseInt(trim(parts[1]), 10),
      b = parseInt(trim(parts[2]), 10),
      a = parts[3] ? parseFloat(trim(parts[3].substring(0, parts[3].length - 1))).toFixed(2) : '';

  return ('#' + r.toString(16) + g.toString(16) + b.toString(16) + (parts[3] ? (a * 255).toString(16).substring(0,2) : ''));
}
// Private Methods
function sendPropsChangesToCore(creativeId, file, props) {
  const message = {
    method: 'onPropsUpdate',
    data: {
      creativeId: creativeId,
      file: file,
      props: props
    }
  }
  window.top.postMessage(JSON.stringify(message), '*')
}

function sendChangesToCore(creativeId, file) {
  const filename = file.href.replace(/^.*[\\\/]/, '')
  const message = {
    method: 'onCSSUpdate',
    data: {
      creativeId: creativeId,
      file: filename,
      source: getCSSChanges(file)
    }
  }
  window.top.postMessage(JSON.stringify(message), '*')
}

function getCSSChanges(stylesheet) {
  let style = null;
  let cssStyles = '';
  if (typeof stylesheet.cssRules != "undefined")
      style = stylesheet.cssRules;
  else if (typeof stylesheet.rules != "undefined")
      style = stylesheet.rules;
  for(var item in style) {
      if(style[item].cssText != undefined)
          cssStyles += (style[item].cssText + '\n\n');
  }
  return cssStyles
}

function changeStylesheetRule(stylesheet, selector, updateRules, removeRules, cb) {
	selector = selector;
  removeRules = removeRules || []
  updateRules = updateRules || []
  let isModified = false

  if (stylesheet && stylesheet.cssRules) {
    for(var i = 0; i < stylesheet.cssRules.length; i++) {
      var rule = stylesheet.cssRules[i];
      if(rule.selectorText === selector) {
        removeRules.map(r => rule.style.removeProperty(r))
        updateRules.map(k => {
          rule.style[k[0]] = k[1];
        })
        isModified = true
        return true;
      }
    }
  }
  if (isModified) {
    stylesheet.insertRule(selector + " { " + property + ": " + value + "; }", 0);
    return true
  }
  return false
}

function getElementStyles(element, className, addOnCSS) {
  if (!element) {
    return
  }
  if (element.nodeType !== 1) {
    return;
  }
  var styles = '';
  var children = element.getElementsByTagName('*');
  className = className || '.' + element.className.replace(/^| /g, '.');
  addOnCSS = addOnCSS || '';
  styles += className + '{' + (window.getComputedStyle(element, null).cssText + addOnCSS) + '}';
  for (var j = 0; j < children.length; j++) {
    if (children[j].className) {
      var childClassName = '.' + children[j].className.replace(/^| /g, '.');
      styles += ' ' + className + '>' + childClassName +
        '{' + window.getComputedStyle(children[j], null).cssText + '}';
    }
  }
  return styles;
}

const sendInternalMessage = (message) => {
  /// kk
  const receiver = inIframe(window.parent.parent) ? window.parent.parent : window.parent
  receiver.postMessage(JSON.stringify(message), '*')
}

const askForReload = () => {
  const message = {
    method: 'applyReload',
  }
  window.top.postMessage(JSON.stringify(message), '*')
}

const initializeEvents = () => {
  const _this = this
  window.parent.addEventListener('message', (event) => {
    const data = JSON.parse(event.data)
    switch (data.method) {
      case 'getLayers':
        break
      default:
        console.log('NOT IDENTIFIED METHOD', data.method)
    }
  })
}

function extendDefaults (source, properties) {
  var property
  for (property in properties) {
    if (properties.hasOwnProperty(property)) {
      source[property] = properties[property]
    }
  }
  return source
}
