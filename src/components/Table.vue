<template>
  <div class="table">
    <table>
      <tbody>
        <tr>
          <td><b>master</b></td>
          <td class="nowrap">{{ dev.date }}</td>
          <td>
            <span v-for="file in dev.files" :key="file.url">
              [<a :href="file.url" @click="showDownloadPopup(file)">{{ file.url.match(/[\w.]+$/g)[0] }}</a>]
            </span>
          </td>
        </tr>
        <tr v-for="v in versions" :key="v.version">
          <td class="nowrap">
            <b>{{ v.version }}</b>
          </td>
          <td class="nowrap">{{ new Date(v.timestamp * 1000).toISOString().slice(0, 10) }}</td>
          <td>
            <span v-for="file in v.files" :key="file.url">
              [<a :href="file.url" @click="showDownloadPopup(file)">{{ file.url.match(/[\w.]+$/g)[0] }}</a>]
            </span>
          </td>
          <td>[<a @click="showChangelogPopup(v.changelog)">changelog</a>]</td>
        </tr>
      </tbody>
    </table>

    <div v-show="changelogPopup" class="popup-overlay">
      <div v-show="changelogPopup" class="popup">
        <button @click="changelogPopup = false"><i data-eva="close-outline" data-eva-fill="#000000cc"></i></button>
        <h3>Changelog</h3>
        <div>
          <pre><VueMarkdown :source="changelogContent"/></pre>
        </div>
      </div>
    </div>
    <div v-show="downloadPopup" class="popup-overlay">
      <div v-show="downloadPopup" class="popup">
        <button @click="downloadPopup = false"><i data-eva="close-outline" data-eva-fill="#000000cc"></i></button>
        <h3>Downloading <a :href="downloadedFile.url">{{ downloadedFile.url.match(/[\w.]+$/g)[0] }}</a></h3>
        <div>
          <pre>SHA512: {{ downloadedFile.sha512 }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as eva from 'eva-icons'
// import VueMarkdown from 'vue-markdown'
export default {
  name: 'Table',
  props: {
    dev: Object,
    release: Object,
    versions: Array
  },
  components: {
    VueMarkdown: () => import('vue-markdown')
  },
  data () {
    return {
      changelogPopup: false,
      downloadPopup: false,
      changelogContent: '',
      downloadedFile: {
        url: 'foo.bar'
      }
    }
  },
  methods: {
    showChangelogPopup (content) {
      this.changelogPopup = true
      this.changelogContent = content
    },
    showDownloadPopup (file) {
      this.downloadPopup = true
      this.downloadedFile = file
    }
  },
  mounted () {
    eva.replace()
  }
}
</script>

<style src="../assets/css/table.css"></style>
