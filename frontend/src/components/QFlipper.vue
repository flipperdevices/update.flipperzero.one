<template>
  <q-card class="q-pa-none q-mt-xl q-mb-xl text-left shadow-4">
    <q-card-section :horizontal="$q.screen.gt.xs" class="q-pa-none">
      <q-card-section class="col-4 flex content-end qflippa-img">
        <img src="../assets/qflipper.png"/>
      </q-card-section>
      <q-card-section class="col-8 q-pb-lg qflippa-desc">
        <h4>Desktop cross-platform application</h4>
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
</template>

<script>
import { defineComponent, ref } from 'vue'
import * as semver from 'semver'
import { mdiChevronDown } from '@quasar/extras/mdi-v5'

export default defineComponent({
  name: 'QFlipper',

  setup () {
    return {
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
      })
    }
  },

  methods: {
    route (url) {
      if (url === 'linuxFiles') {
        window.open('https://cdn.flipperzero.one/48-stm32dfu.rules')
        window.open('https://cdn.flipperzero.one/48-stmvcp.rules')
      } else {
        location.href = url
      }
    },
    getLinks () {
      fetch('https://update.flipperzero.one/qFlipper/directory.json')
        .then((response) => {
          return response.json()
        })
        .then(data => {
          this.qFlipper.release = data.channels.find(e => e.id === 'release')
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
            this.$store.commit({
              type: 'setQFlipperLink',
              qFlipperLink: this.dropdown[0].href
            })
          }
        })
    }
  },

  created () {
    this.mdiChevronDown = mdiChevronDown
    this.dropdown.sort(e => {
      if (e.text === this.$store.state.userAgent.os + ' Download') return -1
      else return 1
    })
  },

  mounted () {
    this.getLinks()
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
