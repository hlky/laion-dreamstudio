<template>
  <div class="main-page" >
    <div class="generated-wrapper" >
      <button class="btn btn-primary settings" ><i class="bi bi-gear-wide-connected position-absolute active" ></i><i class="bi bi-x-circle position-absolute" ></i></button>
      <div class="row"  style="height: 100%;">
        <div v-if="!show_editor" class="image-area"  :style="imageArea">
          <slot v-if="generatedImages.length > 0"><ImageGenerated v-for="(image, index) in generatedImages" :key="index" :imageProp=image></ImageGenerated></slot>
          <slot v-else><ImageGenerated v-for="index in this.params['Number of Images']" :key="index"></ImageGenerated></slot>
        </div>
        <div class="col-auto col-lg-4 settings-wrapper" >
          <div class="action-buttons-wrapper">
            <button @click="closeEditor" v-if="show_editor" class="btn btn-primary settings settings-desktop is-active"><i class="bi bi-x-circle position-absolute active"></i></button>
            <!-- <button @click="closeSettings" v-else class="btn btn-primary settings settings-desktop is-active" ><i class="bi bi-gear-wide-connected position-absolute active"></i></button> -->
          </div>
          <div v-if="show_settings" class=""  style="height: 100%;">
            <div class="params params-desktop" >
              <div >
                  <div v-if="job_status.status != ''" id="job_status">
                    <h3>Job Status</h3>
                    <div className="param-slider">
                      <div className="param-desc">{{job_status.status}}</div>
                      <div className="param-desc" v-if="job_status.queue != 0">{{job_status.queue}}</div>
                    </div>
                  </div>
                  <ParamSlider @updateValue="updateParams"  param_name="Width" param_desc="The width of the generated image." :param_value=512 :param_max=1024 :param_min=512 :param_step=64 />
                  <ParamSlider @updateValue="updateParams"  param_name="Height" param_desc="The height of the generated image." :param_value=512 :param_max=1024 :param_min=512 :param_step=64 />
                  <ParamSlider @updateValue="updateParams"  param_name="Cfg Scale" param_desc="Cfg scale adjusts how much the image will be like your prompt. Higher values keep your image closer to your prompt." :param_value=7 :param_max=20 :param_min=0 :param_step=1 />
                  <ParamSlider @updateValue="updateParams"  param_name="Steps" param_desc="How many steps to spend generating (diffusing) your image." :param_value=50 :param_max=150 :param_min=10 :param_step=1 />
                  <ParamSlider @updateValue="updateParams"  param_name="Number of Images" param_desc="To generate multiple images from one prompt." :param_value=1 :param_max=9 :param_min=1 :param_step=1 />
                  <ParamSelect @updateValue="updateParams"  param_name="Sampler" param_desc="The diffusion sampling method. Default is 'k_lms'." param_value="k_lms" />
                  <ParamCheck  @updateValue="updateParams"  param_name="Seed" param_desc="The seed used to generate your image. Enable to manually set a seed." param_value="" :param_random_seed=true />
                  <div class="initial-image">
                    <h3>Image</h3>
                    <div class="editor-image" style="width: 75px; height: 75px; background: none;">
                        <div v-if="image_preview != ''" class="editor-image-preview" :style="previewImage()"></div>
                        <div v-else class="editor-image-preview" style="background-image:">None</div>
                    </div>
                    <div class="show-editor">
                        <button @click="showEditor" class="btn btn-primary">Show Editor</button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div :class="promptWrapper">
      <Editor @updatePreview="updatePreview" @closeEditor="closeEditor" :width="this.params['Width']" :height="this.params['Height']" v-if="show_editor"></Editor>
      <form  v-if="!show_editor" id="prompt-form" class="d-flex flex-column flex-lg-row align-items-center" >
        <ParamPrompt @updateValue="updateParams" param_name="Input Prompt" param_value="" />
        <ParamButton buttonText="Dream" @click="this.onGenerateWss"/>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import ParamSlider from './ParamSlider.vue'
import ParamCheck from './ParamCheck.vue'
import ImageGenerated from './ImageGenerated.vue'
import ParamButton from './ParamButton.vue'
import Editor from './Editor.vue'
import ParamSelect from './ParamSelect.vue'
import ParamPrompt from './ParamPrompt.vue'
import { createSelasClient, DiffusionConfig, Config } from 'selas';

export default {
  name: 'MainDream',
  components: {
    ParamSelect,
    ParamSlider,
    ParamCheck,
    ParamButton,
    ParamPrompt,
    ImageGenerated,
    Editor
  },
  computed: {
    imageArea() {
      const numImages = this.params['Number of Images'];
      let style = '';
      if (numImages <= 4) {
        style = 'display: grid; grid-template-columns: auto auto; grid-template-rows: auto auto;';
      } else if (numImages >= 5) {
        style = 'display: grid; grid-template-columns: auto auto auto; grid-template-rows: auto auto auto;';
      }
      return style;
    },
    promptWrapper() {
      let style = '';
      if (this.show_editor) {
        style = 'prompt-wrapper prompt-wrapper-mobile editor-is-showing';
      } else {
        style = 'prompt-wrapper prompt-wrapper-mobile';
      }
      return style;
    }
  },
  data () {
    return {
      generatedImages: [],
      word_phrase: '',
      auth_token: '',
      credits: 0,
      show_editor: false,
      image_preview: '',
      params: {
        'Width': 512,
        'Height': 512,
        'Cfg Scale': 7,
        'Steps': 50,
        'Number of Images': 1,
        'Sampler': 'k_lms',
        'Seed': '',
        'Input Prompt': ''
      },
      job_status: {
          status: "",
          queue: 0
      },
      show_settings: true,
    }
  },
  methods: {
    showEditor() {
      if (this.show_editor) {
        this.show_editor = false
      } else {
        this.show_editor = true
      }
    },
    closeSettings() {
      if (this.show_settings) {
        this.show_settings = false
      } else {
        this.show_settings = true
      }
    },
    closeEditor() {
      this.show_editor = false
    },
    updateParams(name, input) {
      this.params[name] = input;
      console.log(this.params);
    },
    previewImage() {
      return 'background-image: url(' + this.image_preview + ')';
    },
    updatePreview(image) {
      const svg = image;
      this.image_preview = svg;
    },
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
      this.auth_token = serverdata['token'];
    },
    updateImage(generatedImage) {
      console.log("updating image")
      this.generatedImages.push(generatedImage);
      console.log(this.generatedImages);
    },
    onGenerateWss() {
      this.generatedImages = [];
      this.generateWss({
        host: "wss://selas.dev/laion",
        prompt: this.params['Input Prompt'],
        width: this.params['Width'],
        height: this.params['Height'],
        cfgScale: this.params['Cfg Scale'],
        steps: this.params['Steps'],
        samples: this.params['Number of Images'],
      })
    },
    updateJobStatus(job_status) {
      this.job_status = job_status;
    },
    generateWss(params) {
      this.getCredits();
      console.log("Connecting")
      const client = createSelasClient();
      if (this.auth_token != '') {
        const DiffusionConfig = {
          prompt: params.prompt,
          width: params.width,
          height: params.height,
          cfgScale: params.cfgScale,
          steps: params.steps,
          samples: params.samples,
          onImage: (image) => {
            this.updateImage(image);
          },
          onJobStatus: (job_status) => {
            this.updateJobStatus(job_status);
          }
        }
        const Config = {
          diffusion: DiffusionConfig
        }
        client.postJob(Config, this.auth_token);
      }
      

    }
  },
}
</script>
