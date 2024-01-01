import type { DocumentReference } from "firebase/firestore";

export interface Data {
    id: string;
    ref: DocumentReference
}

export interface userInfo {
    uid: string;
    name: string;
    email: string;
    photoUrl: string;
}

export interface Expense {
    id?: string;
    ref?: DocumentReference,
    date: number,
    month: number,
    year: number,
    value: number | null,
    description: string,
    category: string,
    creditCard: boolean,
    halfHalfDivision: boolean,
    expenseGroupMonth: DocumentReference | null | undefined,
    readers: string[],
    ownerUid: string,
    ownerPhotoUrl: string
}


export interface ExpenseGroup extends Data {
    groupName: string;
    collaborators: string[];
    collaboratorsData: userInfo[];
    invitedPeople: string[];
    ownerUid: string;
}

export interface MonthCollabUser {
    uid: string;
    photoUrl: string;
    remuneration: number;
}

export interface MonthGroup extends Data {
    collaborators: MonthCollabUser[],
    expenseGroup: DocumentReference | null | undefined,
    month: number,
    year: number,
}

export interface PersonalInformation extends Data {
    uid: string;
    remuneration: number;
    currentGroup: DocumentReference;
}

export interface CollaboratorResult {
    collaborator: MonthCollabUser,
    expenses: Expense[],
    result: number,
}