<script setup lang="ts">
import { NButton } from 'naive-ui';
import { message } from './composables/useDiscreteApi';

async function testMessage() {
  message.success('这是message！！')
}
</script>

<template>
  <!-- <div class="text-amber"> -->
    <!-- THIS is Vite + Vue!
    <NButton @click="testMessage">test message</NButton> -->
    <!-- <div class="flex-col flex">
      <RouterLink to="/">to home</RouterLink>
      <RouterLink to="/register">to register</RouterLink>
      <RouterLink to="/login">to login</RouterLink>
    </div> -->
    <div class="flex justify-center items-center h-dvh overflow-hidden">
      <RouterView></RouterView>
    </div>
  <!-- </div> -->
</template>

<style scoped>
</style>
