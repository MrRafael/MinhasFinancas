<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import TopApp from './components/TopApp.vue';
import BottomApp from './components/BottomApp.vue';
import router from './router';
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import { ptBR, datePtBR } from 'naive-ui'
import InstallPage from './views/InstallPage.vue'
import { ref, onBeforeMount, computed } from 'vue';

const isLogged = () => router.currentRoute.value.name !== 'login';

const month = ref(0);

function updateMonth(m: number) {
    month.value = m;
}

const displayMode = ref(getPWADisplayMode());

const showApp = true;
const installEvent = ref<any>();

function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    } else if (isStandalone) {
        return 'standalone';
    }
    return 'browser';
}

onBeforeMount(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        installEvent.value = e
    })

    window.matchMedia('(display-mode: standalone)').addEventListener('change', (evt) => {
        let dm = 'browser';
        if (evt.matches) {
            dm = 'standalone';
        }
        displayMode.value = dm;
    });
})

function installPWA() {
    installEvent.value.prompt();
}
</script>

<template>
    <n-config-provider :locale="ptBR" :date-locale="datePtBR">
        <n-message-provider>
            <n-dialog-provider>
                <install-page v-if="!showApp" @install="installPWA"></install-page>
                <div v-if="showApp">
                    <top-app v-if="isLogged()" @month-change="updateMonth($event!)" />
                    <RouterView />
                    <bottom-app v-if="isLogged()" />
                </div>
            </n-dialog-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<style scoped></style>
