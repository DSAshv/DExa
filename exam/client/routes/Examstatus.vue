<script setup>

import { useRoute } from 'vue-router';
import{ref} from 'vue';
import {ConfigHolder} from "../../../common/utils/config-holder";
import { EXAM_STATUS } from '../../../common/constants/common-constants';
const examMessage = ref(ConfigHolder.config.message);
</script>

<template>
  <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
      <h1>DExa</h1>
      <p v-if="ConfigHolder.config.mode === EXAM_STATUS.EXAM_SCHEDULED">{{ ConfigHolder.examInfo.name }} has not been started yet! Kindly wait!</p>
      <p v-else-if="ConfigHolder.config.mode === EXAM_STATUS.EXAM_ENDED">{{ ConfigHolder.examInfo.name }} has ended! Results will be released!</p>
  </main>
</template>
