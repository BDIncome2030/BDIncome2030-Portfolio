// Portfolio JavaScript

document.addEventListener("DOMContentLoaded", function () {
    console.log("BDIncome2030 Portfolio loaded successfully!");

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));

            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });
});
