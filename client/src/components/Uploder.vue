<template>
  <span>
    <v-btn icon @click='pickFile'>
      <v-icon >attach_file</v-icon>
    </v-btn>
    <input
      type="file"
      style="display: none"
      ref="image"
      accept="image/*"
      @change="onFilePicked" />
  </span>
</template>

<script>
import UploaderService from '@/services/UploaderService'

export default {
  data () {
    return {
      title: 'Image Upload',
      dialog: false,
      imageUrl: '',
      imageFile: '',
      file: null
    }
  },
  methods: {
    pickFile () {
      this.$refs.image.click()
    },
    async upload (formData) {
      try {
        const response = await UploaderService.upload(formData)
        console.log('SUCCESS!!!', response.data.url)
        this.$root.$emit('sendMessage', {message: response.data.url, cat: 1})
      } catch (err) {
        console.error(err)
      }
    },
    onFilePicked (e) {
      const files = e.target.files
      if (files[0] !== undefined) {
        this.file = files[0]

        if (files[0].name.lastIndexOf('.') <= 0) {
          return
        }

        const fr = new FileReader()
        fr.readAsDataURL(files[0])
        fr.addEventListener('load', () => {
          let formData = new FormData()
          formData.append('file', this.file)
          this.upload(formData)
        })
      } else {
        this.imageFile = ''
        this.imageUrl = ''
      }
    }
  }
}
</script>

<style scoped>
</style>
