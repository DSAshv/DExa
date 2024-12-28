import { defineStore } from "pinia";
import { ref } from "vue";
import { ROLES_TABS_MAP } from "../../common/constants/client-constants";
import { ConfigHolder } from "../../common/utils/config-holder";

export const useStore = defineStore("store", () => {
    const currentTab = ref("dashboard");
    const tabs = ROLES_TABS_MAP[ConfigHolder.role]
    const exams = ref([]);

    return {
        currentTab,
        tabs,
        exams
    };
});
