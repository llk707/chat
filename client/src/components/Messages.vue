<template>
  <v-layout justify-end column>
    <v-flex style="overflow-y: scroll; height:100px" ref="boxChatMess2" >
      <v-list two-line>
        <template v-for="(item) in items">
          <v-list-tile
            :key="item.title"
            avatar class="mes">
            <v-list-tile-avatar v-if="item.type === 0">
              <img :src="'https://ui-avatars.com/api/?name='+item.name+'&background=0D8ABC&color=fff&rounded=true'">
            </v-list-tile-avatar>
            <v-list-tile-content v-bind:class="(item.type === 0 ? 'text-xs-left' : 'text-xs-right')">
              <v-list-tile-title v-html="(item.type === 0 ? item.name : '')" v-bind:class="(item.type === 0 ? 'text-xs-left' : 'text-xs-right')"></v-list-tile-title>
              <v-list-tile-sub-title>
                <p>
                  <span class='text--primary' v-if="(!item.cat || item.cat == 0)">
                    {{item.text}}
                  </span>
                </p>
                <v-flex v-if="item.cat || item.cat == 1">
                  <v-btn :href="item.text" target="_blank">
                    <v-icon>link</v-icon> Файл
                  </v-btn>
                </v-flex>
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-avatar v-if="item.type === 1">
              <img :src="'https://ui-avatars.com/api/?name='+item.name+'&background=0D8ABC&color=fff&rounded=true'">
            </v-list-tile-avatar>
          </v-list-tile>
        </template>
      </v-list>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  mounted () {
    this.$root.$on('newMessage', (data) => {
      this.items.push(data)
    })
    this.$root.$on('setMm', (m) => {
      m -= 60
      this.$refs.boxChatMess2.style.height = m + 'px'
    })
  },
  updated () {
    var elem = this.$refs.boxChatMess2
    elem.scrollTop = elem.scrollHeight
  },
  data () {
    return {
      items: [
        {
          name: 'admin',
          text: 'Добро пожаловать в чат!',
          type: 0
        }
      ]
    }
  }
}
</script>

<style scoped>
.mes {
    margin-top: 25px;
    font-size: 21px;
    text-align: center;

    -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
       -moz-animation: fadein 1s; /* Firefox < 16 */
        -ms-animation: fadein 1s; /* Internet Explorer */
         -o-animation: fadein 1s; /* Opera < 12.1 */
            animation: fadein 1s;
}

@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Opera < 12.1 */
@-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}
</style>
