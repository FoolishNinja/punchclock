const URL = 'http://localhost:8081';
let entries = [], categories = [], currentEntryId = -1;

let loginContainer, registerContainer, workTimeOverviewContainer, addWorkTimeContainer, editWorkTimeContainer,
    loginForm, registerForm,
    addWorkTimeForm, entriesTableBody, addWorkTimeInputCategory, editWorkTimeInputCategory, editWorkTimeForm;

const formatDate = (date) => {
    let d = date;
    if (typeof date === 'string') d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
}

const getHeaders = () => {
    if (localStorage.getItem('bearer') === null) return {
        'Content-Type': 'application/json'
    };
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('bearer')}`
    }
};

const login = async (username, password) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({username, password})
        })
            .then(async res => {
                if (res.status === 200) {
                    localStorage.setItem('bearer', res.headers.get('Authorization').split('Bearer ')[1]);
                    toggleLogin('none');
                    entries = await getEntries();
                    categories = await getCategories();
                    toggleWorkTimeOverview();
                } else reject();
            })
            .catch(err => reject(err));
    });
};

const register = async (username, password) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users/sign-up`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({username, password})
        })
            .then(res => {
                if (res.status === 200) {
                    toggleRegister();
                    login(username, password);
                    resolve(true);
                } else reject();
            })
            .catch(err => reject(err));
    });
};

const getCategories = async () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/categories`, {
            method: 'GET',
            headers: getHeaders()
        })
            .then(res => res.json().then(ele => resolve(ele)))
            .catch(err => reject(err))
    });
};

const createEntry = async (category, checkIn, checkOut) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/entries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                category: categories.filter(c => c.name === category)[0],
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString()
            })
        })
            .then(res => {
                res.json().then(data => {
                    if (res.status === 201) {
                        resolve(data);
                        return;
                    }
                    reject(null);
                })
            })
            .catch(err => reject(err));
    });
};

const updateEntry = (category, checkIn, checkOut) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/entries/${currentEntryId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                category: categories.filter(c => c.name === category)[0],
                checkIn: checkIn.toISOString(),
                checkOut: checkOut.toISOString()
            })
        })
            .then(res => {
                res.json().then(data => {
                    if (res.status === 200) {
                        resolve(data);
                        return;
                    }
                    reject(null);
                })
            })
            .catch(err => reject(err));
    });
};

const getEntries = async () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/entries`, {
            method: 'GET',
            headers: getHeaders()
        })
            .then(res => res.json().then(ele => resolve(ele)))
            .catch(err => reject(err))
    });
};

const deleteEntry = async (id) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/entries/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        })
            .then(res => {
                entries.splice(entries.map(entry => entry.id).indexOf(id), 1);
                displayEntries();
                resolve(true);
            })
            .catch(err => reject(err));
    });
};

const isAuthenticated = async () => {
    return new Promise(async resolve => {
        if (localStorage.getItem('bearer') === null) {
            resolve(false);
            return;
        }
        try {
            entries = await getEntries();
            categories = await getCategories();
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

const displayEntries = () => {
    entriesTableBody.innerHTML = '';
    for (const entry of entries.sort((a, b) => a.id > b.id ? 1 : -1)) {
        const tr = document.createElement('tr');
        let entryIdTd = document.createElement('td');
        entryIdTd.scope = 'row';
        entryIdTd.innerText = entry.id;
        let entryUsernameTd = document.createElement('td');
        entryUsernameTd.innerText = entry.applicationUser.username;
        let entryCategoryTd = document.createElement('td');
        entryCategoryTd.innerText = entry.category.name;
        let entryCheckInTd = document.createElement('td');
        entryCheckInTd.innerText = formatDate(entry.checkIn);
        let entryCheckOutTd = document.createElement('td');
        entryCheckOutTd.innerText = formatDate(entry.checkOut);
        let entryEditButtonTd = document.createElement('td');
        let entryEditButton = document.createElement('button');
        entryEditButton.className = 'btn btn-primary';
        entryEditButton.innerText = 'Edit';
        entryEditButton.addEventListener('click', () => toggleEditEntry(entry.id));
        entryEditButtonTd.appendChild(entryEditButton);
        let entryDeleteButtonTd = document.createElement('td');
        let entryDeleteButton = document.createElement('button');
        entryDeleteButton.className = 'btn btn-danger';
        entryDeleteButton.innerText = 'Delete';
        entryDeleteButton.addEventListener('click', () => toggleDeleteEntry(entry.id));
        entryDeleteButtonTd.appendChild(entryDeleteButton);
        tr.append(entryIdTd, entryUsernameTd, entryCategoryTd, entryCheckInTd, entryCheckOutTd, entryEditButtonTd, entryDeleteButtonTd);
        entriesTableBody.appendChild(tr);
    }
};

const displayCategories = () => {
    addWorkTimeInputCategory.innerHTML = '';
    for (const category of categories) {
        let option = document.createElement('option');
        option.value = category.name;
        option.innerText = category.name;
        addWorkTimeInputCategory.appendChild(option);
    }
};

const displayEntry = (id) => {
    currentEntryId = id;
    editWorkTimeInputCategory.innerHTML = '';
    const entry = entries.filter(entry => entry.id === id)[0];
    for (const category of categories) {
        let option = document.createElement('option');
        option.value = category.name;
        option.innerText = category.name;
        option.selected = category.id === entry.category.id;
        editWorkTimeInputCategory.appendChild(option);
    }
    document.getElementById('editWorkTimeInputCheckIn').value = entry.checkIn.substring(0, entry.checkIn.length - 3);
    document.getElementById('editWorkTimeInputCheckOut').value = entry.checkOut.substring(0, entry.checkOut.length - 3);
};

const toggleLogin = (d) => {
    const display = loginContainer.style.display;
    loginContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
};

const toggleRegister = (d) => {
    const display = registerContainer.style.display;
    registerContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
};

const toggleWorkTimeOverview = (d) => {
    const display = workTimeOverviewContainer.style.display;
    workTimeOverviewContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
    toggleAddNewWorkTime('none');
    toggleEditNewWorkTime('none');
    displayEntries();
};

const toggleAddNewWorkTime = (d) => {
    const display = addWorkTimeContainer.style.display;
    addWorkTimeContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
    displayCategories();
};

const toggleEditNewWorkTime = (d) => {
    const display = editWorkTimeContainer.style.display;
    editWorkTimeContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
};

const toggleEditEntry = (id) => {
    displayEntry(id);
    toggleWorkTimeOverview('none');
    toggleEditNewWorkTime();
};

const toggleDeleteEntry = async (id) => {
    if (!confirm('Are you sure you want to delete this work time?')) return;
    await deleteEntry(id);
};

const promptLogin = () => {
    toggleRegister('none');
    toggleLogin();
};

const promptRegister = () => {
    toggleLogin('none');
    toggleRegister();
};

const promptAddNewWorkTime = () => {
    toggleWorkTimeOverview('none');
    toggleAddNewWorkTime();
};

const handleLogin = async () => {
    const loginInputUsername = document.getElementById('loginInputUsername');
    const loginInputPassword = document.getElementById('loginInputPassword');
    if (loginInputUsername.value.length === 0 || loginInputPassword.value.length === 0) return;
    try {
        await login(loginInputUsername.value, loginInputPassword.value)
    } catch (err) {
        alert('Wrong username or password');
    }
};

const handleRegister = async () => {
    const registerInputUsername = document.getElementById('registerInputUsername');
    const registerInputPassword = document.getElementById('registerInputPassword');
    const registerInputRepeatPassword = document.getElementById('registerInputRepeatPassword');
    if (registerInputUsername.value.length === 0 || registerInputPassword.value.length === 0 || registerInputRepeatPassword.value.length === 0 || registerInputPassword.value !== registerInputRepeatPassword.value) return;
    try {

        await register(registerInputUsername.value, registerInputPassword.value);
    } catch (err) {
        alert('Username taken or passwords don\'t match');
    }
};

const handleAddWorkTime = async () => {
    const addWorkTimeInputCategory = document.getElementById('addWorkTimeInputCategory');
    const addWorkTimeInputCheckIn = document.getElementById('addWorkTimeInputCheckIn');
    const addWorkTimeInputCheckOut = document.getElementById('addWorkTimeInputCheckOut');
    if (!categories.map(category => category.name).includes(addWorkTimeInputCategory.value) || addWorkTimeInputCheckIn.value.length === 0 || addWorkTimeInputCheckOut.value.length === 0) return;
    const checkInDate = new Date(addWorkTimeInputCheckIn.value);
    const checkOutDate = new Date(addWorkTimeInputCheckOut.value);
    const entry = await createEntry(addWorkTimeInputCategory.value, checkInDate, checkOutDate);
    if (entry !== null) entries.push(entry);
    toggleWorkTimeOverview();
    addWorkTimeInputCategory.value = undefined;
    addWorkTimeInputCheckIn.value = undefined;
    addWorkTimeInputCheckOut.value = 0;
};

const handleEditWorkTime = async () => {
    const editWorkTimeInputCategory = document.getElementById('editWorkTimeInputCategory');
    const editWorkTimeInputCheckIn = document.getElementById('editWorkTimeInputCheckIn');
    const editWorkTimeInputCheckOut = document.getElementById('editWorkTimeInputCheckOut');
    if (!categories.map(category => category.name).includes(editWorkTimeInputCategory.value) || editWorkTimeInputCheckIn.value.length === 0 || editWorkTimeInputCheckOut.value.length === 0) return;
    const checkInDate = new Date(editWorkTimeInputCheckIn.value);
    const checkOutDate = new Date(editWorkTimeInputCheckOut.value);
    const updated = await updateEntry(editWorkTimeInputCategory.value, checkInDate, checkOutDate);
    if (updated !== null) {
        entries.splice(entries.map(entry => entry.id).indexOf(currentEntryId), 1);
        entries.push(updated);
        toggleWorkTimeOverview('initial');
    }
};

const loadItems = () => {
    loginContainer = document.getElementById('login-form-container');
    registerContainer = document.getElementById('register-form-container');
    workTimeOverviewContainer = document.getElementById('work-time-overview-container');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    addWorkTimeForm = document.getElementById('add-work-time-form');
    entriesTableBody = document.getElementById('entries-table-body');
    addWorkTimeContainer = document.getElementById('add-work-time-container');
    addWorkTimeInputCategory = document.getElementById('addWorkTimeInputCategory');
    editWorkTimeContainer = document.getElementById('edit-work-time-container');
    editWorkTimeInputCategory = document.getElementById('editWorkTimeInputCategory');
    editWorkTimeForm = document.getElementById('edit-work-time-form');
};

const preventFormDefaults = () => {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        handleLogin();
    });
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        handleRegister();
    });
    addWorkTimeForm.addEventListener('submit', e => {
        e.preventDefault();
        handleAddWorkTime();
    });
    editWorkTimeForm.addEventListener('submit', e => {
        e.preventDefault();
        handleEditWorkTime();
    });
};


window.onload = async () => {
    loadItems();
    preventFormDefaults();
    if (!await isAuthenticated()) {
        promptLogin();
        return;
    }
    toggleWorkTimeOverview();
};

