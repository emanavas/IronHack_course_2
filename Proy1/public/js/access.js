const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userDropdown = document.getElementById('userDropdown');

// Login handler
    loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPassword').value;
    // In a real app, you would validate credentials with a backend
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
    //send data to server to login user
    fetch('/api/users/login', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        user: user,
        password: password
        })
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        if (!data.name) throw new Error("no name retrived");
        console.log(data);
        alert(`Login as ${data.name}`);
        //redirect to home page
        window.location.href = '/';
    })
    .catch(err => {
        console.log(err)
    });
});

// Register handler
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const user = document.getElementById('registerUser').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    // In a real app, you would send this to a backend
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
    //send data to server to create user
    fetch('/api/users/register', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        name: name,
        user: user,
        password: password,
        role: role
        })
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        console.log(data);
        alert(`Registered as ${data.name}`);
        //redirect to home page
        window.location.href = '/';
    })
    .catch(err => {
        console.log(err)
        alert('Error registering user');
    });
});

