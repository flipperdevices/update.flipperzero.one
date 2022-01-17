<template>
  <q-card class="shadow-4">
    <template v-if="showIntro">
      <q-card-section :horizontal="$q.screen.gt.xs" class="q-pa-none">
        <q-card-section v-if="userAgent.browser !== 'Not supported'" class="col-5 flex items-center justify-center images">
          <img src="../assets/connect_to_browser.svg" class="updater-img absolute" />
          <img v-if="userAgent.browser === 'Chrome'" src="../assets/chrome.svg" class="updater-img absolute" />
          <img v-else-if="userAgent.browser === 'Edge'" src="../assets/edge.svg" class="updater-img absolute" />
          <img v-else-if="userAgent.browser === 'Yandex'" src="../assets/yandex.svg" class="updater-img absolute" />
        </q-card-section>
        <q-card-section v-if="userAgent.browser !== 'Not supported'" class="q-pb-lg text-left updater-desc">
          <h4>Web updater</h4>
          <h5>Flash the latest firmware right in your browser using WebUSB.</h5>
          <p v-if="userAgent.os === 'Windows'">
            1. For the first time you may need to connect Flipper in DFU mode and install WinUSB driver. You can use <a @click="route(dropdown[0].href)">qFlipper installer</a> for that.
          </p>
          <div v-if="userAgent.os === 'Linux'">
            <p class="q-mb-sm">
            1. On Linux you need to allow WebUSB to access devices first. Download and run <a href="https://raw.githubusercontent.com/Flipper-Zero/update.flipperzero.one/main/setup_rules.sh" target="blank">this script</a>:
            </p>
            <div class="q-mb-sm">
              <code>
                sh setup_rules.sh
                <span>
                  <q-icon :name="evaClipboardOutline" @click="copy('sh setup_rules.sh')"></q-icon>
                  <q-tooltip anchor="top middle" self="center middle">
                    <span v-if="!copied">Copy to clipboard</span>
                    <span v-else>Copied!</span>
                  </q-tooltip>
                </span>
              </code>
            </div>
            <p>
              This script will install system rules that will enable communication with your Flipper Zero.
            </p>
          </div>
          <p v-if="userAgent.os === 'macOS'">
            No drivers needed!
          </p>
          <p>
            <span v-if="userAgent.os === 'Windows' || userAgent.os === 'Linux'">2. </span>Connect your Flipper to the computer, press the button below and choose your device from browser prompt.
          </p>
          <p>
            Currently supports only Chrome-based browsers (except Opera).
          </p>
          <p v-if="customSource.url">
            <b>Found custom firmware, connect to flash it.</b>
          </p>
          <div class="text-center q-mt-lg" :class="$q.screen.xs ? 'q-pb-lg' : 'q-pb-sm'">
            <q-btn color="positive" padding="12px 30px" @click="start('serial')">Connect to Flipper</q-btn>
          </div>
          <q-btn
            flat
            color="grey-8"
            size="13px"
            class="absolute-bottom-right q-ma-sm"
            @click="start('usb')"
          >Recovery mode</q-btn>
        </q-card-section>
      </q-card-section>
      <q-card-section
        v-if="userAgent.browser === 'Not supported'"
        class="fit flex column flex-center q-pa-md"
      >
        <h4>Your browser doesn't support Web Updater <span style="white-space: nowrap;">:(</span></h4>
        <img
          v-if="userAgent.os !== 'Android'"
          src="../assets/notsupported.svg"
          class="unsupported-img"
        />
        <div v-else class="relative">
          <q-img src="../assets/connect_to_browser.svg" class="updater-img"></q-img>
          <q-img src="../assets/chrome.svg" class="updater-img absolute"></q-img>
        </div>
        <p class="q-pt-md">
          Your browser doesn’t support <span v-if="!userAgent.usb">WebUSB</span><span v-if="!userAgent.usb && !userAgent.serial"> and </span><span v-if="!userAgent.serial">WebSerial</span><span v-if="userAgent.usb">, but Recovery Mode is still available. <a href="https://docs.flipperzero.one/ru/basics/firmware-update/web-updater#ws-recovery-mode">Learn about Recovery Mode usage</a></span>.
        </p>
        <p v-if="userAgent.os !== 'Android'">Updater currently supports only Chrome-based browsers (except Opera). Try Chrome/Edge/Yandex browser.</p>
        <p v-if="userAgent.os === 'Android' && !userAgent.usb">Updater supports Recovery Mode in Chrome for Android. Install latest Chrome version or Chrome Beta.</p>
        <div>
          <q-btn v-if="!userAgent.usb" color="accent" padding="12px 30px" type="a" href="https://caniuse.com/webusb">Compatibility List</q-btn>
          <q-btn
            v-if="userAgent.usb"
            color="positive"
            padding="12px 30px"
            @click="start('usb')"
          >Recovery mode</q-btn>
        </div>
      </q-card-section>
    </template>
    <template v-else>
      <div class="flex column flex-center">
        <div v-show="showOverlay" class="popup-overlay z-max">
          <div class="absolute-top-right q-ma-md text-white">
            <q-btn
              flat
              round
              :icon="evaCloseOutline"
              :size="!$q.screen.xs ? '24px' : '18px'"
              @click="showOverlay = false"
            ></q-btn>
            <p>Close</p>
          </div>
          <q-card v-show="error.isError" flat bordered dark style="background: none;" id="error">
            <q-card-section class="text-white text-left">
              <div class="text-h6"><q-icon :name="evaAlertCircleOutline" color="negative"></q-icon> Error</div>
              <div class="text-subtitle2">{{ error.message }}<a v-if="error.message && error.toString().includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
            </q-card-section>

            <q-separator dark v-if="error.button.length"></q-separator>

            <q-card-actions v-if="error.button.length" align="right" class="text-white">
            <q-btn flat @click="connect()">Reconnect</q-btn>
            </q-card-actions>
          </q-card>
          <div class="absolute-bottom-right q-mr-lg text-white text-right">
            <div v-if="error.isError" style="min-width: 200px">
              <q-btn
                :disabled="connection === 3 && status === 3 && ui.blockButtons"
                outline
                color="white"
                size="13px"
                class="q-ma-sm"
                @click="changeMode(false)"
              >{{mode == 'serial' ? 'Recovery mode' : 'Normal mode'}}</q-btn>
            </div>
            <p v-if="userAgent.os === 'Windows'">
              Can't find your Flipper?
              Connect Flipper in DFU mode and install WinUSB driver. You can use <a :href="qFlipperLink">qFlipper installer</a> for that.
            </p>
            <p v-if="userAgent.os === 'Linux'" class="q-mb-sm">
              Can't find your Flipper?
              On Linux you need to allow WebUSB to access devices first. Download and run <a href="https://raw.githubusercontent.com/Flipper-Zero/update.flipperzero.one/main/setup_rules.sh" target="blank">this script</a>.
            </p>
          </div>
        </div>

        <div v-show="showArrows && !$q.screen.xs" class="arrows z-max">
          <div id="arrow-1">
            <q-icon :name="evaArrowBackOutline"></q-icon>
            <div>
              <span class="q-pl-sm">1. {{ mode === 'serial' ? 'Find your Flipper in dropdown menu' : 'Find your Flipper in recovery mode (DFU in FS Mode)' }}</span>
              <div v-if="!error.isError && mode === 'usb'" class="flex flex-center flipper q-mt-lg">
                <img src="../assets/screens/dfu.svg" class="absolute"/>
                <img src="../assets/flipper_w.svg" />
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                  viewBox="0 0 360 156" style="enable-background:new 0 0 360 156;" xml:space="preserve" class="led absolute">
                  <g>
                    <path style="opacity: 0.5; fill: #007eff;" d="M238.5,98c-1.9,0-3.5-1.6-3.5-3.5s1.6-3.5,3.5-3.5s3.5,1.6,3.5,3.5S240.4,98,238.5,98z M238.5,92 c-1.4,0-2.5,1.1-2.5,2.5s1.1,2.5,2.5,2.5s2.5-1.1,2.5-2.5S239.9,92,238.5,92z"/>
                  </g>
                  <circle style="fill: #007eff;" cx="238.5" cy="94.5" r="2.5"/>
                </svg>
              </div>
            </div>
          </div>
          <div id="arrow-2">
            <q-icon :name="evaArrowUpwardOutline"></q-icon>
            <span class="q-pl-sm q-pt-xs">2. Press "Connect"</span>
          </div>
        </div>

        <q-card v-show="error.isError && !showOverlay" id="error" class="q-ma-xl">
          <q-card-section class="bg-negative text-white text-left">
            <div class="text-h6"><q-icon :name="evaAlertCircleOutline"></q-icon> Error</div>
            <div class="text-subtitle2">{{ error.message }}<a v-if="error.toString().includes('access')" href="https://docs.flipperzero.one/en/usage/general/flashing-firmware/#fix-drivers">the wrong driver</a></div>
          </q-card-section>

          <q-separator v-if="error.button.length"></q-separator>

          <q-card-actions v-if="error.button.length" align="right">
            <q-btn flat @click="connect()">Reconnect</q-btn>
          </q-card-actions>
        </q-card>

        <template v-if="!error.isError">
          <template v-if="flipperResponds">
            <q-card-section class="fit">
              <Updater
                v-if="currentApp === 'Updater' && dev.version"
                :flipper="flipper"
                @connect="connect"
                @set-manifest="setManifest"
                @recognize-device="recognizeDevice"
                ref="Updater"
              />
              <Terminal
                v-else-if="currentApp === 'Terminal'"
                :flipper="flipper"
                @toggle-terminal="toggleTerminal"
                ref="Terminal"
              />
              <Paint
                v-else-if="currentApp === 'Paint'"
                :flipper="flipper"
              />
            </q-card-section>
            <div v-if="!ui.blockButtons && currentApp === 'Updater' && connection === 2" class="absolute-top-right">
              <q-btn
                flat
                dense
                :color="'grey-7'"
                :icon="mdiConsole"
                size="16px"
                class="q-ma-sm z-top"
                @click="toggleTerminal"
              ></q-btn>

              <q-btn
                flat
                dense
                color="grey-7"
                :icon="evaBrushOutline"
                size="16px"
                class="q-ma-sm z-top"
                @click="showPaint"
              ></q-btn>
            </div>
          </template>
          <q-spinner
            v-else
            color="accent"
            size="3em"
            class="q-ma-xl"
          ></q-spinner>
        </template>
      </div>
      <q-toggle
        v-model="autoReconnectEnabled"
        color="positive"
        label="Auto-reconnect"
        left-label
      ></q-toggle>
      <q-btn
        :disabled="ui.blockButtons"
        flat
        color="grey-8"
        size="13px"
        class="absolute-bottom-right q-ma-sm"
        @click="changeMode(!!(true * flipper.state.connection))"
      >{{mode == 'serial' ? 'Recovery mode' : 'Normal mode'}}</q-btn>
    </template>
  </q-card>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

import Updater from './apps/updater/Updater.vue'
import Terminal from './apps/terminal/Terminal.vue'
import Paint from './apps/paint/Paint.vue'

import { Flipper } from './core/core'
import * as semver from 'semver'
import * as commands from './apps/updater/protobuf/commands/commands'

import {
  mdiChevronDown,
  mdiConsole
} from '@quasar/extras/mdi-v5'
import {
  evaClipboardOutline,
  evaArrowBackOutline,
  evaArrowUpwardOutline,
  evaAlertCircleOutline,
  evaRefreshOutline,
  evaCloseOutline,
  evaBrushOutline
} from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'AppContainer',

  components: {
    Updater,
    Terminal,
    Paint
  },

  setup () {
    const autoReconnectEnabled = ref(false)
    watch(
      () => autoReconnectEnabled.value,
      (state) => {
        localStorage.setItem('autoReconnectEnabled', Number(state))
      }
    )
    return {
      showIntro: ref(true),
      copied: ref(false),
      customSource: ref({}),

      flipper: ref(new Flipper()),

      autoReconnectEnabled,
      cliResponseTimeout: ref(undefined),
      reconnectLoop: ref(undefined),
      showArrows: ref(false),
      showOverlay: ref(false),
      showTerminal: ref(false),
      terminalEnabled: ref(false)
    }
  },

  computed: {
    connection () {
      return this.flipper.state.connection
    },
    knownSerialDevices () {
      const serialFilters = [{ usbVendorId: 0x0483, usbProductId: 0x5740 }]
      return navigator.serial.getPorts({ serialFilters })
    },
    knownUsbDevices () {
      const usbFilters = [{ vendorId: 0x0483, productId: 0x5740 }]
      return navigator.usb.getDevices({ usbFilters })
    },
    status () {
      return this.flipper.state.status
    },
    flipperResponds () {
      return !!this.flipper.properties.hardware_name
    },
    currentApp () {
      return this.$store.state.currentApp
    },
    mode () {
      return this.$store.state.mode
    },
    userAgent () {
      return this.$store.state.userAgent
    },
    release () {
      return this.$store.state.firmwareChannels.release
    },
    rc () {
      return this.$store.state.firmwareChannels.rc
    },
    dev () {
      return this.$store.state.firmwareChannels.dev
    },
    custom () {
      return this.$store.state.firmwareChannels.custom
    },
    ui () {
      return this.$store.state.ui
    },
    error () {
      return this.$store.state.ui.error
    },
    qFlipperLink () {
      return this.$store.state.qFlipperLink
    }
  },

  methods: {
    start (mode) {
      this.$store.commit({
        type: 'setMode',
        mode: mode
      })
      this.showIntro = false
      this.connect()
    },

    getChannels () {
      fetch('https://update.flipperzero.one/firmware/directory.json')
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          const dev = data.channels.find(e => e.id === 'development')
          const rc = data.channels.find(e => e.id === 'release-candidate')
          const release = data.channels.find(e => e.id === 'release')

          release.versions.sort((a, b) => {
            if (semver.lt(a.version, b.version)) return 1
            else return -1
          })
          const latest = release.versions[0]

          rc.versions.sort((a, b) => {
            if (semver.lt(a.version, b.version)) return 1
            else return -1
          })

          const releaseChannel = {
            version: '',
            date: '',
            url: '',
            files: [],
            changelog: ''
          }
          const devChannel = {
            version: '',
            date: '',
            url: '',
            files: [],
            changelog: ''
          }
          const rcChannel = {
            version: '',
            date: '',
            url: '',
            files: [],
            changelog: ''
          }
          let customChannel

          releaseChannel.version = latest.version
          releaseChannel.date = new Date(latest.timestamp * 1000).toISOString().slice(0, 10)
          releaseChannel.url = latest.files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          releaseChannel.files = latest.files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          releaseChannel.changelog = latest.changelog

          devChannel.version = dev.versions[0].version
          devChannel.date = new Date(dev.versions[0].timestamp * 1000).toISOString().slice(0, 10)
          devChannel.url = dev.versions[0].files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          devChannel.files = dev.versions[0].files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          devChannel.changelog = dev.versions[0].changelog

          rcChannel.version = rc.versions[0].version
          rcChannel.date = new Date(rc.versions[0].timestamp * 1000).toISOString().slice(0, 10)
          rcChannel.url = rc.versions[0].files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          rcChannel.files = rc.versions[0].files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          rcChannel.changelog = rc.versions[0].changelog

          if (this.customSource.url) {
            customChannel = {
              channel: this.customSource.channel,
              version: this.customSource.version,
              date: new Date().toISOString().slice(0, 10),
              url: this.customSource.url,
              files: [{
                url: this.customSource.url,
                type: 'full_dfu',
                target: this.customSource.target
              }]
            }
          }

          this.$store.commit({
            type: 'setFirmwareChannels',
            firmwareChannels: {
              release: releaseChannel,
              rc: rcChannel,
              dev: devChannel,
              custom: customChannel
            }
          })
        })
        .then(() => {
          this.lookForKnownDevices()
        })
    },

    // Startup
    async connect () {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
      }
      this.$store.commit({
        type: 'setUiFlag',
        flag: {
          name: 'blockButtons',
          value: true
        }
      })

      try {
        this.init()

        const connectTimeout = setTimeout(() => {
          this.$store.commit({
            type: 'setUiError',
            error: {
              isError: true,
              message: 'Couldn\'t connect to Flipper (response timeout)',
              button: this.mode
            }
          })
        }, 7000)

        await this.flipper.connect(this.mode)
          .then(() => {
            clearTimeout(connectTimeout)
            if (this.flipper.state.connection === 0) {
              throw new Error('No device selected')
            }
          })
          .catch(async error => {
            clearTimeout(connectTimeout)
            if (error.toString().includes('No known')) {
              return this.recognizeDevice(this.mode)
            } else {
              if (error.toString().includes('Failed to open')) {
                throw new Error('Flipper serial port may be occupied by another process, close it and try again.')
              } else if (error.toString().includes("'open' on 'SerialPort'")) {
                this.flipper.restartWorker()
                return this.connect()
              } else {
                console.error(error)
              }
              throw error
            }
          })

        if (!this.error.isError && !this.ui.reconnecting) {
          this.$store.commit({
            type: 'setUiFlag',
            flag: {
              name: 'blockButtons',
              value: true
            }
          })
          return this.readProperties()
        }
      } catch (error) {
        this.showArrows = false
        this.$store.commit({
          type: 'setUiError',
          error: {
            isError: true,
            message: error.message || error,
            button: this.mode
          }
        })
        this.$store.commit({
          type: 'setUiFlag',
          flag: {
            name: 'blockButtons',
            value: false
          }
        })
      }
    },

    async readProperties () {
      this.$store.commit({
        type: 'setUiFlag',
        flag: {
          name: 'blockButtons',
          value: true
        }
      })

      if (this.mode === 'serial') {
        const startPing = await commands.startRpcSession(this.flipper)
        if (!startPing.resolved || startPing.error) {
          throw new Error('Couldn\'t start rpc session')
        }

        const res = await commands.system.deviceInfo()
        for (const line of res) {
          this.flipper.properties[line.key] = line.value
        }
        if (!this.flipper.properties.otpVer) {
          this.flipper.properties.otpVer = 1
        }
        // todo
        this.flipper.properties.battery = undefined

        this.flipper.properties.sdCardMounted = undefined
        await commands.storage.info('/ext')
          .then(async () => {
            this.flipper.properties.sdCardMounted = true
            const internal = await commands.storage.list('/ext')
            if (internal.find(file => file.name === 'Manifest' && file.type !== 1)) {
              this.flipper.properties.databasesPresent = true
            } else {
              this.flipper.properties.databasesPresent = false
            }
          })
          .catch(error => {
            if (error.toString().includes('ERROR_STORAGE_INTERNAL')) {
              this.flipper.properties.sdCardMounted = false
              this.flipper.properties.databasesPresent = false
            } else {
              console.error(error)
            }
          })

        await commands.system.setDatetime(new Date())

        await commands.stopRpcSession()
      } else {
        await this.flipper.readOTP()
          .catch(async error => {
            this.$store.commit({
              type: 'setUiError',
              error: {
                isError: true,
                message: error,
                button: this.mode
              }
            })
            await this.flipper.disconnect()
          })
      }

      this.$store.commit({
        type: 'setUiFlag',
        flag: {
          name: 'blockButtons',
          value: false
        }
      })
    },

    // Utils
    async init () {
      this.$store.commit({
        type: 'setUiError',
        error: {
          isError: false,
          message: '',
          button: ''
        }
      })
      this.firmware = {
        fileName: '',
        loading: false,
        binary: undefined
      }
      for (const prop in this.flipper.properties) {
        this.flipper.properties[prop] = undefined
      }
      this.isOutdated = undefined
      this.newerThanLTS = false
      this.$store.commit({
        type: 'setUiFlag',
        flag: {
          name: 'reconnecting',
          value: false
        }
      })
      this.showArrows = false
      this.showOverlay = false
    },

    async changeMode (reboot) {
      if (this.mode === 'serial') {
        this.$store.commit({
          type: 'setMode',
          mode: 'usb'
        })
      } else if (this.mode === 'usb') {
        this.$store.commit({
          type: 'setMode',
          mode: 'serial'
        })
      }
      this.$store.commit({
        type: 'setUiError',
        error: {
          isError: false,
          message: '',
          button: ''
        }
      })

      if (reboot) {
        this.$store.commit({
          type: 'setUiFlag',
          flag: {
            name: 'reconnecting',
            value: true
          }
        })
        await this.flipper.reboot()
          .then(() => {
            this.$store.commit({
              type: 'setUiFlag',
              flag: {
                name: 'reconnecting',
                value: false
              }
            })
            return this.connect()
          })
          .catch(async error => {
            if (error.toString().includes('No known')) {
              this.connect()
            } else {
              console.error(error)
            }
          })
      } else {
        return this.connect()
      }
    },

    async lookForKnownDevices () {
      const filters = [
        { usbVendorId: 0x0483, usbProductId: 0x5740 }
      ]
      const ports = await navigator.serial.getPorts({ filters })
      const autoReconnectEnabled = !!parseInt(localStorage.getItem('autoReconnectEnabled'))
      if (ports.length > 0 && autoReconnectEnabled) {
        this.showIntro = false
      }
    },

    async recognizeDevice (mode) {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
      }
      try {
        if (mode === 'serial') {
          const filters = [
            { usbVendorId: 0x0483, usbProductId: 0x5740 }
          ]
          const ports = await navigator.serial.getPorts({ filters })
          if (ports.length === 0) {
            this.adjustArrows()
            this.showArrows = true
            this.showOverlay = true
            await navigator.serial.requestPort({ filters })
              .then(() => {
                this.$store.commit({
                  type: 'setUiError',
                  error: {
                    isError: false,
                    message: '',
                    button: ''
                  }
                })
                this.showOverlay = false
                this.showArrows = false
                return this.connect()
              })
          }
        } else if (mode === 'usb') {
          const m = this.mode
          this.$store.commit({
            type: 'setMode',
            mode: 'usb'
          })
          const filters = [
            { vendorId: 0x0483, productId: 0xdf11 }
          ]
          const ports = await navigator.usb.getDevices({ filters })
          if (ports.length === 0) {
            this.adjustArrows()
            this.showOverlay = true
            this.showArrows = true
            await navigator.usb.requestDevice({ filters })
              .then(() => {
                this.$store.commit({
                  type: 'setMode',
                  mode: m
                })
                this.$store.commit({
                  type: 'setUiError',
                  error: {
                    isError: false,
                    message: '',
                    button: ''
                  }
                })
                this.showOverlay = false
                this.showArrows = false
                if (this.mode === mode) {
                  return this.connect()
                } else {
                  this.$refs.Updater.updateStage = 2
                  return this.$refs.Updater.update()
                }
              })
          }
        }
      } catch (error) {
        this.showArrows = false
        this.$store.commit({
          type: 'setUiError',
          error: {
            isError: true,
            message: error.message || error,
            button: this.mode
          }
        })
        return false
      }
    },

    adjustArrows () {
      const diff = window.outerHeight - window.innerHeight
      let bar = false
      if (diff > 89 && diff <= 120) {
        bar = true
        document.getElementById('arrow-2').style.top = '399px'
      }
      if (this.userAgent.os !== 'Windows') {
        document.getElementById('arrow-2').style.left = '470px'
      }
      if (this.userAgent.browser === 'Edge') {
        document.getElementById('arrow-1').style.top = '50px'
        document.getElementById('arrow-1').style.left = '593px'
        if (bar) {
          document.getElementById('arrow-2').style.top = '192px'
        } else {
          document.getElementById('arrow-2').style.top = '222px'
        }
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '435px'
        } else {
          document.getElementById('arrow-2').style.left = '519px'
        }
      }
      if (this.userAgent.browser === 'Opera') {
        document.getElementById('arrow-1').style.left = '541px'
        if (bar) {
          document.getElementById('arrow-2').style.top = '357px'
        } else {
          document.getElementById('arrow-2').style.top = '389px'
        }
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '395px'
        } else {
          document.getElementById('arrow-2').style.left = '470px'
        }
      }
      if (this.userAgent.browser === 'Yandex') {
        document.getElementById('arrow-1').style.left = '651px'
        if (bar) {
          document.getElementById('arrow-2').style.top = '405px'
        } else {
          document.getElementById('arrow-2').style.top = '427px'
        }
        if (this.userAgent.os === 'Windows') {
          document.getElementById('arrow-2').style.left = '454px'
        } else {
          document.getElementById('arrow-2').style.left = '568px'
        }
      }
    },

    onDisconnect () {
      if (this.showTerminal) {
        this.toggleTerminal()
      }

      this.flipper.state.connection = 0

      if (this.mode === 'serial' && !this.ui.reconnecting) {
        this.flipper.disconnect()
      }

      if (!this.ui.reconnecting) {
        this.autoReconnect()
      }
    },

    autoReconnect () {
      if (this.reconnectLoop) {
        clearInterval(this.reconnectLoop)
        this.reconnectLoop = undefined
      }
      if (this.autoReconnectEnabled) {
        this.reconnectLoop = setInterval(async () => {
          if (this.autoReconnectEnabled && !this.ui.reconnecting && this.$refs.Updater && !this.$refs.Updater.updateSuccess) {
            let ports, filters
            if (this.mode === 'serial') {
              filters = [
                { usbVendorId: 0x0483, usbProductId: 0x5740 }
              ]
              ports = await navigator.serial.getPorts({ filters })
            } else if (this.mode === 'usb') {
              filters = [
                { vendorId: 0x0483, productId: 0xdf11 }
              ]
              ports = await navigator.usb.getDevices({ filters })
            }
            if ((ports && ports.length > 0) || !this.autoReconnectEnabled) {
              clearInterval(this.reconnectLoop)
              this.reconnectLoop = undefined
              return await this.connect()
            }
          }
        }, 3000)
      }
    },

    setManifest (manifest) {
      this.flipper.manifest = manifest
    },

    async toggleTerminal () {
      if (this.flipper.state.connection === 2 && this.flipper.state.status === 2) {
        await this.flipper.closeReader()
      }

      if (!this.terminalEnabled) {
        this.terminalEnabled = true
      } else {
        if (!this.showTerminal && this.$refs.Terminal) {
          this.$refs.Terminal.read()
        }
      }
      this.showTerminal = !this.showTerminal
      this.$store.commit({
        type: 'setCurrentApp',
        currentApp: this.showTerminal ? 'Terminal' : 'Updater'
      })
      document.querySelector('body').style.overflowY = this.showTerminal ? 'hidden' : 'auto'
    },

    async showPaint () {
      if (this.flipper.state.connection === 2 && this.flipper.state.status === 2) {
        await this.flipper.closeReader()
      }

      this.$store.commit({
        type: 'setCurrentApp',
        currentApp: 'Paint'
      })
    },

    copy (text) {
      navigator.clipboard.writeText(text).then(this.copied = true)
      setTimeout(() => { this.copied = false }, 1500)
    }
  },

  created () {
    this.mdiChevronDown = mdiChevronDown
    this.mdiConsole = mdiConsole
    this.evaClipboardOutline = evaClipboardOutline
    this.evaArrowBackOutline = evaArrowBackOutline
    this.evaArrowUpwardOutline = evaArrowUpwardOutline
    this.evaAlertCircleOutline = evaAlertCircleOutline
    this.evaRefreshOutline = evaRefreshOutline
    this.evaCloseOutline = evaCloseOutline
    this.evaBrushOutline = evaBrushOutline

    window.addEventListener('keydown', (e) => {
      if (this.currentApp !== 'Terminal' && e.key === 'Escape') {
        this.showOverlay = false
      }
    })
  },

  async mounted () {
    this.customSource = {
      url: this.$route.query.url,
      channel: this.$route.query.channel,
      version: this.$route.query.version,
      target: this.$route.query.target
    }
    this.getChannels()

    const stored = parseInt(localStorage.getItem('autoReconnectEnabled'))
    if (isNaN(stored) || stored === 0) {
      this.autoReconnectEnabled = false
      localStorage.setItem('autoReconnectEnabled', 0)
    } else {
      this.autoReconnectEnabled = true
      this.knownSerialDevices
        .then(ports => {
          if (ports.length > 0) {
            this.start('serial')
          }
        })
    }

    navigator.serial.addEventListener('disconnect', this.onDisconnect)
    navigator.usb.addEventListener('disconnect', this.onDisconnect)
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
<style lang="scss" src="../css/updater.scss"></style>
