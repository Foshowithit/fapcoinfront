// 3D Tolerance Ring Viewer using Three.js

function create3DRingViewer(containerId, partNumber, bore, width, thickness = 0.203, waves = 16) {
    // Get container
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Set up scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create tolerance ring geometry
    const outerRadius = bore / 2;
    const innerRadius = outerRadius - thickness;
    const height = width;
    
    // Create base ring shape with waves
    const shape = new THREE.Shape();
    const waveAmplitude = 0.5; // Wave height in mm
    
    // Create outer edge with waves
    for (let i = 0; i <= waves; i++) {
        const angle = (i / waves) * Math.PI * 2;
        const radius = outerRadius + (Math.sin(i * 2) * waveAmplitude);
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    
    // Create hole (inner circle)
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);
    
    // Extrude to create 3D ring
    const extrudeSettings = {
        depth: height,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2,
        steps: 2
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Create material (stainless steel appearance)
    const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0xffffff,
        shininess: 100,
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = -Math.PI / 2; // Rotate to show top view initially
    ring.castShadow = true;
    ring.receiveShadow = true;
    scene.add(ring);
    
    // Add edges for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 1 });
    const edgesMesh = new THREE.LineSegments(edges, edgesMaterial);
    edgesMesh.rotation.x = -Math.PI / 2;
    scene.add(edgesMesh);
    
    // Position camera
    camera.position.set(bore * 1.5, bore * 1.5, bore * 1.5);
    camera.lookAt(0, 0, 0);
    
    // Add orbit controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = bore / 2;
    controls.maxDistance = bore * 5;
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(bore * 2, 20, 0x888888, 0xcccccc);
    scene.add(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(bore);
    scene.add(axesHelper);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Add dimensions text overlay
    const infoDiv = document.createElement('div');
    infoDiv.style.position = 'absolute';
    infoDiv.style.top = '10px';
    infoDiv.style.left = '10px';
    infoDiv.style.background = 'rgba(255,255,255,0.9)';
    infoDiv.style.padding = '10px';
    infoDiv.style.borderRadius = '5px';
    infoDiv.style.fontFamily = 'Arial, sans-serif';
    infoDiv.style.fontSize = '12px';
    infoDiv.innerHTML = `
        <strong>${partNumber}</strong><br>
        Bore: ${bore}mm<br>
        Width: ${width}mm<br>
        Thickness: ${thickness}mm<br>
        Waves: ${waves}
    `;
    container.style.position = 'relative';
    container.appendChild(infoDiv);
    
    // Export functions
    return {
        scene: scene,
        camera: camera,
        renderer: renderer,
        controls: controls,
        exportSTL: function() {
            const exporter = new THREE.STLExporter();
            const stlString = exporter.parse(ring);
            const blob = new Blob([stlString], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${partNumber}.stl`;
            link.click();
        }
    };
}

// Function to generate 3D ring in chat response
function generateRing3D(partNumber, bore, width) {
    const containerId = `ring3d-${Date.now()}`;
    const html = `
        <div id="${containerId}" style="width: 100%; height: 400px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <div style="text-align: center; padding: 180px 20px; color: #666;">
                <i class="fas fa-cube fa-3x mb-3"></i><br>
                Loading 3D Model...
            </div>
        </div>
    `;
    
    // Initialize 3D viewer after DOM update
    setTimeout(() => {
        create3DRingViewer(containerId, partNumber, bore, width);
    }, 100);
    
    return html;
}