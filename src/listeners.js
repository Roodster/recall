// Add this initialization code at the end of script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize any existing topics with drag and drop
    const topics = document.querySelectorAll('.topic-container');
    topics.forEach(topic => {
        const topicId = parseInt(topic.getAttribute('data-topic-id'));
        initQuestionsDragDrop(topicId);
    });
    
    // Initialize topic-level drag and drop
    initTopicDragDrop();
    
    // Initialize Lucide icons
    lucide.createIcons();
});


// Check for saved user preference, first in localStorage, then in system preferences
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateDarkModeButton(savedTheme);
};

// Function to toggle between light and dark modes
const toggleDarkMode = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeButton(newTheme);
};

// Update the dark mode button icon and text
const updateDarkModeButton = (theme) => {
    const darkModeButton = document.querySelector('button[onclick="toggleDarkMode()"]');
    if (darkModeButton) {
        darkModeButton.innerHTML = `
            <i data-lucide="${theme === 'light' ? 'moon' : 'sun'}"></i>
            ${theme === 'light' ? '' : ''}
        `;
        // Refresh Lucide icons
        lucide.createIcons();
    }
};

// Initialize theme when the page loads
document.addEventListener('DOMContentLoaded', initializeTheme);

Sortable.create(document.getElementById('elementsContainer'), {
    // ... other Sortable configuration ...
    onEnd: function (evt) {
        // Update the elements array based on the new order
        const newOrder = Array.from(evt.from.children).map(item => item.id);
        const idsOnly = newOrder.map(item => {
            // Use regular expression to extract digits
            const match = item.match(/\d+/);
            return match ? parseInt(match[0]) : null; // Handle cases where no digits are found
          });

        elements = elements.sort((a, b) => idsOnly.indexOf(a.id) - idsOnly.indexOf(b.id));

        // Re-render the sidebar list
        showTopicList();
    }
});