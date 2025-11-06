//!!important parameters of maze
const height = 400;
const width = 400;
const rows = 10;
const cols = 10;
const cell_height = height/rows;
const cell_width = width/cols;

const generate_canvas = (width,height) => {
    const maze = document.getElementById("maze");
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    maze.appendChild(canvas);
    return canvas;
};

const canvas = generate_canvas(width,height);
const ctx = canvas.getContext("2d");


const x_coord = (col_index) => {
    return col_index * cell_width;
};

const y_coord = (row_index) => {
    return row_index * cell_height;
};

const draw_line = (x1,y1,x2,y2,color) => {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = color;
    ctx.stroke();
};

const wait = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve,time);
    })
};

let grid = []; //important

let grid_row = [];

//initialize grid to all blocked
for(let row_index = 0; row_index < rows; row_index++) {
    for(let col_index = 0; col_index < cols; col_index++) {
        // creating grid matrix for future reference
        grid_row.push({
            visited : false,
            border : [true,true,true,true], //top right bottom left
            visited_cost : rows + cols
        });
    }
    grid.push(grid_row);
    grid_row = [];
}

const draw_grid = async (grid,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(0,0,height,width);
    for(let row_index = 0; row_index < grid.length; row_index++) {
        for(let col_index = 0; col_index < grid[0].length ; col_index++) {
            //initiallizing the relative position of cell's top left corner in canvas
            let x1 = x_coord(col_index);
            let y1 = y_coord(row_index);
            
            //coloring the visited cells differently
            if(grid[row_index][col_index].visited) {
                ctx.fillStyle = "rgba(64, 64, 249, 1)";
                ctx.fillRect(x1,y1,cell_width,cell_height);
            }
            //drawing the cell walls
            if(grid[row_index][col_index].border[0])
                draw_line(x1,y1,x1+cell_width,y1,"black");
            if(grid[row_index][col_index].border[1])
                draw_line(x1 + cell_width,y1,x1 + cell_width,y1 + cell_height,"black");
            if(grid[row_index][col_index].border[2])
                draw_line(x1 + cell_width,y1 + cell_height,x1, y1 + cell_height,"black");
            if(grid[row_index][col_index].border[3])
                draw_line(x1,y1 + cell_height,x1,y1,"black");

        }
    }
};
draw_grid(grid,"grey");


let frontier = [[0,0]];
//coords [row_index,col_index], source [row_index,col_index];

//delay in milliseconds between each step for better visualization
let delay = 100;

//randomized prim's algorithm
const generate_maze = async (frontier,grid) => {

    //mark all the frontier cells as purple to show the choices available
    for(let iter = 0; iter < frontier.length; iter++) {
        ctx.fillStyle = "rgba(49, 206, 1, 1)";
        ctx.fillRect(x_coord(frontier[iter][1]),y_coord(frontier[iter][0]),cell_width,cell_height);
    }
    await wait(delay);

    //choose a random frontier
    let chosen_frontier = Math.floor(Math.random()*frontier.length);

    
    //col_index and row_index of current cell
    row_index = frontier[chosen_frontier][0];
    col_index = frontier[chosen_frontier][1];
    
    //mark the frontier cell chosen as black for visualization
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(x_coord(col_index),y_coord(row_index),cell_width,cell_height);
    await wait(delay);

    //turn it back to purple 
    ctx.fillStyle = "rgba(49, 206, 1, 1)";
    ctx.fillRect(x_coord(col_index),y_coord(row_index),cell_width,cell_height);
    await wait(delay);
    
    //pop out the chosen frontier(current cell) from the frontier list
    let temp = frontier[chosen_frontier];
    frontier[chosen_frontier] = frontier[frontier.length - 1];
    frontier[frontier.length - 1] = temp;
    frontier.pop(); 

    //mark the chosen frotier as visited
    grid[row_index][col_index].visited = true;

    //looking for neighbors to make a connection or marking them as frontiers
    let possible_path = [];

    //down
    if(row_index + 1 < rows) {
        if(grid[row_index +1][col_index].visited === false) {
            if(!frontier.find((element) => { if(element[0] === row_index + 1 && element[1] === col_index) return true;}))
                frontier.push([row_index + 1,col_index]);
        }
        else {
            possible_path.push([row_index + 1,col_index]);
        }
    }
    //right
    if(col_index + 1 < cols) {
        if(grid[row_index][col_index + 1].visited === false) {
            if(!frontier.find((element) => { if(element[0] === row_index && element[1] === col_index + 1) return true;}))
                frontier.push([row_index,col_index + 1]);
        }
        else {
            possible_path.push([row_index,col_index + 1]);
        }
    }
    //up
    if(row_index - 1 >= 0) {
        if(grid[row_index - 1][col_index].visited === false) {
            if(!frontier.find((element) => { if(element[0] === row_index -1 && element[1] === col_index) return true; }))
                frontier.push([row_index -1,col_index]);
        }
        else {
            possible_path.push([row_index -1,col_index]);
        }
    }
    //left
    if(col_index - 1 >= 0) {
        if(grid[row_index][col_index - 1].visited === false) {
            if(!frontier.find((element) => { if(element[0] === row_index && element[1] === col_index - 1) return true; }))
                frontier.push([row_index,col_index - 1]);
        }
        else {
            possible_path.push([row_index,col_index - 1]);
        }
    }

    //connnect the chosen frontier cell with the maze
    if(possible_path.length !== 0) {
        let cell_index = Math.floor(Math.random()*possible_path.length);
        let source_row_index = possible_path[cell_index][0];
        let source_col_index = possible_path[cell_index][1];


        if(row_index - source_row_index === 1) {
            //is source up?
            grid[source_row_index][source_col_index].border[2] = false;
            grid[row_index][col_index].border[0] = false;
        }
        else if(row_index - source_row_index === -1) {
            //is source down?
            grid[source_row_index][source_col_index].border[0] = false;
            grid[row_index][col_index].border[2] = false;
        }
        else if(col_index - source_col_index === 1) {
            //is source left?
            grid[source_row_index][source_col_index].border[1] = false;
            grid[row_index][col_index].border[3] = false;
        }
        else {
            //is source right?
            grid[source_row_index][source_col_index].border[3] = false;
            grid[row_index][col_index].border[1] = false;
        }
    }

    //update the grid
    draw_grid(grid,"grey");

    await wait(delay);

    //base case when there are no frontier cells
    if(frontier.length === 0)
        return;

    generate_maze(frontier,grid);
}

generate_maze(frontier,grid);