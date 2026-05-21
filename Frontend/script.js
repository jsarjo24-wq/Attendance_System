
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

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })

            });

            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);

           if (data.success) {

       alert("Login successful");

           // Save login session
        localStorage.setItem("user", email);

         // Move to dashboard
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


registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role= document.getElementById("role").value;

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, role})
        });

        const data = await response.json();

        console.log("REGISTER RESPONSE:", data);

        if (data.success) {
            alert("Registration successful");

            // ONLY redirect if success
            window.location.href = "login.html";
        } else {
            alert("Registration failed: " + data.message);
        }

    } catch (error) {
        console.log("Register Error:", error);
    }
});
