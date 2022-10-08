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
  }
}
</script>
