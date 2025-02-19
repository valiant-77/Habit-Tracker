
    //Progress page script
    // Bar Graph (Weekly Progress)
    const weeklyProgressChart = new Chart(document.getElementById('weeklyProgressChart'), {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // Days of the week
            datasets: [{
                label: 'Completion %',
                data: [80, 60, 90, 70, 85, 50, 95], // Example data (replace with real data)
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Blue color with transparency
                borderColor: 'rgba(59, 130, 246, 1)', // Solid blue border
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Completion %'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Days of the Week'
                    }
                }
            }
        }
    });

    // Heatmap (Monthly Progress)
    const heatmap = document.getElementById('heatmap');
    const daysInMonth = 31; // Example: January has 31 days
    const heatmapData = Array.from({ length: daysInMonth }, () => Math.floor(Math.random() * 100)); // Random data for heatmap

    heatmapData.forEach((value, index) => {
        const cell = document.createElement('div');
        cell.className = `h-8 w-8 rounded-sm ${getHeatmapColor(value)}`; // Dynamic color based on value
        cell.title = `Day ${index + 1}: ${value}%`; // Tooltip for each cell
        heatmap.appendChild(cell);
    });

    // Function to determine heatmap color based on value
    function getHeatmapColor(value) {
        if (value === 0) return 'bg-gray-200'; // No progress
        if (value <= 25) return 'bg-blue-100'; // Low progress
        if (value <= 50) return 'bg-blue-300'; // Medium progress
        if (value <= 75) return 'bg-blue-500'; // High progress
        return 'bg-blue-700'; // Very high progress
    }
