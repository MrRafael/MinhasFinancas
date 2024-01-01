<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import ConstMonths from '../consts/months';
import { getUser } from '../firebase';
import { NAvatar, NPopselect, NButton, NGrid, NGridItem, NIcon } from 'naive-ui';
import { LogOutFilled } from '@vicons/material';
import router from '@/router';
import { getAuth, signOut } from 'firebase/auth';
import {useUserStore} from '../stores/user';
import { useMonthStore } from '@/stores/currentMonth';
import { useYearStore } from '@/stores/currentYear';

const currentYear = new Date().getFullYear();
const decemberLastYear = {
    value: -1,
    year: currentYear - 1,
    label: ConstMonths[11].label + " " + (currentYear - 1),
};
const months = [decemberLastYear].concat(ConstMonths.map(month => ({...month, year: currentYear})));

const today = new Date();
const currentMonth = today.getMonth() + 1;
const userPhotoUrl =  ref('');
const month = ref(months.filter(month => month.value === currentMonth)[0].value);

const sUser = useUserStore();
const sMonth = useMonthStore();
const sYear = useYearStore();

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

async function changeCurrentMonth(month:number){
    await sYear.setYear(months.filter(m => m.value === month)[0].year);
    await sMonth.setMonth(month === -1 ? 12 : month);
}

</script>

<template>
    <header>
        <n-grid :cols="3" class="grid">
            <n-grid-item class="grid-item">
                <n-avatar round size="large" class="cursor-pointer" @click="router.push('/user')" :src="userPhotoUrl" />
            </n-grid-item>
            <n-grid-item class="grid-item grid-item-select">
                <n-popselect :options="months" v-model:value="month" class="select" trigger="click" @update:value="changeCurrentMonth(month)">
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
    z-index: 1;
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