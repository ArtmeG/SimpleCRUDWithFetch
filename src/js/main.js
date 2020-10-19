const http = {
    get(url) {
        try {
            return fetch(url)
                .then(response => response.json());
        } catch (e) {
            console.log(e);
        }
    },

    post(url, body) {
        try {
            return fetch(url, setBodyForPostRequest(body))
                .then(response => response.json());
        } catch (e) {
            console.log(e);
        }
    },

    put(url, body) {
        try {
            return fetch(url, setBodyForPutRequest(body))
                .then(response => response.json());
        } catch (e) {
            console.log(e);
        }
    },

    delete(url) {
        try {
            return fetch(url, {
                method: 'DELETE'
            })
        } catch (e) {
            console.log(e);
        }
    }
}

// UI
const URL = 'https://5f82aa3706957200164338d2.mockapi.io/users/userdata/',
    tBody = document.querySelector('.table tbody'),
    addBtn = document.querySelector('.add-user'),
    form = document.forms['form'],
    popupForm = document.querySelector('.form-popup'),
    table = document.querySelector('.table'),
    submitBtn = form.elements['submit'],
    nameInput = form.elements['name'],
    lastnameInput = form.elements['lastname'],
    phoneInput = form.elements['phone'];

let isEdit = false,
    userId = 0;

// Events
window.addEventListener('load', getUsersData);
addBtn.addEventListener('click', onClickAddBtnHandler);
table.addEventListener('click', onClickTableHandler);
form.addEventListener('click', onClickFormHandler);
popupForm.addEventListener('click', ({target, currentTarget}) => {
    if (target === currentTarget) {
        closeForm();
    }
});

/**
 * Click form handler
 * @param e
 */
function onClickFormHandler(e) {
    e.preventDefault();
    const curFrmBtn = e.target.className;

    switch (curFrmBtn) {
        case 'close':
            closeForm();
            break;
        case 'submit':
            submitForm();
            break;
    }
}

/**
 * Click table handler
 * @param e
 */
function onClickTableHandler({target}) {
    formBtnAction(target);
}

/**
 * Click add button handler
 */
function onClickAddBtnHandler() {
    popupForm.classList.remove('hidden');
    submitBtn.textContent = 'Add user';
}

/**
 * Submit form
 */
function submitForm() {
    if (isEdit) {
        editUserData();
    } else {
        renderNewUser();
    }
}

/**
 * Edit user data
 */
function editUserData() {
    const editUser = getUser();
    if (!editUser.name.length || !editUser.lastname.length || !editUser.phone.length) {
        return;
    }

    http.put(`${URL}${userId}`, editUser)
        .then(user => {
            changeUserData(user);
        })
        .catch(error => console.log(error))
        .finally(() => {
            closeForm();
        })
}

/**
 * Change user data in the table
 * @param userId
 * @param user
 */
function changeUserData({name, lastname, phone}) {
    const curRow = table.querySelector(`[data-id="${userId}"]`);
    curRow.querySelector('.name').innerHTML = name;
    curRow.querySelector('.lastname').innerHTML = lastname;
    curRow.querySelector('.phone').innerHTML = phone;
}

/**
 * Get user from form
 * @returns {Object}user
 */
function getUser() {
    return {
        name: nameInput.value,
        lastname: lastnameInput.value,
        phone: phoneInput.value
    }
}

/**
 * Render new user
 */
function renderNewUser() {
    const newUser = getUser();
    if (!newUser.name.length || !newUser.lastname.length || !newUser.phone.length) {
        return;
    }

    http.post(`${URL}`, newUser)
        .then(user => {
            table.insertAdjacentHTML('beforeend', createUserItem(user));
            console.log('User has been added.');
        })
        .catch(error => console.error(error))
        .finally(() => {
            popupForm.classList.add('hidden');
        });
}

/**
 * Close form
 */
function closeForm() {
    popupForm.classList.add('hidden');
    form.reset();
    isEdit = false;
}

/**
 * Click form button action
 * @param target
 */
function formBtnAction(target) {
    const btnClassName = target.className;
    const curRow = target.closest('[data-id]');
    userId = curRow.dataset.id;

    switch (btnClassName) {
        case 'delete':
            deleteUser(curRow);
            break;
        case 'edit':
            editUserPreparation();
            break;
    }
}

/**
 * Delete a user
 */
function deleteUser(curRow) {
    http.delete(`${URL}${userId}`)
        .then(res => {
            if (res.ok) {
                curRow.remove();
                console.log('User has been deleted.');
            } else {
                console.log('An error occurred.');
            }
        })
        .catch(error => console.log(error));
}

/**
 * User preparation before edit
 */
function editUserPreparation() {
    isEdit = true;
    popupForm.classList.remove('hidden');
    submitBtn.textContent = 'Edit user';
    renderEditUserForm();
}

/**
 * Render user edit data
 */
function renderEditUserForm() {
    http.get(`${URL}${userId}`)
        .then(user => fillInEditUserForm(user))
        .catch(error => console.log(error));
}

/**
 * Fill in user edit form
 * @param user
 */
function fillInEditUserForm({name, lastname, phone}) {
    nameInput.value = name;
    lastnameInput.value = lastname;
    phoneInput.value = phone;
}

/**
 * Get all users from server
 */
function getUsersData() {
    http.get(`${URL}`)
        .then(renderUsersData)
        .catch(error => console.log(error));
}

/**
 * Render users data
 * @param users
 */
function renderUsersData(users) {
    if (!users) {
        return;
    }
    tBody.innerHTML = createFragment(users);
}

/**
 * Create a fragment to insert
 * @param users
 * @returns {Object}fragment
 */
function createFragment(users) {
    return users.reduce((acc, user) => {
        acc += createUserItem(user);
        return acc;
    }, '')
}

/**
 * Create user item to insert
 * @param id
 * @param name
 * @param lastname
 * @param phone
 * @returns {string}
 */
function createUserItem({id, name, lastname, phone}) {
    return `
        <tr data-id=${id}>
            <td class="name">${name}</td>
            <td class="lastname">${lastname}</td>
            <td class="phone">${phone}</td>
            <td>
                <button class="delete">Delete</button>
                <button class="edit">Edit</button>
            </td>
        </tr>
    `;
}

/**
 * Post request option
 * @param body
 * @returns {Object}{{headers: {"Content-Type": string}, method: string, body: string}}
 */
function setBodyForPostRequest(body) {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(body)
    }
}

/**
 * Put request option
 * @param body
 * @returns {Object}{{headers: {"Content-Type": string}, method: string, body: string}}
 */
function setBodyForPutRequest(body) {
    return {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(body)
    }
}