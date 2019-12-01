class AudioVisualiser {
    constructor() {
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer()
        this.aspect = window.innerWidth / window.innerHeight
        this.camera = new THREE.PerspectiveCamera(45, this.aspect, 0.1, 10000)
        this.video = document.querySelector('.video')
        this.videoWidth = this.video.videoWidth
        this.videoHeight = this.video.videoHeight
        this.fftSize = 2048
        this.particles


        this.setCamera()
        this.setVideo()
        this.setAudio()
    }

    setCamera() {
        const z = Math.min(window.innerWidth, window.innerHeight);
        this.camera.position.set(0, 0, z)
        this.camera.lookAt(0, 0, 0)

        this.scene.add(this.camera)
    }

    getImageData(image, useCache) {
        if (useCache && imageCache) {
            return imageCache;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")
        const w = image.videoWidth;
        const h = image.videoHeight;

        canvas.width = w;
        canvas.height = h;

        ctx.translate(w, 0);
        ctx.scale(-1, 1);

        ctx.drawImage(image, 0, 0);
        const imageCache = ctx.getImageData(0, 0, w, h);

        return imageCache;
    }

    setVideo() {
        this.video.autoplay = true

        const option = {
            video: true,
            audio: false
        }
        navigator.mediaDevices.getUserMedia(option)
            .then((stream) => {
                this.video.srcObject = stream;
                this.video.addEventListener("loadeddata", () => {
                    const videoWidth = this.video.videoWidth;
                    const videoHeight = this.video.videoHeight;

                    this.setParticles()
                });
            })
            .catch((error) => {
                console.log(error);
                showAlert();
            });
    }

    setAudio() {
        //Defining constants
        const audioListener = new THREE.AudioListener()
        const audio = new THREE.Audio(audioListener)
        const analyser = new THREE.AudioAnalyser(audio, this.fftSize) //fftSize = 2048 default
        const audioLoader = new THREE.AudioLoader()

        audioLoader.load('assets/chocolat.mp3', (buffer) => {
            audio.setBuffer(buffer)
            audio.setLoop(true)
            audio.setVolume(0.5)
            audio.play()
        })

        document.addEventListener('click', () => {
            if (audio) {
                audio.isPlaying ? audio.pause() : audio.play()
            }
        })
    }

    setParticles() {
        const imageData = this.getImageData(this.video)
        const geometry = new THREE.Geometry();
        geometry.morphAttributes = {}; // This is necessary to avoid error.
        const material = new THREE.PointsMaterial({
            size: 1,
            color: 0x060025,
            sizeAttenuation: false
        });

        for (let y = 0; y < imageData.height; y += 1) {
            for (let x = 0; x < imageData.width; x += 1) {
                const vertex = new THREE.Vector3(
                    x - imageData.width / 2,
                    imageData.height / 2 - y,
                    0
                );
                geometry.vertices.push(vertex);
            }
        }

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
}

const audioVisualiser = new AudioVisualiser()