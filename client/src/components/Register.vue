<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm7>
      <v-card min-width="400">
        <v-card-title>
          <h2>Регистрация</h2>
        </v-card-title>
        <v-form @submit.prevent="register">
          <v-text-field v-model="email" label="Электронная почта" type="email" required :rules="emailRules" :error-messages="getEmailErrors"></v-text-field>
          <v-text-field v-model="password" label="Пароль" type="password" :rules="passwordRules" :class="{ 'error--text': !isPasswordValid }"></v-text-field>
          <v-text-field v-model="confirmPassword" label="Подтверждение пароля" type="password" required :rules="confirmPasswordRules" :error-messages="confirmPasswordErrors"></v-text-field>
          <v-btn type="submit" color="primary" :disabled="!isFormValid">Зарегистрироваться</v-btn>
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
import { doc, setDoc, getFirestore } from 'firebase/firestore'

export default {
  data () {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      isPasswordValid: true // Добавлено свойство для проверки валидности пароля
    }
  },
  created () {
    // Инициализация Firebase App
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig)
    }
  },
  computed: {
    isFormValid () {
      return this.email && this.password && this.confirmPassword
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
    },
    confirmPasswordRules () {
      return [
        value => !!value || 'Подтвердите пароль',
        value => value === this.password || 'Пароли не совпадают'
      ]
    },
    getEmailErrors () {
      if (!this.isPasswordValid) {
        return ['Указанный адрес электронной почты недоступен или недействителен.']
      }
      return []
    },
    confirmPasswordErrors () {
      if (this.confirmPassword !== this.password) {
        return ['Пароли не совпадают']
      }
      return []
    }
  },
  methods: {
    register (event) {
      if (!this.isFormValid) {
        console.error('Пожалуйста, заполните все поля')
        return
      }

      event.preventDefault()

      firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
        .then(userCredential => {
          // Перенаправление на другую страницу
          this.$router.push('/login')
          // Отправка подтверждения на электронную почту
          const user = userCredential.user
          user.sendEmailVerification()
            .then(() => {
              console.log('Письмо с подтверждением отправлено')
            })
            .catch(error => {
              console.error('Ошибка при отправке письма с подтверждением:', error)
            })

          // Добавление пользователя в коллекцию "chatUser"
          const username = 'Имя пользователя'
          this.addUserToChatUserCollection(userCredential, username)
        })
        .catch(error => {
          if (error.code === 'auth/invalid-email') {
            this.isPasswordValid = false
          }
          console.error(error)
        })
    },
    async addUserToChatUserCollection (userCredential, username) {
      try {
        const user = userCredential.user
        const db = getFirestore()
        const userDocRef = doc(db, 'chatUser', user.uid)
        await setDoc(userDocRef, {
          username: username
        })
        console.log('Пользователь успешно добавлен в коллекцию "chatUser". ID документа:', userDocRef.id)
      } catch (error) {
        console.error('Ошибка при добавлении пользователя в коллекцию "chatUser":', error)
      }
    }
  }
}
</script>
