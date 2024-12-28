<script setup>
import { RouterView, useRoute, useRouter } from "vue-router";
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
            router.push(_tab.id);
        }
    }
}

router.beforeEach((to, from, next) => {
    if (router.hasRoute(to.name)) {
        store.currentTab = to.name;
    }
    next();
});
</script>

<template>
    <TopNav
        v-if="route.path !== '/' && route.path !== '/register'"
        portal-text="Pre Exam Portal"
        :current-tab="store.currentTab"
        :handle-current-tab-change="handleCurrentTabChange"
        :tabs="store.tabs"
    />
    <RouterView />
</template>
