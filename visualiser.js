/*
  Hello dear Dev, I hope you are fine. This work below has been made by Ange Goua.
  It's an expermenting of three.js for a class project. BY THE WAY SOME COMMENTS IS JUST THRE JUST TO REMEMBER MYSELF HOW WORK THE THRREE.JS LIBS
  I tried to do it comprehensible.

  The following is not POO cause it was very complicated with the variables. I tried but to be the much clear in my code, i had to avoid the POO

  To see feature, read the readme.md
  You can look at my github on github.io/angegooua.

  Have Fun
*/

//Defining cvariables
let scene, renderer, camera, clock, width, height, video;
let particles, videoWidth, videoHeight, imageCache;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// AUDIO SETIINGS
let audio, analyser;
const fftSize = 2048;  //A value par default (Check MDN article on it)
const frequencyRange = {
    bass: [20, 140],
    lowMid: [140, 400],
    mid: [400, 2600],
    highMid: [2600, 5200],
    treble: [5200, 14000],
};

//THE INITIALIZATION FUNCTION
const init = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060025);
    renderer = new THREE.WebGLRenderer();
    document.querySelector('.ipad').appendChild(renderer.domElement);
    clock = new THREE.Clock();
    initCamera();
    onResize();

    //To ask the cam to the user
    navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
        getUserMedia: (c) => {
            return new Promise(function (y, n) {
                (navigator.mozGetUserMedia || navigator.webkitGetUserMedia).call(navigator, c, y, n);
            });
        }
    } : null);

    if (navigator.mediaDevices) {
        initAudio();
        initVideo();
    } else {
        alert('Cam not authorized ! Please allow the cam to have fun !')
    }

    draw();
};

//Cam setting 
const initCamera = () => {
    const fov = 45; //Observable angle
    const aspect = width / height; //To avoid flattening of the vue we take a rato of the window

    camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 10000); 
    const z = Math.min(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);

    scene.add(camera);
};


//setting of the video
const initVideo = () => {
    video = document.querySelector(".video");
    video.autoplay = true;

    const option = {
        video: true,
        audio: false
    };
    navigator.mediaDevices.getUserMedia(option)
        .then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadeddata", () => {
                videoWidth = video.videoWidth;
                videoHeight = video.videoHeight;

                createParticles();
            });
        })
        .catch((error) => {
            console.log(error);
            showAlert();
        });
};

const initAudio = () => {
    const audioListener = new THREE.AudioListener();
    audio = new THREE.Audio(audioListener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('assets/chocolat.mp3', (buffer) => {
        document.body.classList.remove(classNameForLoading);

        audio.setBuffer(buffer);
        audio.setLoop(true);
        audio.setVolume(0.5);
        audio.play();
    });

    analyser = new THREE.AudioAnalyser(audio, fftSize);

    document.body.addEventListener('click', function () {
        if (audio) {
            if (audio.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }
    });
};

const createParticles = () => {
    const imageData = getImageData(video);
    const geometry = new THREE.Geometry();
    geometry.morphAttributes = {};  // This is necessary to avoid error.
    const material = new THREE.PointsMaterial({
        size: 1,
        color: 0x060025,
        sizeAttenuation: false
    });

    for (let y = 0, height = imageData.height; y < height; y += 1) {
        for (let x = 0, width = imageData.width; x < width; x += 1) {
            const vertex = new THREE.Vector3(
                x - imageData.width / 2,
                -y + imageData.height / 2,
                0
            );
            geometry.vertices.push(vertex);
        }
    }


    particles = new THREE.Points(geometry, material);
    scene.add(particles);
};

//Canvas getImageData to have the image info
const getImageData = (image, useCache) => {
    if (useCache && imageCache) {
        return imageCache;
    }

    const w = image.videoWidth;
    const h = image.videoHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.translate(w, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(image, 0, 0);
    imageCache = ctx.getImageData(0, 0, w, h);

    return imageCache;
};

/**
 * https://github.com/processing/p5.js-sound/blob/v0.14/lib/p5.sound.js#L1765
 *
 * @param data
 * @param _frequencyRange
 * @returns {number} 0.0 ~ 1.0
 */

 //TO get the frequency value
const getFrequencyRangeValue = (data, _frequencyRange) => {
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
};

const draw = (t) => {
    clock.getDelta();
    const time = clock.elapsedTime;

    let r, g, b;

    // audio
    if (analyser) {
        // analyser.getFrequencyData() would be an array with a size of half of fftSize.
        const data = analyser.getFrequencyData();
        

        const bass = getFrequencyRangeValue(data, frequencyRange.bass);
        const mid = getFrequencyRangeValue(data, frequencyRange.mid);
        const treble = getFrequencyRangeValue(data, frequencyRange.treble);

        r = bass;
        g = mid;
        b = treble;
    }

    // video
    if (particles) {
        particles.material.color.r = 1 - r;
        particles.material.color.g = 1 - g;
        particles.material.color.b = 1 - b;

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

    renderer.render(scene, camera);

    requestAnimationFrame(draw);
};



const onResize = () => {
    width = window.innerWidth;
    height = window.innerHeight;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
};

window.addEventListener("resize", onResize);

init();
