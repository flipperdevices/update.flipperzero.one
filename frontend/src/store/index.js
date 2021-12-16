import { createStore } from 'vuex'
import { mutations } from './mutations'
import actions from './actions'

export default createStore({
  state: {
    currentApp: 'Updater',
    mode: 'serial',

    ui: {
      error: {
        isError: false,
        message: '',
        button: ''
      },
      reconnecting: false,
      blockButtons: false
    },

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
