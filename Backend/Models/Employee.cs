using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagementSystem.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; }

        [Column("EmpFullName")]
        public string EmpFullName { get; set; } = null!;

        [Column("EmpEmail")]
        public string EmpEmail { get; set; } = null!;

        [Column("EmpPhone")]
        public string EmpPhone { get; set; } = null!;

        [Column("EmpSalary")]
        public decimal? EmpSalary { get; set; }

        [Column("EmpDepartmentId")]
        public int? EmpDepartmentId { get; set; }
        public Department? Department { get; set; }

        [Column("EmpRoleId")]
        public int? EmpRoleId { get; set; }
        public Role? Role { get; set; }

        public int? ManagerId { get; set; }
        public Employee? Manager { get; set; }
        

        public DateTime? CreatedAt { get; set; }
        public bool? IsActive { get; set; }
    }
}
