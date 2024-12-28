<script setup>
import { ref } from "vue";
import { API_RESPONSE } from "../constants/common-constants";
import { redirect, showInfoMsg } from "../utils/common-utils"
import ConfigHolder from "../utils/config-holder";
defineProps({
    portalText: {
        type: String,
        default: "",
    },
    currentTab: {
        type: String,
        default: "",
    },
    handleCurrentTabChange: {
        type: Function,
        default: () => {},
    },
    tabs: {
        type: Array,
        default: () => [],
    },
});

const isLogoutInProgress = ref(false);

function handleLogout() {
    isLogoutInProgress.value = true;
    fetch(`${ConfigHolder.origin}/api/logout`, { method: "POST" })
        .then((response) => response.json())
        .then((response) => {
            showInfoMsg(response.data.message, response.result);
            if (response.result === API_RESPONSE.SUCCESS) {
                redirect("/", { timeout: 3000 });
            }
        }).catch(() => {
            isLogoutInProgress.value = false;
        })
}
</script>

<template>
    <header class="text-white bg-primary p-2 d-flex gap-4 justify-content-between align-items-center">
        <section>
            <h1 class="m-0">
                DExa|<span class="fw-normal fs-4">{{ portalText }}</span>
            </h1>
        </section>
        <section class="flex-grow-1 align-self-end">
            <nav class="d-flex gap-1 ms-4">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    class="tab-btn"
                    :class="{'tab-active': currentTab === tab.id}"
                    @click="handleCurrentTabChange(tab.id)"
                >
                    {{ tab.name }}
                </button>
            </nav>
        </section>
        <section>
            <button
                class="btn text-white fs-3 p-0"
                data-bs-toggle="offcanvas"
                data-bs-target="#account-canvas"
                aria-controls="offcanvasRight"
            >
                <i class="bi bi-person-circle" />
            </button>
        </section>
        <div
            id="account-canvas"
            class="offcanvas offcanvas-end"
            tabindex="-1"
            aria-labelledby="offcanvasRightLabel"
        >
            <div class="offcanvas-header">
                <h5
                    id="offcanvasRightLabel"
                    class="text-primary fw-bold"
                >
                    Account
                </h5>
                <button
                    type="button"
                    class="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                />
            </div>
            <div class="d-flex justify-content-center">
                <i class="bi bi-person-circle icon-1 text-primary"></i>
            </div>
            <div class="offcanvas-body d-flex flex-column justify-content-between">
                <section>
                    <p>
                        <span class="fw-bold">Id - </span>
                        <span>{{ ConfigHolder.id }}</span>
                    </p>
                    <p>
                        <span class="fw-bold">Name - </span>
                        <span>{{ ConfigHolder.name }}</span>
                    </p>
                    <p>
                        <span class="fw-bold">Email - </span>
                        <span>{{ ConfigHolder.email }}</span>
                    </p>
                    <p>
                        <span class="fw-bold">Date of birth - </span>
                        <span>{{ ConfigHolder.dateOfBirth }}</span>
                    </p>
                    <p>
                        <span class="fw-bold">Location - </span>
                        <span>{{ ConfigHolder.location }}</span>
                    </p>
                    <p>
                        <span class="fw-bold">Pincode - </span>
                        <span>{{ ConfigHolder.pincode }}</span>
                    </p>
                </section>
                <section>
                    <button
                        class="btn btn-danger w-100"
                        :disabled="isLogoutInProgress"
                        @click="handleLogout"
                    >
                        <span
                            v-if="isLogoutInProgress"
                            class="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                        />
                        Logout
                    </button>
                </section>
            </div>
        </div>
    </header>
</template>
