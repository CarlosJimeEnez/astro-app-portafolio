import { Suspense, useDeferredValue, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, useFBX, AccumulativeShadows, RandomizedLight, Plane, Circle } from '@react-three/drei'
import tunnel from 'tunnel-rat'
import * as THREE from 'three'

const status = tunnel()

const TREE_MODEL_PATH = '/Polygonal_Tree_0505183923_texture_fbx/Polygonal_Tree_0505183923_texture.fbx'

export default function App() {
  return (
    <>
      <header>
        <status.Out />
      </header>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={2048} 
          shadow-bias={-0.0001}
        />
        <hemisphereLight color="white" groundColor="blue" intensity={0.5} />
        <group position={[0, 0, 0]}>
          <Suspense fallback={
            <status.In>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Cargando modelo...
              </div>
            </status.In>
          }>
            <TreeModel position={[0, 0, 0]} scale={0.03} castShadow />
            {/* Sombra circular */}
          <CircularShadow position={[0, -3, 0]} />
          </Suspense>
          
          
          
        </group>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </>
  )
}

// Componente para crear una sombra circular debajo del árbol
function CircularShadow({ position = [0, 0, 0], radius = 4, opacity = 0.4 }) {
  const materialRef = useRef();
  
  // Crear una textura con gradiente radial para la sombra
  useEffect(() => {
    // Crear un canvas para dibujar el gradiente
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Crear un gradiente radial
    const gradient = context.createRadialGradient(
      size / 2, size / 2, 0,           // Centro interno
      size / 2, size / 2, size / 2      // Centro externo y radio
    );
    
    // Configurar los colores del gradiente
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    // Aplicar el gradiente al canvas
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    // Crear una textura de Three.js a partir del canvas
    const texture = new THREE.CanvasTexture(canvas);
    
    // Aplicar la textura al material
    if (materialRef.current) {
      materialRef.current.map = texture;
      materialRef.current.needsUpdate = true;
    }
  }, []);
  
  return (
    <group position={position}>
      <Circle 
        rotation={[-Math.PI / 2, 0, 0]} 
        args={[radius, 32]}
      >
        <meshBasicMaterial 
          ref={materialRef}
          transparent 
          opacity={opacity}
          depthWrite={false}
        />
      </Circle>
    </group>
  );
}

function TreeModel(props) {
  // Usamos useFBX para cargar modelos en formato FBX
  const fbx = useFBX(TREE_MODEL_PATH)
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={fbx} {...props} />
}
