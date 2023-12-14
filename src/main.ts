import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import firebase from 'firebase/compat/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { firebaseConfig } from './firebaseconfig';

const fireBaseApp = firebase.initializeApp(firebaseConfig);

initializeAppCheck(fireBaseApp, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA),
  });

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
