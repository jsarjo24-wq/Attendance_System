// ===============================
// LOGIN FORM
// ===============================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("LOGIN RESPONSE:", data);

            if (data.success) {
                alert("Login successful");
                localStorage.setItem("user", email);

                if (data.role === "lecturer") {
                    window.location.href = "lecturer-dashboard.html";
                } else {
                    window.location.href = "student-dashboard.html";
                }
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log("Login Error:", error);
        }
    });
}


// ===============================
// REGISTER FORM
// ===============================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        try {
            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();
            console.log("REGISTER RESPONSE:", data);

            if (data.success) {
                alert("Registration successful");
                window.location.href = "login.html";
            } else {
                alert("Registration failed: " + data.message);
            }

        } catch (error) {
            console.log("Register Error:", error);
        }
    });
}


// ===============================
// LOGOUT BUTTON
// ===============================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}


// ===============================
// ATTENDANCE FORM
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    const attendanceForm = document.getElementById("attendanceForm");

    if (attendanceForm) {
        attendanceForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const course = document.getElementById("course").value;
            const date = document.getElementById("date").value;

            try {
                const response = await fetch("http://localhost:3000/create-attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ course, date, lecturer: "Lecturer" })
                });

                const data = await response.json();
                alert(data.message);

            } catch (error) {
                console.log("Attendance Error:", error);
            }
        });
    }


    // ===============================
    // STUDENT LIST
    // ===============================

    const studentList = document.getElementById("studentList");

    if (studentList) {
        fetch("http://localhost:3000/students")
            .then(res => res.json())
            .then(data => {
                data.forEach(student => {
                    studentList.innerHTML += `
                        <div>
                            <p>${student.name} (${student.email})</p>
                            <button onclick="mark('${student.email}', 'Present')">Present</button>
                            <button onclick="mark('${student.email}', 'Absent')">Absent</button>
                            <hr>
                        </div>
                    `;
                });
            })
            .catch(error => console.log("Student List Error:", error));
    }

});


// ===============================
// MARK ATTENDANCE
// ===============================

async function mark(email, status) {
    const course = prompt("Enter course name");

    try {
        const response = await fetch("http://localhost:3000/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, status, course })
        });

        const data = await response.json();
        alert(data.message);

    } catch (error) {
        console.log(error);
    }
}

// ===============================
// MY ATTENDANCE (STUDENT)
// ===============================

const attendanceBody = document.getElementById("attendanceBody");
const attendanceSummary = document.getElementById("attendanceSummary");

if (attendanceBody) {

    const email = localStorage.getItem("user");

    if (!email) {
        attendanceBody.innerHTML = `<tr><td colspan="3">Not logged in.</td></tr>`;
    } else {

        fetch(`http://localhost:3000/my-attendance/${email}`)
            .then(res => res.json())
            .then(response => {

                if (response.success && response.data.length > 0) {

                    attendanceBody.innerHTML = "";

                    let presentCount = 0;
                    let absentCount = 0;

                    response.data.forEach(record => {

                        if (record.status === "Present") presentCount++;
                        if (record.status === "Absent") absentCount++;

                        const color = record.status === "Present" ? "green" : "red";

                        attendanceBody.innerHTML += `
                            <tr>
                                <td>${record.course}</td>
                                <td>${record.date}</td>
                                <td style="color: ${color}; font-weight: bold;">
                                    ${record.status}
                                </td>
                            </tr>
                        `;

                    });

                    if (attendanceSummary) {
                        attendanceSummary.innerHTML =
                            `Total — Present: ${presentCount} | Absent: ${absentCount}`;
                    }

                } else {
                    attendanceBody.innerHTML = `<tr><td colspan="3">No attendance records found.</td></tr>`;
                    if (attendanceSummary) {
                        attendanceSummary.innerHTML = "No records yet.";
                    }
                }

            })
            .catch(error => {
                console.log("Fetch attendance error:", error);
                attendanceBody.innerHTML = `<tr><td colspan="3">Error loading attendance.</td></tr>`;
            });
    }
}


