namespace EmployeeManagementSystem.DTOs
{
    public class EmployeeCreateDto
    {
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public decimal? Salary { get; set; }
        public int? DepartmentId { get; set; }
        public int? RoleId { get; set; }
        public int? ManagerId { get; set; }
    }
}
