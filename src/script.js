// import {test_html} from "mocks"

let elements = [];
let correctAnswers = 0;
lucide.createIcons();



function addOpenAnswer(questionId) {

    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}">
            <input type="text" placeholder="Open answer" class="answer-row" oninput="updateQuestion(${questionId})">
            <button onclick="deleteAnswer(${questionId}, ${answerId})" class="btn btn-red btn-icon">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `);
    container.classList.remove('hidden');
    lucide.createIcons();
    updateQuestion(questionId);
}

function addMultipleChoice(questionId) {

    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}" class="row align-items-center">
            <div class="col-auto">
                <input type="checkbox" class="answer-row" onclick="updateQuestion(${questionId})">
            </div>
            <div class="col-auto">
                <input type="text" placeholder="Option text" class="option-text" oninput="updateQuestion(${questionId})">
            </div>
            <div class="col-auto">
                <button onclick="deleteAnswer(${questionId}, ${answerId})" class="btn btn-danger btn-sm">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `);
    container.classList.remove('hidden');
    lucide.createIcons();

    updateQuestion(questionId);
}

function deleteAnswer(questionId, answerId) {
    document.getElementById(`answer-${answerId}`).remove();
    updateQuestion(questionId);
}

function deleteQuestion(questionId) {
    document.getElementById(`question-${questionId}`).remove();
    elements = elements.filter(q => q.id !== questionId);
    updateStats();
}

function updateCorrectness(questionId, checkbox) {
    const question = elements.find(q => q.id === questionId);
    question.correct = checkbox.checked;
    updateStats();
}

// Update the stats display to show ratio
function updateStats() {
    const correctCount = elements.filter(q => q.correct).length;
    const totalelements = elements.length;
    const percentage = totalelements > 0 ? (correctCount / totalelements * 100).toFixed(2) : 0;
    document.getElementById('statsText').textContent = `${correctCount}/${totalelements}`;
    document.querySelector('.progress-bar').style.width = `${percentage}%`;
}


function updateQuestion(questionId) {

    const questionElement = document.getElementById(`question-${questionId}`);
    const questionText = questionElement.querySelector('.question-text').value;
    const answerElements = questionElement.querySelectorAll('.answers > div');

    const answers = Array.from(answerElements).map(answerDiv => {
        const checkbox = answerDiv.querySelector('input[type="checkbox"]');
        const textInput = answerDiv.querySelector('.option-text') || answerDiv.querySelector('input[type="text"]');

        if (checkbox) {
            return {
                checked: checkbox.checked,
                text: textInput.value.trim() // Ensure option text is captured
            };
        } else {
            return textInput.value.trim(); // Open answer text
        }
    });

    const question = elements.find(q => q.id === questionId);

    if (question) {
        question.text = questionText.trim();
        question.answers = answers;
    }

    updateStats()

}


// Modify your addQuestion function to use the new HTML structure
function addTopic(topicId = null) {

    const id = topicId || new Date().getTime();
    const topicHTML = `
        
        <div class="question" id="question-${id}">
            <div class="row align-items-center">
                <div class="col-auto">
                    <button onclick="deleteQuestion(${id})" class="btn btn-danger btn-sm">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="col">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="toggleAnswers(${id})" class="btn btn-primary btn-sm">
                            <i data-lucide="eye" id="eye-${id}"></i>
                        </button>
                        <input type="checkbox" class="correctness-checkbox" onchange="updateCorrectness(${id}, this)">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <input type="text" placeholder="Enter your topic" class="question-text" oninput="updateQuestion(${id})">
                </div>
            </div>

            <div class="row justify-content-center">  
                <div class="col-auto">  
                    <button onclick="addQuestion()" class="btn btn-primary add-question-btn">
                        <i data-lucide="plus-circle"></i>
                        Add Question
                    </button>
            </div>

        </div>

    `;
    document.getElementById('elementsContainer').insertAdjacentHTML('beforeend', topicHTML);
    lucide.createIcons();
    
    // Check if this is a new question or an existing one
    const existingTopic = elements.find(q => q.id === id);
    
    if (!existingTopic) {
        elements.push({ id: id, type: "topic", text: ''});
    }
    
    updateStats();
    
    return id;
}


// Modify your addQuestion function to use the new HTML structure
function addQuestion(questionId = null) {


    const id = questionId || new Date().getTime();
    const questionHTML = `
        
        <div class="question" id="question-${id}">
            <div class="row align-items-center">
                <div class="col-auto">
                    <button onclick="deleteQuestion(${id})" class="btn btn-danger btn-sm">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="col">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <button onclick="toggleAnswers(${id})" class="btn btn-primary btn-sm">
                            <i data-lucide="eye" id="eye-${id}"></i>
                        </button>
                        <input type="checkbox" class="correctness-checkbox" onchange="updateCorrectness(${id}, this)">
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <input type="text" placeholder="Enter your question" class="question-text" oninput="updateQuestion(${id})">
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button onclick="addOpenAnswer(${id})" class="btn btn-primary btn-sm">
                            <i data-lucide="square"></i>
                            Add Textbox
                        </button>
                        <button onclick="addMultipleChoice(${id})" class="btn btn-primary btn-sm">
                            <i data-lucide="check-square"></i>
                            Add Checkbox
                        </button>
                    </div>
                </div>
            </div>
            <div class="answers hidden" id="answers-${id}"></div>
        </div>
    `;
    document.getElementById('elementsContainer').insertAdjacentHTML('beforeend', questionHTML);
    lucide.createIcons();
    
    // Check if this is a new question or an existing one
    const existingQuestion = elements.find(q => q.id === id);
    
    if (!existingQuestion) {
        elements.push({ id: id, type: "question", text: '', answers: [], correct: false });
    }
    
    updateStats();
    
    return id;
}


/* ============================================== DISPLAY METHODS ============================================== */

function displayelements() {
    document.getElementById('elementsContainer').innerHTML = '';
    elements.forEach(q => {
        addQuestion(q.id);
        const questionElement = document.getElementById(`question-${q.id}`);
        if (!questionElement) return;

        const questionTextInput = questionElement.querySelector('.question-text');
        if (questionTextInput) {
            questionTextInput.value = q.text || ''; // Set question text
        }

        const answersContainer = document.getElementById(`answers-${q.id}`);
        if (answersContainer) {
            q.answers.forEach(answer => {
                if (typeof answer === 'object') {
                    addMultipleChoice(q.id, answer); // Ensure it's an object with `checked` and `text`
                } else {
                    addOpenAnswer(q.id, answer); // For simple text answers
                }
            });

            if (q.answers.length > 0) {
                answersContainer.classList.remove('hidden');
            }
        }

        const correctnessCheckbox = questionElement.querySelector('input[type="checkbox"]');
        if (correctnessCheckbox) {
            correctnessCheckbox.checked = q.correct || false;
        }
    });
}


// Toggle eye icon when showing/hiding answers
function toggleAnswers(questionId) {

    const container = document.getElementById(`answers-${questionId}`);
    const eyeIcon = document.getElementById(`eye-${questionId}`);
    
    // Toggle the display of the answers container
    container.classList.toggle('hidden');
    
    // Update the icon based on visibility state
    if (container.classList.contains('hidden')) {
        eyeIcon.setAttribute('data-lucide', 'eye');
    } else {
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    }
    
    // Refresh icons to apply the updated `data-lucide` attribute
    lucide.createIcons();
}


/* ======================================== DOWNLOAD / UPLOAD ======================================== */


function downloadelements() {
    try {
        // Stringify the elements array with proper indentation for readability
        const jsonData = JSON.stringify(elements, null, 2);

        console.log(jsonData)
        
        // Create a Blob object from the JSON data
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Create an anchor element and trigger the download
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = "elements.json"; // File name for the download
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        
        // Clean up the created URL and anchor element
        document.body.removeChild(downloadAnchor);
        URL.revokeObjectURL(url);
        
        alert("Download initiated successfully!");
    } catch (error) {
        console.error("Error during the download process:", error);
        alert("An error occurred while preparing the download.");
    }
}


function uploadelements() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            elements = JSON.parse(e.target.result); // Update the elements array
            document.getElementById('elementsContainer').innerHTML = ''; // Clear existing elements
            
            // Display each question
            elements.forEach(question => {
                // First create the question container
                addQuestion(question.id);
                
                // Get the created question element
                const questionElement = document.getElementById(`question-${question.id}`);
                if (!questionElement) return;
                
                // Set the question text
                const questionTextInput = questionElement.querySelector('.question-text');
                if (questionTextInput) {
                    questionTextInput.value = question.text;
                }
                
                // Set correctness
                const correctnessCheckbox = questionElement.querySelector('.correctness-checkbox');
                if (correctnessCheckbox) {
                    correctnessCheckbox.checked = question.correct;
                }
                
                // Get answers container
                const answersContainer = document.getElementById(`answers-${question.id}`);
                if (!answersContainer) return;
                
                // Display each answer
                question.answers.forEach(answer => {
                    if (typeof answer === 'object') {
                        // It's a multiple choice answer
                        addMultipleChoice(question.id, answer);
                    } else {
                        // It's an open text answer
                        addOpenAnswer(question.id, answer);
                    }
                });
                
                // Show answers if there are any
                if (question.answers.length > 0) {
                    answersContainer.classList.remove('hidden');
                    const eyeIcon = document.getElementById(`eye-${question.id}`);
                    if (eyeIcon) {
                        eyeIcon.setAttribute('data-lucide', 'eye-off');
                        lucide.createIcons();
                    }
                }
            });
            
            updateStats(); // Update the statistics
            
        } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Error loading elements. Please check the file format.');
        }
    };
    reader.readAsText(file);
}










/* ================================================== DARK MODE ================================================== */

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    saveThemePreference();
}

function saveThemePreference() {
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
}

function loadThemePreference() {
    const darkMode = localStorage.getItem("darkMode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
    }
}

// Load the theme preference on page load
loadThemePreference();
