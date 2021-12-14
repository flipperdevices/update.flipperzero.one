<template>
  <q-card class="shadow-4">
    <q-card-section class="q-pa-lg">
      <p class="q-pa-lg">
        In case you need firmware files locally for some reason you may need this files to flash locally with <a href="https://docs.flipperzero.one/">dfu-util</a> and <a href="https://docs.flipperzero.one/">st-link</a> <i>.elf</i> files for debugging.
      </p>
      <div class="flex justify-evenly">
        <q-btn
          class="fw-btn"
          type="a"
          @click="route(release.url)"
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
          @click="route(release.url)"
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
</template>

<script>
import { defineComponent } from 'vue'
import { evaArrowDownwardOutline } from '@quasar/extras/eva-icons'

export default defineComponent({
  name: 'FirmwareFiles',

  computed: {
    release () {
      return this.$store.state.firmwareChannels.release
    },
    rc () {
      return this.$store.state.firmwareChannels.rc
    },
    dev () {
      return this.$store.state.firmwareChannels.dev
    }
  },

  methods: {
    route (url) {
      location.href = url
    }
  },

  created () {
    this.evaArrowDownwardOutline = evaArrowDownwardOutline
  }
})
</script>

<style lang="scss" src="../css/homepage.scss"></style>
