<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { NCollapse, NCollapseItem, NList, NThing, NListItem, NTag, NAvatar, NSpace, NInputNumber, NIcon, useDialog } from 'naive-ui';
import { deleteData, getDataAnd, getDataByDocId } from '@/firebase/firestore';
import { getFirestore, updateDoc, where } from 'firebase/firestore';
import type { CollaboratorResult, Expense, MonthGroup, PersonalInformation } from '@/types';
import { useMonthStore } from '@/stores/currentMonth';
import { useUserStore } from '@/stores/user';
import { parseCurrency, formatCurrency } from '../util'
import { DeleteOutlineFilled } from '@vicons/material';

const dialog = useDialog();

const db = getFirestore();
const sUser = useUserStore();
const sMonth = useMonthStore();
const personalInformation = ref<PersonalInformation>();

sMonth.$onAction(async (x) => {
    await syncExpenses(x.args[0]);
    calcCollabResults();
});

const expenses = ref<Expense[]>();
const currentMonthGroup = ref<MonthGroup | null>();
const collabsResult = ref<CollaboratorResult[]>()

const totalAmount = ref(0);

async function syncExpenses(month: number | null = null) {
    currentMonthGroup.value = null;
    expenses.value = [];

    const monthGroup = await getDataAnd<MonthGroup>(db, 'MonthGroup', [
        where('year', '==', 2023),
        where('month', '==', month ? month : sMonth.month),
        where('expenseGroup', '==', personalInformation.value?.currentGroup),
    ]) as MonthGroup[];

    if (monthGroup.length > 0) {
        currentMonthGroup.value = monthGroup[0];
        totalAmount.value = currentMonthGroup.value.collaborators.map(collab => collab.remuneration).reduce((accumulator, a) => {
            return accumulator + a;
        });

        expenses.value = await getDataAnd<Expense>(db, 'Expense', [
            where('expenseGroupMonth', '==', currentMonthGroup.value.ref),
            where('readers', 'array-contains', sUser.user?.uid),
        ]) as Expense[];

        expenses.value = expenses.value.sort((a,b) => b.date - a.date);
    }
}

onBeforeMount(async () => {
    personalInformation.value = await getDataByDocId(db, 'PersonalInformation', sUser.user?.uid as string) as PersonalInformation;
    await syncExpenses();
    calcCollabResults();
});

async function saveRemuneration() {
    await updateDoc(currentMonthGroup.value?.ref!, {
        collaborators: currentMonthGroup.value?.collaborators
    });

    await syncExpenses();
}

function calcCollabResults() {
    const calcCollabResults: CollaboratorResult[] = [];
    const collabs = currentMonthGroup.value?.collaborators;

    collabs?.forEach(collab => {
        const expensesCollab = expenses.value?.filter(expense => expense.ownerUid === collab.uid)!;
        const expensesPartial = expenses.value?.filter(expense => !expense.halfHalfDivision)!;
        const expensesHalfHalf = expenses.value?.filter(expense => expense.halfHalfDivision)!;
        const amountToDivideEqualNominal = sum(expensesHalfHalf?.map(expense => expense.value as number));

        const amountToDividePartial = sum(expensesPartial?.map(expense => expense.value as number));

        const collabPercent = collab.remuneration / totalAmount.value * 100;

        const expenseToPay = (amountToDivideEqualNominal! / collabs.length) + (amountToDividePartial! * (collabPercent / 100));

        calcCollabResults.push({
            collaborator: collab,
            expenses: expensesCollab!,
            result: expenseToPay - sum(expensesCollab?.map(expense => expense.value as number))
        });
    })

    collabsResult.value = calcCollabResults;
}

function sum(arrayToSum: number[]): number {
    if (arrayToSum.length === 0) return 0;
    return arrayToSum.reduce((accumulator, a) => {
        return accumulator + a;
    })
}

function deleteExpense(expenseId: string){
    dialog.warning({
        title: 'Deletar Despesa?',
        positiveText: 'Confirmar',
        negativeText: 'Não',
        onPositiveClick: async () => {
            await deleteData(db, 'Expense', expenseId)
            await syncExpenses();
            calcCollabResults();
        },
    });
}

</script>

<template>
    <div>
        <div v-for="(collabResult, index) in collabsResult" v-bind:key="index"
            class="display-flex direction-column person-result"
            :class="{ 'need-to-receive': collabResult.result <= 0, 'need-to-pay': collabResult.result > 0 }">
            <div class="display-flex justify-between">
                <n-avatar :src="collabResult.collaborator.photoUrl" round>
                </n-avatar>
                <span style="margin-left: 1rem;">{{ (collabResult.result > 0 ? 'Pagar: ' : 'Receber: ') +
                    formatCurrency(Math.abs(collabResult.result)) }}</span>
            </div>
        </div>
    </div>
    <n-collapse>
        <n-collapse-item title="Dados Mês" name="1">
            <div v-for="(collab, index) in currentMonthGroup?.collaborators" v-bind:key="index"
                class="display-flex direction-column person-data">
                <div class="display-flex justify-between">
                    <n-avatar :src="collab.photoUrl" round>
                    </n-avatar>
                    <div>
                        <p v-if="collab.uid !== sUser.user?.uid">Salario: {{ `${formatCurrency(collab.remuneration)}` }}
                        </p>
                        <n-input-number v-if="collab.uid === sUser.user?.uid" class="form-input" :parse="parseCurrency"
                            :format="formatCurrency" placeholder="Salario" v-model:value="collab.remuneration"
                            @blur="saveRemuneration" />
                    </div>
                </div>
                <p style="margin-top: 0.5rem; text-align: center;">Percentual do salario na renda total: {{
                    (collab.remuneration / totalAmount * 100).toFixed(2) }}%</p>
            </div>
        </n-collapse-item>
        <n-collapse-item title="Despesas" name="2">
            <n-list>
                <n-list-item v-for="(expense, index) in expenses" v-bind:key="index">
                    <n-thing>
                        <template #header>
                            <div>{{ new Date(expense.date).toLocaleDateString('pt-br', {
                                year: "2-digit", month: "numeric",
                                day: "numeric"
                            }) }}</div>
                        </template>
                        <template #header-extra>
                            <n-avatar :src="expense.ownerPhotoUrl" round>
                            </n-avatar>
                        </template>
                        <template #description>
                            <div class="display-flex justify-between align-center">
                                <n-space size="small" style="margin-top: 4px">
                                    <n-tag :bordered="false" type="info" size="small">
                                        {{ expense.category }}
                                    </n-tag>
                                    <n-tag :bordered="false" type="info" size="small">
                                        {{ expense.halfHalfDivision ? 'Nominal' : 'Percentual' }}
                                    </n-tag>
                                </n-space>
                                <n-icon v-if="expense.ownerUid === sUser.user?.uid" @click="deleteExpense(expense.id!)" size="large" :component="DeleteOutlineFilled" class="cursor-pointer" />
                            </div>

                        </template>
                        <div class="display-flex justify-between f-size">
                            <div>{{ expense.description }}</div>
                            <div>{{ `R$ ${expense.value}` }}</div>
                        </div>
                    </n-thing>
                </n-list-item>
            </n-list>
        </n-collapse-item>
    </n-collapse>
</template>

<style scoped>
.f-size {
    font-size: 18px;
}

.person-data {
    padding: 1rem 0;
    border-bottom: 1px rgb(212, 212, 212) solid;
}

.person-result {
    padding: 1rem 0;
    margin-bottom: 1rem;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
}

.need-to-pay {
    background-color: rgba(208, 48, 80, 0.16);
}

.need-to-receive {
    background-color: rgba(24, 160, 88, 0.16);
}</style>
