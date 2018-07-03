/* Toggle Animation for nav element, transitioning between sun and moon svgs */

const isDisplayed = element => {
    let display = window.getComputedStyle(element).display;
    return display !== "none" && display !== "";
}

const toggleDisplay = element => { 
    element.style.display = !isDisplayed(element) ? "flex" : "none";
};

controls = document.querySelectorAll(".controls > svg");
controls.forEach(svg => svg.addEventListener("click", 
    () => controls.forEach(svg => toggleDisplay(svg))
));

/* Transition background when cursor is hovering over a category's thumbnail */

function getImageCategory(img) {
    const match_category = /\/([a-z_]*)-[a-z\.]*$/i;
    return match_category.exec(img.src)[1];
}

function mapCategoryToBackgroundImg(imgs) {
    let map = [];
    const match_category = /\/([a-z_]*)-[a-z\.]*$/i;
    imgs.forEach(img => {
        const category = match_category.exec(img.src)[1];
        map[category] = img;
    });
    return map;
}

thumbnails = document.querySelectorAll("section.portfolio div.poster")
let cat2img = mapCategoryToBackgroundImg(
    document.querySelectorAll("div.thumbnail-backgrounds img")
);

thumbnails.forEach(thumb => {
    const category = getImageCategory(thumb.querySelector("img"));

    thumb.addEventListener('mouseenter', () => {
        const categories = Object.keys(cat2img);
        for (let c in categories) {
            c = categories[c];
            if (c === category) {
                cat2img[c].classList.add('visible');
            } else {
                cat2img[c].classList.remove('visible');
            }
        }
    });
});

portfolio = document.querySelector("section.portfolio");
portfolio.addEventListener('mouseleave', () => {
    const categories = Object.keys(cat2img);
    for (let c in categories) {
        c = categories[c];
        cat2img[c].classList.remove('visible');
    }
});
