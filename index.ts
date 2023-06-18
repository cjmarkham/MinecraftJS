import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'

import World from './world'
import Chunk from './chunk'

class Game {
  public scene: THREE.Scene

  public camera: THREE.PerspectiveCamera

  private stats: Stats

  public renderer: THREE.WebGLRenderer

  public world: World

  private controls: OrbitControls

  private raycaster: THREE.Raycaster

  private pointer: THREE.Vector2 = new THREE.Vector2()

  constructor () {
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
    this.camera.position.set(2, 2, 2)

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('lightblue')

    this.start()
  }

  animate () {
    this.stats.begin()
    this.renderer.render(this.scene, this.camera)
    document.getElementById('drawCalls').innerText = this.renderer.info.render.calls
    this.stats.end()
  }

  start () {
    this.world = new World(this.scene)
    this.world.render()

    this.renderer = new THREE.WebGLRenderer({ antialias: false })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setAnimationLoop(() => {
      this.animate()
    })

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0, 0)

    document.body.appendChild(this.renderer.domElement)

    this.raycaster = new THREE.Raycaster()
    this.raycaster.setFromCamera(this.pointer, this.camera)

    window.addEventListener('pointermove', (e: PointerEvent) => {
      this.updateMousePosition(e)
    })
    window.addEventListener('click', (e: MouseEvent) => {
      this.onClick(e)
    })
  }

  updateMousePosition (event: PointerEvent) {
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1

    this.raycaster.setFromCamera(this.pointer, this.camera)
  }

  onClick (event: MouseEvent) {
    const intersects = this.raycaster.intersectObjects(this.scene.children)
    if (intersects.length === 0) {
      return
    }
    const chunk = intersects[0].object.userData.chunk
    console.log(chunk)
  }
}

const game = new Game()

const wireframeButton = document.getElementById('wireframe')
if (wireframeButton) {
  wireframeButton.addEventListener('click', () => {
    game.world.chunks.forEach((row: Array<Chunk>) => {
      row.forEach((chunk: Chunk) => {
        chunk.toggleWireframe()
      })
    })
  })
}
