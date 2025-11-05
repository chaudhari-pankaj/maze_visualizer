const height = 400;
const width = 400;
const rows = 10;
const cols = 10;
const cell_height = height/rows;
const cell_width = width/cols;

const generate_canvas = (height,width) => {
    const maze = document.getElementById("maze");
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    maze.appendChild(canvas);
    return canvas;
};

const canvas = generate_canvas(400,400);
const ctx = canvas.getContext("2d");

ctx.fillStyle = 'grey';
ctx.fillRect(0,0,height,width);

const x_coord = (col_index) => {
    return col_index * cell_width;
};

const y_coord = (row_index) => {
    return row_index * cell_height;
};

const draw_line = (x1,y1,x2,y2) => {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
};

let grid = [];
let grid_row = [];
const draw_grid = (rows,cols) => {
    for(let col_index = 0; col_index < cols; col_index++) {
        for(let row_index = 0; row_index < rows; row_index++) {
            //creating grid matrix for future reference
            grid_row.push({
                row : row_index,
                col : col_index,
                border : [true,true,true,true], // top>right>bottom>left
                visited : false
            });
            //drawing the cell walls
            let x1 = x_coord(col_index);
            let y1 = y_coord(row_index);

            draw_line(x1,y1,x1+cell_width,y1);
            draw_line(x1 + cell_width,y1,x1 + cell_width,y1 + cell_height);
            draw_line(x1 + cell_width,y1 + cell_height,x1, y1 + cell_height);
            draw_line(x1,y1 + cell_height,x1,y1);
        }
        grid.push(grid_row);
        grid_row = [];
    }
};
draw_grid(rows,cols);