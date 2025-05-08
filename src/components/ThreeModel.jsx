import { Suspense, useDeferredValue, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, useFBX, AccumulativeShadows, RandomizedLight, Plane, Circle } from '@react-three/drei'
import tunnel from 'tunnel-rat'
import * as THREE from 'three'

const status = tunnel()

// Make sure path matches exactly how files are served from public directory
const TREE_MODEL_PATH = '/Polygonal_Tree_0508015527_texture_fbx/Polygonal_Tree_0508015527_texture_fbx/Polygonal_Tree_0508015527_texture.fbx'
const BENCH_MODEL_PATH = '/Banca_de_madera__0508042822_texture_fbx/Banca_de_madera__0508042822_texture_fbx/Banca_de_madera__0508042822_texture.fbx'
const CAMPFIRE_MODEL_PATH = '/Campfire_Art_0508050240_texture_fbx/Campfire_Art_0508050240_texture_fbx/Campfire_Art_0508050240_texture.fbx'
const LOG_MODEL_PATH = '/Log_Illustration_0508051253_texture_fbx/Log_Illustration_0508051253_texture_fbx/Log_Illustration_0508051253_texture.fbx'
const LOG_MODEL_PATH2 = '/Log_Illustration_0508051253_texture_fbx/Log_Illustration_0508051253_texture_fbx/Log_Illustration_0508051253_texture.fbx'

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
            <TreeModel position={[-2.5, 0, -2.3]} scale={0.03} castShadow />
            <BenchModel position={[2.5, -2.5, -0.1]} scale={0.014} rotation={[0, Math.PI / 2.5, 0]} castShadow />
            {/* Primer tronco para sentarse */}
            <LogModel position={[-1.2, -2.5, 1.2]} scale={0.015} rotation={[0, Math.PI / 1.4, 0]} castShadow />
            {/* Segundo tronco para sentarse */}
            <LogModel2 position={[0, -2.5, -2.3]} scale={0.016} rotation={[0, Math.PI / -1, Math.PI / 1]} castShadow />
            
            
            <CampfireModel position={[0, -2.5, 0]} scale={0.01} castShadow />
            {/* Efectos de fuego animado encima de la fogata */}
            <LowPolyFire position={[-0.1, -2.2, 0.1]} scale={0.3} />
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

function BenchModel(props) {
  // Usamos useFBX para cargar el modelo de la banca en formato FBX
  const fbx = useFBX(BENCH_MODEL_PATH)
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={fbx} {...props} />
}

function CampfireModel(props) {
  // Usamos useFBX para cargar el modelo de la fogata en formato FBX
  const fbx = useFBX(CAMPFIRE_MODEL_PATH)
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={fbx} {...props} />
}

function LogModel(props) {
  // Usamos useFBX para cargar el modelo del tronco en formato FBX
  const fbx = useFBX(LOG_MODEL_PATH)
  // Clonamos el modelo para asegurarnos de que sea una instancia independiente
  const clonedFbx = useMemo(() => {
    return fbx.clone();
  }, [fbx]);
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={clonedFbx} {...props} />
}

function LogModel2(props) {
  // Usamos useFBX para cargar el modelo del segundo tronco en formato FBX
  const fbx = useFBX(LOG_MODEL_PATH2)
  // Clonamos el modelo para asegurarnos de que sea una instancia independiente
  const clonedFbx = useMemo(() => {
    return fbx.clone();
  }, [fbx]);
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={clonedFbx} {...props} />
}

// Componente para crear un fuego lowpoly
function LowPolyFire({ position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef();
  const flamesRef = useRef([]);
  
  // Crear geometrías para las llamas
  useEffect(() => {
    // Limpiar referencias anteriores
    flamesRef.current = [];
    
    // Crear materiales con diferentes tonos de fuego
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff5500 }), // naranja
      new THREE.MeshBasicMaterial({ color: 0xff9500 }), // naranja claro
      new THREE.MeshBasicMaterial({ color: 0xffdd00 })  // amarillo
    ];
    
    // Crear varias llamas con formas cónicas
    for (let i = 0; i < 5; i++) {
      // Crear geometría cónica para cada llama
      const height = 1.5 + Math.random() * 1.5;
      const radius = 0.3 + Math.random() * 0.3;
      const geometry = new THREE.ConeGeometry(radius, height, 4 + Math.floor(Math.random() * 3));
      
      // Seleccionar material aleatorio
      const material = materials[Math.floor(Math.random() * materials.length)];
      
      // Crear malla
      const flame = new THREE.Mesh(geometry, material);
      
      // Posicionar aleatoriamente alrededor del centro
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 0.3;
      flame.position.set(
        Math.sin(angle) * distance,
        height / 2 - 0.5 + Math.random() * 0.2,
        Math.cos(angle) * distance
      );
      
      // Rotar ligeramente
      flame.rotation.set(
        Math.random() * 0.2 - 0.1,
        Math.random() * Math.PI * 2,
        Math.random() * 0.2 - 0.1
      );
      
      // Guardar referencia para animación
      flamesRef.current.push({
        mesh: flame,
        initialY: flame.position.y,
        initialScale: flame.scale.clone(),
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
      
      // Añadir al grupo
      groupRef.current.add(flame);
    }
    
    // Añadir una luz puntual para iluminar alrededor del fuego
    const light = new THREE.PointLight(0xff7700, 1, 10);
    light.position.set(0, 1, 0);
    groupRef.current.add(light);
    
  }, []);
  
  // Animar las llamas
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    
    const time = clock.getElapsedTime();
    
    flamesRef.current.forEach((flame) => {
      // Animar posición vertical
      flame.mesh.position.y = flame.initialY + Math.sin(time * flame.speed + flame.phase) * 0.1;
      
      // Animar escala
      const scaleValue = 0.9 + Math.sin(time * flame.speed * 0.5 + flame.phase) * 0.15;
      flame.mesh.scale.set(
        flame.initialScale.x * scaleValue,
        flame.initialScale.y * (scaleValue * 0.8 + 0.2),
        flame.initialScale.z * scaleValue
      );
      
      // Animar rotación
      flame.mesh.rotation.y += 0.01 * flame.speed;
    });
  });
  
  return (
    <group position={position} scale={scale} ref={groupRef}>
      {/* Las llamas se añaden dinámicamente en useEffect */}
    </group>
  );
}
