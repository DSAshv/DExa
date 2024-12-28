<script setup>
import { RouterView, useRouter } from "vue-router";
import { ref, onMounted } from 'vue';
import {ConfigHolder}from '../../../common/utils/config-holder.js';
import {EXAM_STATUS} from "../../../common/constants/common-constants.js";
const router = useRouter();
onMounted(async () => {
    if(ConfigHolder.config.mode === EXAM_STATUS.EXAM_LIVE){
        router.push("/liveexam");
    }
    else if([EXAM_STATUS.EXAM_SCHEDULED, EXAM_STATUS.EXAM_ENDED].includes(ConfigHolder.config.mode)){
        router.push("/examstatus");
    }

});
router.beforeEach((to, from, next) => {
    if (router.hasRoute(to.name)) {
        store.currentTab = to.name;
    }
    next();
});
</script>

<template>
    <RouterView />
</template>
