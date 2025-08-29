<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue';
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'html',
  attribute: 'data-theme',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'theme',
})
const toggleDark = useToggle(isDark)
</script>

<template>
  <div>
    <a href="https://github.com/Keekuun/hello-browser-extensions" target="_blank">
      <icon-mdi:github class="logo text-lg fixed top-1 right-1" />
    </a>
    <a href="https://wxt.dev" target="_blank">
      <img src="/wxt.svg" class="logo" alt="WXT logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="@/assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <button @click="toggleDark()" class="bg-green-6 text-white focus:outline-transparent">
    <icon-ant-design:chrome-outlined class="inline align-middle"/>

    <icon-carbon:moon class="inline align-middle" v-if="isDark" />
    <icon-carbon:sun class="inline align-middle" v-else />

    <span class="ml-2">{{ isDark ? 'Dark' : 'Light' }}</span>
  </button>
  <HelloWorld msg="WXT + Vue" />
</template>

<style scoped>
.logo {
  height: 2em;
  padding: 1em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
