import Vue from 'vue'
import Router from 'vue-router'
import { requireAuth, requireNoAuth } from '../main'
import Start from '@/components/Start.vue'
import Login from '@/components/Login.vue'
import Register from '@/components/Register.vue'
import ChatPage from '@/components/ChatPage'
import Rooms from '@/components/Rooms'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/start',
      name: 'start',
      component: Start,
      beforeEnter: (to, from, next) => requireNoAuth(to, from, next)
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      beforeEnter: (to, from, next) => requireNoAuth(to, from, next)
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => requireNoAuth(to, from, next)
    },
    {
      path: '/rooms/:userId',
      name: 'rooms',
      component: Rooms,
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    },
    {
      path: '/rooms/:userId/chat/:roomId',
      name: 'chat',
      component: ChatPage,
      beforeEnter: (to, from, next) => requireAuth(to, from, next)
    }
  ]
})
