<script setup lang="ts">
import {NGrid, NGridItem, NButton, NIcon } from 'naive-ui'
import { AddRound, HomeFilled } from '@vicons/material';
import router from '@/router';

function goHome(){
    router.push('/')
}

function goAddExpense() {
    router.push('/expense')
}

</script>

<template>
    <footer>
        <n-grid cols="3" class="grid">
            <n-grid-item class="display-flex align-center">
                <n-grid-item class="grid-item display-flex justify-center align-center">
                    <n-icon :component="HomeFilled" size="30" color="white" @click="goHome"/>
            </n-grid-item>
            </n-grid-item>
            <n-grid-item class="grid-item display-flex justify-center align-center">
                <n-button circle strong size="large" type="primary" @click="goAddExpense"> 
                    <template #icon>
                        <n-icon :component="AddRound" size="25" />
                    </template>
                </n-button>
            </n-grid-item>
        </n-grid>
    </footer>
</template>

<style scoped>
footer {
    background: #B261DC;
    width: 100vw;
    height: 4rem;
    position: fixed;
    left: 0;
    bottom: 0;
    padding: 0 2rem;
}

.grid{
    height: 100%;
}

.grid-item {
    height: 100%;
}

</style>