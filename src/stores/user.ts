import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User| null>()
  
  function setUser(u: User | null) {
    user.value = u
  }

  return { user, setUser }
})
