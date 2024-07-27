import Api from '@/services/Api'

export default {
  upload (formData) {
    return Api().post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
