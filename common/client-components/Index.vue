<script setup>
import ConfigHolder from "../../common/utils/config-holder";

const props = defineProps({
    portalText: {
        type: String,
        default: "",
    },
});
let redirectPath = ConfigHolder.isAuthorized ? "/dashboard" : "/register";
if (props.portalText === "Exam Portal") {
    redirectPath = ConfigHolder.isAuthorized ? `/exam/${ConfigHolder.examId}/attendance` : "/register";
    if (ConfigHolder.isStudent) {
        redirectPath = ConfigHolder.isAuthorized ? `/exam/${ConfigHolder.examId}/general` : "/register";
    }
}
</script>

<template>
    <main class="w-100 h-100 d-flex align-items-center justify-content-center">
        <div>
            <h1 class="text-primary">
                DExa - {{ props.portalText }}
            </h1>
            <h2>Your Gateway to <span class="text-success">Success</span></h2>
            <RouterLink
                :to="redirectPath"
                class="btn btn-primary"
            >
                Access portal
            </RouterLink>
        </div>
    </main>
</template>
