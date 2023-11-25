// Function to parse CSV data
function parseCSV(csv) {
    const rows = csv.split('\n');
    const labels = rows[0].split(',').slice(2, 14); // Extract month names from 'Jan' to 'Dec'
    const datasets = {};

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').slice(2, 14).map(parseFloat); // Extract temperature values
        const year = rows[i].split(',')[1].trim(); // Extract the year from the 2nd column

        if (!datasets[year]) {
            datasets[year] = {
                label: `Year ${year}`,
                data: [],
                backgroundColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.2)`,
                borderColor: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
                borderWidth: 2,
                pointRadius: 4,
            };
        }

        datasets[year].data.push(...values);
    }

    return { labels, datasets: Object.values(datasets) };
}

// Event listener for file input change
document.getElementById('csvFile').addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const csvData = e.target.result;
            const { labels, datasets } = parseCSV(csvData);

            const data = {
                labels: labels,
                datasets: datasets,
            };

            const config = {
                type: 'radar',
                data: data,
                options: {
                    scales: {
                        r: {
                            suggestedMin: 0,
                            suggestedMax: 100, // Adjust this based on your temperature range
                        },
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const dataset = context.dataset;
                                    const value = context.parsed.y;
                                    const fahrenheit = value * (9 / 5) + 32; // Convert Celsius to Fahrenheit
                                    return `${dataset.label}: ${value}°C (${fahrenheit.toFixed(1)}°F)`;
                                },
                            },
                        },
                    },
                },
            };

            const ctx = document.getElementById('radarChart').getContext('2d');
            const radarChart = new Chart(ctx, config);
        };

        reader.readAsText(file);
    }
});
