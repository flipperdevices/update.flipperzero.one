<template>
  <div id="homepage-container">
    <div id="header">
      <a href="https://flipperzero.one/">
        <img src="../assets/flipper-logo.png" />
      </a>
      <a href="https://www.youtube.com/channel/UCfKVWB_pOfsY-HQ2siMBn6g">
        <img src="../assets/youtube.png" />
      </a>
      <a href="https://flipperzero.one/discord">
        <img src="../assets/discord.png" />
      </a>
      <a href="https://github.com/Flipper-Zero">
        <img src="../assets/github.png" />
      </a>
    </div>
    <h1>Flipper Zero Firmware Update page</h1>
    <div class="component web-upgrade">
      <div class="card">
        <div v-if="userAgent.browser !== 'Not supported'" class="card-banner">
          <img v-if="userAgent.browser === 'Chrome'" src="../assets/chrome.png" />
          <img v-else-if="userAgent.browser === 'Edge'" src="../assets/edge.png" />
          <img v-else-if="userAgent.browser === 'Opera'" src="../assets/opera.png" />
          <img v-else-if="userAgent.browser === 'Yandex'" src="../assets/yandex.png" />
        </div>
        <div v-if="userAgent.browser !== 'Not supported'" class="card-desc">
          <h2>WebUSB updater</h2>
          <h3>Flash the latest firmware right in your browser using WebUSB.</h3>
          <p>
            No drivers needed!
          </p>
          <p>
            Just connect your Flipper to the computer, press the button below and choose your device from dropping list.
            Don't forget to grant access to WebUSB in a pop-up.
          </p>
          <p>
            Currently supports only Chrome-based browsers: Chrome, Edge, Yandex Browser.
          </p>
          <div class="buttons">
            <button class="btn primary" @click="$emit('clickConnect')">Connect Flipper</button>
          </div>
        </div>
        <div v-else class="card-desc bad-browser">
          <h3>Your browser doesn't support WebUSB updater :(</h3>
          <img v-if="userAgent.browser === 'Not supported'" src="../assets/notsupported.png" />
          <p>
            Your browser doesn’t support WebUSB/WebSerial.

            Updater currently supports only Chrome-based browsers: Chrome, Edge, Yandex Browser.
          </p>
          <div class="buttons">
            <a class="btn alert" href="https://caniuse.com/webusb">Compatibility List</a>
          </div>
        </div>
      </div>
    </div>
    <div class="component qflipper">
      <div class="card">
        <div class="card-banner">
          <img src="../assets/qflipper.png" />
        </div>
        <div class="card-desc">
          <h2>Desktop crossplatform application</h2>
          <p>
            Check your Flipper status and choose different update versions. Find additional info on a <a href="http://docs.flipperzero.one/">wiki page</a>.
          </p>
          <div class="buttons">
            <div style="display: flex;">
              <a v-if="userAgent.os === 'Windows'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qFlipperSetup-64bit.exe">Windows Download</a>
              <a v-if="userAgent.os === 'Mac'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qflipper.dmg">Mac OS X Download</a>
              <a v-if="userAgent.os === 'Linux'" class="btn primary drop-left" href="https://update.flipperzero.one/qFlipper/qflipper-x86_64.AppImage">Linux Download</a>
              <button class="btn primary drop-right" @click="dropdownClick">
                <i data-eva="arrow-ios-downward-outline" data-eva-fill="#fff"></i>
              </button>
            </div>
            <div v-show="isDropOpened" class="drop-body">
              <a v-if="userAgent.os !== 'Windows'" href="https://update.flipperzero.one/qFlipper/qFlipperSetup-64bit.exe">Windows Download</a>
              <a v-if="userAgent.os !== 'Mac'" href="https://update.flipperzero.one/qFlipper/qflipper.dmg">Mac OS X Download</a>
              <a v-if="userAgent.os !== 'Linux'" href="https://update.flipperzero.one/qFlipper/qflipper-x86_64.AppImage">Linux Download</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <h1>Download firmware files</h1>
    <div class="component firmware-files">
      <p>
        In case you need firmware files locally for some reason you may need this files to flash locally with <a href="https://docs.flipperzero.one/">dfu-util</a> and <a href="https://docs.flipperzero.one/">st-link</a> <i>.elf</i> files for debugging.
      </p>
      <div class="buttons">
        <a class="btn fw-btn" :href="release.url">
          <div>
            <div>
              <p>Latest Release</p>
              <b>{{ release.version }}</b>
            </div>
            <div>
              <i data-eva="arrow-downward-outline" data-eva-fill="#fff" data-eva-height="48" data-eva-width="52"></i>
            </div>
          </div>
        </a>
        <a class="btn fw-btn" :href="dev.url">
          <div>
            <div>
              <p>Dev build</p>
              <b>{{ dev.date }}</b>
            </div>
            <div>
              <i data-eva="arrow-downward-outline" data-eva-fill="#fff" data-eva-height="48" data-eva-width="52"></i>
            </div>
          </div>
        </a>
      </div>
      <Table :dev="dev" :release="release" :versions="versions"/>
    </div>
  </div>
</template>

<script>
import * as eva from 'eva-icons'
import * as semver from 'semver'

export default {
  name: 'Homepage',
  components: {
    Table: () => import('./Table.vue')
  },
  props: {
    userAgent: Object
  },
  data () {
    return {
      isDropOpened: false,
      versions: [],
      release: {
        version: '',
        date: '',
        url: '',
        files: [],
        changelog: ''
      },
      dev: {
        version: '',
        date: '',
        url: '',
        files: []
      }
    }
  },
  methods: {
    dropdownClick () {
      this.isDropOpened = !this.isDropOpened
      document.querySelector('.drop-body').style.width = document.querySelector('div.component.qflipper .buttons > div').clientWidth - 1 + 'px'
      document.querySelector('.drop-right > svg').style.rotate = this.isDropOpened * 180 + 'deg'
    },
    getDir () {
      fetch('https://update.flipperzero.one/directory.json')
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          data.channels[1].versions.sort((a, b) => {
            if (semver.lt(a.version.slice(3), b.version.slice(3))) return 1
            else return -1
          })
          this.versions = data.channels[1].versions
          this.$emit('passLatestVersion', this.versions[0])
          const latest = data.channels[1].versions[0]
          const master = data.channels[0].versions[0]

          this.release.version = latest.version
          this.release.date = new Date(latest.timestamp * 1000).toISOString().slice(0, 10)
          this.release.url = latest.files.find(file => file.target === 'f6' && file.type === 'full_bin').url
          this.release.files = latest.files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
          this.release.changelog = latest.changelog

          this.dev.version = master.version
          this.dev.date = new Date(master.timestamp * 1000).toISOString().slice(0, 10)
          this.dev.url = master.files.find(file => file.target === 'f6' && file.type === 'full_bin').url
          this.dev.files = master.files.sort((a, b) => {
            if (a.url.match(/[\w.]+$/g)[0] > b.url.match(/[\w.]+$/g)[0]) return 1
            else return -1
          })
        })
    }
  },
  mounted () {
    eva.replace()
    this.getDir()
  }
}
</script>
