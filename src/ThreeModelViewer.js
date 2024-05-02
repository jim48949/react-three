import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './ThreeModelViewer.css';

const ThreeModelViewer = () => {
  const [jsonFiles, setJsonFiles] = useState([]);
  const [selectedJsonFile, setSelectedJsonFile] = useState(null);
  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [autoRotateDelay, setAutoRotateDelay] = useState(2000); // Default auto-rotate delay: 3000ms (3 seconds)
  const [loadedModels, setLoadedModels] = useState([null]);
  const [selectedModelFromDropdown, setSelectedModelFromDropdown] = useState(null);
  const [isFirstModelLoaded, setIsFirstModelLoaded] = useState(false);


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
      renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvasRef.current }); // Attach renderer to canvas
      camera.current.position.set(0, 0, 10);
      renderer.current.setSize(window.innerWidth * 0.9, window.innerHeight * 0.9);
      renderer.current.setPixelRatio(window.devicePixelRatio); // Set pixel ratio for higher resolution
      // renderer.current.setClearColor(0xffffff); // Set background color here (black in this example)
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

          // Unload all displayed models before loading new ones
          modelGroup.current.children = [];
          scene.current.remove(modelGroup.current);

          // Reset camera position and rotation
          camera.current.position.set(0, 0, 10);
          camera.current.lookAt(0, 0, 0);
          // Reset controls
          controls.current.reset();

          setSelectedModels(data);

          // Load only the first model initially
          const firstModel = data[0];
          if (firstModel) {
            loadModel(firstModel.filePath, firstModel.position, firstModel.scale, firstModel.rotation);
            setLoadedModels([firstModel.filePath]);
          }

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
        // Remove existing model from the scene if it's not the first model
        if (loadedModels.length > 1 && loadedModels[0] !== selectedModel) {
          const modelToRemove = modelGroup.current.children.find(model => model.userData.filePath === selectedModel);
          if (modelToRemove) {
            modelGroup.current.remove(modelToRemove);
            setLoadedModels(prevLoaded => prevLoaded.filter(path => path !== selectedModel));
          }
        }

        // Load the selected model
        loadModel(selectedModelData.filePath, selectedModelData.position, selectedModelData.scale, selectedModelData.rotation);
      }
    }
  }, [selectedModel, selectedModels, loadedModels]);

  useEffect(() => {
    let autoRotateTimer; // Timer for auto-rotation
    let interactionTimer; // Timer for user interaction

    const startAutoRotate = () => {
      autoRotateTimer = setTimeout(() => {
        if (controls.current) {
          controls.current.autoRotate = true;
          controls.current.autoRotateSpeed = 1; // Adjust auto-rotate speed as needed
        }
      }, autoRotateDelay);
    };

    const stopAutoRotate = () => {
      if (controls.current) {
        controls.current.autoRotate = false;
      }
    };

    // Start auto-rotate after mounted
    startAutoRotate();

    const handleUserInteraction = () => {
      clearTimeout(interactionTimer); // Clear previous interaction timer
      clearTimeout(autoRotateTimer); // Clear auto-rotate timer
      stopAutoRotate(); // Stop auto-rotation
      interactionTimer = setTimeout(startAutoRotate, autoRotateDelay); // Restart auto-rotation after delay
    };

    // Add event listener for user click on the canvas
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('click', handleUserInteraction);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (canvasElement) {
        canvasElement.removeEventListener('click', handleUserInteraction);
      }
      clearTimeout(autoRotateTimer); // Clear auto-rotate timer
      clearTimeout(interactionTimer); // Clear interaction timer
    };
  }, [autoRotateDelay]);


  const loadModel = async (filePath, position, scale, rotationAngle) => {
    try {
      const loader = new GLTFLoader();
      loader.load(
        filePath, (gltf) => {
          const model = gltf.scene;
          model.position.set(position.x, position.y, position.z);
          model.scale.set(scale.x, scale.y, scale.z);
          model.rotateX(rotationAngle.x * (Math.PI / 180));
          model.rotateY(rotationAngle.y * (Math.PI / 180)); // Rotate the model around the X/Y/Z-axis
          model.rotateZ(rotationAngle.z * (Math.PI / 180));
          model.userData.filePath = filePath; // Assign filePath to userData
          model.userData.index = selectedModels.findIndex(modelData => modelData.filePath === filePath); // Store index for later removal
          modelGroup.current.add(model);
          scene.current.add(modelGroup.current);

          // Calculate the bounding box and set the controls target
          if (!isFirstModelLoaded) {
            updateCameraTarget(model);
            setIsFirstModelLoaded(true);
          }
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

  const updateCameraTarget = (model) => {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());

    // Set the OrbitControls target to the model center
    controls.current.target.set(center.x, center.y, center.z);

    // Update the camera and controls to look at this new target
    controls.current.update();
  };

  const envLights = () => {
    // Ensure lights are added only once
    if (!scene.current.userData.lightsAdded) {
      // Create lights
      const ambientLight = new THREE.AmbientLight(0xf0f0f0, 1); // Soft white light
      const frontLight = new THREE.DirectionalLight(0xffffff, 2); // White directional light
      frontLight.position.set(0, 1, 1); // Set position of directional light
      const backLight = new THREE.DirectionalLight(0xffffff, 2);
      backLight.position.set(0, -1, -1);
      const leftLight = new THREE.DirectionalLight(0xffffff, 2);
      leftLight.position.set(-1, -1, 0);
      const rightLight = new THREE.DirectionalLight(0xffffff, 2);
      rightLight.position.set(1, 1, 0);

      // Add lights to the scene
      scene.current.add(ambientLight);
      scene.current.add(frontLight);
      scene.current.add(backLight);
      scene.current.add(leftLight);
      scene.current.add(rightLight);
    }
  };

  const handleChangeJsonFile = (e) => {
    const file = e.target.value;
    setSelectedJsonFile(file);
    setSelectedModel(null); // Reset selected model when JSON file changes
    setIsFirstModelLoaded(false); // Reset the first model loaded flag
  };


  // Function to handle changing the selected model from the category dropdown lists
  const handleChangeModelFromDropdown = (e) => {
    const selectedFilePath = e.target.value;
    const selectedCategory = selectedModels[0].category;
    const selectedModelData = selectedModels.find(modelData => modelData.filePath === selectedFilePath);

    if (selectedModelData) {
      // Unload previous model in the same category if it's not the first model
      if (loadedModels.length > 1 && loadedModels[0] !== selectedFilePath) {
        const modelsToUnload = selectedModels.filter(model => model.category === selectedModelData.category && model.filePath !== selectedFilePath);
        modelsToUnload.forEach(modelToUnload => {
          const modelToRemove = modelGroup.current.children.find(model => model.userData.filePath === modelToUnload.filePath);
          if (modelToRemove) {
            modelGroup.current.remove(modelToRemove);
          }
        });
      }
      loadModel(
        selectedModelData.filePath,
        selectedModelData.position,
        selectedModelData.scale,
        selectedModelData.rotation
      );
      setLoadedModels([loadedModels[0], selectedFilePath]); // Update loadedModels state
    } else {
      // If nothing selected, unload all models in the same category
      const modelsToUnload = loadedModels
        .filter((modelPath) => {
          const modelData = selectedModels.find((model) => model.filePath === modelPath);
          return modelData.category !== selectedCategory; // Filter models not in the first category
        });

      modelsToUnload.forEach((modelPath) => {
        const modelToRemove = modelGroup.current.children.find(
          (model) => model.userData.filePath === modelPath
        );
        if (modelToRemove) {
          modelGroup.current.remove(modelToRemove);
        }
      });
      // Update loadedModels state to remove unloaded models
      setLoadedModels([loadedModels[0]]);
    }
  };

  // Function to extract filename without extension
  const extractFileName = (filePath) => {
    const parts = filePath.split('/');
    const fileNameWithExtension = parts.pop();
    return fileNameWithExtension.split('.').slice(0, -1)[0];
  };


  return (
    <>
      <div className="background" />
      <canvas ref={canvasRef} className="canvas" />
      <div className="control-menu">
        <h2>Firearms</h2>
        <select onChange={handleChangeJsonFile} value={selectedJsonFile}>
          <option value="">Select Firearm</option>
          {jsonFiles.map((file, index) => (
            <option key={index} value={file}>
              {extractFileName(file)}
            </option>
          ))}
        </select>
        {selectedJsonFile && (
          <div style={{ marginTop: '10px' }}>
            <h2>Attachments</h2>
            {/* Group models by category */}
            {Object.entries(
              selectedModels.slice(1).reduce((accumulator, model) => {
                const { category } = model;
                if (!accumulator[category]) {
                  accumulator[category] = [];
                }
                accumulator[category].push(model);
                return accumulator;
              }, {})
            ).map(([category, models]) => (
              <div key={category}>
                <h3>{category}</h3>
                <select onChange={handleChangeModelFromDropdown} value={selectedModelFromDropdown}>
                  <option value="">None</option>
                  {models.map((model, index) => (
                    <option key={index} value={model.filePath}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ThreeModelViewer;
