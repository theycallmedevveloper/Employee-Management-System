const API = "https://localhost:7269/api";

// Load and display employees
async function loadEmployees() {
    const table = document.getElementById("employeeTable");
    if (!table) return;
    
    try {
        const res = await fetch(`${API}/employees`);
        const data = await res.json();
        
        console.log("API Response:", data); // DEBUG: See what the API returns
        
        const colors = ['primary', 'success', 'info', 'warning', 'danger'];
        
        table.innerHTML = data.map((e, i) => {
            console.log("Employee:", e); // DEBUG: See each employee object
            return `
            <tr class="border-bottom">
                <td class="px-4">
                    <i class="bi bi-star${i % 2 === 0 ? '-fill' : ''} text-warning"></i>
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
            </tr>
        `}).join("");
        
        console.log("Rows generated:", table.innerHTML); // DEBUG: See the HTML
    } catch (error) {
        console.error("Load error:", error);
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5 text-muted">
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
        const d = await fetch(`${API}/departments`).then(r => r.json());
        console.log("Departments:", d);
        document.getElementById('department').innerHTML = 
            '<option value="">-- Select Department --</option>' +
            d.map(x => `<option value="${x.departmentId}">${x.departmentName}</option>`).join("");

        const r = await fetch(`${API}/roles`).then(r => r.json());
        console.log("Roles:", r);
        document.getElementById('role').innerHTML = 
            '<option value="">-- Select Role --</option>' +
            r.map(x => `<option value="${x.roleId}">${x.roleName}</option>`).join("");

        const m = await fetch(`${API}/employees`).then(r => r.json());
        console.log("Managers:", m);
        document.getElementById('manager').innerHTML =
            '<option value="">-- No Manager --</option>' +
            m.map(x => `<option value="${x.employeeId}">${x.fullName}</option>`).join("");
    } catch (error) {
        console.error('Failed to load dropdowns:', error);
        alert('Failed to load form data. Please make sure the API is running.');
    }
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
            const body = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value || null,
                salary: document.getElementById('salary').value || null,
                departmentId: document.getElementById('department').value || null,
                roleId: document.getElementById('role').value || null,
                managerId: document.getElementById('manager').value || null
            };

            console.log("Submitting:", body); // DEBUG

            const response = await fetch(`${API}/employees`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            console.log("Response status:", response.status); // DEBUG

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error response:", errorText);
                throw new Error('Failed to save employee');
            }

            const result = await response.json();
            console.log("Saved employee:", result); // DEBUG

            submitBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Saved!';
            
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        } catch (error) {
            // console.error('Submit error:', error);
            alert('Failed to add employee. Check console for details.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
        }
    });
}

// Run on page load
if (document.getElementById("employeeTable")) {
    loadEmployees();
}