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
    path: `/exam/${ConfigHolder.examId}/attendance`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/Attendance.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "submissions",
    path: `/exam/${ConfigHolder.examId}/submissions`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/Submissions.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "feedbacks",
    path: `/exam/${ConfigHolder.examId}/feedbacks`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/Feedbacks.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "general",
    path: `/exam/${ConfigHolder.examId}/general`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/General.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "liveexam",
    path: `/exam/${ConfigHolder.examId}/liveexam`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/LiveExam.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "exam",
    path: `/exam/${ConfigHolder.examId}/liveexam`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/LiveExam.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    name: "submit",
    path: `/exam/${ConfigHolder.examId}/submit`,
    component: ConfigHolder.isAuthorized && (() => import("./routes/Submit.vue")),
    redirect: !ConfigHolder.isAuthorized && "/",
  },
  {
    path: `/exam/${ConfigHolder.examId}/examstatus`,
    component: () => import("./routes/Examstatus.vue"),
    component: ConfigHolder.isAuthorized && (() => import("./routes/Examstatus.vue")),
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
