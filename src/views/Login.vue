<script setup lang="ts">
import firebase from 'firebase/compat/app';
import { getAuth } from 'firebase/auth';
import * as firebaseui from 'firebaseui'

import 'firebaseui/dist/firebaseui.css'
import { onMounted, ref } from 'vue';

const isLoading = ref(true);

onMounted(() => {
    var ui = new firebaseui.auth.AuthUI(getAuth());
    ui.start('#firebaseui-auth-container', {
        signInSuccessUrl: import.meta.env.VITE_REDIRECT_URL,
        signInOptions: [
            {
                provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                customParameters: {
                    // Forces account selection even when one account
                    // is available.
                    prompt: 'select_account'
                }
            }
        ],

        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.

                return true;
            },
            uiShown: function () {
                isLoading.value = false;
            }
        }
    });
})

</script>

<template>
    <div>
        <h1>Bem vindo ao Seu app de Finanças</h1>
        <div id="firebaseui-auth-container"></div>
    </div>
</template>

<style>
h1{
    text-align: center;
    margin-top: 10rem;
    margin-bottom: 10rem;
}
</style>