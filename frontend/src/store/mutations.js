export const mutations = {
  setCurrentApp (state, payload) {
    state.currentApp = payload.currentApp
  },
  setMode (state, payload) {
    state.mode = payload.mode
  },
  setUiError (state, payload) {
    state.ui.error.isError = payload.error.isError
    state.ui.error.message = payload.error.message
    state.ui.error.button = payload.error.button
  },
  setUiFlag (state, payload) {
    state.ui[payload.flag.name] = payload.flag.value
  },
  setUserAgent (state, payload) {
    state.userAgent = payload.userAgent
  },
  setFirmwareChannels (state, payload) {
    state.firmwareChannels = payload.firmwareChannels
  },
  incrementUpdateCounter (state) {
    state.updateCounter++
  },
  setQFlipperLink (state, payload) {
    state.qFlipperLink = payload.qFlipperLink
  }
}
