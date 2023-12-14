<script setup lang="ts">
import type { userInfo } from '@/types';
import { NAvatar, NIcon, NSpace } from 'naive-ui'
import { DeleteOutlineFilled } from '@vicons/material';
import { defineProps } from 'vue';

defineProps<{
    user?: userInfo,
    showDelete?: boolean
}>();

</script>

<template>
    <n-space v-if="user" class="align-center background" justify="space-between">
        <n-space class="align-center">
            <n-avatar :src="user.photoUrl" />
            <div>
                <p>{{ user.name }}</p>
                <p>{{ user.email }}</p>
            </div>
        </n-space>
        <n-icon v-if="showDelete" @click="$emit('deleteMember', user?.uid )" size="large" :component="DeleteOutlineFilled" class="cursor-pointer" />
    </n-space>
</template>

<style scoped>
.background{
    background: #f9eaff;
    border-radius: 5px;
    padding: 10px;
}
</style>