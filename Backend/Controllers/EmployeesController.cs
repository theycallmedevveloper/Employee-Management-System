using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmployeeManagementSystem.Data;
using EmployeeManagementSystem.Models;
using EmployeeManagementSystem.DTOs;



namespace EmployeeManagementSystem.Controllers
{
    [ApiController]
    [Route("api/employees")]
    public class EmployeesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EmployeesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/employees
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _context.Employees
                .Where(e => e.IsActive == true)
                .Include(e => e.Department)
                .Include(e => e.Role)
                .Include(e => e.Manager)
                .Select(e => new
                {
                    e.EmployeeId,
                    FullName = e.EmpFullName,
                    Email = e.EmpEmail,
                    Salary = e.EmpSalary,
                    Department = e.Department != null ? e.Department.DepartmentName : null,
                    Role = e.Role != null ? e.Role.RoleName : null,
                    Manager = e.Manager != null ? e.Manager.EmpFullName : null
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var emp = await _context.Employees
                .Where(e => e.EmployeeId == id)
                .Select(e => new
                {
                    e.EmployeeId,
                    FullName = e.EmpFullName,
                    Email = e.EmpEmail,
                    Phone = e.EmpPhone,
                    Salary = e.EmpSalary,
                    DepartmentId = e.EmpDepartmentId,
                    RoleId = e.EmpRoleId,
                    ManagerId = e.ManagerId
                })
                .FirstOrDefaultAsync();

            if (emp == null) return NotFound();
            return Ok(emp);
        }

        [HttpGet("roles/{departmentId}")]
        public IActionResult GetRolesByDepartment(int departmentId)
        {
            var roles = _context.Roles
                .Where(r => r.DepartmentId == departmentId && r.IsActive == true)
                .Select(r => new
                {
                    roleId = r.RoleId,
                    roleName = r.RoleName
                })
                .ToList();

            return Ok(roles);
        }


        [HttpPost]
        public async Task<IActionResult> CreateOrUpdate([FromBody] EmployeeCreateDto dto, [FromQuery] int? id = null)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.ManagerId != null && dto.ManagerId == 0)
                return BadRequest("Invalid manager");

            Employee employee;

            if (id.HasValue && id.Value > 0)
            {
                // UPDATE existing employee
                employee = await _context.Employees.FindAsync(id.Value);
                if (employee == null) return NotFound("Employee not found");

                employee.EmpFullName = dto.FullName;
                employee.EmpEmail = dto.Email;
                employee.EmpPhone = dto.Phone;
                employee.EmpSalary = dto.Salary;
                employee.EmpDepartmentId = dto.DepartmentId;
                employee.EmpRoleId = dto.RoleId;
                employee.ManagerId = dto.ManagerId;
            }
            else
            {
                // CREATE new employee
                employee = new Employee
                {
                    EmpFullName = dto.FullName,
                    EmpEmail = dto.Email,
                    EmpPhone = dto.Phone,
                    EmpSalary = dto.Salary,
                    EmpDepartmentId = dto.DepartmentId,
                    EmpRoleId = dto.RoleId,
                    ManagerId = dto.ManagerId,
                    IsActive = true,
                    CreatedAt = DateTime.Now
                };
                _context.Employees.Add(employee);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = id.HasValue ? "Employee updated" : "Employee created" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var emp = await _context.Employees.FindAsync(id);
            if (emp == null) return NotFound();

            emp.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

}
