const canvas = document.getElementById("canvas");

//!!important parameters of maze visualizer
if(window.innerWidth > 502 + 20) {
    canvas.height = 502;
    canvas.width = 502;
}
else {
    canvas.height = window.innerWidth - 20;
    canvas.width = window.innerWidth -20;
}
let height = canvas.width - 2;
let width = canvas.width - 2;
let rows = 10;
let cols = 10;
let cell_height = height/rows;
let cell_width = width/cols;
let starting_cell = [1,1];
let goal = [rows -2,cols -2];
let delay = 10; //delay in milliseconds between each step for better visualization
let generate_maze_delay = 0;

const generate_canvas = (width,height) => {
    const maze = document.getElementById("maze");
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    maze.appendChild(canvas);
    return canvas;
};
// const canvas = generate_canvas(width,height);
const ctx = canvas.getContext("2d");
ctx.translate(1,1);

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

const fill_cell = (x1,y1,color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x1,y1,cell_width,cell_height);
}

const wait = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve,time);
    })
};

const initialize_grid = () => {
    let grid = [];
    let grid_row = [];

    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            // creating grid matrix for future reference
            grid_row.push({
                visited : false,
                border : [true,true,true,true], //top right bottom left
            });
        }
        grid.push(grid_row);
        grid_row = [];
    }
    return grid;
}

const draw_grid = async (grid,visited_cell_color,background_color) => {
    ctx.fillStyle = background_color;
    ctx.fillRect(0,0,height,width);
    for(let row_index = 0; row_index < grid.length; row_index++) {
        for(let col_index = 0; col_index < grid[0].length ; col_index++) {
            //initiallizing the relative position of cell's top left corner in canvas
            let x1 = x_coord(col_index);
            let y1 = y_coord(row_index);
            
            //coloring the visited cells differently
            if(grid[row_index][col_index].visited) {
                fill_cell(x1,y1,visited_cell_color);
            }
            //drawing the cell walls
            if(grid[row_index][col_index].border[0])
                draw_line(x1,y1,x1+cell_width,y1,"white");
            if(grid[row_index][col_index].border[1])
                draw_line(x1 + cell_width,y1,x1 + cell_width,y1 + cell_height,"white");
            if(grid[row_index][col_index].border[2])
                draw_line(x1 + cell_width,y1 + cell_height,x1, y1 + cell_height,"white");
            if(grid[row_index][col_index].border[3])
                draw_line(x1,y1 + cell_height,x1,y1,"white");

        }
    }
};

//randomized prim's algorithm
const generate_maze = async (frontier,grid) => {
    
    //mark all the frontier cells as purple to show the choices available
    for(let iter = 0; iter < frontier.length; iter++) {
        fill_cell(x_coord(frontier[iter][1]),y_coord(frontier[iter][0]),"purple");
    }
    await wait(generate_maze_delay);
    
    //choose a random frontier
    let chosen_frontier = Math.floor(Math.random()*frontier.length);
    
    
    //col_index and row_index of current cell
    row_index = frontier[chosen_frontier][0];
    col_index = frontier[chosen_frontier][1];
    
    //mark the frontier cell chosen as black for visualization
    fill_cell(x_coord(col_index),y_coord(row_index),"rgb(0,0,0)");
    await wait(generate_maze_delay);
    
    //turn it back to purple 
    fill_cell(x_coord(col_index),y_coord(row_index),"purple");
    await wait(generate_maze_delay);
    
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
    draw_grid(grid,"green","rgb(36, 36, 36)");
    
    await wait(generate_maze_delay);
    
    //base case when there are no frontier cells
    if(frontier.length === 0)
        return;
    
    await generate_maze(frontier,grid);
}

const draw_empty_grid = () => {
    let grid = initialize_grid();
    draw_grid(grid,"rgb(36, 36, 36)","rgb(36, 36, 36)");
}


//dfs
const dfs = async (row_index,col_index,solution_path,goal,grid) => {
    //checking if the current cell is out of bounds
    if(row_index + 1 > rows || row_index < 0 || col_index + 1 > cols || col_index < 0)
        return false;

    //checking if the cell was previously visited
    if(grid[row_index][col_index].visited === true)
        return false;
    
    //mark the current cell as visited;
    solution_path.push([row_index,col_index]);
    grid[row_index][col_index].visited = true;
    draw_grid(grid,"green","rgb(36, 36, 36)");
    await wait(delay);

    //checking if the current cell has reached the goal
    if(row_index === goal[0] && col_index === goal[1]) {
        return true;
    }

    //down
    if(grid[row_index][col_index].border[2] === false) {
        if(await dfs(row_index + 1,col_index,solution_path,goal,grid) === true)
            return true;
    }
    //right
    if(grid[row_index][col_index].border[1] === false) {
        if(await dfs(row_index,col_index + 1,solution_path,goal,grid) === true)
            return true;
    }
    //up
    if(grid[row_index][col_index].border[0] === false) {
        if(await dfs(row_index - 1,col_index,solution_path,goal,grid) === true)
            return true;
    }
    //left
    if(grid[row_index][col_index].border[3] === false) {
        if(await dfs(row_index,col_index -1,solution_path,goal,grid) === true)
            return true;
    }

    solution_path.pop();
    
    return false;
}


const insert_frontier_queue_djikstra = (insertion_element,frontier_queue,cell_params) => {
    //start from the last element !! here the last element index will be length because we insert an element
    let iter = frontier_queue.length;
    
    //push a dummy element in the last (to create an extra element)
    frontier_queue.push([0,0]);

    while(iter - 1 >= 0) {
        //if iter - 1 element has cost greater than insertion element insert the element in the current iter and break the loop
        if(cell_params[frontier_queue[iter - 1][0]][frontier_queue[iter - 1][1]].cost > cell_params[insertion_element[0]][insertion_element[1]].cost) {
            frontier_queue[iter][0] = insertion_element[0];
            frontier_queue[iter][1] = insertion_element[1];
            break;
        }
        else {//else move the iter - 1 element to iter
            frontier_queue[iter][0] = frontier_queue[iter -1][0];
            frontier_queue[iter][1] = frontier_queue[iter -1][1];
        }
        //move iter to iter -1
        iter --;
    }
    if(iter === 0) {
        frontier_queue[iter][0] = insertion_element[0];
        frontier_queue[iter][1] = insertion_element[1];
    }
};

const insert_frontier_queue_a_star = (insertion_element,frontier_queue,cell_params) => {
    //start from the last element !! here the last element index will be length because we insert an element
    let iter = frontier_queue.length;
    
    //push a dummy element in the last (to create an extra element)
    frontier_queue.push([0,0]);

    while(iter - 1 >= 0) {
        //if iter - 1 element has cost greater than insertion element insert the element in the current iter and break the loop
        if(cell_params[frontier_queue[iter - 1][0]][frontier_queue[iter - 1][1]].total_cost > cell_params[insertion_element[0]][insertion_element[1]].total_cost) {
            frontier_queue[iter][0] = insertion_element[0];
            frontier_queue[iter][1] = insertion_element[1];
            break;
        }
        else if(cell_params[frontier_queue[iter - 1][0]][frontier_queue[iter - 1][1]].total_cost === cell_params[insertion_element[0]][insertion_element[1]].total_cost) {
            if(cell_params[frontier_queue[iter - 1][0]][frontier_queue[iter - 1][1]].heuristic > cell_params[insertion_element[0]][insertion_element[1]].heuristic) {
                frontier_queue[iter][0] = insertion_element[0];
                frontier_queue[iter][1] = insertion_element[1];
                break;
            }
            else {
                frontier_queue[iter][0] = frontier_queue[iter -1][0];
                frontier_queue[iter][1] = frontier_queue[iter -1][1];
            }
        }
        else {//else move the iter - 1 element to iter
            frontier_queue[iter][0] = frontier_queue[iter -1][0];
            frontier_queue[iter][1] = frontier_queue[iter -1][1];
        }
        //move iter to iter -1
        iter --;
    }
    if(iter === 0) {
        frontier_queue[iter][0] = insertion_element[0];
        frontier_queue[iter][1] = insertion_element[1];
    }
};

const djikstra = async (cell_params, frontier_queue,goal, grid) => {
    //base case : if frontier queue is empty there's no solution to this maze
    if(frontier_queue.length === 0)
        return false;

    for(let iter = 0; iter < frontier_queue.length; iter++) {
        fill_cell(x_coord(frontier_queue[iter][1]),y_coord(frontier_queue[iter][0]),"purple");
        ctx.font = `${cell_height/2}px Monospace`
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cell_params[frontier_queue[iter][0]][frontier_queue[iter][1]].cost,x_coord(frontier_queue[iter][1]) + cell_width/2 ,y_coord(frontier_queue[iter][0]) + cell_height/2);
    }
    await wait(delay);

    //choose the min element in frontier queue
    let row_index = frontier_queue[frontier_queue.length -1][0];
    let col_index = frontier_queue[frontier_queue.length -1][1];
    frontier_queue.pop();

    fill_cell(x_coord(col_index),y_coord(row_index),"black");
    await wait(delay);

    //mark the chosen element as visited
    grid[row_index][col_index].visited = true;
    draw_grid(grid,"green","rgb(36, 36, 36)");
    await wait(delay);

    //check if the chosen element is the goal if yes return true
    if(goal[0] === row_index && goal[1] === col_index)
        return true;

    //check all the neighbors
    //update the neighbors cost if it's min when coming via current cell and make the current cell as the source
    //up
    if(row_index - 1 >= 0 && grid[row_index][col_index].border[0] === false && grid[row_index - 1][col_index].visited === false) {
        if(cell_params[row_index - 1][col_index].cost > cell_params[row_index][col_index].cost + 1) {
            cell_params[row_index - 1][col_index].cost = cell_params[row_index][col_index].cost + 1;
            cell_params[row_index - 1][col_index].source = [row_index,col_index];
            //insert in priority queue such that it stays in descending order
            insert_frontier_queue_djikstra([row_index - 1,col_index],frontier_queue,cell_params);           
        }
    }
    //right
    if(col_index + 1 < cols && grid[row_index][col_index].border[1] === false && grid[row_index][col_index + 1].visited === false) {
        if(cell_params[row_index][col_index + 1].cost > cell_params[row_index][col_index].cost + 1) {
            cell_params[row_index][col_index + 1].cost = cell_params[row_index][col_index].cost + 1;
            cell_params[row_index][col_index + 1].source = [row_index,col_index];
            //insert in priority queue such that it stays in descending order       
            insert_frontier_queue_djikstra([row_index,col_index + 1],frontier_queue,cell_params);     
        }
    }
    //down
    if(row_index + 1 < rows && grid[row_index][col_index].border[2] === false && grid[row_index + 1][col_index].visited === false) {
        if(cell_params[row_index + 1][col_index].cost > cell_params[row_index][col_index].cost + 1) {
            cell_params[row_index + 1][col_index].cost = cell_params[row_index][col_index].cost + 1;
            cell_params[row_index + 1][col_index].source = [row_index,col_index];
            //insert in priority queue such that it stays in descending order      
            insert_frontier_queue_djikstra([row_index + 1,col_index],frontier_queue,cell_params);      
        }
    }
    //left
    if(col_index - 1 >= 0 && grid[row_index][col_index].border[3] === false && grid[row_index][col_index - 1].visited === false) {
        if(cell_params[row_index][col_index - 1].cost > cell_params[row_index][col_index].cost + 1) {
            cell_params[row_index][col_index - 1].cost = cell_params[row_index][col_index].cost + 1;
            cell_params[row_index][col_index - 1].source = [row_index,col_index];
            //insert in priority queue such that it stays in descending order    
            insert_frontier_queue_djikstra([row_index,col_index -1],frontier_queue,cell_params);        
        }
    }

    //call the function to move to the next element on the frontier queue
    if(await djikstra(cell_params,frontier_queue,goal,grid) === true)
        return true;
    return false;
}


//cell params[][] = [{cost:f(n)}];
//mark the cost of all the cells as infinity except the starting cell which we we'll mark it as rows + cols
//ideally we should mark it as h(n) the estimate of them dist it would have to travel from here to the goal because g(n) = 0;
//f(n) = g(n) + h(n)
//we'll pick h(n) to be the manhattan distance
const calculate_heuristic = (row_index,col_index,goal) => {
    return Math.floor(goal[0] - row_index) + Math.floor(goal[1] - col_index);
}

const a_star = async (frontier_queue,cell_params, goal, grid) => {
    //base case : if frontier list is empty no soln for the given maze
    if(frontier_queue.length === 0)
        return false;

    for(let iter = 0; iter < frontier_queue.length; iter++) {
        fill_cell(x_coord(frontier_queue[iter][1]),y_coord(frontier_queue[iter][0]),"purple");
        ctx.font = `${cell_height/2}px Monospace`
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cell_params[frontier_queue[iter][0]][frontier_queue[iter][1]].total_cost,x_coord(frontier_queue[iter][1]) + cell_width/2 ,y_coord(frontier_queue[iter][0]) + cell_height/2);
    }
    await wait(delay);

    //pick the frontier with least cost
    //we'll be storing the frontier cells in descending order to make deletion efficient
    row_index = frontier_queue[frontier_queue.length - 1][0];
    col_index = frontier_queue[frontier_queue.length - 1][1];

    //remove the chosen cell from frontier cells
    frontier_queue.pop();

    fill_cell(x_coord(col_index),y_coord(row_index),"black");
    await wait(delay);

    //mark the current cell as visited
    grid[row_index][col_index].visited = true;
    draw_grid(grid,"green","rgb(36, 36, 36)");
    await wait(delay);

    //check if the current cell is the goal cell if yes return true
    if(row_index === goal[0] && col_index === goal[1])
        return true;

    //explore all it's neighbors and calculate their costs and store it..
    //up
    if(row_index - 1 >= 0 && grid[row_index][col_index].border[0] === false && grid[row_index - 1][col_index].visited === false) {
        cell_params[row_index - 1][col_index].actual_cost = cell_params[row_index][col_index].actual_cost + 1;
        cell_params[row_index - 1][col_index].heuristic = calculate_heuristic(row_index -1,col_index,goal);
        cell_params[row_index - 1][col_index].total_cost = cell_params[row_index - 1][col_index].actual_cost + cell_params[row_index -1][col_index].heuristic;
        cell_params[row_index - 1][col_index].source = [row_index,col_index];
        insert_frontier_queue_a_star([row_index -1,col_index],frontier_queue,cell_params);
    }
    //right
    if(col_index + 1 < cols && grid[row_index][col_index].border[1] === false && grid[row_index][col_index + 1].visited === false) {
        cell_params[row_index][col_index + 1].actual_cost = cell_params[row_index][col_index].actual_cost + 1;
        cell_params[row_index][col_index + 1].heuristic = calculate_heuristic(row_index,col_index + 1,goal);
        cell_params[row_index][col_index + 1].total_cost = cell_params[row_index][col_index + 1].actual_cost + cell_params[row_index][col_index + 1].heuristic;
        cell_params[row_index][col_index + 1].source = [row_index,col_index];
        insert_frontier_queue_a_star([row_index,col_index + 1],frontier_queue,cell_params);
    }
    //down
    if(row_index + 1 < rows && grid[row_index][col_index].border[2] === false && grid[row_index + 1][col_index].visited === false) {      
        cell_params[row_index + 1][col_index].actual_cost = cell_params[row_index][col_index].actual_cost + 1;
        cell_params[row_index + 1][col_index].heuristic = calculate_heuristic(row_index + 1,col_index,goal);
        cell_params[row_index + 1][col_index].total_cost = cell_params[row_index + 1][col_index].actual_cost + cell_params[row_index + 1][col_index].heuristic;
        cell_params[row_index + 1][col_index].source = [row_index,col_index];
        insert_frontier_queue_a_star([row_index + 1,col_index],frontier_queue,cell_params);
    }
    //left
    if(col_index - 1 >= 0 && grid[row_index][col_index].border[3] === false && grid[row_index][col_index - 1].visited === false) {
        cell_params[row_index][col_index - 1].actual_cost = cell_params[row_index][col_index].actual_cost + 1;
        cell_params[row_index][col_index - 1].heuristic = calculate_heuristic(row_index,col_index - 1,goal);
        cell_params[row_index][col_index - 1].total_cost = cell_params[row_index][col_index - 1].actual_cost + cell_params[row_index][col_index - 1].heuristic;
        cell_params[row_index][col_index - 1].source = [row_index,col_index];
        insert_frontier_queue_a_star([row_index,col_index -1],frontier_queue,cell_params);
    }

    //repeat.. 
    if(await a_star(frontier_queue,cell_params,goal,grid) === true)
        return true;
    return false;
}

//flow of functions
draw_empty_grid();
let grid = initialize_grid();

let about = document.getElementById("about");
about.innerHTML = "<h2>Randomized Prim's algorigthm</h2> <ul> >> pick the starting cell and mark it as visited <li> >> add all it's non visited neighbors as frontiers </li><li> >> pick a random frontier and remove the wall between itself and already exisitng maze </li><li>>> go to step one and repeat all the steps till you run out of frontiers</li> </ul>";

const start_maze_generation = document.getElementById("maze_generation");
start_maze_generation.addEventListener("click",async () => {
    about.innerHTML = "<h2>Randomized Prim's algorigthm</h2> <ul> >> pick the starting cell and mark it as visited <li> >> add all it's non visited neighbors as frontiers </li><li> >> pick a random frontier and remove the wall between itself and already exisitng maze </li><li>>> go to step one and repeat all the steps till you run out of frontiers</li> </ul>";
    grid = initialize_grid();
    draw_grid(grid,"rgb(36, 36, 36)","rgb(36, 36, 36)");
    let frontier = [[0,cols - 1]];
    await generate_maze(frontier,grid);
    draw_grid(grid,"rgb(36, 36, 36)","rgb(36, 36, 36)");
});

const start_dfs = document.getElementById("dfs");
start_dfs.addEventListener('click',async () => {
    about.innerHTML = "<h2>Depth first search algorithm</h2><ul><li>>> go to the starting cell and mark it as visited</li><li>>> add it to the soluion</li><li>>> pick all of it's unvisited neighbors on at a time and repeat all the steps from step 1 until you reach the goal or don't have any unvisited cells</li></ul>"
    let solution_path = [];
    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            grid[row_index][col_index].visited = false;
        }
    }
    solution_path = [];
    await dfs(starting_cell[0],starting_cell[1],solution_path,goal,grid);
    
    for(let iter = solution_path.length - 1; iter >= 0; iter--) {
        let x_pos = x_coord(solution_path[iter][1]);
        let y_pos = y_coord(solution_path[iter][0]);
        fill_cell(x_pos,y_pos,"rgba(21, 0, 159, 1)");
        for(let inner_iter = 0; inner_iter < 4; inner_iter++) {
            if(grid[solution_path[iter][0]][solution_path[iter][1]].border[inner_iter]) {
                if(inner_iter === 0)
                    draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"white");
                else if(inner_iter === 1)
                    draw_line(x_pos + cell_width,y_pos,x_pos + cell_width,y_pos + cell_height,"white");
                else if(inner_iter === 2)
                    draw_line(x_pos + cell_width,y_pos + cell_height,x_pos,y_pos + cell_height,"white");
                else
                    draw_line(x_pos,y_pos + cell_height,x_pos,y_pos,"white");
            }
        }
        await wait(delay);
    }
    
    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            grid[row_index][col_index].visited = false;
        }
    }
    
    await draw_grid(grid,"rgb(36, 36, 36)","rgb(36, 36, 36)");

    for(let iter = solution_path.length - 1; iter >= 0; iter--) {
        let x_pos = x_coord(solution_path[iter][1]);
        let y_pos = y_coord(solution_path[iter][0]);
        fill_cell(x_pos,y_pos,"rgba(21, 0, 159, 1)");
        for(let inner_iter = 0; inner_iter < 4; inner_iter++) {
            if(grid[solution_path[iter][0]][solution_path[iter][1]].border[inner_iter]) {
                if(inner_iter === 0)
                    draw_line(x_pos,y_pos,x_pos + cell_width,y_pos,"white");
                else if(inner_iter === 1)
                    draw_line(x_pos + cell_width,y_pos,x_pos + cell_width,y_pos + cell_height,"white");
                else if(inner_iter === 2)
                    draw_line(x_pos + cell_width,y_pos + cell_height,x_pos,y_pos + cell_height,"white");
                else
                    draw_line(x_pos,y_pos + cell_height,x_pos,y_pos,"white");
            }
        }
    }
});

const start_djikstra = document.getElementById("djikstra");
start_djikstra.addEventListener("click", async () => {
    about.innerHTML = "<h2>Djikstra Algorithm</h2><ul><li>>> Initialize the cost of every cell as infinity because we currently don't know about the cost it going to take to visit them</li><li>>> Add the starting cell to the frontiers and set it's cost as zero because it's distance from the start is zero</li><li>>> Mark it as visited</li><li>>> For each of it's unvisited neighbors, if the cost of reaching them via the current cell is less then what it was earlier, update it</li><li>>> Add all of it's unvisited neighbors to the frontier list</li><li>>> Choose the frontier with least cost and repeat the steps from step 2</li></ul>";
    let cell_params = [];
    let cell_params_row = [];
    for(iter = 0; iter < rows; iter++) {
        for(inner_iter = 0; inner_iter < cols; inner_iter++) {
            //initialize the cost of every cell to infinity.. here we know cost can't exceed the no of cells hence cost = row*cols + 1
            cell_params_row.push({cost : rows*cols,source : [rows,cols]});
        }
        cell_params.push(cell_params_row);
        cell_params_row = [];
    }

    //set the cost of starting pt as 0 because we are already there..
    cell_params[starting_cell[0]][starting_cell[1]].cost = 0;

    let frontier_queue = [starting_cell]; //store items in descending order to make deletions more efficient
    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            grid[row_index][col_index].visited = false;
        }
    }
    
    if(await djikstra(cell_params,frontier_queue,goal,grid) === true) {
        let row_index = goal[0];
        let col_index = goal[1];
        
        for(let row_index = 0; row_index < rows; row_index++) {
            for(let col_index = 0; col_index < cols; col_index++) {
                grid[row_index][col_index].visited = false;
            }
        }
        let temp_row_index;
        while(!(row_index === starting_cell[0] && col_index === starting_cell[1])) {
            grid[row_index][col_index].visited = true;
            temp_row_index = cell_params[row_index][col_index].source[0];
            col_index = cell_params[row_index][col_index].source[1];
            row_index = temp_row_index;
            draw_grid(grid,"rgba(21, 0, 159, 1)","rgb(36, 36, 36)");
            await wait(delay);
        }
        grid[row_index][col_index].visited = true;
        draw_grid(grid,"rgba(21, 0, 159, 1)","rgb(36, 36, 36)");
        await wait(delay);
    }
});

const start_a_star = document.getElementById("a_star");
start_a_star.addEventListener("click",async () => {
    about.innerHTML = "<h2>A* Algorithm</h2><ul><li>>> Initialize every cells cost as infinity because we don't know how much it will cost to reach them</li><li>>> Add the starting cell to frontier list and make it's total cost as it's heuristic</li><li>>> Mark it as visited</li><li>>> For each of it's unvisited neighbors calculate it's total cost and add them to frontier list</li><li>>> pick a cell which has the least total_cost as of now and repeat all the steps from step 3</li></ul>";
    let cell_params = [];
    let cell_params_row = [];
    for(iter = 0; iter < rows; iter++) {
        for(inner_iter = 0; inner_iter < cols; inner_iter++) {
            //initialize the cost of every cell to infinity.. here we know cost can't exceed the no of cells hence cost = row*cols + 1
            cell_params_row.push({total_cost : rows*cols, actual_cost : rows*cols, heuristic : rows*cols, source : [rows,cols]});
        }
        cell_params.push(cell_params_row);
        cell_params_row = [];
    }
    cell_params[starting_cell[0]][starting_cell[1]].total_cost = calculate_heuristic(starting_cell[0],starting_cell[1],goal);
    cell_params[starting_cell[0]][starting_cell[1]].actual_cost = 0;

    for(let row_index = 0; row_index < rows; row_index++) {
        for(let col_index = 0; col_index < cols; col_index++) {
            grid[row_index][col_index].visited = false;
        }
    }
    let frontier_queue = [[starting_cell[0],starting_cell[1]]];
    
    if(await a_star(frontier_queue,cell_params,goal,grid) === true) {
        let row_index = goal[0];
        let col_index = goal[1];
        
        for(let row_index = 0; row_index < rows; row_index++) {
            for(let col_index = 0; col_index < cols; col_index++) {
                grid[row_index][col_index].visited = false;
            }
        }
        let temp_row_index;
        while(!(row_index === starting_cell[0] && col_index === starting_cell[1])) {
            grid[row_index][col_index].visited = true;
            temp_row_index = cell_params[row_index][col_index].source[0];
            col_index = cell_params[row_index][col_index].source[1];
            row_index = temp_row_index;
            draw_grid(grid,"rgba(21, 0, 159, 1)","rgb(36, 36, 36)");
            await wait(delay);
        }
        grid[row_index][col_index].visited = true;
        draw_grid(grid,"rgba(21, 0, 159, 1)","rgb(36, 36, 36)");
        await wait(delay);
    }
});

window.addEventListener("resize",() => {
    if(window.innerWidth > 502 + 20) {
        canvas.height = 502;
        canvas.width = 502;
        height = canvas.width - 2;
        width = canvas.width -2;
        cell_height = height/rows;
        cell_width = width/cols;
        draw_grid(grid,"green","rgb(36, 36, 36)");
    }
    else {
        canvas.height = window.innerWidth - 20;
        canvas.width = window.innerWidth -20;
        height = canvas.width - 2;
        width = canvas.width -2;
        cell_height = height/rows;
        cell_width = width/cols;
        draw_grid(grid,"green","rgb(36, 36, 36)");
    }
});