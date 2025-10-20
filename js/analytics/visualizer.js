/**
 * DTB Technologies Digital Museum - Analytics Visualizer
 * Renders and updates real-time analytics visualizations
 */

import { getAnalyticsData } from './statistics.js';

// Track active charts for updates
const activeCharts = {};

/**
 * Initialize the analytics visualizer
 * @param {string} timeframe - Initial timeframe to display ('daily', 'weekly', 'monthly')
 */
function initVisualizer(timeframe = 'daily') {
  // Set up the timeframe buttons
  setupTimeframeButtons();
  
  // Initial data load
  loadAnalyticsData(timeframe);
  
  // Set up real-time updates
  setupRealTimeUpdates();
  
  console.log('Analytics visualizer initialized');
}

/**
 * Set up timeframe selection buttons
 */
function setupTimeframeButtons() {
  const timeframeButtons = document.querySelectorAll('.analytics-timeframe-btn');
  
  timeframeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Remove active class from all buttons
      timeframeButtons.forEach(btn => {
        btn.classList.remove('bg-blue-500/20', 'text-blue-300');
        btn.classList.add('bg-slate-700/50', 'text-gray-300');
      });
      
      // Add active class to clicked button
      button.classList.remove('bg-slate-700/50', 'text-gray-300');
      button.classList.add('bg-blue-500/20', 'text-blue-300');
      
      // Get timeframe from button text or data attribute
      const timeframe = button.dataset.timeframe || button.textContent.toLowerCase();
      
      // Load data for the selected timeframe
      loadAnalyticsData(timeframe);
    });
  });
}

/**
 * Load analytics data and update all visualizations
 * @param {string} timeframe - Timeframe to display ('daily', 'weekly', 'monthly')
 */
function loadAnalyticsData(timeframe) {
  // Get data (this would fetch from Firebase in a real implementation)
  const data = getAnalyticsData(timeframe, true); // Using sample data for now
  
  // Update visitor counter
  updateVisitorCounter(data);
  
  // Update session time
  updateSessionTime(data);
  
  // Update project views
  updateProjectViews(data);
  
  // Update community stats
  updateCommunityStats(data);
  
  // Update charts
  updateVisitorChart(data, timeframe);
  
  console.log(`Loaded ${timeframe} analytics data`, data);
}

/**
 * Update the visitors counter
 * @param {Object} data - Analytics data
 */
function updateVisitorCounter(data) {
  const visitorCounter = document.querySelector('#visitor-counter');
  if (visitorCounter) {
    // Get the latest visitor count
    const visitorCount = data.visitors.daily[data.visitors.daily.length - 1];
    
    // Animate the counter
    animateCounter(visitorCounter, visitorCount);
  }
}

/**
 * Update the average session time
 * @param {Object} data - Analytics data
 */
function updateSessionTime(data) {
  const sessionTimeElement = document.querySelector('#session-time');
  if (sessionTimeElement) {
    // Get the latest session duration
    const sessionDuration = data.sessionDuration.average;
    
    // Format it with the minute indicator
    sessionTimeElement.innerHTML = `${sessionDuration}<span class="text-lg">min</span>`;
  }
}

/**
 * Update the project views counter
 * @param {Object} data - Analytics data
 */
function updateProjectViews(data) {
  const projectViewsElement = document.querySelector('#project-views');
  if (projectViewsElement) {
    // Animate the counter
    animateCounter(projectViewsElement, data.projectViews.total);
  }
}

/**
 * Update the community stats
 * @param {Object} data - Analytics data
 */
function updateCommunityStats(data) {
  const newMembersElement = document.querySelector('#new-members');
  if (newMembersElement) {
    // Animate the counter
    animateCounter(newMembersElement, data.communityStats.newMembers);
  }
}

/**
 * Update the visitors chart
 * @param {Object} data - Analytics data
 * @param {string} timeframe - Current timeframe ('daily', 'weekly', 'monthly')
 */
function updateVisitorChart(data, timeframe) {
  const chartContainer = document.querySelector('#visitor-chart');
  if (!chartContainer) return;
  
  // In a real implementation, this would use Chart.js or D3.js
  // For our prototype, we'll update the heights of our simulated bars
  
  const chartBars = chartContainer.querySelectorAll('.chart-bar');
  if (chartBars.length === 0) {
    // Create the bars if they don't exist yet
    createSimulatedChart(chartContainer, data.visitors[timeframe], timeframe);
  } else {
    // Update existing bars
    updateSimulatedChart(chartBars, data.visitors[timeframe]);
  }
}

/**
 * Create a simulated bar chart (placeholder for Chart.js implementation)
 * @param {HTMLElement} container - The chart container
 * @param {number[]} data - The data array
 * @param {string} timeframe - Current timeframe ('daily', 'weekly', 'monthly')
 */
function createSimulatedChart(container, data, timeframe) {
  // First clear the container
  container.innerHTML = '';
  
  // Create a bar for each data point
  data.forEach((value, index) => {
    // Normalize value to a percentage (0-100)
    const maxValue = Math.max(...data);
    const percentage = (value / maxValue) * 100;
    
    // Create the bar element
    const bar = document.createElement('div');
    bar.className = 'chart-bar w-8 bg-blue-500/70 rounded-t-lg';
    bar.style.height = `${percentage}%`;
    bar.style.animation = `grow-up 2s ease-out ${index * 0.1}s`;
    bar.dataset.value = value;
    
    // Add tooltip with the value
    bar.title = `${getTimeLabel(index, timeframe)}: ${value} visitors`;
    
    // Append to container
    container.appendChild(bar);
  });
  
  // Update the legend
  const chartTitle = document.querySelector('#chart-title');
  if (chartTitle) {
    chartTitle.textContent = 'Visitor Traffic';
  }
  
  const chartSubtitle = document.querySelector('#chart-subtitle');
  if (chartSubtitle) {
    chartSubtitle.textContent = getTimeframeLabel(timeframe);
  }
}

/**
 * Update a simulated bar chart with new data
 * @param {NodeList} chartBars - The chart bar elements
 * @param {number[]} data - The new data array
 */
function updateSimulatedChart(chartBars, data) {
  // Find the maximum value for scaling
  const maxValue = Math.max(...data);
  
  // Update each bar
  chartBars.forEach((bar, index) => {
    if (index < data.length) {
      const percentage = (data[index] / maxValue) * 100;
      
      // Animate the height change
      bar.style.height = '0%';
      bar.dataset.value = data[index];
      
      // Use a timeout to create an animation effect
      setTimeout(() => {
        bar.style.height = `${percentage}%`;
      }, 50);
    }
  });
}

/**
 * Get a label for a time point based on timeframe
 * @param {number} index - The index of the data point
 * @param {string} timeframe - The current timeframe
 * @returns {string} A formatted time label
 */
function getTimeLabel(index, timeframe) {
  const now = new Date();
  
  if (timeframe === 'daily') {
    // For daily, show the day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayIndex = (now.getDay() - (6 - index) + 7) % 7; // 6 days ago up to today
    return days[dayIndex];
  } else if (timeframe === 'weekly') {
    // For weekly, show the week number
    return `Week ${index + 1}`;
  } else {
    // For monthly, show the month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIndex = (now.getMonth() - (2 - index) + 12) % 12; // 2 months ago up to current
    return months[monthIndex];
  }
}

/**
 * Get a subtitle label for the current timeframe
 * @param {string} timeframe - The current timeframe
 * @returns {string} A formatted subtitle
 */
function getTimeframeLabel(timeframe) {
  if (timeframe === 'daily') {
    return 'Last 7 days';
  } else if (timeframe === 'weekly') {
    return 'Last 4 weeks';
  } else {
    return 'Last 3 months';
  }
}

/**
 * Animate a counter from its current value to a new value
 * @param {HTMLElement} element - The counter element
 * @param {number} newValue - The target value
 * @param {number} duration - Animation duration in milliseconds
 */
function animateCounter(element, newValue, duration = 1000) {
  // Parse the current value (remove any commas or other formatting)
  const currentText = element.innerText;
  const currentValue = parseInt(currentText.replace(/[^0-9]/g, ''), 10) || 0;
  
  // Calculate the interval for smooth animation
  const interval = 16; // roughly 60fps
  const steps = Math.ceil(duration / interval);
  const step = (newValue - currentValue) / steps;
  
  let count = currentValue;
  let currentStep = 0;
  
  // Clear any existing interval
  if (element.dataset.countInterval) {
    clearInterval(parseInt(element.dataset.countInterval, 10));
  }
  
  // Start the animation
  const countInterval = setInterval(() => {
    currentStep++;
    count += step;
    
    if (currentStep >= steps) {
      clearInterval(countInterval);
      count = newValue;
    }
    
    // Format the number with commas for thousands
    element.innerText = Math.round(count).toLocaleString();
  }, interval);
  
  // Store the interval ID for potential cancellation
  element.dataset.countInterval = countInterval;
}

/**
 * Set up real-time updates for analytics data
 * In a real implementation, this would listen to Firebase or WebSocket
 */
function setupRealTimeUpdates() {
  // In a real implementation, this would use Firebase's onValue() or similar
  // For our prototype, we'll simulate real-time updates with random variations
  
  const updateInterval = setInterval(() => {
    // Get the current timeframe
    const activeButton = document.querySelector('.analytics-timeframe-btn.bg-blue-500\/20');
    const timeframe = activeButton ? (activeButton.dataset.timeframe || activeButton.textContent.toLowerCase()) : 'daily';
    
    // Get the current data
    const data = getAnalyticsData(timeframe, true);
    
    // Simulate a small random change to the data
    simulateDataChange(data);
    
    // Update the visualizations
    updateVisitorCounter(data);
    updateSessionTime(data);
    updateProjectViews(data);
    updateCommunityStats(data);
    updateVisitorChart(data, timeframe);
    
    console.log('Real-time data updated');
  }, 30000); // Update every 30 seconds
  
  // Store the interval for cleanup
  window.analyticsUpdateInterval = updateInterval;
}

/**
 * Simulate a small random change to the analytics data
 * @param {Object} data - The analytics data object
 */
function simulateDataChange(data) {
  // Simulate a small increase in today's visitor count
  if (data.visitors.daily.length > 0) {
    const lastIndex = data.visitors.daily.length - 1;
    data.visitors.daily[lastIndex] += Math.floor(Math.random() * 5);
  }
  
  // Simulate a small change in project views
  data.projectViews.total += Math.floor(Math.random() * 3);
  
  // Randomly update one project's views
  const projects = Object.keys(data.projectViews.byProject);
  if (projects.length > 0) {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    data.projectViews.byProject[randomProject] += 1;
  }
  
  // Very occasionally add a new member
  if (Math.random() < 0.1) { // 10% chance
    data.communityStats.newMembers += 1;
  }
}

/**
 * Clean up the visualizer (e.g., when navigating away)
 */
function cleanupVisualizer() {
  // Clear any update intervals
  if (window.analyticsUpdateInterval) {
    clearInterval(window.analyticsUpdateInterval);
  }
  
  console.log('Analytics visualizer cleaned up');
}

// Export the public API
export {
  initVisualizer,
  loadAnalyticsData,
  cleanupVisualizer
};
