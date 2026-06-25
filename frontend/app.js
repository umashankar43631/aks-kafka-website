const API_BASE = 'http://127.0.0.1:8000/api';

// State
let selectedTopic = null;

// DOM Elements
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const topicsList = document.getElementById('topics-list');
const refreshTopicsBtn = document.getElementById('refresh-topics-btn');
const newTopicBtn = document.getElementById('new-topic-btn');
const selectedTopicDisplay = document.getElementById('selected-topic-display');
const sendMsgBtn = document.getElementById('send-msg-btn');
const mockDataBtn = document.getElementById('mock-data-btn');
const produceForm = document.getElementById('produce-form');
const notificationArea = document.getElementById('notification-area');

// Modal Elements
const modal = document.getElementById('new-topic-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const createTopicForm = document.getElementById('create-topic-form');

// Initialization
async function init() {
    await checkConfig();
    await fetchTopics();
}

// Notifications
function showNotification(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.textContent = msg;
    notificationArea.prepend(el);
    setTimeout(() => el.remove(), 5000);
}

// API Calls
async function checkConfig() {
    try {
        const res = await fetch(`${API_BASE}/config`);
        const data = await res.json();
        if (data.status === 'configured') {
            statusDot.className = 'dot connected';
            statusText.textContent = `Connected (${data.protocol})`;
        } else {
            statusDot.className = 'dot error';
            statusText.textContent = 'Backend unconfigured';
            showNotification(data.detail || 'Backend configuration error', 'error');
        }
    } catch (e) {
        statusDot.className = 'dot error';
        statusText.textContent = 'Backend Offline';
    }
}

async function fetchTopics() {
    topicsList.innerHTML = '<li class="loading-text">Loading...</li>';
    try {
        const res = await fetch(`${API_BASE}/topics`);
        if (!res.ok) throw new Error('Failed to fetch topics');
        const data = await res.json();
        
        topicsList.innerHTML = '';
        if (data.topics.length === 0) {
            topicsList.innerHTML = '<li class="loading-text">No topics found</li>';
        } else {
            data.topics.forEach(topic => {
                const li = document.createElement('li');
                li.textContent = topic;
                li.onclick = () => selectTopic(topic, li);
                topicsList.appendChild(li);
            });
        }
    } catch (e) {
        topicsList.innerHTML = '<li class="loading-text" style="color:var(--error)">Error loading topics</li>';
        showNotification(e.message, 'error');
    }
}

function selectTopic(topic, element) {
    selectedTopic = topic;
    selectedTopicDisplay.textContent = topic;
    selectedTopicDisplay.className = 'badge active';
    sendMsgBtn.disabled = false;

    // Update active class
    document.querySelectorAll('.topics-list li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
}

// Event Listeners
refreshTopicsBtn.addEventListener('click', fetchTopics);

newTopicBtn.addEventListener('click', () => {
    modal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

createTopicForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('new-topic-name').value;
    const partitions = parseInt(document.getElementById('partitions').value);
    const replication = parseInt(document.getElementById('replication').value);

    try {
        const res = await fetch(`${API_BASE}/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic_name: name, num_partitions: partitions, replication_factor: replication })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to create topic');
        
        showNotification(data.message, 'success');
        modal.classList.remove('active');
        fetchTopics();
    } catch (err) {
        showNotification(err.message, 'error');
    }
});

mockDataBtn.addEventListener('click', async () => {
    if (!selectedTopic) {
        showNotification('Please select a topic first to generate relevant mock data', 'error');
        return;
    }

    const originalText = mockDataBtn.innerText;
    mockDataBtn.innerText = 'Generating with AI...';
    mockDataBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/mock-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: selectedTopic })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to generate mock data');
        
        document.getElementById('message-key').value = data.key || '';
        document.getElementById('message-value').value = JSON.stringify(data.value, null, 2);
        
        showNotification('AI Mock data generated!', 'success');
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        mockDataBtn.innerText = originalText;
        mockDataBtn.disabled = false;
    }
});

produceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedTopic) return;

    const key = document.getElementById('message-key').value;
    const valueStr = document.getElementById('message-value').value;
    
    let valueObj;
    try {
        valueObj = JSON.parse(valueStr);
    } catch (err) {
        showNotification('Invalid JSON in payload', 'error');
        return;
    }

    sendMsgBtn.disabled = true;
    sendMsgBtn.innerHTML = 'Sending...';

    try {
        const res = await fetch(`${API_BASE}/produce`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: selectedTopic,
                key: key || null,
                value: valueObj
            })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Failed to produce message');
        
        showNotification(data.message, 'success');
    } catch (err) {
        showNotification(err.message, 'error');
    } finally {
        sendMsgBtn.disabled = false;
        sendMsgBtn.innerHTML = `Send to Kafka
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
    }
});

// Run
init();
