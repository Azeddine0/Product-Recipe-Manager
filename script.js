document.addEventListener("DOMContentLoaded", () => {
  const productsTable = document
    .getElementById("productsTable")
    .querySelector("tbody");
  const recipeTable = document
    .getElementById("recipeTable")
    .querySelector("tbody");
  const searchBar = document.getElementById("searchBar");
  const categorySearchBar = document.getElementById("categorySearchBar");
  const printRecipeButton = document.getElementById("printRecipe");
  const clearRecipeButton = document.getElementById("clearRecipe");
  const recipeTotal = document.getElementById("recipeTotal");
  const categorySelect = document.getElementById("category");
  const printModal = document.getElementById("printModal");
  const confirmPrintButton = document.getElementById("confirmPrint");
  const cancelPrintButton = document.getElementById("cancelPrint");
  const loadingSpinner = document.getElementById("loadingSpinner");

  let products = [];
  let totalPrice = 0;

  fetch("db.json")
    .then((response) => {
      loadingSpinner.style.display = "block";
      return response.json();
    })
    .then((data) => {
      products = data;
      displayProducts(products);
      loadingSpinner.style.display = "none";
    });

  // Display products in the table
  function displayProducts(products) {
    productsTable.innerHTML = "";
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.code}</td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.color}</td>
        <td>${product.category}</td>
        <td>${product.price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" max="${
            product.quantity
          }" value="1" class="quantity-input" />
          <button data-code="${product.code}">Add</button>
        </td>
      `;
      productsTable.appendChild(row);

      const addButton = row.querySelector("button");
      if (product.quantity <= 0) addButton.disabled = true;

      // Add event listener for "Add" button
      addButton.addEventListener("click", () => {
        const quantityInput = row.querySelector(".quantity-input");
        const quantity = parseInt(quantityInput.value);
        addToRecipe(product, quantity);
        updateProductQuantity(product, quantity);
        calculateTotalPrice();
      });
    });
  }

  // Add product to recipe table
  function addToRecipe(product, quantity) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.code}</td>
      <td>${product.name}</td>
      <td>${quantity}</td>
      <td>${product.color}</td>
      <td>${product.category}</td>
      <td>${(product.price * quantity).toFixed(2)}</td>
      <td><button>Delete</button></td>
    `;
    recipeTable.appendChild(row);

    // Add event listener for "Delete" button
    row.querySelector("button").addEventListener("click", () => {
      recipeTable.removeChild(row);
      product.quantity += quantity; // Restore quantity
      calculateTotalPrice();
      displayProducts(products);
    });
  }

  // Update product quantity in the main table
  function updateProductQuantity(product, quantity) {
    product.quantity -= quantity;
    if (product.quantity < 0) product.quantity = 0;
    displayProducts(products);
  }

  // Calculate and display total price
  function calculateTotalPrice() {
    totalPrice = 0;
    const rows = recipeTable.querySelectorAll("tr");
    rows.forEach((row) => {
      const price = parseFloat(row.children[5].textContent);
      totalPrice += price;
    });
    recipeTotal.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
  }

  // Search functionality
  searchBar.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.code.toString().includes(searchTerm)
    );
    displayProducts(filteredProducts);
  });

  // Category search functionality
  categorySearchBar.addEventListener("input", (e) => {
    const categoryTerm = e.target.value.toLowerCase();
    const filteredProducts = products.filter((product) =>
      product.category.toLowerCase().includes(categoryTerm)
    );
    displayProducts(filteredProducts);
  });

  // Category dropdown filter functionality
  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    let filteredProducts;
    if (selectedCategory) {
      filteredProducts = products.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    } else {
      filteredProducts = products; // Show all if no category selected
    }
    displayProducts(filteredProducts);
  });

  // Print recipe functionality
  printRecipeButton.addEventListener("click", () => {
    printModal.style.display = "flex";
  });

  confirmPrintButton.addEventListener("click", () => {
    printModal.style.display = "none";
    const printContent = document.querySelector(".recipe-section").innerHTML;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Recipe</title></head>
        <body>
          <h1>Recipe</h1>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });

  cancelPrintButton.addEventListener("click", () => {
    printModal.style.display = "none";
  });

  // Clear recipe functionality
  clearRecipeButton.addEventListener("click", () => {
    recipeTable.innerHTML = "";
    totalPrice = 0;
    recipeTotal.textContent = `Total Price: $${totalPrice.toFixed(2)}`;
    products.forEach((product) => (product.quantity += 1));
    displayProducts(products);
  });
});
