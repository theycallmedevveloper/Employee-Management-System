using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementSystem.Models
{
    public class Role
    {
        [Key]
        public int RoleId { get; set; }
        public string? RoleName { get; set; }
        public bool? IsActive { get; set; }

        public int DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
    }
}
        