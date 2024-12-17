const userManager = require("../models/schemas/userManager");
const { priceToIdr } = require("../utils/format");
const axios = require("axios");

exports.getCategoryPage = async (req, res) => {
  const requestedId = req.params.id;
  const loggedInUserId = req.user.id;
  const categoryName = req.params.category;

  try {
    if (requestedId !== loggedInUserId) {
      return res.status(403).render("errors/error", {
        layout: false,
        code: "403",
        message: "Access Forbidden: Anda tidak dapat mengakses halaman ini.",
      });
    }

    // Cari data user berdasarkan ID
    const user = await userManager.findUserId(requestedId);
    if (!user) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "User tidak ditemukan",
        code: "404",
      });
    }

    // Cek apakah kategori ada
    if (!categoryName) {
      return res.status(400).render("errors/error", {
        layout: false,
        message: "Kategori tidak valid.",
        code: "400",
      });
    }

    // Ambil daftar kategori
    const getCategoryList = await axios.get(
      "https://dummyjson.com/products/category-list"
    );

    const categoryList = getCategoryList.data;

    // Ambil produk berdasarkan kategori yang dipilih
    const categorySearch = await axios.get(
      `https://dummyjson.com/products/category/${categoryName}`
    );

    // Jika tidak ada produk untuk kategori ini, tampilkan error 404
    if (
      !categorySearch.data.products ||
      categorySearch.data.products.length === 0
    ) {
      return res.status(404).render("errors/error", {
        layout: false,
        message: "Page Not Found",
        code: "404",
      });
    }

    // Jika produk ditemukan, render halaman kategori
    const products = categorySearch.data.products;
    res.render("categoryPage", {
      layout: "partials/categoryMain",
      title: `Category ${categoryName} `,
      products,
      user,
      priceToIdr,
      categoryList,
      categoryName,
    });
  } catch (error) {
    console.error("Error loading user profile:", error);
    return res.status(500).render("errors/error", {
      layout: false,
      message: "Terjadi kesalahan saat memuat profil. " + error.message,
      code: "500",
    });
  }
};
