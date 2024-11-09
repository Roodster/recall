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
