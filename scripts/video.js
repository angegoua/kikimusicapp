class AudioVisualiser {
    constructor(){
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer()
        this.camera = new THREE.PerspectiveCamera(45,aspect, 0.1, 10000)
    }

    setCamera(){
        
    }
}