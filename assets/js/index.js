import React from 'react';
import ReactDOM from 'react-dom';
import { observable, computed, autorun } from 'mobx';
import { observer } from 'mobx-react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

class TodoStore {
    @observable todos = [];

    addTodo(todo) {
        todo.content != "" && todo.expireDate != "" && todo.priority!="" && this.todos.push({
            content: todo.content,
            finished: false,
            expireDate: todo.expireDate,
            priority: todo.priority
        });
    }

    setTodo(i,todo) {
        todo.content != "" && todo.expireDate != "" && todo.priority != "" && todo.finished != null &&
        (this.todos[i] = todo);
    }
}


const todoStore = new TodoStore();

@observer
class TodoList extends React.Component {
    @observable mode = ["list",0];
    constructor(props) {
        super(props);
        this.defaultNewTodo = {
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
                            (todo, idx) => <div key={idx}>
                                            {
                                                (this.mode[0] == "list" || this.mode[0] == "add") &&
                                                < TodoView todo = {todo}
                                                onClick = {
                                                    () => {
                                                        this.mode[0] = "edit";
                                                        this.mode[1] = idx;
                                                        const newTodo = this.state.newTodo;
                                                        this.setState({
                                                            newTodo: newTodo,
                                                            editingTodo: Object.assign({}, todo)
                                                        });
                                                    }
                                                }
                                                />
                                            }
                                            {                                                
                                                this.mode[0] == "edit" && this.mode[1] == idx &&
                                                <span key={idx}>
                                                    <EditTodoView todo={this.state.editingTodo} onChange={this.handleEditChange}/>
                                                    <button onClick={this.onEditTodo(idx)}>Save</button>
                                                    <button onClick={()=>this.mode[0]="list"}>Cancel</button>
                                                </span>
                                            }
                                            </div>
                        )}
                    </ul>
                    {
                        (this.mode[0] == "list" || this.mode[0] == "edit") && < div >
                                    < button onClick = {
                                        () => this.mode[0] = "add"
                                    } > Add Todo </button>
                                </div>
                    }
                    {
                        (this.mode[0] == "add") &&  < div >
                                    <EditTodoView todo={this.state.newTodo} onChange={this.handleAddChange}/>
                                    <button onClick={this.onNewTodo}>Add Todo</button>
                                    <button onClick={()=>this.mode[0]="list"}>Cancel</button>
                                </div>
                    }
                </div>
        );
    }

    onNewTodo = () => {
        const store = this.props.store;
        store.addTodo(this.state.newTodo);
        this.resetNewTodo();
    }

    onEditTodo = (i) => {
        return () => {
            const store = this.props.store;
            store.setTodo(i,this.state.editingTodo);
            this.mode[0] = "list";
        }
    }

    handleAddChange = (e,info) => {
        const todo = Object.assign({}, this.state.newTodo);
        todo[info] = e.target.value;
        this.setState({newTodo: todo});
    }

    handleEditChange = (e, info) => {
        const todo = Object.assign({}, this.state.editingTodo);
        todo[info] = e.target.value;
        this.setState({
            editingTodo: todo
        });
    }

    resetNewTodo = () => {
        this.setState({
            newTodo: Object.assign({}, this.defaultNewTodo),
        });
    }
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
                    onChange={this.onToggleCompleted}
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
    }
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
