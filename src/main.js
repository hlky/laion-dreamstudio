import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createRouter, createWebHashHistory } from 'vue-router';
import Vue3DraggableResizable from 'vue3-draggable-resizable';
import App from "@/App.vue";
const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/IndexContent.vue')
    },
    {
        path: '/dream',
        name: 'Dream',
        component: () => import('@/views/DreamContent.vue')
    },
    {
        path: '/annotate',
        name: 'Annotate',
        component: () => import('@/views/AnnotateContent.vue')
    }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
});
const app = createApp(App);
app.use(router);
app.use(ElementPlus);
app.use(Vue3DraggableResizable);
app.mount('#app');
//# sourceMappingURL=main.js.map