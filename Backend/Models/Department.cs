using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementSystem.Models
{
    public class Department
    {
        [Key]
        public int DepartmentId { get; set; }
        public string DepartmentName { get; set; } = null!;
        public bool IsActive { get; set; }
        public ICollection<Role> Roles { get; set; } = new List<Role>();
    }
}
