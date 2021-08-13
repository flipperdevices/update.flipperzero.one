<template>
  <q-layout view="hHh lpr lfr">
    <q-header
      :class="'flex flex-center absolute-top ' + (showMobileMenu ? 'bg-dark' : 'bg-white')"
      style="transition-duration: 400ms;"
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
