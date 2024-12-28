<script setup>

import { useRoute } from 'vue-router';
import {ConfigHolder} from "../../../common/utils/config-holder";
const examMessage = ref(ConfigHolder.getExamMode);
</script>

<template>
    <div>
      <h1>Exam Status</h1>
      <p>Exam ID: {{ examMessage }}</p>
    </div>
  </template>  
