import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'stats.js'

import World from './world'

class Game {
  scene = {}
  camera = {}
  stats = {}
  renderer = {}
  world = {}
  textures = {}

  constructor () {
    this.stats = new Stats()
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
    this.camera.position.set(20, 10, 20)

    this.scene = new THREE.Scene()

    const loader = new THREE.TextureLoader()
    this.textures.grassSide = loader.load('./textures/grass_block_side.png')
    this.textures.grassTop = loader.load('./textures/grass_block_top.png')
    this.textures.dirt = loader.load('./textures/dirt.png')
    this.textures.grassColorMap = loader.load('./textures/colormaps/grass.png')
    this.start()
  }

  animate () {
    this.stats.begin()
    this.renderer.render(this.scene, this.camera)
    document.getElementById('triangles').innerText = this.renderer.info.render.triangles
    this.stats.end()
  }

  start () {
    this.world = new World(this.textures)
    this.world.generateChunks()

    this.world.chunks.forEach((chunk) => {
      chunk.render(this.world.chunks)
      this.scene.add(chunk.object)
    })

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setAnimationLoop(() => {
      this.animate()
    })

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(0, 0, 0)

    document.body.appendChild(this.renderer.domElement)
  }
}

const game = new Game()

document.getElementById('wireframe').addEventListener('click', () => {
  game.world.chunks.forEach((c) => {
    c.blocks.forEach((b) => {
      b.toggleWireframe()
    })
  })
})
