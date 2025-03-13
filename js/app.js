document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    
    // Initialize the dashboard
    try {
        updateDashboard();
        console.log("Dashboard updated successfully");
    } catch (error) {
        console.error("Error initializing dashboard:", error);
    }
    
    // Set up toggle buttons
    document.getElementById('compare-btn').addEventListener('click', () => setView('compare'));
    document.getElementById('trump1-btn').addEventListener('click', () => setView('trump1'));
    document.getElementById('biden-btn').addEventListener('click', () => setView('biden'));
    document.getElementById('trump2-btn').addEventListener('click', () => setView('trump2'));
    
    // Update the data every 5 minutes
    setInterval(updateDashboard, 5 * 60 * 1000);
});

function setView(view) {
    // Store the current view globally
    window.currentView = view;
    
    // Remove active class from all buttons
    document.querySelectorAll('.presidency-toggle button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected button
    document.getElementById(`${view}-btn`).classList.add('active');
    
    console.log(`View changed to: ${view}`);
    
    // Handle view change - show/hide appropriate columns
    const allColumns = document.querySelectorAll('.admin-column');
    
    if (view === 'compare') {
        // Show all columns
        allColumns.forEach(col => {
            col.style.display = 'block';
        });
        
        // Reset the grid layout
        document.querySelectorAll('.metric-comparison').forEach(comp => {
            comp.style.display = 'flex';
            comp.style.justifyContent = 'space-between';
        });
    } else {
        // Show only selected presidency's columns
        allColumns.forEach(col => {
            // Hide all columns first
            col.style.display = 'none';
        });
        
        // Show only the selected columns
        const columnIndex = view === 'trump1' ? 1 : view === 'biden' ? 2 : 3;
        document.querySelectorAll(`.admin-column:nth-child(${columnIndex})`).forEach(col => {
            col.style.display = 'block';
        });
        
        // Adjust the grid for single column
        document.querySelectorAll('.metric-comparison').forEach(comp => {
            comp.style.display = 'flex';
            comp.style.justifyContent = 'center';
        });
    }
    
    // Update the dashboard to redraw charts
    updateDashboard();
}

async function updateDashboard() {
    try {
        // Update each metric
        await Promise.all([
            fetchInflationData(),
            fetchUnemploymentData(),
            fetchSP500Data(),
            fetchGasPricesData()
        ]);
        
        // Update the timestamp
        document.getElementById('update-time').textContent = new Date().toLocaleString();
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

// Inflation Rate
async function fetchInflationData() {
    try {
        // For demo purposes, we'll use simulated data
        // In a real app, you would fetch from a reliable data source like:
        // - Bureau of Labor Statistics API (https://www.bls.gov/developers/)
        // - FRED API (https://fred.stlouisfed.org/docs/api/fred/)
        
        // Simulated Trump 1st term data (2017-2021)
        const trump1Data = {
            average: 1.9,
            range: {
                low: 0.1,  // May 2020 (COVID impact)
                high: 2.9,  // July 2018
            },
            monthlyData: [
                { date: '2017-01', value: 2.5 },
                { date: '2017-07', value: 1.7 },
                { date: '2018-01', value: 2.1 },
                { date: '2018-07', value: 2.9 },
                { date: '2019-01', value: 1.6 },
                { date: '2019-07', value: 1.8 },
                { date: '2020-01', value: 2.5 },
                { date: '2020-05', value: 0.1 },
                { date: '2020-12', value: 1.4 }
            ]
        };
        
        // Simulated Biden administration data (2021-2025)
        const bidenData = {
            average: 4.9,
            range: {
                low: 1.4,  // Early 2021
                high: 9.1,  // June 2022
            },
            monthlyData: [
                { date: '2021-01', value: 1.4 },
                { date: '2021-07', value: 5.4 },
                { date: '2022-01', value: 7.5 },
                { date: '2022-06', value: 9.1 },
                { date: '2022-12', value: 6.5 },
                { date: '2023-06', value: 3.0 },
                { date: '2023-12', value: 3.4 },
                { date: '2024-02', value: 3.2 },
                { date: '2024-08', value: 2.8 },  // Projected
                { date: '2024-12', value: 2.6 }   // Projected
            ]
        };
        
        // Projected Trump 2nd term data (2025-2029)
        const trump2Data = {
            average: 2.3,  // Projected based on first term and policies
            range: {
                low: 1.8,
                high: 3.2,
            },
            monthlyData: [
                { date: '2025-01', value: 2.7 },
                { date: '2025-07', value: 3.2 },
                { date: '2026-01', value: 2.6 },
                { date: '2026-07', value: 2.2 },
                { date: '2027-01', value: 1.9 },
                { date: '2027-07', value: 1.8 },
                { date: '2028-01', value: 2.0 },
                { date: '2028-07', value: 2.3 },
                { date: '2028-12', value: 2.5 }
            ]
        };
        
        // Update the UI for Trump 1st term
        document.getElementById('inflation-trump1-value').textContent = `${trump1Data.average}%`;
        document.getElementById('inflation-trump1-range').textContent = `Range: ${trump1Data.range.low}% - ${trump1Data.range.high}%`;
        
        // Update the UI for Biden
        document.getElementById('inflation-biden-value').textContent = `${bidenData.average}%`;
        document.getElementById('inflation-biden-range').textContent = `Range: ${bidenData.range.low}% - ${bidenData.range.high}%`;
        
        // Update the UI for Trump 2nd term
        document.getElementById('inflation-trump2-value').textContent = `${trump2Data.average}%`;
        document.getElementById('inflation-trump2-range').textContent = `Range: ${trump2Data.range.low}% - ${trump2Data.range.high}%`;
        
        // Create chart - destroy existing chart if it exists
        const canvas = document.getElementById('inflation-chart');
        const ctx = canvas.getContext('2d');
        
        // Check if there's an existing chart instance and destroy it
        if (window.inflationChart) {
            window.inflationChart.destroy();
        }
        
        // Create datasets based on the current view
        let datasets = [];
        
        // Check the current view to determine which datasets to show
        if (!window.currentView || window.currentView === 'compare') {
            // Show all datasets for the compare view
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump1') {
            // Show only Trump's 1st term
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'biden') {
            // Show only Biden's term
            datasets = [
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump2') {
            // Show only Trump's 2nd term
            datasets = [
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        }
        
        // Create new chart and store the instance
        window.inflationChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Inflation Rate (%)'
                        },
                        min: 0
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching inflation data:', error);
        document.getElementById('inflation-trump1-value').textContent = 'Error loading data';
        document.getElementById('inflation-biden-value').textContent = 'Error loading data';
        document.getElementById('inflation-trump2-value').textContent = 'Error loading data';
    }
}

// Unemployment Rate
async function fetchUnemploymentData() {
    try {
        // Trump 1st term (2017-2021)
        const trump1Data = {
            average: 4.7,
            range: {
                low: 3.5,  // Feb 2020 (pre-COVID)
                high: 14.8,  // April 2020 (COVID peak)
            },
            monthlyData: [
                { date: '2017-01', value: 4.7 },
                { date: '2017-07', value: 4.3 },
                { date: '2018-01', value: 4.0 },
                { date: '2018-07', value: 3.9 },
                { date: '2019-01', value: 4.0 },
                { date: '2019-07', value: 3.7 },
                { date: '2020-01', value: 3.6 },
                { date: '2020-04', value: 14.8 },
                { date: '2020-12', value: 6.7 }
            ]
        };
        
        // Biden term (2021-2025)
        const bidenData = {
            average: 4.1,
            range: {
                low: 3.4,  // April 2023
                high: 6.4,  // January 2021
            },
            monthlyData: [
                { date: '2021-01', value: 6.4 },
                { date: '2021-07', value: 5.4 },
                { date: '2022-01', value: 4.0 },
                { date: '2022-07', value: 3.5 },
                { date: '2023-01', value: 3.4 },
                { date: '2023-07', value: 3.5 },
                { date: '2024-01', value: 3.7 },
                { date: '2024-06', value: 3.9 },  // Projected
                { date: '2024-12', value: 4.1 }   // Projected
            ]
        };
        
        // Trump 2nd term projection (2025-2029)
        const trump2Data = {
            average: 3.8,  // Projected
            range: {
                low: 3.3,
                high: 4.5,
            },
            monthlyData: [
                { date: '2025-01', value: 4.0 },
                { date: '2025-07', value: 3.8 },
                { date: '2026-01', value: 3.6 },
                { date: '2026-07', value: 3.4 },
                { date: '2027-01', value: 3.3 },
                { date: '2027-07', value: 3.5 },
                { date: '2028-01', value: 3.7 },
                { date: '2028-07', value: 3.9 },
                { date: '2028-12', value: 4.5 }
            ]
        };
        
        // Update the UI
        document.getElementById('unemployment-trump1-value').textContent = `${trump1Data.average}%`;
        document.getElementById('unemployment-trump1-range').textContent = `Range: ${trump1Data.range.low}% - ${trump1Data.range.high}%`;
        
        document.getElementById('unemployment-biden-value').textContent = `${bidenData.average}%`;
        document.getElementById('unemployment-biden-range').textContent = `Range: ${bidenData.range.low}% - ${bidenData.range.high}%`;
        
        document.getElementById('unemployment-trump2-value').textContent = `${trump2Data.average}%`;
        document.getElementById('unemployment-trump2-range').textContent = `Range: ${trump2Data.range.low}% - ${trump2Data.range.high}%`;
        
        // Create chart - destroy existing chart if it exists
        const canvas = document.getElementById('unemployment-chart');
        const ctx = canvas.getContext('2d');
        
        // Check if there's an existing chart instance and destroy it
        if (window.unemploymentChart) {
            window.unemploymentChart.destroy();
        }
        
        // Create datasets based on the current view
        let datasets = [];
        
        // Check the current view to determine which datasets to show
        if (!window.currentView || window.currentView === 'compare') {
            // Show all datasets for the compare view
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump1') {
            // Show only Trump's 1st term
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'biden') {
            // Show only Biden's term
            datasets = [
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump2') {
            // Show only Trump's 2nd term
            datasets = [
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        }
        
        // Create new chart and store the instance
        window.unemploymentChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Unemployment Rate (%)'
                        },
                        min: 0
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching unemployment data:', error);
        document.getElementById('unemployment-trump1-value').textContent = 'Error loading data';
        document.getElementById('unemployment-biden-value').textContent = 'Error loading data';
        document.getElementById('unemployment-trump2-value').textContent = 'Error loading data';
    }
}

// S&P 500
async function fetchSP500Data() {
    try {
        // Trump 1st term (Jan 20, 2017 - Jan 20, 2021)
        const trump1Data = {
            startValue: 2271.0,  // Jan 20, 2017
            endValue: 3852.0,    // Jan 20, 2021
            percentChange: 69.6,  // Total percent change over 4 years
            annualizedReturn: 14.1,  // Annualized return
            monthlyData: [
                { date: '2017-01', value: 2271.0 },
                { date: '2017-07', value: 2470.0 },
                { date: '2018-01', value: 2872.0 },
                { date: '2018-07', value: 2816.0 },
                { date: '2019-01', value: 2670.0 },
                { date: '2019-07', value: 3020.0 },
                { date: '2020-01', value: 3330.0 },
                { date: '2020-03', value: 2305.0 },  // COVID crash
                { date: '2020-12', value: 3756.0 },
                { date: '2021-01', value: 3852.0 }
            ]
        };
        
        // Biden term (Jan 20, 2021 - Jan 20, 2025)
        const bidenData = {
            startValue: 3852.0,  // Jan 20, 2021
            currentValue: 5321.06,  // Recent value
            projectedEndValue: 5600.0,  // Projected Jan 20, 2025
            percentChange: 45.4,  // Projected total change over 4 years
            annualizedReturn: 9.8,  // Projected annualized return
            monthlyData: [
                { date: '2021-01', value: 3852.0 },
                { date: '2021-07', value: 4360.0 },
                { date: '2022-01', value: 4515.0 },
                { date: '2022-07', value: 4130.0 },
                { date: '2023-01', value: 4070.0 },
                { date: '2023-07', value: 4589.0 },
                { date: '2024-01', value: 4917.0 },
                { date: '2024-03', value: 5321.0 },
                { date: '2024-07', value: 5450.0 },  // Projected
                { date: '2024-12', value: 5600.0 }   // Projected
            ]
        };
        
        // Trump 2nd term projection (Jan 20, 2025 - Jan 20, 2029)
        const trump2Data = {
            startValue: 5600.0,  // Projected Jan 20, 2025
            endValue: 7280.0,    // Projected Jan 20, 2029
            percentChange: 30.0,  // Projected
            annualizedReturn: 6.8,  // Projected
            monthlyData: [
                { date: '2025-01', value: 5600.0 },
                { date: '2025-07', value: 5850.0 },
                { date: '2026-01', value: 6000.0 },
                { date: '2026-07', value: 6300.0 },
                { date: '2027-01', value: 6580.0 },
                { date: '2027-07', value: 6800.0 },
                { date: '2028-01', value: 7050.0 },
                { date: '2028-07', value: 7200.0 },
                { date: '2028-12', value: 7280.0 }
            ]
        };
        
        // Update the UI
        document.getElementById('sp500-trump1-value').textContent = `+${trump1Data.percentChange}%`;
        document.getElementById('sp500-trump1-range').textContent = `${trump1Data.startValue.toLocaleString()} → ${trump1Data.endValue.toLocaleString()}`;
        
        document.getElementById('sp500-biden-value').textContent = `+${bidenData.percentChange}%`;
        document.getElementById('sp500-biden-range').textContent = `${bidenData.startValue.toLocaleString()} → ${bidenData.projectedEndValue.toLocaleString()}`;
        
        document.getElementById('sp500-trump2-value').textContent = `+${trump2Data.percentChange}%`;
        document.getElementById('sp500-trump2-range').textContent = `${trump2Data.startValue.toLocaleString()} → ${trump2Data.endValue.toLocaleString()}`;
        
        // Create chart - destroy existing chart if it exists
        const canvas = document.getElementById('sp500-chart');
        const ctx = canvas.getContext('2d');
        
        // Check if there's an existing chart instance and destroy it
        if (window.sp500Chart) {
            window.sp500Chart.destroy();
        }
        
        // Create datasets based on the current view
        let datasets = [];
        
        // Check the current view to determine which datasets to show
        if (!window.currentView || window.currentView === 'compare') {
            // Show all datasets for the compare view
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump1') {
            // Show only Trump's 1st term
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'biden') {
            // Show only Biden's term
            datasets = [
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump2') {
            // Show only Trump's 2nd term
            datasets = [
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        }
        
        // Create new chart and store the instance
        window.sp500Chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'S&P 500 Index'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching S&P 500 data:', error);
        document.getElementById('sp500-trump1-value').textContent = 'Error loading data';
        document.getElementById('sp500-biden-value').textContent = 'Error loading data';
        document.getElementById('sp500-trump2-value').textContent = 'Error loading data';
    }
}

// Gas Prices
async function fetchGasPricesData() {
    try {
        // Trump 1st term (2017-2021)
        const trump1Data = {
            average: 2.57,
            range: {
                low: 1.87,  // April 2020 (COVID impact)
                high: 2.98,  // May 2018
            },
            monthlyData: [
                { date: '2017-01', value: 2.35 },
                { date: '2017-07', value: 2.28 },
                { date: '2018-01', value: 2.56 },
                { date: '2018-05', value: 2.98 },
                { date: '2019-01', value: 2.27 },
                { date: '2019-07', value: 2.78 },
                { date: '2020-01', value: 2.57 },
                { date: '2020-04', value: 1.87 },
                { date: '2020-12', value: 2.25 }
            ]
        };
        
        // Biden term (2021-2025)
        const bidenData = {
            average: 3.49,
            range: {
                low: 2.42,  // January 2021
                high: 5.01,  // June 2022
            },
            monthlyData: [
                { date: '2021-01', value: 2.42 },
                { date: '2021-07', value: 3.21 },
                { date: '2022-01', value: 3.41 },
                { date: '2022-06', value: 5.01 },
                { date: '2022-12', value: 3.33 },
                { date: '2023-06', value: 3.60 },
                { date: '2023-12', value: 3.15 },
                { date: '2024-03', value: 3.23 },
                { date: '2024-07', value: 3.35 },  // Projected
                { date: '2024-12', value: 3.25 }   // Projected
            ]
        };
        
        // Trump 2nd term projection (2025-2029)
        const trump2Data = {
            average: 2.75,  // Projected
            range: {
                low: 2.35,
                high: 3.30,
            },
            monthlyData: [
                { date: '2025-01', value: 3.10 },
                { date: '2025-07', value: 2.80 },
                { date: '2026-01', value: 2.65 },
                { date: '2026-07', value: 2.50 },
                { date: '2027-01', value: 2.40 },
                { date: '2027-07', value: 2.35 },
                { date: '2028-01', value: 2.70 },
                { date: '2028-07', value: 3.30 },
                { date: '2028-12', value: 2.95 }
            ]
        };
        
        // Update the UI
        document.getElementById('gas-trump1-value').textContent = `$${trump1Data.average.toFixed(2)}`;
        document.getElementById('gas-trump1-range').textContent = `Range: $${trump1Data.range.low.toFixed(2)} - $${trump1Data.range.high.toFixed(2)}`;
        
        document.getElementById('gas-biden-value').textContent = `$${bidenData.average.toFixed(2)}`;
        document.getElementById('gas-biden-range').textContent = `Range: $${bidenData.range.low.toFixed(2)} - $${bidenData.range.high.toFixed(2)}`;
        
        document.getElementById('gas-trump2-value').textContent = `$${trump2Data.average.toFixed(2)}`;
        document.getElementById('gas-trump2-range').textContent = `Range: $${trump2Data.range.low.toFixed(2)} - $${trump2Data.range.high.toFixed(2)}`;
        
        // Create chart - destroy existing chart if it exists
        const canvas = document.getElementById('gas-chart');
        const ctx = canvas.getContext('2d');
        
        // Check if there's an existing chart instance and destroy it
        if (window.gasChart) {
            window.gasChart.destroy();
        }
        
        // Create datasets based on the current view
        let datasets = [];
        
        // Check the current view to determine which datasets to show
        if (!window.currentView || window.currentView === 'compare') {
            // Show all datasets for the compare view
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump1') {
            // Show only Trump's 1st term
            datasets = [
                {
                    label: 'Trump 1st Term',
                    data: trump1Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'biden') {
            // Show only Biden's term
            datasets = [
                {
                    label: 'Biden Term',
                    data: bidenData.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.3
                }
            ];
        } else if (window.currentView === 'trump2') {
            // Show only Trump's 2nd term
            datasets = [
                {
                    label: 'Trump 2nd Term (Projected)',
                    data: trump2Data.monthlyData.map(d => ({ x: d.date, y: d.value })),
                    borderColor: '#8e44ad',
                    backgroundColor: 'rgba(142, 68, 173, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3
                }
            ];
        }
        
        // Create new chart and store the instance
        window.gasChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        title: {
                            display: true,
                            text: 'Date'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Gas Price ($/gallon)'
                        },
                        min: 0
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching gas prices data:', error);
        document.getElementById('gas-trump1-value').textContent = 'Error loading data';
        document.getElementById('gas-biden-value').textContent = 'Error loading data';
        document.getElementById('gas-trump2-value').textContent = 'Error loading data';
    }
}