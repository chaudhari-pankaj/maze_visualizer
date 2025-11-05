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
    for(let col_index = 0; col_index < cols; col_index++) {
        for(let row_index = 0; row_index < rows; row_index++) {
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

let frontier = [{coords:[0,0],source:[0,0]}];

const generate_maze = async (col_index,row_index,frontier,grid) => {
    //base case: if there are no frontier cells remaining that means the entire maze has been covered
    if(frontier.length === 0)
        return;

    //mark current cell as visited first
    grid[col_index][row_index].visited = true;
    // ctx.fillStyle = "red";
    // ctx.fillRect(x_coord(col_index),y_coord(row_index),cell_width,cell_height);

    //check for available neighbors and add them as frontier cells
    if(col_index + 1 < cols && grid[col_index + 1][row_index].visited === false)
        frontier.push({coords : [col_index + 1, row_index], source : [col_index,row_index]});
    if(col_index - 1 >= 0 && grid[col_index - 1][row_index].visited === false)
        frontier.push({coords : [col_index - 1, row_index], source : [col_index,row_index]});
    if(row_index + 1 < rows && grid[col_index][row_index + 1].visited === false)
        frontier.push({coords : [col_index, row_index + 1], source : [col_index,row_index]});
    if(row_index - 1 >= 0 && grid[col_index][row_index - 1].visited === false)
        frontier.push({coords : [col_index, row_index - 1], source : [col_index,row_index]});

    //pick a random cell out of the frontier cells
    let chosen_frontier = Math.floor(Math.random() * frontier.length);

    
    //remove the wall between the source cell and the chosen frontier cell
    let frontier_x = frontier[chosen_frontier].coords[0];
    let frontier_y = frontier[chosen_frontier].coords[1];
    let source_x = frontier[chosen_frontier].source[0];
    let source_y = frontier[chosen_frontier].source[1];
    
    if(frontier_x - source_x === 1) {
        //remove source right
        let x_pos = x_coord(frontier_x);
        let y_pos = y_coord(frontier_y);
        draw_line(x_pos,y_pos,x_pos,y_pos + cell_height,"grey");
    }
    else if(frontier_x - source_x === -1) {
        //remove source left
        let x_pos = x_coord(source_x);
        let y_pos = y_coord(source_y);
        draw_line(x_pos,y_pos,x_pos,y_pos + cell_height,"grey");
    }
    else if(frontier_y - source_y === 1) {
        //remove top
        let x_pos = x_coord(frontier_x);
        let y_pos = y_coord(frontier_y);
        draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"grey");
    }
    else {
        //remove bottom 
        let x_pos = x_coord(source_x);
        let y_pos = y_coord(source_y);
        draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"grey");
        
    }

    //remove the chosen frontier cell from the frontier cells list
    if(chosen_frontier == frontier.length -1)
        frontier.pop();
    else {
        let temp = frontier[chosen_frontier];
        frontier[chosen_frontier] = frontier[frontier.length -1];
        frontier[frontier.length - 1] = temp;
        frontier.pop();
    }
    
    //move to the chosen frontier cell
    await wait(50);
    generate_maze(frontier_x,frontier_y,frontier,grid);
}

generate_maze(0,0,frontier,grid);