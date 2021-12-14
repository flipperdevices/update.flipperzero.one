<template>
  <q-card class="shadow-4" v-if="showIntro">
    <q-card-section :horizontal="$q.screen.gt.xs" class="q-pa-none">
      <q-card-section v-if="userAgent.browser !== 'Not supported'" class="col-5 flex items-center justify-center images">
        <img src="../assets/connect_to_browser.svg" class="updater-img absolute" />
        <img v-if="userAgent.browser === 'Chrome'" src="../assets/chrome.svg" class="updater-img absolute" />
        <img v-else-if="userAgent.browser === 'Edge'" src="../assets/edge.svg" class="updater-img absolute" />
        <img v-else-if="userAgent.browser === 'Yandex'" src="../assets/yandex.svg" class="updater-img absolute" />
      </q-card-section>
      <q-card-section v-if="userAgent.browser !== 'Not supported'" class="q-pb-lg text-left updater-desc">
        <h4>Web updater</h4>
        <h5>Flash the latest firmware right in your userAgent.browser using WebUSB.</h5>
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
          <span v-if="userAgent.os === 'Windows' || userAgent.os === 'Linux'">2. </span>Connect your Flipper to the computer, press the button below and choose your device from userAgent.browser prompt.
        </p>
        <p>
          Currently supports only Chrome-based browsers (except Opera).
        </p>
        <p v-if="customSource.url">
          <b>Found custom firmware, connect to flash it.</b>
        </p>
        <div class="text-center q-mt-lg" :class="$q.screen.xs ? 'q-pb-lg' : 'q-pb-sm'">
          <q-btn color="positive" padding="12px 30px" @click="clickConnect">Connect to Flipper</q-btn>
        </div>
        <q-btn
          flat
          color="grey-8"
          size="13px"
          class="absolute-bottom-right q-ma-sm"
          @click="showIntro = false; initialMode = 'usb'"
        >Recovery mode</q-btn>
      </q-card-section>
    </q-card-section>
    <q-card-section
      v-if="userAgent.browser === 'Not supported'"
      class="fit flex column flex-center q-pa-md"
    >
      <h4>Your userAgent.browser doesn't support Web Updater <span style="white-space: nowrap;">:(</span></h4>
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
        Your userAgent.browser doesn’t support <span v-if="!userAgent.usb">WebUSB</span><span v-if="!userAgent.usb && !userAgent.serial"> and </span><span v-if="!userAgent.serial">WebSerial</span><span v-if="userAgent.usb">, but Recovery Mode is still available. <a href="https://docs.flipperzero.one/ru/basics/firmware-update/web-updater#ws-recovery-mode">Learn about Recovery Mode usage</a></span>.
      </p>
      <p v-if="userAgent.os !== 'Android'">Updater currently supports only Chrome-based browsers (except Opera). Try Chrome/Edge/Yandex userAgent.browser.</p>
      <p v-if="userAgent.os === 'Android' && !userAgent.usb">Updater supports Recovery Mode in Chrome for Android. Install latest Chrome version or Chrome Beta.</p>
      <div>
        <q-btn v-if="!userAgent.usb" color="accent" padding="12px 30px" type="a" href="https://caniuse.com/webusb">Compatibility List</q-btn>
        <q-btn
          v-if="userAgent.usb"
          color="positive"
          padding="12px 30px"
          @click="showIntro = false; initialMode = 'usb'"
        >Recovery mode</q-btn>
      </div>
    </q-card-section>
  </q-card>

  <q-card v-else id="updater-wrapper" class="shadow-4">
    <q-card-section v-if="!showIntro">
      <Updater
        v-if="currentApp === 'Updater'"
        :initialMode="initialMode"
      />
      <Terminal
        v-else-if="currentApp === 'Terminal'"
      />
      <Paint
        v-else-if="currentApp === 'Paint'"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Updater from './apps/updater/Updater.vue'
import Terminal from './apps/terminal/Terminal.vue'
import Paint from './apps/paint/Paint.vue'
import * as semver from 'semver'
import { evaClipboardOutline } from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'AppContainer',

  components: {
    Updater,
    Terminal,
    Paint
  },

  setup () {
    return {
      showIntro: ref(true),
      initialMode: 'serial',
      copied: ref(false),
      release: ref({
        version: '',
        date: '',
        url: '',
        files: [],
        changelog: ''
      }),
      dev: ref({
        version: '',
        date: '',
        url: '',
        files: [],
        changelog: ''
      }),
      rc: ref({
        version: '',
        date: '',
        url: '',
        files: [],
        changelog: ''
      }),
      custom: ref(undefined),
      customSource: ref({})
    }
  },

  computed: {
    currentApp () {
      return this.$store.state.currentApp
    },

    userAgent () {
      return this.$store.state.userAgent
    }
  },

  methods: {
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
    clickConnect () {
      this.showIntro = false
    },
    copy (text) {
      navigator.clipboard.writeText(text).then(this.copied = true)
      setTimeout(() => { this.copied = false }, 1500)
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
          this.versions = release.versions
          const latest = release.versions[0]

          rc.versions.sort((a, b) => {
            if (semver.lt(a.version, b.version)) return 1
            else return -1
          })
          this.rcVersions = rc.versions

          this.release.version = latest.version
          this.release.date = new Date(latest.timestamp * 1000).toISOString().slice(0, 10)
          this.release.url = latest.files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          this.release.files = latest.files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          this.release.changelog = latest.changelog

          this.dev.version = dev.versions[0].version
          this.dev.date = new Date(dev.versions[0].timestamp * 1000).toISOString().slice(0, 10)
          this.dev.url = dev.versions[0].files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          this.dev.files = dev.versions[0].files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          this.dev.changelog = dev.versions[0].changelog

          this.rc.version = rc.versions[0].version
          this.rc.date = new Date(rc.versions[0].timestamp * 1000).toISOString().slice(0, 10)
          this.rc.url = rc.versions[0].files.find(file => file.target === 'f7' && file.type === 'full_dfu').url
          this.rc.files = rc.versions[0].files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          this.rc.changelog = rc.versions[0].changelog

          if (this.customSource.url) {
            this.custom = {
              channel: this.customSource.channel,
              version: this.customSource.version,
              date: new Date().toISOString().slice(0, 10),
              url: this.customSource.url,
              files: [{
                url: this.customSource.url,
                type: 'full_dfu'
              }]
            }
          }

          this.$store.commit({
            type: 'setFirmwareChannels',
            firmwareChannels: {
              release: this.release,
              rc: this.release,
              dev: this.dev,
              custom: this.custom
            }
          })
        })
        .then(() => {
          this.lookForKnownDevices()
        })
    }
  },

  created () {
    this.evaClipboardOutline = evaClipboardOutline
  },

  mounted () {
    this.customSource = {
      url: this.$route.query.url,
      channel: this.$route.query.channel,
      version: this.$route.query.version
    }
    this.getChannels()
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
