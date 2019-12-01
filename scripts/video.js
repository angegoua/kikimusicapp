









class AudioVisualiser {
    constructor() {
        //Defining variables
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer()
        this.canvas = document.createElement("canvas")
        this.ctx = this.canvas.getContext("2d")
        this.video = document.querySelector('.video')
        this.camera
        this.clock
        this.width
        this.height
        this.particles
        this.videoWidth
        this.videoHeight
        this.imageCache
        this.audio
        this.analyser
        this.fftSize = 2048
        this.frequencyRange = {
            bass: [20, 140],
            lowMid: [140, 400],
            mid: [400, 2600],
            highMid: [2600, 5200],
            treble: [5200, 14000]
        }

        this.initApp()
        // this.setCamera()
        // this.setVideo()
        // this.setAudio()
        // this.draw()
        // this.getFrequencyRangeValue()
    }


    initApp() {
        this.scene.background = new THREE.Color(0x060025)
        const ipad = document.querySelector('.ipad')
        ipad.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock()

        this.setCamera()
        // this.onResize()

        navigator.mediaDevices ? {
            getUserMedia: (c) => {
                return new Promise((y, n) =>{
                    (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
                })
            }
        } : null

        if (navigator.mediaDevices) {
            this.setAudio()
            this.setVideo()
        } 
        else {
            showAlert()
        }
        this.draw()
    }

    setCamera() {
        const fov = 45;
        const aspect = this.width / this.height;

        this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 10000);
        const z = Math.min(window.innerWidth, window.innerHeight);
        this.camera.position.set(0, 0, z)
        this.camera.lookAt(0, 0, 0)

        this.scene.add(this.camera)
    }

    setVideo() {
        this.video.autoplay = true //no problem cause the video is mute. See option below
        // const option = {
        const video = true
        const audio = false //We set audio false to be able to autoplay
        // }
        navigator.mediaDevices.getUserMedia({
                video,
                audio
            })
            .then((stream) => {
                this.video.srcObject = stream;
                this.video.addEventListener("loadeddata", () => {
                    this.videoWidth = this.video.videoWidth;
                    this.videoHeight = this.video.videoHeight;

                    this.setParticles()
                });
            })
            .catch((error) => {
                console.log(error);
                // showAlert();
            });
    }

    setAudio() {
        const audioListener = new THREE.AudioListener();
        this.audio = new THREE.Audio(audioListener)
        const audioLoader = new THREE.AudioLoader()

        audioLoader.load('assets/chocolat.mp3', (buffer) => {
            this.audio.setBuffer(buffer)
            this.audio.setLoop(true)
            this.audio.setVolume(0.5)
            this.audio.play()
        })

        this.analyser = new THREE.AudioAnalyser(this.audio, this.fftSize);

        //To launch music
        document.body.addEventListener('click', () => {
            if (this.audio) {
                if (this.audio.isPlaying) {
                    this.audio.pause()
                } else {
                    this.audio.play()
                }
            }
        })
    }

    setParticles() {
        const imageData = this.getImageData(this.video);
        const geometry = new THREE.Geometry();
        geometry.morphAttributes = {}; // This is necessary to avoid error.
        const material = new THREE.PointsMaterial({
            size: 1,
            color: 0x060025,
            sizeAttenuation: false
        })

        for (let y = 0, height = imageData.height; y < height; y += 1) {
            for (let x = 0, width = imageData.width; x < width; x += 1) {
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

    getImageData(image, useCache) {
        if (useCache && this.imageCache) {
            return imageCache;
        }

        const w = image.videoWidth;
        const h = image.videoHeight;

        this.canvas.width = w;
        this.canvas.height = h;

        this.ctx.translate(w, 0);
        this.ctx.scale(-1, 1);

        this.ctx.drawImage(image, 0, 0);
        this.imageCache = this.ctx.getImageData(0, 0, w, h);

        return this.imageCache
    }

    getFrequencyRangeValue( data, _frequencyRange ) {
        const nyquist = 48000 / 2;
        const lowIndex = Math.round(_frequencyRange[0] / nyquist * data.length);
        const highIndex = Math.round(_frequencyRange[1] / nyquist * data.length);
        let total = 0;
        let numFrequencies = 0;

        for (let i = lowIndex; i <= highIndex; i++) {
            total += data[i];
            numFrequencies += 1;
        }
        return total / numFrequencies / 255;
    }

    draw(t) {
        // this.clock.getDelta();
        // const time = this.clock.elapsedTime;
    
        let r, g, b;
    
        // audio
        if (this.analyser) {
            
            // analyser.getFrequencyData() would be an array with a size of half of fftSize.
            const data = this.analyser.getFrequencyData();
    
            const bass = this.getFrequencyRangeValue(data, this.frequencyRange.bass)
            const mid = this.getFrequencyRangeValue(data, this.frequencyRange.mid)
            const treble = this.getFrequencyRangeValue(data, this.frequencyRange.treble)
    
            r = bass;
            g = mid;
            b = treble;
        }
    
        // video
        if (this.particles) {
            this.particles.material.color.r = 1 - r;
            this.particles.material.color.g = 1 - g;
            this.particles.material.color.b = 1 - b;
    
            const density = 2;
            const useCache = parseInt(t) % 2 === 0;  // To reduce CPU usage.
            const imageData = getImageData(video, useCache);
            for (let i = 0, length = particles.geometry.vertices.length; i < length; i++) {
                const particle = particles.geometry.vertices[i];
                if (i % density !== 0) {
                    particle.z = 10000;
                    continue;
                }
                let index = i * 4;
                let gray = (imageData.data[index] + imageData.data[index + 1] + imageData.data[index + 2]) / 3;
                let threshold = 300;
                if (gray < threshold) {
                    if (gray < threshold / 3) {
                        particle.z = gray * r * 5;
    
                    } else if (gray < threshold / 2) {
                        particle.z = gray * g * 5;
    
                    } else {
                        particle.z = gray * b * 5;
                    }
                } else {
                    particle.z = 10000;
                }
            }
            particles.geometry.verticesNeedUpdate = true;
        }
    
        this.renderer.render(this.scene, this.camera);
    
        requestAnimationFrame(this.draw);
    }
}

const audioVisualiser = new AudioVisualiser()