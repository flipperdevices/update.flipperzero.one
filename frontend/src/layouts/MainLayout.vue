<template>
  <q-layout view="hHh lpr lfr">
    <q-header
      :class="'flex flex-center absolute-top ' + (showMobileMenu ? 'bg-dark' : 'bg-white')"
    >
      <q-toolbar id="header" class="text-dark q-gutter-md" :style="$q.screen.xs ? 'padding-top: 0.5rem' : ''">
        <q-btn
          flat
          type="a"
          href="https://update.flipperzero.one/"
          align="left"
          :dense="$q.screen.xs"
        >
          <img src="../assets/flipper-logo.svg" :style="$q.screen.xs ? 'width: 170px' : 'width: 200px'"/>
        </q-btn>
        <q-space></q-space>
        <a v-if="!$q.screen.xs" href="https://shop.flipperzero.one/">Shop</a>
        <a v-if="!$q.screen.xs" href="https://flipperzero.one/">Zero</a>
        <a v-if="!$q.screen.xs" href="https://flipperzero.one/faq">FAQ</a>
        <a v-if="!$q.screen.xs" href="https://blog.flipperzero.one/">Blog</a>
        <q-btn
          v-if="$q.screen.xs"
          flat
          dense
          round
          :icon="showMobileMenu ? mdiClose : mdiMenu"
          :color="showMobileMenu ? 'white' : 'black'"
          @click="showMobileMenu = !showMobileMenu"
        ></q-btn>
      </q-toolbar>
      <q-slide-transition>
        <div
          v-show="showMobileMenu"
          style="width: 100vw; border-bottom: solid 1px #0000001f"
          class="text-center text-accent mobile-menu"
        >
          <p>
            <a href="https://shop.flipperzero.one/">Shop</a>
          </p>
          <p>
            <a href="https://flipperzero.one/">Flipper Zero</a>
          </p>
          <p>
            <a href="https://flipperzero.one/faq">FAQ</a>
          </p>
          <p>
            <a href="https://blog.flipperzero.one/">Blog</a>
          </p>
        </div>
      </q-slide-transition>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-dark text-white footer">
      <div class="links-container">
        <div>
          <div>
            <h6>Community</h6>
            <a href="https://www.kickstarter.com/projects/flipper-devices/flipper-zero-tamagochi-for-hackers">Kickstarter</a>
            <a href="https://habr.com/ru/company/flipperdevices/">Habr.com</a>
            <a href="https://flipperzero.one/discord">Discord</a>
            <a href="https://forum.flipperzero.one/">Forum</a>
            <a href="http://blog.flipperzero.one/">Blog</a>
          </div>
          <div>
            <h6>For developers</h6>
            <a href="https://flipperzero.one/developers">Developer Program</a>
            <a href="https://github.com/flipperdevices">Github</a>
          </div>
        </div>
        <div>
          <div>
            <h6>Partners</h6>
            <a href="https://neuronspace.ru/">Neuron Hackerspace</a>
            <a href="https://designheroes.io/">Design Heroes</a>
            <a href="https://slozhno.media/">Slozhno.Media</a>
          </div>
          <div>
            <h6>About</h6>
            <a href="https://flipperzero.one/contacts">Contacts</a>
            <a href="https://www.flipperdevices.com/">Company</a>
            <a href="https://www.flipperdevices.com/jobs">Careers</a>
            <a href="https://drive.google.com/drive/folders/1452h630Dq-Tk2xkS_Z8qTHZHylGFByd4">Press kit</a>
            <a href="https://flipperzero.one/privacy">Privacy Policy</a>
            <a href="https://flipperzero.one/faq">FAQ</a>
          </div>
        </div>
      </div>
      <div class="text-center">
        <div class="flex flex-center icons">
          <a href="http://flipperzero.one/discord">
            <img src="https://cdn.flipperzero.one/discord-logo.png" :style="$q.screen.xs ? 'height: 34px;' : 'height: 49px;'" />
          </a>
          <a href="https://twitter.com/flipper_zero">
            <img src="https://cdn.flipperzero.one/twitter-logo.png" :style="$q.screen.xs ? 'height: 32px;' : 'height: 47px;'" />
          </a>
          <a href="https://youtube.com/flipperzero">
            <img src="https://cdn.flipperzero.one/youtube-logo.png" :style="$q.screen.xs ? 'height: 25px;' : 'height: 37px;'" />
          </a>
          <a href="https://www.facebook.com/flipperzero/">
            <img src="https://cdn.flipperzero.one/facebook-logo.png" :style="$q.screen.xs ? 'height: 28px;' : 'height: 42px;'" />
          </a>
          <a href="https://www.instagram.com/flipper_zero/">
            <img src="https://cdn.flipperzero.one/instagram-logo.png" :style="$q.screen.xs ? 'height: 30px;' : 'height: 42px;'" />
          </a>
        </div>
        <p>Copyright &copy; 2021 Flipper Devices Inc.</p>
      </div>
      <img class="absolute-bottom-right flipper-footer" src="../assets/flipper-footer.png" />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { mdiYoutube, mdiDiscord, mdiGithub, mdiMenu, mdiClose } from '@quasar/extras/mdi-v5'

export default defineComponent({
  name: 'MainLayout',
  setup () {
    return {
      showMobileMenu: ref(false)
    }
  },
  created () {
    this.mdiYoutube = mdiYoutube
    this.mdiDiscord = mdiDiscord
    this.mdiGithub = mdiGithub
    this.mdiMenu = mdiMenu
    this.mdiClose = mdiClose
  }
})
</script>
