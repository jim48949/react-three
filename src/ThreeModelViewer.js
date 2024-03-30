import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const ThreeModelViewer = () => {
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedJsonFile, setSelectedJsonFile] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [checkedModels, setCheckedModels] = useState([]);

  const canvasRef = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const renderer = useRef(null);
  const controls = useRef(null);
  const modelGroup = useRef(new THREE.Group());

  useEffect(() => {
    const initThree = async () => {
      scene.current = new THREE.Scene();
      camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
      renderer.current = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current }); // Attach renderer to canvas
      camera.current.position.set(0, 0, 10);
      renderer.current.setSize(window.innerWidth * 0.85, window.innerHeight * 0.85);
      renderer.current.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for higher resolution
      renderer.current.setClearColor(0xffffff); // Set background color here (black in this example)
      document.body.appendChild(renderer.current.domElement);

      controls.current = new OrbitControls(camera.current, renderer.current.domElement);
      controls.current.enableDamping = true;

      window.addEventListener('resize', handleResize);

      envLights(); // Add environmental lights to the scene

      await fetchJsonFileList();
    };

    const fetchJsonFileList = async () => {
      try {
        // Fetch JSON files from server
        const response = await fetch('./models.json'); // Change the URL to match your server route
        const data = await response.json();
        setJsonFiles(data);
      } catch (error) {
        console.error('Error fetching JSON file list:', error);
      }
    };

    const handleResize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
      renderer.current.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.current.update();
      renderer.current.render(scene.current, camera.current);
    };

    initThree();
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  useEffect(() => {
    // Fetch json file that contains all other model json files
    if (selectedJsonFile) {
      const fetchModelsFromJson = async () => {
        try {
          const response = await fetch(`./${selectedJsonFile}`);
          const data = await response.json();
          setSelectedModels(data);
          setCheckedModels(Array(data.length).fill(true)); // Load all models initially
          // Unload all displayed models
          modelGroup.current.children = [];
          scene.current.remove(modelGroup.current);
        } catch (error) {
          console.error('Error fetching models from JSON:', error);
        }
      };

      fetchModelsFromJson();
    }
  }, [selectedJsonFile]);

  useEffect(() => {
    if (selectedModel) {
      const selectedModelData = selectedModels.find(modelData => modelData.filePath === selectedModel);
      if (selectedModelData) {
        // Remove existing model from the scene
        modelGroup.current.children = [];
        scene.current.remove(modelGroup.current);
        loadModel(selectedModelData.filePath, selectedModelData.position, selectedModelData.scale);
      }
    }
  }, [selectedModel]);

  useEffect(() => {
    // Load or unload models based on checkbox status
    checkedModels.forEach((isChecked, index) => {
      if (isChecked) {
        const modelData = selectedModels[index];
        loadModel(modelData.filePath, modelData.position, modelData.scale);
      } else {
        // Unload the model
        const modelToRemove = modelGroup.current.children.find(model => model.userData.index === index);
        if (modelToRemove) {
          modelGroup.current.remove(modelToRemove);
        }
      }
    });
  }, [checkedModels]);

  const loadModel = async (filePath, position, scale) => {
    try {
      const loader = new GLTFLoader();
      loader.load(
        filePath, (gltf) => {
          const model = gltf.scene;
          model.position.set(position.x, position.y, position.z);
          model.scale.set(scale.x, scale.y, scale.z);
          model.userData.index = selectedModels.findIndex(modelData => modelData.filePath === filePath); // Store index for later removal
          modelGroup.current.add(model);
          scene.current.add(modelGroup.current);
        },
        undefined,
        (error) => {
          console.error('Error loading model', error); // Log any errors that occur during loading
        }
      );
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  const envLights = () => {
    // Ensure lights are added only once
    if (!scene.current.userData.lightsAdded) {
      // Create lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft white light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White directional light
      directionalLight.position.set(0, 1, 0); // Set position of directional light

      // Add lights to the scene
      scene.current.add(ambientLight);
      scene.current.add(directionalLight);
    }
  };

  const handleChangeJsonFile = (e) => {
    const file = e.target.value;
    setSelectedJsonFile(file);
    setSelectedModel(null); // Reset selected model when JSON file changes
  };

  const handleChangeModel = (e) => {
    setSelectedModel(e.target.value);
  };

  const handleCheckboxChange = (index) => {
    setCheckedModels(prevChecked => {
      const newChecked = [...prevChecked];
      newChecked[index] = !newChecked[index];
      return newChecked;
    });
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: '10%'}} />
      <div style={{ position: 'absolute', top: '5%', left: '88%' }}>
        <h2>Firearms</h2>
        <select onChange={handleChangeJsonFile} value={selectedJsonFile}>
          <option value="">Select Firearm</option>
          {jsonFiles.map((file, index) => (
            <option key={index} value={file}>
              {file}
            </option>
          ))}
        </select>
        {selectedJsonFile && (
          <div style={{ marginTop: '10px' }}>
            <h2>Attachments</h2>
            {selectedModels.slice(1).map((model, index) => ( // Start from index 1, Skip the first model loaded
              <div key={index}>
                <input
                  type="checkbox"
                  checked={checkedModels[index + 1]} // Let the loader knows that we skip the first item
                  onChange={() => handleCheckboxChange(index + 1)}
                />
                <label>{model.filePath}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ThreeModelViewer;
