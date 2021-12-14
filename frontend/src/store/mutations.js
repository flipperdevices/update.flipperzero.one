export const mutations = {
  setUserAgent (state, payload) {
    state.userAgent = payload.userAgent
  },
  setFirmwareChannels (state, payload) {
    state.firmwareChannels = payload.firmwareChannels
  }
}
