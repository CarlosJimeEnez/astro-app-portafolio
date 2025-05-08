import { Suspense, useDeferredValue, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, OrbitControls, ContactShadows, useFBX, AccumulativeShadows, RandomizedLight, Plane, Circle, Instances, Instance } from '@react-three/drei'
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
        {/* Luz tenue de luna */}
        <MoonLight />
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
            {/* Árboles distribuidos en posiciones específicas alrededor de la escena */}
            <TreeModel position={[-2.5, 0, -2.3]} scale={0.03} rotation={[0, 0, 0]} castShadow receiveShadow />
            <TreeModel position={[8, 0, -7]} scale={0.035} rotation={[0, Math.PI / 3, 0]} castShadow receiveShadow />
            <TreeModel position={[-9, 0, -5]} scale={0.028} rotation={[0, Math.PI / 1.5, 0]} castShadow receiveShadow />
            <TreeModel position={[-7, 0, 8]} scale={0.032} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow />
            <TreeModel position={[10, 0, 6]} scale={0.025} rotation={[0, Math.PI / 5, 0]} castShadow receiveShadow />
            <TreeModel position={[6, 0, -10]} scale={0.033} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow />
            <TreeModel position={[-10, 0, 3]} scale={0.029} rotation={[0, Math.PI / 2.5, 0]} castShadow receiveShadow />
            <TreeModel position={[5, 0, 9]} scale={0.031} rotation={[0, Math.PI / 1.2, 0]} castShadow receiveShadow />
            <TreeModel position={[5, 0, -9]} scale={0.031} rotation={[0, Math.PI / 1.2, 0]} castShadow receiveShadow />
            <BenchModel position={[2.5, -2.5, -0.1]} scale={0.014} rotation={[0, Math.PI / 2.5, 0]} castShadow receiveShadow />
            {/* Primer tronco para sentarse */}
            <LogModel position={[-1.2, -2.5, 1.2]} scale={0.015} rotation={[0, Math.PI / 1.4, 0]} castShadow receiveShadow />
            {/* Segundo tronco para sentarse */}
            <LogModel2 position={[0, -2.5, -2.3]} scale={0.016} rotation={[0, Math.PI / -1, Math.PI / 1]} castShadow receiveShadow />
            
            <CampfireModel position={[0, -2.5, 0]} scale={0.01} castShadow receiveShadow />
            {/* Efectos de fuego animado encima de la fogata */}
            <LowPolyFire position={[-0.1, -2.2, 0.1]} scale={0.4} />
            {/* Luz dinámica del fuego */}
            <FireLight position={[0, -1.8, 0]} />
            {/* Sombra circular */}
            <PlantGroup position={[0, -2.9, 0]} />
          <CircularShadow position={[0, -3, 0]} />
          
          {/* Suelo reflectante */}
          {/* NUEVO SUELO DE CAMPO LOW POLY */}
          <LowPolyFieldGround 
              size={[25, 25]}         // Tamaño del campo
              segments={[20, 20]}     // Más segmentos para ondulaciones más suaves pero aún "low-poly"
              hilliness={0.25}        // Ondulación sutil
              baseY={-2.9}           // Nivel base del suelo
              color="#6B8E23"         // Un verde oliva
            />
         
          </Suspense>
          
        </group>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </>
  )
}

// --- NUEVO COMPONENTE: LowPolyFieldGround ---
function LowPolyFieldGround({
  size = [30, 30],        // Tamaño del campo (ancho, profundidad)
  segments = [15, 15],    // Segmentos para la geometría (más segmentos = más detalle potencial, pero menos "low poly")
  hilliness = 0.3,        // Factor de ondulación (qué tan altas son las colinas)
  baseY = -2.55,          // Posición Y base del suelo
  color = "#556B2F",      // DarkOliveGreen
}) {
  const geometry = useMemo(() => {
    const planeGeom = new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
    const positions = planeGeom.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positions.count; i++) {
      vertex.fromBufferAttribute(positions, i);

      // Modificamos la altura (originalmente el eje Z de PlaneGeometry, que se convierte en Y después de la rotación)
      // Usamos una combinación de senos para ondas suaves y un poco de aleatoriedad
      const x = vertex.x;
      const y = vertex.y; // Esta es la coordenada 'profundidad' del plano antes de la rotación

      const wave1 = Math.sin(x * 0.2 + y * 0.1) * hilliness * 0.5;
      const wave2 = Math.cos(x * 0.1 - y * 0.3) * hilliness * 0.4;
      const randomPerturbation = (Math.random() - 0.5) * hilliness * 0.2;
      
      positions.setZ(i, wave1 + wave2 + randomPerturbation); // PlaneGeometry se crea en XY, Z es la "altura"
    }

    positions.needsUpdate = true; // Marcar que los atributos han cambiado
    planeGeom.computeVertexNormals(); // recalcular normales para un sombreado correcto

    // Para un look más facetado "low poly", des-indexamos la geometría.
    // Esto duplica vértices para que cada triángulo tenga sus propias normales.
    const nonIndexedGeom = planeGeom.toNonIndexed();
    if (nonIndexedGeom) {
        nonIndexedGeom.computeVertexNormals(); // recalcular normales para las caras separadas
        return nonIndexedGeom;
    }
    return planeGeom; // Fallback si toNonIndexed no funciona (no debería pasar con PlaneGeometry)
  }, [size, segments, hilliness]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]} // Rotar el plano para que sea horizontal
      position={[0, baseY, 0]}       // Posicionarlo debajo de los objetos
      receiveShadow                   // El suelo debe recibir sombras
    >
      <meshStandardMaterial color={color} roughness={0.9} metalness={0.1} />
    </mesh>
  );
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
  
  // Clonamos el modelo para asegurarnos de que sea una instancia independiente
  const clonedFbx = useMemo(() => {
    return fbx.clone();
  }, [fbx]);
  
  // Centramos el modelo y aplicamos las propiedades pasadas
  return <primitive object={clonedFbx} {...props} />
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
// Componente para crear una luz dinámica que simula el fuego con animación más rápida e intensa
function FireLight({ position = [0, 0, 0] }) {
  const lightRef = useRef();
  const pointLightRef = useRef();
  const spotLightRef = useRef();
  
  // Configurar las propiedades de las sombras cuando el componente se monta
  useEffect(() => {
    if (spotLightRef.current) {
      // Mejorar la calidad de las sombras
      spotLightRef.current.shadow.mapSize.width = 1024;
      spotLightRef.current.shadow.mapSize.height = 1024;
      spotLightRef.current.shadow.camera.near = 0.1;
      spotLightRef.current.shadow.camera.far = 10;
      spotLightRef.current.shadow.bias = -0.002;
      spotLightRef.current.shadow.radius = 2;
      // Aumentar el área de la sombra
      spotLightRef.current.shadow.camera.fov = 50;
    }
  }, []);
  
  // Animar la intensidad y color de la luz para simular el parpadeo del fuego
  useFrame(({ clock }) => {
    if (!lightRef.current || !pointLightRef.current || !spotLightRef.current) return;
    
    const time = clock.getElapsedTime();
    
    // Uso de ruido Perlin simulado para movimientos más naturales y orgánicos
    // Esta es una versión simplificada que combina senos y cosenos a diferentes frecuencias
    const noise1 = (Math.sin(time * 2.3) * 0.5 + Math.sin(time * 3.7) * 0.3 + Math.sin(time * 5.1) * 0.2) * 0.5 + 0.5;
    const noise2 = (Math.cos(time * 1.9) * 0.5 + Math.cos(time * 4.3) * 0.3 + Math.cos(time * 6.7) * 0.2) * 0.5 + 0.5;
    const noise3 = (Math.sin(time * 2.5 + 1.4) * 0.5 + Math.sin(time * 3.1) * 0.3 + Math.sin(time * 7.3) * 0.2) * 0.5 + 0.5;
    
    // Variación de intensidad para simular parpadeo - Más natural y orgánico
    const baseIntensity = 2.2;
    const flickerIntensity = 0.8; // Mayor variación para movimientos más pronunciados
    
    // Usamos el ruido para crear un parpadeo más natural y menos predecible
    const intensity = baseIntensity + (noise1 - 0.5) * flickerIntensity;
    
    // Variación de color usando ruido para transiciones más suaves y naturales
    const r = 1.0; // Rojo siempre alto para el fuego
    const g = 0.4 + noise2 * 0.3; // Transición más suave entre tonos
    const b = 0.15 + noise3 * 0.2; // Variación más orgánica
    
    // Aplicar valores a la luz principal (spotLight)
    spotLightRef.current.intensity = intensity * 2.5;
    spotLightRef.current.color.setRGB(r, g, b);
    
    // Luz direccional para sombras más pronunciadas con movimiento natural
    lightRef.current.intensity = intensity * 2.0;
    lightRef.current.color.setRGB(r, g * 0.9, b * 0.7);
    
    // Luz puntual más intensa para iluminación general
    pointLightRef.current.intensity = intensity * 1.5;
    pointLightRef.current.color.setRGB(r, g * 0.8, b * 0.5);
    
    // Movimiento más orgánico de las luces usando ruido
    // Esto crea un movimiento que parece más aleatorio pero sigue siendo suave
    const posNoiseX = 0.08; // Mayor amplitud para movimiento más visible
    const posNoiseY = 0.06; // Movimiento vertical también
    const posNoiseZ = 0.08;
    
    // Movimiento de la luz principal con componentes de ruido
    spotLightRef.current.position.x = Math.sin(time * 2.1) * posNoiseX + Math.sin(time * 3.3) * posNoiseX * 0.4;
    spotLightRef.current.position.y = 0.6 + Math.sin(time * 2.7) * posNoiseY + Math.cos(time * 4.1) * posNoiseY * 0.3;
    spotLightRef.current.position.z = Math.cos(time * 1.9) * posNoiseZ + Math.cos(time * 5.1) * posNoiseZ * 0.3;
    
    // Movimiento de la luz direccional
    lightRef.current.position.x = 0.2 + noise1 * 0.1 - 0.05;
    lightRef.current.position.y = 0.7 + noise2 * 0.1 - 0.05;
    lightRef.current.position.z = 0.2 + noise3 * 0.1 - 0.05;
    
    // Movimiento sutil de la luz puntual
    pointLightRef.current.position.x = noise2 * 0.1 - 0.05;
    pointLightRef.current.position.y = 0.3 + noise1 * 0.05 - 0.025;
    pointLightRef.current.position.z = noise3 * 0.1 - 0.05;
  });
  
  return (
    <group position={position}>
      {/* Luz principal del fuego con sombras mejoradas */}
      <spotLight 
        ref={spotLightRef}
        position={[0, 0.6, 0]} // Ligeramente más alto
        angle={Math.PI / 2.2} // Ángulo ligeramente más estrecho
        penumbra={1}
        intensity={3.5} // Intensidad inicial mayor
        color={"#ff7700"}
        castShadow
        shadow-mapSize={[1024, 1024]} // Mayor resolución de sombras
        shadow-bias={-0.002}
        distance={8} // Mayor alcance
      />
      
      {/* Luz direccional adicional para mejorar las sombras */}
      <directionalLight
        ref={lightRef}
        position={[0.2, 0.7, 0.2]}
        intensity={2.5}
        color={"#ff8800"}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      
      {/* Luz puntual adicional para iluminación ambiental */}
      <pointLight 
        ref={pointLightRef}
        position={[0, 0.3, 0]}
        intensity={2.2} // Mayor intensidad
        color={"#ff5500"}
        distance={8} // Mayor alcance (antes 6)
        decay={1.8} // Menor decay para mayor alcance
      />
    </group>
  );
}


// Componente para crear un grupo de plantas
function PlantGroup({ position = [0, 0, 0] }) {
  // Crear posiciones aleatorias para un grupo de plantas
  const plantPositions = useMemo(() => {
    const positions = [];
    // Crear 50 plantas distribuidas aleatoriamente
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 20; // Distribuir en un área de 20x20
      const z = (Math.random() - 0.5) * 20;
      const scale = 0.2 + Math.random() * 0.3; // Escala entre 0.2 y 0.5
      const height = 0.2 + Math.random() * 0.4; // Altura entre 0.2 y 0.6
      const rotation = Math.random() * Math.PI * 2; // Rotación aleatoria
      
      positions.push({ x, z, scale, height, rotation });
    }
    return positions;
  }, []);
  
  return (
    <group position={position}>
      {plantPositions.map((plant, index) => (
        <GrassPlant 
          key={index}
          position={[plant.x, 0, plant.z]}
          scale={plant.scale}
          height={plant.height}
          rotation={[0, plant.rotation, 0]}
        />
      ))}
    </group>
  );
}

// Componente para crear una planta pequeña low poly
function GrassPlant({ position, height = 0.3, rotation = [0, 0, 0], scale = 0.3 }) {
  // Colores para las plantas (variaciones de verde más brillantes)
  const colors = useMemo(() => [
    '#4caf50', // Verde medio brillante
    '#66bb6a', // Verde claro
    '#388e3c', // Verde oscuro pero visible
    '#81c784', // Verde claro brillante
  ], []);
  
  // Seleccionar un color aleatorio de la paleta
  const color = useMemo(() => {
    return colors[Math.floor(Math.random() * colors.length)];
  }, [colors]);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Triángulo simple para representar una planta low poly */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[scale, height, 4, 1, false]} />
        <meshPhongMaterial 
          color={color}
          emissive={color} // Hacer que emita luz del mismo color
          emissiveIntensity={0.3} // Intensidad moderada
          shininess={0} // Sin brillo para evitar reflejos blancos
          flatShading // Para efecto low poly
        />
      </mesh>
    </group>
  );
}

// Componente para crear una luz tenue de luna
function MoonLight() {
  const moonLightRef = useRef();
  
  // Posición de la luna (alta en el cielo, ligeramente hacia un lado)
  const moonPosition = [15, 20, -15];
  
  useEffect(() => {
    if (moonLightRef.current) {
      // Configurar las propiedades de la luz direccional para simular la luz de luna
      moonLightRef.current.shadow.mapSize.width = 2048;
      moonLightRef.current.shadow.mapSize.height = 2048;
      moonLightRef.current.shadow.camera.far = 50;
      moonLightRef.current.shadow.bias = -0.0001;
    }
  }, []);
  
  return (
    <>
      {/* Luz direccional principal de la luna */}
      <directionalLight
        ref={moonLightRef}
        position={moonPosition}
        intensity={0.001}
        color="#b4c2d3" // Color azulado tenue típico de la luz de luna
        castShadow
      />
      
      {/* Luz ambiental suave para simular el brillo difuso de la luna en el cielo */}
      <ambientLight intensity={0.05} color="#b4c2d3" />
    </>
  );
}

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
