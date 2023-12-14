<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import months from '../consts/months';
import { getUser } from '../firebase';
import { NAvatar, NPopselect, NButton, NGrid, NGridItem, NIcon } from 'naive-ui';
import { LogOutFilled } from '@vicons/material';
import router from '@/router';
import { getAuth, signOut } from 'firebase/auth';
import {useUserStore} from '../stores/user';
import { useMonthStore } from '@/stores/currentMonth';

const today = new Date();
const currentMonth = today.getMonth() + 1;
const userPhotoUrl =  ref('');
const month = ref(months.filter(month => month.value === currentMonth)[0].value);

const sUser = useUserStore();
const sMonth = useMonthStore();

onBeforeMount(async () => {
    const user = await getUser();
    await sUser.setUser(user);
    await sMonth.setMonth(month.value);
    
    userPhotoUrl.value = user!.photoURL as string
});

function currentMonthLabel(monthNumber: number) {
    return months.filter(month => month.value === monthNumber)[0].label;
}

function logout(){
    signOut(getAuth());
    sUser.setUser(null);
    router.push('/login')
}

</script>

<template>
    <header>
        <n-grid :cols="3" class="grid">
            <n-grid-item class="grid-item">
                <n-avatar round size="large" class="cursor-pointer" @click="router.push('/user')" :src="userPhotoUrl" />
            </n-grid-item>
            <n-grid-item class="grid-item grid-item-select">
                <n-popselect :options="months" v-model:value="month" class="select" trigger="click" @update:value="sMonth.setMonth(month)">
                    <n-button class="select" round type="primary">{{ currentMonthLabel(month) }}</n-button>
                </n-popselect>
            </n-grid-item>
            <n-grid-item class="grid-item grid-item-logout">
                <n-icon :component="LogOutFilled" size="25" @click="logout" color="white" class="cursor-pointer" />
            </n-grid-item>
        </n-grid>
    </header>
</template>

<style scoped>
header {
    background: #B261DC;
    width: 100vw;
    height: 4rem;
    position: fixed;
    left: 0;
    top: 0;
    padding: 0 2rem;
}
.grid{
    height: 100%;
}
.grid-item {
    height: 100%;
    display: flex;
    align-items: center;
}

.grid-item-select {
    justify-content: center;
}

.grid-item-logout {
    justify-content: flex-end;
}
</style>