using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementSystem.DTOs
{
    public class EmployeeCreateDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;

        [RegularExpression(@"^\d{10}$", ErrorMessage = "Phone number must be exactly 10 digits")]
        public string? Phone { get; set; }
        public decimal? Salary { get; set; }
        public int? DepartmentId { get; set; }
        public int? RoleId { get; set; }
        public int? ManagerId { get; set; }
    }
}