<script setup>
import ConfigHolder from "../../common/utils/config-holder";

defineProps({
    portalText: {
        type: String,
        default: "",
    },
});
const redirectPath = ConfigHolder.isAuthorized ? "/dashboard" : "/register";
</script>

<template>
    <main class="w-100 h-100 d-flex align-items-center justify-content-center">
        <div>
            <h1 class="text-primary">
                DExa - {{ portalText }}
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
