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
    path: "/register",
    component: () => import("../../common/client-components/Register.vue"),
  },
  {
    path: "/dashboard",
    component: () => import("./routes/Dashboard.vue"),
  },
  {
    path: "/examstatus",
    component: () => import("../client/routes/Examstatus.vue"),
  },
  {
    path: "/liveexam",
    component: () => import("../client/routes/Liveexam.vue"),
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
