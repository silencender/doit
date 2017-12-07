import React from 'react';
import ReactDOM from 'react-dom';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class TodoStore {
    @observable todos = [];

    addTodo(todo) {
        todo.id != null && todo.content != "" && todo.expireDate != "" && todo.priority!="" && this.todos.push({
            id: todo.id,
            content: todo.content,
            finished: false,
            expireDate: todo.expireDate,
            priority: todo.priority
        });
    }

    setTodo(i,todo) {
        todo.id != null && todo.content != "" && todo.expireDate != "" && todo.priority != "" && todo.finished != null &&
        (this.todos[i] = todo);
    }

    delTodo(i) {
        this.todos.splice(i,1);
    }
}


const todoStore = new TodoStore();

@observer
class TodoList extends React.Component {
    @observable mode = ["list",0];
    constructor(props) {
        super(props);
        this.id = 0;
        this.defaultNewTodo = {
            id: 0,
            content: "",
            expireDate: "",
            priority: "3",
        };
        this.state = {
            newTodo: Object.assign({}, this.defaultNewTodo),
            editingTodo: null,
        };
    }
    render() {
        const store = this.props.store;
        return (
                <div>
                    <ul>
                        {store.todos.map(
                            (todo, idx) => 
                                    <div key={todo.id}>
                                {
                                    (this.mode[0] == "list" || this.mode[0] == "add" || (this.mode[0] == "edit" && this.mode[1] != idx)) &&
                                    < TodoView todo = {todo}
                                    onClick = {() => {
                                            this.mode = ["edit",idx];
                                            const newTodo = this.state.newTodo;
                                            this.setState({
                                                newTodo: newTodo,
                                                editingTodo: Object.assign({}, todo)});
                                        }
                                    }
                                    />
                                }
                                {                                                
                                    this.mode[0] == "edit" && this.mode[1] == idx &&
                                    <div>
                                        <EditTodoView todo={this.state.editingTodo} onChange={this.handleEditChange}/>
                                        <Button color="primary" onClick={this.onEditTodo(idx)}>Save</Button>
                                        <Button color="secondary" onClick={()=>this.mode[0]="list"}>Cancel</Button>
                                        <Button color="danger"onClick={this.onDelTodo(idx)}>Delete</Button>
                                    </div>
                                }
                                </div>
                        )}
                    </ul>
                    {
                        (this.mode[0] == "list" || this.mode[0] == "edit") && 
                        < div >
                            < Button color="primary" onClick = {() => this.mode[0] = "add"} > Add Todo </Button>
                        </div>
                    }
                    {
                        (this.mode[0] == "add") &&  
                        < div >
                            <EditTodoView todo={this.state.newTodo} onChange={this.handleAddChange}/>
                            <Button color="primary" onClick={this.onNewTodo}>Add Todo</Button>
                            <Button color="secondary" onClick={()=>this.mode[0]="list"}>Cancel</Button>
                        </div>
                    }
                </div>
        );
    }

    onNewTodo = () => {
        const store = this.props.store;
        store.addTodo(this.state.newTodo);
        this.id += 1;
        this.resetNewTodo();
    };

    onEditTodo = (i) => {
        return () => {
            const store = this.props.store;
            store.setTodo(i,this.state.editingTodo);
            this.mode[0] = "list";
        }
    };

    onDelTodo = (i) => {
        return () => {
            const store = this.props.store;
            store.delTodo(i);
            this.mode[0] = "list";
        }
    };

    handleAddChange = (e,info) => {
        const todo = Object.assign({}, this.state.newTodo);
        const editingTodo = this.state.editingTodo;
        todo[info] = e.target.value;
        this.setState({newTodo: todo,editingTodo: editingTodo});
    };

    handleEditChange = (e, info) => {
        const todo = Object.assign({}, this.state.editingTodo);
        const newTodo = this.state.newTodo;
        todo[info] = e.target.value;
        this.setState({
            newTodo: newTodo,
            editingTodo: todo
        });
    };

    resetNewTodo = () => {
        const newTodo= Object.assign({}, this.defaultNewTodo);
        newTodo.id = this.id;
        const editingTodo = this.state.editingTodo;
        this.setState({
            newTodo: newTodo,
            editingTodo: editingTodo
        });
    };
}

@observer
class TodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        return (
            <li>
                <input
                    type="checkbox"
                    checked={todo.completed}
                />
                <span onClick={this.props.onClick}>{todo.content}</span>
                {todo.expireDate}
                {todo.priority}
            </li>
        );
    }

    onToggleCompleted = () => {
        const todo = this.props.todo;
        todo.completed = !todo.completed;
    };
}

class EditTodoView extends React.Component {
    render() {
        const todo = this.props.todo;
        const onChange = this.props.onChange;
        return (
            <li>
                <input type="text" value={todo.content} onChange={(e) => onChange(e,"content")}/>
                <input type="text" value={todo.expireDate} onChange={(e) => onChange(e, "expireDate")}/>
                <input type="text" value={todo.priority} onChange={(e) => onChange(e, "priority")}/>
            </li>
        );
    }
}

ReactDOM.render(
    <TodoList store={todoStore} />,
    document.getElementById("root")
);
