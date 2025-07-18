
function openMLTab(method){
    closeAllTabs();
    if(!document.getElementById(`${method}`)){
        const createFileBottom = document.createElement('div');
        createFileBottom.onclick = function(){
            openMLTab(method);
        };
        createFileBottom.classList.add('file-bottom');
        createFileBottom.setAttribute('id', method);
        createFileBottom.setAttribute('title', method);
        createFileBottom.setAttribute('name', method);

        const createIcon = document.createElement('iconify-icon');
        createIcon.classList.add('file-icon');
        createIcon.setAttribute('icon', 'material-icon-theme:brainfuck');

        const createFileName = document.createElement('p');
        createFileName.classList.add('file-name-bottom');
        createFileName.textContent = method.replace(/-/g, ' ').toUpperCase();

        createFileBottom.appendChild(createIcon);
        createFileBottom.appendChild(createFileName);

        createFileBottom.draggable = true;
        bottomFiles.appendChild(createFileBottom);
    }

    if(document.querySelector('.current-file')){
        document.querySelector('.current-file').classList.remove('current-file');
    }
    document.getElementById(method).classList.add('current-file');
    document.getElementById(`${method}-tab`).style.display = "flex";

    pywebview.api.set_current_file(method, null);
}


const models = [
    'linear-regression',
    'logistic-regression',
    'decision-tree',
    'random-forest',
    'knn',
    'kmeans'
];

const dataBases64 = {};

models.forEach(model => {
    document.getElementById(`${model}-csv`).addEventListener('change', e => onFileChange(e, model));
    
    document.getElementById(`${model}-features`).addEventListener('change', () => onFeaturesOrTargetChange(model));
    document.getElementById(`${model}-target`).addEventListener('change', () => onFeaturesOrTargetChange(model));
    
    document.querySelector(`.${model}-train-button`).addEventListener('click', () => trainModel(model));

    const restartBtn = document.querySelector(`#${model}-result .train-button`);
    if(restartBtn){
        restartBtn.addEventListener('click', () => restartModel(model));
    }

    const saveBtn = document.querySelector(`#${model}-result .save-model-btn`);
    if(saveBtn){
        saveBtn.addEventListener('click', () => saveModel(model));
    }

    const folderPathSpan = document.querySelector(`#${model}-result .selected-folder-path`);
    if(folderPathSpan){
        folderPathSpan.addEventListener('click', async () => {
            let selectedFolder = await window.pywebview.api.select_folder();
            if(selectedFolder){
                folderPathSpan.textContent = selectedFolder;
                folderPathSpan.setAttribute('title', selectedFolder);
                if(saveBtn) saveBtn.disabled = false;
            }
        });
    }
});

function onFileChange(event, model) {
  const file = event.target.files[0];
  resetUI(model);

  if(!file) return;

  updateUIOnFileLoad(model, file);

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: results => {
      if(results.data.length === 0) return;
      const columns = Object.keys(results.data[0]);
      populateSelectOptions(model, columns);

      const reader = new FileReader();
      reader.onload = evt => {
        dataBases64[model] = btoa(evt.target.result);
      };
      reader.readAsBinaryString(file);
    }
  });
}

function resetUI(model) {
  const prefix = model;
  document.querySelector(`.${prefix}-target-label`).style.opacity = 0;
  document.querySelector(`.${prefix}-target-label`).style.pointerEvents = 'none';
  document.querySelector(`.${prefix}-target-label`).style.transform = 'translateY(20%)';
  document.querySelector(`.${prefix}-features-label`).style.opacity = 0;
  document.querySelector(`.${prefix}-features-label`).style.pointerEvents = 'none';
  document.querySelector(`.${prefix}-features-label`).style.transform = 'translateY(20%)';
  document.querySelector(`.${prefix}-nav`).style.opacity = 0;
  document.querySelector(`.${prefix}-nav`).style.pointerEvents = 'none';
  document.querySelector(`.${prefix}-nav`).style.transform = 'translateY(20%)';

  document.querySelector(`.${prefix}-button-nav`).style.pointerEvents = 'none';
  document.querySelector(`.${prefix}-button-nav`).style.opacity = 0;
  document.querySelector(`.${prefix}-button-nav`).style.transform = 'translateY(20%)';

  document.querySelector(`.${prefix}-csv-label`).removeAttribute('style');

  document.getElementById(prefix + '-file-name').textContent = 'No file selected';
  document.getElementById(prefix + '-file-name').removeAttribute('style');
}

function updateUIOnFileLoad(model, file) {
  const prefix = model;
  document.querySelector(`.${prefix}-target-label`).style.opacity = 1;
  document.querySelector(`.${prefix}-target-label`).style.pointerEvents = 'all';
  document.querySelector(`.${prefix}-target-label`).style.transform = 'translateY(0)';
  document.querySelector(`.${prefix}-features-label`).style.opacity = 1;
  document.querySelector(`.${prefix}-features-label`).style.pointerEvents = 'all';
  document.querySelector(`.${prefix}-features-label`).style.transform = 'translateY(0)';
  document.querySelector(`.${prefix}-nav`).style.opacity = 1;
  document.querySelector(`.${prefix}-nav`).style.pointerEvents = 'all';
  document.querySelector(`.${prefix}-nav`).style.transform = 'translateY(0)';

  document.querySelector(`.${prefix}-button-nav`).style.pointerEvents = 'all';
  document.querySelector(`.${prefix}-button-nav`).style.transform = 'translateY(0)';
  document.querySelector(`.${prefix}-button-nav`).style.opacity = 1;

  document.querySelector(`.${prefix}-csv-label`).style.transform = 'translateY(0)';

  document.getElementById(prefix + '-file-name').textContent = file.name;
  document.getElementById(prefix + '-file-name').style.fontWeight = '800';
  document.getElementById(prefix + '-file-name').style.fontSize = '20px';
  document.getElementById(prefix + '-file-name').style.margin = '10px 0';
}

function populateSelectOptions(model, columns) {
  const featuresSelect = document.getElementById(model + '-features');
  const targetSelect = document.getElementById(model + '-target');
  featuresSelect.innerHTML = '';
  targetSelect.innerHTML = '';

  columns.forEach(col => {
    const optionX = document.createElement('option');
    optionX.value = col;
    optionX.textContent = col;
    featuresSelect.appendChild(optionX);

    const optionY = document.createElement('option');
    optionY.value = col;
    optionY.textContent = col;
    targetSelect.appendChild(optionY);
  });
}

function onFeaturesOrTargetChange(model) {
    const featuresSelect = document.getElementById(model + '-features');
    const targetSelect = document.getElementById(model + '-target');

    const selectedY = targetSelect.value;
    const selectedX = Array.from(featuresSelect.selectedOptions).map(opt => opt.value);

    Array.from(featuresSelect.options).forEach(opt => {
        opt.disabled = opt.value === selectedY;
    });

    Array.from(targetSelect.options).forEach(opt => {
        opt.disabled = selectedX.includes(opt.value);
    });

    
    const trainBtn = document.querySelector(`.${model}-train-button`);
    if(model === 'kmeans'){
        trainBtn.disabled = !(selectedX.length > 0);
    }else{
        trainBtn.disabled = !(selectedX.length > 0 && selectedY !== '');
    }
}

async function trainModel(model) {
  const form = document.getElementById(model + '-form');
  const loader = document.getElementById(model + '-loader');
  const result = document.getElementById(model + '-result');
  const score = document.querySelector(`.${model}-result-score`);
  const saveSection = document.querySelector(`.${model}-model-save`);

  form.style.display = 'none';
  loader.style.display = 'flex';

  const featuresSelect = document.getElementById(model + '-features');
  const targetSelect = document.getElementById(model + '-target');

  const selectedFeatures = Array.from(featuresSelect.selectedOptions).map(opt => opt.value);
  const selectedTarget = targetSelect.value;

  if(!dataBases64[model]){
    loader.style.display = 'none';
    result.style.display = 'flex';
    result.querySelector('.message').innerHTML = `<iconify-icon class="error" icon="ix:error-filled"></iconify-icon><br>CSV file not ready!`;
    return;
  }

  const payload = {
    base64_csv: dataBases64[model],
    features: selectedFeatures,
    target: selectedTarget
  };

    try {
        const response = await pywebview.api.train_model(model, payload);

        loader.style.display = 'none';
        result.style.display = 'flex';

        if(response.success){
            result.querySelector('.message').textContent = "Model successfully trained!";

            if(model === 'linear-regression'){
                score.innerHTML = `
                <p><strong>Coefficients:</strong> ${response.coef.join(', ')}</p>
                <p><strong>Intercept:</strong> ${response.intercept}</p>
                <p><strong>R² Score:</strong> ${response.r2_score.toFixed(4)}</p>
                `;
            }else if(model === 'logistic-regression'){
                score.innerHTML = `
                <p><strong>Coefficients:</strong> ${response.coef.join(', ')}</p>
                <p><strong>Intercept:</strong> ${response.intercept}</p>
                <p><strong>Accuracy:</strong> ${response.accuracy.toFixed(4)}</p>
                `;
            }else if(model === 'decision-tree'){
                score.innerHTML = `
                <p><strong>Coefficients:</strong> ${response.coef.join(', ')}</p>
                <p><strong>Intercept:</strong> ${response.intercept}</p>
                <p><strong>Accuracy:</strong> ${response.accuracy.toFixed(4)}</p>
                `;
            }

            saveSection.querySelector('.selected-folder-path').textContent = document.querySelector('.directory-title').textContent;
        } else {
            result.querySelector('.message').innerHTML = `<iconify-icon class="error" icon="ix:error-filled"></iconify-icon><br>Error: ` + response.error;
        }
    } catch(e) {
        loader.style.display = 'none';
        result.style.display = 'flex';
        result.querySelector('.message').innerHTML = `<iconify-icon class="error" icon="ix:error-filled"></iconify-icon><br>Exception: ` + e.message;
    }
}

function restartModel(model) {
  const form = document.getElementById(model + '-form');
  const loader = document.getElementById(model + '-loader');
  const result = document.getElementById(model + '-result');

  form.style.display = 'flex';
  loader.style.display = 'none';
  result.style.display = 'none';
  result.querySelector('.message').innerHTML = '';
  const score = document.querySelector(`.${model}-result-score`);
  if(score) score.innerHTML = '';
}

async function saveModel(model) {
    const saveFunctionMap = {
        'linear-regression': 'save_linear_regression',
        'logistic-regression': 'save_logistic_regression',
        'decision-tree-classifier': 'save_decision_tree_classifier',
        'random-forest': 'save_random_forest',
        'knn': 'save_knn',
        'kmeans': 'save_kmeans',
    };

    const methodName = saveFunctionMap[model];

    const saveSection = document.querySelector(`.${model}-model-save`);
    const saveButton = saveSection.querySelector('.save-model-btn');
    const folderPath = saveSection.querySelector('.selected-folder-path').textContent;
    const modelName = saveSection.querySelector('.model-name-input').textContent;

    const isValidWindowsFileName = name => !!name && typeof name === 'string' && name.trim() === name && name.length <= 255 && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(name) && !/[<>:"\/\\|?*]/.test(name) && !/[. ]$/.test(name);
    if(!isValidWindowsFileName(modelName)){
        saveButton.style.backgroundColor = '#f44336';
        saveButton.style.boxShadow = '0 4px 16px #f4433619';
        saveButton.innerHTML = `<iconify-icon icon="mdi:do-not-disturb-outline" style="font-size: 24px;"></iconify-icon>`;
        setTimeout(() => {
            saveButton.style.backgroundColor = '';
            saveButton.style.boxShadow = '';
            saveButton.innerHTML = 'Save';
        }, 2000);
        return;
    } 

    try {
        const response = await pywebview.api[methodName](`${folderPath}/${modelName}.pkl`);
        if(response.success){
            saveButton.style.backgroundColor = '#4CAF50';
            saveButton.style.boxShadow = '0 4px 16px #4CAF5019';
            saveButton.innerHTML = `<iconify-icon icon="mdi:check" style="font-size: 24px;"></iconify-icon>`;
            setTimeout(() => {
                saveButton.style.backgroundColor = '';
                saveButton.style.boxShadow = '';
                saveButton.innerHTML = 'Save';
            }, 2000);
        } else {
            console.error('Error saving model: ' + response.error);

            saveButton.style.backgroundColor = '#f44336';
            saveButton.style.boxShadow = '0 4px 16px #f4433619';
            saveButton.innerHTML = `<iconify-icon icon="mdi:error-outline" style="font-size: 24px;"></iconify-icon>`;
            setTimeout(() => {
                saveButton.style.backgroundColor = '';
                saveButton.style.boxShadow = '';
                saveButton.innerHTML = 'Save';
            }, 2000);
        }
    } catch(e){
        console.error('Exception saving model: ' + e.message);

        saveButton.style.backgroundColor = '#f44336';
        saveButton.style.boxShadow = '0 4px 16px #f4433619';
        saveButton.innerHTML = `<iconify-icon icon="mdi:error-outline" style="font-size: 24px;"></iconify-icon>`;
        setTimeout(() => {
            saveButton.style.backgroundColor = '';
            saveButton.style.boxShadow = '';
            saveButton.innerHTML = 'Save';
        }, 2000);
    }
}

function openTrainModelFile(modelName) {
    if (modelName === 'linear-regression') {
        pywebview.api.send_path_from_project("models/linear-regression.py").then(function(response) {
            bringFile('linear-regression.py', response);
        });
    } else if (modelName === 'logistic-regression') {
        pywebview.api.send_path_from_project("models/logistic-regression.py").then(function(response) {
            bringFile('logistic-regression.py', response);
        });
    } else if (modelName === 'decision-tree') {
        pywebview.api.send_path_from_project("models/decision-tree.py").then(function(response) {
            bringFile('decision-tree.py', response);
        });
    } else if (modelName === 'random-forest') {
        pywebview.api.send_path_from_project("models/random-forest.py").then(function(response) {
            bringFile('random-forest.py', response);
        });
    } else if (modelName === 'knn') {
        pywebview.api.send_path_from_project("models/knn.py").then(function(response) {
            bringFile('knn.py', response);
        });
    } else if (modelName === 'kmeans') {
        pywebview.api.send_path_from_project("models/kmeans.py").then(function(response) {
            bringFile('kmeans.py', response);
        });
    }
}
