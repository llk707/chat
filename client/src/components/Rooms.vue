<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>
        <v-btn @click="openProfileModal" color="secondary">
          <svg-icon type="mdi" :path="pathAccount"></svg-icon>
        </v-btn>
        RooM chat
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-content>
      <v-container>
        <v-row>
          <v-col cols="12" md="6">
            <v-btn @click="openCreateRoomModal" color="primary">
              <svg-icon type="mdi" :path="pathAdd"></svg-icon>
            </v-btn>
            <v-btn @click="openAddRoomModal" color="primary">
              <svg-icon type="mdi" :path="pathSearch"></svg-icon>
            </v-btn>
          </v-col>
          <v-col cols="12" md="6">
            <v-card v-for="room in myRooms" :key="room.id" class="mt-3" style="    box-shadow: 0 0 24px rgba(30,30,30,.08); border-radius: 10px;">
              <button @click="deleteRoom(userId, roomId)">Удалить комнату</button>
              <v-card-title class="justify-center"><b>{{ room.name }}</b></v-card-title>
              <v-card-text>Room ID: {{ room.id }}</v-card-text>
              <div class="px-2 py-1">
              <v-btn @click="enterRoom(room.id, room.name, isAuthenticated, userId)" class="room-button" block small color="primary" outline>Войти</v-btn>
            </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-dialog v-model="addRoomModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          Добавить комнату
          <v-spacer></v-spacer>
          <v-btn icon @click="closeAddRoomModal">
            <svg-icon type="mdi" :path="pathClose"></svg-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="addRoomId" @input="searchRoom" :rules="nameRules" label="Введите ID комнаты"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="addRoom" color="primary" :disabled="!isRoomExists">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="createRoomModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          Создать комнату
          <v-spacer></v-spacer>
          <v-btn icon @click="closeCreateRoomModal">
            <svg-icon type="mdi" :path="pathClose"></svg-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="createRoomName" label="Название комнаты" :rules="nameRules"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="createRoom" color="primary" :disabled="createRoomName.trim() === ''">Создать</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="profileModal" persistent max-width="600px">
      <v-card>
        <v-card-title>
          Настройки профиля
          <v-spacer></v-spacer>
          <v-btn icon @click="closeProfileModal">
            <svg-icon type="mdi" :path="pathClose"></svg-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="username" @input="handleUsernameChange" :rules="nameRules" label="Имя пользователя"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="hasChanges" @click="saveProfile" color="primary">Сохранить</v-btn>
          <v-btn @click="logout" color="error">Выйти</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { db, auth } from '../main'
import { doc, collection, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore'

import SvgIcon from '@jamescoyle/vue-icon'
import { mdiHomeSearchOutline, mdiPlus, mdiAccountStarOutline, mdiClose } from '@mdi/js'

export default {
  name: 'MyComponent',
  components: {
    SvgIcon
  },
  data () {
    return {
      pathAccount: mdiAccountStarOutline,
      pathAdd: mdiPlus,
      pathSearch: mdiHomeSearchOutline,
      pathClose: mdiClose,
      myRooms: [],
      isRoomExists: false,
      searchedRoom: null,
      addRoomModal: false,
      addRoomId: '',
      createRoomModal: false,
      createRoomName: '',
      profileModal: false,
      username: '', // Имя пользователя
      originalUsername: '',
      isUsernameChanged: false,
      userId: null,
      nameRules: [
        value => !!value || 'Поле не может быть пустым'
      ]

    }
  },
  computed: {
    profileName () {
      return this.username || 'Имя пользователя не указано'
    },
    hasChanges () {
      return this.isUsernameChanged
    }
  },
  methods: {
    openAddRoomModal () {
      this.addRoomModal = true
    },

    closeAddRoomModal () {
      this.addRoomModal = false
      this.addRoomId = ''
    },
    async searchRoom () {
      try {
        const roomId = this.addRoomId.trim()

        if (!roomId) {
          console.error('Идентификатор комнаты не может быть пустым.')
          return
        }

        const roomDocRef = doc(db, 'rooms', roomId)
        const roomDocSnapshot = await getDoc(roomDocRef)

        if (roomDocSnapshot.exists()) {
          this.searchedRoom = {
            id: roomDocSnapshot.id,
            ...roomDocSnapshot.data()
          }
          this.isRoomExists = true
        } else {
          this.searchedRoom = null
          this.isRoomExists = false
          console.error('Комната не найдена.')
        }
      } catch (error) {
        console.error('Ошибка при поиске комнаты:', error)
      }
    },
    async addRoom () {
      try {
        if (this.isRoomExists) {
          const room = this.searchedRoom
          if (room) {
            const user = auth.currentUser
            if (user) {
              const userDocRef = doc(db, 'chatUser', user.uid)
              const roomUserCollectionRef = collection(userDocRef, 'roomsUser')

              // Проверка, не существует ли уже данная комната в коллекции пользователя
              const roomQuerySnapshot = await getDocs(roomUserCollectionRef)
              const roomExists = roomQuerySnapshot.docs.some((doc) => doc.data().id === room.id)
              if (roomExists) {
                console.error('Комната уже добавлена.')
                return
              }

              // Добавление комнаты в коллекцию "roomsUser"
              await addDoc(roomUserCollectionRef, {
                name: room.name,
                id: room.id
              })

              // Добавление ID пользователя в поле "users" в коллекции комнаты
              const roomDocRef = doc(db, 'rooms', room.id)
              const roomDocSnapshot = await getDoc(roomDocRef)
              if (roomDocSnapshot.exists()) {
                const roomData = roomDocSnapshot.data()
                const users = roomData.users || []
                users.push(user.uid)
                await updateDoc(roomDocRef, { users })
              }

              // Закрытие модального окна
              this.closeAddRoomModal()

              // Обновление списка чата
              await this.updateChatList()

              // Сброс флага isRoomExists
              this.isRoomExists = false

              console.log('Комната успешно добавлена')
            } else {
              console.error('Пользователь не аутентифицирован.')
            }
          } else {
            console.error('Комната не найдена.')
          }
        } else {
          console.error('Комната не существует.')
        }
      } catch (error) {
        console.error('Ошибка при добавлении комнаты:', error)
      }
    },
    async updateChatList () {
      try {
        // Получение списка комнат пользователя из коллекции "roomsUser"
        const user = auth.currentUser
        if (user) {
          const userDocRef = doc(db, 'chatUser', user.uid)
          const roomUserCollectionRef = collection(userDocRef, 'roomsUser')
          const roomUserQuerySnapshot = await getDocs(roomUserCollectionRef)

          // Обновление списка комнат чата
          this.myRooms = roomUserQuerySnapshot.docs.map(doc => doc.data())
        }
      } catch (error) {
        console.error('Ошибка при обновлении списка чата:', error)
      }
    },

    openCreateRoomModal () {
      this.createRoomModal = true
    },
    closeCreateRoomModal () {
      this.createRoomModal = false
      this.createRoomName = ''
    },
    async createRoom () {
      try {
        if (this.createRoomName.trim() === '') {
          console.error('Имя комнаты не может быть пустым')
          return
        }

        const room = {
          name: this.createRoomName
        }

        const user = auth.currentUser
        if (user) {
          const userDocRef = doc(db, 'chatUser', user.uid)

          room.creator = user.uid

          const newRoomDocRef = await addDoc(collection(db, 'rooms'), room)

          const roomUserCollectionRef = collection(userDocRef, 'roomsUser')
          await addDoc(roomUserCollectionRef, {
            name: room.name,
            id: newRoomDocRef.id
          })

          this.myRooms.push({ id: newRoomDocRef.id, ...room })

          this.createRoomName = ''
          this.createRoomModal = false
        } else {
          console.error('Пользователь не аутентифицирован.')
        }
      } catch (error) {
        console.error('Ошибка при создании комнаты:', error)
      }
    },

    deleteRoom (userId, roomId) {
      const userDocRef = doc(db, 'chatUser', userId)
      const roomUserCollectionRef = collection(userDocRef, 'roomsUser')
      const roomDocRef = doc(roomUserCollectionRef, roomId)

      deleteDoc(roomDocRef)
        .then(() => {
          console.log('Комната успешно удалена')

          // Обновление списка комнат в компоненте
          this.myRooms = this.myRooms.filter((room) => room.id !== roomId)
        })
        .catch((error) => {
          console.error('Ошибка при удалении комнаты:', error)
        })
    },

    openProfileModal () {
      this.profileModal = true
    },
    closeProfileModal () {
      this.profileModal = false
      this.username = this.originalUsername // Восстанавливаем исходное значение имени
      this.isUsernameChanged = false
    },
    handleUsernameChange () {
      if (this.username.toLowerCase() !== this.originalUsername.toLowerCase()) {
        this.isUsernameChanged = true
      } else {
        this.isUsernameChanged = false
      }
      // Проверяем, является ли поле имени пустым
      if (!this.username) {
        this.isUsernameChanged = false
      }
    },
    async saveProfile () {
      const user = auth.currentUser
      if (user) {
        try {
          const userDocRef = doc(db, 'chatUser', user.uid)
          const userDocSnapshot = await getDoc(userDocRef)

          // Получаем исходное значение имени пользователя
          const originalUsername = userDocSnapshot.data().username || ''

          if (this.username !== originalUsername) {
            // Выполняем действия только если имя было изменено
            await setDoc(userDocRef, { username: this.username }, { merge: true })
            this.isUsernameChanged = true

            // Обновляем оригинальное значение имени пользователя
            this.originalUsername = this.username
          }
        } catch (error) {
          console.error('Ошибка при сохранении профиля:', error)
        }
      }
      console.log('Имя пользователя:', this.username)
      this.closeProfileModal()
    },
    async logout () {
      // Очистка данных авторизации в localStorage
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('userId')
      // Выход из профиля
      try {
        await auth.signOut()
        // Перенаправляем пользователя на страницу входа
        this.$router.push('/login')
      } catch (error) {
        console.error('Ошибка при выходе из профиля:', error)
      }
    },
    enterRoom (roomId, roomName) {
      // Проверка авторизации пользователя
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

      if (!isAuthenticated || !this.userId) {
        // Пользователь не авторизован, перенаправляем на страницу авторизации
        this.$router.push('/login')
      } else {
        // Пользователь авторизован, переходим в комнату
        this.$router.push({
          path: '/rooms/' + this.userId + '/chat/' + roomId,
          query: { userId: this.userId, username: this.username, roomId: roomId, roomName: roomName }
        })
      }
    }
  },
  async mounted () {
    this.$socket.emit('disconnectFromRoom')
    // Получаем данные авторизации из хранилища браузера
    this.userId = localStorage.getItem('userId')

    // Использование данных авторизации для получения комнат пользователя из Firestore
    if (this.userId) {
      try {
      // Получение документа пользователя из Firestore
        const userDocRef = doc(db, 'chatUser', this.userId)
        const userDocSnapshot = await getDoc(userDocRef)

        if (userDocSnapshot.exists()) {
        // Получение подколлекции "roomsUser" пользователя
          const roomUserCollectionRef = collection(userDocRef, 'roomsUser')
          const roomUserSnapshot = await getDocs(roomUserCollectionRef)

          // Преобразование снимка комнат в массив объектов комнат
          const rooms = roomUserSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))

          // Присваиваем полученные комнаты переменной myRooms
          this.myRooms = rooms
        }
      } catch (error) {
        console.error('Ошибка при загрузке комнат пользователя:', error)
      }
    }

    // Получаем текущего авторизованного пользователя
    const user = auth.currentUser
    if (user) {
      try {
      // Получаем документ пользователя
        const userDocRef = doc(db, 'chatUser', user.uid)
        const userDocSnapshot = await getDoc(userDocRef)

        this.originalUsername = userDocSnapshot.data().username || ''
        this.username = this.originalUsername // Устанавливаем текущее значение имени

        if (userDocSnapshot.exists()) {
        // Получаем имя пользователя из документа и присваиваем его переменной username
          this.username = userDocSnapshot.data().username
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error)
      }
    }

    // Слушаем изменения авторизации
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
        // Получаем документ пользователя
          const userDocRef = doc(db, 'chatUser', user.uid)
          const userDocSnapshot = await getDoc(userDocRef)

          if (userDocSnapshot.exists()) {
          // Получаем имя пользователя из документа и присваиваем его переменной username
            this.username = userDocSnapshot.data().username
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных пользователя:', error)
        }
      }
    })
  }
}
</script>
