const socket = io();

socket.on("connect", () => {
    console.log(`Connected to server: ${socket.id}`);
});

socket.on("todo_update", (todo) => {
    console.log("New todo received: ", todo);

    const todoContainer = document.getElementById("todo_container");
    const todoHTML = `
        <div id="${todo.id}" class="todo_item" style="display: flex;">
          <form action="/todo/toggle_complete" method="post">
            <input type="hidden" name="todo_id" value="${todo.id}" />
            <input type="checkbox" name="completeness_marker" ${todo.completed ? 'checked' : ''} onchange="this.form.submit()" />
          </form>
          <span style="${todo.completed ? 'text-decoration: line-through; color: grey;' : ''}">
            ${todo.title}
          </span>
          <form action="/todo/${todo.id}/delete" method="post">
            <button type="submit">Delete</button>
          </form>
        </div>`;
    todoContainer.insertAdjacentHTML("beforeend", todoHTML);
});

socket.on("todo_delete", (todoId) => {
    document.getElementById(todoId)?.remove();
});