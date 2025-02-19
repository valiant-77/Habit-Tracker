let currentDate = new Date();
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYear = document.getElementById('currentMonthYear');
const modalOverlay = document.getElementById("modalOverlay");
const checklistModal = document.getElementById("checklistModal");
const closeModal = document.getElementById("closeModal");
const modalTitle = document.getElementById("modalTitle");
const tasksColumn = document.getElementById("tasksColumn");
const timeColumn = document.getElementById("timeColumn");

// Sample checklist data
const checklistData = {
    "Day 1": [
        { task: "Morning Exercise", time: "6:00 AM" },
        { task: "Read a book", time: "8:00 AM" },
        { task: "Drink 2L water", time: "Throughout the day" }
    ],
    "Day 2": [
        { task: "Meditation", time: "7:00 AM" },
        { task: "Journal Writing", time: "9:00 AM" },
        { task: "Walk 10k steps", time: "Evening" }
    ],
    "Day 3": [
        { task: "Workout", time: "6:30 AM" },
        { task: "No sugar day", time: "All day" },
        { task: "Plan tomorrow", time: "Night" }
    ]
    // Add more days as needed
};

// Function to render the calendar
function renderCalendar() {
    calendarGrid.innerHTML = ''; // Clear the grid

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    currentMonthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dayBox = document.createElement('div');
        dayBox.className = 'w-20 h-20 flex flex-col items-center justify-center border border-gray-300 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow';

        let dayButton = document.createElement("button");
        dayButton.textContent = `Day ${i}`;
        dayButton.className = "text-center text-gray-800 font-medium hover:bg-gray-200 px-2 py-1 rounded-lg";
        dayButton.onclick = function () {
            openChecklist(i);
        };

        dayBox.appendChild(dayButton);
        calendarGrid.appendChild(dayBox);
    }
}

// Open Checklist Modal
function openChecklist(day) {
modalTitle.textContent = `Day ${day}`;
tasksColumn.innerHTML = "";
timeColumn.innerHTML = "";

let tasks = checklistData[`Day ${day}`] || [{ task: "Empty", time: "" }];

tasks.forEach(({ task, time }) => {
let taskItem = document.createElement("li");
taskItem.className = "flex items-center gap-4";
taskItem.innerHTML = `<input type="checkbox" class="form-checkbox h-5 w-5 text-blue-500"> <span>${task}</span>`;
tasksColumn.appendChild(taskItem);

let timeItem = document.createElement("li");
timeItem.className = "text-gray-600";
timeItem.textContent = time;
timeColumn.appendChild(timeItem);
});

modalOverlay.style.display = "flex"; // Show modal
}

// Close Modal
closeModal.addEventListener("click", () => {
modalOverlay.style.display = "none"; // Hide modal
});

// Close modal when clicking outside
modalOverlay.addEventListener("click", (e) => {
if (e.target === modalOverlay) {
modalOverlay.style.display = "none"; // Hide modal
}
});

// Event listeners for previous/next month buttons
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Render the calendar on page load
renderCalendar();