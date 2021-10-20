<template>
  <div id="homepage-container" class="fit text-center q-pa-sm">
    <h3>Flipper Zero Firmware Update page</h3>

    <q-card class="shadow-4" v-if="showIntro">
      <q-card-section :horizontal="$q.screen.gt.xs" class="q-pa-none">
        <q-card-section v-if="userAgent.browser !== 'Not supported'" class="col-5 flex content-center justify-center">
          <q-img v-if="userAgent.browser === 'Chrome'" src="../assets/chrome.png" class="updater-img"></q-img>
          <q-img v-else-if="userAgent.browser === 'Edge'" src="../assets/edge.png" class="updater-img"></q-img>
          <q-img v-else-if="userAgent.browser === 'Yandex'" src="../assets/yandex.png" class="updater-img"></q-img>
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
          <p v-if="customSource">
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
        <h4>Your browser doesn't support Web Updater <span style="white-space: nowrap;">:(</span></h4>
        <img
          v-if="userAgent.os !== 'Android'"
          src="../assets/notsupported.svg"
          class="unsupported-img"
        />
        <q-img v-else src="../assets/chrome.png" class="updater-img"></q-img>
        <p class="q-pt-md">
          Your browser doesn’t support <span v-if="!userAgent.usb">WebUSB</span><span v-if="!userAgent.usb && !userAgent.serial"> and </span><span v-if="!userAgent.serial">WebSerial</span><span v-if="userAgent.usb">, but Recovery Mode is still available. <a href="https://docs.flipperzero.one/ru/basics/firmware-update/web-updater#ws-recovery-mode">Learn about Recovery Mode usage</a></span>.
        </p>
        <p v-if="userAgent.os !== 'Android'">Updater currently supports only Chrome-based browsers (except Opera). Try Chrome/Edge/Yandex Browser.</p>
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

    <q-card v-else class="shadow-4">
      <q-card-section>
        <Updater
          :userAgent="userAgent"
          :release="release"
          :rc="rc"
          :dev="dev"
          :custom="custom"
          :initialMode="initialMode"
          :qFlipperInstaller="dropdown[0].href"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-pa-none q-mt-xl q-mb-xl text-left shadow-4">
      <q-card-section :horizontal="$q.screen.gt.xs" class="q-pa-none">
        <q-card-section class="col-4 flex content-end qflippa-img">
          <img src="../assets/qflipper.png"/>
        </q-card-section>
        <q-card-section class="col-8 q-pb-lg qflippa-desc">
          <h4>Desktop crossplatform application</h4>
          <p>
            Check your Flipper status and choose different update versions. Find additional info on a <a href="http://docs.flipperzero.one/">wiki page</a>.
          </p>
          <div class="text-center">
            <q-btn-dropdown
              auto-close
              split
              :label="dropdown[0].text"
              :dropdown-icon="mdiChevronDown"
              @click="route(dropdown[0].href)"
              color="positive"
              padding="12px 30px"
              class="q-mt-sm"
            >
              <q-list>
                <q-item
                  clickable
                  v-close-popup
                  @click="route(dropdown[1].href)"
                  class="bg-positive text-white text-uppercase text-weight-medium"
                >
                  <q-item-section>
                    <q-item-label>{{ dropdown[1].text }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="route(dropdown[2].href)"
                  class="bg-positive text-white text-uppercase text-weight-medium"
                >
                  <q-item-section>
                    <q-item-label>{{ dropdown[2].text }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </q-card-section>
      </q-card-section>
    </q-card>

    <h3>Download firmware files</h3>

    <q-card class="shadow-4">
      <q-card-section class="q-pa-lg">
        <p class="q-pa-lg">
          In case you need firmware files locally for some reason you may need this files to flash locally with <a href="https://docs.flipperzero.one/">dfu-util</a> and <a href="https://docs.flipperzero.one/">st-link</a> <i>.elf</i> files for debugging.
        </p>
        <div class="flex justify-evenly">
          <q-btn
            class="fw-btn"
            type="a"
            :href="release.url"
          >
            <div class="fw-btn-inner flex justify-between">
              <div>
                <p>Latest Release</p>
                <b>{{ release.version }}</b>
              </div>
              <div class="flex flex-center">
                <q-icon :name="evaArrowDownwardOutline"></q-icon>
              </div>
            </div>
          </q-btn>
          <q-btn
            class="fw-btn"
            type="a"
            :href="rc.url"
          >
            <div class="fw-btn-inner flex justify-between">
              <div>
                <p>Release Candidate</p>
                <b>{{ rc.version }}</b>
              </div>
              <div class="flex flex-center">
                <q-icon :name="evaArrowDownwardOutline"></q-icon>
              </div>
            </div>
          </q-btn>
        </div>
        <q-btn
          flat
          color="grey-8"
          class="q-mt-lg"
          type="a"
          href="https://update.flipperzero.one/firmware/development/f7/full_dfu"
        >
          Dev Build ({{ dev.date }})
        </q-btn>
      </q-card-section>
      <q-separator inset></q-separator>
      <q-card-section>
        <q-btn
          flat
          color="grey-8"
          class="q-ma-sm"
          type="a"
          href="https://update.flipperzero.one/builds/"
        >
          Browse all builds
        </q-btn>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import Updater from './Updater.vue'
import * as semver from 'semver'
import { mdiChevronDown } from '@quasar/extras/mdi-v5'
import { evaArrowDownwardOutline, evaClipboardOutline } from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'Homepage',

  components: {
    Updater
  },

  props: {
    userAgent: Object,
    customSource: Object
  },

  setup () {
    return {
      showIntro: ref(true),
      initialMode: 'serial',
      copied: ref(false),
      dropdown: ref([
        {
          text: 'macOS Download',
          href: ''
        },
        {
          text: 'Windows Download',
          href: ''
        },
        {
          text: 'Linux Download',
          href: ''
        }
      ]),
      qFlipper: ref({
        release: {}
      }),
      versions: ref([]),
      rcVersions: ref([]),
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
      custom: ref(null)
    }
  },

  methods: {
    async lookForKnownDevices () {
      const filters = [
        { usbVendorId: 0x0483, usbProductId: 0x5740 }
      ]
      const ports = await navigator.serial.getPorts({ filters })
      if (ports.length > 0) {
        this.showIntro = false
      }
    },
    clickConnect () {
      this.showIntro = false
    },
    route (url) {
      if (url === 'linuxFiles') {
        window.open('https://cdn.flipperzero.one/48-stm32dfu.rules')
        window.open('https://cdn.flipperzero.one/48-stmvcp.rules')
      } else {
        location.href = url
      }
    },
    copy (text) {
      navigator.clipboard.writeText(text).then(this.copied = true)
      setTimeout(() => { this.copied = false }, 1500)
    },
    getDir () {
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

          if (!this.customSource) {
            return
          }
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
        })
        .then(() => {
          this.lookForKnownDevices()
        })
      fetch('https://update.flipperzero.one/qFlipper/directory.json')
        .then((response) => {
          return response.json()
        })
        .then(data => {
          // will switch to release channel later
          this.qFlipper.release = data.channels.find(e => e.id === 'development')
          if (this.qFlipper.release) {
            this.qFlipper.release.versions.sort((a, b) => {
              if (semver.lt(a.version, b.version)) return 1
              else return -1
            })
            const files = this.qFlipper.release.versions[0].files
            this.dropdown.forEach(e => {
              switch (e.text) {
                case 'macOS Download':
                  e.href = files.find(f => f.target === 'macos/amd64').url
                  break
                case 'Windows Download':
                  e.href = files.find(f => f.target === 'windows/amd64' && f.type === 'installer').url
                  break
                case 'Linux Download':
                  e.href = files.find(f => f.target === 'linux/amd64').url
                  break
              }
            })
          }
        })
    }
  },

  created () {
    this.mdiChevronDown = mdiChevronDown
    this.evaArrowDownwardOutline = evaArrowDownwardOutline
    this.evaClipboardOutline = evaClipboardOutline
    this.dropdown.sort(e => {
      if (e.text === this.userAgent.os + ' Download') return -1
      else return 1
    })
  },

  mounted () {
    this.getDir()
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
