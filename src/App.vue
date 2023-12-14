<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import TopApp from './components/TopApp.vue';
import BottomApp from './components/BottomApp.vue';
import router from './router';
import { NConfigProvider, NMessageProvider, NDialogProvider } from 'naive-ui'
import { ptBR, datePtBR } from 'naive-ui'
import { ref } from 'vue';

const isLogged = () => router.currentRoute.value.name !== 'login';

const month = ref(0);

function updateMonth(m: number) {
    month.value = m;
}

</script>

<template>
    <n-config-provider :locale="ptBR" :date-locale="datePtBR">
        <n-message-provider>
            <n-dialog-provider>
                <div>
                    <top-app v-if="isLogged()" @month-change="updateMonth($event!)"/>
                    <RouterView />
                    <bottom-app v-if="isLogged()" />
                </div>
            </n-dialog-provider>
        </n-message-provider>
    </n-config-provider>
</template>

<style scoped></style>
