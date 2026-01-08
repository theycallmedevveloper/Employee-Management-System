const API = "https://localhost:53424/api";

// Load and display employees
async function loadEmployees() {
    const table = document.getElementById("employeeTable");
    if (!table) return;

    try {
        const res = await fetch(`${API}/employees`);
        const data = await res.json();

        console.log("API Response:", data);

        const colors = ['primary', 'success', 'info', 'warning', 'danger'];

        table.innerHTML = data.map((e, i) => {
            console.log("Employee:", e);
            return `
            <tr class="border-bottom">
                <td class="px-4">
                    <i class="bi bi-star-fill text-warning"></i>
                </td>
                <td class="px-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-${colors[i % colors.length]} text-white d-flex align-items-center 
                        justify-content-center me-2" style="width: 35px; height: 35px; font-size: 14px; font-weight: bold;">
                            ${e.fullName ? e.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??'}
                        </div>
                        <strong>${e.fullName || 'No Name'}</strong>
                    </div>
                </td>
                <td class="px-4 py-3 text-muted">
                    <i class="bi bi-envelope-fill me-1"></i>${e.email || 'No Email'}
                </td>
                <td class="px-4 py-3">
                    ${e.department ? `<span class="badge bg-light text-dark border">${e.department}</span>` : '<span class="text-muted">-</span>'}
                </td>
                <td class="px-4 py-3">
                    ${e.role ? `<span class="badge bg-${colors[(i + 1) % colors.length]}">${e.role}</span>` : '<span class="text-muted">-</span>'}
                </td>
                <td class="px-4 py-3 text-muted">
                    ${e.manager || '-'}
                </td>
                <td class="px-4 py-3 text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${e.employeeId})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${e.employeeId})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `}).join("");

        console.log("Rows generated:", table.innerHTML);
    } catch (error) {
        console.error("Load error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-exclamation-circle fs-1 d-block mb-2"></i>
                    Unable to load employees. Error: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Search functionality
const searchBox = document.getElementById('searchBox');
if (searchBox) {
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#employeeTable tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Load dropdowns
async function loadDropdowns() {
    try {
        // Departments
        const d = await fetch(`${API}/departments`).then(r => r.json());
        document.getElementById('department').innerHTML =
            '<option value="">-- Select Department --</option>' +
            d.map(x => `<option value="${x.departmentId}">${x.departmentName}</option>`).join("");

        // Managers
        const m = await fetch(`${API}/employees`).then(r => r.json());
        document.getElementById('manager').innerHTML =
            '<option value="">-- No Manager --</option>' +
            m.map(x => `<option value="${x.employeeId}">${x.fullName}</option>`).join("");

        // Roles start EMPTY
        document.getElementById('role').innerHTML =
            '<option value="">-- Select Department First --</option>';

    } catch (error) {
        console.error('Failed to load dropdowns:', error);
        alert('Failed to load form data.');
    }
}

// Bind roles when department changes
document.addEventListener("change", async function (e) {
    if (e.target && e.target.id === "department") {
        const departmentId = e.target.value;
        const roleSelect = document.getElementById("role");

        roleSelect.innerHTML = '<option value="">-- Select Role --</option>';

        if (!departmentId) return;

        try {
            const res = await fetch(`${API}/employees/roles/${departmentId}`);
            const roles = await res.json();

            roles.forEach(r => {
                const option = document.createElement("option");
                option.value = r.roleId;
                option.textContent = r.roleName;
                roleSelect.appendChild(option);
            });

        } catch (err) {
            console.error("Failed to load roles:", err);
        }
    }
});

// Edit employee function
function editEmployee(id) {
    window.location.href = `add.html?id=${id}`;
}

// Delete employee function
function deleteEmployee(id) {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    fetch(`${API}/employees/${id}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(() => {
        alert('Employee deleted successfully!');
        loadEmployees(); // Reload the table
    })
    .catch(err => {
        console.error('Delete error:', err);
        alert('Failed to delete employee');
    });
}

// Get employee ID from URL for edit mode
const params = new URLSearchParams(window.location.search);
const empId = params.get("id");

// Load employee data for editing
if (empId) {
    fetch(`${API}/employees/${empId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("fullName").value = data.fullName;
            document.getElementById("email").value = data.email;
            document.getElementById("phone").value = data.phone || "";
            document.getElementById("salary").value = data.salary || "";
            document.getElementById("department").value = data.departmentId;

            // Trigger role load
            document.getElementById("department").dispatchEvent(new Event("change"));

            setTimeout(() => {
                document.getElementById("role").value = data.roleId;
                document.getElementById("manager").value = data.managerId;
            }, 300);
        })
        .catch(err => {
            console.error('Failed to load employee:', err);
            alert('Failed to load employee data');
        });
}

// Form submission
const employeeForm = document.getElementById("employeeForm");
if (employeeForm) {
    loadDropdowns();

    employeeForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        try {
            const phone = document.getElementById('phone').value;
            // number validation
            if (phone && !/^\d{10}$/.test(phone)) {
                alert("Mobile number must be exactly 10 digits");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalHTML;
                return;
            }

            const body = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: phone || null,
                salary: document.getElementById('salary').value || null,
                departmentId: document.getElementById('department').value || null,
                roleId: document.getElementById('role').value || null,
                managerId: document.getElementById('manager').value || null
            };

            console.log("Submitting:", body);

            const response = await fetch(`${API}/employees${empId ? `?id=${empId}` : ''}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error('Failed to save employee');
            }

            const result = await response.json();
            console.log("Saved employee:", result);

            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Saved!';

            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        } catch (error) {
            console.error('Submit error:', error);
            alert('Failed to save employee. Check console for details.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

// Run on page load
if (document.getElementById("employeeTable")) {
    loadEmployees();
}