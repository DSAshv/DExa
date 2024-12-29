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
    path: "/",
    component: () => import("../../common/client-components/Index.vue"),
    props: { portalText: "Exam Portal" },
  },
  {
    name: "register",
    path: "/register",
    component: !ConfigHolder.isAuthorized && (() => import("../../common/client-components/Register.vue")),
    redirect: ConfigHolder.isAuthorized && "/",
  },
  {
    name: "attendance",
    path: "/attendance",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Attendance.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "submissions",
    path: "/submissions",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Submissions.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "feedbacks",
    path: "/feedbacks",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Feedbacks.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "general",
    path: "/general",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Feedbacks.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "general",
    path: "/feedbacks",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Feedbacks.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "feedbacks",
    path: "/feedbacks",
    component: ConfigHolder.isAuthorized && (() => import("./routes/Feedbacks.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    path: "/examstatus",
    component: () => import("./routes/Examstatus.vue"),
  },
  {
    path: "/liveexam",
    component: () => import("./routes/Liveexam.vue"),
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
