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

        [HttpPost]
        public async Task<IActionResult> Create(EmployeeCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState); // Bonus: Catches validation drama early

            if (dto.ManagerId != null && dto.ManagerId == 0)
                return BadRequest("Invalid manager");

            var employee = new Employee
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
            await _context.SaveChangesAsync(); // Await the magic!

            return Ok(new { success = true, message = "Employee created" }); // JSON party!
        }
    }

}
