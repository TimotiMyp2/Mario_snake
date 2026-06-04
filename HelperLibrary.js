function ClearGrid() {
    var DOMGrid = document.getElementById("grid_id");
    DOMGrid.innerHTML = "";
}

function AddBlock(x, y, color) {
    var DOMGrid = document.getElementById("grid_id");

    var newDiv = document.createElement("div");
    newDiv.setAttribute("id", "gx" + x + "y" + y);
    newDiv.setAttribute("class", color);
    DOMGrid.appendChild(newDiv);
}

function ChangeBlockColor(x, y, color) {
    targetDiv = document.getElementById("gx" + x + "y" + y);
    targetDiv.setAttribute("class", color);
}
