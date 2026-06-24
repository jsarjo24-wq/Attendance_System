// ===============================
// SIMPLE XSS ESCAPE HELPER
// ===============================

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}


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
// POPULATE COURSE SESSION DROPDOWN
// ===============================

async function populateCourseDropdown() {

    const courseSelect = document.getElementById("courseSelect");

    if (!courseSelect) return;

    try {

        const res = await fetch("http://localhost:3000/sessions");
        const response = await res.json();

        courseSelect.innerHTML = `<option value="">-- Choose a course session --</option>`;

        if (response.success) {

            response.data.forEach(session => {

                const safeCourse = escapeHtml(session.course);
                const formattedDate = new Date(session.date).toLocaleDateString();

                courseSelect.innerHTML += `
                    <option value="${safeCourse}">
                        ${safeCourse} — ${formattedDate}
                    </option>
                `;

            });

        }

    } catch (error) {

        console.log("Dropdown load error:", error);

    }

}


// ===============================
// ATTENDANCE FORM + STUDENT LIST
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

                populateCourseDropdown();
                loadAttendance();

            } catch (error) {
                console.log("Attendance Error:", error);
            }
        });
    }


    const studentList = document.getElementById("studentList");

    if (studentList) {

        populateCourseDropdown();

        fetch("http://localhost:3000/students")
            .then(res => res.json())
            .then(data => {
                data.forEach(student => {

                    const safeName = escapeHtml(student.name);
                    const safeEmail = escapeHtml(student.email);

                    studentList.innerHTML += `
                        <div>
                            <p>${safeName} (${safeEmail})</p>
                            <button onclick="mark('${student.email}', 'Present')">Present</button>
                            <button onclick="mark('${student.email}', 'Absent')">Absent</button>
                            <button onclick="updateAttendance('${student.email}')">Edit Status</button>
                            <hr>
                        </div>
                    `;
                });
            })
            .catch(error => console.log("Student List Error:", error));
    }

    if (document.getElementById("attendanceList")) {
        loadAttendance();
    }

});


// ===============================
// MARK ATTENDANCE (uses dropdown)
// ===============================

async function mark(email, status) {

    const courseSelect = document.getElementById("courseSelect");
    const course = courseSelect ? courseSelect.value : "";

    if (!course) {
        alert("Please select a course session first.");
        return;
    }

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
// UPDATE ATTENDANCE (uses dropdown + confirm)
// ===============================

async function updateAttendance(email) {

    const courseSelect = document.getElementById("courseSelect");
    const course = courseSelect ? courseSelect.value : "";

    if (!course) {
        alert("Please select a course session first.");
        return;
    }

    const status = confirm("Click OK for Present, Cancel for Absent")
        ? "Present"
        : "Absent";

    try {

        const response = await fetch(
            "http://localhost:3000/update-attendance",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, course, status })
            }
        );

        const data = await response.json();
        alert(data.message);

    } catch (error) {

        console.log(error);

    }

}


// ===============================
// MY ATTENDANCE (STUDENT VIEW)
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

                        const safeCourse = escapeHtml(record.course);
                        const formattedDate = new Date(record.date).toLocaleDateString();
                        const badgeClass = record.status === "Present" ? "status-present" : "status-absent";

                        attendanceBody.innerHTML += `
                            <tr>
                                <td>${safeCourse}</td>
                                <td>${formattedDate}</td>
                                <td><span class="${badgeClass}">${record.status}</span></td>
                            </tr>
                        `;

                    });

                    if (attendanceSummary) {
                        attendanceSummary.innerHTML =
                            `Total — Present: ${presentCount} | Absent: ${absentCount}`;
                    }

                    const elPresent = document.getElementById("totalPresent");
                    const elAbsent  = document.getElementById("totalAbsent");
                    const elRate    = document.getElementById("attendanceRate");

                    if (elPresent) elPresent.textContent = presentCount;
                    if (elAbsent)  elAbsent.textContent  = absentCount;
                    if (elRate) {
                        const total = presentCount + absentCount;
                        elRate.textContent = total > 0 ? Math.round((presentCount / total) * 100) + "%" : "N/A";
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


// ===============================
// LOAD + DELETE ATTENDANCE SESSIONS
// ===============================

async function loadAttendance() {

    const container = document.getElementById("attendanceList");

    if (!container) return;

    try {

        const res = await fetch("http://localhost:3000/attendance");
        const data = await res.json();

        container.innerHTML = "";

        data.forEach(att => {

            const safeCourse = escapeHtml(att.course);
            const formattedDate = new Date(att.date).toLocaleDateString();

            container.innerHTML += `
                <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                    <h3>${safeCourse}</h3>
                    <p>${formattedDate}</p>
                    <button onclick="deleteAttendance('${att._id}')">Delete</button>
                </div>
            `;
        });

    } catch (error) {

        console.log("Load attendance error:", error);

    }

}


async function deleteAttendance(id) {

    const confirmDelete = confirm("Are you sure?");

    if (!confirmDelete) return;

    try {

        const res = await fetch(
            `http://localhost:3000/attendance/${id}`,
            { method: "DELETE" }
        );

        const data = await res.json();

        alert(data.message);

        loadAttendance();

    } catch (error) {

        console.log(error);

    }

}