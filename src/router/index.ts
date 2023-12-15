import { createRouter, createWebHistory } from 'vue-router'
import { getUser } from '../firebase/index'
 
import HomeView from '../views/HomeView.vue'
import AddView from '../views/AddView.vue'
import UserView from '../views/UserView.vue'
import Login from '../views/Login.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
        path: '/',
        name: 'home',
        component: HomeView,
    },
    {
        path: '/expense',
        name: 'expense',
        component: AddView,
    },
    {
        path: '/user',
        name: 'user',
        component: UserView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'notfound',
        component: NotFound,
      },
  ]
})

router.beforeEach(async (to,from, next) => {
    if(to.name !== 'login') {
        if(await getUser()) {
            next();
        }else {
            next('/login')
        }
    } else {
        if(!await getUser()) {
            next()
        } else {
            next('/');
        }
    }
    
});

export default router
