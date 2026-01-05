const API = "https://localhost:7182/api";
let editingId = 0;

$(document).ready(function () {
    console.log("Product Management Ready");
    loadCategories();
    loadBrandsByCategory();
    loadProducts();
});

// Initialize datepickers
$('#mfgDate, #expiryDate').datepicker({
    format: 'dd/mm/yyyy',
    autoclose: true
});

/* ---------- LOAD DROPDOWNS ---------- */
function loadCategories() {
    $.get(`${API}/category/main`, function (data) {
        $("#category").html('<option value="">Select Main Category</option>');
        data.forEach(c => {
            $("#category").append(
                `<option value="${c.category_Id}">${c.category_Name}</option>`
            );
        });
    }).fail(function (err) {
        console.error("Error loading categories:", err);
        alert("Failed to load categories");
    });
}

$("#category").change(function () {
    const parentId = $(this).val();
    $("#subCategory").html('<option value="">Select Sub Category</option>');

    if (!parentId) return;

    $.get(`${API}/category/sub/${parentId}`, function (data) {
        data.forEach(c => {
            $("#subCategory").append(
                `<option value="${c.category_Id}">${c.category_Name}</option>`
            );
        });
    }).fail(function (err) {
        console .error("Error loading subcategories:", err);
    });
});

$("#subCategory").change(function () {
    const subCategoryId = $(this).val();
    loadBrandsByCategory(subCategoryId);
});


function loadBrandsByCategory(categoryId) {
    if (!categoryId) {
        $("#brandId").html('<option value=""> Select Brand </option>');
        return;
    }

    $.get(`${API}/brand/category/${categoryId}`, function (data) {

        $("#brandId").html('<option value=""> Select Brand </option>');
        if (data.length == 0) {
            $("#brandId").append('<option value="">No brands available </option>');
            return;
        }
        data.forEach(b => {
            $("#brandId").append(`<option value="${b.brand_Id}">${b.brand_Name}</option>`);

        });
    }).fail(function (err) {
        console.error("Error loading brands:", err);
        $("#brandId").html('<option value="">Error loading brands</option>');
    });
}

/* ---------- LOAD PRODUCTS ---------- */
function loadProducts() {
    console.log("Loading products...");
    $.get(`${API}/product`, function (data) {
        let rows = "";
        data.forEach(p => {
            rows += `
                <tr>
                    <td>${p.product_Name}</td>
                    <td>${p.product_Code}</td>
                    <td>${p.mainCategory.category_Name}</td>
                    <td>${p.subCategory.category_Name}</td>
                    <td>${p.brand.brand_Name}</td>
                    <td>₹${parseFloat(p.price).toFixed(2)}</td>
                    <td>${p.mfg_Date}</td>
                    <td>${p.expiry_Date || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="editProduct(${p.product_Id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.product_Id})">Delete</button>
                    </td>
                </tr>
            `;
        });
        $("#productTable").html(rows);
    }).fail(function (err) {
        console.error("Error loading products:", err);
        alert("Failed to load products");
    });
}

/* ---------- SAVE PRODUCT ---------- */
$("#productForm").submit(function (e) {
    e.preventDefault();

    const mfgDateVal = $("#mfgDate").val();
    const expiryDateVal = $("#expiryDate").val();

    if (!mfgDateVal || mfgDateVal.trim() === "") {
        alert("Manufacturing Date is required");
        return;
    }
    
    const subCategoryVal = $("#subCategory").val();
    if (!subCategoryVal) {
        alert("Please select a sub category");
        return;
    }

    const data = {
        product_Id: editingId,
        product_Name: $("#productName").val(),
        product_Code: $("#productCode").val(),
        category_Id: parseInt(subCategoryVal),
        brand_Id: parseInt($("#brandId").val()),
        price: parseFloat($("#price").val()),
        mfg_Date: mfgDateVal,
        expiry_Date: expiryDateVal && expiryDateVal.trim() !== "" ? expiryDateVal : null
    };

    if (data.price <= 0) {
        alert("Price must be greater than 0");
        return;
    }

    if (data.expiry_Date) {
        const mfg = parseDdMmYyyy(mfgDateVal);
        const exp = parseDdMmYyyy(expiryDateVal);

        if (exp <= mfg) {
            alert("Expiry Date must be after Manufacturing Date");
            return;
        }
    }

    $.ajax({
        url: `${API}/product`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            alert(response);
            resetForm();
            loadProducts();
        },
        error: function (xhr) {
            alert("Error: " + (xhr.responseText || "Failed to save product"));
        }
    });
});

/* ---------- EDIT ---------- */
function editProduct(id) {
    $.get(`${API}/product/${id}`, function (p) {
        editingId = p.product_Id;

        $("#productName").val(p.product_Name);
        $("#productCode").val(p.product_Code);
        $("#price").val(p.price);

        // Set dates
        const mfgDateObj = parseDdMmYyyy(p.mfg_Date);
        $("#mfgDate").datepicker("setDate", mfgDateObj);

        if (p.expiry_Date) {
            const expDateObj = parseDdMmYyyy(p.expiry_Date);
            $("#expiryDate").datepicker("setDate", expDateObj);
        } else {
            $("#expiryDate").datepicker("clearDates");
        }

        // Set main category first
        if (p.mainCategory) {
            $("#category").val(p.mainCategory.category_Id).trigger("change");

            // Wait for subcategories to load, then set subcategory
            setTimeout(() => {
                $("#subCategory").val(p.subCategory.category_Id);
                loadBrandsByCategory(p.subCategory.category_Id);

            setTimeout(() => {
                    $("#brandId").val(p.brand.brand_Id);
                }, 200);
            }, 400);
        }

        $("button[type='submit']").text("Update Product");
        window.scrollTo({ top: 0, behavior: "smooth" });

    }).fail(function(err) {
        console.error("Error loading product:", err);
        alert("Failed to load product details");
    });
}

/* ---------- DELETE ---------- */
function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    $.ajax({
        url: `${API}/product/${id}`,
        type: "DELETE",
        success: function (response) {
            alert(response);
            loadProducts();
        },
        error: function (xhr) {
            alert("Error: " + (xhr.responseText || "Failed to delete product"));
        }
    });
}

/* ---------- RESET FORM ---------- */
function resetForm() {
    editingId = 0;
    $("#productForm")[0].reset();
    $("#category").val("").trigger("change");
    $("#mfgDate").datepicker("clearDates");
    $("#expiryDate").datepicker("clearDates");
    $("button[type='submit']").text("Save Product");
}

/* ---------- DATE HELPERS ---------- */
function parseDdMmYyyy(dateStr) {
    if (!dateStr) return null;

    const parts = dateStr.includes("/")
        ? dateStr.split("/")
        : dateStr.split("-");

    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts;
    return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
}