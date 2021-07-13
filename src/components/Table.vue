<template>
  <table>
    <tbody>
      <tr>
        <td><b>master</b></td>
        <td class="nowrap">{{ dev.date }}</td>
        <td>
          <span v-for="file in dev.files" :key="file.url">
            [<a @click="showHash(file.sha512)">{{ file.url.match(/[\w.]+$/g)[0] }}</a>]
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
            [<a>{{ file.url.match(/[\w.]+$/g)[0] }}</a>]
          </span>
        </td>
        <td>[<a @click="showChangelog(v.changelog)">changelog</a>]</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'Table',
  props: {
    dev: Object,
    release: Object,
    versions: Array
  },
  methods: {
    showChangelog (e) {
      console.log(e)
    },
    showHash (e) {
      console.log(e)
    }
  }
}
</script>

<style>
table {
  min-width: 688px;
  text-align: left;
}

tr:nth-child(even) {
  background-color: #0000000d;
}

td {
  padding: 0.3rem;
  font-size: 12px;
}

td.nowrap {
  white-space: nowrap;
}

td a:hover {
  background-color: #0014ff26;
}
</style>
