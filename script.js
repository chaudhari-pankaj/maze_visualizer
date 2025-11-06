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

const draw_line = (x1,y1,x2,y2,color) => {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = color;
    ctx.stroke();
};

let grid = []; //important

let grid_row = [];

const draw_grid = (rows,cols) => {
    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            // creating grid matrix for future reference
            grid_row.push({
                visited : false
            });

            //drawing the cell walls
            let x1 = x_coord(col_index);
            let y1 = y_coord(row_index);

            draw_line(x1,y1,x1+cell_width,y1,"black");
            draw_line(x1 + cell_width,y1,x1 + cell_width,y1 + cell_height,"black");
            draw_line(x1 + cell_width,y1 + cell_height,x1, y1 + cell_height,"black");
            draw_line(x1,y1 + cell_height,x1,y1,"black");
        }
        grid.push(grid_row);
        grid_row = [];
    }
};
draw_grid(rows,cols);

const wait = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve,time);
    })
};

let frontier = [[0,0]];
//coords [row_index,col_index], source [row_index,col_index];

const generate_maze = async (frontier,grid) => {

    for(let iter = 0; iter < frontier.length; iter++) {
        ctx.fillStyle = "purple";
        ctx.fillRect(x_coord(frontier[iter][1]),y_coord(frontier[iter][0]),cell_width,cell_height);
    }
    await wait(500);

    //choose a random frontier
    let chosen_frontier = Math.floor(Math.random()*frontier.length);

    
    //col_index and row_index of current cell
    row_index = frontier[chosen_frontier][0];
    col_index = frontier[chosen_frontier][1];
    
    ctx.fillStyle = "black";
    ctx.fillRect(x_coord(col_index),y_coord(row_index),cell_width,cell_height);
    await wait(500);

    ctx.fillStyle = "green";
    ctx.fillRect(x_coord(col_index),y_coord(row_index),cell_width,cell_height);
    await wait(500);

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
    //connnect
    if(possible_path.length !== 0) {
        let cell_index = Math.floor(Math.random()*possible_path.length);
        let source_row_index = possible_path[cell_index][0];
        let source_col_index = possible_path[cell_index][1];

        let x_pos,y_pos;

        if(row_index - source_row_index === 1) {
            //is source up?
            x_pos = x_coord(col_index);
            y_pos = y_coord(row_index);
            draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"white");
        }
        else if(row_index - source_row_index === -1) {
            //is source down?
            x_pos = x_coord(source_col_index);
            y_pos = y_coord(source_row_index);
            draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"white");
        }
        else if(col_index - source_col_index === 1) {
            //is source left?
            x_pos = x_coord(col_index);
            y_pos = y_coord(row_index);
            draw_line(x_pos,y_pos,x_pos,y_pos + cell_height,"white");
        }
        else {
            //is source right?
            x_pos = x_coord(source_col_index);
            y_pos = y_coord(source_row_index);
            draw_line(x_pos,y_pos,x_pos,y_pos + cell_height,"white");
        }
    }
    await wait(500);

    if(frontier.length === 0)
        return;

    generate_maze(frontier,grid);
}

generate_maze(frontier,grid);