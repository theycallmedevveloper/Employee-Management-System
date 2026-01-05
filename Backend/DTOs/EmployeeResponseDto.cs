namespace EmployeeManagementSystem.DTOs
{
    public class EmployeeResponseDto
    {
        public int EmployeeId { get; set; }
        public string FullName { get; set; }
        public string DepartmentName { get; set; }
        public string RoleName { get; set; }
        public string ManagerName { get; set; }
    }
}
