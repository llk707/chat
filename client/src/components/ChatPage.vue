<template>
  <v-layout column fill-height>
    <v-layout align-start fill-height>
      <v-flex xs10 fill-height ref="boxChatMess">
        <v-toolbar flat dense class="cyan" dark>
          <button @click="goBack" class="back-button">
            <svg-icon type="mdi" :path="pathBack"></svg-icon>
          </button>
          <v-toolbar-title>Комната: {{ roomName }} </v-toolbar-title>
        </v-toolbar>
        <messages-panel :room-id="roomId" ref="message"></messages-panel>
      </v-flex>
      <v-flex xs2 ml-2 class="elevation-10">
        <v-toolbar flat dense class="cyan" dark>
          <v-toolbar-title>Онлайн</v-toolbar-title>
        </v-toolbar>
        <v-flex>
          <v-list two-line>
            <template v-for="key in Object.keys(users)">
              <v-list-tile :key="key" avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{users[key] }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-avatar>
                  <img :src="'https://ui-avatars.com/api/?name=' + users[key] + '&background=0D8ABC&color=fff&rounded=true'" />
                </v-list-tile-avatar>
              </v-list-tile>
            </template>
          </v-list>
        </v-flex>
      </v-flex>
    </v-layout>
    <v-layout rows>
      <v-flex>
        <v-text-field v-model="newMessage" label="Сообщение..." single-line outline></v-text-field>
      </v-flex>
      <uploder :room-id="roomId"></uploder>
      <v-btn @click="sendMessage" color="primary" :disabled="!newMessage">Отправить</v-btn>
    </v-layout>
  </v-layout>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { db, socket } from '../main'

import { collection, addDoc, doc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore'

import MessagesPanel from '@/components/Messages'
import Uploder from '@/components/Uploder'

import SvgIcon from '@jamescoyle/vue-icon'
import { mdiKeyboardBackspace } from '@mdi/js'

export default {
  components: {
    MessagesPanel,
    Uploder,
    SvgIcon
  },

  data () {
    return {
      pathBack: mdiKeyboardBackspace,
      isAuthenticated: false,
      roomId: null,
      userId: null,
      currentUser: {
        name: ''
      },
      users: {},
      newMessage: '',
      messages: [] // Добавляем массив для хранения сообщений
    }
  },

  beforeRouteLeave (to, from, next) {
    if (from.name === 'ChatPage') {
      this.$socket.emit('disconnectFromRoom', { roomId: this.roomId })
    }
    next()
  },

  async mounted () {
    this.roomId = this.$route.params.roomId
    this.roomName = this.$route.query.roomName

    // Получаем данные авторизации из хранилища браузера
    this.userId = localStorage.getItem('userId')
    await this.getUserName(this.userId) // Получаем имя пользователя из Firestore

    const roomRef = doc(db, 'rooms', this.roomId)
    const messagesCollectionRef = collection(roomRef, 'messages')
    const messagesQuery = query(messagesCollectionRef, orderBy('timestamp'))

    var a = false
    onSnapshot(messagesQuery, (snapshot) => {
      if (a) return
      a = true
      this.messages = [] // Очистка массива сообщений

      snapshot.forEach((doc) => {
        const message = doc.data()

        // Добавление сообщения в массив messages
        this.messages.push({
          id: doc.id,
          message: message.message,
          senderId: message.userId,
          senderName: message.name,
          timestamp: message.timestamp
        })

        for (let i = 0; i < this.messages.length; i++) {
          this.$refs.message.items.push({
            id: this.messages[i].id,
            name: this.messages[i].senderName,
            text: this.messages[i].message,
            type: this.messages[i].senderId === this.userId ? 1 : 0
          })
        }
      })
    })

    this.$socket.emit('joinRoom', this.roomId, this.currentUser.name) // Отправка запроса на сервер для присоединения к комнате

    this.$root.$emit('setMm', this.$refs.boxChatMess.clientHeight)

    this.$root.$on('sendMessage', (data) => {
      if (data.message && data.cat) {
        this.$socket.emit('newMessage', {
          message: data.message,
          name: this.currentUser.name,
          cat: data.cat
        })
        this.$root.$emit('newMessage', { text: data.message, name: this.currentUser.name, type: 1, cat: data.cat })
      }
    })

    this.$socket.off('newMessage')

    this.$socket.on('newMessage', (data) => {
      this.$root.$emit('newMessage', { text: data.message, name: data.name, type: 0, cat: data.cat || 0 })
    })

    this.$socket.on('upUsers', (data) => {
      this.users = data
    })
  },

  methods: {
    async getUserName (userId) {
      try {
        const userDocRef = doc(db, 'chatUser', userId)
        const userDocSnapshot = await getDoc(userDocRef)

        this.originalUsername = userDocSnapshot.data().username || ''
        this.username = this.originalUsername // Устанавливаем текущее значение имени

        if (userDocSnapshot.exists()) {
          // Получаем имя пользователя из документа и присваиваем его переменной username
          this.username = userDocSnapshot.data().username
        } else {
          this.username = '' // Значение по умолчанию, если имя пользователя не найдено
        }

        this.currentUser.name = this.username // Обновляем значение имени текущего пользователя
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error)
      }
    },

    sendMessage () {
      if (!this.newMessage) return

      // Получите данные для отправки в Firestore
      const messageData = {
        userId: this.userId,
        name: this.currentUser.name,
        message: this.newMessage,
        timestamp: new Date().toISOString()
      }

      // Отправьте данные в Firestore
      const roomRef = doc(db, 'rooms', this.roomId)
      const messagesCollectionRef = collection(roomRef, 'messages')

      console.log(messageData, messagesCollectionRef, addDoc)

      addDoc(messagesCollectionRef, messageData)
        .then(() => {
          // Данные успешно записаны в Firestore
          console.log('Сообщение успешно записано в Firestore')
        })
        .catch((error) => {
          // Возникла ошибка при записи данных в Firestore
          console.error('Ошибка при записи сообщения в Firestore:', error)
        })

      // Отправляем сообщение через веб-сокет
      this.$root.$emit('newMessage', { text: this.newMessage, name: this.currentUser.name, type: 1 })
      this.$socket.emit('newMessage', {
        message: this.newMessage,
        name: this.currentUser.name,
        roomId: this.roomId

      })

      this.newMessage = ''
    },
    goBack () {
      this.$router.go(-1) // Переход на предыдущую страницу
    }
  }
}
</script>
