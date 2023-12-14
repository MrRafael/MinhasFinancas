<script setup lang="ts">
import type { ExpenseGroup } from '@/types';
import { updateDoc } from 'firebase/firestore';
import { ref, defineProps, defineEmits } from 'vue';
import { NButton, NInputGroup, NInput } from 'naive-ui'

const props = defineProps<{
    selectedGroup: ExpenseGroup
}>();

const emit = defineEmits(['inveted']);

const emailToInvite = ref('');

async function inviteMember() {
    await updateDoc(props.selectedGroup.ref, { invitedPeople: [...props.selectedGroup.invitedPeople, emailToInvite.value] });
    emit('inveted', emailToInvite.value);
    emailToInvite.value = '';
}

</script>

<template>
    <div>
        <n-input-group>
            <n-input placeholder="email do convidado" v-model:value="emailToInvite"></n-input>
            <n-button @click="inviteMember">Convidar</n-button>
        </n-input-group>
        
    </div>
</template>