// Your existing JavaScript code here
let elements = [];
let correctAnswers = 0;
lucide.createIcons();

function scrollToTop(scrollDistance) {

    // Scroll the window by the calculated distance
    window.scrollTo({ top: scrollDistance, behavior: 'smooth' });
}

function addOpenAnswer(questionId) {
    // modify here in this function 
    const container = document.getElementById(`answers-${questionId}`);
    const answerId = new Date().getTime();
    container.insertAdjacentHTML('beforeend', `
        <div id="answer-${answerId}" class="row align-items-center">
            <div class="col">
                <i data-lucide="grip-vertical" class="drag-handle question-drag-handle"></i>
                <textarea class="topic-answer topic-question-answer" placeholder="Open answer" class="answer-row" oninput="updateQuestion(${questionId})"></textarea>
            </div>
            <div class="col-auto d-flex align-items-center">
                <button onclick="deleteAnswer(${questionId}, ${answerId})" class="btn btn-danger btn-sm">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `);
    container.classList.remove('hidden');
    lucide.createIcons();
    updateQuestion(questionId);

    const scrollDistance = container.offsetTop + window.scrollY;

    scrollToTop(scrollDistance)

}

// Update the stats display to show ratio
function updateStats() {
    let correctCount = 0;
    let totalQuestions = 0;

    elements.forEach(topic => {
        if (topic.questions) {
            totalQuestions += topic.questions.length;
            correctCount += topic.questions.filter(q => q.correct >= 1).length;
        }
    });

    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions * 100).toFixed(1) : 0;
    document.getElementById('statsText').textContent = `${percentage}%`;
    document.querySelector('.progress-bar').style.width = `${percentage}%`;
    updateProgressBar(correctCount, totalQuestions)
}

// Modified addTopic function
function addTopic(topicId = null) {
    const id = topicId || new Date().getTime();
    const topicHTML = `
        <div class="topic-container" id="topic-${id}" data-topic-id="${id}">
            <div class="row align-items-center">
                <div class="col">
                    <i data-lucide="grip-vertical" class="drag-handle topic-drag-handle"></i>
                    <input type="text" class="topic-title" placeholder="Enter topic name" oninput="updateTopic(${id})">
                </div>
                <div class="col-auto btn-group">
                    <button onclick="toggleTopicQuestions(${id})" class="btn btn-outline-secondary btn-sm">
                        <i data-lucide="eye" id="topic-eye-${id}"></i>
                    </button>
                    <button onclick="deleteTopic(${id})" class="btn btn-danger btn-sm">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>

            <div class="topic-content" id="topic-content-${id}">
                <button onclick="addQuestion(${id})" class="btn btn-secondary btn-sm mb-3">
                    <i data-lucide="plus"></i>
                    Add Question
                </button>
                <div class="questions-container" id="questions-${id}"></div>
            </div>
        </div>
    `;
    
    document.getElementById('elementsContainer').insertAdjacentHTML('beforeend', topicHTML);
    lucide.createIcons();
    
    // Initialize drag and drop for the new topic
    initTopicDragDrop();
    initQuestionsDragDrop(id);
    showTopicList()
    
    if (!elements.find(t => t.id === id)) {
        elements.push({ id, type: 'topic', text: '', questions: [] });
    }


    // Scroll to the newly added topic
    const newTopicElement = document.getElementById(`topic-${id}`);
    // newTopicElement.scrollIntoView({ behavior: "smooth", block: "start" });
    // Calculate the difference between the current scroll position and the top of the new topic
    
    const scrollDistance = newTopicElement.offsetTop - window.scrollY;

    scrollToTop(scrollDistance)

    return id;
}

function updateProgressBar(correctAnswers, totalQuestions) {
    const percentage = (correctAnswers / totalQuestions) * 100;
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = `${percentage}%`;
    progressBar.setAttribute('aria-valuenow', percentage); 
  
  }


function toggleTopicQuestions(topicId) {
    const content = document.getElementById(`topic-content-${topicId}`);
    const eye = document.getElementById(`topic-eye-${topicId}`);
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        eye.setAttribute('data-lucide', 'eye');
    } else {
        content.classList.add('hidden');
        eye.setAttribute('data-lucide', 'eye-off');
    }
    lucide.createIcons()

}

function deleteTopic(topicId) {
    document.getElementById(`topic-${topicId}`).remove();
    elements = elements.filter(t => t.id !== topicId);
    updateStats();
}
// Modified updateCorrectness function to work with the topic structure
function updateCorrectness(questionId, checkbox) {
    // Find the topic that contains this question
    const questionElement = document.getElementById(`question-${questionId}`);
    const topicElement = questionElement.closest('.topic-container');
    const topicId = parseInt(topicElement.getAttribute('data-topic-id'));
    
    const topic = elements.find(t => t.id === topicId);
    if (!topic) return;

    const question = topic.questions.find(q => q.id === questionId);
    if (!question) return;

    question.correct = checkbox.getAttribute('data-state');
    updateStats();
}



function updateTopic(topicId) {
    const topic = elements.find(t => t.id === topicId);
    if (topic) {
        const titleInput = document.querySelector(`#topic-${topicId} .topic-title`);
        topic.text = titleInput.value.trim();
    }
}


// Modified updateQuestion function to properly update the data structure
function updateQuestion(questionId) {
    const questionElement = document.getElementById(`question-${questionId}`);
    const questionText = document.getElementById(`textarea-question-${questionId}`);

    const answerElements = questionElement.querySelectorAll('.answers > div');

    // Find the topic that contains this question
    let topicElement = questionElement.closest('.topic-container');
    let topicId = topicElement ? parseInt(topicElement.getAttribute('data-topic-id')) : null;
    
    if (!topicId) return;

    // Find the topic and question in our data structure
    const topic = elements.find(t => t.id === topicId);
    if (!topic) return;

    let question = topic.questions.find(q => q.id === questionId);
    if (!question) return;

    // Update question text
    question.text = questionText.value.trim();

    // Update answers
    question.answers = Array.from(answerElements).map(answerDiv => {
        const checkbox = answerDiv.querySelector('input[type="checkbox"]');
        const textInput = answerDiv.querySelector('.option-text') || answerDiv.querySelector('input[type="text"].answer-row');

        if (checkbox && textInput) {
            // Multiple choice answer
            return {
                checked: checkbox.checked,
                text: textInput.value.trim()
            };
        } else if (textInput) {
            // Open answer
            return textInput.value.trim();
        }
    });

    updateStats();
}


// Function to delete an answer
function deleteAnswer(questionId, answerId) {

    // Find the question container
    const questionContainer = document.getElementById(`question-${questionId}`);
    if (!questionContainer) {
        console.log("returning because no q")
        return;
    }


    // Find and remove the answer row
    const answerRow = document.getElementById(`answer-${answerId}`);
    if (!answerRow) return;

    // Remove the answer row with a fade-out animation
    answerRow.style.transition = 'opacity 0.3s ease';
    answerRow.style.opacity = '0';
    
    setTimeout(() => {
        answerRow.remove();
        updateStats(); // Update the statistics after deletion
    }, 300);
}


function deleteQuestion(questionId) {
    // Find the question element and its parent topic container
    const questionElement = document.getElementById(`question-${questionId}`);
    if (!questionElement) return;
    
    const topicElement = questionElement.closest('.topic-container');
    if (!topicElement) return;
    
    // Get the topic ID
    const topicId = parseInt(topicElement.getAttribute('data-topic-id'));
    
    // Find the topic in our data structure
    const topic = elements.find(t => t.id === topicId);
    if (!topic) return;
    
    // Remove the question from the topic's questions array
    if (topic.questions) {
        topic.questions = topic.questions.filter(q => q.id !== questionId);
    }
    
    // Remove the question element from the DOM
    questionElement.remove();
    
    // Update stats to reflect the removed question
    updateStats();
}

function toggleCheckboxState(questionId) {
    const checkboxButton = document.getElementById(`checkbox-state-${questionId}`);
    const checkIcon = checkboxButton.querySelector('.icon-check');
    const crossIcon = checkboxButton.querySelector('.icon-x');
  
    let currentState = checkboxButton.getAttribute('data-state');
  
    if (currentState === '-1') {
        checkboxButton.setAttribute('data-state', '0');
        checkIcon.style.display = 'none';
        crossIcon.style.display = 'block';
        checkboxButton.classList.remove('btn-success');
        checkboxButton.classList.add('btn-danger');
    } else if (currentState === '0') {
        checkboxButton.setAttribute('data-state', '1');
        checkIcon.style.display = 'none';
        crossIcon.style.display = 'block';
        checkboxButton.classList.remove('btn-danger');
        checkboxButton.classList.add('btn-success');
    } else {
        checkboxButton.setAttribute('data-state', '-1');
        checkIcon.style.display = 'none';
        crossIcon.style.display = 'none';
        checkboxButton.classList.remove('btn-success');
        checkboxButton.classList.add('btn-outline-secondary');
    }

    updateStats()
    updateCorrectness(questionId, checkboxButton)
}

// Modified addQuestion function with proper ID for checkbox
function addQuestion(topicId, questionId = null) {
    const id = questionId || new Date().getTime();
    const questionHTML = `
    <div class="question" id="question-${id}" data-question-id="${id}">
        <div class="row align-items-center">
            <div class="col">
                <i data-lucide="grip-vertical" class="drag-handle question-drag-handle"></i>
                <textarea id="textarea-question-${id}" class="topic-title-shape topic-title topic-question" placeholder="Enter your question" oninput="updateQuestion(${id})" rows="1"></textarea>
            </div>
            <div class="col-auto d-flex align-items-center">
                <button id="checkbox-state-${id}" class="btn checkbox-btn btn-outline-secondary btn-sm" data-state="-1" onclick="toggleCheckboxState(${id})">
                    <i class="lucide icon-check" style="display: none;"></i>
                    <i class="lucide icon-x" style="display: none;"></i>
                </button>
                <button onclick="toggleAnswers(${id})" class="btn btn-outline-secondary btn-sm">
                    <i data-lucide="eye" id="topic-eye-${id}"></i>
                </button>
                <button onclick="deleteQuestion(${id})" class="btn btn-danger btn-sm">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <button onclick="addOpenAnswer(${id})" class="btn btn-primary btn-sm">
                        <i data-lucide="square"></i>
                        Add Textbox
                    </button>
                </div>
            </div>
        </div>
        <div class="answers hidden" id="answers-${id}"></div>
    </div>`;


    const questionsContainer = document.getElementById(`questions-${topicId}`);
    questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
    lucide.createIcons();
    // initQuestionsDragDrop(topicId);  // Call here after adding question


    if (!elements.find(t => t.id === topicId)?.questions?.find(q => q.id === id)) {
        const topic = elements.find(t => t.id === topicId);
        if (topic) {
            if (!topic.questions) topic.questions = [];
            topic.questions.push({ id, text: '', answers: [], correct: -1 });
        }
    }
    
    updateStats();
    showTopicList();

    const scrollDistance = questionsContainer.offsetTop - window.scrollY;

    scrollToTop(scrollDistance)


    return id;
}



// Add the toggleAnswers function
function toggleAnswers(questionId) {
    console.log('question id: ', questionId)
    const answers = document.getElementById(`answers-${questionId}`);
    const eye = document.getElementById(`topic-eye-${questionId}`);
    
    if (answers.classList.contains('hidden')) {
        answers.classList.remove('hidden');
        eye.setAttribute('data-lucide', 'eye');
    } else {
        answers.classList.add('hidden');
        eye.setAttribute('data-lucide', 'eye-off');
    }
    lucide.createIcons()
}

// Function to download topics/questions as JSON
function downloadJSON() {
    // Create a data object with the current state
    
    const data = {
        elements: elements,
        timestamp: new Date().toISOString(),
        version: "1.0"
    };
    
    // Convert to JSON string
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `recall-data-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Cleanup
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
}
function uploadJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Clear existing elements
            // document.getElementById('elementsContainer').innerHTML = '';
            // elements = [];

            // Process and recreate topics and questions
            if (data.elements && Array.isArray(data.elements)) {
                data.elements.forEach(item => {
                    if (item.type === 'topic') {
                        // Create topic
                        const topicId = addTopic(item.id);
                        const topic = elements.find(t => t.id === topicId);
                        if (topic) {
                            topic.text = item.text;
                            const titleInput = document.querySelector(`#topic-${topicId} .topic-title`);
                            if (titleInput) titleInput.value = item.text;

                            // Recreate questions
                            if (item.questions && Array.isArray(item.questions)) {
                                item.questions.forEach(question => {
                                    const questionId = addQuestion(topicId, question.id);
                                    const questionElement = document.getElementById(`question-${questionId}`);
                                    if (questionElement) {
                                        const questionInput = questionElement.querySelector('.topic-question');
                                        if (questionInput) questionInput.value = question.text;

                                        // Set correctness state
                                        const correctnessButton = questionElement.querySelector(`#checkbox-state-${questionId}`);
                                        if (correctnessButton) {
                                            correctnessButton.setAttribute('data-state', question.correct);
                                            toggleCheckboxState(questionId);  // Initialize display based on state
                                        }

                                        // Recreate answers
                                        if (question.answers && Array.isArray(question.answers)) {
                                            question.answers.forEach(answer => {
                                                if (answer === null) {
                                                    addOpenAnswer(questionId);
                                                } else if (typeof answer === 'string') {
                                                    addOpenAnswer(questionId);
                                                    const answerInputs = questionElement.querySelectorAll('input[type="text"].answer-row');
                                                    const lastInput = answerInputs[answerInputs.length - 1];
                                                    if (lastInput) lastInput.value = answer;
                                                } else if (typeof answer === 'object') {
                                                    addMultipleChoice(questionId);
                                                    const answerDivs = questionElement.querySelectorAll('.answers > div');
                                                    const lastDiv = answerDivs[answerDivs.length - 1];
                                                    if (lastDiv) {
                                                        const checkbox = lastDiv.querySelector('input[type="checkbox"]');
                                                        const textInput = lastDiv.querySelector('.option-text');
                                                        if (checkbox) checkbox.checked = answer.checked;
                                                        if (textInput) textInput.value = answer.text;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                        // Initialize drag-and-drop for the topic and its questions
                        initTopicDragDrop();
                        initQuestionsDragDrop(topicId);
                    }
                });
            }

            // Update stats after loading
            updateStats();
            lucide.createIcons();

            // Clear file input
            event.target.value = '';
            
        } catch (error) {
            console.error('Error processing JSON file:', error);
            alert('Error processing the file. Please make sure it\'s a valid JSON file.');
        }
    };

    reader.readAsText(file);
}











/* ======================================== SIDEBAR ==================================== */

function getTopicList() {
    return elements.map(topic => ({ id: topic.id, text: topic.text }));
}

function showTopicList() {
    const topicListContainer = document.getElementById("topicList");
    topicListContainer.innerHTML = ""; // Clear previous content
    
    const topics = getTopicList();
    topics.forEach(topic => {
        const topicLink = document.createElement("a");
        topicLink.textContent = topic.text;
        topicLink.href = `#topic-${topic.id}`; // Assumes each topic section has an id in the format topic-{id}
        topicLink.onclick = (e) => {
            e.preventDefault();
            document.getElementById(`topic-${topic.id}`).scrollIntoView({ behavior: "smooth" });
        };
        topicListContainer.appendChild(topicLink);
    });
    
    // toggleSidebar();
}

function toggleSidebar() {
    const sidebar = document.getElementById("topicSidebar");
    sidebar.classList.toggle("open");
    showTopicList();
    
}


        
// Add these new functions
function initTopicDragDrop() {
    new Sortable(document.getElementById('elementsContainer'), {
        animation: 150,
        handle: '.topic-drag-handle',
        draggable: '.topic-container',
    });
}

function initQuestionsDragDrop(topicId) {
    const questionsContainer = document.getElementById(`questions-${topicId}`);
    if (questionsContainer) {
        new Sortable(questionsContainer, {
            animation: 150,
            handle: '.question-drag-handle',  // Ensures only handle is draggable
            draggable: '.question',
            group: 'questions',
        });
    }
}


function toggleAllAnswers() {
    const allQuestions = document.querySelectorAll('.question');
  
    allQuestions.forEach(question => {
        console.log(question.id)
        const match = question.id.match(/\d+/);
        toggleAnswers(match)
    });
  }

  function adjustHeight(el){
    el.style.height = (el.scrollHeight > el.clientHeight) ? (el.scrollHeight)+"px" : "60px";
}