<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm7>
      <v-card min-width="400">
        <v-card-title>
          <h2>Авторизация</h2>
        </v-card-title>
        <v-form @submit.prevent="login">
          <v-text-field v-model="email" label="Электронная почта" type="email" required :rules="emailRules"></v-text-field>
          <v-text-field v-model="password" label="Пароль" type="password" :rules="passwordRules" :class="{ 'error--text': !isPasswordValid }"></v-text-field>
          <v-btn type="submit" color="primary" :disabled="!isFormValid">Войти</v-btn>
        </v-form>
     </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import { firebaseConfig } from '../main'
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

export default {
  data () {
    return {
      email: '',
      password: '',
      isPasswordValid: true // Добавлено свойство для проверки валидности пароля
    }
  },
  created () {
    // Инициализация Firebase App, если еще не произведена
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }
  },
  computed: {
    isFormValid () {
      return this.email && this.password
    },
    emailRules () {
      return [
        value => !!value || 'Введите адрес электронной почты',
        value => /.+@.+\..+/.test(value) || 'Введите корректный адрес электронной почты'
      ]
    },
    passwordRules () {
      return [
        value => !!value || 'Введите пароль',
        value => (value && value.length >= 6) || 'Пароль должен содержать минимум 6 символов'
      ]
    }
  },
  methods: {
    login () {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password)
        .then(userCredential => {
          // Дополнительные действия после успешной авторизации
          console.log('Авторизация успешна')

          // Получаем идентификатор пользователя
          const userId = userCredential.user.uid

          // Сохраняем данные авторизации в хранилище браузера
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('userId', userId)

          // Перенаправляем пользователя на страницу с комнатами, принадлежащими ему
          this.$router.push('/rooms/' + userId)
        })
        .catch((error) => {
          console.error(error)
          if (error.code === 'auth/user-not-found') {
            console.log('Пользователь не найден')
          } else if (error.code === 'auth/wrong-password') {
            console.log('Неверный пароль')
          } else {
            console.log('Ошибка входа')
          }
        })
    }
  }
}
</script>
