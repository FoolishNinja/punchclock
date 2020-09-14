const URL = 'http://localhost:8081';
let entries = [], categories = [], users = [], currentEntryId = -1, currentUserId = -1, backgroundColor = '#FFFFFF',
    role = 'USER';

let loginContainer, registerContainer, workTimeOverviewContainer, addWorkTimeContainer, editWorkTimeContainer,
    loginForm, registerForm, addWorkTimeForm, entriesTableBody, addWorkTimeInputCategory, editWorkTimeInputCategory,
    editWorkTimeForm, editBackgroundColorContainer, editBackgroundColorForm, usersOverviewContainer, usersTableBody,
    addUserContainer, addUserForm, editUserContainer, editUserForm;

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

const getUsers = async () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users`, {
            method: 'GET',
            headers: getHeaders(),
        })
            .then(async res => {
                if (res.status === 200) {
                    res.json().then(users => resolve(users));
                } else reject();
            })
            .catch(err => reject(err));
    });
};

const createUser = async (role, username, password) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({role, username, password})
        })
            .then(async res => {
                if (res.status === 201) {
                    res.json().then(user => resolve(user));
                } else reject();
            })
            .catch(err => reject(err));
    })
};

const updateUser = async (role, username, password) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users/${currentUserId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                role,
                username,
                password
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

const deleteUser = async (id) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        })
            .then(res => {
                users.splice(users.map(user => user.id).indexOf(id), 1);
                displayUsers();
                resolve(true);
            })
            .catch(err => reject(err));
    });
};

const getBackgroundColor = () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/background-color`, {
            method: 'GET',
            headers: getHeaders(),
        })
            .then(async res => {
                if (res.status === 200) {
                    res.json().then(color => resolve(color));
                } else reject();
            })
            .catch(err => reject(err));
    });
};

const updateBackgroundColor = (color) => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/background-color/1`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({id: 1, color})
        })
            .then(async res => {
                if (res.status === 200) {
                    res.json().then(color => resolve(color));
                } else reject();
            })
            .catch(err => reject(err));
    });
};

const getUserRole = () => {
    return new Promise((resolve, reject) => {
        fetch(`${URL}/users/role`, {
            method: 'GET',
            headers: getHeaders(),
        })
            .then(async res => {
                if (res.status === 200) {
                    res.text().then(role => resolve(role));
                } else reject();
            })
            .catch(err => reject(err));
    });
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
                    displayBackgroundColor(await getBackgroundColor());
                    await loadAdminComponents();
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
            displayBackgroundColor(await getBackgroundColor());
            await loadAdminComponents();
            resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
};

const loadAdminComponents = async () => {
    role = await getUserRole();
    if (role !== 'ADMIN') return;
    let setBackgroundColorButton = document.createElement('button');
    setBackgroundColorButton.addEventListener('click', () => promptEditBackgroundColor());
    setBackgroundColorButton.className = 'btn btn-primary';
    setBackgroundColorButton.innerText = 'Set background color';
    workTimeOverviewContainer.appendChild(setBackgroundColorButton);
    let manageUsersButton = document.createElement('button');
    manageUsersButton.addEventListener('click', () => promptManageUsersOverview());
    manageUsersButton.className = 'ml-1 btn btn-primary';
    manageUsersButton.innerText = 'Manage users';
    workTimeOverviewContainer.appendChild(manageUsersButton);
    document.getElementById('editBackgroundColorInputColor').value = backgroundColor;
    users = await getUsers();
    displayUsers();
};

const displayBackgroundColor = (color) => {
    document.body.style.backgroundColor = color.color;
};

const displayUsers = () => {
    usersTableBody.innerHTML = '';
    for (const user of users) {
        const tr = document.createElement('tr');
        let userIdTd = document.createElement('td');
        userIdTd.scope = 'row';
        userIdTd.innerText = user.id;
        let userUsernameTd = document.createElement('td');
        userUsernameTd.innerText = user.username;
        let userIsAdminTd = document.createElement('td');
        userIsAdminTd.innerText = user.role === 'ADMIN' ? 'yes' : 'no';
        let userEditTd = document.createElement('td');
        let userEditButton = document.createElement('button');
        userEditButton.className = 'btn btn-primary';
        userEditButton.innerText = 'Edit';
        userEditButton.addEventListener('click', () => toggleEditUser(user.id));
        userEditTd.appendChild(userEditButton);
        let userDeleteButtonTd = document.createElement('td');
        let userDeleteButton = document.createElement('button');
        userDeleteButton.className = 'btn btn-danger';
        userDeleteButton.innerText = 'Delete';
        userDeleteButton.addEventListener('click', () => toggleDeleteUser(user.id));
        userDeleteButtonTd.appendChild(userDeleteButton);
        tr.append(userIdTd, userUsernameTd, userIsAdminTd, userEditTd, userDeleteButtonTd);
        usersTableBody.appendChild(tr);
    }
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

const displayUser = (id) => {
    currentUserId = id;
    const user = users.filter(ele => ele.id === id)[0];
    if (!user) return;
    for (let option of document.getElementById('editUserInputRole').children) {
        if (option.value === user.role) option.required = true;
    }
    document.getElementById('editUserInputUsername').value = user.username;
    document.getElementById('editUserInputPassword').value = user.password;
}

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
    toggleEditBackgroundColor('none');
    toggleUsersOverview('none');
    toggleAddUser('none');
    toggleEditCurrentUser('none');
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

const toggleEditCurrentUser = (d) => {
    const display = editUserContainer.style.display;
    editUserContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
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

const toggleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await deleteUser(id);
};

const toggleEditUser = (id) => {
    displayUser(id);
    toggleWorkTimeOverview('none');
    toggleEditCurrentUser();
};

const toggleEditBackgroundColor = (d) => {
    const display = editBackgroundColorContainer.style.display;
    editBackgroundColorContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
};

const toggleUsersOverview = (d) => {
    const display = usersOverviewContainer.style.display;
    usersOverviewContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
};

const toggleAddUser = (d) => {
    const display = addUserContainer.style.display;
    addUserContainer.style.display = d ? d : (display === 'none' ? 'initial' : 'none');
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

const promptEditBackgroundColor = () => {
    toggleWorkTimeOverview('none');
    toggleEditBackgroundColor();
};

const promptManageUsersOverview = () => {
    toggleWorkTimeOverview('none');
    toggleUsersOverview();
};

const promptAddUser = () => {
    toggleWorkTimeOverview('none');
    toggleAddUser();
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

const handleEditBackgroundColor = async () => {
    const editBackgroundColorInputColor = document.getElementById('editBackgroundColorInputColor');
    if (editBackgroundColorInputColor.value.length !== 7) return;
    console.log(editBackgroundColorInputColor.value);
    const color = await updateBackgroundColor(editBackgroundColorInputColor.value);
    if (color !== null) {
        displayBackgroundColor(color);
        toggleWorkTimeOverview('initial');
    }
};

const handleCreateUser = async () => {
    const addUserInputRole = document.getElementById('addUserInputRole');
    const addUserInputUsername = document.getElementById('addUserInputUsername');
    const addUserInputPassword = document.getElementById('addUserInputPassword');
    if (!['ADMIN', 'USER'].includes(addUserInputRole.value) || addUserInputUsername.value.length === 0 || addUserInputPassword.value.length === 0) return;
    const user = await createUser(addUserInputRole.value, addUserInputUsername.value, addUserInputPassword.value);
    if (user !== null) {
        users.push(user);
        toggleWorkTimeOverview('initial');
    }
};

const handleEditUser = async () => {
    const editUserInputRole = document.getElementById('editUserInputRole');
    const editUserInputUsername = document.getElementById('editUserInputUsername');
    const editUserInputPassword = document.getElementById('editUserInputPassword');
    if (!['ADMIN', 'USER'].includes(editUserInputRole.value) || editUserInputUsername.value.length === 0 || editUserInputPassword.value.length === 0) return;
    const updated = await updateUser(editUserInputRole.value, editUserInputUsername.value, editUserInputPassword.value);
    if (updated !== null) {
        users.splice(entries.map(user => user.id).indexOf(currentUserId), 1);
        users.push(updated);
        toggleWorkTimeOverview('initial');
    }
}

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
    editBackgroundColorContainer = document.getElementById('edit-background-color-container');
    editBackgroundColorForm = document.getElementById('edit-background-color-form');
    usersOverviewContainer = document.getElementById('users-overview-container');
    usersTableBody = document.getElementById('users-table-body');
    addUserContainer = document.getElementById('add-user-container');
    addUserForm = document.getElementById('add-user-form');
    editUserContainer = document.getElementById('edit-user-container');
    editUserForm = document.getElementById('edit-user-form');
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
    editBackgroundColorForm.addEventListener('submit', e => {
        e.preventDefault();
        handleEditBackgroundColor();
    });
    addUserForm.addEventListener('submit', e => {
        e.preventDefault();
        handleCreateUser();
    });
    editUserForm.addEventListener('submit', e => {
        e.preventDefault();
        handleEditUser();
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

