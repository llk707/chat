<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm7>
      <v-card min-width="400">
        <v-card-title>
          <h1>RooM chat</h1>
        </v-card-title>
        <v-form>
          <v-btn color="primary" @click="login">Вход</v-btn>
          <v-btn color="secondary" @click="register">Регистрация</v-btn>
        </v-form>
     </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  methods: {
    login () {
      this.$router.push('/login')
    },
    register () {
      this.$router.push('/register')
    }
  }
}
</script>
