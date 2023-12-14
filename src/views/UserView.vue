<script setup lang="ts">
import { getUser } from '@/firebase';
import { NForm, NFormItem, NInputNumber, useMessage } from 'naive-ui'
import { ref, onBeforeMount } from 'vue';
import { doc, getFirestore, setDoc, updateDoc } from 'firebase/firestore'
import { getData, getDataByDocId } from '../firebase/firestore'
import GroupMenage from '@/components/GroupMenage.vue';
import NewGroups from '@/components/NewGroups.vue';
import { type ExpenseGroup, type PersonalInformation } from '../types'
import { parseCurrency, formatCurrency } from '../util'
import type { User } from '@firebase/auth';

const db = getFirestore();

const message = useMessage();

const formData = ref<{ remuneration: number }>({
    remuneration: 0,
});
const myGroups = ref<Array<ExpenseGroup>>([]);
const user = ref<User>();
const personalInformation = ref<PersonalInformation>();

function saveRemuneration() {
    updateDoc(personalInformation.value!.ref, { remuneration: formData.value.remuneration })
}

async function syncMyGroups(uid: string) {
    const data = await getData<ExpenseGroup>(db, 'ExpenseGroup', 'collaborators', 'array-contains', uid);

    myGroups.value = data as ExpenseGroup[];
}

async function syncMyPersonalInfo(uid: string) {
    try {
        const pInfo = await getDataByDocId(db, 'PersonalInformation', uid);

        if (pInfo) {

            personalInformation.value = pInfo as PersonalInformation;
            formData.value.remuneration = personalInformation.value.remuneration;
        } else {
            await setDoc(doc(db, 'PersonalInformation', uid), {
                currentGroup: null,
                remuneration: 0,
                uid: user.value?.uid
            });
        }
    } catch (e) {
        message.error('Erro ao recuperar informações.')
    }
}

onBeforeMount(async () => {
    user.value = await getUser() as User;

    await syncMyPersonalInfo(user.value.uid);
    await syncMyGroups(user.value.uid);
});
</script>

<template>
    <n-form :model="formData">
        <n-form-item label="Salario" path="remuneration">
            <n-input-number class="form-input" :parse="parseCurrency" :format="formatCurrency" placeholder="Salario"
                v-model:value="formData.remuneration" @blur="saveRemuneration" />
        </n-form-item>
    </n-form>
    <group-menage v-if="personalInformation" :personal-info-ref="personalInformation?.ref" :my-groups="myGroups"
        :current-group="personalInformation.currentGroup ? personalInformation.currentGroup.id : null"
        :user="(user as User)" @group-deleted="syncMyGroups(personalInformation?.id as string)"
        @invites-change="syncMyGroups(user!.uid)"
    >

        <new-groups v-if="user" :user="(user as User)" @groups-added="syncMyGroups(personalInformation?.id as string)" />
    </group-menage>
</template>

<style scoped>
.form-input {
    width: 100%;
}
</style>