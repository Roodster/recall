let questions = [];
let correctAnswers = 0;
lucide.createIcons();

document.addEventListener("DOMContentLoaded", () => {
    const errorMessage = document.getElementById("errorMessage");

    // Handle drag-and-drop events on the whole document
    document.addEventListener("dragover", (event) => {
        event.preventDefault(); // Prevent default to allow drop
    });

    document.addEventListener("drop", (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const questions = JSON.parse(e.target.result);
                    loadQuestions(questions);
                    errorMessage.classList.add("hidden"); // Hide error message if successful
                } catch (error) {
                    showError("File loading error: Invalid JSON format.");
                }
            };
            reader.readAsText(file);
        } else {
            showError("File loading error: Only JSON files are supported.");
        }
    });

    // Display an error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    }

    // Function to load questions (this should match your existing logic)
    function loadQuestions(questions) {
        // Ensure the questions array follows your format requirements
        if (!Array.isArray(questions)) {
            showError("File loading error: JSON structure is incorrect.");
            return;
        }

        // Clear existing questions and populate the new ones
        const questionsContainer = document.getElementById("questionsContainer");
        questionsContainer.innerHTML = ""; // Clear existing questions
        questions.forEach((question) => {
            // Call your existing function to add questions dynamically
            addQuestion(question);
        });
    }
});



function addOpenAnswer(questionId) {

    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}">
            <input type="text" placeholder="Open answer" class="answer-option" oninput="updateQuestion(${questionId})">
            <button onclick="deleteAnswer(${questionId}, ${answerId})">Delete</button>
            <br>
        </div>
    `);
    container.classList.remove('hidden');
    updateQuestion(questionId);
}

function addMultipleChoice(questionId) {

    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}">
            <input type="checkbox" class="answer-option" onclick="updateQuestion(${questionId})">
            <input type="text" placeholder="Option text" class="option-text" oninput="updateQuestion(${questionId})">
            <button onclick="deleteAnswer(${questionId}, ${answerId})">Delete</button>
            <br>
        </div>
    `);
    container.classList.remove('hidden');
    updateQuestion(questionId);
}

function deleteAnswer(questionId, answerId) {
    document.getElementById(`answer-${answerId}`).remove();
    updateQuestion(questionId);
}

function deleteQuestion(questionId) {
    document.getElementById(`question-${questionId}`).remove();
    questions = questions.filter(q => q.id !== questionId);
    updateStats();
}

function updateCorrectness(questionId, checkbox) {
    const question = questions.find(q => q.id === questionId);
    question.correct = checkbox.checked;
    updateStats();
}

// Update the stats display to show ratio
function updateStats() {
    const correctCount = questions.filter(q => q.correct).length;
    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions * 100).toFixed(2) : 0;
    document.getElementById('statsText').textContent = `${correctCount}/${totalQuestions}`;
    document.querySelector('.progress-bar').style.width = `${percentage}%`;
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

    const question = questions.find(q => q.id === questionId);

    if (question) {
        question.text = questionText.trim();
        question.answers = answers;
    }

    updateStats()

}

function downloadQuestions() {
    try {
        // Stringify the questions array with proper indentation for readability
        const jsonData = JSON.stringify(questions, null, 2);

        console.log(jsonData)
        
        // Create a Blob object from the JSON data
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Create an anchor element and trigger the download
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = url;
        downloadAnchor.download = "questions.json"; // File name for the download
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
// Initialize Lucide icons

// Modify your addQuestion function to use the new HTML structure
function addQuestion(questionId = null) {


    const id = questionId || new Date().getTime();
    const questionHTML = `
        <div class="question" id="question-${id}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <button onclick="deleteQuestion(${id})" class="btn btn-red btn-icon">
                    <i data-lucide="trash-2"></i>
                </button>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="toggleAnswers(${id})" class="btn btn-blue btn-icon">
                        <i data-lucide="eye" id="eye-${id}"></i>
                    </button>
                    <input type="checkbox" class="correctness-checkbox" onchange="updateCorrectness(${id}, this)">
                </div>
            </div>
            <input type="text" placeholder="Enter your question" class="question-text" oninput="updateQuestion(${id})">
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button onclick="addOpenAnswer(${id})" class="btn btn-blue">
                    <i data-lucide="square"></i>
                    Add Textbox
                </button>
                <button onclick="addMultipleChoice(${id})" class="btn btn-blue">
                    <i data-lucide="check-square"></i>
                    Add Checkbox
                </button>
            </div>
            <div class="answers hidden" id="answers-${id}"></div>
        </div>
    `;
    document.getElementById('questionsContainer').insertAdjacentHTML('beforeend', questionHTML);
    lucide.createIcons();
    
    // Check if this is a new question or an existing one
    const existingQuestion = questions.find(q => q.id === id);
    
    if (!existingQuestion) {
        questions.push({ id: id, text: '', answers: [], correct: false });
    }
    
    updateStats();
    
    return id;
}

function displayQuestions() {
    document.getElementById('questionsContainer').innerHTML = '';
    questions.forEach(q => {
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
                    addMultipleChoiceWithValue(q.id, answer); // Ensure it's an object with `checked` and `text`
                } else {
                    addOpenAnswerWithValue(q.id, answer); // For simple text answers
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



function uploadQuestions() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a file to upload');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            questions = JSON.parse(e.target.result); // Update the questions array
            document.getElementById('questionsContainer').innerHTML = ''; // Clear existing questions
            
            // Display each question
            questions.forEach(question => {
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
                        addMultipleChoiceWithValue(question.id, answer);
                    } else {
                        // It's an open text answer
                        addOpenAnswerWithValue(question.id, answer);
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
            alert('Error loading questions. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

// Helper function to add multiple choice answer with existing value
function addMultipleChoiceWithValue(questionId, answer) {
    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}">
            <input type="checkbox" class="answer-option" ${answer.checked ? 'checked' : ''} onclick="updateQuestion(${questionId})">
            <input type="text" value="${answer.text}" placeholder="Option text" class="answer-row" oninput="updateQuestion(${questionId})">
            <button onclick="deleteAnswer(${questionId}, ${answerId})" class="btn delete-btn btn-red btn-icon">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `);
    lucide.createIcons();
    updateQuestion(questionId);
}

// Helper function to add open answer with existing value
function addOpenAnswerWithValue(questionId, answer) {
    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}">
            <input type="text" value="${answer}" placeholder="Open answer" class="answer-row" oninput="updateQuestion(${questionId})">
            <button onclick="deleteAnswer(${questionId}, ${answerId})" class="btn btn-red btn-icon">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `);
    lucide.createIcons();
    updateQuestion(questionId);
}