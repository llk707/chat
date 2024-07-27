// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import 'vuetify/dist/vuetify.min.css'
import Vuetify from 'vuetify'

import VueSocketio from 'vue-socket.io-extended'
import io from 'socket.io-client'

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAMUwLY0Zwgd41iCl9imO_11ogYd-r0CYo',
  authDomain: 'chat-entity.firebaseapp.com',
  databaseURL: 'https://chat-entity-default-rtdb.firebaseio.com',
  projectId: 'chat-entity',
  storageBucket: 'chat-entity.appspot.com',
  messagingSenderId: '130043461893',
  appId: '1:130043461893:web:e057f9f8a77d038d98f76c'
}

// Инициализация Firebase
const app = initializeApp(firebaseConfig)

export { firebaseConfig }
export const auth = getAuth(app)
export const db = getFirestore(app)

// Определение охранника
export const requireAuth = (to, from, next) => {
  // Проверка авторизации пользователя
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (isAuthenticated) {
    // Пользователь авторизован, разрешить переход
    next()
  } else {
    // Пользователь не авторизован, перенаправить на страницу авторизации
    next('/login')
  }
}

export const requireNoAuth = (to, from, next) => {
  // Проверка авторизации пользователя
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (isAuthenticated) {
    // Пользователь уже авторизован, перенаправить на страницу комнат
    next('/rooms/' + localStorage.getItem('userId'))
  } else {
    // Пользователь не авторизован, разрешить переход на страницу входа
    next()
  }
}

Vue.use(VueSocketio, io('192.168.0.116:3000'))

Vue.config.productionTip = false

Vue.use(Vuetify)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
