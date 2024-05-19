const nameOrderingButton = document.getElementById('order-album-name');
const dateOrderingButton = document.getElementById('order-album-date');

nameOrderingButton.addEventListener('click', () => {
    setNameOrdering();
});


dateOrderingButton.addEventListener('click', () => {
    setDateOrdering();
});

function setNameOrdering()  {
    $("#ordered-by-name").css("display", "flex");
    $("#ordered-by-date").css("display", "none");

    nameOrderingButton.className = "album-order-selector active-link"
    dateOrderingButton.className = "album-order-selector"

    localStorage.setItem('album_ordering', 'name');
};

function setDateOrdering()  {
    $("#ordered-by-date").css("display", "flex");
    $("#ordered-by-name").css("display", "none");

    dateOrderingButton.className = "album-order-selector active-link"
    nameOrderingButton.className = "album-order-selector"

    localStorage.setItem('album_ordering', 'date');
};

function orderingOnLoading() {
    var ordering = localStorage.getItem('album_ordering');

    if (ordering === null || ordering === "name"){
        setNameOrdering();
    }
    else{
        setDateOrdering();
    }
};

orderingOnLoading();