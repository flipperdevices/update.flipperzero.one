<template>
  <q-layout view="hHh lpr lfr">
    <q-header class="flex flex-center absolute-top bg-white">
      <q-toolbar id="header" class="text-dark q-gutter-md" :style="$q.screen.xs ? 'padding-top: 0.5rem' : ''">
        <q-btn
          flat
          type="a"
          href="https://update.flipperzero.one/"
          align="left"
          :dense="$q.screen.xs"
        >
          <img src="../assets/flipper-logo.svg" :style="$q.screen.xs ? 'width: 120px' : ''"/>
        </q-btn>
        <q-space></q-space>
        <q-btn
          flat
          round
          :icon="mdiYoutube"
          type="a"
          href="https://www.youtube.com/channel/UCfKVWB_pOfsY-HQ2siMBn6g"
          :dense="$q.screen.xs"
          :style="$q.screen.xs ? 'font-size: 15px;' : 'font-size: 22px;'"
        ></q-btn>
        <q-btn
          flat
          round
          :icon="mdiDiscord"
          type="a"
          href="https://flipperzero.one/discord"
          :dense="$q.screen.xs"
          :style="$q.screen.xs ? 'font-size: 12px;' : 'font-size: 16px;'"
        ></q-btn>
        <q-btn
          flat
          round
          :icon="mdiGithub"
          type="a"
          href="https://github.com/Flipper-Zero"
          :dense="$q.screen.xs"
          :style="$q.screen.xs ? 'font-size: 14px;' : 'font-size: 20px;'"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'

import { mdiYoutube, mdiDiscord, mdiGithub } from '@quasar/extras/mdi-v5'

export default defineComponent({
  name: 'MainLayout',
  created () {
    this.mdiYoutube = mdiYoutube
    this.mdiDiscord = mdiDiscord
    this.mdiGithub = mdiGithub
  }
})
</script>
