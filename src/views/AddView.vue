<script setup lang="ts">
import { NForm, NFormItem, NDatePicker, NInput, NInputNumber, NSwitch, NGrid, NGridItem, type FormInst, NButton, useMessage } from 'naive-ui'
import { onBeforeMount, ref } from 'vue';
import { getFirestore, collection, addDoc, DocumentReference, where } from 'firebase/firestore'
import type { Expense, ExpenseGroup, MonthGroup, PersonalInformation } from '@/types';
import { addData, getDataAnd, getDataByDocId, getDataByRef } from '@/firebase/firestore';
import { parseCurrency, formatCurrency } from '../util'
import type { User } from 'firebase/auth';
import { getUser } from '@/firebase';
import { useUserStore } from '@/stores/user';
import { useMonthStore } from '@/stores/currentMonth';

const db = getFirestore();
const message = useMessage();

const sUser = useUserStore();
const sMonth = useMonthStore();

const formRef = ref<FormInst | null>(null);

function startExpense(): Expense {
    return {
        date: Date.now(),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        value: null,
        description: '',
        category: '',
        creditCard: true,
        halfHalfDivision: false,
        expenseGroupMonth: null,
        readers: [],
        ownerUid: '',
        ownerPhotoUrl: ''
    }
}

sMonth.$onAction(() => {
    expense.value = startExpense();
});

const expense = ref<Expense>(startExpense());

const multiplePayment = ref(false)
const paymentTimes = ref(1)

const personalInformation = ref<PersonalInformation>();
const user = ref<User>();
const currentGroup = ref<ExpenseGroup>()

async function syncMyPersonalInfo(uid: string) {
    try {
        const pInfo = await getDataByDocId(db, 'PersonalInformation', uid) as PersonalInformation;

        if (pInfo && pInfo.currentGroup) {
            personalInformation.value = pInfo;
        }
    } catch (e) {
        message.error('É necessário selecionar um grupo de despesas! (Clique na sua foto)');
    }
}

async function getCurrentGroup(groupRef: DocumentReference) {
    currentGroup.value = await getDataByRef(groupRef) as ExpenseGroup;
}

onBeforeMount(async () => {
    user.value = await getUser() as User;
    await syncMyPersonalInfo(user.value.uid);
    await getCurrentGroup(personalInformation.value?.currentGroup as DocumentReference)
});

async function getMonthGroup(month: number, year: number): Promise<DocumentReference>{
    const currentMonthGroup = await getDataAnd(db, 'MonthGroup',[
        where('expenseGroup', '==', currentGroup.value?.ref!),
        where('month', '==', month),
        where('year', '==', year),
    ]) as MonthGroup[];

    if(currentMonthGroup.length === 0) {
        await addData(db, 'MonthGroup', {
            collaborators: await getCollaboratorsData(),
            expenseGroup: currentGroup.value?.ref,
            readers: currentGroup.value?.collaborators,
            month,
            year
        })
        return getMonthGroup(month,year);
    }

    return currentMonthGroup[0].ref;
}

async function getCollaboratorsData(){
    const collabs = [];
    for (let index = 0; index < currentGroup.value?.collaboratorsData.length!; index++) {
        const personalInfo = await getDataByDocId(db, 'PersonalInformation', currentGroup.value?.collaboratorsData[index].uid!) as PersonalInformation

        collabs.push({
            uid: currentGroup.value?.collaboratorsData[index].uid,
            photoUrl: currentGroup.value?.collaboratorsData[index].photoUrl,
            remuneration: personalInfo.remuneration
        })
    }

    return collabs;
}

const isSaving = ref(false);

async function save() {
    isSaving.value = true;
    try {
        expense.value.expenseGroupMonth = await getMonthGroup(expense.value.month, expense.value.year);
        expense.value.readers = currentGroup.value?.collaborators!;
        expense.value.ownerUid = sUser.user?.uid!;
        expense.value.ownerPhotoUrl = sUser.user?.photoURL!;

        await addDoc(collection(db, 'Expense'), { ...expense.value, description: multiplePayment.value && paymentTimes.value > 1 ? expense.value.description + ` 1/${paymentTimes.value}` : expense.value.description });

        if (multiplePayment.value && paymentTimes.value > 1) {
            for (let index = 1; index < paymentTimes.value; index++) {
                const date = new Date(expense.value.date)
                expense.value.date = date.setMonth(date.getMonth() + 1);
                expense.value.month = date.getMonth() + 1;
                expense.value.year = date.getFullYear();
                expense.value.expenseGroupMonth = await getMonthGroup(expense.value.month, expense.value.year);
                await addDoc(collection(db, 'Expense'), { ...expense.value, description: expense.value.description + ` ${index+1}/${paymentTimes.value} ` });
            }

            multiplePayment.value = false;
            paymentTimes.value = 1;
        }

        expense.value = startExpense();
        message.success('Despesa adicionada com sucesso');
    } catch(e) {
        message.error('Erro ao adicionar despesa');
    }
    isSaving.value = false;
}
</script>

<template>
    <n-form ref="formRef" :model="expense">
        <n-form-item label="Data" path="date">
            <n-date-picker class="form-input" v-model:value="expense.date" format="dd/MM/yyyy" />
        </n-form-item>
        <n-form-item label="Valor" path="value">
            <n-input-number class="form-input" :parse="parseCurrency" :format="formatCurrency"
                placeholder="Valor da Despesa" v-model:value="expense.value" />
        </n-form-item>
        <n-form-item label="Descrição" path="description">
            <n-input v-model:value="expense.description" placeholder="Descrição" />
        </n-form-item>
        <n-form-item label="Categoria" path="category">
            <n-input v-model:value="expense.category" placeholder="Categoria" />
        </n-form-item>
        <n-grid cols="2">
            <n-grid-item>
                <n-switch v-model:value="expense.creditCard">
                    <template #checked>Cartão de credito</template>
                    <template #unchecked>Outro</template>
                </n-switch>
            </n-grid-item>
            <n-grid-item>
                <n-switch v-model:value="expense.halfHalfDivision">
                    <template #checked>Divisão 50/50</template>
                    <template #unchecked>Divisão %</template>
                </n-switch>
            </n-grid-item>
        </n-grid>
        <n-form-item>
            <n-switch v-model:value="multiplePayment">
                <template #checked>Parcelado</template>
                <template #unchecked>A Vista</template>
            </n-switch>
        </n-form-item>
        <n-form-item v-if="multiplePayment">
            <n-input-number class="form-input" placeholder="Numero de Parcelas" v-model:value="paymentTimes" />
        </n-form-item>
    </n-form>

    <n-form-item>
        <n-button class="form-input" @click="save" :disabled="isSaving">Salvar</n-button>
    </n-form-item>
</template>

<style scoped>
.form-input {
    width: 100%;
}

.form {
    background: red;
}
</style>