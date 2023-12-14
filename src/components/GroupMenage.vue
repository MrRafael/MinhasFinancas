<script setup lang="ts">
import { deleteData, getData } from '@/firebase/firestore';
import type { ExpenseGroup } from '@/types';
import { updateDoc, type DocumentReference, getFirestore } from 'firebase/firestore';
import GroupMember from '@/components/GroupMember.vue';
import { NFormItem, useDialog, useMessage, NButton, NSelect } from 'naive-ui'
import { ref, computed, defineProps, defineEmits } from 'vue';
import InviteList from './InviteList.vue'
import NewInvite from './NewInvite.vue'
import type { User } from 'firebase/auth';

const db = getFirestore();

const message = useMessage();
const dialog = useDialog();

const props = defineProps<{
    personalInfoRef: DocumentReference,
    user: User,
    myGroups: Array<ExpenseGroup>,
    currentGroup: string | null
}>();



const emit = defineEmits(['groupDeleted', 'invitesChange']);

const currentGroup = ref<string | null>(props.currentGroup);

const myGroupsOptions = computed(() => {
    return props.myGroups.map(group => ({ value: group.id, label: group.groupName }))
});

const selectedGroup = computed(() => {
    const selectedGroup = props.myGroups.filter(group => group.id == currentGroup.value);

    return selectedGroup[0];
});

const currentGroupCollaborators = computed(() => {
    if (currentGroup.value) {
        if (selectedGroup.value) {
            return selectedGroup.value.collaboratorsData
        }
    }

    return [];
});

function saveCurrentGroup() {
    const currentGroupRef = props.myGroups.filter(group => group.id === currentGroup.value)[0].ref;

    updateDoc(props.personalInfoRef, { currentGroup: currentGroupRef })
}

function canIDeleteThisGroup(): boolean {
    return props.myGroups.filter(group => group.id === currentGroup.value && group.ownerUid === props.personalInfoRef.id).length > 0;
}

function deleteGroup() {
    dialog.warning({
        title: 'Deletar grupo selecionado?',
        content: 'Tem Certeza? todas as despesas adicionadas serão perdidas',
        positiveText: 'Confirmar',
        negativeText: 'Não',
        onPositiveClick: async () => {

            await deleteData(db, 'ExpenseGroup', currentGroup.value as string)
            await updateDoc(props.personalInfoRef, { currentGroup: null })
            currentGroup.value = null;
            emit('groupDeleted')
            message.success('Grupo deletado com sucesso!')
        },
    });
}

const toggleNewInvite = ref(true);

const emailsAdded = ref<string[]>([]);

function updateInvites(email:string){
    emailsAdded.value.push(email);

    toggleNewInvite.value = true;
}

async function deleteMember(memberUid: string){
    selectedGroup.value.collaborators
    await updateDoc(selectedGroup.value.ref, {
        collaborators: selectedGroup.value.collaborators.filter(colab => colab !== memberUid),
        collaboratorsData: selectedGroup.value.collaboratorsData.filter(colab => colab.uid !== memberUid),
    })

    emit('groupDeleted');
}

</script>
<template>
    <invite-list :user="$props.user" @invites-change="$emit('invitesChange')" />
    <n-form-item v-if="myGroups.length > 0" label="Grupo de contribuição atual" path="remuneration">
        <n-select v-model:value="currentGroup" :options="myGroupsOptions" @update:value="saveCurrentGroup" />
    </n-form-item>
    <slot>
    </slot>
    <div v-if="currentGroup" class="display-flex direction-column members">
        <h3>Membros do grupo</h3>
        <group-member v-for="collaborator in currentGroupCollaborators" v-bind:key="collaborator.uid" :user="collaborator"
            :show-delete="canIDeleteThisGroup() && collaborator.uid !== personalInfoRef.id" @delete-member="deleteMember" />

        <div v-if="selectedGroup && [...selectedGroup.invitedPeople, ...emailsAdded].length > 0">
            <h4>Convidados</h4>
            <p v-for="(email, index) in [...selectedGroup.invitedPeople, ...emailsAdded]" v-bind:key="index">{{ email }}</p>
        </div>

        <n-button v-if="toggleNewInvite && user.uid === selectedGroup?.ownerUid" @click="toggleNewInvite = false">Convide membros</n-button>
        <new-invite v-if="!toggleNewInvite" :selectedGroup="selectedGroup" @inveted="updateInvites" />
        <n-button v-if="canIDeleteThisGroup()" @click="deleteGroup" style="margin-top: 2rem;">Delete grupo
            selecionado</n-button>
    </div>
</template>

<style scoped>
.members * {
    margin-bottom: 1rem;
}
</style>