<script setup>
import { RouterView, useRouter, useRoute } from "vue-router";
import { ref, onMounted } from 'vue';
import {ConfigHolder}from '../../../common/utils/config-holder.js';
import { EXAM_STATUS } from "../../../common/constants/common-constants.js";
import TopNav from "../../../common/client-components/TopNav.vue";
import { useStore } from "../store";

const route = useRoute();
const router = useRouter();
const store = useStore();

function handleCurrentTabChange(tab) {
    if (router.hasRoute(tab)) {
        const _tab = store.tabs.find((t) => t.id === tab);
        if (_tab) {
            store.currentTab = _tab.id;
            router.push(`/exam/${ConfigHolder.examId}/${_tab.id}`);
        }
    }
}

onMounted(async () => {
    if(ConfigHolder.config.mode === EXAM_STATUS.EXAM_LIVE && ConfigHolder.isStudent){
        router.push(`exam/${ConfigHolder.examId}/liveexam`);
    }
    else if([EXAM_STATUS.EXAM_SCHEDULED, EXAM_STATUS.EXAM_ENDED].includes(ConfigHolder.config.mode)){
        router.push(`exam/${ConfigHolder.examId}/examstatus`);
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
    <TopNav
        v-if="route.path !== '/' && route.path !== '/register' && !route.path.includes('/examstatus')"
        portal-text="Exam Portal"
        :current-tab="store.currentTab"
        :handle-current-tab-change="handleCurrentTabChange"
        :tabs="store.tabs"
    />
    <RouterView />
</template>
