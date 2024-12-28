<script setup>
import { ref, useTemplateRef } from "vue";
import { showInfoMsg, generateSHA256Hash, redirect } from "../utils/common-utils";
import ConfigHolder from "../../common/utils/config-holder";
import { API_RESPONSE } from "../constants/common-constants";


const isRegisterInProgress = ref(false);
const isSignUp = ref(false);
const name = ref("");
const email = ref("");
const password = ref("");
const passwordInputRef = useTemplateRef("password-input");
const isPasswordVisible = ref(false);
const dateOfBirth = ref("");
const location = ref("");
const pincode = ref("");


const togglePasswordVisibility = () => {
    if (passwordInputRef.value.type === "password") {
        passwordInputRef.value.type = "text";
        isPasswordVisible.value = true;
    } else {
        passwordInputRef.value.type = "password";
        isPasswordVisible.value = false;
    }
};

const handleRegisterSwitch = () => {
    isSignUp.value = !isSignUp.value;
    name.value = "";
    email.value = "";
    password.value = "";
    dateOfBirth.value = "";
    location.value = "";
    pincode.value = "";
};

const handleRegister = async() => {
    if ((isSignUp.value && name.value && email.value && password.value && dateOfBirth.value && location.value && pincode.value) ||
        (!isSignUp.value && email.value && password.value)) {
        isRegisterInProgress.value = true;
        const body = new FormData();
        body.append("email", email.value);
        body.append("password", await generateSHA256Hash(password.value));
        if (isSignUp.value) {
            body.append("name", name.value);
            body.append("dateOfBirth", dateOfBirth.value);
            body.append("location", location.value);
            body.append("pincode", pincode.value);
        }

        fetch(`${ConfigHolder.origin}/api/${isSignUp.value ? "signup" : "signin"}`, {
            method: "POST",
            body,
            headers: {

            },
        }).then(
            response => response.json(),
        ).then(response => {
            showInfoMsg(response.data.message, response.result);
            if (response.result === API_RESPONSE.SUCCESS) {
                redirect("/dashboard", { timeout: 3000 });
            } else {
                isRegisterInProgress.value = false;
            }
        }).catch(() => {
            isRegisterInProgress.value = false;
            showInfoMsg("An error occurred. Try again", "danger");
        });
    } else {
        showInfoMsg("Invalid credentials", "warning");
    }
};
</script>

<template>
    <main class="w-100 h-100 d-flex align-items-center justify-content-center">
        <section
            id="register-form"
            class="d-flex flex-column"
        >
            <h1 class="text-primary">
                DExa
            </h1>
            <h1>{{ isSignUp ? "Sign Up Now" : "Sign In Now" }}</h1>
            <form class="d-flex flex-column gap-2">
                <template v-if="isSignUp">
                    <input
                        v-model="name"
                        type="text"
                        name="name"
                        class="form-control"
                        placeholder="Name"
                        required
                    >
                </template>
                <input
                    v-model="email"
                    type="text"
                    name="email"
                    class="form-control"
                    placeholder="Email"
                    required
                >
                <div class="d-flex position-relative">
                    <input
                        id="password"
                        ref="password-input"
                        v-model="password"
                        type="password"
                        name="password"
                        class="form-control has-validation"
                        placeholder="Password"
                        required
                    >
                    <i
                        :class="isPasswordVisible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill'"
                        class="position-absolute end-0 me-2 mt-2 z-index-max"
                        @click="togglePasswordVisibility"
                    />
                </div>
                <template v-if="isSignUp">
                    <input
                        v-model="dateOfBirth"
                        type="text"
                        name="dateOfBirth"
                        onfocus="(this.type='date')"
                        onblur="(this.type='text')"
                        class="form-control"
                        placeholder="Date of birth"
                        required
                    >
                    <input
                        v-model="location"
                        type="text"
                        name="location"
                        class="form-control"
                        placeholder="Location"
                        required
                    >
                    <input
                        v-model="pincode"
                        type="text"
                        name="pincode"
                        class="form-control"
                        placeholder="Pincode"
                        required
                    >
                </template>
            </form>
            <div class="mt-2">
                <button
                    class="btn btn-primary"
                    :disabled="isRegisterInProgress"
                    @click="handleRegister"
                >
                    <span
                        v-if="isRegisterInProgress"
                        class="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                    />
                    {{ isSignUp ? "Sign Up" : "Sign In" }}
                </button>
            </div>
            <div class="mt-2">
                <button
                    class="btn btn-dark"
                    :disabled="isRegisterInProgress"
                    @click="handleRegisterSwitch"
                >
                    {{ isSignUp ? "Already a User? Sign In" : "New User? Sign Up" }}
                </button>
            </div>
        </section>
    </main>
</template>
