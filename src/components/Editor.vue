<template>
<div class="editor-container" style="opacity: 1; filter: none;">
    <div class="editor-wrapper">
        <div class="editor-display-wrapper" style="">
            <div class="editor-display" :style="svgStyle">
                <div class="controls-horizontal controls-top">
                    <ControlSlider v-if="image_strength_visible" @updateValue="updateImageStrength" param_name="image_strength" param_desc="Image Strength" class="control control-slider image-strength" :param_value=50 :param_min=1 :param_max=99></ControlSlider>
                    <ControlSlider v-if="masking_controls_visible" @updateValue="updateBrushSize" param_name="brush_size" param_desc="Brush Size" class="control control-slider" :param_value=100 :param_min=1 :param_max=500></ControlSlider>
                    <ControlSlider v-if="masking_controls_visible" @updateValue="updateBrushBlur" param_name="brush_blur" param_desc="Brush Blur" class="control control-slider" :param_value=20 :param_min=0 :param_max=100></ControlSlider>
                    <ControlSlider v-if="masking_controls_visible" @updateValue="updateBrushStrength" param_name="brush_strength" param_desc="Brush Strength" class="control control-slider" :param_value=100 :param_min=1 :param_max=100></ControlSlider>
                    <ControlSlider v-if="masking_controls_visible" @updateValue="updateImageOpacity" param_name="image_opacity" param_desc="Image Opacity" class="control control-slider" :param_value=100 :param_min=0 :param_max=100></ControlSlider>
                </div>
                <div class="controls-vertical controls-left">
                    <a @click="setVisible('move')" title="Select and Move" :class=move_button_class>
                        <i class="bi bi-arrows-move"></i>
                    </a>
                    <a @click="setVisible('mask')" title="Masking" :class=mask_button_class>
                        <i class="bi bi-brush"></i>
                    </a>
                    <a @click="setVisible('restore')" title="Restore" :class=restore_button_class>
                        <i class="bi bi-bandaid"></i>
                    </a>
                    <a @click="setVisible('initial')" title="Initial Image Mode" :class=initial_image_button_class>
                        <i class="bi bi-arrow-left-right"></i>
                    </a>
                </div>
                <div v-if="!uploaded_image" class="placeholder"><div class="placeholder-icon"><i class="bi bi-image"></i></div> Upload an image to start! </div>
                <img ref="uploaded_image" class="uploaded-image">
                <canvas ref="canvas" :width="width" :height="height" style="position: absolute; opacity: 0;"></canvas>
                <div class="svg-wrapper" :style="svgStyle">
                    <svg class="svg-rendered" :width="width" :height="height"  overflow="hidden">
                        <defs>
                            <filter id="renderImageNoise" x="0" y="0" width="100%" height="100%">
                                <feTile in="SourceGraphic" x="50" y="50" width="100" height="100"></feTile>
                                <feTile></feTile>
                            </filter>
                        </defs>
                        <rect x="-1000" y="-1000" width="3000" height="3000" fill="black"></rect>
                        <svg :x="move_x" :y="move_y" :width="width" :height="height" :viewBox="viewBox" preserveAspectRatio="xMidYMid slice">
                            <defs v-if="svg_paths.length > 0">
                                <filter v-for="(item, index) in svg_paths" :key="index"
                                 :id="filterId('displayBlur', index)" x="-1000" y="-1000" width="3000" height="3000">
                                    <feGaussianBlur in="SourceGraphic" :stdDeviation="item.b/5"></feGaussianBlur>
                                </filter>
                                <filter id="renderImageNoise" x="0" y="0" width="100%" height="100%">
                                    <feTile in="SourceGraphic" x="50" y="50" width="100" height="100"></feTile>
                                    <feTile></feTile>
                                </filter>
                                <filter id="renderImageWhite">
                                    <feColorMatrix in="SourceGraphic" type="matrix" 
                                    values="1 1 1 1 0
                                            1 1 1 1 0
                                            1 1 1 1 0
                                            1 1 1 1 0"></feColorMatrix>
                                </filter>
                                <mask ref="renderMask" id="renderMask">
                                    <g :viewBox="viewBox" filter="url(#renderBlur0)">
                                        <rect x="-1000" y="-1000" width="3000" height="3000" fill="#FFFFFF" opacity="0"></rect>
                                        <path v-for="(item, index) in svg_paths" :key="index"
                                         :d="item.path"
                                         :filter="pathFilter('renderBlur', index)"
                                         :stroke-width="item.s"
                                         :opacity="item.o/100"
                                         :stroke="item.m=='mask'?'black':'white'"
                                         stroke-linejoin="round" stroke-linecap="round" fill="none"></path>
                                    </g>
                                </mask>
                            </defs>
                            <image opacity="0" ref="svg_image" x="0" y="0" width="100%" height="100%"
                             mask="url(#renderMask)" filter="url(#renderImageWhite)" preserveAspectRatio="xMidYMid slice"></image>
                        </svg>
                    </svg>
                </div>
                <div class="svg-wrapper" :style="svgStyle">
                    <svg ref="svg_display" class="svg-display" :width="width" :height="height"  overflow="hidden">
                        <svg :x="move_x" :y="move_y" :width="width" :height="height"  :viewBox="viewBox" preserveAspectRatio="xMidYMid slice">
                            <defs v-if="svg_paths.length > 0">
                                <filter v-for="(item, index) in svg_paths" :key="index"
                                 :id="filterId('displayBlur', index)" x="-1000" y="-1000" width="3000" height="3000">
                                    <feGaussianBlur in="SourceGraphic" :stdDeviation="item.b/5"></feGaussianBlur>
                                </filter>
                                <mask ref="displayMask" id="displayMask">
                                    <g :viewBox="viewBox">
                                        <rect x="-1000" y="-1000" width="3000" height="3000" fill="#FFFFFF"></rect>
                                        <path v-for="(item, index) in svg_paths"
                                        :key="index" :d="item.path"
                                        :filter="pathFilter('displayBlur', index)"
                                        :stroke-width="item.s"
                                        :opacity="item.o/100"
                                        :stroke="item.m=='mask'?'black':'white'"
                                        stroke-linejoin="round" stroke-linecap="round" fill="none"></path>
                                    </g>
                                </mask>
                            </defs>
                            <image :opacity="this.image_opacity/100" ref="svg_image_2" x="0" y="0" width="100%" height="100%"
                             mask="url(#displayMask)" preserveAspectRatio="xMidYMid slice"></image>
                        </svg>
                    </svg>
                </div>
                <div class="hidden-overflow"
                  @mousedown="startDrawing($event)"
                  @mouseup="stopDrawing($event)"
                  @mousemove="getMousePos($event)"
                  @mouseleave="getMousePos($event)"
                  @mouseenter="getMousePos($event)"
                  :style="cursorStyle" >
                    <Vue3DraggableResizable
                        :initW="move_w"
                        :initH="move_h"
                        v-model:x="move_x"
                        v-model:y="move_y"
                        v-model:w="move_w"
                        v-model:h="move_h"
                        :active="this.editor_mode=='move'?true:false"
                        :draggable="this.editor_mode=='move'?true:false"
                        :resizable="this.editor_mode=='move'?true:false"
                        ></Vue3DraggableResizable>
                        <!---->
                    <div class="editor-cursor" :style="cursor"></div>
                    
                </div>
                <div class="controls-vertical controls-right">
                    <a title="Undo" @click="undo()" class="btn btn-secondary">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </a>
                </div>
                <div class="controls-horizontal controls-bottom">
                    <button @click="closeEditor()" class="btn btn-secondary">
                        <i class="bi bi-arrow-left"></i>Back</button>
                    <!-- <a href="/faq#photo-editor" class="">
                        <button class="btn btn-secondary">
                            <i class="bi bi-question-circle"></i>Guide</button>
                    </a> -->
                    <button  @click="$refs.file.click()" class="btn btn-primary">
                        <i class="bi bi-upload"></i>Upload Image</button>
                    <input type="file" ref="file" v-on:change="onFileChange($event)" id="image-upload">
                </div>
            </div>
            <object aria-hidden="true" tabindex="-1" style="
                display: block !important; 
                position: absolute !important; 
                top: 0 !important; 
                left: 0 !important; 
                width: 100% !important; 
                height: 100% !important; 
                overflow: hidden !important; 
                pointer-events: none !important; 
                z-index: -1 !important; 
                opacity: 0 !important;" type="text/html" data="about:blank"></object>
        </div>
    </div>
</div>
</template>

<script lang="ts">
import ControlSlider from './ControlSlider.vue';
export default {
    name: "Editor",
    props: {
        width: {
            type: Number,
            default: 512
        },
        height: {
            type: Number,
            default: 512
        },
        
    },
    data: function () {
        return {
        image_strength_visible: true,
        masking_controls_visible: false,
        initial_image_button_class: "initial-image btn btn-primary",
        mask_button_class: "btn btn-secondary",
        restore_button_class: "btn btn-secondary",
        move_button_class: "btn btn-secondary",
        x: 0,
        y: 0,
        h: 100,
        w: 100,
        image_strength: 50,
        brush_size: 100,
        brush_blur: 20,
        brush_strength: 100,
        brush_mode: 'mask',
        editor_mode: 'initial',
        last_editor_mode: 'initial',
        image_opacity: 100,
        active: false,
        uploaded_image: '',
        is_drawing: false,
        start_x: 0,
        start_y: 0,
        points: [],
        svg_paths: [],
        move_x: 0,
        move_y: 0,
        move_w: 512,
        move_h: 512,
        previous_move_x: 0,
        previous_move_y: 0,
        previous_move_w: 512,
        previous_move_h: 512,
        path_index: 0,
        initial_width: 512,
        initial_height: 512,
        }
    },
    mounted() {
        this.$refs.uploaded_image.src =  '';
        this.initial_width = this.width;
        this.initial_height = this.height;

        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext("2d");
        this.ctx = ctx;
        this.canvas = canvas;
    },
    methods: {
        updateImageStrength(value) {
            this.image_strength = value;
        },
        updateBrushSize(value) {
            this.brush_size = value;
        },
        updateBrushBlur(value) {
            this.brush_blur = value;
        },
        updateBrushStrength(value) {
            this.brush_strength = value;
        },
        updateImageOpacity(value) {
            this.image_opacity = value;
        },
        undo() {
            this.svg_paths.pop();
        },
        resetMove() {
            this.previous_move_x = this.move_x;
            this.previous_move_y = this.move_y;
            this.previous_move_w = this.move_w;
            this.previous_move_h = this.move_h;
            this.move_x = 0;
            this.move_y = 0;
            this.move_w = this.initial_width;
            this.move_h = this.initial_height;
        },
        restoreMove() {
            this.move_x = this.previous_move_x;
            this.move_y = this.previous_move_y;
            this.move_w = this.previous_move_w;
            this.move_h = this.previous_move_h;
        },
        setVisible(control) {
            if (control == "mask") {
                if (this.last_editor_mode == "initial") {
                    this.restoreMove();
                }
                this.editor_mode = 'mask';
                this.last_editor_mode = 'mask';
                this.$refs.svg_image_2.setAttribute('mask', 'url(#displayMask)');
                this.brush_mode = "mask";
                this.image_strength_visible = false;
                this.masking_controls_visible = true;
                this.initial_image_button_class = "initial-image btn btn-secondary";
                this.mask_button_class = "btn btn-primary";
                this.restore_button_class = "btn btn-secondary";
                this.move_button_class = "btn btn-secondary";
                this.updatePreview();
            } else if (control == "initial") {
                this.resetMove();
                this.editor_mode = 'initial';
                this.last_editor_mode = 'initial';
                this.$refs.svg_image_2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.uploaded_image);
                this.$refs.svg_image_2.setAttribute('mask', '');
                this.image_strength_visible = true;
                this.masking_controls_visible = false;
                this.initial_image_button_class = "initial-image btn btn-primary";
                this.mask_button_class = "btn btn-secondary";
                this.restore_button_class = "btn btn-secondary";
                this.move_button_class = "btn btn-secondary";
                this.updatePreview();
            }  else if (control == "restore") {
                if (this.last_editor_mode == "initial") {
                    this.restoreMove();
                }
                this.editor_mode = 'restore';
                this.last_editor_mode = 'restore';
                this.$refs.svg_image_2.setAttribute('mask', 'url(#displayMask)');
                this.brush_mode = "restore";
                this.image_strength_visible = false;
                this.masking_controls_visible = true;
                this.initial_image_button_class = "initial-image btn btn-secondary";
                this.mask_button_class = "btn btn-secondary";
                this.restore_button_class = "btn btn-primary";
                this.move_button_class = "btn btn-secondary";
                this.updatePreview();
            }  else if (control == "move") {
                if (this.last_editor_mode == "initial") {
                    this.restoreMove();
                }
                this.editor_mode = 'move';
                this.last_editor_mode = 'move';
                this.$refs.svg_image_2.setAttribute('mask', 'url(#displayMask)');
                this.image_strength_visible = false;
                this.masking_controls_visible = false;
                this.initial_image_button_class = "initial-image btn btn-secondary";
                this.mask_button_class = "btn btn-secondary";
                this.restore_button_class = "btn btn-secondary";
                this.move_button_class = "btn btn-primary";
                this.updatePreview();
            }
        },
        getMousePos(event) {
            if (this.editor_mode == 'mask' || this.editor_mode == 'restore') {
                const rect = this.canvas.getBoundingClientRect();
                this.x =  (event.clientX - rect.left);
                this.y =  (event.clientY - rect.top);
                if (this.is_drawing) {
                    this.points.push({
                    x: (this.x),
                    y: (this.y),
                    j: 'L',
                    s: this.brush_size,
                    b: this.brush_blur,
                    o: this.brush_strength,
                    m: this.brush_mode
                    });
                    const M = this.points.filter((p) => p.j == 'M')[0];
                    const L = this.points.filter((p) => p.j == 'L');
                    const path = `M ${M.x} ${M.y} ${L.map((p) => `${p.j} ${p.x} ${p.y}`).join(' ')}`;
                    this.svg_paths[this.path_index] = {
                        path: path,
                        s: this.brush_size,
                        b: this.brush_blur,
                        o: this.brush_strength,
                        m: this.brush_mode,
                        f: this.image_opacity
                    };
                }
            }
        },
        closeEditor() {
            this.$emit('closeEditor');
        },
        stopDrawing() {
            if (this.editor_mode == 'mask' || this.editor_mode == 'restore') {
                this.is_drawing = false;
                if (this.points.length > 0) {
                    const M = this.points.filter((p) => p.j == 'M')[0];
                    const L = this.points.filter((p) => p.j == 'L');
                    const path = `M ${M.x} ${M.y} ${L.map((p) => `${p.j} ${p.x} ${p.y}`).join(' ')}`;
                    this.svg_paths[this.path_index] = {
                        path: path,
                        s: this.brush_size,
                        b: this.brush_blur,
                        o: this.brush_strength,
                        m: this.brush_mode,
                        f: this.image_opacity
                    };
                    this.points = [];
                    this.path_index++;
                    console.log(this.svg_paths);
                    this.updatePreview();
                }
            }
        },
        startDrawing(event) {
            if (this.editor_mode == 'mask' || this.editor_mode == 'restore') {
                const rect = this.canvas.getBoundingClientRect();
                this.x =  (event.clientX - rect.left);
                this.y =  (event.clientY - rect.top);
                this.is_drawing = true;
                this.start_x = this.x;
                this.start_y = this.x;
                this.points.push({
                    x: (this.x),
                    y: (this.y),
                    j: 'M',
                    s: this.brush_size,
                    b: this.brush_blur,
                    o: this.brush_strength,
                    m: this.brush_mode
                    });
                const path = `M ${this.x} ${this.y}`;
                this.svg_paths.push({
                    path: path,
                    s: this.brush_size,
                    b: this.brush_blur,
                    o: this.brush_strength,
                    m: this.brush_mode,
                    f: this.image_opacity
                });
            }
        },
        onFileChange(e) {
            const files = e.target.files || e.dataTransfer.files
            if (!files.length) {
            return
            }
            this.createImage(files[0])
        },
        createImage(file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                this.$refs.uploaded_image.src = e.target?.result;
                this.uploaded_image = e.target?.result;
                this.$refs.svg_image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.uploaded_image);
                this.$refs.svg_image_2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.uploaded_image);
                this.updatePreview();
            }
            reader.readAsDataURL(file); 
        },
        pathFilter(pathName, index) {
            return `url(#${pathName}${index})`;
        },
        filterId(pathName, index) {
            return `${pathName}${index}`;
        },
        updatePreview() {
            const svgString = new XMLSerializer().serializeToString(this.$refs.svg_display);
            const decoded = unescape(encodeURIComponent(svgString));
            const base64 = btoa(decoded);
            const svg = `data:image/svg+xml;base64,${base64}`;
            this.$emit("updatePreview", svg);
        },
    },
    computed: {
        cursor() {
            const E = `left: ${this.x}px; top: ${this.y}px;`,
                O = `width: ${this.brush_size}px;`,
                F = `height: ${this.brush_size}px;`,
                z = `filter: blur(${5*this.brush_blur/100}px);`,
                j = `border-width: ${Math.max(5,10*this.brush_blur/100)}px;`;
            let display = `display: block;`;
            if (this.editor_mode == "initial" || this.editor_mode == "move") {
                display = `display: none;`;
            }
            return `${display} ${E} ${O} ${F} ${z} ${j}`
        },
        cursorStyle() {
            let cursor = 'cursor: crosshair;';
            if (this.editor_mode == "initial" || this.editor_mode == "move") {
                cursor = `cursor: default;`;
            }
            return cursor;
        },
        viewBox() {
            return `0 0 ${this.width} ${this.height}`;
        },
        svgStyle() {
            return `width: ${this.width}px; height: ${this.height}px; transform: scale(1);`;
        },

    },
    components: { ControlSlider }
}
</script>