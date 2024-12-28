import "../../common/styles/style.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import App from "./routes/App.vue";
import ConfigHolder from "../../common/utils/config-holder";


ConfigHolder.config = window.__config__;
window.ConfigHolder = ConfigHolder;


const routes = [
    {
        name: "index",
        path: "/",
        component: () => import("../../common/client-components/Index.vue"),
        props: { portalText: "Pre Exam Portal" },
    },
    {
        name: "register",
        path: "/register",
        component: !ConfigHolder.isAuthorized && (() => import("../../common/client-components/Register.vue")),
        redirect: ConfigHolder.isAuthorized && "/",
    },
    {
        name: "dashboard",
        path: "/dashboard",
        component: ConfigHolder.isAuthorized && (() => import("./routes/Dashboard.vue")),
        redirect: !ConfigHolder.isAuthorized && "/",
    },
    {
        name: "exams",
        path: "/exams",
        component: ConfigHolder.isAuthorized && (() => import("./routes/Exams.vue")),
        redirect: !ConfigHolder.isAuthorized && "/",
    },
    {
        name: "createexam",
        path: "/createexam",
        component: ConfigHolder.isAuthorized && (() => import("./routes/CreateExam.vue")),
        redirect: !ConfigHolder.isAuthorized && "/",
    },
    {
        name: "halltickets",
        path: "/halltickets",
        component: ConfigHolder.isAuthorized && (() => import("./routes/HallTickets.vue")),
        redirect: !ConfigHolder.isAuthorized && "/",
    },
    {
        name: "others",
        path: "/:catchAll(.*)",
        redirect: "/",
    },
];

const pinia = createPinia();

const router = createRouter({
    history: createWebHistory(),
    routes,
});


const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#body");
