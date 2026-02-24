// State Management
let tasks = [
    { id: 1, title: 'Final Year Major Project', desc: 'Complete Chapter 4 and 5 of Project Documentation.', date: '2026-03-01', priority: 'high', completed: false, file: 'documentation-guidelines.pdf' },
    { id: 2, title: 'Advanced Java Practical', desc: 'Submit the JSP & Servlet assignments on the portal.', date: '2026-02-28', priority: 'medium', completed: false, file: null }
];

const announcements = [
    { id: 1, title: 'BCA Final Exams Schedule Released', date: '2026-02-20', body: 'Please check your portal for the 6th semester final examination schedule. Ensure all missing practical files are submitted before the deadlines.' },
    { id: 2, title: 'Project Viva Voce Dates', date: '2026-02-18', body: 'The dates for the external viva voce for your Major Project have been finalized. Please check your assigned slots.' }
];

let activityLog = [
    { id: 1, text: 'Logged into EduTrack Portal.', time: new Date().toISOString() }
];

const calendarEvents = [
    { title: 'TechHack Hackathon', date: '2026-03-05' },
    { title: 'Amity Youth Fest 2026', date: '2026-03-12' },
    { title: 'Guest Lecture: ML in Next.js', date: '2026-03-20' },
    { title: 'BCA Alumni Meetup', date: '2026-03-25' },
    { title: 'Inter-College Coding Competition', date: '2026-03-28' }
];

let currentFilter = 'all';
let currentSearch = '';

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

const navItems = document.querySelectorAll('.nav-item');
const contentContainers = document.querySelectorAll('.content-container');
const pageTitle = document.getElementById('page-title');
const pageSubtitle = document.getElementById('page-subtitle');

const taskList = document.getElementById('task-list');
const announcementList = document.getElementById('announcement-list');

const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const closeBtn = document.querySelector('.close-btn');
const taskForm = document.getElementById('task-form');

// Feature DOM Elements
const darkModeToggle = document.getElementById('dark-mode-toggle');
const statTotal = document.getElementById('stat-total');
const statCompleted = document.getElementById('stat-completed');
const statPending = document.getElementById('stat-pending');
const progressCircle = document.getElementById('progress-circle');
const progressText = progressCircle.querySelector('.progress-text');

// Phase 2 Elements
const searchInput = document.getElementById('task-search');
const filterChips = document.querySelectorAll('.chip');
const activityList = document.getElementById('activity-list');
const stickyNote = document.getElementById('sticky-note');
const userLevel = document.getElementById('user-level');
const snsModal = document.getElementById('sns-modal');
const previewModal = document.getElementById('preview-modal');
const urgentTasksList = document.getElementById('urgent-tasks-list');
const bellIcon = document.getElementById('bell-icon');
const notifDropdown = document.getElementById('notif-dropdown');
const bellBadge = document.getElementById('bell-badge');

// Phase 3 Elements
const examCountdown = document.getElementById('exam-countdown');
const studyBar = document.getElementById('study-bar');
const studyFraction = document.getElementById('study-fraction');

// Calendar State
let currentDate = new Date(2026, 2, 1); // Mock starting March 2026

// Study State
let studyHours = parseInt(localStorage.getItem('studyHours') || '0');
const dailyTarget = 4;

// --- Init ---
stickyNote.value = localStorage.getItem('stickyNote') || '';
stickyNote.addEventListener('input', (e) => localStorage.setItem('stickyNote', e.target.value));

updateStudyProgress();
calculateExamCountdown();

// --- Theme Management ---
// Check saved preference
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.checked = true;
}

darkModeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
});

// --- Authentication UI Flow ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // Simulate AWS Cognito Login
    showToast('Login successful. Generating AWS tokens...', 'success');

    setTimeout(() => {
        authView.classList.replace('active', 'hidden');
        dashboardView.classList.replace('hidden', 'active');
        renderTasks();
        renderAnnouncements();
        renderActivity();
        checkUrgentTasks();
    }, 1500);
});

logoutBtn.addEventListener('click', () => {
    dashboardView.classList.replace('active', 'hidden');
    authView.classList.replace('hidden', 'active');
    loginForm.reset();
});

// --- Navigation ---
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();

        // Update active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Handle views
        const target = item.getAttribute('data-target');
        contentContainers.forEach(container => {
            container.classList.remove('active');
            container.classList.add('hidden');
        });

        document.getElementById(`${target}-container`).classList.remove('hidden');
        document.getElementById(`${target}-container`).classList.add('active');

        // Update headers
        if (target === 'board') {
            pageTitle.textContent = 'Task Dashboard';
            pageSubtitle.textContent = 'Track your assignments and deadlines';
            addTaskBtn.style.display = 'block';
            updateAnalytics();
        } else if (target === 'calendar') {
            pageTitle.textContent = 'Academic Calendar';
            pageSubtitle.textContent = 'Schedule and due dates';
            addTaskBtn.style.display = 'none';
            renderCalendar();
        } else if (target === 'announcements') {
            pageTitle.textContent = 'Faculty Announcements';
            pageSubtitle.textContent = 'Important updates and alerts';
            addTaskBtn.style.display = 'none';
        } else if (target === 'settings') {
            pageTitle.textContent = 'Account Settings';
            pageSubtitle.textContent = 'Manage your preferences';
            addTaskBtn.style.display = 'none';
        }
    });
});

// --- Modal Handling ---
addTaskBtn.addEventListener('click', () => {
    taskModal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    taskModal.classList.remove('active');
    taskForm.reset();
});

// --- Search & Filters ---
searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderTasks();
});

filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        renderTasks();
    });
});

// --- Notifications ---
bellIcon.addEventListener('click', (e) => {
    // hide badge
    bellBadge.style.display = 'none';

    // Toggle display
    if (notifDropdown.style.display === 'none') {
        notifDropdown.style.display = 'flex';
    } else {
        notifDropdown.style.display = 'none';
    }
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!bellIcon.contains(e.target)) {
        notifDropdown.style.display = 'none';
    }
});

// --- Core Features (Tasks CRUD) ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('task-file');
    const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : null;

    const newTask = {
        id: Date.now(),
        title: document.getElementById('task-title').value,
        desc: document.getElementById('task-desc').value,
        date: document.getElementById('task-date').value,
        priority: document.getElementById('task-priority').value,
        completed: false,
        file: fileName
    };

    tasks.push(newTask);
    logActivity(`Created task "${newTask.title}"`);
    renderTasks();
    taskModal.classList.remove('active');
    taskForm.reset();
    showToast('Task added successfully', 'success');
});

window.deleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    tasks = tasks.filter(t => t.id !== id);
    logActivity(`Deleted task "${task.title}"`);
    renderTasks();
    showToast('Task removed', 'warn');
};

window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        const action = task.completed ? 'Completed' : 'Reopened';
        logActivity(`${action} task "${task.title}"`);
        renderTasks();
    }
};

window.previewFile = (fileName) => {
    document.getElementById('preview-title').textContent = `Preview: ${fileName}`;
    previewModal.classList.add('active');
    logActivity(`Previewed document "${fileName}" via S3 simulation`);
};

function renderTasks() {
    taskList.innerHTML = '';

    // Sort and Filter tasks
    let filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(currentSearch) || t.desc.toLowerCase().includes(currentSearch);
        const matchesFilter =
            currentFilter === 'all' ||
            (currentFilter === 'completed' && t.completed) ||
            (currentFilter === 'pending' && !t.completed) ||
            (currentFilter === 'high' && t.priority === 'high');
        return matchesSearch && matchesFilter;
    });

    const sortedTasks = filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedTasks.forEach(task => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = !task.completed && task.date < today;

        const card = document.createElement('div');
        card.className = `task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        card.style.opacity = task.completed ? '0.6' : '1';

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title" style="text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.title}</div>
                <div class="${task.completed ? 'a-date' : 'badge'}" style="${!task.completed ? 'position:static; width:auto; padding: 2px 8px; border-radius: 12px; font-weight:normal;' : ''} ${task.priority === 'high' ? 'background: var(--danger)' : task.priority === 'medium' ? 'background: var(--warning)' : 'background: var(--success)'}">
                    ${task.priority.toUpperCase()}
                </div>
            </div>
            <div class="task-desc">${task.desc}</div>
            <div class="task-footer">
                <div class="task-date ${isOverdue ? 'overdue' : ''}">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    ${new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    ${isOverdue ? '(Overdue)' : ''}
                </div>
                <div class="task-actions" style="display:flex; gap: 0.5rem;">
                    ${task.file ? `<button onclick="previewFile('${task.file}')" title="Preview Attached Document" style="color:var(--amity-blue)"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg></button>` : ''}
                    <button class="complete-task" onclick="toggleTask(${task.id})" title="${task.completed ? 'Mark pending' : 'Mark done'}">
                        <svg width="20" height="20" fill="none" stroke="${task.completed ? 'var(--success)' : 'currentColor'}" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </button>
                    <button class="delete-task" onclick="deleteTask(${task.id})" title="Delete task">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `;
        taskList.appendChild(card);
    });
    updateAnalytics();
}

function renderAnnouncements() {
    announcementList.innerHTML = '';

    announcements.forEach(ann => {
        const item = document.createElement('div');
        item.className = 'announcement-card';
        item.innerHTML = `
            <div class="a-header">
                <div class="a-title">${ann.title}</div>
                <div class="a-date">${new Date(ann.date).toLocaleDateString()}</div>
            </div>
            <div class="a-body">${ann.body}</div>
        `;
        announcementList.appendChild(item);
    });
}

function renderActivity() {
    activityList.innerHTML = '';
    activityLog.forEach(log => {
        const div = document.createElement('div');
        div.style = "display:flex; justify-content:space-between; font-size:0.85rem; padding-bottom:0.5rem; border-bottom:1px solid var(--border-color); color:var(--text-secondary);";

        const timestamp = new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        div.innerHTML = `<span>${log.text}</span> <span style="font-size:0.75rem; opacity:0.7">${timestamp}</span>`;
        activityList.appendChild(div);
    });
}

function logActivity(text) {
    activityLog.unshift({ id: Date.now(), text, time: new Date().toISOString() });
    if (activityLog.length > 10) activityLog.pop(); // Keep last 10
    renderActivity();
}

// --- Features ---
function updateAnalytics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    statTotal.textContent = total;
    statCompleted.textContent = completed;
    statPending.textContent = pending;

    const pop = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressText.textContent = `${pop}%`;
    progressCircle.style.background = `conic-gradient(var(--success) ${pop}%, rgba(0,0,0,0.1) 0%)`;

    // Gamification computation
    const earnedExp = completed * 50;
    const baseExp = 3000;
    const totalExp = baseExp + earnedExp;

    // 3000 base + 50 per task
    let level = 31 + Math.floor(earnedExp / 150);
    let rank = 'BCA Senior Scholar';

    userLevel.innerHTML = `
        <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        Lvl ${level}: ${rank} (${totalExp} XP)
    `;
}

// Phase 3: Daily Study Tracker
window.logStudyTime = (hours) => {
    if (studyHours < dailyTarget) {
        studyHours += hours;
        localStorage.setItem('studyHours', studyHours);
        updateStudyProgress();
        logActivity(`Logged ${hours} hour(s) of study time.`);
    } else {
        showToast('Daily target already reached! Great job.', 'success');
    }
}

window.resetStudyTime = () => {
    studyHours = 0;
    localStorage.setItem('studyHours', studyHours);
    updateStudyProgress();
    showToast('Study progress reset.', 'warn');
}

function updateStudyProgress() {
    studyFraction.textContent = `${studyHours} / ${dailyTarget} Hrs`;
    const percentage = Math.min((studyHours / dailyTarget) * 100, 100);
    studyBar.style.width = `${percentage}%`;
    studyBar.style.background = percentage === 100 ? 'var(--amity-yellow)' : 'var(--success)';
}

// Phase 3: Exam Countdown
function calculateExamCountdown() {
    const examDate = new Date('2026-03-15T00:00:00'); // Mock exam
    const today = new Date();

    // Difference in time
    const diffTime = Math.abs(examDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    examCountdown.innerHTML = `${diffDays} <span style="font-size:1rem;">Days Left</span>`;
}

function checkUrgentTasks() {
    const today = new Date().toISOString().split('T')[0];
    const urgent = tasks.filter(t => !t.completed && t.date === today);

    if (urgent.length > 0) {
        urgentTasksList.innerHTML = '';
        urgent.forEach(t => {
            urgentTasksList.innerHTML += `<div style="padding:0.5rem; background:rgba(231, 76, 60, 0.1); border-radius:4px; font-weight:600; color:var(--text-primary);">&bull; ${t.title}</div>`;
        });
        snsModal.classList.add('active');
    }
}

function renderCalendar() {
    const calDates = document.getElementById('cal-dates');
    const calMonthYear = document.getElementById('cal-month-year');
    calDates.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calMonthYear.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        const div = document.createElement('div');
        div.className = 'empty';
        calDates.appendChild(div);
    }

    // Days
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.style.flexDirection = 'column'; // Allow stacking numbers and event text
        div.style.padding = '4px';

        const dayNum = document.createElement('span');
        dayNum.textContent = i;
        div.appendChild(dayNum);

        // Highlight today
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            div.classList.add('today');
        }

        // Find tasks on this date
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        if (tasks.some(t => t.date === dateStr && !t.completed)) {
            div.classList.add('has-task');
        }

        // Find events
        const evt = calendarEvents.find(e => e.date === dateStr);
        if (evt) {
            div.classList.add('has-event');

            // Explicitly show the event name below the date
            const evtText = document.createElement('span');
            evtText.className = 'cal-event-text';
            evtText.textContent = evt.title;
            div.appendChild(evtText);
        }

        calDates.appendChild(div);
    }
}

document.getElementById('cal-prev').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('cal-next').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// --- Utils ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>'}
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
