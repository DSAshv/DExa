import { defineStore } from "pinia";
import { ref } from "vue";
import { ROLES_TABS_MAP } from "../../common/constants/client-constants";
import { ConfigHolder } from "../../common/utils/config-holder";

export const useStore = defineStore("store", () => {
    const tabs = ROLES_TABS_MAP["exam"][ConfigHolder.role]
    const currentTab = ref(tabs?.[0]?.id || "");
    const exams = ref([]);

    return {
        currentTab,
        tabs,
        exams
    };
});
