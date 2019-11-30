//Create Box
// class Box {
//     constructor() {
//       this.size = .45;
//       this.geom = new RoundedBoxGeometry(this.size, this.size, this.size, .02, .2);
//       this.rotationX = 0;
//       this.rotationY = 0;
//       this.rotationZ = 0;
//     }
//   }

//Create Cone

class Cone {
  constructor() {
    this.geom = new THREE.ConeBufferGeometry(.3, .5, 32);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = radians(-180);
  }
}

//Create Cylinder
class Cylinder {
  constructor() {
    this.geom = new THREE.CylinderGeometry(.3, .3, .2, 64);
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = radians(-180);
  }
}

//Create Tourus

class Tourus {
  constructor() {
    this.size = .25;
    this.geom = new THREE.TorusGeometry(this.size, .08, 30, 200);
    this.rotationX = radians(90);
    this.rotationY = 0;
    this.rotationZ = 0;
  }
}

//Create converters values

const radians = (degrees) => {
  return degrees * Math.PI / 180;
}

const distance = (x1, y1, x2, y2) => {
  return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
}

const map = (value, start1, stop1, start2, stop2) => {
  return (value - start1) / (stop1 - start1) * (stop2 - start2) + start2
}


//STARTING

class App {

  constructor() {
    //Defining const which will be used in many methods
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });

    this.groupMesh = new THREE.Object3D();
    this.meshes = [];
    this.grid = {
      rows: 15,
      cols: 8
    };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.geometries = [
      new Cone(),
      new Tourus(),
      new Cylinder(),
      // new Box()
    ];

    this.raycaster = new THREE.Raycaster();

    //Calling methods
    this.createScene();
    this.createCamera();
    this.createGrid();
    this.addFloor();
    this.addAmbientLight();
    this.addSpotLight();
    this.addRectLight();
    this.addPointLight(0xffff00, {
      x: 0,
      y: 10,
      z: -100
    });
    this.addPointLight(0xff0000, {
      x: 100,
      y: 10,
      z: 0
    });
    this.addPointLight(0xff00ff, {
      x: 20,
      y: 5,
      z: 20
    });
    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.onMouseMove({
      clientX: 0,
      clientY: 0
    });
  }

  

  createScene() {

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);


    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const main = document.querySelector('main')
    main.appendChild(this.renderer.domElement);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 1);
    this.camera.position.set(0, 65, 0);
    this.camera.rotation.x = -1.57;

    this.scene.add(this.camera);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight('blue', 5);

    this.scene.add(light);
  }

  addSpotLight() {
    const ligh = new THREE.SpotLight('red', 10, 2000);

    ligh.position.set(0, 50, 0);
    ligh.castShadow = true;

    this.scene.add(ligh);
  }

  addRectLight() {
    const light = new THREE.RectAreaLight('pink', 1, 2000, 200);

    light.position.set(5, 50, 50);
    light.lookAt(0, 0, 0);

    this.scene.add(light);
  }

  addPointLight(color, position) {
    const light = new THREE.PointLight(color, 1, 1000, 1);

    light.position.set(position.x, position.y, position.z);

    this.scene.add(light);
  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShadowMaterial({
      opacity: .3
    });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.floor.rotateX(-Math.PI / 2);

    this.scene.add(this.floor);
  }

  getRandomGeometry() {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }

  createGrid() {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#060025',
      metalness: 0.6,
      roughness: 0.05,
    });

    const gutter = {
      size: 4
    };

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let index = 0; index < 1; index++) {
        const totalCol = this.getTotalRows(row);

        for (let col = 0; col < totalCol; col++) {
          const geometry = this.getRandomGeometry();
          const mesh = this.getMesh(geometry.geom, material);

          mesh.position.y = 0;
          mesh.position.x = col + (col * gutter.size) + (totalCol === this.grid.cols ? 0 : 2.5);
          mesh.position.z = row + (row * (index + .25));

          mesh.rotation.x = geometry.rotationX;
          mesh.rotation.y = geometry.rotationY;
          mesh.rotation.z = geometry.rotationZ;

          mesh.initialRotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z,
          };

          this.groupMesh.add(mesh);

          this.meshes[row][col] = mesh;
        }
      }
    }

    const centerX = -(this.grid.cols / 2) * gutter.size - 1;
    const centerZ = -(this.grid.rows / 2) - .8;

    this.groupMesh.position.set(centerX, 0, centerZ);

    this.scene.add(this.groupMesh);
  }

  getTotalRows(col) {
    return (col % 2 === 0 ? this.grid.cols : this.grid.cols - 1);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);

    const intersects = this.raycaster.intersectObjects([this.floor]);

    if (intersects.length) {
      const {
        x,
        z
      } = intersects[0].point;

      for (let row = 0; row < this.grid.rows; row++) {
        for (let index = 0; index < 1; index++) {
          const totalCols = this.getTotalRows(row);

          for (let col = 0; col < totalCols; col++) {
            const mesh = this.meshes[row][col];

            const mouseDistance = distance(x, z,
              mesh.position.x + this.groupMesh.position.x,
              mesh.position.z + this.groupMesh.position.z);

            const y = map(mouseDistance, 7, 0, 0, 6);
            TweenMax.to(mesh.position, .3, {
              y: y < 1 ? 1 : y
            });

            const scaleFactor = mesh.position.y / 1.2;
            
            const scale = scaleFactor < 1 ? 1 : scaleFactor;
            TweenMax.to(mesh.scale, .3, {
              ease: Expo.easeOut,
              x: scale,
              y: scale,
              z: scale,
            });

            TweenMax.to(mesh.rotation, .7, {
              ease: Expo.easeOut,
              x: map(mesh.position.y, -1, 1, radians(270), mesh.initialRotation.x),
              z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
              y: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.y),
            });
          }
          
        }
      }
    }
  }



  onMouseMove({
    clientX,
    clientY
  }) {
    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  animate() {
    this.draw();

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));
  }
}

new App()

// const tick = new Audio()
// tick.src = 'assets/tick.mp3'

// const playPromise = tick.play()


// if (playPromise !== undefined) {
//   playPromise.then(_ => {
//     // Automatic playback started!
//     // Show playing UI.
//     tick.currentTime = 0
//     tick.play()
//   })
//   .catch(error => {
//     // Auto-play was prevented
//     // Show paused UI.
//     tick.pause()

//   });
// }


const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', e => {
  cursor.setAttribute("style", "translate(" + (e.pageY - 10) + "px, (e.pageX - 10) "+ "px")
})