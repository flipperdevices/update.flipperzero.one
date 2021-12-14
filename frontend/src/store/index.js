import { createStore } from 'vuex'
import { mutations } from './mutations'
import actions from './actions'

export default createStore({
  state: {
    currentApp: 'Updater',

    userAgent: {},

    firmwareChannels: {
      release: {},
      rc: {},
      dev: {}
    }
  },
  actions,
  mutations
})
