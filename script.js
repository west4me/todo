let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
const columns = {
    'todo': document.querySelector('#todo'),
    'in-progress': document.querySelector('#in-progress'),
    'closed': document.querySelector('#closed')
};

const categories = {
    'Home': 'fas fa-home',
    'Work': 'fas fa-briefcase',
    'Personal': 'fas fa-user',
    'Sprint': 'fas fa-running',
    // Add more categories and icons here...
};


function displayTasks() {
    Object.values(columns).forEach(column => column.innerHTML = '<h2>' + column.id.replace(/-/g, ' ').toUpperCase() + '</h2>');
    tasks.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = 'task ' + task.priority.toLowerCase();
        div.id = 'task-' + index;
        div.draggable = true;
        div.ondragover = allowDrop;
        div.ondrop = dropOnTask;
        div.ondragstart = drag;
        div.ondragenter = function() {
            this.classList.add('hovered');
        };
        div.ondragleave = function() {
            this.classList.remove('hovered');
        };
        div.ondragend = function() {
            this.classList.remove('hovered');
        };

        const priorityColor = {
            'High': '#ae2012',
            'Medium': '#ee9b00',
            'Low': '#94d2bd',
            'None': '#005f73',
            'Done': '#ddd'  // green color for done tasks
        };

        const starIcon = document.createElement('i');
        starIcon.className = 'fas fa-star';
        starIcon.style.cursor = 'pointer';
        starIcon.style.color = task.starred ? 'gold' : 'grey';
        starIcon.onclick = () => {
            tasks[index].starred = !tasks[index].starred;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            displayTasks();
        };
        div.appendChild(starIcon);

        div.style.borderColor= priorityColor[task.status === 'closed' ? 'Done' : task.originalPriority];


        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'rowwrapper';

        const rowInner = document.createElement('div');
        rowInner.className = 'rowInner';
        
        const btnGroup = document.createElement('div');
        btnGroup.className = 'd-md-flex justify-content-md-end';

        const infoGroup = document.createElement('div');
        infoGroup.className = 'info d-flex';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.innerHTML = `${task.title}`; 
        div.appendChild(title);

        const description = document.createElement('p');
        description.className = 'card-text text-truncate';
        description.textContent = task.description;
        div.appendChild(description);        

        const dueDate = document.createElement('div');
        dueDate.className = 'subtitle mr-2';
        dueDate.textContent = 'Due: ' + task.dueDate;
        rowInner.appendChild(dueDate);

        const editButton = document.createElement('button');
        editButton.className = 'btn btn-outline-primary btn-sm mr-2';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = () => openModal(index);
        div.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-outline-danger btn-sm';
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.onclick = () => deleteTask(index);
        div.appendChild(deleteButton);

        const viewButton = document.createElement('button');
        viewButton.className = 'btn btn-outline-info btn-sm mr-2';
        viewButton.innerHTML = '<i class="fas fa-eye"></i>';
        viewButton.onclick = () => viewTask(index);
        div.appendChild(viewButton);

        const category = document.createElement('p');
        category.className = 'card-text text-truncate';
        category.innerHTML = `<i class="${task.categoryIcon}"></i> ${task.category}`;
        div.appendChild(category);

        
        
        
        btnGroup.appendChild(viewButton);
        btnGroup.appendChild(editButton);
        btnGroup.appendChild(deleteButton);
        
        div.appendChild(infoGroup);
        
        // div.appendChild(btnGroup);
        div.appendChild(rowWrapper);
        rowWrapper.appendChild(rowInner);
        rowWrapper.appendChild(btnGroup);
 


        columns[task.status].appendChild(div);
    });
}

Object.values(columns).forEach(column => {
    column.ondragover = allowDrop;
    column.ondrop = dropOnEmptySpace;
});

function saveTask(e) {
    e.preventDefault();
    const task = {
        title: document.querySelector('#title').value,
        priority: document.querySelector('#priority').value,
        description: document.querySelector('#description').value,
        dueDate: document.querySelector('#due-date').value,
        originalPriority: document.querySelector('#priority').value,
        status: document.querySelector('#taskId').value ? tasks[document.querySelector('#taskId').value].status : 'todo',
        starred: false, // Initial star state
        category: document.querySelector('#category').value,
        categoryIcon: categories[document.querySelector('#category').value],
        createdDate: document.querySelector('#taskId').value ? tasks[document.querySelector('#taskId').value].createdDate : getCurrentDate(),        
    };
    const taskId = document.querySelector('#taskId').value;
    if (taskId) {
        tasks[taskId] = task;
    } else {
        tasks.push(task);
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    closeModal();
    displayTasks();
}


function deleteTask(index) {
    if (confirm('Are you sure you want to delete this task?')) {
        $('#view-modal').modal('hide');

        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    }
}

function viewTask(index) {
    if (tasks[index]) {
        document.querySelector('#view-title').innerText = tasks[index].title;
        document.querySelector('#view-priority').innerText = tasks[index].priority;
        document.querySelector('#view-description').innerText = tasks[index].description;
        document.querySelector('#view-due-date').innerText = tasks[index].dueDate;

        document.querySelector('#edit-button').onclick = () => openModal(index);
        document.querySelector('#delete-button').onclick = () => deleteTask(index);

        
        document.querySelector('#view-category').innerHTML = `<i class="${tasks[index].categoryIcon}"></i> ${tasks[index].category}`;
        // Display created date
        document.querySelector('#view-created-date').innerText = 'Created date: ' + tasks[index].createdDate;

       

        $('#view-modal').modal('show');
    }
}


function openModal(index) {
    $('#view-modal').modal('hide');

    if (index !== undefined && tasks[index]) {
        document.querySelector('#taskId').value = index;
        document.querySelector('#title').value = tasks[index].title;
        document.querySelector('#priority').value = tasks[index].priority;
        document.querySelector('#description').value = tasks[index].description;
        document.querySelector('#due-date').value = tasks[index].dueDate;    
        document.querySelector('#category').value = tasks[index].category;
    } else {
        document.querySelector('#taskId').value = '';
        document.querySelector('#title').value = '';
        document.querySelector('#priority').value = '';
        document.querySelector('#description').value = '';
        document.querySelector('#due-date').value = getCurrentDate();
    }
    $('#modal').modal('show');
    setTimeout(() => document.querySelector('#title').focus(), 500);
}
        
function closeModal() {
    document.querySelector('#task-form').reset();
    document.querySelector('#taskId').value = '';
    $('#modal').modal('hide');
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    var taskId = ev.target.id.split('-')[1];
    var task = tasks[taskId];
    ev.dataTransfer.setData("text", JSON.stringify(task));
}

function findTaskIndex(taskToFind) {
    return tasks.findIndex(t =>
        t.title === taskToFind.title &&
        t.priority === taskToFind.priority &&
        t.description === taskToFind.description &&
        t.dueDate === taskToFind.dueDate &&
        t.status === taskToFind.status
    );
}
        
function dropOnTask(ev) {
    ev.preventDefault();
    var task = JSON.parse(ev.dataTransfer.getData("text"));
    var draggingTaskIndex = findTaskIndex(task);

    var targetTaskId = ev.target.id.split('-')[1];
    var targetTaskIndex = parseInt(targetTaskId);

    if (isNaN(targetTaskIndex)) {
        return;
    }

    tasks.splice(draggingTaskIndex, 1);

    if (targetTaskIndex >= draggingTaskIndex) {
        targetTaskIndex--;
    }

    tasks.splice(targetTaskIndex, 0, task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    displayTasks();
}
        
function dropOnEmptySpace(ev) {
    ev.preventDefault();
    var task = JSON.parse(ev.dataTransfer.getData("text"));
    var draggingTaskIndex = findTaskIndex(task);
    var targetColumnId = ev.target.id;

    if (columns.hasOwnProperty(targetColumnId)) {
        tasks.splice(draggingTaskIndex, 1);
        if (task.status !== targetColumnId) {
            if (targetColumnId === 'closed') {
                task.priority = 'Done';
            } else if (task.status === 'closed' && targetColumnId !== 'closed') {
                task.priority = task.originalPriority;
            }
            task.status = targetColumnId;
        }
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
    }
}

function getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

function populateCategoryDropdown() {
    const categoryDropdown = document.querySelector('#category');
    categoryDropdown.innerHTML = '';
    Object.keys(categories).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryDropdown.appendChild(option);
    });
}

// Function to get the current time and update the HTML
function updateTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var seconds = currentTime.getSeconds();
    var amPM = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    // Pad the minutes and seconds with leading zeros if necessary
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;

    // Format the time as HH:MM:SS AM/PM
    var timeString = hours + ":" + minutes + ":" + seconds + " " + amPM;

    document.getElementById("current-time").textContent = timeString;

    // Update the time every second (1000 milliseconds)
    setTimeout(updateTime, 1000);
}



        
document.querySelector('#task-form').addEventListener('submit', saveTask);
document.querySelector('#add-btn').addEventListener('click', openModal);
displayTasks();


document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        openModal();
        setTimeout(() => document.querySelector('#title').focus(), 500);
    }
});

// Add event listener to the checkbox
document.getElementById('enable-due-date').addEventListener('change', function() {
    var dueDateField = document.getElementById('due-date');
    
    // Toggle the "hidden" class based on checkbox state
    if (this.checked) {
        dueDateField.classList.remove('hidden');
    } else {
        dueDateField.classList.add('hidden');
    }
});

window.onload = function() {
    populateCategoryDropdown();
    updateTime();
}