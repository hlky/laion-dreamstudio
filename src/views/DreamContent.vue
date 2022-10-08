<template>
  <div id="kt_content" class="content d-flex flex-column flex-column-fluid"  style="background: rgb(36, 36, 36);">
    <div class="post d-flex flex-column-fluid" >
      <div id="kt_content_container" class="container d-flex flex-column container-xxl"  style="height: calc(100vh - 100px); max-width: unset; position: relative;">
        <div  >
          <ImageCost />
          <MainDream v-if="credits > 0" />
          <div v-else>
            <div class="main-page" >
              <div style="width:50%" class="generated-wrapper" >
                <h3 style="color:#F5FEFF">Annotate images to get credits.</h3><br/>
                <h3 style="color:#F5FEFF">Credits: </h3><br/>
                <span><input disabled class="form-control" v-model="credits" /></span><br/>
                <h3 style="color:#F5FEFF">Word phrase:</h3><br/>
                <span><input size="100" rows="3" class="form-control" disabled v-model="word_phrase" /></span>
              </div>
            </div>
          </div>
          <div ></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import ImageCost from '@/components/ImageCost.vue'
import MainDream from '@/components/MainDream.vue'

export default {
  name: 'DreamContent',
  components: {
    ImageCost,
    MainDream
    
  },
  data: function() {
    return {
      word_phrase: '',
      credits: 0
    };
  },
  methods: {
    newSession: async function () {
      const response = await fetch("api/user/new", {
          method: "get",
          headers: {
              "Content-Type": "application/json; charset=UTF-8"
          }
      });
      const serverdata = await response.json();
      this.word_phrase = serverdata['word_phrase'];
    },
    getCredits: async function () {
      const userData = {word_phrase: this.word_phrase }
      const response = await fetch("api/user/credits", {
          method: "post",
          body: JSON.stringify(userData),
          headers: {
              "Content-Type": "application/json; charset=UTF-8"
          }
      });
      const serverdata = await response.json();
      this.credits = serverdata['credits'];
    },
  },
  async mounted() {
    if (localStorage.word_phrase) {
      this.word_phrase = localStorage.word_phrase;
    } else {
      await this.newSession();
    }
    await this.getCredits();
  },
  watch: {
    word_phrase(new_word_phrase) {
      localStorage.word_phrase = new_word_phrase;
    }
  }
}
</script>
