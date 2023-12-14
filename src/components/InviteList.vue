<script setup lang="ts">
import { getData } from '@/firebase/firestore';
import type { ExpenseGroup } from '@/types';
import { getFirestore, updateDoc } from 'firebase/firestore';
import { onBeforeMount, ref, defineProps, defineEmits } from 'vue';
import { NButton } from 'naive-ui'
import type { User } from 'firebase/auth';

const db = getFirestore();

const props = defineProps<{
    user: User
}>();

const emit = defineEmits(['invitesChange']);

const invitedGroups = ref<ExpenseGroup[]>([]);
async function syncInvites() {
    invitedGroups.value = await getData<ExpenseGroup[]>(db, 'ExpenseGroup', 'invitedPeople', 'array-contains', props.user.email as string) as ExpenseGroup[];
}

onBeforeMount(async () => {
    await syncInvites();
});

function accepts(invite: ExpenseGroup) {
    const newCollaborator = {
        name: props.user.displayName,
        email: props.user.email,
        uid: props.user.uid,
        photoUrl: props.user.photoURL,
    };
    updateDoc(invite.ref, {
        invitedPeople: [...invite.invitedPeople.filter(mail => mail !== props.user.email)],
        collaboratorsData: [...invite.collaboratorsData, newCollaborator],
        collaborators: [...invite.collaborators, props.user.uid]
    })
    emit('invitesChange');
    syncInvites();
}

function reject(invite: ExpenseGroup) {
    updateDoc(invite.ref, {
        invitedPeople: [...invite.invitedPeople.filter(mail => mail !== props.user.email)]
    })
    syncInvites();
}

</script>

<template>
    <div v-if="invitedGroups.length > 0">
        <h3>Convites</h3>
        <div v-for="(invite, index) in invitedGroups" v-bind:key="index" class="invite display-flex direction-column">
            <span>Grupo: {{ invite.groupName }}</span>
            <span>Dono(a): {{ invite.collaboratorsData.filter(col => col.uid === invite.ownerUid)[0].email }}</span>
            <div class="display-flex justify-evenly" style="margin-top: 1rem;">
                <n-button round type="error" @click="reject(invite)">
                    Recusar
                </n-button>
                <n-button round type="success" @click="accepts(invite)">
                    Aceitar
                </n-button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.invite {
    background: #f9eaff;
    border-radius: 5px;
    padding: 10px;
    margin: 1rem 0;
}
</style>