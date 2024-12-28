<script setup>

import { useRoute } from 'vue-router';
import{ref} from 'vue';
import {ConfigHolder} from "../../../common/utils/config-holder";
const examMessage = ref(ConfigHolder.config.message);
</script>

<template>
    <div>
      <h1>Live Exam</h1>
      <!-- <p>Exam ID: {{ examMessage }}</p> -->
    </div>
  </template>  
