//Three.js
import FirstPersonControls from './fpscontrols';
import {Howl, Howler} from 'howler';
FirstPersonControls(THREE);
// Event emitter implementation for ES6
import EventEmitter from 'event-emitter-es6';
import * as CANNON from 'cannon-es';

class VisualPhysicsObj {
  constructor(shape, body, mesh, position, velocity, linearDamping) { 
    this.shape = shape;
    this.body = body;
    this.body.position.copy(position);
    this.body.velocity.copy(velocity);
    this.body.linearDamping = linearDamping;

    this.body.addShape(this.shape);
    this.physMaterial = this.body.material;
    this.mesh = mesh;
  }

  updateVisual() {
    let position = this.body.position;
    let quaternion = this.body.quaternion;
    this.mesh.position.copy(position);
    this.mesh.quaternion.copy(quaternion);
  }

}

class Scene extends EventEmitter {
  
  constructor(domElement = document.getElementById('gl_context'),
              _width = window.innerWidth,
              _height = window.innerHeight,
              hasControls = true,
              clearColor = 'black'){

    //Since we extend EventEmitter we need to instance it from here
    super('MainScene');

    //THREE scene
    this.scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();

    // Init cannon.js
    this.cannonworld = new CANNON.World();     
    const cannonworld = this.cannonworld;
    cannonworld.gravity.set(0, -10, 0); 
    // Tweak contact properties.
    // Contact stiffness - use to make softer/harder contacts
    cannonworld.defaultContactMaterial.contactEquationStiffness = 1e6;
    // Stabilization time in number of timesteps
    cannonworld.defaultContactMaterial.contactEquationRelaxation = 10;
    // Max solver iterations: Use more for better force propagation, but keep in mind that it's not very computationally cheap!
    cannonworld.solver.iterations = 10;

    const plastic_texture = loader.load('resources/Plastic006_1K-JPG/Plastic006_1K_Color.jpg');
    plastic_texture.wrapS = THREE.RepeatWrapping; plastic_texture.wrapT = THREE.RepeatWrapping;
    plastic_texture.repeat.set( 1, 1 );
    const plastic_displacement = loader.load('resources/Plastic006_1K-JPG/Plastic006_1K_Displacement.jpg');
    plastic_displacement.wrapS = THREE.RepeatWrapping; plastic_displacement.wrapT = THREE.RepeatWrapping;
    plastic_displacement.repeat.set( 1, 1 );
    const plastic_normal = loader.load('resources/Plastic006_1K-JPG/Plastic006_1K_Normal.jpg');
    plastic_normal.wrapS = THREE.RepeatWrapping; plastic_normal.wrapT = THREE.RepeatWrapping;
    plastic_normal.repeat.set( 1, 1 );
    const plastic_roughness = loader.load('resources/Plastic006_1K-JPG/Plastic006_1K_Roughness.jpg');
    plastic_roughness.wrapS = THREE.RepeatWrapping; plastic_roughness.wrapT = THREE.RepeatWrapping;
    plastic_roughness.repeat.set( 1, 1 );

    
    let clack = new Howl({
      src: ['resources/clack_sound.ogg']
    });
    //this.clack.play();

    var scene = this;
    var loadDice = function(obj) {        
      console.log(obj.scene.children[2]);
      //scene.add(obj.scene.children[2]);
      const d10_mesh = obj.scene.children[2];
      const box1 = new VisualPhysicsObj(
        scene.createD10Hull(), 
        new CANNON.Body({ 
          mass: 1, 
          material: new CANNON.Material()
          }), 
        d10_mesh,
        new CANNON.Vec3(0, 10, 0),
        new CANNON.Vec3(5, 10, 0),
        0
        );
      box1.body.addEventListener("collide", function(e) {
        const clackid = clack.play();
        clack.volume(e.target.velocity.length() / 16, clackid);
      });
      scene.vpobjs.push(box1);
      scene.addToWorldAndScene(box1);
      scene.addContactMaterialBetween(box1, scene.ground1, 0.2, 0.4);
    }
  
    const gltfloader = new THREE.GLTFLoader();
    gltfloader.load(
      // resource URL
      'resources/ten_sided_dice.glb',
      // called when resource is loaded
      loadDice,
      // called when loading is in progresses
      function ( xhr ) {
    
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
      },
      // called when loading has errors
      function ( error ) {
    
        console.log( 'An error happened' );
        console.log( error );
    
      }
    );
                
 /*   this.box1 = new VisualPhysicsObj(
      new CANNON.Box(new CANNON.Vec3(1*0.5, 1*0.5, 1*0.5)), 
      new CANNON.Body({ 
        mass: 1, 
        material: new CANNON.Material()
        }), 
      new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshStandardMaterial({
          map: plastic_texture, 
          //displacementMap: fabric_displacement, 
          normalMap : plastic_normal, 
          roughnessMap: plastic_roughness })),
      new CANNON.Vec3(0, 10, 0),
      new CANNON.Vec3(0, 0, 0),
      0
      );*/


    const fabric_texture = loader.load('resources/Fabric024_1K-JPG/Fabric024_1K_Color.jpg');
    fabric_texture.wrapS = THREE.RepeatWrapping; fabric_texture.wrapT = THREE.RepeatWrapping;
    fabric_texture.repeat.set( 100, 100 );
    const fabric_displacement = loader.load('resources/Fabric024_1K-JPG/Fabric024_1K_Displacement.jpg');
    fabric_displacement.wrapS = THREE.RepeatWrapping; fabric_displacement.wrapT = THREE.RepeatWrapping;
    fabric_displacement.repeat.set( 100, 100 );
    const fabric_normal = loader.load('resources/Fabric024_1K-JPG/Fabric024_1K_Normal.jpg');
    fabric_normal.wrapS = THREE.RepeatWrapping; fabric_normal.wrapT = THREE.RepeatWrapping;
    fabric_normal.repeat.set( 100, 100 );
    const fabric_roughness = loader.load('resources/Fabric024_1K-JPG/Fabric024_1K_Roughness.jpg');
    fabric_roughness.wrapS = THREE.RepeatWrapping; fabric_roughness.wrapT = THREE.RepeatWrapping;
    fabric_roughness.repeat.set( 100, 100 );

    this.ground1 = new VisualPhysicsObj(
      new CANNON.Box(new CANNON.Vec3(100*0.5, 0.4*0.5, 100*0.5)), 
      new CANNON.Body({ 
        mass: 0, 
        material: new CANNON.Material()
        }), 
      new THREE.Mesh(
        new THREE.BoxGeometry(100, 0.4, 100),
        new THREE.MeshStandardMaterial({
          map: fabric_texture, 
          //displacementMap: fabric_displacement, 
          normalMap : fabric_normal, 
          roughnessMap: fabric_roughness, roughness: 0.9 })),
      new CANNON.Vec3(0, -1, 0),
      new CANNON.Vec3(0, 0, 0),
      0
      );
    
    this.vpobjs = [];
    //this.vpobjs.push(this.box1);
    this.vpobjs.push(this.ground1);

    //this.addContactMaterialBetween(this.box1, this.ground1, 0.2, 0.4);

    //Utility
    this.width = _width;
    this.height = _height;

    //THREE Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 2000);



    //THREE WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialiasing: true
    });

    this.renderer.setClearColor(new THREE.Color(clearColor));
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(this.width, this.height);

    //Push the canvas to the DOM
    domElement.append(this.renderer.domElement);

    if(hasControls){ 
      this.camera.position.set(-10,10,0);
      this.camera.lookAt(0,0,0);
      this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
      this.controls.lookSpeed = 0.1;
      this.controls.movementSpeed = 4.0;       
      this.controls.target.set(0,0,0);
    }

    //Setup event listeners for events and handle the states
    window.addEventListener('resize', e => this.onWindowResize(e), false);
    domElement.addEventListener('mouseenter', e => this.onEnterCanvas(e), false);
    domElement.addEventListener('mouseleave', e => this.onLeaveCanvas(e), false);
    window.addEventListener('keydown', e => this.onKeyDown(e), false);

    this.helperGrid = new THREE.GridHelper( 10, 10 );
    this.helperGrid.position.y = -0.5;
    this.scene.add(this.helperGrid);
    this.clock = new THREE.Clock();

    this.vpobjs.forEach(vpobj => this.addToWorldAndScene(vpobj));

  
    const hemilight = new THREE.HemisphereLight(0xB1E1FF, 0xB97A20, 0.8);
    this.scene.add(hemilight);  
    
    const spotlight = new THREE.SpotLight(0xFFFFFF);
    spotlight.position.set( 10, 100, 10 );
    spotlight.power = 3;
    this.scene.add(spotlight);
    
    this.update();
  }

  reroll() {
    console.log('reroll ');
    this.vpobjs[1].body.position.set(0, 10, 0);        
    this.vpobjs[1].body.velocity.set(5, 10, 0);
    this.vpobjs[1].updateVisual();
  }

  createD10Hull() {
    const vertices = [
      new CANNON.Vec3(0.000000, 0.0, 0.000000),
      new CANNON.Vec3(0.000000, -1.000000, 0.000000),
      new CANNON.Vec3(0.000000, 1.000000, 0.000000),
      new CANNON.Vec3(0.956982, -0.105573, 0.310942),
      new CANNON.Vec3(0.591447, 0.105573, 0.814058),
      new CANNON.Vec3(0.000000, -0.105573, 1.006231),
      new CANNON.Vec3(0.956982, 0.105573, -0.310942),
      new CANNON.Vec3(0.591447, -0.105573, -0.814058),
      new CANNON.Vec3(0.000000, 0.105573, -1.006231),
      new CANNON.Vec3(-0.591448, -0.105573, -0.814058),
      new CANNON.Vec3(-0.956982, 0.105573, -0.310943),
      new CANNON.Vec3(-0.956982, -0.105573, 0.310943),
      new CANNON.Vec3(-0.591448, 0.105573, 0.814058)
    ]
    /*const offset = -0.35
    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i]
      v.x += offset
      v.y += offset
      v.z += offset
    }*/
    return new CANNON.ConvexPolyhedron({
      vertices: vertices,
      faces: [
        [1, 3, 4, 5],
        [3, 1, 7, 6],
        [7, 1, 9, 8],
        [9, 1, 11, 10],
        [11, 1, 5, 12],
        [8, 2, 6, 7],
        [6, 2, 4, 3],
        [4, 2, 12, 5],
        [12, 2, 10, 11],
        [9, 10, 2, 8]
      ],
    })
  }


  addToWorldAndScene(vpobj) {
    this.cannonworld.addBody(vpobj.body);
    this.scene.add(vpobj.mesh);
  }

  addContactMaterialBetween(vpobj1, vpobj2, friction, restitution) {
    const contact_mat = new CANNON.ContactMaterial(vpobj1.physMaterial, vpobj2.physMaterial, { friction: friction, restitution: restitution })
    this.cannonworld.addContactMaterial(contact_mat);
  }

  drawUsers(positions, id){
    for(let i = 0; i < Object.keys(positions).length; i++){
      if(Object.keys(positions)[i] != id){
        this.users[i].position.set(positions[Object.keys(positions)[i]].position[0],
                                   positions[Object.keys(positions)[i]].position[1],
                                   positions[Object.keys(positions)[i]].position[2]);
      }
    }
  }

  update(){
    requestAnimationFrame(() => this.update());    
    const delta = this.clock.getDelta();
    this.cannonworld.step(delta*2);


    this.vpobjs.forEach(vpobj => vpobj.updateVisual());
    this.controls.update(delta);
    this.controls.target = new THREE.Vector3(0,0,0);
    this.render();
  }

  /*updatePhysics (){
    // Step world
    const timeStep = 1
    const now = Date.now() / 1000
    if (!this.lastCallTime) {
      // last call time not saved, cant guess elapsed time. Take a simple step.
      this.cannonworld.step(timeStep)
      this.lastCallTime = now
      return
    }

    let timeSinceLastCall = now - this.lastCallTime
    if (this.resetCallTime) {
      timeSinceLastCall = 0
      this.resetCallTime = false
    }

    this.cannonworld.step(timeStep, timeSinceLastCall, this.settings.maxSubSteps)

    this.lastCallTime = now
  }*/

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize(e) {
    this.width = window.innerWidth;
    this.height = Math.floor(window.innerHeight - (window.innerHeight * 0.3));
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  onLeaveCanvas(e){
    this.controls.enabled = false;
  }
  onEnterCanvas(e){
    this.controls.enabled = true;
  }
  onKeyDown(e){
    this.emit('userMoved');
  }
}

export default Scene;
